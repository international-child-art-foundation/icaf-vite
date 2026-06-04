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

export const handler = async (): Promise<{ statusCode: number; body: string; headers: Record<string, string> }> => {
    try {
        const result = await dynamodb.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: { ":pk": "MAGAZINE" },
            }),
        );

        const items = (result.Items ?? []) as MagazineEntity[];

        const magazines: MagazineListItem[] = items
            .filter((m) => m.status === "published")
            .map((m) => ({
                slug: m.slug,
                name: m.name,
                period: m.period,
                volume: m.volume,
                status: m.status,
                thumbnail_url: `https://${MAGAZINES_CLOUDFRONT_DOMAIN}/${m.slug}/${m.thumbnail_key}`,
                ts: m.ts,
            }))
            .sort((a, b) => b.ts - a.ts);

        const response: ListMagazinesResponse = { magazines };

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: COMMON_HEADERS,
        };
    } catch (error) {
        console.error("Error listing magazines:", error);
        return CommonErrors.internalServerError();
    }
};
