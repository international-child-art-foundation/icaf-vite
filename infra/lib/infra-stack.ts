import { Duration, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as logs from "aws-cdk-lib/aws-logs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as snsSubscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatchActions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";

// Spend threshold (USD) that triggers emergencyShutdown
const BILLING_ALARM_THRESHOLD_USD = 50;

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ─── 1. DynamoDB Table — Single Table Design ──────────────────────────────
    const icafTable = new dynamodb.Table(this, "IcafTable", {
      tableName: "icaf-main-table",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // ── Gallery GSIs (artworks) ──────────────────────────────────────────────
    icafTable.addGlobalSecondaryIndex({
      indexName: "GalleryGSI",
      partitionKey: { name: "GALL_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "ART_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    icafTable.addGlobalSecondaryIndex({
      indexName: "FamilyGalleryGSI",
      partitionKey: { name: "FAM_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "ART_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    icafTable.addGlobalSecondaryIndex({
      indexName: "InstanceGalleryGSI",
      partitionKey: { name: "INST_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "ART_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ── Groups GSIs ──────────────────────────────────────────────────────────
    icafTable.addGlobalSecondaryIndex({
      indexName: "GroupsGSI",
      partitionKey: { name: "GRP_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GRP_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    icafTable.addGlobalSecondaryIndex({
      indexName: "FamilyGroupsGSI",
      partitionKey: { name: "FGRP_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GRP_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    icafTable.addGlobalSecondaryIndex({
      indexName: "InstanceGroupsGSI",
      partitionKey: { name: "IGRP_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GRP_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ByOwner GSI — a user's artworks and groups
    icafTable.addGlobalSecondaryIndex({
      indexName: "ByOwnerGSI",
      partitionKey: { name: "OWN_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "OWN_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Email GSI — look up user account by email
    icafTable.addGlobalSecondaryIndex({
      indexName: "EmailGSI",
      partitionKey: { name: "EMAIL_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "EMAIL_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Review GSI — contributor review workflow
    icafTable.addGlobalSecondaryIndex({
      indexName: "ReviewGSI",
      partitionKey: { name: "REV_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "REV_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ─── 2. S3 Buckets ────────────────────────────────────────────────────────

    // Artwork bucket — private, CloudFront via existing setup
    const artworkBucket = new s3.Bucket(this, "IcafArtworkBucket", {
      bucketName: "icaf-artwork-bucket",
      removalPolicy: RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT],
          allowedOrigins: ["https://revise.icaf.org", "http://localhost:5173"],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });

    // Magazines bucket — private, served via CloudFront at magazines.icaf.org
    // Contains:
    //   staging/<slug>.zip  — temporary upload landing zone (deleted after processing)
    //   <slug>/             — extracted magazine HTML, assets, and thumbnail
    const magazinesBucket = new s3.Bucket(this, "IcafMagazinesBucket", {
      bucketName: "icaf-magazines-bucket",
      removalPolicy: RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          // Volunteers upload zips via presigned PUT URLs from the browser
          allowedMethods: [s3.HttpMethods.PUT],
          allowedOrigins: ["https://revise.icaf.org", "http://localhost:5173"],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });

    // ─── 3. CloudFront — Magazines (magazines.icaf.org) ───────────────────────
    //
    // Serves the extracted magazine HTML at https://magazines.icaf.org/<slug>/
    // A CloudFront Function rewrites bare directory paths to index.html so that
    // magazines.icaf.org/ArtAndHealth/ serves ArtAndHealth/index.html.
    //
    // TODO: To enable the magazines.icaf.org custom domain:
    //   1. Create an ACM certificate in us-east-1 for magazines.icaf.org
    //   2. Uncomment the `certificate` and `domainNames` lines below
    //   3. Add a CNAME record in DNS pointing magazines.icaf.org to the
    //      distribution domain name output by this stack

    const indexRewriteFn = new cloudfront.Function(this, "MagazineIndexRewriteFn", {
      functionName: "icaf-magazine-index-rewrite",
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var uri = event.request.uri;
          if (uri.endsWith('/')) {
            event.request.uri += 'index.html';
          } else if (!uri.includes('.')) {
            event.request.uri += '/index.html';
          }
          return event.request;
        }
      `),
    });

    const magazinesOac = new cloudfront.S3OriginAccessControl(this, "MagazinesOAC", {
      description: "OAC for ICAF Magazines bucket",
    });

    const magazinesDistribution = new cloudfront.Distribution(this, "MagazinesDistribution", {
      comment: "ICAF Magazines — magazines.icaf.org",
      defaultBehavior: {
        origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(
          magazinesBucket,
          { originAccessControl: magazinesOac },
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [
          {
            function: indexRewriteFn,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      // TODO: uncomment once ACM certificate is provisioned in us-east-1
      // certificate: acm.Certificate.fromCertificateArn(this, 'MagazinesCert', 'arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT_ID'),
      // domainNames: ['magazines.icaf.org'],
    });

    // ─── 4. Cognito User Pool ─────────────────────────────────────────────────
    const userPool = new cognito.UserPool(this, "IcafUserPool", {
      userPoolName: "icaf-user-pool",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: true, mutable: true },
        familyName: { required: true, mutable: true },
        birthdate: { required: true, mutable: true },
      },
      customAttributes: {
        role: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const userPoolClient = new cognito.UserPoolClient(this, "IcafUserPoolClient", {
      userPool,
      userPoolClientName: "icaf-web-client",
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
    });

    // ─── 5. SQS — Background Queues ──────────────────────────────────────────

    const cleanupDLQ = new sqs.Queue(this, "IcafCleanupDLQ", {
      queueName: "icaf-cleanup-dlq",
      retentionPeriod: Duration.days(14),
    });

    const cleanupQueue = new sqs.Queue(this, "IcafCleanupQueue", {
      queueName: "icaf-cleanup-queue",
      visibilityTimeout: Duration.seconds(300),
      retentionPeriod: Duration.days(14),
      deadLetterQueue: { queue: cleanupDLQ, maxReceiveCount: 3 },
    });

    // processImage queue — fed by S3 ObjectCreated on artwork uploads
    const processImageDLQ = new sqs.Queue(this, "IcafProcessImageDLQ", {
      queueName: "icaf-process-image-dlq",
      retentionPeriod: Duration.days(14),
    });

    const processImageQueue = new sqs.Queue(this, "IcafProcessImageQueue", {
      queueName: "icaf-process-image-queue",
      // Must be ≥ 6× Lambda timeout (AWS recommendation). Lambda timeout is 120s, so 720s.
      visibilityTimeout: Duration.seconds(720),
      retentionPeriod: Duration.days(7),
      deadLetterQueue: { queue: processImageDLQ, maxReceiveCount: 3 },
    });

    processImageQueue.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("s3.amazonaws.com")],
        actions: ["sqs:SendMessage"],
        resources: [processImageQueue.queueArn],
        conditions: {
          ArnLike: { "aws:SourceArn": artworkBucket.bucketArn },
        },
      }),
    );

    // processZip queue — fed by S3 ObjectCreated on staging/<slug>.zip uploads
    const processZipDLQ = new sqs.Queue(this, "IcafProcessZipDLQ", {
      queueName: "icaf-process-zip-dlq",
      retentionPeriod: Duration.days(14),
    });

    const processZipQueue = new sqs.Queue(this, "IcafProcessZipQueue", {
      queueName: "icaf-process-zip-queue",
      // Must be ≥ Lambda timeout — large zips may take a while to unpack + re-upload
      visibilityTimeout: Duration.seconds(600),
      retentionPeriod: Duration.days(7),
      deadLetterQueue: { queue: processZipDLQ, maxReceiveCount: 3 },
    });

    processZipQueue.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("s3.amazonaws.com")],
        actions: ["sqs:SendMessage"],
        resources: [processZipQueue.queueArn],
        conditions: {
          ArnLike: { "aws:SourceArn": magazinesBucket.bucketArn },
        },
      }),
    );

    // ─── 6. Sharp Lambda Layer ────────────────────────────────────────────────
    // TODO: build sharp layer before each deploy in CI.
    const sharpLayer = new lambda.LayerVersion(this, "SharpLayer", {
      code: lambda.Code.fromAsset("layers/sharp"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      compatibleArchitectures: [lambda.Architecture.X86_64],
      description: "Sharp image processing with AVIF/heif support (Linux x86_64)",
    });

    // ─── 7. Lambda Functions ──────────────────────────────────────────────────
    // TODO: Update APP_URL, SES_FROM_EMAIL, and MAGAZINES_CLOUDFRONT_DOMAIN before deployment
    const commonEnv = {
      TABLE_NAME: icafTable.tableName,
      USER_POOL_ID: userPool.userPoolId,
      USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      S3_BUCKET_NAME: artworkBucket.bucketName,
      MAGAZINES_BUCKET_NAME: magazinesBucket.bucketName,
      CLEANUP_QUEUE_URL: cleanupQueue.queueUrl,
      APP_URL: "https://revise.icaf.org",
      SES_FROM_EMAIL: "",             // TODO: set to verified SES sender address before email features go live
      MAGAZINES_CLOUDFRONT_DOMAIN: "", // TODO: set after first deploy (CloudFront domain not known until then)
    };

    // Default log retention for all NodejsFunctions in this stack.
    const defaultLogRetention = logs.RetentionDays.ONE_MONTH;

    const fn = (id: string, entry: string, heavy = false): NodejsFunction =>
      new NodejsFunction(this, id, {
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(heavy ? 60 : 15),
        memorySize: heavy ? 512 : 256,
        environment: commonEnv,
        entry,
        logRetention: defaultLogRetention,
      });

    const src = (p: string) => `../backend/src/functions/${p}`;

    // ── Public — no auth ─────────────────────────────────────────────────────
    const getArtworkFn              = fn("GetArtworkFn",              src("anyone/getArtwork.ts"));
    const getGroupFn                = fn("GetGroupFn",                src("anyone/getGroup.ts"));
    const galleryArtworksFn         = fn("GalleryArtworksFn",         src("anyone/gallery/galleryArtworks.ts"));
    const galleryGroupsFn           = fn("GalleryGroupsFn",           src("anyone/gallery/galleryGroups.ts"));
    const initiateTakedownFn        = fn("InitiateTakedownFn",        src("anyone/initiateTakedown.ts"));
    const guestSubmitArtworkFn      = fn("GuestSubmitArtworkFn",      src("anyone/submitArtwork.ts"), true);
    const verifyAccountFn           = fn("VerifyAccountFn",           src("anyone/verifyAccount.ts"));
    const registerFn                = fn("RegisterFn",                src("anyone/register.ts"));
    const loginFn                   = fn("LoginFn",                   src("anyone/login.ts"));
    const logoutFn                  = fn("LogoutFn",                  src("anyone/logout.ts"));
    const forgotPasswordFn          = fn("ForgotPasswordFn",          src("anyone/forgotPassword.ts"));
    const confirmForgotPasswordFn   = fn("ConfirmForgotPasswordFn",   src("anyone/confirmForgotPassword.ts"));
    const resendVerificationFn      = fn("ResendVerificationFn",      src("anyone/resendVerificationEmail.ts"));
    const getAuthStatusFn           = fn("GetAuthStatusFn",           src("anyone/getAuthStatus.ts"));
    const requestCreateAndVerifyFn  = fn("RequestCreateAndVerifyFn",  src("anyone/requestCreateAndVerify.ts"));
    const getMagazinesFn            = fn("GetMagazinesFn",            src("anyone/getMagazines.ts"));
    const getNewsFn                 = fn("GetNewsFn",                 src("anyone/getNews.ts"));

    // ── User — authenticated ──────────────────────────────────────────────────
    const getUserFn                 = fn("GetUserFn",                 src("user/user.ts"));
    const submitArtworkFn           = fn("SubmitArtworkFn",           src("user/submitArtwork.ts"), true);
    const updateArtworkFn           = fn("UpdateArtworkFn",           src("user/updateArtwork.ts"));
    const deleteArtworkFn           = fn("DeleteArtworkFn",           src("user/deleteArtwork.ts"));
    const deleteAllArtworksFn       = fn("DeleteAllArtworksFn",       src("user/deleteAllArtworks.ts"), true);
    const listArtworkSubmissionsFn  = fn("ListArtworkSubmissionsFn",  src("user/listArtworkSubmissions.ts"));
    const voteArtworkFn             = fn("VoteArtworkFn",             src("user/voteArtwork.ts"));
    const listDonationsFn           = fn("ListDonationsFn",           src("user/listDonations.ts"));
    const changePasswordFn          = fn("ChangePasswordFn",          src("user/changePassword.ts"));
    const deleteAccountFn           = fn("DeleteAccountFn",           src("user/deleteAccount.ts"), true);

    // ── Guardian — authenticated, guardian+ role ──────────────────────────────
    const createGroupFn             = fn("CreateGroupFn",             src("guardian/createGroup.ts"));
    const listGroupSubmissionsFn    = fn("ListGroupSubmissionsFn",    src("guardian/listGroupSubmissions.ts"));
    const updateGroupFn             = fn("UpdateGroupFn",             src("guardian/updateGroup.ts"));
    const deleteGroupFn             = fn("DeleteGroupFn",             src("guardian/deleteGroup.ts"), true);
    const submitArtworkToGroupFn    = fn("SubmitArtworkToGroupFn",    src("guardian/submitArtworkToGroup.ts"), true);
    const deleteArtworkFromGroupFn  = fn("DeleteArtworkFromGroupFn",  src("guardian/deleteArtworkFromGroup.ts"));
    const updateConstituentArtworkFn = fn("UpdateConstituentArtworkFn", src("guardian/updateConstituentArtwork.ts"));

    // ── Contributor — authenticated, contributor+ role ────────────────────────
    const fetchUnapprovedArtworksFn = fn("FetchUnapprovedArtworksFn", src("contributor/fetchUnapprovedArtworks.ts"));
    const fetchHiddenArtworksFn     = fn("FetchHiddenArtworksFn",     src("contributor/fetchHiddenArtworks.ts"));
    const fetchUnapprovedGroupsFn   = fn("FetchUnapprovedGroupsFn",   src("contributor/fetchUnapprovedGroups.ts"));
    const fetchHiddenGroupsFn       = fn("FetchHiddenGroupsFn",       src("contributor/fetchHiddenGroups.ts"));
    const changeArtworkStatusFn     = fn("ChangeArtworkStatusFn",     src("contributor/changeArtworkStatus.ts"));
    const changeGroupStatusFn       = fn("ChangeGroupStatusFn",       src("contributor/changeGroupStatus.ts"));
    const updateUserRoleFn          = fn("UpdateUserRoleFn",          src("contributor/updateUserRole.ts"));

    // ── Admin — authenticated, admin role ─────────────────────────────────────
    const banUserFn                 = fn("BanUserFn",                 src("admin/banUser.ts"));
    const unbanUserFn               = fn("UnbanUserFn",               src("admin/unbanUser.ts"));
    const alterUserRoleFn           = fn("AlterUserRoleFn",           src("admin/alterUserRole.ts"));
    const getUserCognitoInfoFn      = fn("GetUserCognitoInfoFn",      src("admin/getUserCognitoInfo.ts"));
    const getEmailByUserIdFn        = fn("GetEmailByUserIdFn",        src("admin/getEmailByUserId.ts"));
    const deleteUserAccountFn       = fn("DeleteUserAccountFn",       src("admin/deleteUserAccount.ts"), true);
    const removeAllUserArtworkFn    = fn("RemoveAllUserArtworkFn",    src("admin/removeAllUserArtwork.ts"), true);
    const hideAllUserArtworkFn      = fn("HideAllUserArtworkFn",      src("admin/hideAllUserArtwork.ts"), true);
    const unhideAllUserArtworkFn    = fn("UnhideAllUserArtworkFn",    src("admin/unhideAllUserArtwork.ts"), true);
    const getArtworkSubmitterEmailFn = fn("GetArtworkSubmitterEmailFn", src("admin/getArtworkSubmitterEmail.ts"));
    const getTakedownRequestsFn     = fn("GetTakedownRequestsFn",     src("admin/getTakedownRequests.ts"));
    const cancelTakedownRequestFn   = fn("CancelTakedownRequestFn",   src("admin/cancelTakedownRequest.ts"));
    const publishMagazineFn         = fn("PublishMagazineFn",         src("admin/publishMagazine.ts"), true);
    const updateMagazineStatusFn    = fn("UpdateMagazineStatusFn",    src("admin/updateMagazineStatus.ts"));
    const deleteMagazineFn          = fn("DeleteMagazineFn",          src("admin/deleteMagazine.ts"), true);
    const createNewsFn              = fn("CreateNewsFn",              src("admin/createNews.ts"));
    const updateNewsFn              = fn("UpdateNewsFn",              src("admin/updateNews.ts"));
    const deleteNewsFn              = fn("DeleteNewsFn",              src("admin/deleteNews.ts"));

    // ── Internal — not HTTP-accessible ───────────────────────────────────────

    // ProcessImage: artwork image → AVIF variants
    // Triggered via SQS ← S3 ObjectCreated on {art_id}/initial
    // Uses the pre-built sharpLayer (no inline npm install).
    const processImageFn = new NodejsFunction(this, "ProcessImage", {
      runtime: Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.X86_64,
      timeout: Duration.seconds(120),
      memorySize: 2048,            // ~1 vCPU; AVIF encoding is CPU-bound
      layers: [sharpLayer],
      environment: {
        TABLE_NAME: icafTable.tableName,
        S3_BUCKET_NAME: artworkBucket.bucketName,
      },
      entry: src("processImage.ts"),
      logRetention: defaultLogRetention,
      bundling: {
        // Sharp is provided by the layer — don't bundle it into the function.
        externalModules: ["sharp", "@aws-sdk/*"],
      },
    });

    processImageFn.addEventSource(
      new SqsEventSource(processImageQueue, {
        batchSize: 1,
      }),
    );

    // ProcessZip: magazine zip → extracted files in magazines bucket
    // Triggered via SQS ← S3 ObjectCreated on staging/<slug>.zip
    const processZipFn = new NodejsFunction(this, "ProcessZipFn", {
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(600),
      memorySize: 1024,           // Holds the full zip + extracted contents in memory
      environment: {
        TABLE_NAME: icafTable.tableName,
        MAGAZINES_BUCKET_NAME: magazinesBucket.bucketName,
      },
      entry: src("processZip.ts"),
      logRetention: defaultLogRetention,
    });

    processZipFn.addEventSource(
      new SqsEventSource(processZipQueue, {
        batchSize: 1,
      }),
    );

    // EmergencyShutdown: throttles API Gateway to 0 req/s
    const emergencyShutdownFn = new NodejsFunction(this, "EmergencyShutdownFn", {
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 128,
      entry: src("emergencyShutdown.ts"),
      environment: { API_STAGE: "v1" },
      logRetention: defaultLogRetention,
    });

    // ─── 8. IAM Permissions ───────────────────────────────────────────────────

    // DynamoDB — all HTTP-facing functions need read/write access
    const allFunctions = [
      getArtworkFn, getGroupFn, galleryArtworksFn, galleryGroupsFn,
      initiateTakedownFn, guestSubmitArtworkFn, verifyAccountFn,
      registerFn, loginFn, logoutFn, forgotPasswordFn, confirmForgotPasswordFn,
      resendVerificationFn, getAuthStatusFn, requestCreateAndVerifyFn,
      getMagazinesFn, getNewsFn,
      getUserFn, submitArtworkFn, updateArtworkFn, deleteArtworkFn,
      deleteAllArtworksFn, listArtworkSubmissionsFn, voteArtworkFn,
      listDonationsFn, changePasswordFn, deleteAccountFn,
      createGroupFn, listGroupSubmissionsFn, updateGroupFn, deleteGroupFn,
      submitArtworkToGroupFn, deleteArtworkFromGroupFn, updateConstituentArtworkFn,
      fetchUnapprovedArtworksFn, fetchHiddenArtworksFn,
      fetchUnapprovedGroupsFn, fetchHiddenGroupsFn,
      changeArtworkStatusFn, changeGroupStatusFn, updateUserRoleFn,
      banUserFn, unbanUserFn, alterUserRoleFn, getUserCognitoInfoFn,
      getEmailByUserIdFn, deleteUserAccountFn, removeAllUserArtworkFn,
      hideAllUserArtworkFn, unhideAllUserArtworkFn,
      getArtworkSubmitterEmailFn, getTakedownRequestsFn, cancelTakedownRequestFn,
      publishMagazineFn, updateMagazineStatusFn, deleteMagazineFn,
      createNewsFn, updateNewsFn, deleteNewsFn,
    ];

    for (const f of allFunctions) {
      icafTable.grantReadWriteData(f);
    }

    // processImage and processZip also need DDB access
    icafTable.grantReadWriteData(processImageFn);
    icafTable.grantReadWriteData(processZipFn);

    // S3 artwork bucket — presigned PUT or delete
    const s3ArtworkFunctions = [
      guestSubmitArtworkFn,
      submitArtworkFn,
      submitArtworkToGroupFn,
      deleteArtworkFn,
      deleteAllArtworksFn,
      deleteAccountFn,
      deleteUserAccountFn,
    ];

    for (const f of s3ArtworkFunctions) {
      artworkBucket.grantReadWrite(f);
    }

    // processImageFn reads {art_id}/initial, writes the three AVIF variants,
    // and deletes the initial. grantReadWrite already includes delete.
    artworkBucket.grantReadWrite(processImageFn);

    // S3 magazines bucket
    // publishMagazineFn generates presigned PUT URLs for staging/<slug>.zip
    magazinesBucket.grantReadWrite(publishMagazineFn);
    // deleteMagazineFn removes all objects under <slug>/
    magazinesBucket.grantReadWrite(deleteMagazineFn);
    // processZipFn downloads from staging/, uploads to <slug>/, deletes the zip
    magazinesBucket.grantReadWrite(processZipFn);

    // SES — functions that send email via SES
    const sesFunctions = [
      guestSubmitArtworkFn,
      requestCreateAndVerifyFn,
      changeArtworkStatusFn,
      changeGroupStatusFn,
    ];

    for (const f of sesFunctions) {
      f.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: ["*"],
      }));
    }

    // Cognito admin operations
    const cognitoAdminActions = [
      "cognito-idp:AdminInitiateAuth",
      "cognito-idp:AdminGetUser",
      "cognito-idp:AdminUpdateUserAttributes",
      "cognito-idp:AdminDeleteUser",
      "cognito-idp:AdminCreateUser",
      "cognito-idp:AdminSetUserPassword",
      "cognito-idp:AdminDisableUser",
      "cognito-idp:AdminEnableUser",
      "cognito-idp:AdminUserGlobalSignOut",
    ];

    const cognitoClientActions = [
      "cognito-idp:InitiateAuth",
      "cognito-idp:ForgotPassword",
      "cognito-idp:ConfirmForgotPassword",
      "cognito-idp:ChangePassword",
      "cognito-idp:ResendConfirmationCode",
      "cognito-idp:GetUser",
      "cognito-idp:SignUp",
      "cognito-idp:ConfirmSignUp",
    ];

    const cognitoAdminFunctions = [
      loginFn, logoutFn, verifyAccountFn, deleteAccountFn,
      deleteUserAccountFn, getUserCognitoInfoFn,
    ];

    for (const f of cognitoAdminFunctions) {
      f.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [...cognitoAdminActions, ...cognitoClientActions],
        resources: [userPool.userPoolArn],
      }));
    }

    const cognitoClientFunctions = [
      registerFn, forgotPasswordFn, confirmForgotPasswordFn,
      resendVerificationFn, getAuthStatusFn, changePasswordFn,
    ];

    for (const f of cognitoClientFunctions) {
      f.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: cognitoClientActions,
        resources: [userPool.userPoolArn],
      }));
    }

    // ─── 9. S3 Event Notifications ────────────────────────────────────────────

    // Artwork upload → processImage
    artworkBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(processImageQueue),
      { suffix: "/initial" },
    );

    // Magazine zip upload → processZip
    // Only the staging/ prefix triggers — extracted files under <slug>/ never match
    magazinesBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(processZipQueue),
      { prefix: "staging/", suffix: ".zip" },
    );

    // ─── 10. API Gateway ───────────────────────────────────────────────────────
    const api = new apigw.RestApi(this, "IcafApi", {
      restApiName: "icaf-api",
      endpointConfiguration: { types: [apigw.EndpointType.REGIONAL] },
      deployOptions: { stageName: "v1" },
      defaultCorsPreflightOptions: {
        allowOrigins: ["https://revise.icaf.org", "http://localhost:5173"],
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true,
      },
    });

    emergencyShutdownFn.addEnvironment("API_ID", api.restApiId);
    emergencyShutdownFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["apigateway:PATCH"],
      resources: [
        `arn:aws:apigateway:${this.region}::/restapis/${api.restApiId}/stages/v1`,
      ],
    }));

    const cognitoAuthorizer = new apigw.CognitoUserPoolsAuthorizer(this, "IcafAuthorizer", {
      cognitoUserPools: [userPool],
    });

    const authOpts = {
      authorizer: cognitoAuthorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    };

    const li = (f: NodejsFunction) => new apigw.LambdaIntegration(f);

    // ── Public — artworks + groups ────────────────────────────────────────────
    const artworksRes = api.root.addResource("artworks");
    artworksRes.addMethod("POST", li(guestSubmitArtworkFn));
    artworksRes.addResource("{art_id}").addMethod("GET", li(getArtworkFn));

    const groupsRes = api.root.addResource("groups");
    groupsRes.addResource("{group_id}").addMethod("GET", li(getGroupFn));

    api.root.addResource("takedown").addMethod("POST", li(initiateTakedownFn));

    // ── Magazines (public read) ───────────────────────────────────────────────
    const magazinesRes = api.root.addResource("magazines");
    magazinesRes.addMethod("GET", li(getMagazinesFn));

    // ── News (public read) ────────────────────────────────────────────────────
    const newsRes = api.root.addResource("news");
    newsRes.addMethod("GET", li(getNewsFn));

    // ── Gallery (public) ──────────────────────────────────────────────────────
    const gallery = api.root.addResource("gallery");

    const galleryArtworksRes = gallery.addResource("artworks");
    galleryArtworksRes.addMethod("GET", li(galleryArtworksFn));
    const galleryArtByFamily = galleryArtworksRes
      .addResource("family").addResource("{family}");
    galleryArtByFamily.addMethod("GET", li(galleryArtworksFn));
    galleryArtByFamily
      .addResource("instance").addResource("{instance}")
      .addMethod("GET", li(galleryArtworksFn));

    const galleryGroupsRes = gallery.addResource("groups");
    galleryGroupsRes.addMethod("GET", li(galleryGroupsFn));
    const galleryGrpByFamily = galleryGroupsRes
      .addResource("family").addResource("{family}");
    galleryGrpByFamily.addMethod("GET", li(galleryGroupsFn));
    galleryGrpByFamily
      .addResource("instance").addResource("{instance}")
      .addMethod("GET", li(galleryGroupsFn));

    // ── Auth (public, except change-password) ─────────────────────────────────
    const authRes = api.root.addResource("auth");
    authRes.addResource("register").addMethod("POST", li(registerFn));
    authRes.addResource("login").addMethod("POST", li(loginFn));
    authRes.addResource("logout").addMethod("POST", li(logoutFn));
    authRes.addResource("verify").addMethod("POST", li(verifyAccountFn));
    authRes.addResource("forgot-password").addMethod("POST", li(forgotPasswordFn));
    authRes.addResource("confirm-forgot-password").addMethod("POST", li(confirmForgotPasswordFn));
    authRes.addResource("resend-verification").addMethod("POST", li(resendVerificationFn));
    authRes.addResource("status").addMethod("GET", li(getAuthStatusFn));
    authRes.addResource("create-and-verify").addMethod("POST", li(requestCreateAndVerifyFn));
    authRes.addResource("change-password").addMethod("POST", li(changePasswordFn), authOpts);

    // ── User — authenticated ──────────────────────────────────────────────────
    const userRes = api.root.addResource("user");
    userRes.addResource("profile").addMethod("GET", li(getUserFn), authOpts);
    userRes.addResource("account").addMethod("DELETE", li(deleteAccountFn), authOpts);
    userRes.addResource("payments").addMethod("GET", li(listDonationsFn), authOpts);

    const userArtworksRes = userRes.addResource("artworks");
    userArtworksRes.addMethod("GET", li(listArtworkSubmissionsFn), authOpts);
    userArtworksRes.addMethod("POST", li(submitArtworkFn), authOpts);
    userArtworksRes.addMethod("DELETE", li(deleteAllArtworksFn), authOpts);

    const userArtworkRes = userArtworksRes.addResource("{art_id}");
    userArtworkRes.addMethod("PATCH", li(updateArtworkFn), authOpts);
    userArtworkRes.addMethod("DELETE", li(deleteArtworkFn), authOpts);
    userArtworkRes.addResource("kudos").addMethod("POST", li(voteArtworkFn), authOpts);

    // ── Guardian — authenticated, role enforced in handler ────────────────────
    const guardianRes = api.root.addResource("guardian");

    const guardianGroupsRes = guardianRes.addResource("groups");
    guardianGroupsRes.addMethod("GET", li(listGroupSubmissionsFn), authOpts);
    guardianGroupsRes.addMethod("POST", li(createGroupFn), authOpts);

    const guardianGroupRes = guardianGroupsRes.addResource("{group_id}");
    guardianGroupRes.addMethod("PATCH", li(updateGroupFn), authOpts);
    guardianGroupRes.addMethod("DELETE", li(deleteGroupFn), authOpts);

    const guardianGroupArtworksRes = guardianGroupRes.addResource("artworks");
    guardianGroupArtworksRes.addMethod("POST", li(submitArtworkToGroupFn), authOpts);
    guardianGroupArtworksRes
      .addResource("{art_id}")
      .addMethod("DELETE", li(deleteArtworkFromGroupFn), authOpts);

    guardianRes
      .addResource("artworks").addResource("{art_id}")
      .addMethod("PATCH", li(updateConstituentArtworkFn), authOpts);

    // ── Contributor — authenticated, role enforced in handler ─────────────────
    const contribRes = api.root.addResource("contributor");

    const contribArtworksRes = contribRes.addResource("artworks");
    contribArtworksRes.addResource("pending").addMethod("GET", li(fetchUnapprovedArtworksFn), authOpts);
    contribArtworksRes.addResource("hidden").addMethod("GET", li(fetchHiddenArtworksFn), authOpts);
    contribArtworksRes
      .addResource("{art_id}").addResource("status")
      .addMethod("PATCH", li(changeArtworkStatusFn), authOpts);

    const contribGroupsRes = contribRes.addResource("groups");
    contribGroupsRes.addResource("pending").addMethod("GET", li(fetchUnapprovedGroupsFn), authOpts);
    contribGroupsRes.addResource("hidden").addMethod("GET", li(fetchHiddenGroupsFn), authOpts);
    contribGroupsRes
      .addResource("{group_id}").addResource("status")
      .addMethod("PATCH", li(changeGroupStatusFn), authOpts);

    contribRes
      .addResource("users").addResource("{user_id}").addResource("role")
      .addMethod("PATCH", li(updateUserRoleFn), authOpts);

    // ── Admin — authenticated, role enforced in handler ───────────────────────
    const adminRes = api.root.addResource("admin");

    const adminUserRes = adminRes
      .addResource("users").addResource("{user_id}");
    adminUserRes.addResource("ban").addMethod("POST", li(banUserFn), authOpts);
    adminUserRes.addResource("unban").addMethod("POST", li(unbanUserFn), authOpts);
    adminUserRes.addResource("role").addMethod("PATCH", li(alterUserRoleFn), authOpts);
    adminUserRes.addResource("cognito-info").addMethod("GET", li(getUserCognitoInfoFn), authOpts);
    adminUserRes.addResource("email").addMethod("GET", li(getEmailByUserIdFn), authOpts);
    adminUserRes.addResource("account").addMethod("DELETE", li(deleteUserAccountFn), authOpts);
    adminUserRes.addResource("artworks").addMethod("DELETE", li(removeAllUserArtworkFn), authOpts);
    adminUserRes.addResource("hide-all").addMethod("POST", li(hideAllUserArtworkFn), authOpts);
    adminUserRes.addResource("unhide-all").addMethod("POST", li(unhideAllUserArtworkFn), authOpts);

    adminRes
      .addResource("artworks").addResource("{art_id}").addResource("submitter-email")
      .addMethod("GET", li(getArtworkSubmitterEmailFn), authOpts);

    const adminTakedownsRes = adminRes.addResource("takedowns");
    adminTakedownsRes.addMethod("GET", li(getTakedownRequestsFn), authOpts);
    adminTakedownsRes
      .addResource("{tdr_sk}")
      .addMethod("PATCH", li(cancelTakedownRequestFn), authOpts);

    // Admin — magazines
    const adminMagazinesRes = adminRes.addResource("magazines");
    adminMagazinesRes.addMethod("POST", li(publishMagazineFn), authOpts);
    const adminMagazineRes = adminMagazinesRes.addResource("{slug}");
    adminMagazineRes.addResource("status").addMethod("PATCH", li(updateMagazineStatusFn), authOpts);
    adminMagazineRes.addMethod("DELETE", li(deleteMagazineFn), authOpts);

    // Admin — news
    const adminNewsRes = adminRes.addResource("news");
    adminNewsRes.addMethod("POST", li(createNewsFn), authOpts);
    const adminNewsItemRes = adminNewsRes.addResource("{news_id}");
    adminNewsItemRes.addMethod("PATCH", li(updateNewsFn), authOpts);
    adminNewsItemRes.addMethod("DELETE", li(deleteNewsFn), authOpts);

    // ─── 11. Emergency Shutdown — Billing Alarm ───────────────────────────────
    // NOTE: AWS billing metrics are only published to us-east-1.
    // If this stack is deployed to a different region, create the alarm
    // in a separate us-east-1 stack and point it at a cross-region SNS topic.
    const shutdownTopic = new sns.Topic(this, "EmergencyShutdownTopic", {
      topicName: "icaf-emergency-shutdown",
      displayName: "ICAF Emergency Shutdown",
    });

    shutdownTopic.addSubscription(
      new snsSubscriptions.LambdaSubscription(emergencyShutdownFn),
    );

    const billingAlarm = new cloudwatch.Alarm(this, "BillingAlarm", {
      alarmName: "icaf-billing-alarm",
      alarmDescription: `Triggers emergency API shutdown when estimated charges exceed $${BILLING_ALARM_THRESHOLD_USD}`,
      metric: new cloudwatch.Metric({
        namespace: "AWS/Billing",
        metricName: "EstimatedCharges",
        dimensionsMap: { Currency: "USD" },
        statistic: "Maximum",
        period: Duration.hours(6),
      }),
      threshold: BILLING_ALARM_THRESHOLD_USD,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    billingAlarm.addAlarmAction(new cloudwatchActions.SnsAction(shutdownTopic));
  }
}
