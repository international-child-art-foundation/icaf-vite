/**
 * EmergencyShutdown Lambda
 *
 * Triggered by: CloudWatch Billing Alarm → SNS → this Lambda
 *
 * Throttles the API Gateway REST API stage to 0 requests/second,
 * effectively taking the entire API offline without deleting resources.
 * Everything can be restored by updating the stage throttle limits back
 * to their normal values.
 *
 * Shutdown will only occur for resources in us-east-1 region.
*/

import { APIGatewayClient, UpdateStageCommand } from "@aws-sdk/client-api-gateway";

const apiClient = new APIGatewayClient({ region: process.env.AWS_REGION });

export const handler = async (event: unknown): Promise<void> => {
  console.log("Emergency shutdown triggered:", JSON.stringify(event));

  const apiId = process.env.API_ID;
  const stageName = process.env.API_STAGE ?? "v1";

  if (!apiId) {
    throw new Error("API_ID environment variable not set");
  }

  // Throttle every route to 0 — effectively takes the API offline.
  // Restore by setting burstLimit/rateLimit back to desired values.
  await apiClient.send(
    new UpdateStageCommand({
      restApiId: apiId,
      stageName,
      patchOperations: [
        { op: "replace", path: "/*/*/throttling/burstLimit", value: "0" },
        { op: "replace", path: "/*/*/throttling/rateLimit", value: "0" },
      ],
    }),
  );

  console.log(
    `Emergency shutdown complete — API ${apiId} stage "${stageName}" throttled to 0 req/s.`,
  );
};
