# CivicPulse - Full Stack Integration Guide

## 🎯 Project Overview
A complete Smart City Grievance Management System with:
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Spring Boot 3.2.1 + Java 21 + H2 Database
- **AI**: Google Gemini Integration

## 📁 Project Structure
```
Civicpulse_ai/
├── backend/                 # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/civicpulse/backend/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   └── CivicPulseBackendApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml
│   ├── build.sh
│   ├── run.sh
│   └── README.md
├── components/              # React Components
├── pages/                   # React Pages
├── services/                # Frontend Services
├── App.tsx
├── store.tsx
├── types.ts
├── package.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites
- Java 21 (OpenJDK) ✅ Installed
- Node.js v20.19.6 ✅ Installed
- Maven 3.6+ (Required for backend build)

### Step 1: Install Maven
```bash
sudo apt-get update
sudo apt-get install -y maven
```

Verify installation:
```bash
mvn -version
```

### Step 2: Build and Run Backend

#### Option A: Using Build Script
```bash
cd backend
./build.sh
./run.sh
```

#### Option B: Using Maven Directly
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Option C: Run JAR Directly
```bash
cd backend
mvn clean install
java -jar target/civicpulse-backend-1.0.0.jar
```

The backend will start on: **http://localhost:8080/api**

### Step 3: Run Frontend
```bash
# From project root
npm install
npm run dev
```

The frontend will start on: **http://localhost:5173**

## 🔌 API Integration

### Backend API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/role/{role}` - Get users by role

#### Grievances
- `POST /api/grievances` - Create new grievance
- `GET /api/grievances` - Get all grievances
- `GET /api/grievances/{id}` - Get grievance by ID
- `GET /api/grievances/user/{userId}` - Get user's grievances
- `GET /api/grievances/officer/{officerId}` - Get officer's assigned grievances
- `GET /api/grievances/status/{status}` - Filter by status
- `PATCH /api/grievances/{id}` - Update grievance

### Integration Steps for Frontend

#### 1. Create API Service
Create `services/apiService.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
  login: async (email: string, role: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    return response.json();
  },
  
  // Add other API calls...
};
```

#### 2. Update Store (store.tsx)
Replace localStorage with API calls:
```typescript
const login = async (email: string, role: UserRole) => {
  const result = await api.login(email, role);
  if (result.success) {
    setUser(result.data);
    localStorage.setItem('cp_user', JSON.stringify(result.data));
    return true;
  }
  return false;
};
```

## 🧪 Testing

### Test Backend Endpoints

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "citizen@civicpulse.com", "role": "CITIZEN"}'
```

#### Get All Grievances
```bash
curl http://localhost:8080/api/grievances
```

#### Create Grievance
```bash
curl -X POST http://localhost:8080/api/grievances \
  -H "Content-Type: application/json" \
  -H "User-Id: 1" \
  -d '{
    "title": "Street Light Issue",
    "description": "Not working properly",
    "category": "Street Lighting",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "Main Street"
    }
  }'
```

### Default Test Credentials

| Email | Role | Use Case |
|-------|------|----------|
| citizen@civicpulse.com | CITIZEN | Submit and track grievances |
| admin@civicpulse.com | ADMIN | Manage all grievances, assign officers |
| roads@civicpulse.com | OFFICER | Handle road maintenance issues |
| waste@civicpulse.com | OFFICER | Handle waste management issues |

## 🗄️ Database

### H2 Console Access
- URL: http://localhost:8080/api/h2-console
- JDBC URL: `jdbc:h2:mem:civicpulse`
- Username: `sa`
- Password: (leave empty)

### Database Schema
- **users** - User accounts
- **grievances** - Grievance records
- **timeline_entries** - Status change history

## 🔧 Configuration

### Backend Configuration
Edit `backend/src/main/resources/application.properties`:
```properties
server.port=8080
spring.datasource.url=jdbc:h2:mem:civicpulse
# ... other settings
```

### Frontend Configuration
Update Vite config if needed for proxy:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
});
```

## 🐛 Troubleshooting

### Backend Issues

**Port 8080 already in use:**
```bash
# Find and kill the process
sudo lsof -i :8080
kill -9 <PID>

# Or change port in application.properties
server.port=8081
```

**Maven not found:**
```bash
sudo apt-get install maven
```

**Build errors:**
```bash
# Clean and rebuild
mvn clean
mvn install -U
```

### Frontend Issues

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**CORS errors:**
- Ensure backend CORS is configured for `http://localhost:5173`
- Check CorsConfig.java in backend

## 📊 Features

### Implemented Features
✅ User Authentication (Login/Register)
✅ Role-based Dashboards (Citizen, Admin, Officer)
✅ Grievance Management (Create, Read, Update)
✅ Status Tracking with Timeline
✅ Officer Assignment
✅ AI-powered Categorization (Gemini)
✅ Real-time Updates
✅ H2 Database Integration
✅ RESTful API
✅ CORS Configuration

### API Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## 📝 Development Workflow

1. **Start Backend**: `cd backend && ./run.sh`
2. **Start Frontend**: `npm run dev`
3. **Open Browser**: http://localhost:5173
4. **Login**: Use test credentials
5. **Test Features**: Create grievances, assign officers, update status

## 🔐 Security Notes
- Current implementation uses basic authentication
- For production, implement:
  - JWT tokens
  - Password hashing (BCrypt)
  - HTTPS
  - Environment variables for sensitive data

## 📚 Additional Resources
- Spring Boot Docs: https://spring.io/projects/spring-boot
- React Docs: https://react.dev
- H2 Database: http://www.h2database.com

## 🤝 Contributing
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License
MIT License

---

**🎉 Your CivicPulse application is now ready to run!**

For support or questions, check the README files in respective directories.
