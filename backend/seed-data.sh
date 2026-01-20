#!/bin/bash

# Wait for backend to start
sleep 2

# Base URL
BASE_URL="http://localhost:8080/api"

# Register users
echo "Creating users..."
CITIZEN_ID=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Citizen",
    "email": "citizen@test.com",
    "password": "password123",
    "role": "CITIZEN"
  }' | jq -r '.data.userId // .userId // "1"')

OFFICER_ID=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Officer Smith",
    "email": "officer@test.com",
    "password": "password123",
    "role": "OFFICER"
  }' | jq -r '.data.userId // .userId // "2"')

echo "Citizen ID: $CITIZEN_ID"
echo "Officer ID: $OFFICER_ID"

# Create grievances
echo "Creating grievances..."

for i in {1..5}; do
  curl -s -X POST "$BASE_URL/grievances" \
    -H "Content-Type: application/json" \
    -H "User-Id: $CITIZEN_ID" \
    -d "{
      \"title\": \"Pothole in Road - Zone A\",
      \"description\": \"Large pothole near market causing traffic issues\",
      \"category\": \"Infrastructure\",
      \"priority\": \"HIGH\",
      \"locationLat\": 28.7041 + $i * 0.001,
      \"locationLng\": 77.1025 + $i * 0.001,
      \"locationAddress\": \"Zone A, City Center\",
      \"zone\": \"Zone A\"
    }" > /dev/null
done

for i in {1..4}; do
  curl -s -X POST "$BASE_URL/grievances" \
    -H "Content-Type: application/json" \
    -H "User-Id: $CITIZEN_ID" \
    -d "{
      \"title\": \"Street Light Not Working - Zone B\",
      \"description\": \"Street light at junction is broken\",
      \"category\": \"Public Utilities\",
      \"priority\": \"MEDIUM\",
      \"locationLat\": 28.7100 + $i * 0.001,
      \"locationLng\": 77.1100 + $i * 0.001,
      \"locationAddress\": \"Zone B, Highway\",
      \"zone\": \"Zone B\"
    }" > /dev/null
done

for i in {1..3}; do
  curl -s -X POST "$BASE_URL/grievances" \
    -H "Content-Type: application/json" \
    -H "User-Id: $CITIZEN_ID" \
    -d "{
      \"title\": \"Waste Management Issue - Zone C\",
      \"description\": \"Garbage not collected for days\",
      \"category\": \"Sanitation\",
      \"priority\": \"LOW\",
      \"locationLat\": 28.7200 + $i * 0.001,
      \"locationLng\": 77.1200 + $i * 0.001,
      \"locationAddress\": \"Zone C, Residential\",
      \"zone\": \"Zone C\"
    }" > /dev/null
done

echo "Test data created!"
echo "Fetching grievances..."
curl -s "$BASE_URL/grievances" | jq '.data | length'
echo "grievances created successfully"
