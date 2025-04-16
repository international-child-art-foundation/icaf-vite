import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbClient } from "@/lib/mock/ddb-client";
import { generateFakeData } from "@/lib/mock/data-gen";

const TABLE_NAME = "users"; // or your actual table name

async function seedAll() {
  const { users, artworks, virtualArtworks } = generateFakeData();

  const allItems = [...users, ...artworks, ...virtualArtworks];

  for (const item of allItems) {
    try {
      await ddbClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: item,
        })
      );
      console.log(`Seeded: ${item.PK}`);
    } catch (err) {
      console.error(`Failed to seed ${item.PK}:`, err);
    }
  }

  console.log("✅ Done seeding");
}

seedAll().catch(console.error);
