import { ResendConfirmationCodeCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, USER_POOL_CLIENT_ID } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';


export const handler = async (event: ApiGatewayEvent) => {
    try {
        const body = JSON.parse(event.body || '{}');

        // 1) Validate email
        if (!body.email) {
            return CommonErrors.badRequest('Email is required');
        }

        const email = body.email.trim();

        // Validate email format (basic check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return CommonErrors.badRequest('Invalid email format');
        }

        // 2) Invoke Cognito to resend confirmation code
        try {
            const result = await cognitoClient.send(new ResendConfirmationCodeCommand({
                ClientId: USER_POOL_CLIENT_ID,
                Username: email // In Cognito, username is the email
            }));

            // 3) Extract delivery details
            const deliveryDetails = result.CodeDeliveryDetails;

            // 4) Return success
            return {
                statusCode: HTTP_STATUS.OK,
                body: JSON.stringify({
                    message: 'Verification email has been resent successfully',
                    delivery_medium: deliveryDetails?.DeliveryMedium || 'EMAIL',
                    destination: deliveryDetails?.Destination || email
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                }
            };

        } catch (error: any) {
            console.error('Cognito ResendConfirmationCode error:', error);

            // Handle specific Cognito errors
            if (error.name === 'UserNotFoundException') {
                return CommonErrors.notFound('User not found. Please register first.');
            }

            if (error.name === 'InvalidParameterException') {
                return CommonErrors.badRequest('User is already confirmed or invalid parameter');
            }

            if (error.name === 'LimitExceededException') {
                return CommonErrors.badRequest('Too many requests. Please try again later.');
            }

            if (error.name === 'CodeDeliveryFailureException') {
                return CommonErrors.internalServerError('Failed to deliver verification code. Please try again later.');
            }

            // Generic error
            throw error;
        }

    } catch (error: any) {
        console.error('Error resending verification email:', error);
        return CommonErrors.internalServerError('Failed to resend verification email');
    }
};
