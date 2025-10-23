import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { SQSEvent } from 'aws-lambda';
import { s3Client, dynamodb, sesClient, TABLE_NAME, S3_BUCKET_NAME } from '../../config/aws-clients';

/**
 * Cleanup Rejected Artwork Lambda
 *
 * This Lambda is triggered by SQS messages from rejectArtwork handler.
 * It performs async cleanup operations:
 * 1. Delete S3 files (original, thumb, medium, large)
 * 2. Delete Art_Ptr entity from DynamoDB
 * 3. Send rejection email via SES
 * 4. Optionally delete ART entity (hard delete)
 *
 * SQS Message Format:
 * {
 *   art_id: string,
 *   user_id: string,
 *   season: string,
 *   email: string,
 *   contributor_id: string,
 *   reason: string,
 *   timestamp: number
 * }
 */

interface CleanupMessage {
    art_id: string;
    user_id: string;
    season: string;
    email: string;
    contributor_id: string;
    reason: string;
    timestamp: number;
}

export const handler = async (event: SQSEvent): Promise<void> => {
    console.log('Cleanup Lambda triggered with', event.Records.length, 'messages');

    // Process each SQS message
    for (const record of event.Records) {
        try {
            const message: CleanupMessage = JSON.parse(record.body);
            console.log('Processing cleanup for art_id:', message.art_id);

            await cleanupArtwork(message);

            console.log('Successfully cleaned up artwork:', message.art_id);
        } catch (error) {
            console.error('Error processing cleanup message:', error);
            // SQS will retry the message based on DLQ configuration
            throw error;
        }
    }
};

async function cleanupArtwork(message: CleanupMessage): Promise<void> {
    const { art_id, user_id, season, email, contributor_id, reason } = message;

    // Track cleanup results
    const results = {
        s3_deleted: false,
        art_ptr_deleted: false,
        email_sent: false
    };

    // 1) Delete S3 files (4 prefixes: original, thumb, medium, large)
    try {
        const s3Prefix = `artworks/${season}/${user_id}`;
        const fileExtensions = ['', '_thumb', '_medium', '_large'];

        for (const ext of fileExtensions) {
            const key = `${s3Prefix}/${art_id}${ext}.PNG`;
            try {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: key
                }));
                console.log('Deleted S3 file:', key);
            } catch (s3Error: any) {
                // Continue even if file doesn't exist
                if (s3Error.name !== 'NoSuchKey') {
                    console.error('Error deleting S3 file:', key, s3Error);
                }
            }
        }

        results.s3_deleted = true;
    } catch (error) {
        console.error('Error in S3 deletion phase:', error);
        // Continue with other cleanup steps
    }

    // 2) Delete Art_Ptr entity
    try {
        // Extract season ID from season format (e.g., "SEASON#2024-spring" -> "2024-spring")
        const seasonId = season.startsWith('SEASON#') ? season.substring(7) : season;

        await dynamodb.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${user_id}`,
                SK: `ART#${seasonId}#ID#${art_id}`
            }
        }));

        console.log('Deleted Art_Ptr entity:', `USER#${user_id}`, `ART#${seasonId}#ID#${art_id}`);
        results.art_ptr_deleted = true;
    } catch (error) {
        console.error('Error deleting Art_Ptr:', error);
        // Continue with email notification
    }

    // 3) Send rejection email via SES
    if (email) {
        try {
            const emailParams = {
                Source: process.env.SES_FROM_EMAIL || 'noreply@icaf.org',
                Destination: {
                    ToAddresses: [email]
                },
                Message: {
                    Subject: {
                        Data: 'Your Artwork Submission Has Been Rejected',
                        Charset: 'UTF-8'
                    },
                    Body: {
                        Text: {
                            Data: `Dear User,

We regret to inform you that your artwork submission (ID: ${art_id}) has been rejected.

Reason: ${reason}

If you have any questions, please contact our support team.

Best regards,
ICAF Team`,
                            Charset: 'UTF-8'
                        },
                        Html: {
                            Data: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 10px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { padding: 10px; text-align: center; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Artwork Submission Rejected</h2>
        </div>
        <div class="content">
            <p>Dear User,</p>
            <p>We regret to inform you that your artwork submission has been rejected.</p>
            <p><strong>Artwork ID:</strong> ${art_id}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>If you have any questions or concerns, please contact our support team.</p>
            <p>Best regards,<br>ICAF Team</p>
        </div>
        <div class="footer">
            <p>&copy; International Child Art Foundation. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
                            Charset: 'UTF-8'
                        }
                    }
                }
            };

            await sesClient.send(new SendEmailCommand(emailParams));
            console.log('Sent rejection email to:', email);
            results.email_sent = true;
        } catch (emailError) {
            console.error('Error sending rejection email:', emailError);
            // Don't throw - email failure shouldn't block cleanup
        }
    } else {
        console.log('No email address provided, skipping email notification');
    }

    // 4) Optional: Delete ART entity (hard delete)
    // For now, we keep the soft-deleted ART entity for audit purposes
    // If hard delete is needed, uncomment:
    /*
    try {
        await dynamodb.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `ART#${art_id}`,
                SK: 'N/A'
            }
        }));
        console.log('Hard deleted ART entity:', art_id);
    } catch (error) {
        console.error('Error hard deleting ART entity:', error);
    }
    */

    console.log('Cleanup results:', results);
}
