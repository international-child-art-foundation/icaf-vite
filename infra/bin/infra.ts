#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack.js';
import { getDeploymentConfig } from '../lib/deployment-config.js';

const app = new cdk.App();
const deployment = getDeploymentConfig(process.env.DEPLOY_ENV);
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

if (!account || !region) {
  throw new Error(
    "CDK_DEFAULT_ACCOUNT and CDK_DEFAULT_REGION must be provided by the deployment environment.",
  );
}

new InfraStack(app, deployment.stackName, {
  deployment,
  env: { account, region },
});
