# Calling Platform with Twilio Integration - Design Spec

**Date:** 2026-04-18  
**Status:** Approved  
**Scope:** Multi-tenant calling application with Twilio SIP termination, call analytics, sales scripts, and cost tracking

---

## 1. Executive Summary

Build a multi-tenant web application that enables multiple companies ("tenants") to manage phone calls through Twilio with SIP termination to their own numbers. Each tenant configures operators (up to 4 initially, unlimited in architecture) with their own Twilio numbers and SIP URIs. The platform provides a dashboard for call history, real-time analytics, sales script module, and cost tracking (per-call pricing from Twilio).

**Architecture:** Monolithic backend (Node.js + Express) + React frontend, deployed on Vercel + Railway  
**Timeline:** 8 days to production  
**Key constraint:** Urgent delivery with simple-yet-scalable architecture

---

## 2. System Architecture

### 2.1 High-Level Overview

```
Tenants
  ↓
React Frontend (Dashboard, Call Logs, Sales Scripts, Analytics)
  ↓
Node.js Backend (Services: Twilio, Calls, Analytics, Operators)
  ↓
PostgreSQL (Multi-tenant data isolation)
  ↓
Twilio API (Make calls, SIP termination, recordings, events)
```

### 2.2 Component Diagram

- **Frontend:** Single-page React app served by Vercel
- **Backend:** Express server with modular service layer
- **Database:** PostgreSQL with tenant isolation via middleware
- **External:** Twilio (call execution), optional auth provider (later)

### 2.3 Data Flow

1. Operator logs in → authenticated by tenant_id (session-based)
2. Operator selects a sales script → opens in modal without blocking
3. Operator clicks "Make Call" → backend validates SIP URI, initiates Twilio call
4. Twilio executes call, streams events via webhooks
5. Backend records call events (started, answered, ended, recording ready)
6. Frontend updates dashboard in real-time with call status
7. Analytics module calculates cost (Twilio price × duration) and displays metrics
8. Recording link stored and accessible in call logs

---

## 3. Frontend (React)

### 3.1 Page Structure

**Dashboard (Home)**
- Summary widgets: Total calls today, minutes used, total cost today, operators online
- Recent calls list (last 10)
- Cost alert: if monthly_cost > budget, show warning banner
- Quick action: "New Call" button

**Call Logs**
- Table: date, time, operator, from_number, to_number, duration, cost, status, recording_link
- Filters: date range, operator, call status
- Each row: cost visible, recording linked to Twilio

**Sales Scripts Manager**
- List of scripts (title, created_at, actions: edit, delete)
- Create/Edit form: title + content (textarea, plain text)
- During call: modal overlay (right panel, 30% width) shows selected script, does not block call UI

**Analytics Dashboard**
- Line chart: calls per day (last 30 days)
- Bar chart: calls by operator
- Metric cards: avg duration, avg cost per call, total cost (month-to-date)
- Budget alert: if cost > budget, show in red
- Table detail: all calls with individual costs

**Operators Configuration**
- Table: name, twilio_number, sip_uri, actions (edit, delete)
- Add button → form: name, twilio_number, sip_uri
- Validation: phone format, SIP URI format (sip://user@host:port)

**Auth (Simple)**
- Login page: tenant_key input (short secret string)
- Sets session with tenant_id
- Logout button in header

### 3.2 UI/UX Principles

- **Real-time updates:** Call status refreshes without page reload (WebSocket or polling)
- **Modal for scripts:** Sales script opens in side panel, operator can still see call log
- **Cost visibility:** Every call shows its cost; budget tracking prominent
- **Responsive:** Works on desktop + tablet (mobile secondary)

### 3.3 Tech Stack

- **React 18** + TypeScript
- **Vite** (bundler)
- **Tailwind CSS** (styling)
- **Recharts** (analytics charts)
- **Axios** (HTTP client)
- **zustand** (state management, if needed)
- **Vercel** (deployment)

---

## 4. Backend (Node.js + Express)

### 4.1 Service Layer

**TwilioService**
- `initiateCall(toNumber, operatorId, tenantId)` → returns callSid
- `handleWebhook(event)` → processes call events (started, answered, ended, recording)
- Internal: validates operator credentials, constructs SIP URI

**CallsService**
- `recordCallEvent(callSid, event, data)` → saves to DB
- `getCallLogs(tenantId, filters)` → list with pagination
- `calculateCost(duration, pricePerMinute)` → returns total cost
- Internal: queries recordings from Twilio API when webhook arrives

**AnalyticsService**
- `getSummary(tenantId, dateRange)` → dashboard metrics
- `getCostBreakdown(tenantId, dateRange)` → cost by operator, by day
- `checkBudgetAlert(tenantId)` → compares monthly cost vs budget

**OperatorsService**
- `createOperator(tenantId, data)` → validates SIP URI format
- `updateOperator(tenantId, operatorId, data)`
- `deleteOperator(tenantId, operatorId)`
- `listOperators(tenantId)`

**ScriptsService**
- `createScript(tenantId, title, content)`
- `updateScript(tenantId, scriptId, data)`
- `deleteScript(tenantId, scriptId)`
- `listScripts(tenantId)`

### 4.2 Routes

```
POST   /api/calls/initiate          → start a call
POST   /api/webhooks/twilio         → Twilio event webhook
GET    /api/calls/logs              → list call records
GET    /api/analytics/summary       → dashboard data
GET    /api/analytics/cost          → cost breakdown

POST   /api/operators               → create operator
PUT    /api/operators/:id           → update operator
DELETE /api/operators/:id           → delete operator
GET    /api/operators               → list operators

POST   /api/scripts                 → create script
PUT    /api/scripts/:id             → update script
DELETE /api/scripts/:id             → delete script
GET    /api/scripts                 → list scripts

POST   /api/auth/login              → authenticate by tenant_key
POST   /api/auth/logout             → clear session
```

### 4.3 Middleware & Security

**TenancyMiddleware**
- Extracts tenant_id from session/JWT
- Injects into request object
- Enforces isolation: all queries scoped to tenant_id

**ErrorHandler**
- Catches service errors, returns 400/500 with message
- Logs errors for debugging
- Returns safe messages to frontend (no stack traces)

**RateLimiter**
- Max 10 calls/minute per operator (per tenant)
- Returns 429 if exceeded

**Validation**
- Phone numbers: must match E.164 format or local format
- SIP URIs: must be valid (sip://user@host:port or sip:+1234567890@sip.twilio.com)
- Budgets: positive decimal, nullable

### 4.4 Error Handling

- **Twilio API fails:** Catch error, log, return 500 to frontend with retry hint
- **Invalid SIP URI:** Validate before save, return 400 with format hint
- **Operator not found:** Return 404
- **Tenant isolation breach:** Return 403 (should never happen with middleware)
- **Database down:** Return 500, log critical

### 4.5 Tech Stack

- **Node.js 18+** (LTS)
- **Express 4**
- **Sequelize** (ORM for PostgreSQL)
- **Twilio Node SDK** (@twilio/sdk)
- **dotenv** (environment variables)
- **cors** (cross-origin)
- **helmet** (security headers)
- **express-rate-limit** (rate limiting)
- **Railway** (deployment)

---

## 5. Database (PostgreSQL)

### 5.1 Schema

**Table: tenants**
```sql
id             UUID PRIMARY KEY
name           VARCHAR(255) NOT NULL
twilio_account_sid VARCHAR(255) NOT NULL
twilio_auth_token  VARCHAR(255) NOT NULL (encrypted)
monthly_budget     DECIMAL(10,2) NULL
timezone           VARCHAR(50) DEFAULT 'UTC'
created_at         TIMESTAMP DEFAULT NOW()
```

**Table: operators**
```sql
id             UUID PRIMARY KEY
tenant_id      UUID NOT NULL (FK → tenants.id)
name           VARCHAR(255) NOT NULL
twilio_number  VARCHAR(20) NOT NULL
sip_uri        VARCHAR(255) NOT NULL
created_at     TIMESTAMP DEFAULT NOW()
updated_at     TIMESTAMP DEFAULT NOW()
UNIQUE (tenant_id, twilio_number)
```

**Table: sales_scripts**
```sql
id             UUID PRIMARY KEY
tenant_id      UUID NOT NULL (FK → tenants.id)
title          VARCHAR(255) NOT NULL
content        TEXT NOT NULL
created_at     TIMESTAMP DEFAULT NOW()
updated_at     TIMESTAMP DEFAULT NOW()
```

**Table: call_records**
```sql
id                    UUID PRIMARY KEY
tenant_id             UUID NOT NULL (FK → tenants.id)
operator_id           UUID NOT NULL (FK → operators.id)
twilio_call_sid       VARCHAR(255) NOT NULL UNIQUE
from_number           VARCHAR(20) NOT NULL
to_number             VARCHAR(20) NOT NULL
duration_seconds      INT DEFAULT 0
price_per_minute      DECIMAL(8,6) NULL
total_cost            DECIMAL(10,2) DEFAULT 0
status                VARCHAR(20) NOT NULL (enum: initiated, ringing, answered, completed, failed)
recording_url         TEXT NULL
started_at            TIMESTAMP NULL
ended_at              TIMESTAMP NULL
created_at            TIMESTAMP DEFAULT NOW()
FOREIGN KEY (tenant_id, operator_id) REFERENCES operators(tenant_id, id)
INDEX (tenant_id, created_at)
INDEX (operator_id)
```

### 5.2 Indexes

- `tenants.id` (primary)
- `operators.tenant_id` (multi-tenant isolation)
- `call_records.tenant_id, call_records.created_at` (analytics queries)
- `call_records.operator_id` (operator reports)

### 5.3 Encryption

- Twilio `auth_token` encrypted at rest using `aes-256-cbc` (Node.js `crypto`)
- Decrypted in memory only when calling Twilio API
- Encryption key stored in environment variable (`ENCRYPTION_KEY`)

---

## 6. Twilio Integration

### 6.1 Setup (Manual, One-time)

1. Create Twilio account (twilio.com)
2. For each operator:
   - Buy a Twilio number (or bring your own)
   - Configure **SIP Termination URI** pointing to customer's SIP server
   - Example: `sip:+14155552671@customer-pbx.com`
3. Generate API credentials (Account SID, Auth Token)
4. Store in `.env` or pass via form during tenant creation

### 6.2 Call Flow

**Backend initiates call:**
```javascript
const call = await client.api.calls.create({
  to: toNumber,                              // E.164 format
  from: operatorPhoneNumber,                 // Twilio number
  url: `${BACKEND_URL}/api/webhooks/twilio`  // status callback
});
// Returns call.sid
```

**Twilio calls webhook on events:**
```
POST /api/webhooks/twilio
Body: {
  CallSid, CallStatus (initiated|ringing|answered|completed),
  RecordingSid (if recording enabled),
  RecordingUrl, Duration, Price
}
```

**Backend stores event and recording URL:**
- Updates `call_records` with `status`, `ended_at`, `recording_url`, `total_cost`
- Triggers frontend update (WebSocket or polling)

### 6.3 Recording

- Enable recording in Twilio call config: `record: true`
- Twilio auto-records → webhook includes `RecordingUrl` when done
- Backend stores URL in DB, frontend links to it in call log

### 6.4 SIP Termination

- Each operator has a unique `sip_uri` (e.g., `sip://extension@customer.com`)
- When operator makes a call, Twilio routes it through SIP URI
- Customer's SIP server receives the call and routes to their internal system
- Operator's VoIP phone rings (or their PBX handles it)

---

## 7. Deployment

### 7.1 Frontend (Vercel)

```bash
# Vercel auto-deploys from GitHub
# Environment variables:
VITE_API_URL=https://backend-domain.com/api
```

### 7.2 Backend (Railway)

```bash
# Railway deploys from GitHub
# Environment variables:
NODE_ENV=production
DATABASE_URL=postgresql://...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
ENCRYPTION_KEY=...
JWT_SECRET=...
```

### 7.3 Database (PostgreSQL on Railway)

- Managed PostgreSQL in Railway
- Automatic backups
- Connection pooling (PgBouncer)

### 7.4 Domain & DNS

- Register domain (Namecheap/GoDaddy)
- Point DNS to Vercel (frontend)
- Point API subdomain (api.domain.com) to Railway
- HTTPS automatic (Vercel + Railway both provide)

### 7.5 Twilio Webhook

- Configure Twilio account to send webhooks to:
  ```
  https://api.domain.com/api/webhooks/twilio
  ```

---

## 8. Security & Compliance

### 8.1 Data Isolation

- All queries include `WHERE tenant_id = ?`
- Middleware enforces tenant_id from session
- No admin panel that can cross tenants

### 8.2 Credentials

- Twilio credentials encrypted in DB
- Environment variables for secrets (never in code)
- API keys/tokens never logged
- HTTPS enforced on all endpoints

### 8.3 Rate Limiting

- 10 calls/minute per operator (prevents abuse)
- 100 requests/minute per tenant (prevents DoS)

### 8.4 Input Validation

- Phone numbers: E.164 format or validated regex
- SIP URIs: Valid URI format, no code injection
- Text fields: XSS protection (Sequelize escapes, React auto-escapes)

### 8.5 Error Responses

- No stack traces in production
- Generic error messages ("Something went wrong") for unknown errors
- Detailed errors only in logs

---

## 9. Analytics & Reporting

### 9.1 Dashboard Metrics

- **Today:** calls_count, total_minutes, total_cost
- **This Month:** accumulated cost vs budget
- **By Operator:** calls, minutes, cost (table)
- **Cost Alert:** if month_to_date > budget, show red banner

### 9.2 Call Log Details

- Each call shows: operator name, from/to, duration, cost, status, recording link
- Filterable by date, operator, status
- Exportable to CSV (future)

### 9.3 Queries

```sql
-- Dashboard summary
SELECT 
  COUNT(*) as calls_today,
  SUM(duration_seconds)/60 as minutes_today,
  SUM(total_cost) as cost_today
FROM call_records
WHERE tenant_id = ? AND DATE(created_at) = CURRENT_DATE;

-- By operator
SELECT 
  operator_id, COUNT(*), SUM(duration_seconds)/60, SUM(total_cost)
FROM call_records
WHERE tenant_id = ? AND created_at >= now() - interval '30 days'
GROUP BY operator_id;

-- Budget alert
SELECT monthly_budget, 
  (SELECT SUM(total_cost) FROM call_records 
   WHERE tenant_id = ? AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())) as month_cost
FROM tenants WHERE id = ?;
```

---

## 10. Error Handling & Edge Cases

| Scenario | Handling |
|----------|----------|
| Twilio API down | Return 503, log error, frontend shows "Service unavailable" |
| Operator not found | Return 404, frontend handles gracefully |
| Invalid SIP URI | Validate before save, return 400 with hint |
| Call dropped mid-call | Webhook triggers with final status, dashboard updates |
| Recording not ready yet | Show "Recording processing..." → poll until ready |
| Budget exceeded | Show alert banner, allow calls (future: block) |
| Double-click "Make Call" | Debounce on frontend, rate limit on backend |

---

## 11. Testing Strategy

- **Unit tests:** Service layer (TwilioService, CallsService, AnalyticsService)
- **Integration tests:** API endpoints with mock Twilio
- **E2E tests:** Selenium/Cypress for critical flows (login → make call → view cost)
- **Manual testing:** Test with real Twilio account before production

---

## 12. Future Enhancements (Out of Scope)

- Call recording transcription (AI)
- Multi-language UI
- Advanced auth (OAuth, MFA)
- Call transfer/conference
- IVR (interactive voice response)
- Block calls if budget exceeded
- White-label for reselling
- Mobile app

---

## 13. Success Criteria

✅ Multi-tenant isolation working  
✅ Calls initiate through Twilio successfully  
✅ Call costs calculated and displayed  
✅ Budget alerts trigger  
✅ Real-time dashboard updates  
✅ Sales scripts accessible during calls  
✅ Recordings linked and playable  
✅ All operators' calls tracked  
✅ Deployed to production  
✅ Documentation complete  

---

**Approved by:** User  
**Ready for:** Implementation Planning
