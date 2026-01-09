

# 🏙️ CivicPulse - Smart City Grievance Management System

A full-stack web application for managing citizen grievances with AI-powered categorization, real-time tracking, and role-based dashboards.

## 🌟 Features

- ✨ **AI-Powered Categorization** - Auto-categorize grievances using Google Gemini AI
- 👥 **Role-Based Access** - Separate dashboards for Citizens, Officers, and Admins
- 📊 **Real-time Tracking** - Track grievance status with detailed timeline
- 🗺️ **Location Tagging** - Geolocation support for grievance locations
- 📸 **Image Upload** - Attach proof images to grievances
- 📈 **Analytics Dashboard** - Visual insights for administrators
- 🔔 **Status Updates** - Real-time status changes with notifications

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite 6** - Fast build tool
- **TailwindCSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Spring Boot 3.2.1** - REST API
- **Java 21** (OpenJDK)
- **Maven** - Build tool
- **H2 Database** - In-memory database
- **Spring Data JPA** - ORM

### AI Integration
- **Google Gemini AI** - Auto-categorization and smart responses

## 📋 Prerequisites

- Node.js v20.19.6 or higher
- Java 21 (OpenJDK)
- Maven 3.6+ (for building backend)

## 🚀 Quick Start

### Method 1: Automated Setup (Recommended)

```bash
# Make the start script executable
chmod +x start.sh

# Run the quick start script
./start.sh
```

The script will:
1. Check system prerequisites
2. Install dependencies
3. Build the backend
4. Start both frontend and backend

### Method 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

Backend will be available at: **http://localhost:8080/api**

#### Frontend Setup
```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env.local and add:
# GEMINI_API_KEY=your_gemini_api_key_here

# Run development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

## 🔑 Default Test Accounts

| Email | Role | Password | Use Case |
|-------|------|----------|----------|
| citizen@civicpulse.com | CITIZEN | password | Submit and track grievances |
| admin@civicpulse.com | ADMIN | password | Manage all grievances, assign officers |
| roads@civicpulse.com | OFFICER | password | Handle road maintenance issues |
| waste@civicpulse.com | OFFICER | password | Handle waste management issues |

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Grievance Endpoints
- `POST /api/grievances` - Create new grievance
- `GET /api/grievances` - Get all grievances
- `GET /api/grievances/{id}` - Get specific grievance
- `PATCH /api/grievances/{id}` - Update grievance status

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/role/{role}` - Get users by role

For complete API documentation, see [backend/README.md](backend/README.md)

## 🗄️ Database

### H2 Console
Access the H2 database console at: **http://localhost:8080/api/h2-console**

Connection details:
- JDBC URL: `jdbc:h2:mem:civicpulse`
- Username: `sa`
- Password: (leave empty)

## 📁 Project Structure

```
Civicpulse_ai/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/com/civicpulse/backend/
│   │   ├── config/            # Configuration classes
│   │   ├── controller/        # REST Controllers
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── model/             # JPA Entities
│   │   ├── repository/        # JPA Repositories
│   │   ├── service/           # Business Logic
│   │   └── CivicPulseBackendApplication.java
│   ├── pom.xml
│   └── README.md
├── components/                 # React Components
├── pages/                      # React Pages
│   ├── CitizenDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── OfficerDashboard.tsx
│   └── Login.tsx
├── services/                   # API Services
│   ├── geminiService.ts       # AI Integration
│   └── backendApi.ts          # Backend API calls
├── App.tsx                     # Main App Component
├── store.tsx                   # State Management
├── types.ts                    # TypeScript Types
├── package.json
├── start.sh                    # Quick start script
└── INTEGRATION_GUIDE.md       # Detailed integration guide
```

## 🔧 Configuration

### Backend Configuration
Edit `backend/src/main/resources/application.properties`:
```properties
server.port=8080
spring.datasource.url=jdbc:h2:mem:civicpulse
```

### Frontend Configuration
Create `.env.local` file:
```env
GEMINI_API_KEY=your_api_key_here
```

## 🧪 Testing

### Test Backend API
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "citizen@civicpulse.com", "role": "CITIZEN"}'

# Get all grievances
curl http://localhost:8080/api/grievances
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8080
sudo lsof -i :8080
kill -9 <PID>

# Or change port in application.properties
```

### Maven Not Found
```bash
sudo apt-get update
sudo apt-get install -y maven
```

### Build Errors
```bash
cd backend
mvn clean
mvn install -U
```

## 📖 Additional Documentation

- [Integration Guide](INTEGRATION_GUIDE.md) - Complete integration guide
- [Backend Documentation](backend/README.md) - Backend API details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License

## 🎯 Roadmap

- [ ] Implement JWT authentication
- [ ] Add real-time notifications
- [ ] Integrate maps for location tracking
- [ ] Add email notifications
- [ ] Implement file upload for images
- [ ] Add grievance priority auto-assignment
- [ ] Mobile responsive design improvements
- [ ] Performance optimization

## 💡 Support

For issues or questions:
1. Check the [Integration Guide](INTEGRATION_GUIDE.md)
2. Review [Backend README](backend/README.md)
3. Open an issue on GitHub

---

**Made with ❤️ for Smart Cities**

# CivicPulse Hub – Smart City Feedback & Redressal System

CivicPulse Hub is a unified platform for citizens to report city issues, track complaint status, and provide feedback after resolution.

## Features
- Citizen complaint submission & tracking
- Automatic department-wise complaint assignment
- Department officer dashboard for issue resolution
- Admin dashboard with analytics & reports
- Feedback and rating system

## Tech Stack
- Frontend: React
- Backend: Java, Spring Boot
- Database: H2-Database (Testing Purpose)

## System Flow
User Login → Complaint Submission → Department Assignment → Issue Resolution → Notification → Feedback → Analytics

## Modules
- User Authentication & Role Management
- Citizen Complaint Submission
- Department Officer Management
- Admin Dashboard
- Feedback & Rating
- Analytics & Reports

## How to Run
1. Clone the repository  
2. Configure MySQL database  
3. Run Spring Boot application  
4. Access the app from browser  

## Status
Virtual Internship Project – Infosys
