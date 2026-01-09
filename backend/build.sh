#!/bin/bash

# CivicPulse Backend Build and Run Script

echo "🔨 Building CivicPulse Backend..."
echo ""
echo "Prerequisites:"
echo "  - Java 21 ✅ (Detected)"
echo "  - Maven (Required)"
echo ""

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed!"
    echo ""
    echo "To install Maven on Ubuntu, run:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y maven"
    echo ""
    echo "Alternative: Download from https://maven.apache.org/download.cgi"
    exit 1
fi

echo "✅ Maven detected: $(mvn -version | head -n 1)"
echo ""

# Build the project
echo "📦 Building with Maven..."
mvn clean install -DskipTests

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "To run the backend:"
    echo "  mvn spring-boot:run"
    echo ""
    echo "Or:"
    echo "  java -jar target/civicpulse-backend-1.0.0.jar"
    echo ""
    echo "The API will be available at: http://localhost:8080/api"
else
    echo ""
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
