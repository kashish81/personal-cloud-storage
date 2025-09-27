# API Reference

## Base URL
`http://localhost:5000/api`

## Authentication
No authentication required for development version.

## Endpoints

### GET /health
Returns server status and statistics.

**Response:**
```json
{
  "status": "OK",
  "message": "Server running with AI capabilities",
  "files": 3,
  "aiEnabled": true
}