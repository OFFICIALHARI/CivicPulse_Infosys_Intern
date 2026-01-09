#!/bin/bash

# CivicPulse Backend Run Script

echo "🚀 Starting CivicPulse Backend..."
echo ""

# Check if JAR exists
JAR_FILE="target/civicpulse-backend-1.0.0.jar"

if [ ! -f "$JAR_FILE" ]; then
    echo "❌ JAR file not found: $JAR_FILE"
    echo ""
    echo "Please build the project first:"
    echo "  ./build.sh"
    echo ""
    echo "Or if Maven is installed:"
    echo "  mvn clean install"
    exit 1
fi

echo "✅ Found JAR file"
echo "📍 Starting server on http://localhost:8080/api"
echo "📊 H2 Console: http://localhost:8080/api/h2-console"
echo ""

# Run the application
java -jar "$JAR_FILE"
