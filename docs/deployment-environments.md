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

## GitHub Environment configuration

Create GitHub Environments named `staging` and `main`.

Define these secrets in both environments:

- `AWS_DEPLOY_ROLE_ARN`
- `STRIPE_WEBHOOK_SECRET`
- `EVERY_WEBHOOK_SECRET`
- `CLOUDFLARE_API_TOKEN`
- `SFTP_HOST`
- `SFTP_USER`
- `SFTP_PASSWORD`

Define these variables in both environments:

- `AWS_REGION` — currently `us-east-1`
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account containing `icaf.org`

The account ID identifies a deployment target but does not grant access, so it
is a variable rather than a secret. Use a scoped Cloudflare API token, not a
global API key.

## Deployment order

The **Deploy Backend and API Proxy** workflow encodes the dependency order:

1. CDK deploys the environment-specific AWS backend.
2. The workflow reads and validates `ApiGatewayOrigin` from the CDK outputs.
3. The Cloudflare deployment step receives that URL and deploys the matching
   Worker environment.

This works on the first deployment and requires no manually configured API
Gateway URL. GitHub Actions shows explicit CDK and Worker deployment steps and
writes the resolved target to the workflow summary. The Worker deployment
cannot start unless CDK succeeds and exports exactly one valid API Gateway
origin. Both deployments share one environment approval.

Changes to either the AWS backend or Worker package run this ordered pipeline.
A Worker-only change therefore performs a no-op CDK deployment first; this is
intentional so the Worker target always comes from current AWS state.

Protect the `main` GitHub Environment with required reviewers. The
backend workflow runs `cdk diff` before each deployment. Production never
includes localhost in API Gateway, Lambda, or S3 CORS configuration.

The frontend build always sets `VITE_API_BASE_URL=/api`. Application code calls
`/api` in every environment. For local development, copy
`frontend/.env.example` to `frontend/.env.local` and set `API_PROXY_TARGET` to
the staging `ApiGatewayOrigin`; Vite forwards local `/api` requests there.

`cloudflare/api-proxy/.dev.vars` is separate and only needed when running the
Worker itself locally. Remote Worker deployments receive `TARGET_API_ORIGIN`
directly from the preceding CDK job.
