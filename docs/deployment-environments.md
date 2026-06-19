# Deployment environments

The `staging` and `main` branches deploy to GitHub Environments with the same
names. Matching names avoid maintaining a second branch-to-environment map:

| Branch | GitHub Environment | App URL | CDK stack | Worker |
| --- | --- | --- | --- | --- |
| `staging` | `staging` | `https://staging.icaf.org` | `IcafStagingStack` | `icaf-api-proxy-staging` |
| `main` | `main` | `https://icaf.org` | `IcafProductionStack` | `icaf-api-proxy-production` |

Staging resources use the `icaf-staging-*` prefix and production resources use
`icaf-production-*`. The application URLs, CORS allowlists, stack names, and
resource prefixes are defined in `infra/lib/deployment-config.ts`.

Both environments retain DynamoDB tables, Cognito user pools, and S3 buckets
when their CloudFormation stack is deleted. This protects staging work as well
as production data from accidental `cdk destroy` operations. To intentionally
remove an environment, delete its CloudFormation stack first, then review and
delete the retained resources in the AWS console. S3 buckets must be emptied
before they can be deleted.

## GitHub Environment configuration

Create GitHub Environments named `staging` and `main`.

Define these secrets in both environments:

- `AWS_DEPLOY_ROLE_ARN`
- `STRIPE_WEBHOOK_SECRET`
- `CLOUDFLARE_API_TOKEN`
- `SFTP_HOST`
- `SFTP_USER`
- `SFTP_PASSWORD`

Define `EVERY_WEBHOOK_SECRET` only in `main`. Every.org supports one webhook,
so the Every webhook is disabled in staging and its staging route returns 404.
The production deployment fails if the `main` secret is missing.

Define these variables in both environments:

- `AWS_REGION` — currently `us-east-1`
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account containing `icaf.org`

The account ID identifies a deployment target but does not grant access, so it
is a variable rather than a secret. Use a scoped Cloudflare API token, not a
global API key.

## Deployment order

The **Deploy Application** workflow is the only remote deployment workflow and
encodes the dependency order:

1. CDK deploys the environment-specific AWS backend.
2. The workflow reads and validates `ApiGatewayOrigin` and
   `ArtworkDistributionDomainName` from the CDK outputs.
3. The Cloudflare deployment receives `ApiGatewayOrigin` as
   `TARGET_API_ORIGIN` and deploys the matching Worker environment.
4. Vite builds the frontend with `/api` as `VITE_API_BASE_URL` and the derived
   CloudFront HTTPS origin as `VITE_ARTWORK_ASSET_BASE_URL`.
5. The workflow uploads the build to a unique release directory.
6. Uploading `.htaccess` activates that release as the final step.

This works on the first deployment and requires no manually configured API
Gateway URL. GitHub Actions shows explicit CDK and Worker deployment steps and
writes the resolved target to the workflow summary. The Worker deployment
cannot start unless CDK succeeds and exports exactly one valid API Gateway
origin and exactly one valid CloudFront artwork domain. All deployments share
one environment approval.

Changes to the AWS backend, Worker, shared package, or frontend run this ordered
pipeline. A frontend-only or Worker-only change therefore performs a no-op CDK
deployment first; this is intentional so build-time and Worker configuration
always comes from current AWS state. The previous frontend remains active if
the build or versioned-directory upload fails. AWS, Cloudflare, and SFTP cannot
participate in one atomic transaction, so backend changes must remain
compatible with the previously active frontend until the final activation.

Protect the `main` GitHub Environment with required reviewers. The
backend workflow runs `cdk diff` before each deployment. Production never
includes localhost in API Gateway, Lambda, or S3 CORS configuration.

The frontend build always sets `VITE_API_BASE_URL=/api`. `API_PROXY_TARGET` is
only a local Vite development-server setting and is not passed to production
builds. Application code calls `/api` in every environment. For local
development, copy
`frontend/.env.example` to `frontend/.env.local` and set `API_PROXY_TARGET` to
the staging `ApiGatewayOrigin`; Vite forwards local `/api` requests there.

`cloudflare/api-proxy/.dev.vars` is separate and only needed when running the
Worker itself locally. Remote Worker deployments receive `TARGET_API_ORIGIN`
directly from the preceding CDK job.
