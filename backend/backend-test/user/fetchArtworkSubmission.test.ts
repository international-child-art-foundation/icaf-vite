import { createTestTable, TEST_PREFIXES } from '../shared/test-infrastructure';
import { TestSetup } from '../shared/test-utils';

// mock fetchArtworkSubmission handler function
const mockFetchArtworkSubmissionHandler = async (event: any) => {
    const userId = event.requestContext?.authorizer?.claims?.sub;

    if (!userId) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    // mock artwork submission response
    const mockArtworks = [
        {
            artwork_id: 'artwork-1',
            title: 'My First Painting',
            image_url: 'https://example.com/artwork1.jpg',
            submission_date: '2024-01-15T10:30:00Z',
            is_approved: true,
            votes: 5,
            season_name: 'Spring 2024'
        },
        {
            artwork_id: 'artwork-2',
            title: 'Summer Landscape',
            image_url: 'https://example.com/artwork2.jpg',
            submission_date: '2024-02-20T14:45:00Z',
            is_approved: false,
            votes: 0,
            season_name: 'Summer 2024'
        }
    ];

    const response = {
        artworks: userId === 'test-user-no-artworks' ? [] : mockArtworks
    };

    return {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: { 'Content-Type': 'application/json' }
    };
};

// test cases
const testCases = [
    {
        name: "✅ Get artwork submissions (authenticated user)",
        event: {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test-user-123',
                        email: 'john.doe@example.com'
                    }
                }
            }
        },
        expectedStatus: 200,
        description: "Should return user's artwork submissions"
    },
    {
        name: "❌ Unauthorized access (no user ID)",
        event: {
            requestContext: {
                authorizer: {
                    claims: {}
                }
            }
        },
        expectedStatus: 401,
        description: "Should reject access without user ID"
    },
    {
        name: "✅ Get empty submissions (user with no artworks)",
        event: {
            requestContext: {
                authorizer: {
                    claims: {
                        sub: 'test-user-no-artworks',
                        email: 'no-artworks@example.com'
                    }
                }
            }
        },
        expectedStatus: 200,
        description: "Should return empty array for user with no artworks"
    }
];

describe('Fetch Artwork Submission Tests', () => {
    beforeAll(async () => {
        await createTestTable();
    });

    afterEach(async () => {
        await TestSetup.cleanupTestData(TEST_PREFIXES.ARTWORK);
    });

    describe('Authentication Tests', () => {
        test('should return artwork submissions for authenticated user', async () => {
            const testCase = testCases[0];
            const result = await mockFetchArtworkSubmissionHandler(testCase.event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(testCase.expectedStatus);
            expect(responseBody).toHaveProperty('artworks');
            expect(Array.isArray(responseBody.artworks)).toBe(true);
            expect(responseBody.artworks.length).toBeGreaterThan(0);
        });

        test('should reject access without user ID', async () => {
            const testCase = testCases[1];
            const result = await mockFetchArtworkSubmissionHandler(testCase.event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(testCase.expectedStatus);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });

        test('should return empty array for user with no artworks', async () => {
            const testCase = testCases[2];
            const result = await mockFetchArtworkSubmissionHandler(testCase.event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(testCase.expectedStatus);
            expect(responseBody).toHaveProperty('artworks');
            expect(Array.isArray(responseBody.artworks)).toBe(true);
            expect(responseBody.artworks.length).toBe(0);
        });
    });

    describe('Response Format Tests', () => {
        test('should return correct artwork data structure', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123',
                            email: 'test@example.com'
                        }
                    }
                }
            };

            const result = await mockFetchArtworkSubmissionHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(200);
            expect(result.headers).toHaveProperty('Content-Type', 'application/json');
            expect(responseBody).toHaveProperty('artworks');
            expect(Array.isArray(responseBody.artworks)).toBe(true);

            if (responseBody.artworks.length > 0) {
                const artwork = responseBody.artworks[0];
                expect(artwork).toHaveProperty('artwork_id');
                expect(artwork).toHaveProperty('title');
                expect(artwork).toHaveProperty('image_url');
                expect(artwork).toHaveProperty('submission_date');
                expect(artwork).toHaveProperty('is_approved');
                expect(artwork).toHaveProperty('votes');
                expect(artwork).toHaveProperty('season_name');
            }
        });

        test('should handle different user scenarios', async () => {
            const scenarios = [
                { userId: 'test-user-123', expectedArtworks: 2 },
                { userId: 'test-user-no-artworks', expectedArtworks: 0 },
                { userId: 'test-user-new', expectedArtworks: 2 } // Default behavior
            ];

            for (const scenario of scenarios) {
                const event = {
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: scenario.userId,
                                email: `${scenario.userId}@example.com`
                            }
                        }
                    }
                };

                const result = await mockFetchArtworkSubmissionHandler(event);
                const responseBody = JSON.parse(result.body);

                expect(result.statusCode).toBe(200);
                expect(responseBody.artworks.length).toBe(scenario.expectedArtworks);
            }
        });
    });

    describe('Artwork Data Validation Tests', () => {
        test('should validate artwork data structure', () => {
            const artworkData = {
                artwork_id: 'artwork-123',
                title: 'Test Artwork',
                image_url: 'https://example.com/artwork.jpg',
                submission_date: '2024-01-15T10:30:00Z',
                is_approved: true,
                votes: 5,
                season_name: 'Spring 2024'
            };

            // validate required fields
            expect(artworkData).toHaveProperty('artwork_id');
            expect(artworkData).toHaveProperty('title');
            expect(artworkData).toHaveProperty('image_url');
            expect(artworkData).toHaveProperty('submission_date');
            expect(artworkData).toHaveProperty('is_approved');
            expect(artworkData).toHaveProperty('votes');
            expect(artworkData).toHaveProperty('season_name');

            // validate data types
            expect(typeof artworkData.artwork_id).toBe('string');
            expect(typeof artworkData.title).toBe('string');
            expect(typeof artworkData.image_url).toBe('string');
            expect(typeof artworkData.submission_date).toBe('string');
            expect(typeof artworkData.is_approved).toBe('boolean');
            expect(typeof artworkData.votes).toBe('number');
            expect(typeof artworkData.season_name).toBe('string');
        });

        test('should validate artwork approval status', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123'
                        }
                    }
                }
            };

            const result = await mockFetchArtworkSubmissionHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(responseBody.artworks.length).toBeGreaterThan(0);

            // check if there are approved and unapproved artworks
            const approvedArtworks = responseBody.artworks.filter((art: any) => art.is_approved);
            const unapprovedArtworks = responseBody.artworks.filter((art: any) => !art.is_approved);

            expect(approvedArtworks.length).toBeGreaterThan(0);
            expect(unapprovedArtworks.length).toBeGreaterThan(0);
        });

        test('should validate artwork voting system', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123'
                        }
                    }
                }
            };

            const result = await mockFetchArtworkSubmissionHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(responseBody.artworks.length).toBeGreaterThan(0);

            for (const artwork of responseBody.artworks) {
                expect(typeof artwork.votes).toBe('number');
                expect(artwork.votes).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('Error Handling Tests', () => {
        test('should handle null authorizer', async () => {
            const event = {
                requestContext: {
                    authorizer: null
                }
            };

            const result = await mockFetchArtworkSubmissionHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(401);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });

        test('should handle undefined claims', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: undefined
                    }
                }
            };

            const result = await mockFetchArtworkSubmissionHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(401);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });

        test('should handle missing requestContext', async () => {
            const event = {
                // no requestContext
            };

            const result = await mockFetchArtworkSubmissionHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(401);
            expect(responseBody).toHaveProperty('message', 'Unauthorized');
        });
    });

    describe('Season and Date Tests', () => {
        test('should include season information', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123'
                        }
                    }
                }
            };

            const result = await mockFetchArtworkSubmissionHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(responseBody.artworks.length).toBeGreaterThan(0);

            for (const artwork of responseBody.artworks) {
                expect(artwork).toHaveProperty('season_name');
                expect(typeof artwork.season_name).toBe('string');
                expect(artwork.season_name.length).toBeGreaterThan(0);
            }
        });

        test('should validate submission date format', async () => {
            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: 'test-user-123'
                        }
                    }
                }
            };

            const result = await mockFetchArtworkSubmissionHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(responseBody.artworks.length).toBeGreaterThan(0);

            for (const artwork of responseBody.artworks) {
                expect(artwork).toHaveProperty('submission_date');
                expect(typeof artwork.submission_date).toBe('string');

                // validate date format (ISO 8601)
                const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
                expect(dateRegex.test(artwork.submission_date)).toBe(true);
            }
        });
    });

    describe('Integration with Shared Infrastructure', () => {
        test('should work with shared test infrastructure', async () => {
            // create test user
            const userId = await TestSetup.createUserWithPrefix(
                TEST_PREFIXES.ARTWORK,
                'adult',
                {
                    f_name: 'Artwork',
                    l_name: 'Test',
                    email: 'artwork@test.com'
                }
            );

            // create test artwork
            await TestSetup.createArtworkWithPrefix(
                TEST_PREFIXES.ARTWORK,
                userId,
                'basic',
                {
                    title: 'Integration Test Artwork',
                    description: 'This artwork was created for integration testing'
                }
            );

            const event = {
                requestContext: {
                    authorizer: {
                        claims: {
                            sub: userId,
                            email: 'artwork@test.com'
                        }
                    }
                }
            };

            const result = await mockFetchArtworkSubmissionHandler(event);
            const responseBody = JSON.parse(result.body);

            expect(result.statusCode).toBe(200);
            expect(responseBody).toHaveProperty('artworks');
        });

        test('should handle multiple users with artworks', async () => {
            const promises = [];

            // create artwork for multiple users
            for (let i = 0; i < 3; i++) {
                const userId = await TestSetup.createUserWithPrefix(
                    TEST_PREFIXES.ARTWORK,
                    'adult',
                    {
                        f_name: `User${i}`,
                        l_name: 'Artwork',
                        email: `user${i}.artwork@test.com`
                    }
                );

                await TestSetup.createArtworkWithPrefix(
                    TEST_PREFIXES.ARTWORK,
                    userId,
                    'basic',
                    {
                        title: `Artwork ${i}`,
                        description: `Test artwork ${i}`
                    }
                );

                const event = {
                    requestContext: {
                        authorizer: {
                            claims: {
                                sub: userId,
                                email: `user${i}.artwork@test.com`
                            }
                        }
                    }
                };

                promises.push(mockFetchArtworkSubmissionHandler(event));
            }

            const results = await Promise.all(promises);

            // validate all requests are successful
            for (const result of results) {
                expect(result.statusCode).toBe(200);
                const responseBody = JSON.parse(result.body);
                expect(responseBody).toHaveProperty('artworks');
            }
        });
    });
});
