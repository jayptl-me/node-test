# Event Management API

A production-ready REST API for managing events and user registrations built with Node.js, Express, PostgreSQL, and Bun runtime. This API provides comprehensive event management functionality with robust security features, input validation, rate limiting, and proper error handling.

## Features

### Event Management
- Create, view, and manage events with capacity limits (max 1000)
- Unique event identification with auto-generated IDs
- Event details include title, date/time, location, and capacity
- Support for ISO 8601 formatted dates and times

### User Registration System
- User registration for events with validation
- Prevention of duplicate registrations
- Capacity enforcement (cannot register when event is full)
- Past event registration prevention
- Registration cancellation functionality

### Business Logic and Constraints
- Smart constraint enforcement for all operations
- Custom sorting algorithm for upcoming events (date ascending, then location alphabetically)
- Many-to-many relationship between users and events
- Transaction-based operations for data consistency

### Security Features
- Production-grade security headers with Helmet.js
- Rate limiting for different endpoint types
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- Request size limits and parameter limits
- Comprehensive logging system

### Data Analytics
- Real-time event statistics including:
  - Total registrations count
  - Remaining capacity calculation
  - Percentage of capacity used

## Technology Stack

- **Runtime**: Bun (High-performance JavaScript runtime)
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL with connection pooling
- **Validation**: express-validator with custom rules
- **Security**: Helmet.js, CORS, express-rate-limit
- **Logging**: Winston with file and console transports
- **Environment Management**: dotenv

## Prerequisites

Before running this application, ensure you have:

- Bun installed (v1.0 or higher)
- PostgreSQL installed and running (v12 or higher)
- Node.js (for compatibility, v18 or higher)

## Installation and Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd event-management-api
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Database Configuration

#### Create PostgreSQL Database
```sql
CREATE DATABASE event_management;
CREATE USER event_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE event_management TO event_user;
```

#### Environment Setup
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_management
DB_USER=event_user
DB_PASSWORD=your_secure_password

# API Configuration
API_PREFIX=/api/v1

# Security Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

### 4. Initialize Database
```bash
bun run db:setup
```

### 5. Seed Sample Data (Optional)
```bash
bun run db:seed
```

### 6. Start Application

#### Development Mode (with auto-reload)
```bash
bun run dev
```

#### Production Mode
```bash
bun run start
```

The API will be available at: `http://localhost:3000/api/v1`

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
Currently, no authentication is required. For production deployment, consider implementing JWT-based authentication.

### Global Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "message": "string",
  "data": object | array,
  "error": "string (only on errors)"
}
```

## Endpoints

### Health Check
```http
GET /api/v1/health
```

**Response:**
```json
{
  "success": true,
  "message": "Event Management API is running",
  "timestamp": "2024-07-16T12:00:00.000Z"
}
```

### Events

#### 1. Create Event
```http
POST /api/v1/events
Content-Type: application/json

{
  "title": "Tech Conference 2024",
  "dateTime": "2024-12-25T10:00:00Z",
  "location": "San Francisco",
  "capacity": 100
}
```

**Validation Rules:**
- `title`: Required, 1-255 characters
- `dateTime`: Required, ISO 8601 format, future date
- `location`: Required, 1-255 characters
- `capacity`: Required, integer between 1-1000

**Success Response (201):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "eventId": 1,
    "event": {
      "id": 1,
      "title": "Tech Conference 2024",
      "date_time": "2024-12-25T10:00:00.000Z",
      "location": "San Francisco",
      "capacity": 100,
      "created_at": "2024-07-16T12:00:00.000Z"
    }
  }
}
```

#### 2. Get Event Details
```http
GET /api/v1/events/{eventId}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Event details retrieved successfully",
  "data": {
    "id": 1,
    "title": "Tech Conference 2024",
    "date_time": "2024-12-25T10:00:00.000Z",
    "location": "San Francisco",
    "capacity": 100,
    "created_at": "2024-07-16T12:00:00.000Z",
    "registrations": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "registered_at": "2024-07-16T12:30:00.000Z"
      }
    ]
  }
}
```

#### 3. List Upcoming Events
```http
GET /api/v1/events
```

Events are automatically sorted by:
1. Date (ascending)
2. Location (alphabetically)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Upcoming events retrieved successfully",
  "data": {
    "count": 2,
    "events": [
      {
        "id": 1,
        "title": "Tech Conference 2024",
        "date_time": "2024-12-25T10:00:00.000Z",
        "location": "San Francisco",
        "capacity": 100,
        "registration_count": "15"
      }
    ]
  }
}
```

#### 4. Register for Event
```http
POST /api/v1/events/{eventId}/register
Content-Type: application/json

{
  "userId": 1
}
```

**Business Rules:**
- User must exist
- Event must exist and be in the future
- User cannot be already registered
- Event must not be at full capacity

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered for event successfully",
  "data": {
    "id": 1,
    "event_id": 1,
    "user_id": 1,
    "registered_at": "2024-07-16T12:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Event full, already registered, or past event
- `404`: User or event not found

#### 5. Cancel Registration
```http
DELETE /api/v1/events/{eventId}/register
Content-Type: application/json

{
  "userId": 1
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Registration cancelled successfully",
  "data": {
    "id": 1,
    "event_id": 1,
    "user_id": 1,
    "registered_at": "2024-07-16T12:30:00.000Z"
  }
}
```

#### 6. Event Statistics
```http
GET /api/v1/events/{eventId}/stats
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Event statistics retrieved successfully",
  "data": {
    "eventId": 1,
    "totalRegistrations": 15,
    "remainingCapacity": 85,
    "percentageUsed": 15.00
  }
}
```

### Users

#### 1. Create User
```http
POST /api/v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Validation Rules:**
- `name`: Required, 1-255 characters
- `email`: Required, valid email format, unique

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-07-16T12:00:00.000Z"
  }
}
```

#### 2. Get User by ID
```http
GET /api/v1/users/{userId}
```

#### 3. Get All Users
```http
GET /api/v1/users
```

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or business rule violation |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

### Common Error Scenarios

#### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "capacity",
      "message": "Capacity must be a positive integer between 1 and 1000"
    }
  ]
}
```

#### Business Rule Violations (400)
```json
{
  "success": false,
  "message": "User is already registered for this event"
}
```

#### Resource Not Found (404)
```json
{
  "success": false,
  "message": "Event not found"
}
```

#### Rate Limit Exceeded (429)
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later",
  "error": "Rate limit exceeded"
}
```

## Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Registration Operations**: 5 requests per minute per IP
- **Resource Creation**: 10 requests per 5 minutes per IP

### Input Validation & Sanitization
- Comprehensive input validation using express-validator
- HTML escape for string inputs
- SQL injection prevention via parameterized queries
- Request size limits (1MB for JSON, 20 parameters max)

### Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

### Logging
- Request/response logging
- Error logging with stack traces (development only)
- Security event logging (rate limits, suspicious requests)

## Database Schema

### Tables

#### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### events
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date_time TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### event_registrations
```sql
CREATE TABLE event_registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);
```

### Indexes
```sql
CREATE INDEX idx_events_date_time ON events(date_time);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_registrations_event_id ON event_registrations(event_id);
```

## Project Structure

```
src/
├── controllers/              # Request handlers and business logic
│   ├── eventController.js    # Event-related operations
│   └── userController.js     # User-related operations
├── database/                 # Database configuration and setup
│   ├── config.js            # Connection pool configuration
│   ├── setup.js             # Table creation and initialization
│   └── seed.js              # Sample data for testing
├── middleware/               # Custom middleware functions
│   ├── errorHandler.js      # Centralized error handling
│   ├── inputSanitization.js # Input validation and sanitization
│   ├── security.js          # Security configurations and rate limiting
│   └── validation.js        # Request validation rules
├── models/                   # Data access layer
│   ├── Event.js             # Event data operations
│   └── User.js              # User data operations
├── routes/                   # API route definitions
│   ├── events.js            # Event endpoints
│   ├── users.js             # User endpoints
│   └── index.js             # Route aggregation
├── utils/                    # Utility functions
│   ├── generateApiExamples.js # API documentation generator
│   └── logger.js            # Winston logging configuration
└── index.js                 # Application entry point
```

## Performance Considerations

### Database
- Connection pooling with configurable pool sizes
- Optimized queries with proper indexing
- Transaction support for data consistency
- Query timeouts and connection limits

### Application
- Efficient algorithms for event sorting
- Memory-efficient data handling
- Request size limitations
- Graceful degradation and error recovery

## Testing

### Manual Testing
Use the provided test script:
```bash
bun test-api.js
```

### API Testing Tools
- Postman collection: `postman_collection.json`
- cURL examples: `API_EXAMPLES.md`

### Test Coverage
- All endpoint functionality
- Error handling scenarios
- Business rule validation
- Edge case management

## Deployment

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | No |
| `DB_NAME` | Database name | - | Yes |
| `DB_USER` | Database username | - | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `API_PREFIX` | API route prefix | `/api/v1` | No |
| `ALLOWED_ORIGINS` | CORS origins | `*` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

### Production Configuration

#### Database Pool Settings
```env
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000
DB_STATEMENT_TIMEOUT=30000
DB_QUERY_TIMEOUT=30000
```

#### Security Settings
```env
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
LOG_LEVEL=warn
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# Copy package files
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Copy source code
COPY src/ src/
COPY .env.example .env

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

CMD ["bun", "src/index.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=event_management
      - POSTGRES_USER=event_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## Monitoring and Maintenance

### Logging
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`
- Console output in development mode

### Health Monitoring
- Health check endpoint: `/api/v1/health`
- Database connection monitoring
- Application performance metrics

### Maintenance Tasks
- Regular log rotation
- Database maintenance and optimization
- Security updates and dependency management

## Contributing

### Development Guidelines
1. Follow existing code structure and naming conventions
2. Add comprehensive input validation for new endpoints
3. Include proper error handling and logging
4. Update API documentation for new features
5. Test all changes thoroughly

### Code Quality
- ESLint configuration for code consistency
- Proper error handling at all levels
- Comprehensive input validation
- Security-first development approach

## License

This project is licensed under the MIT License.

## Support

For questions, issues, or feature requests, please create an issue in the repository or contact the development team.

---

**Event Management API** - A production-ready solution built with Bun, Express.js, and PostgreSQL
