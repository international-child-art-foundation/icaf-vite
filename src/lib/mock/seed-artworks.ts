import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbClient } from "@/lib/mock/ddb-client";
import { mock_artworks } from "@/shared/data/mock-artworks";

const TABLE_NAME = "users";

async function seedArtworks() {
  for (const artwork of mock_artworks) {
    try {
      await ddbClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: artwork,
        })
      );
      console.log(`Seeded artwork: ${artwork.user_id}`);
    } catch (err) {
      console.error("Failed to seed artwork:", artwork.user_id, err);
    }
  }
}

seedArtworks().catch(console.error);
