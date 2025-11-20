import { ConfirmForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, USER_POOL_CLIENT_ID } from '../../config/aws-clients';
import { ApiGatewayEvent, ApiGatewayResponse, HTTP_STATUS } from '../../../shared/src/api-types/commonTypes';
import { CommonErrors } from '../../../shared/src/api-types/errorTypes';

/**
 * Confirm Forgot Password Handler
 *
 * Completes password reset flow by:
 * 1. Validating email, code, and new password
 * 2. Calling Cognito ConfirmForgotPassword with the verification code
 * 3. Setting the new password
 *
 * User must provide the 6-digit code received via email
 */

export const handler = async (event: ApiGatewayEvent): Promise<ApiGatewayResponse> => {
    try {
        const body = JSON.parse(event.body || '{}');

        // 1) Validate required fields
        if (!body.email) {
            return CommonErrors.badRequest('Email is required');
        }

        if (!body.code) {
            return CommonErrors.badRequest('Verification code is required');
        }

        if (!body.new_password) {
            return CommonErrors.badRequest('New password is required');
        }

        const email = body.email.trim();
        const code = body.code.trim();
        const newPassword = body.new_password;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return CommonErrors.badRequest('Invalid email format');
        }

        // Validate password strength (at least 8 characters)
        if (newPassword.length < 8) {
            return CommonErrors.badRequest('Password must be at least 8 characters long');
        }

        // Validate code format (should be 6 digits)
        if (!/^\d{6}$/.test(code)) {
            return CommonErrors.badRequest('Verification code must be 6 digits');
        }

        // 2) Invoke Cognito ConfirmForgotPassword
        try {
            await cognitoClient.send(new ConfirmForgotPasswordCommand({
                ClientId: USER_POOL_CLIENT_ID,
                Username: email,
                ConfirmationCode: code,
                Password: newPassword
            }));

            // 3) Return success
            return {
                statusCode: HTTP_STATUS.OK,
                body: JSON.stringify({
                    message: 'Password reset successfully'
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                }
            };

        } catch (error: any) {
            console.error('Cognito ConfirmForgotPassword error:', error);

            // Handle specific Cognito errors
            if (error.name === 'UserNotFoundException') {
                return CommonErrors.notFound('User not found. Please register first.');
            }

            if (error.name === 'CodeMismatchException') {
                return CommonErrors.badRequest('Invalid verification code. Please check and try again.');
            }

            if (error.name === 'ExpiredCodeException') {
                return CommonErrors.badRequest('Verification code has expired. Please request a new one.');
            }

            if (error.name === 'InvalidPasswordException') {
                return CommonErrors.badRequest('Password does not meet requirements. Must be at least 8 characters with uppercase, lowercase, number, and special character.');
            }

            if (error.name === 'InvalidParameterException') {
                return CommonErrors.badRequest('Invalid parameter provided');
            }

            if (error.name === 'LimitExceededException') {
                return CommonErrors.tooManyRequests('Too many attempts. Please try again later.');
            }

            if (error.name === 'TooManyFailedAttemptsException') {
                return CommonErrors.tooManyRequests('Too many failed attempts. Please try again later.');
            }

            // Generic error
            throw error;
        }

    } catch (error: any) {
        console.error('Error in confirm forgot password:', error);
        return CommonErrors.internalServerError('Failed to reset password');
    }
};
