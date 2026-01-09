# CivicPulse Backend API

## Overview
Spring Boot 3.x REST API for CivicPulse Smart City Grievance Management System.

## Technology Stack
- **Java**: OpenJDK 21
- **Framework**: Spring Boot 3.2.1
- **Build Tool**: Maven
- **Database**: H2 (In-Memory)
- **ORM**: Spring Data JPA / Hibernate

## Prerequisites
- Java 21 or higher
- Maven 3.6+

## Project Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/civicpulse/backend/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── model/           # JPA Entities
│   │   │   ├── repository/      # JPA Repositories
│   │   │   ├── service/         # Business Logic
│   │   │   └── CivicPulseBackendApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/role/{role}` - Get users by role (CITIZEN, ADMIN, OFFICER)

### Grievances
- `POST /api/grievances` - Create new grievance (requires User-Id header)
- `GET /api/grievances` - Get all grievances
- `GET /api/grievances/{id}` - Get grievance by ID
- `GET /api/grievances/user/{userId}` - Get grievances by user
- `GET /api/grievances/officer/{officerId}` - Get grievances assigned to officer
- `GET /api/grievances/status/{status}` - Get grievances by status
- `PATCH /api/grievances/{id}` - Update grievance (requires User-Id header)

## How to Run

### 1. Build the project
```bash
cd backend
mvn clean install
```

### 2. Run the application
```bash
mvn spring-boot:run
```

Or run the JAR:
```bash
java -jar target/civicpulse-backend-1.0.0.jar
```

### 3. Access the application
- **API Base URL**: http://localhost:8080/api
- **H2 Console**: http://localhost:8080/api/h2-console
  - JDBC URL: `jdbc:h2:mem:civicpulse`
  - Username: `sa`
  - Password: (leave empty)

## Default Test Users

| Email | Role | Password |
|-------|------|----------|
| citizen@civicpulse.com | CITIZEN | password |
| admin@civicpulse.com | ADMIN | password |
| roads@civicpulse.com | OFFICER | password |
| waste@civicpulse.com | OFFICER | password |

## API Request Examples

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@civicpulse.com",
    "role": "CITIZEN"
  }'
```

### Create Grievance
```bash
curl -X POST http://localhost:8080/api/grievances \
  -H "Content-Type: application/json" \
  -H "User-Id: 1" \
  -d '{
    "title": "Broken Street Light",
    "description": "Street light on Main St is not working",
    "category": "Street Lighting",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "Main Street, Block 4"
    }
  }'
```

### Update Grievance Status
```bash
curl -X PATCH http://localhost:8080/api/grievances/GRV-1234 \
  -H "Content-Type: application/json" \
  -H "User-Id: 3" \
  -d '{
    "status": "IN_PROGRESS",
    "logMessage": "Officer is working on the issue"
  }'
```

## Configuration
Edit `src/main/resources/application.properties` to customize:
- Server port
- Database settings
- Logging levels
- CORS settings

## Development
- Hot reload enabled with Spring DevTools
- Logs available in console
- H2 console for database inspection

## Troubleshooting

### Port already in use
Change the port in `application.properties`:
```properties
server.port=8081
```

### Java version mismatch
Ensure Java 21 is installed:
```bash
java -version
```

## License
MIT License
