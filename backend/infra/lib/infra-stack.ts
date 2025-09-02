import { Duration, Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 1️⃣  DynamoDB Table - Single Table Design
    const icafTable = new dynamodb.Table(this, "IcaFTable", {
      tableName: "icaf-main-table",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Add GSIs for Gallery functionality - matching actual database structure
    // GSI1 - Time Sorted (Season): for newest/oldest artwork queries
    icafTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING }, // SEASON#<id>
      sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING }, // TIMESTAMP#<timestamp>#ART#<art_id>
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI2 - Vote Sorted (Season): for highest/lowest voted artwork queries  
    icafTable.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: { name: "GSI2PK", type: dynamodb.AttributeType.STRING }, // SEASON#<id>
      sortKey: { name: "GSI2SK", type: dynamodb.AttributeType.STRING }, // VOTES#<votes>#TIMESTAMP#<timestamp>#ART#<art_id>
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // S3 Bucket for artwork storage
    const artworkBucket = new s3.Bucket(this, "IcaFArtworkBucket", {
      bucketName: "icaf-artwork-bucket",
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 2️⃣  Cognito User Pool for Authentication
    const userPool = new cognito.UserPool(this, "IcaFUserPool", {
      userPoolName: "icaf-user-pool",
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
        birthdate: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        guardianId: new cognito.StringAttribute({ mutable: true }),
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
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // 3️⃣  Cognito User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, "IcaFUserPoolClient", {
      userPool,
      userPoolClientName: "icaf-client",
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
        callbackUrls: ["http://localhost:3000/callback"],
      },
    });

    // 4️⃣  Lambda functions
    const helloFn = new NodejsFunction(this, "HelloFn", {
      entry: "../functions/hello.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(5),
      memorySize: 256,
      environment: {
        TABLE_NAME: icafTable.tableName,
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      },
    });

    const userFn = new NodejsFunction(this, "UserFn", {
      entry: "../functions/user.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
      environment: {
        TABLE_NAME: icafTable.tableName,
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      },
    });

    const registerFn = new NodejsFunction(this, "RegisterFn", {
      entry: "../functions/register.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: icafTable.tableName,
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      },
    });

    const deleteAccountFn = new NodejsFunction(this, "DeleteAccountFn", {
      entry: "../functions/deleteAccount.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: icafTable.tableName,
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        S3_BUCKET_NAME: artworkBucket.bucketName,
      },
    });

    const cleanupQueueProcessorFn = new NodejsFunction(this, "CleanupQueueProcessorFn", {
      entry: "../functions/cleanupQueueProcessor.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(60),
      memorySize: 512,
      environment: {
        TABLE_NAME: icafTable.tableName,
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        S3_BUCKET_NAME: artworkBucket.bucketName,
      },
    });

    const submitArtworkFn = new NodejsFunction(this, "SubmitArtworkFn", {
      entry: "../functions/user/submitArtwork.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(30),
      memorySize: 512,
      environment: {
        TABLE_NAME: icafTable.tableName,
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        S3_BUCKET_NAME: artworkBucket.bucketName,
      },
    });

    const listSeasonFn = new NodejsFunction(this, "ListSeasonFn", {
      entry: "../functions/anyone/listSeason.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
      environment: {
        TABLE_NAME: icafTable.tableName,
      },
    });

    const galleryArtworksFn = new NodejsFunction(this, "GalleryArtworksFn", {
      entry: "../functions/anyone/gallery/galleryArtworks.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(15),
      memorySize: 512,
      environment: {
        TABLE_NAME: icafTable.tableName,
      },
    });

    // 5️⃣  Grant Lambda permissions to access DynamoDB and S3
    icafTable.grantReadWriteData(helloFn);
    icafTable.grantReadWriteData(userFn);
    icafTable.grantReadWriteData(registerFn);
    icafTable.grantReadWriteData(deleteAccountFn);
    icafTable.grantReadWriteData(cleanupQueueProcessorFn);
    icafTable.grantReadWriteData(submitArtworkFn);
    icafTable.grantReadData(listSeasonFn); // Only read access needed for listing seasons
    icafTable.grantReadData(galleryArtworksFn); // Only read access needed for gallery queries

    // Grant S3 permissions to functions
    artworkBucket.grantReadWrite(deleteAccountFn);
    artworkBucket.grantReadWrite(cleanupQueueProcessorFn);
    artworkBucket.grantReadWrite(submitArtworkFn);

    // Note: Lambda invoke permissions for processImage will be added when that function is implemented

    // 6️⃣  REST API — private by default (no execute‑api wildcard policy)
    const api = new apigw.RestApi(this, "InternalApi", {
      endpointConfiguration: {
        types: [apigw.EndpointType.REGIONAL],
      },
      deployOptions: { stageName: "dev" },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    // 7️⃣  Cognito Authorizer
    const cognitoAuthorizer = new apigw.CognitoUserPoolsAuthorizer(this, "IcaFCognitoAuthorizer", {
      cognitoUserPools: [userPool],
    });

    // 8️⃣  API Resources and Methods
    const hello = api.root.addResource("hello");
    hello.addMethod("GET", new apigw.LambdaIntegration(helloFn));

    // 9️⃣  Public endpoints (no authentication required)
    const register = api.root.addResource("register");
    register.addMethod("POST", new apigw.LambdaIntegration(registerFn));

    // 🔟  Protected endpoints (require authentication)
    const apiResource = api.root.addResource("api");
    const usersResource = apiResource.addResource("users");
    const profileResource = usersResource.addResource("profile");
    profileResource.addMethod("GET", new apigw.LambdaIntegration(userFn), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    const accountResource = usersResource.addResource("account");
    accountResource.addMethod("DELETE", new apigw.LambdaIntegration(deleteAccountFn), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    const artworkResource = usersResource.addResource("artwork");
    artworkResource.addMethod("POST", new apigw.LambdaIntegration(submitArtworkFn), {
      authorizer: cognitoAuthorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    });

    // Public season endpoint (no authentication required)
    const seasonResource = apiResource.addResource("season");
    seasonResource.addMethod("GET", new apigw.LambdaIntegration(listSeasonFn));

    // Public gallery endpoints (no authentication required)
    const galleryResource = apiResource.addResource("gallery");
    const artworksResource = galleryResource.addResource("artworks");
    const sortTypeResource = artworksResource.addResource("{sortType}");
    sortTypeResource.addMethod("GET", new apigw.LambdaIntegration(galleryArtworksFn));
  }
}
