#!/bin/bash

# LocalStack Docker Startup Script
# This script starts LocalStack for testing

echo "🚀 Starting LocalStack Docker container..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    echo "💡 Please start Docker first"
    exit 1
fi

# Check if LocalStack is already running
if curl -s http://localhost:4566 > /dev/null 2>&1; then
    echo "✅ LocalStack is already running on http://localhost:4566"
    echo "💡 You can now run tests with:"
    echo "   cd backend/backend-test"
    echo "   TEST_MODE=local node test-register.ts"
    echo "   TEST_MODE=local node test-user.ts"
    exit 0
fi

# Start LocalStack container
echo "📦 Starting LocalStack container..."
docker run --rm -d \
    --name localstack \
    -p 4566:4566 \
    -p 4510-4559:4510-4559 \
    -e SERVICES=dynamodb,cognito-idp \
    -e DEBUG=1 \
    -e DOCKER_HOST=unix:///var/run/docker.sock \
    localstack/localstack:latest

# Wait for LocalStack to be ready
echo "⏳ Waiting for LocalStack to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:4566 > /dev/null 2>&1; then
        echo "✅ LocalStack is ready!"
        echo ""
        echo "🎉 LocalStack started successfully!"
        echo "📍 Endpoint: http://localhost:4566"
        echo "📍 Region: us-east-1"
        echo ""
        echo "💡 You can now run tests with:"
        echo "   cd backend/backend-test"
        echo "   TEST_MODE=local node test-register.ts"
        echo "   TEST_MODE=local node test-user.ts"
        echo ""
        echo "🔧 To stop LocalStack:"
        echo "   docker stop localstack"
        exit 0
    fi
    echo "   Waiting... (${i}/30)"
    sleep 2
done

echo "❌ LocalStack failed to start within 60 seconds"
echo "💡 Check Docker logs: docker logs localstack"
exit 1

