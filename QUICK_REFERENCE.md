# CivicPulse Backend - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Install Maven (one-time)
sudo apt-get update && sudo apt-get install -y maven

# Build Backend
cd backend && ./build.sh

# Run Backend
./run.sh

# Test APIs
./test-api.sh
```

## 🌐 URLs

- **Backend API**: http://localhost:8080/api
- **H2 Console**: http://localhost:8080/api/h2-console
- **Frontend**: http://localhost:5173

## 🔑 Test Credentials

| Email | Role |
|-------|------|
| citizen@civicpulse.com | CITIZEN |
| admin@civicpulse.com | ADMIN |
| roads@civicpulse.com | OFFICER |
| waste@civicpulse.com | OFFICER |

## 📡 API Quick Reference

### Authentication
```bash
# Login
POST /api/auth/login
{"email":"citizen@civicpulse.com","role":"CITIZEN"}

# Register
POST /api/auth/register
{"name":"John","email":"john@test.com","role":"CITIZEN"}
```

### Users
```bash
GET /api/users                    # Get all users
GET /api/users/{id}               # Get user by ID
GET /api/users/role/OFFICER       # Get officers
```

### Grievances
```bash
POST /api/grievances              # Create (needs User-Id header)
GET /api/grievances               # Get all
GET /api/grievances/{id}          # Get by ID
GET /api/grievances/user/{id}     # Get user's grievances
PATCH /api/grievances/{id}        # Update (needs User-Id header)
```

## 🔧 Useful Commands

```bash
# Check if backend is running
curl http://localhost:8080/api/users

# Kill process on port 8080
sudo lsof -i :8080 | grep java | awk '{print $2}' | xargs kill -9

# Rebuild from scratch
cd backend && mvn clean install

# View logs
tail -f backend/logs/spring.log

# Start full stack
./start.sh
```

## 📊 Database Info

**H2 Console Login:**
- URL: `jdbc:h2:mem:civicpulse`
- User: `sa`
- Pass: (empty)

**Tables:**
- users
- grievances
- timeline_entries

## 🐛 Common Issues

**Maven not found**
→ `sudo apt-get install maven`

**Port in use**
→ `sudo lsof -i :8080`

**Build fails**
→ `mvn clean && mvn install -U`

**CORS error**
→ Check CorsConfig.java

## 📂 File Locations

```
backend/
├── pom.xml                       # Dependencies
├── build.sh                      # Build script
├── run.sh                        # Run script
├── test-api.sh                   # Test script
├── README.md                     # Full docs
└── src/main/
    ├── java/                     # Source code
    └── resources/
        └── application.properties # Config
```

## 🎯 Testing

```bash
# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen@civicpulse.com","role":"CITIZEN"}'

# Create grievance
curl -X POST http://localhost:8080/api/grievances \
  -H "Content-Type: application/json" \
  -H "User-Id: 1" \
  -d '{"title":"Test","description":"Test issue","category":"Other","location":{"lat":0,"lng":0,"address":"Test"}}'

# Get all grievances
curl http://localhost:8080/api/grievances
```

## 📚 Documentation

- **BACKEND_COMPLETE.md** - Full completion summary
- **backend/README.md** - Backend documentation
- **backend/DEPLOYMENT_SUMMARY.md** - Deployment guide
- **INTEGRATION_GUIDE.md** - Integration help

---

**Quick Help:** Run `./start.sh` for guided setup!
