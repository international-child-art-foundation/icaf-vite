import { ChangePasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from '../../config/aws-clients';
import { ApiGatewayEvent, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Change Password Handler
 *
 * This function allows authenticated users to change their password.
 * It uses Cognito's ChangePasswordCommand which requires:
 * - Valid access token (from user authentication)
 * - Previous password (for verification)
 * - New proposed password
 *
 * Workflow:
 * 1. Get access_token, old_password, new_password from request body
 * 2. Validate inputs
 * 3. Invoke Cognito ChangePasswordCommand
 * 4. Return success or error
 */

export const handler = async (event: ApiGatewayEvent) => {
    try {
        const body = JSON.parse(event.body || '{}');

        // 1) Validate required fields
        const { access_token, old_password, new_password } = body;

        if (!access_token) {
            return CommonErrors.badRequest('Access token is required');
        }

        if (!old_password) {
            return CommonErrors.badRequest('Current password is required');
        }

        if (!new_password) {
            return CommonErrors.badRequest('New password is required');
        }

        // 2) Validate new password strength
        if (new_password.length < 8) {
            return CommonErrors.badRequest('New password must be at least 8 characters long');
        }

        // 3) Check that new password is different from old password
        if (old_password === new_password) {
            return CommonErrors.badRequest('New password must be different from current password');
        }

        // 4) Invoke Cognito ChangePassword
        try {
            await cognitoClient.send(new ChangePasswordCommand({
                AccessToken: access_token,
                PreviousPassword: old_password,
                ProposedPassword: new_password
            }));
        } catch (error: any) {
            console.error('Cognito ChangePassword error:', error);

            // Handle specific Cognito errors
            if (error.name === 'NotAuthorizedException') {
                return CommonErrors.unauthorized();
            }

            if (error.name === 'InvalidPasswordException') {
                return CommonErrors.badRequest('New password does not meet password policy requirements');
            }

            if (error.name === 'LimitExceededException') {
                return CommonErrors.badRequest('Too many password change attempts. Please try again later.');
            }

            // Generic error
            throw error;
        }

        // 5) Return success
        return {
            statusCode: HTTP_STATUS.OK,
            body: JSON.stringify({
                message: 'Password changed successfully'
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            }
        };

    } catch (error: any) {
        console.error('Error changing password:', error);
        return CommonErrors.internalServerError('Failed to change password');
    }
};
