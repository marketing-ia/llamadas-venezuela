# Calling Platform - API Endpoints Reference

**Base URL:** `https://api.your-domain.com/api` (or `http://localhost:3000/api` locally)

**Authentication:** All endpoints except `/auth/login` require `X-Tenant-ID` header

---

## AUTH ENDPOINTS

### POST `/auth/login`
Authenticate and start session

**Request:**
```json
{
  "tenantKey": "your-tenant-secret-key"
}
```

**Response (200):**
```json
{
  "success": true,
  "tenant": {
    "id": "uuid",
    "name": "Company Name"
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid tenant key"
}
```

---

### POST `/auth/logout`
End session

**Response (200):**
```json
{
  "success": true
}
```

---

### GET `/auth/verify`
Check current session status

**Response (200):**
```json
{
  "authenticated": true,
  "tenantId": "uuid"
}
```

**Response (401):**
```json
{
  "authenticated": false
}
```

---

## CALLS ENDPOINTS

### POST `/calls/initiate`
Start a new outbound call

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Request:**
```json
{
  "operatorId": "operator-uuid",
  "toNumber": "+1234567890"
}
```

**Response (200):**
```json
{
  "callSid": "twilio-call-sid",
  "from": "+1555000001",
  "to": "+1234567890",
  "status": "initiated"
}
```

**Errors:**
- `400`: Missing operatorId/toNumber or invalid phone format
- `500`: Twilio API failure

---

### GET `/calls/logs`
Retrieve call history with pagination and filtering

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Query Parameters:**
```
?operatorId=uuid&startDate=2026-04-01&endDate=2026-04-30&status=completed&limit=50&offset=0
```

**Response (200):**
```json
{
  "calls": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "operator_id": "uuid",
      "twilio_call_sid": "twilio-sid",
      "from_number": "+1555000001",
      "to_number": "+1234567890",
      "duration_seconds": 245,
      "price_per_minute": 0.015,
      "total_cost": 0.06,
      "status": "completed",
      "recording_url": "https://twilio-recording-url",
      "started_at": "2026-04-18T10:30:00Z",
      "ended_at": "2026-04-18T10:34:05Z",
      "createdAt": "2026-04-18T10:30:00Z",
      "Operator": {
        "id": "uuid",
        "name": "John Operator",
        "twilio_number": "+1555000001"
      }
    }
  ],
  "total": 150
}
```

---

### GET `/calls/:id`
Get details for a specific call

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Response (200):** Same as single call object from /logs

**Error (404):**
```json
{
  "error": "Call not found"
}
```

---

## OPERATORS ENDPOINTS

### GET `/operators`
List all operators for tenant

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "name": "John Operator",
    "twilio_number": "+1555000001",
    "sip_uri": "sip://john@pbx.example.com",
    "createdAt": "2026-04-18T10:00:00Z",
    "updatedAt": "2026-04-18T10:00:00Z"
  }
]
```

---

### POST `/operators`
Create new operator

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Request:**
```json
{
  "name": "John Operator",
  "twilioNumber": "+1555000001",
  "sipUri": "sip://john@pbx.example.com"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "name": "John Operator",
  "twilio_number": "+1555000001",
  "sip_uri": "sip://john@pbx.example.com",
  "createdAt": "2026-04-18T10:00:00Z"
}
```

**Error (400):**
```json
{
  "error": "Invalid Twilio phone number"
}
```

---

### PUT `/operators/:id`
Update operator details

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Request:**
```json
{
  "name": "Updated Name",
  "twilioNumber": "+1555000002"
}
```

**Response (200):** Updated operator object

---

### DELETE `/operators/:id`
Remove operator

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Response (200):**
```json
{
  "success": true
}
```

---

## SALES SCRIPTS ENDPOINTS

### GET `/scripts`
List all sales scripts for tenant

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "title": "Cold Call Opening",
    "content": "Hi, my name is [Operator]...",
    "createdAt": "2026-04-18T10:00:00Z",
    "updatedAt": "2026-04-18T10:00:00Z"
  }
]
```

---

### POST `/scripts`
Create new sales script

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Request:**
```json
{
  "title": "Cold Call Opening",
  "content": "Hi, my name is [Operator]..."
}
```

**Response (201):** Script object with id

---

### PUT `/scripts/:id`
Update script

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Request:**
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Response (200):** Updated script object

---

### DELETE `/scripts/:id`
Remove script

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Response (200):**
```json
{
  "success": true
}
```

---

## ANALYTICS ENDPOINTS

### GET `/analytics/summary`
Dashboard summary: today's stats and month-to-date

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Response (200):**
```json
{
  "today": {
    "calls": 15,
    "minutes": 245,
    "cost": 3.68
  },
  "monthToDate": {
    "cost": 125.50,
    "budget": 500.00
  }
}
```

---

### GET `/analytics/operators`
Calls and cost breakdown by operator

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Query Parameters:**
```
?daysBack=30
```

**Response (200):**
```json
[
  {
    "operator_id": "uuid",
    "callsCount": "25",
    "totalDurationSeconds": "3600",
    "totalCost": "54.00",
    "Operator": {
      "name": "John Operator"
    }
  }
]
```

---

### GET `/analytics/cost`
Cost breakdown by day

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Query Parameters:**
```
?daysBack=30
```

**Response (200):**
```json
[
  {
    "date": "2026-04-18",
    "callsCount": "15",
    "totalCost": "3.68"
  }
]
```

---

### GET `/analytics/budget-alert`
Check if tenant exceeded monthly budget

**Headers:**
```
X-Tenant-ID: tenant-uuid
```

**Response (200):**
```json
{
  "alert": false,
  "monthCost": 125.50,
  "budget": 500.00,
  "percentage": 25
}
```

---

## WEBHOOKS

### POST `/webhooks/twilio`
Twilio event webhook (no authentication)

**Webhook Body (from Twilio):**
```json
{
  "CallSid": "twilio-call-sid",
  "CallStatus": "completed",
  "RecordingUrl": "https://api.twilio.com/2010-04-01/Accounts/...",
  "Duration": "245",
  "Price": "-0.015"
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

## ERROR RESPONSES

All errors follow this format:

**Development (400-500):**
```json
{
  "error": "Error message",
  "stack": "Full stack trace..."
}
```

**Production (400-500):**
```json
{
  "error": "Internal server error"
}
```

---

## AUTHENTICATION FLOW

1. **Login:**
   ```
   POST /auth/login
   Body: { "tenantKey": "..." }
   → Returns tenant ID
   → Store in session/localStorage
   ```

2. **Subsequent Requests:**
   ```
   GET /calls/logs
   Header: X-Tenant-ID: <stored-tenant-id>
   → TenancyMiddleware validates tenant_id
   → Request proceeds with req.tenantId injected
   ```

3. **Logout:**
   ```
   POST /auth/logout
   → Clear session/localStorage
   ```

---

## RATE LIMITING

- **General:** 100 requests per 15 minutes per tenant
- **Calls Endpoint:** 10 calls per minute per operator
- **Response when exceeded:** 429 Too Many Requests

---

## INTEGRATION CHECKLIST

- [ ] Frontend implements X-Tenant-ID header on all requests
- [ ] Frontend handles 401 unauthorized → redirect to login
- [ ] Frontend handles 429 rate limit → show "too many calls" message
- [ ] Frontend stores tenant ID securely (sessionStorage)
- [ ] Twilio webhook URL configured: https://api.your-domain.com/api/webhooks/twilio
- [ ] All environment variables set (DATABASE_URL, TWILIO_ACCOUNT_SID, etc.)
- [ ] CORS configured to allow frontend origin
- [ ] Database initialized and models synced