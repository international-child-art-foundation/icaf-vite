import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config();

export const ddbClient = new DynamoDBClient({
  region: "us-west-2",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: process.env.MOCK_DDB_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MOCK_DDB_SECRET_ACCESS_KEY!,
  },
});
