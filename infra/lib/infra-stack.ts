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

    // ByOwner GSI — a user's artworks and groups. Must match GSI.ByOwner = "ByOwnerGSI"
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

    // ─── 2. S3 Bucket — Artwork Storage ──────────────────────────────────────
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

    // ─── 4. SQS — Background Cleanup Queue ───────────────────────────────────
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

    // ─── 5. Lambda Functions ──────────────────────────────────────────────────
    // TODO: Update APP_URL and SES_FROM_EMAIL before deployment, set in lambda env config
    const commonEnv = {
      TABLE_NAME: icafTable.tableName,
      USER_POOL_ID: userPool.userPoolId,
      USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      S3_BUCKET_NAME: artworkBucket.bucketName,
      CLEANUP_QUEUE_URL: cleanupQueue.queueUrl,
      APP_URL: "",          // https://revise.icaf.org
      SES_FROM_EMAIL: "",   // verified SES sender address
    };

    const fn = (id: string, entry: string, heavy = false): NodejsFunction =>
      new NodejsFunction(this, id, {
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(heavy ? 60 : 15),
        memorySize: heavy ? 512 : 256,
        environment: commonEnv,
        entry,
      });

    const src = (path: string) => `../backend/src/functions/${path}`;

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

    // ── User — authenticated ──────────────────────────────────────────────────
    const getUserFn                 = fn("GetUserFn",                 src("user/user.ts"));
    const submitArtworkFn           = fn("SubmitArtworkFn",           src("user/submitArtwork.ts"), true);
    const updateArtworkFn           = fn("UpdateArtworkFn",           src("user/updateArtwork.ts"));
    const deleteArtworkFn           = fn("DeleteArtworkFn",           src("user/deleteArtwork.ts"));
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

    // ─── 6. IAM Permissions ───────────────────────────────────────────────────

    // DynamoDB — all functions need read/write access
    const allFunctions = [
      getArtworkFn, getGroupFn, galleryArtworksFn, galleryGroupsFn,
      initiateTakedownFn, guestSubmitArtworkFn, verifyAccountFn,
      registerFn, loginFn, logoutFn, forgotPasswordFn, confirmForgotPasswordFn,
      resendVerificationFn, getAuthStatusFn, requestCreateAndVerifyFn,
      getUserFn, submitArtworkFn, updateArtworkFn, deleteArtworkFn,
      listArtworkSubmissionsFn, voteArtworkFn, listDonationsFn,
      changePasswordFn, deleteAccountFn,
      createGroupFn, listGroupSubmissionsFn, updateGroupFn, deleteGroupFn,
      submitArtworkToGroupFn, deleteArtworkFromGroupFn, updateConstituentArtworkFn,
      fetchUnapprovedArtworksFn, fetchHiddenArtworksFn,
      fetchUnapprovedGroupsFn, fetchHiddenGroupsFn,
      changeArtworkStatusFn, changeGroupStatusFn, updateUserRoleFn,
      banUserFn, unbanUserFn, alterUserRoleFn, getUserCognitoInfoFn,
      getEmailByUserIdFn, deleteUserAccountFn, removeAllUserArtworkFn,
      hideAllUserArtworkFn, unhideAllUserArtworkFn,
      getArtworkSubmitterEmailFn, getTakedownRequestsFn, cancelTakedownRequestFn,
    ];

    for (const f of allFunctions) {
      icafTable.grantReadWriteData(f);
    }

    // S3 — functions that generate presigned PUT URLs or delete objects
    const s3Functions = [
      guestSubmitArtworkFn,   // presigned PUT + S3 cleanup (virtual submission)
      submitArtworkFn,         // presigned PUT
      submitArtworkToGroupFn,  // presigned PUT
      deleteArtworkFn,         // S3 list + delete
      deleteAccountFn,         // S3 list + delete (artwork cleanup)
      deleteUserAccountFn,     // S3 list + delete (artwork cleanup)
    ];

    for (const f of s3Functions) {
      artworkBucket.grantReadWrite(f);
    }

    // SES — functions that send email via SES
    const sesFunctions = [
      guestSubmitArtworkFn,      // artwork submission email
      requestCreateAndVerifyFn,  // CreateAndVerify email (user-requested)
      changeArtworkStatusFn,     // approval notification
      changeGroupStatusFn,       // approval notification
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

    // Functions that need Cognito admin actions (server-side user management)
    const cognitoAdminFunctions = [
      loginFn,            // AdminInitiateAuth (USER_PASSWORD_AUTH flow)
      logoutFn,           // AdminUserGlobalSignOut
      verifyAccountFn,    // AdminCreateUser + AdminSetUserPassword
      deleteAccountFn,    // InitiateAuth (password verify) + AdminDeleteUser
      deleteUserAccountFn, // AdminDeleteUser
      getUserCognitoInfoFn, // AdminGetUser
    ];

    for (const f of cognitoAdminFunctions) {
      f.addToRolePolicy(new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [...cognitoAdminActions, ...cognitoClientActions],
        resources: [userPool.userPoolArn],
      }));
    }

    // Functions that only need client-level Cognito access
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

    // ─── 7. API Gateway ───────────────────────────────────────────────────────
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
  }
}
