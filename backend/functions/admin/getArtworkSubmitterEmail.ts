import { AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { cognitoClient, dynamodb, USER_POOL_ID, TABLE_NAME } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';
import { GetArtworkSubmitterEmailResponse } from '../../../shared/src/api-types/userTypes';

export const handler = async (event: ApiGatewayEvent) => {
    try {
        // 1) Admin Authentication Check
        const adminUserId = event.requestContext?.authorizer?.claims?.sub;
        if (!adminUserId) {
            return CommonErrors.unauthorized();
        }

        // Check if user has admin role
        const adminResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `USER#${adminUserId}`,
                SK: 'PROFILE'
            }
        }));

        const adminUser = adminResult.Item;
        if (!adminUser || adminUser.role !== 'admin') {
            return CommonErrors.forbidden('Admin access required');
        }

        // 2) Get artwork ID from path parameters
        const artworkId = event.pathParameters?.art_id;
        if (!artworkId) {
            return CommonErrors.badRequest('Artwork ID is required in path');
        }

        // 3) Get artwork from DynamoDB
        const artworkResult = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: `ART#${artworkId}`,
                SK: 'N/A'
            }
        }));

        const artwork = artworkResult.Item;
        if (!artwork) {
            return CommonErrors.notFound(`Artwork '${artworkId}' not found`);
        }

        // 4) Extract user_id from artwork
        const userId = artwork.user_id;
        if (!userId) {
            return CommonErrors.internalServerError('Artwork record missing user_id field');
        }

        // 5) Get submitter information from Cognito
        let cognitoUser;
        try {
            const cognitoResult = await cognitoClient.send(new AdminGetUserCommand({
                UserPoolId: USER_POOL_ID,
                Username: userId
            }));
            cognitoUser = cognitoResult;
        } catch (error: any) {
            if (error.name === 'UserNotFoundException') {
                return CommonErrors.notFound(`Submitter '${userId}' not found in Cognito`);
            }
            throw error;
        }

        // 6) Extract user attributes from Cognito
        const userAttributes = cognitoUser.UserAttributes || [];
        const getAttributeValue = (name: string): string | undefined => {
            const attr = userAttributes.find(a => a.Name === name);
            return attr?.Value;
        };

        const email = getAttributeValue('email') || '';
        const emailVerified = getAttributeValue('email_verified') === 'true';
        const username = cognitoUser.Username || userId;

        // 7) Return success response
        const response: GetArtworkSubmitterEmailResponse = {
            art_id: artworkId,
            artwork_title: artwork.title || '',
            user_id: userId,
            email: email,
            email_verified: emailVerified,
            username: username
        };

        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify(response),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error in getArtworkSubmitterEmail handler:', error);

        return CommonErrors.internalServerError('Failed to get artwork submitter email');
    }
};
