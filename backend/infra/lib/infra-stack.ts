import { Duration, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ─── 1. DynamoDB Table — Single Table Design ──────────────────────────────
    const icafTable = new dynamodb.Table(this, "IcafTable", {
      tableName: "icaf-main-table",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN, // Never auto-delete production data
    });

    // ── Gallery GSIs (artworks) ──────────────────────────────────────────────
    //
    // All three gallery GSIs share the same SK attribute (ART_GSI_SK) since the
    // SK format is identical: 'TS#<unix_ts>#ART#<art_id>'
    // The PK attribute differs per GSI, allowing one ART entity to appear in all three.
    // Sparse: these PK attributes are only written when status='approved'.
    // On approval:   set GALL_PK, FAM_PK (if themed), INST_PK (if has instance), ART_GSI_SK
    // On hide/reject: remove those PK attributes (DynamoDB sparse GSI auto-removes the item)

    // All artworks (time-sorted). ART entity: GALL_PK='GALLERY'
    icafTable.addGlobalSecondaryIndex({
      indexName: "GalleryGSI",
      partitionKey: { name: "GALL_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "ART_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Artworks filtered by theme family. ART entity: FAM_PK='FAMILY#<theme_family>'
    icafTable.addGlobalSecondaryIndex({
      indexName: "FamilyGalleryGSI",
      partitionKey: { name: "FAM_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "ART_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Artworks filtered by theme family+instance. ART entity: INST_PK='FAMILY#<family>#INSTANCE#<instance>'
    icafTable.addGlobalSecondaryIndex({
      indexName: "InstanceGalleryGSI",
      partitionKey: { name: "INST_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "ART_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ── Groups GSIs ──────────────────────────────────────────────────────────
    //
    // Same pattern as gallery GSIs. All three share GRP_GSI_SK = 'TS#<unix_ts>#ID#<group_id>'
    // Sparse on status='approved'.

    // All groups. GROUP entity: GRP_PK='GROUPS'
    icafTable.addGlobalSecondaryIndex({
      indexName: "GroupsGSI",
      partitionKey: { name: "GRP_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GRP_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Groups by theme family. GROUP entity: FGRP_PK='GROUPS#FAMILY#<family>'
    icafTable.addGlobalSecondaryIndex({
      indexName: "FamilyGroupsGSI",
      partitionKey: { name: "FGRP_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GRP_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Groups by theme family+instance. GROUP entity: IGRP_PK='GROUPS#FAMILY#<family>#INSTANCE#<instance>'
    icafTable.addGlobalSecondaryIndex({
      indexName: "InstanceGroupsGSI",
      partitionKey: { name: "IGRP_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GRP_GSI_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Owner GSI — a user's artworks and groups
    // ART:   OWN_PK='OWNER#<user_id>',  OWN_SK='TYPE#ART#TS#<unix_ts>#ID#<art_id>'
    // GROUP: OWN_PK='OWNER#<user_id>',  OWN_SK='TYPE#GROUP#TS#<unix_ts>#ID#<group_id>'
    // Sparse: only ART and GROUP entities (not USER, PAYMENT, etc.)
    icafTable.addGlobalSecondaryIndex({
      indexName: "OwnerGSI",
      partitionKey: { name: "OWN_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "OWN_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Email GSI — look up user account by email
    // USER: EMAIL_PK='EMAIL#<email>', EMAIL_SK='TYPE#USER'
    // Can extend to other entity types in future (TYPE#GUARDIAN, etc.)
    icafTable.addGlobalSecondaryIndex({
      indexName: "EmailGSI",
      partitionKey: { name: "EMAIL_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "EMAIL_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Review GSI — contributor review workflow
    // ART:   REV_PK='REVIEW', REV_SK='STATUS#<status>#TYPE#ART#TS#<ts>#ID#<art_id>'
    // GROUP: REV_PK='REVIEW', REV_SK='STATUS#<status>#TYPE#GROUP#TS#<ts>#ID#<group_id>'
    // Sparse: only items with status != 'approved' (pending_review, rejected, hidden)
    // Query pattern: begins_with(SK, 'STATUS#pending_review#TYPE#ART')
    icafTable.addGlobalSecondaryIndex({
      indexName: "ReviewGSI",
      partitionKey: { name: "REV_PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "REV_SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ─── 2. S3 Bucket — Artwork Storage ──────────────────────────────────────
    const artworkBucket = new s3.Bucket(this, "IcafArtworkBucket", {
      bucketName: "icaf-artwork-bucket",
      removalPolicy: RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
          allowedOrigins: ["https://icaf.org", "http://localhost:5173"],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });

    // ─── 3. Cognito User Pool ─────────────────────────────────────────────────
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
        // Role stored here for JWT claim availability; keep in sync with USER entity in DDB
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
      removalPolicy: RemovalPolicy.RETAIN, // Never auto-delete user accounts
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

    // ─── 4. SQS — Background Cleanup Queue ───────────────────────────────────
    const cleanupDLQ = new sqs.Queue(this, "IcafCleanupDLQ", {
      queueName: "icaf-cleanup-dlq",
      retentionPeriod: Duration.days(14),
    });

    const cleanupQueue = new sqs.Queue(this, "IcafCleanupQueue", {
      queueName: "icaf-cleanup-queue",
      visibilityTimeout: Duration.seconds(300),
      retentionPeriod: Duration.days(14),
      deadLetterQueue: {
        queue: cleanupDLQ,
        maxReceiveCount: 3,
      },
    });

    // ─── 5. Common Lambda configuration ──────────────────────────────────────
    const commonEnv = {
      TABLE_NAME: icafTable.tableName,
      USER_POOL_ID: userPool.userPoolId,
      USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      S3_BUCKET_NAME: artworkBucket.bucketName,
      CLEANUP_QUEUE_URL: cleanupQueue.queueUrl,
    };

    const baseFnProps = {
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(15),
      memorySize: 256,
      environment: commonEnv,
    };

    const heavyFnProps = {
      ...baseFnProps,
      timeout: Duration.seconds(60),
      memorySize: 512,
    };

    // ─── 6. Lambda Functions ──────────────────────────────────────────────────

    // Public — no auth required
    const getArtworkFn = new NodejsFunction(this, "GetArtworkFn", {
      ...baseFnProps,
      entry: "../functions/anyone/getArtwork.ts",
    });

    const galleryArtworksFn = new NodejsFunction(this, "GalleryArtworksFn", {
      ...baseFnProps,
      memorySize: 512,
      entry: "../functions/anyone/gallery/galleryArtworks.ts",
    });

    // Auth
    const registerFn = new NodejsFunction(this, "RegisterFn", {
      ...heavyFnProps,
      entry: "../functions/user/register.ts",
    });

    const loginFn = new NodejsFunction(this, "LoginFn", {
      ...baseFnProps,
      entry: "../functions/user/login.ts",
    });

    const logoutFn = new NodejsFunction(this, "LogoutFn", {
      ...baseFnProps,
      entry: "../functions/user/logout.ts",
    });

    const verifyAccountFn = new NodejsFunction(this, "VerifyAccountFn", {
      ...baseFnProps,
      entry: "../functions/user/verifyAccount.ts",
    });

    const changePasswordFn = new NodejsFunction(this, "ChangePasswordFn", {
      ...baseFnProps,
      entry: "../functions/user/changePassword.ts",
    });

    const forgotPasswordFn = new NodejsFunction(this, "ForgotPasswordFn", {
      ...baseFnProps,
      entry: "../functions/user/forgotPassword.ts",
    });

    const confirmForgotPasswordFn = new NodejsFunction(this, "ConfirmForgotPasswordFn", {
      ...baseFnProps,
      entry: "../functions/user/confirmForgotPassword.ts",
    });

    const resendVerificationFn = new NodejsFunction(this, "ResendVerificationFn", {
      ...baseFnProps,
      entry: "../functions/user/resendVerificationEmail.ts",
    });

    const getAuthStatusFn = new NodejsFunction(this, "GetAuthStatusFn", {
      ...baseFnProps,
      entry: "../functions/user/getAuthStatus.ts",
    });

    // User (authenticated)
    const getUserFn = new NodejsFunction(this, "GetUserFn", {
      ...baseFnProps,
      entry: "../functions/user/user.ts",
    });

    const deleteAccountFn = new NodejsFunction(this, "DeleteAccountFn", {
      ...heavyFnProps,
      entry: "../functions/user/deleteAccount.ts",
    });

    const submitArtworkFn = new NodejsFunction(this, "SubmitArtworkFn", {
      ...heavyFnProps,
      entry: "../functions/user/submitArtwork.ts",
    });

    const listArtworkSubmissionsFn = new NodejsFunction(this, "ListArtworkSubmissionsFn", {
      ...baseFnProps,
      entry: "../functions/user/listArtworkSubmissions.ts",
    });

    const listConstituentArtworksFn = new NodejsFunction(this, "ListConstituentArtworksFn", {
      ...baseFnProps,
      entry: "../functions/user/listConstituentArtworks.ts",
    });

    const voteArtworkFn = new NodejsFunction(this, "VoteArtworkFn", {
      ...baseFnProps,
      entry: "../functions/user/voteArtwork.ts",
    });

    const listVoteArtworkFn = new NodejsFunction(this, "ListVoteArtworkFn", {
      ...baseFnProps,
      entry: "../functions/user/listVoteArtwork.ts",
    });

    const listDonationsFn = new NodejsFunction(this, "ListDonationsFn", {
      ...baseFnProps,
      entry: "../functions/user/listDonations.ts",
    });

    const submitArtworkForConstituentFn = new NodejsFunction(this, "SubmitArtworkForConstituentFn", {
      ...heavyFnProps,
      entry: "../functions/user/submitArtworkForConstituent.ts",
    });

    // Contributor (auth + role check in handler)
    const fetchUnapprovedArtworksFn = new NodejsFunction(this, "FetchUnapprovedArtworksFn", {
      ...baseFnProps,
      entry: "../functions/contributor/fetchUnapprovedArtworks.ts",
    });

    const approveArtworkFn = new NodejsFunction(this, "ApproveArtworkFn", {
      ...baseFnProps,
      entry: "../functions/contributor/approveArtwork.ts",
    });

    const rejectArtworkFn = new NodejsFunction(this, "RejectArtworkFn", {
      ...baseFnProps,
      entry: "../functions/contributor/rejectArtwork.ts",
    });

    const cleanupRejectedArtworkFn = new NodejsFunction(this, "CleanupRejectedArtworkFn", {
      ...heavyFnProps,
      entry: "../functions/contributor/cleanupRejectedArtwork.ts",
    });

    const updateUserRoleFn = new NodejsFunction(this, "UpdateUserRoleFn", {
      ...baseFnProps,
      entry: "../functions/contributor/updateUserRole.ts",
    });

    const setGuardianSubmissionLimitFn = new NodejsFunction(this, "SetGuardianSubmissionLimitFn", {
      ...baseFnProps,
      entry: "../functions/contributor/setGuardianSubmissionLimit.ts",
    });

    // Admin (auth + role check in handler)
    const banUserFn = new NodejsFunction(this, "BanUserFn", {
      ...baseFnProps,
      entry: "../functions/admin/banUser.ts",
    });

    const unbanUserFn = new NodejsFunction(this, "UnbanUserFn", {
      ...baseFnProps,
      entry: "../functions/admin/unbanUser.ts",
    });

    const alterUserRoleFn = new NodejsFunction(this, "AlterUserRoleFn", {
      ...baseFnProps,
      entry: "../functions/admin/alterUserRole.ts",
    });

    const updateUserFn = new NodejsFunction(this, "UpdateUserFn", {
      ...baseFnProps,
      entry: "../functions/admin/updateUser.ts",
    });

    const getUserCognitoInfoFn = new NodejsFunction(this, "GetUserCognitoInfoFn", {
      ...baseFnProps,
      entry: "../functions/admin/getUserCognitoInfo.ts",
    });

    const getArtworkSubmitterEmailFn = new NodejsFunction(this, "GetArtworkSubmitterEmailFn", {
      ...baseFnProps,
      entry: "../functions/admin/getArtworkSubmitterEmail.ts",
    });

    const deleteUserAccountFn = new NodejsFunction(this, "DeleteUserAccountFn", {
      ...heavyFnProps,
      entry: "../functions/admin/deleteUserAccount.ts",
    });

    const removeAllUserArtworkFn = new NodejsFunction(this, "RemoveAllUserArtworkFn", {
      ...heavyFnProps,
      entry: "../functions/admin/removeAllUserArtwork.ts",
    });

    const getAllDonationsFn = new NodejsFunction(this, "GetAllDonationsFn", {
      ...baseFnProps,
      entry: "../functions/admin/getAllDonations.ts",
    });

    // Background processor — triggered by SQS
    const cleanupQueueProcessorFn = new NodejsFunction(this, "CleanupQueueProcessorFn", {
      ...heavyFnProps,
      timeout: Duration.seconds(300),
      entry: "../functions/cleanupQueueProcessor.ts",
    });

    cleanupQueueProcessorFn.addEventSource(
      new SqsEventSource(cleanupQueue, { batchSize: 10 })
    );

    // ─── 7. IAM Permissions ───────────────────────────────────────────────────

    // DynamoDB: full read/write for all Lambda functions
    const allFunctions = [
      getArtworkFn, galleryArtworksFn,
      registerFn, loginFn, logoutFn, verifyAccountFn, changePasswordFn,
      forgotPasswordFn, confirmForgotPasswordFn, resendVerificationFn, getAuthStatusFn,
      getUserFn, deleteAccountFn, submitArtworkFn, listArtworkSubmissionsFn,
      listConstituentArtworksFn, voteArtworkFn, listVoteArtworkFn, listDonationsFn,
      submitArtworkForConstituentFn,
      fetchUnapprovedArtworksFn, approveArtworkFn, rejectArtworkFn,
      cleanupRejectedArtworkFn, updateUserRoleFn, setGuardianSubmissionLimitFn,
      banUserFn, unbanUserFn, alterUserRoleFn, updateUserFn,
      getUserCognitoInfoFn, getArtworkSubmitterEmailFn,
      deleteUserAccountFn, removeAllUserArtworkFn, getAllDonationsFn,
      cleanupQueueProcessorFn,
    ];

    for (const fn of allFunctions) {
      icafTable.grantReadWriteData(fn);
    }

    // S3: only functions that read/write artwork files
    const s3Functions = [
      submitArtworkFn, submitArtworkForConstituentFn,
      deleteAccountFn, deleteUserAccountFn,
      removeAllUserArtworkFn, cleanupRejectedArtworkFn,
      cleanupQueueProcessorFn,
    ];

    for (const fn of s3Functions) {
      artworkBucket.grantReadWrite(fn);
    }

    // S3: presigned URL generation for artwork uploads
    for (const fn of [submitArtworkFn, submitArtworkForConstituentFn]) {
      fn.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:PutObject"],
        resources: [`${artworkBucket.bucketArn}/artworks/*`],
      }));
    }

    // SQS
    for (const fn of [deleteAccountFn, deleteUserAccountFn, removeAllUserArtworkFn]) {
      cleanupQueue.grantSendMessages(fn);
    }
    cleanupQueue.grantConsumeMessages(cleanupQueueProcessorFn);

    // Cognito admin operations — only functions that need to call Cognito APIs
    const cognitoAdminActions = [
      "cognito-idp:AdminInitiateAuth",
      "cognito-idp:AdminGetUser",
      "cognito-idp:AdminUpdateUserAttributes",
      "cognito-idp:AdminDeleteUser",
      "cognito-idp:AdminDisableUser",
      "cognito-idp:AdminEnableUser",
      "cognito-idp:AdminSetUserPassword",
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
      loginFn, logoutFn, verifyAccountFn,
      deleteAccountFn, getUserCognitoInfoFn, deleteUserAccountFn,
      alterUserRoleFn, updateUserFn, banUserFn, unbanUserFn,
      resendVerificationFn,
    ];

    for (const fn of cognitoAdminFunctions) {
      fn.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [...cognitoAdminActions, ...cognitoClientActions],
        resources: [userPool.userPoolArn],
      }));
    }

    // Register and auth functions only need client-level Cognito access
    for (const fn of [registerFn, changePasswordFn, forgotPasswordFn, confirmForgotPasswordFn, getAuthStatusFn]) {
      fn.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: cognitoClientActions,
        resources: [userPool.userPoolArn],
      }));
    }

    // ─── 8. API Gateway ───────────────────────────────────────────────────────
    const api = new apigw.RestApi(this, "IcafApi", {
      restApiName: "icaf-api",
      endpointConfiguration: { types: [apigw.EndpointType.REGIONAL] },
      deployOptions: { stageName: "v1" },
      defaultCorsPreflightOptions: {
        allowOrigins: ["https://icaf.org", "http://localhost:5173"],
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true,
      },
    });

    const cognitoAuthorizer = new apigw.CognitoUserPoolsAuthorizer(this, "IcafAuthorizer", {
      cognitoUserPools: [userPool],
    });

    const authOpts = {
      authorizer: cognitoAuthorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    };

    const li = (fn: NodejsFunction) => new apigw.LambdaIntegration(fn);

    // ── Gallery (public) ─────────────────────────────────────────────────────
    const gallery = api.root.addResource("gallery");
    const galleryArtworksRes = gallery.addResource("artworks");
    galleryArtworksRes.addMethod("GET", li(galleryArtworksFn)); // ?sortType=newest|oldest
    galleryArtworksRes.addResource("{artId}").addMethod("GET", li(getArtworkFn));

    // /gallery/artworks/family/{family} and /gallery/artworks/family/{family}/instance/{instance}
    // both use same handler — handler reads path params to determine query type
    const galleryByFamily = galleryArtworksRes.addResource("family").addResource("{family}");
    galleryByFamily.addMethod("GET", li(galleryArtworksFn));
    galleryByFamily
      .addResource("instance")
      .addResource("{instance}")
      .addMethod("GET", li(galleryArtworksFn));

    // ── Auth (public) ─────────────────────────────────────────────────────────
    const authRes = api.root.addResource("auth");
    authRes.addResource("register").addMethod("POST", li(registerFn));
    authRes.addResource("login").addMethod("POST", li(loginFn));
    authRes.addResource("logout").addMethod("POST", li(logoutFn));
    authRes.addResource("verify").addMethod("POST", li(verifyAccountFn));
    authRes.addResource("forgot-password").addMethod("POST", li(forgotPasswordFn));
    authRes.addResource("confirm-forgot-password").addMethod("POST", li(confirmForgotPasswordFn));
    authRes.addResource("resend-verification").addMethod("POST", li(resendVerificationFn));
    authRes.addResource("status").addMethod("GET", li(getAuthStatusFn));
    // Change password requires auth
    authRes.addResource("change-password").addMethod("POST", li(changePasswordFn), authOpts);

    // ── User — authenticated ──────────────────────────────────────────────────
    const userRes = api.root.addResource("user");
    userRes.addResource("profile").addMethod("GET", li(getUserFn), authOpts);
    userRes.addResource("account").addMethod("DELETE", li(deleteAccountFn), authOpts);
    userRes.addResource("payments").addMethod("GET", li(listDonationsFn), authOpts);
    userRes.addResource("voted-artworks").addMethod("GET", li(listVoteArtworkFn), authOpts);

    const userArtworksRes = userRes.addResource("artworks");
    userArtworksRes.addMethod("GET", li(listArtworkSubmissionsFn), authOpts);
    userArtworksRes.addMethod("POST", li(submitArtworkFn), authOpts);

    const userArtworkRes = userArtworksRes.addResource("{artId}");
    userArtworkRes.addResource("kudos").addMethod("POST", li(voteArtworkFn), authOpts);

    // Guardian — constituent artwork submissions
    const userConstituentRes = userRes.addResource("constituents");
    userConstituentRes.addResource("artworks").addMethod("GET", li(listConstituentArtworksFn), authOpts);
    userConstituentRes.addResource("submit").addMethod("POST", li(submitArtworkForConstituentFn), authOpts);

    // ── Contributor — auth + role enforcement in handler ──────────────────────
    const contribRes = api.root.addResource("contributor");

    const contribArtworksRes = contribRes.addResource("artworks");
    contribArtworksRes.addResource("pending").addMethod("GET", li(fetchUnapprovedArtworksFn), authOpts);

    const contribArtworkRes = contribArtworksRes.addResource("{artId}");
    contribArtworkRes.addResource("approve").addMethod("POST", li(approveArtworkFn), authOpts);
    contribArtworkRes.addResource("reject").addMethod("POST", li(rejectArtworkFn), authOpts);

    const contribUsersRes = contribRes.addResource("users");
    const contribUserRes = contribUsersRes.addResource("{userId}");
    contribUserRes.addResource("role").addMethod("PATCH", li(updateUserRoleFn), authOpts);
    contribUserRes.addResource("submission-limit").addMethod("PATCH", li(setGuardianSubmissionLimitFn), authOpts);

    // ── Admin — auth + role enforcement in handler ────────────────────────────
    const adminRes = api.root.addResource("admin");

    const adminUsersRes = adminRes.addResource("users");
    const adminUserRes = adminUsersRes.addResource("{userId}");
    adminUserRes.addMethod("PATCH", li(updateUserFn), authOpts);
    adminUserRes.addResource("ban").addMethod("POST", li(banUserFn), authOpts);
    adminUserRes.addResource("unban").addMethod("POST", li(unbanUserFn), authOpts);
    adminUserRes.addResource("role").addMethod("PATCH", li(alterUserRoleFn), authOpts);
    adminUserRes.addResource("cognito-info").addMethod("GET", li(getUserCognitoInfoFn), authOpts);
    adminUserRes.addResource("account").addMethod("DELETE", li(deleteUserAccountFn), authOpts);
    adminUserRes.addResource("artworks").addMethod("DELETE", li(removeAllUserArtworkFn), authOpts);

    const adminArtworksRes = adminRes.addResource("artworks");
    adminArtworksRes
      .addResource("{artId}")
      .addResource("submitter-email")
      .addMethod("GET", li(getArtworkSubmitterEmailFn), authOpts);

    adminRes.addResource("payments").addMethod("GET", li(getAllDonationsFn), authOpts);
  }
}
