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
    echo "   pnpm test"
    echo "   pnpm test user/test-register-migrated.test.ts"
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
        echo "🌱 Setting up preset test database..."
        
        # Setup the preset database
        if npx ts-node setup-test-db.ts; then
            echo "✅ Preset test database ready!"
        else
            echo "⚠️ Warning: Failed to setup preset database"
            echo "💡 You can manually setup later with: npx ts-node setup-test-db.ts"
        fi
        
        echo ""
        echo "💡 You can now run tests with:"
        echo "   cd backend/backend-test"
        echo "   pnpm test"
        echo "   pnpm test examples/preset-database-example.test.ts"
        echo ""
        echo "🔧 Database management:"
        echo "   npx ts-node setup-test-db.ts          # Seed database"
        echo "   npx ts-node setup-test-db.ts --clean   # Clean database" 
        echo "   npx ts-node setup-test-db.ts --reseed  # Reseed database"
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

