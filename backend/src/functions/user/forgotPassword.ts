import { ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, USER_POOL_CLIENT_ID } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Forgot Password Handler
 *
 * Initiates password reset flow by:
 * 1. Validating email format
 * 2. Calling Cognito ForgotPassword to send reset code to user's email
 * 3. Returning confirmation with delivery details
 *
 * User will receive a 6-digit verification code via email
 */

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
    try {
        const body = JSON.parse(event.body || '{}');

        // 1) Validate email
        if (!body.email) {
            return CommonErrors.badRequest('Email is required');
        }

        const email = body.email.trim();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return CommonErrors.badRequest('Invalid email format');
        }

        // 2) Invoke Cognito ForgotPassword
        try {
            const result = await cognitoClient.send(new ForgotPasswordCommand({
                ClientId: USER_POOL_CLIENT_ID,
                Username: email
            }));

            // 3) Extract delivery details
            const deliveryDetails = result.CodeDeliveryDetails;

            // 4) Return success
            return {
                statusCode: HTTP_STATUS.OK,
                body: JSON.stringify({
                    message: 'Password reset code sent successfully',
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
            console.error('Cognito ForgotPassword error:', error);

            // Handle specific Cognito errors
            if (error.name === 'UserNotFoundException') {
                return CommonErrors.notFound('User not found. Please register first.');
            }

            if (error.name === 'InvalidParameterException') {
                return CommonErrors.badRequest('User account is not verified or invalid parameter');
            }

            if (error.name === 'LimitExceededException') {
                return CommonErrors.tooManyRequests('Too many requests. Please try again later.');
            }

            if (error.name === 'CodeDeliveryFailureException') {
                return CommonErrors.internalServerError('Failed to deliver reset code. Please try again later.');
            }

            // Generic error
            throw error;
        }

    } catch (error: any) {
        console.error('Error in forgot password:', error);
        return CommonErrors.internalServerError('Failed to initiate password reset');
    }
};
