import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
    CloudFrontClient,
    CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    ListObjectsV2Command,
    S3Client,
} from "@aws-sdk/client-s3";
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
} from "@aws-sdk/lib-dynamodb";

vi.hoisted(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.TABLE_NAME = "icaf-table";
    process.env.MAGAZINES_BUCKET_NAME = "magazines-bucket";
    process.env.MAGAZINES_CLOUDFRONT_DISTRIBUTION_ID = "distribution-1";
});

vi.mock("../../utils/auth", () => ({
    getCurrentUser: vi.fn(async () => ({
        ok: true,
        user: {
            user_id: "00000000-0000-4000-8000-000000000001",
            email: "admin@example.com",
            role: "admin",
            banned: false,
        },
    })),
}));

const s3Send = vi.spyOn(S3Client.prototype, "send");
const dynamoSend = vi.spyOn(DynamoDBDocumentClient.prototype, "send");
const cloudfrontSend = vi.spyOn(CloudFrontClient.prototype, "send");

let handler: typeof import("./deleteMagazine").handler;

function event(slug: string) {
    return {
        httpMethod: "DELETE",
        pathParameters: { slug },
        headers: {},
    };
}

describe("deleteMagazine", () => {
    beforeAll(async () => {
        ({ handler } = await import("./deleteMagazine"));
    });

    beforeEach(() => {
        vi.clearAllMocks();

        s3Send.mockImplementation(async (command) => {
            if (command instanceof ListObjectsV2Command) {
                return {
                    Contents: [
                        { Key: "Happiness/index.html" },
                        { Key: "Happiness/cover.webp" },
                    ],
                    IsTruncated: false,
                };
            }
            if (
                command instanceof DeleteObjectsCommand ||
                command instanceof DeleteObjectCommand
            ) {
                return {};
            }

            throw new Error(`Unexpected S3 command: ${command.constructor.name}`);
        });

        dynamoSend.mockImplementation(async (command) => {
            if (command instanceof GetCommand) {
                return {
                    Item: {
                        PK: "MAGAZINE",
                        SK: "Happiness",
                        slug: "Happiness",
                    },
                };
            }
            if (command instanceof DeleteCommand) return {};

            throw new Error(`Unexpected DynamoDB command: ${command.constructor.name}`);
        });

        cloudfrontSend.mockImplementation(async (command) => {
            if (command instanceof CreateInvalidationCommand) return {};
            throw new Error(`Unexpected CloudFront command: ${command.constructor.name}`);
        });
    });

    it("deletes published files, the staging zip, the record, and CDN cache paths", async () => {
        const response = await handler(event("Happiness"));

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            success: true,
            slug: "Happiness",
        });

        expect(s3Send).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.objectContaining({
                    Bucket: "magazines-bucket",
                    Prefix: "Happiness/",
                }),
            }),
        );
        expect(s3Send).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.objectContaining({
                    Bucket: "magazines-bucket",
                    Delete: {
                        Objects: [
                            { Key: "Happiness/index.html" },
                            { Key: "Happiness/cover.webp" },
                        ],
                        Quiet: true,
                    },
                }),
            }),
        );
        expect(s3Send).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.objectContaining({
                    Bucket: "magazines-bucket",
                    Key: "staging/Happiness.zip",
                }),
            }),
        );
        expect(dynamoSend).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.objectContaining({
                    TableName: "icaf-table",
                    Key: { PK: "MAGAZINE", SK: "Happiness" },
                }),
            }),
        );
        expect(cloudfrontSend).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.objectContaining({
                    DistributionId: "distribution-1",
                    InvalidationBatch: expect.objectContaining({
                        Paths: {
                            Quantity: 2,
                            Items: ["/Happiness", "/Happiness/*"],
                        },
                    }),
                }),
            }),
        );
    });
});
