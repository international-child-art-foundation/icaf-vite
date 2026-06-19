export type DeploymentEnvironment = "staging" | "production";

export interface DeploymentConfig {
  environment: DeploymentEnvironment;
  stackName: string;
  resourcePrefix: string;
  appUrl: string;
  allowedOrigins: string[];
}

const CONFIG_BY_ENVIRONMENT: Record<DeploymentEnvironment, DeploymentConfig> = {
  staging: {
    environment: "staging",
    stackName: "IcafStagingStack",
    resourcePrefix: "icaf-staging",
    appUrl: "https://staging.icaf.org",
    allowedOrigins: ["https://staging.icaf.org", "http://localhost:5173"],
  },
  production: {
    environment: "production",
    stackName: "IcafProductionStack",
    resourcePrefix: "icaf-production",
    appUrl: "https://icaf.org",
    allowedOrigins: ["https://icaf.org"],
  },
};

export function getDeploymentConfig(value: string | undefined): DeploymentConfig {
  if (value === "staging") return CONFIG_BY_ENVIRONMENT.staging;
  if (value === "main") return CONFIG_BY_ENVIRONMENT.production;

  throw new Error("DEPLOY_ENV must be set to the deployment branch: 'staging' or 'main'.");
}
