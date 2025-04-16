import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbClient } from "@/lib/mock/ddb-client";
import { users } from "@/shared/data/mock-users";

const TABLE_NAME = "users";

async function seedUsers() {
  for (const user of users) {
    try {
      await ddbClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: user,
        })
      );
      console.log(`Seeded user: ${user.user_id}`);
    } catch (err) {
      console.error("Failed to seed user:", user.user_id, err);
    }
  }
}

seedUsers().catch(console.error);
