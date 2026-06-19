# ICAF API proxy

Cloudflare Worker that maps the same-origin `staging.icaf.org/api/*` and
`icaf.org/api/*` routes to their environment-specific AWS API Gateway stage.
The `/api` path is preserved and API responses are never cached.

## Local Worker development

Copy `.dev.vars.example` to `.dev.vars`, set the staging API Gateway stage URL,
then run:

```sh
pnpm dev:staging
```

Normal frontend development does not use this Worker. Configure
`API_PROXY_TARGET` in `frontend/.env.local` and continue to call `/api/*`.

## Deployment prerequisites

Create GitHub Environments named `staging` and `main`. Define these secrets in
both environments:

- `CLOUDFLARE_API_TOKEN`

Define `CLOUDFLARE_ACCOUNT_ID` as a GitHub Environment variable. The ordered
deployment workflow obtains `TARGET_API_ORIGIN` directly from the matching CDK
stack's `ApiGatewayOrigin` output and passes it to Wrangler. It is deliberately
not stored in `wrangler.jsonc`, so a deployment cannot silently use the other
environment's backend.
CI passes both `ENVIRONMENT` and `TARGET_API_ORIGIN` through Wrangler's `--var`
option because CLI variables replace, rather than augment, config variables.

The token should only have the Worker script and route permissions needed for
the `icaf.org` zone. Protect the `main` GitHub Environment with required
reviewers before enabling the production backend and route.
