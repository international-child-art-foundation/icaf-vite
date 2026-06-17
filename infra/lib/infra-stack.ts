import { CfnOutput, Duration, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
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
import * as ses from "aws-cdk-lib/aws-ses";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cloudwatchActions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";

// Spend threshold (USD) that triggers emergencyShutdown
const BILLING_ALARM_THRESHOLD_USD = 50;

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * Stateful resources are retained by default so normal deploys/destroys do
     * not delete user data, uploaded files, or auth state.
     *
     * To intentionally delete absolutely everything, run:
     *
     *   pnpm cdk destroy \
     *     -c destroyEverything=true \
     *     -c confirmDestroyEverything=YES_DELETE_STATEFUL_DATA
     *
     * Without both context values, DynamoDB, Cognito, and the S3 buckets are retained.
     */
    const destroyEverything =
      this.node.tryGetContext("destroyEverything") === "true" &&
      this.node.tryGetContext("confirmDestroyEverything") === "YES_DELETE_STATEFUL_DATA";

    const statefulRemovalPolicy = destroyEverything
      ? RemovalPolicy.DESTROY
      : RemovalPolicy.RETAIN;

    if (destroyEverything) {
      console.warn(
        "DESTROY EVERYTHING ENABLED: DynamoDB, Cognito, and S3 stateful resources will be deleted.",
      );
    }

    // ─── 1. DynamoDB Table — Single Table Design ──────────────────────────────
    const icafTable = new dynamodb.Table(this, "IcafTable", {
      tableName: "icaf-main-table",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: statefulRemovalPolicy,
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
      removalPolicy: statefulRemovalPolicy,
      autoDeleteObjects: destroyEverything,
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
      removalPolicy: statefulRemovalPolicy,
      autoDeleteObjects: destroyEverything,
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

    // Artwork image variants served from the private artwork bucket.
    // Expected paths are /{art_id}/thumb.avif, /{art_id}/medium.avif, and
    // /{art_id}/original.avif.
    const artworkVariantGuardFn = new cloudfront.Function(this, "ArtworkVariantGuardFn", {
      functionName: "icaf-artwork-variant-guard",
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var uri = request.uri;
          if (/^\\/[^/]+\\/(thumb|medium|original)\\.avif$/.test(uri)) {
            return request;
          }
          return {
            statusCode: 403,
            statusDescription: 'Forbidden'
          };
        }
      `),
    });

    const artworkOac = new cloudfront.S3OriginAccessControl(this, "ArtworkOAC", {
      description: "OAC for ICAF Artwork bucket",
    });

    const artworkDistribution = new cloudfront.Distribution(this, "ArtworkDistribution", {
      comment: "ICAF Artwork image variants",
      defaultBehavior: {
        origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(
          artworkBucket,
          { originAccessControl: artworkOac },
        ),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        functionAssociations: [
          {
            function: artworkVariantGuardFn,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
    });

    new CfnOutput(this, "ArtworkDistributionDomainName", {
      value: artworkDistribution.distributionDomainName,
      description: "CloudFront domain for artwork AVIF variants",
    });

    new CfnOutput(this, "MagazinesDistributionDomainName", {
      value: magazinesDistribution.distributionDomainName,
      description: "CloudFront domain for magazines",
    });

    // ─── 4. Cognito User Pool ─────────────────────────────────────────────────
    const userPool = new cognito.UserPool(this, "IcafUserPool", {
      userPoolName: "icaf-user-pool",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      userVerification: {
        emailSubject: "Verify your ICAF account",
        emailBody: "Verify your ICAF account by clicking this link: {##Verify Email##}",
        emailStyle: cognito.VerificationEmailStyle.LINK,
      },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: false, mutable: true },
        familyName: { required: false, mutable: true },
        birthdate: { required: false, mutable: true },
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
      removalPolicy: statefulRemovalPolicy,
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
      accessTokenValidity: Duration.hours(1),
      idTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30),
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
    // TODO: Update APP_URL and MAGAZINES_CLOUDFRONT_DOMAIN before deployment
    const SES_FROM_EMAIL = "ICAF <no-reply@icaf.org>";
    const TAKEDOWN_NOTIFICATION_EMAILS = [
      "childart@icaf.org",
      "noah.zaranka@icaf.org",
    ];
    const sesConfigurationSet = new ses.CfnConfigurationSet(this, "IcafSesConfigurationSet", {
      name: "icaf-transactional",
    });

    const sesFeedbackTopic = new sns.Topic(this, "SesFeedbackTopic", {
      topicName: "icaf-ses-feedback",
      displayName: "ICAF SES Bounce and Complaint Feedback",
    });

    sesFeedbackTopic.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("ses.amazonaws.com")],
        actions: ["sns:Publish"],
        resources: [sesFeedbackTopic.topicArn],
      }),
    );

    new ses.CfnConfigurationSetEventDestination(this, "IcafSesFeedbackEventDestination", {
      configurationSetName: sesConfigurationSet.ref,
      eventDestination: {
        enabled: true,
        matchingEventTypes: ["bounce", "complaint"],
        snsDestination: {
          topicArn: sesFeedbackTopic.topicArn,
        },
      },
    });

    const commonEnv = {
      TABLE_NAME: icafTable.tableName,
      USER_POOL_ID: userPool.userPoolId,
      USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      S3_BUCKET_NAME: artworkBucket.bucketName,
      MAGAZINES_BUCKET_NAME: magazinesBucket.bucketName,
      CLEANUP_QUEUE_URL: cleanupQueue.queueUrl,
      APP_URL: "https://revise.icaf.org",
      SES_FROM_EMAIL,
      SES_CONFIGURATION_SET: sesConfigurationSet.ref,
      TAKEDOWN_NOTIFICATION_EMAILS: JSON.stringify(TAKEDOWN_NOTIFICATION_EMAILS),
      ARTWORK_CLOUDFRONT_DISTRIBUTION_ID: artworkDistribution.distributionId,
      MAGAZINES_CLOUDFRONT_DOMAIN: "d2i0uq3fi9fhva.cloudfront.net", // CloudFront domain for magazine assets
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      EVERY_WEBHOOK_SECRET: process.env.EVERY_WEBHOOK_SECRET ?? "",
    };

    // Default log retention for all NodejsFunctions in this stack.
    const defaultLogRetention = logs.RetentionDays.ONE_MONTH;

    const lambdaLogGroup = (id: string): logs.LogGroup =>
      new logs.LogGroup(this, `${id}LogGroup`, {
        retention: defaultLogRetention,
        removalPolicy: RemovalPolicy.DESTROY,
      });

    const src = (p: string) => `../backend/src/functions/${p}`;

    const apiFn = new NodejsFunction(this, "ApiFn", {
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(60),
      memorySize: 512,
      environment: commonEnv,
      entry: "../backend/src/api/index.ts",
      logGroup: lambdaLogGroup("ApiFn"),
    });

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
      logGroup: lambdaLogGroup("ProcessImage"),
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
      logGroup: lambdaLogGroup("ProcessZipFn"),
    });

    processZipFn.addEventSource(
      new SqsEventSource(processZipQueue, {
        batchSize: 1,
      }),
    );

    const processSesFeedbackFn = new NodejsFunction(this, "ProcessSesFeedbackFn", {
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        TABLE_NAME: icafTable.tableName,
      },
      entry: src("processSesFeedback.ts"),
      logGroup: lambdaLogGroup("ProcessSesFeedbackFn"),
    });

    sesFeedbackTopic.addSubscription(
      new snsSubscriptions.LambdaSubscription(processSesFeedbackFn),
    );

    // EmergencyShutdown: throttles API Gateway to 0 req/s
    const emergencyShutdownFn = new NodejsFunction(this, "EmergencyShutdownFn", {
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 128,
      entry: src("emergencyShutdown.ts"),
      environment: { API_STAGE: "v1" },
      logGroup: lambdaLogGroup("EmergencyShutdownFn"),
    });

    // ─── 8. IAM Permissions ───────────────────────────────────────────────────

    // DynamoDB — HTTP handlers share one router Lambda.
    icafTable.grantReadWriteData(apiFn);

    // processImage, processZip, and SES feedback processing also need DDB access
    icafTable.grantReadWriteData(processImageFn);
    icafTable.grantReadWriteData(processZipFn);
    icafTable.grantReadWriteData(processSesFeedbackFn);

    // S3 artwork bucket — presigned PUT or delete
    artworkBucket.grantReadWrite(apiFn);

    // processImageFn reads {art_id}/initial, writes the three AVIF variants,
    // and deletes the initial. grantReadWrite already includes delete.
    artworkBucket.grantReadWrite(processImageFn);

    // S3 magazines bucket
    // ApiFn generates magazine upload URLs and handles magazine deletion.
    magazinesBucket.grantReadWrite(apiFn);
    // processZipFn downloads from staging/, uploads to <slug>/, deletes the zip
    magazinesBucket.grantReadWrite(processZipFn);

    // SES — functions that send email via SES
    apiFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["ses:SendEmail", "ses:SendRawEmail"],
      resources: ["*"],
    }));

    apiFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["cloudfront:CreateInvalidation"],
      resources: [
        `arn:aws:cloudfront::${this.account}:distribution/${artworkDistribution.distributionId}`,
      ],
    }));

    // Cognito admin operations
    const cognitoAdminActions = [
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
      "cognito-idp:ChangePassword",
      "cognito-idp:GetUser",
    ];

    apiFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [...cognitoAdminActions, ...cognitoClientActions],
      resources: [userPool.userPoolArn],
    }));

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

    const apiIntegration = new apigw.LambdaIntegration(apiFn, {
      allowTestInvoke: false,
    });

    api.root.addProxy({
      anyMethod: true,
      defaultIntegration: apiIntegration,
    });

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
