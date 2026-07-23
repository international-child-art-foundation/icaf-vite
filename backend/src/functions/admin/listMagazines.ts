import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLE_NAME, MAGAZINES_CLOUDFRONT_DOMAIN } from "../../config/aws-clients";
import {
    HTTP_STATUS,
    COMMON_HEADERS,
    CommonErrors,
    MagazineEntity,
    MagazineListItem,
    ListMagazinesResponse,
} from "@icaf/shared";

function toMagazineListItem(magazine: MagazineEntity): MagazineListItem {
    return {
        slug: magazine.slug,
        name: magazine.name,
        period: magazine.period,
        volume: magazine.volume,
        status: magazine.status,
        link_url: `https://${MAGAZINES_CLOUDFRONT_DOMAIN}/${magazine.slug}/`,
        ...(magazine.thumbnail_key && {
            thumbnail_url: `https://${MAGAZINES_CLOUDFRONT_DOMAIN}/${magazine.slug}/${magazine.thumbnail_key}`,
        }),
        ts: magazine.ts,
    };
}

export const handler = async (): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        const result = await dynamodb.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: { ":pk": "MAGAZINE" },
            }),
        );

        const magazines = ((result.Items ?? []) as MagazineEntity[])
            .map(toMagazineListItem)
            .sort((a, b) => b.ts - a.ts);

        const response: ListMagazinesResponse = { magazines };

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error listing admin magazines:", error);
        return CommonErrors.internalServerError();
    }
};
