import { Readable } from "stream";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { S3Event } from "aws-lambda";
import { zipSync } from "fflate";

vi.hoisted(() => {
    process.env.AWS_REGION = "us-east-1";
    process.env.MAGAZINES_BUCKET_NAME = "magazines-bucket";
    process.env.MAGAZINES_CLOUDFRONT_DISTRIBUTION_ID = "distribution-1";
    process.env.TABLE_NAME = "icaf-table";
});

const s3Send = vi.spyOn(S3Client.prototype, "send");
const cloudfrontSend = vi.spyOn(CloudFrontClient.prototype, "send");
const dynamoSend = vi.spyOn(DynamoDBDocumentClient.prototype, "send");

let handler: typeof import("./processZip").handler;

beforeAll(async () => {
    ({ handler } = await import("./processZip"));
});

function directS3Event(key: string): S3Event {
    return {
        Records: [
            {
                s3: {
                    bucket: { name: "magazines-bucket" },
                    object: { key },
                },
            },
        ],
    } as S3Event;
}

function commandInput(command: unknown): Record<string, unknown> {
    return (command as { input: Record<string, unknown> }).input;
}

describe("processZip", () => {
    const putInputs: Record<string, unknown>[] = [];
    const deleteInputs: Record<string, unknown>[] = [];

    beforeEach(() => {
        putInputs.length = 0;
        deleteInputs.length = 0;

        const zipBytes = zipSync({
            "cover.webp": new Uint8Array([1, 2, 3]),
            "issue.pdf": new TextEncoder().encode("%PDF-1.7\n"),
        });

        s3Send.mockImplementation(async (command) => {
            const input = commandInput(command);

            if (command instanceof GetObjectCommand) {
                return { Body: Readable.from([Buffer.from(zipBytes)]) };
            }

            if (command instanceof ListObjectsV2Command) {
                return { Contents: [], IsTruncated: false };
            }

            if (command instanceof PutObjectCommand) {
                putInputs.push(input);
                return {};
            }

            if (command instanceof DeleteObjectsCommand || command instanceof DeleteObjectCommand) {
                deleteInputs.push(input);
                return {};
            }

            throw new Error(`Unexpected S3 command: ${command.constructor.name}`);
        });

        cloudfrontSend.mockImplementation(async (command) => {
            if (command instanceof CreateInvalidationCommand) return {};
            throw new Error(`Unexpected CloudFront command: ${command.constructor.name}`);
        });

        dynamoSend.mockImplementation(async (command) => {
            if (command instanceof UpdateCommand) return {};
            throw new Error(`Unexpected DynamoDB command: ${command.constructor.name}`);
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("processes a direct S3-created zip with a cover image and PDF-only issue", async () => {
        await handler(directS3Event("staging/PdfIssue.zip"));

        expect(putInputs).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    Bucket: "magazines-bucket",
                    Key: "PdfIssue/cover.webp",
                    ContentType: "image/webp",
                }),
                expect.objectContaining({
                    Bucket: "magazines-bucket",
                    Key: "PdfIssue/issue.pdf",
                    ContentType: "application/pdf",
                }),
                expect.objectContaining({
                    Bucket: "magazines-bucket",
                    Key: "PdfIssue/index.html",
                    ContentType: "text/html",
                }),
            ]),
        );

        const indexUpload = putInputs.find((input) => input.Key === "PdfIssue/index.html");
        const indexBody = indexUpload?.Body;
        expect(Buffer.isBuffer(indexBody)).toBe(true);
        const indexHtml = (indexBody as Buffer).toString();
        expect(indexHtml).toContain('<iframe src="issue.pdf"');
        expect(indexHtml).toContain('href="issue.pdf"');

        expect(dynamoSend).toHaveBeenCalledWith(
            expect.objectContaining({
                input: expect.objectContaining({
                    TableName: "icaf-table",
                    Key: { PK: "MAGAZINE", SK: "PdfIssue" },
                    ExpressionAttributeValues: {
                        ":status": "unpublished",
                        ":thumb": "cover.webp",
                    },
                }),
            }),
        );
        expect(deleteInputs).toContainEqual({
            Bucket: "magazines-bucket",
            Key: "staging/PdfIssue.zip",
        });
    });
});
