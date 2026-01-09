#!/bin/bash

# CivicPulse Full Stack Quick Start Script

echo "╔════════════════════════════════════════════════╗"
echo "║      🏙️  CivicPulse Quick Start Guide          ║"
echo "║   Smart City Grievance Management System      ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Java
echo -e "${BLUE}📋 System Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    echo -e "✅ Java: ${GREEN}$JAVA_VERSION${NC}"
else
    echo -e "❌ Java: ${RED}Not found${NC}"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "✅ Node.js: ${GREEN}$NODE_VERSION${NC}"
else
    echo -e "❌ Node.js: ${RED}Not found${NC}"
    exit 1
fi

# Check Maven
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn -version | head -n 1 | cut -d' ' -f3)
    echo -e "✅ Maven: ${GREEN}$MVN_VERSION${NC}"
else
    echo -e "⚠️  Maven: ${YELLOW}Not found${NC}"
    echo ""
    echo "Maven is required to build the backend. Install it with:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y maven"
    echo ""
    read -p "Do you want to continue without building the backend? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}📦 Project Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend setup
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "✅ Frontend dependencies installed"
    else
        echo -e "${RED}❌ Frontend installation failed${NC}"
        exit 1
    fi
else
    echo -e "✅ Frontend dependencies already installed"
fi

# Backend setup
if command -v mvn &> /dev/null; then
    if [ ! -d "backend/target" ]; then
        echo "🔨 Building backend (this may take a few minutes)..."
        cd backend
        mvn clean install -DskipTests -q
        if [ $? -eq 0 ]; then
            echo -e "✅ Backend built successfully"
        else
            echo -e "${RED}❌ Backend build failed${NC}"
            cd ..
            exit 1
        fi
        cd ..
    else
        echo -e "✅ Backend already built"
    fi
fi

echo ""
echo -e "${BLUE}🚀 Starting CivicPulse${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Choose how to run the application:"
echo "  1) Start Backend and Frontend together (recommended)"
echo "  2) Start Backend only"
echo "  3) Start Frontend only"
echo "  4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Starting both Backend and Frontend...${NC}"
        echo ""
        echo "Backend will start on: http://localhost:8080/api"
        echo "Frontend will start on: http://localhost:5173"
        echo ""
        echo "Press Ctrl+C to stop both services"
        echo ""
        sleep 2
        
        # Start backend in background
        if [ -f "backend/target/civicpulse-backend-1.0.0.jar" ]; then
            cd backend
            java -jar target/civicpulse-backend-1.0.0.jar &
            BACKEND_PID=$!
            cd ..
            
            # Wait for backend to start
            echo "⏳ Waiting for backend to start..."
            sleep 10
            
            # Start frontend
            npm run dev
            
            # Kill backend when frontend stops
            kill $BACKEND_PID
        else
            echo -e "${RED}Backend JAR not found. Please build it first.${NC}"
            exit 1
        fi
        ;;
    2)
        echo ""
        echo -e "${GREEN}Starting Backend only...${NC}"
        if [ -f "backend/target/civicpulse-backend-1.0.0.jar" ]; then
            cd backend
            java -jar target/civicpulse-backend-1.0.0.jar
        else
            echo -e "${RED}Backend JAR not found. Please build it first.${NC}"
            exit 1
        fi
        ;;
    3)
        echo ""
        echo -e "${GREEN}Starting Frontend only...${NC}"
        echo "⚠️  Make sure the backend is running on http://localhost:8080/api"
        sleep 2
        npm run dev
        ;;
    4)
        echo "Goodbye! 👋"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
