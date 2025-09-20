# URL Shortener Microservice Backend

A comprehensive HTTP URL shortener microservice built with Node.js and Express.js.

## Features

- ✅ **URL Shortening**: Create shortened URLs with custom or auto-generated shortcodes
- ✅ **Expiry Management**: Set custom validity periods (default: 30 minutes)
- ✅ **Click Tracking**: Log and track clicks with timestamps and mock geolocation
- ✅ **Statistics**: Retrieve detailed statistics for individual URLs or all URLs
- ✅ **CORS Support**: Configured for frontend integration
- ✅ **Comprehensive Logging**: Structured logging throughout the application
- ✅ **In-Memory Storage**: Fast, runtime-persistent data storage

## Project Structure

```
Backend Test Submission/
├── backend/
│   └── index.js          # Main server file with all endpoints
├── logging/
│   └── index.js          # Logging middleware
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Installation and Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Server will start on**: `http://localhost:3001`

## API Endpoints

### 1. Create Shortened URL
**POST** `/shorturls`

Creates a new shortened URL with optional custom shortcode and validity period.

**Request Body**:
```json
{
  "url": "https://example.com",        // Required: URL to shorten
  "validity": 60,                      // Optional: Validity in minutes (default: 30)
  "shortcode": "custom123"             // Optional: Custom shortcode (3-10 alphanumeric chars)
}
```

**Response** (201 Created):
```json
{
  "shortLink": "http://localhost:3001/abc123",
  "expiry": "2025-09-20T08:30:00.000Z"
}
```

**Error Responses**:
- `400`: Invalid URL format or validation errors
- `409`: Custom shortcode already exists

### 2. Redirect to Original URL
**GET** `/:shortcode`

Redirects to the original URL and logs the click.

**Response**:
- `302`: Redirects to original URL
- `404`: Short URL not found
- `410`: Short URL has expired

**Click Logging**: Each access logs:
- Timestamp
- Referrer source
- Mock geographical location

### 3. Get URL Statistics
**GET** `/shorturls/:shortcode`

Retrieves detailed statistics for a specific shortened URL.

**Response** (200 OK):
```json
{
  "shortLink": "http://localhost:3001/abc123",
  "longUrl": "https://example.com",
  "createdAt": "2025-09-20T07:30:00.000Z",
  "expiry": "2025-09-20T08:30:00.000Z",
  "totalClicks": 5,
  "clicks": [
    {
      "timestamp": "2025-09-20T07:35:00.000Z",
      "source": "direct",
      "location": "New York, USA"
    }
  ]
}
```

### 4. List All URLs
**GET** `/shorturls`

Retrieves all shortened URLs for dashboard/statistics view.

**Response** (200 OK):
```json
[
  {
    "shortLink": "http://localhost:3001/abc123",
    "longUrl": "https://example.com",
    "shortcode": "abc123",
    "createdAt": "2025-09-20T07:30:00.000Z",
    "expiry": "2025-09-20T08:30:00.000Z",
    "totalClicks": 5,
    "isExpired": false
  }
]
```

### 5. Health Check
**GET** `/health`

Server health and status endpoint.

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-09-20T07:30:00.000Z",
  "totalUrls": 10
}
```

## Frontend Integration

The backend is configured with CORS to work with a frontend located at:
`C:\Users\GAURAV\Desktop\test\Frontend Test Submission`

Allowed origins:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

## Logging

The application uses a structured logging system with the following format:
```
[timestamp] [BACKEND] [LEVEL] [package] message
```

Log levels: `ERROR`, `WARN`, `INFO`, `DEBUG`

All significant events are logged including:
- Request reception
- Validation errors
- Successful operations
- Click tracking
- Server startup

## Data Storage

Uses in-memory JavaScript `Map` for data persistence during runtime:
- Fast access and operations
- No database dependencies
- Data persists for server session duration
- Automatic cleanup on server restart

## Validation Rules

### URL Validation
- Must be a valid URL format
- Required field for shortening

### Shortcode Validation
- 3-10 characters long
- Alphanumeric characters only
- Must be unique (no duplicates)

### Validity Validation
- Must be a positive number (minutes)
- Default: 30 minutes if not specified

## Error Handling

Comprehensive error handling with appropriate HTTP status codes:
- `400`: Bad Request (validation errors)
- `404`: Not Found (shortcode doesn't exist)
- `409`: Conflict (shortcode already exists)
- `410`: Gone (URL has expired)
- `500`: Internal Server Error

## Testing the API

You can test the API using tools like Postman, curl, or any HTTP client:

### Example: Create a short URL
```bash
curl -X POST http://localhost:3001/shorturls \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com", "validity": 60}'
```

### Example: Access a short URL
```bash
curl -I http://localhost:3001/abc123
```

### Example: Get statistics
```bash
curl http://localhost:3001/shorturls/abc123
```

## Development

For development with automatic restart on file changes:
```bash
npm run dev
```

This uses `nodemon` to watch for file changes and restart the server automatically.

## License

ISC License - See package.json for details.