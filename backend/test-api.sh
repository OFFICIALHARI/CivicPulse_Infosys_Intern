#!/bin/bash

# CivicPulse Backend API Test Script

API_URL="http://localhost:8080/api"

echo "🧪 CivicPulse Backend API Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    echo -n "Testing: $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Check if backend is running
echo "Checking if backend is running..."
if curl -s "$API_URL/users" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
    echo ""
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo ""
    echo "Please start the backend first:"
    echo "  cd backend"
    echo "  ./run.sh"
    exit 1
fi

echo "Running API tests..."
echo ""

# Test Authentication Endpoints
echo "=== Authentication Tests ==="
test_endpoint "Login - Valid User" "POST" "/auth/login" \
    '{"email":"citizen@civicpulse.com","role":"CITIZEN"}' 200

test_endpoint "Login - Invalid User" "POST" "/auth/login" \
    '{"email":"invalid@test.com","role":"CITIZEN"}' 400

test_endpoint "Register - New User" "POST" "/auth/register" \
    '{"name":"Test User","email":"test'$(date +%s)'@test.com","role":"CITIZEN"}' 200

echo ""

# Test User Endpoints
echo "=== User Tests ==="
test_endpoint "Get All Users" "GET" "/users" "" 200
test_endpoint "Get Users by Role (OFFICER)" "GET" "/users/role/OFFICER" "" 200
test_endpoint "Get User by ID" "GET" "/users/1" "" 200

echo ""

# Test Grievance Endpoints
echo "=== Grievance Tests ==="
test_endpoint "Get All Grievances" "GET" "/grievances" "" 200

test_endpoint "Create Grievance" "POST" "/grievances" \
    '{"title":"Test Issue","description":"This is a test","category":"Other","location":{"lat":0,"lng":0,"address":"Test Location"}}' 200

# Get the first grievance ID for update test
GRIEVANCE_ID=$(curl -s "$API_URL/grievances" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$GRIEVANCE_ID" ]; then
    test_endpoint "Update Grievance" "PATCH" "/grievances/$GRIEVANCE_ID" \
        '{"status":"IN_PROGRESS","logMessage":"Testing update"}' 200
    
    test_endpoint "Get Grievance by ID" "GET" "/grievances/$GRIEVANCE_ID" "" 200
fi

test_endpoint "Get Grievances by Status" "GET" "/grievances/status/PENDING" "" 200

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test Results:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
