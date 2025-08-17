/**
 * simple test helpers
 * 
 * provide simple tool functions to:
 * 1. create temporary test data (if needed)
 * 2. generate test events
 * 3. cleanup temporary data
 */

import { PutCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TEST_CONFIG, PRESET_TEST_DATA } from './simple-preset-db';

// test data generator
export class TestDataGenerator {
    private static counter = 0;

    static generateId(prefix: string = 'TEST'): string {
        return `${prefix}_${++this.counter}_${Date.now()}`;
    }

    static generateUserId(prefix: string = 'TEST_USER'): string {
        return this.generateId(prefix);
    }

    static generateArtworkId(prefix: string = 'TEST_ART'): string {
        return this.generateId(prefix);
    }
}

// temporary test data creator (for tests that need special data)
export class TempTestData {
    /**
     * create temporary user (will be cleaned up after test)
     */
    static async createTempUser(prefix: string, userData: any = {}): Promise<string> {
        const userId = TestDataGenerator.generateUserId(prefix);

        await docClient.send(new PutCommand({
            TableName: TEST_CONFIG.tableName,
            Item: {
                PK: `USER#${userId}`,
                SK: 'PROFILE',
                user_id: userId,
                f_name: 'Temp',
                l_name: 'User',
                dob: '2000-01-01',
                role: 'user',
                timestamp: new Date().toISOString(),
                type: 'USER',
                ...userData
            }
        }));

        return userId;
    }

    /**
     * create temporary artwork
     */
    static async createTempArtwork(prefix: string, userId: string, artworkData: any = {}): Promise<string> {
        const artworkId = TestDataGenerator.generateArtworkId(prefix);

        await docClient.send(new PutCommand({
            TableName: TEST_CONFIG.tableName,
            Item: {
                PK: `ART#${artworkId}`,
                SK: 'N/A',
                art_id: artworkId,
                user_id: userId,
                title: 'Temp Artwork',
                season: PRESET_TEST_DATA.seasons.CURRENT_SEASON,
                votes: 0,
                is_approved: false,
                timestamp: new Date().toISOString(),
                type: 'ART',
                ...artworkData
            }
        }));

        return artworkId;
    }

    /**
     * cleanup temporary data with specified prefix
     */
    static async cleanup(prefix: string): Promise<void> {
        const result = await docClient.send(new ScanCommand({
            TableName: TEST_CONFIG.tableName,
            FilterExpression: 'begins_with(PK, :prefix)',
            ExpressionAttributeValues: {
                ':prefix': prefix
            }
        }));

        if (result.Items && result.Items.length > 0) {
            const deletePromises = result.Items.map(item =>
                docClient.send(new DeleteCommand({
                    TableName: TEST_CONFIG.tableName,
                    Key: {
                        PK: item.PK,
                        SK: item.SK
                    }
                }))
            );

            await Promise.all(deletePromises);
            console.log(`🧹 Cleaned up ${result.Items.length} temp items with prefix: ${prefix}`);
        }
    }
}

// test event generator
export class TestEventGenerator {
    /**
     * generate authenticated event
     */
    static createAuthEvent(userId: string, userInfo: any = {}): any {
        return {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: userId,
                        email: userInfo.email || 'test@example.com',
                        given_name: userInfo.f_name || 'Test',
                        family_name: userInfo.l_name || 'User',
                        ...userInfo
                    }
                }
            }
        };
    }

    /**
     * generate unauthenticated event
     */
    static createUnauthEvent(): any {
        return {
            requestContext: {}
        };
    }

    /**
     * generate POST event with body
     */
    static createPostEvent(userId: string, body: any, userInfo: any = {}): any {
        return {
            ...this.createAuthEvent(userId, userInfo),
            body: JSON.stringify(body),
            httpMethod: 'POST'
        };
    }

    /**
     * generate GET event with query parameters
     */
    static createGetEvent(userId: string, queryParams: any = {}, userInfo: any = {}): any {
        return {
            ...this.createAuthEvent(userId, userInfo),
            queryStringParameters: queryParams,
            httpMethod: 'GET'
        };
    }
}

// common preset events (use preset users directly)
export const PresetEvents = {
    // child user event
    childUser: () => TestEventGenerator.createAuthEvent(
        PRESET_TEST_DATA.users.CHILD_USER,
        { f_name: 'Alice', l_name: 'Young', email: 'alice@example.com' }
    ),

    // adult user event
    adultUser: () => TestEventGenerator.createAuthEvent(
        PRESET_TEST_DATA.users.ADULT_USER,
        { f_name: 'Bob', l_name: 'Smith', email: 'bob@example.com' }
    ),

    // guardian event
    guardianUser: () => TestEventGenerator.createAuthEvent(
        PRESET_TEST_DATA.users.GUARDIAN_USER,
        { f_name: 'Carol', l_name: 'Johnson', email: 'carol@example.com' }
    ),

    // admin event
    adminUser: () => TestEventGenerator.createAuthEvent(
        PRESET_TEST_DATA.users.ADMIN_USER,
        { f_name: 'David', l_name: 'Wilson', email: 'admin@icaf.org' }
    ),

    // unauthenticated event
    unauthenticated: () => TestEventGenerator.createUnauthEvent(),

    // POST event generator
    childPost: (body: any) => TestEventGenerator.createPostEvent(
        PRESET_TEST_DATA.users.CHILD_USER,
        body,
        { f_name: 'Alice', l_name: 'Young' }
    ),

    adultPost: (body: any) => TestEventGenerator.createPostEvent(
        PRESET_TEST_DATA.users.ADULT_USER,
        body,
        { f_name: 'Bob', l_name: 'Smith' }
    ),

    guardianPost: (body: any) => TestEventGenerator.createPostEvent(
        PRESET_TEST_DATA.users.GUARDIAN_USER,
        body,
        { f_name: 'Carol', l_name: 'Johnson' }
    ),

    adminPost: (body: any) => TestEventGenerator.createPostEvent(
        PRESET_TEST_DATA.users.ADMIN_USER,
        body,
        { f_name: 'David', l_name: 'Wilson' }
    )
};

// assertion helper functions
export class TestAssertions {
    /**
     * validate Lambda response format
     */
    static validateLambdaResponse(response: any): void {
        expect(response).toHaveProperty('statusCode');
        expect(response).toHaveProperty('body');
        expect(response).toHaveProperty('headers');
    }

    /**
     * validate success response
     */
    static validateSuccessResponse(response: any, expectedStatusCode: number = 200): void {
        this.validateLambdaResponse(response);
        expect(response.statusCode).toBe(expectedStatusCode);

        const body = JSON.parse(response.body);
        expect(body).not.toHaveProperty('error');
    }

    /**
     * validate error response
     */
    static validateErrorResponse(response: any, expectedStatusCode: number): void {
        this.validateLambdaResponse(response);
        expect(response.statusCode).toBe(expectedStatusCode);

        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('error');
    }

    /**
     * validate user data structure
     */
    static validateUserData(userData: any): void {
        expect(userData).toHaveProperty('user_id');
        expect(userData).toHaveProperty('f_name');
        expect(userData).toHaveProperty('l_name');
        expect(userData).toHaveProperty('role');
        expect(userData).toHaveProperty('timestamp');
    }

    /**
     * validate artwork data structure
     */
    static validateArtworkData(artworkData: any): void {
        expect(artworkData).toHaveProperty('art_id');
        expect(artworkData).toHaveProperty('user_id');
        expect(artworkData).toHaveProperty('title');
        expect(artworkData).toHaveProperty('season');
        expect(artworkData).toHaveProperty('timestamp');
    }
}

// export preset data ID for testing directly
export { PRESET_TEST_DATA };
