# CivicPulse API Setup & Debugging Guide

## Database Configuration Fixed ✅

### Changes Made:
1. **Database Type**: Changed from in-memory (`jdbc:h2:mem`) to **persistent file-based** (`jdbc:h2:file`)
2. **Database Location**: `./civicpulse_db` (stored locally, survives restarts)
3. **JPA Strategy**: Changed from `create-drop` to `update` (preserves data between restarts)
4. **MySQL Mode**: Enabled `MODE=MySQL` for better compatibility

### Key Configuration:
```properties
spring.datasource.url=jdbc:h2:file:./civicpulse_db;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.jpa.hibernate.ddl-auto=update
```

## API Endpoints Available

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Grievance Endpoints
- `POST /grievances` - Create grievance
- `GET /grievances` - Get all grievances
- `GET /grievances/{id}` - Get grievance by ID
- `GET /grievances/user/{userId}` - Get by citizen
- `GET /grievances/officer/{officerId}` - Get assigned to officer
- `GET /grievances/status/{status}` - Get by status
- `PATCH /grievances/{id}` - Update grievance

### Analytics Endpoints
- `GET /grievances/analytics/all` - All analytics
- `GET /grievances/analytics/complete` - Complete analytics
- `GET /grievances/analytics/officer/{officerId}` - Officer analytics
- `GET /grievances/analytics/grievance-analysis` - Grievance analysis (admin)
- `GET /grievances/analytics/grievance-analysis/officer/{officerId}` - Officer grievance analysis
- `GET /grievances/analytics/zones` - Zone analytics
- `GET /grievances/analytics/sla` - SLA metrics
- `GET /grievances/analytics/heatmap` - Heat map data

## Testing the API

### 1. Test Backend Connection
```bash
curl http://localhost:8080/api/grievances
```

### 2. Access H2 Console
```
http://localhost:8080/api/h2-console
```
- **JDBC URL**: `jdbc:h2:file:./civicpulse_db`
- **Username**: `sa`
- **Password**: (leave empty)

### 3. Check Database File
```bash
ls -lh civicpulse_db*
```

## Startup Instructions

### Step 1: Start Backend
```bash
cd backend
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

### Step 2: Start Frontend
```bash
npm run dev
```

### Step 3: Verify Both Services
- Backend: http://localhost:8080/api/grievances (should list grievances)
- Frontend: http://localhost:3001 (should load normally)

## Data Persistence Check

### After Creating Data:
1. Submit a grievance in the frontend
2. Check H2 Console: http://localhost:8080/api/h2-console
3. Run: `SELECT * FROM GRIEVANCE;`
4. Restart backend
5. Query again - data should still be there ✅

## Common Issues & Solutions

### Issue: "Cannot connect to localhost:8080"
**Solution**: Check if backend is running
```bash
curl http://localhost:8080/api/grievances
```

### Issue: "404 Not Found"
**Solution**: Verify context path is `/api`
- URL should be: `http://localhost:8080/api/grievances`
- Not: `http://localhost:8080/grievances`

### Issue: "Data disappears after restart"
**Solution**: Database was in-memory mode
- Fixed: Changed to persistent file-based database
- Verify in application.properties: `jdbc:h2:file:./civicpulse_db`

### Issue: "CORS errors"
**Solution**: CORS is configured in CorsConfig.java
- Allowed: localhost:3000, localhost:3001
- Methods: GET, POST, PATCH, DELETE, OPTIONS

## Monitoring

### Check Backend Logs
```bash
tail -f backend/build/output.log
```

### Monitor Database Size
```bash
du -sh civicpulse_db*
```

### Test API Endpoints
```bash
# Get all grievances
curl http://localhost:8080/api/grievances

# Get analytics
curl http://localhost:8080/api/grievances/analytics/complete

# Get officer analytics
curl http://localhost:8080/api/grievances/analytics/grievance-analysis
```

## Next Steps

1. ✅ Restart backend with new configuration
2. ✅ Test creating a grievance via frontend
3. ✅ Verify data appears in H2 Console
4. ✅ Restart backend and confirm data persists
5. ✅ Check analytics endpoints return data
