# Calling Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-tenant web application for managing phone calls through Twilio with SIP termination, call analytics, sales scripts, and cost tracking.

**Architecture:** Monolithic Node.js + Express backend with PostgreSQL, React frontend on Vite, deployed on Railway (backend) + Vercel (frontend).

**Tech Stack:** Node.js 18, Express, Sequelize ORM, PostgreSQL, React 18, TypeScript, Vite, Tailwind CSS, Recharts, Twilio SDK

---

## Phase 1: Backend MVP (Days 1-3)

### Task 1: Backend Project Setup

**Files:**
- Create: `backend/package.json`
- Create: `backend/.env.example`
- Create: `backend/src/app.js`
- Create: `backend/server.js`

- [ ] **Step 1: Create backend directory and install dependencies**

```bash
mkdir -p backend/src/{config,models,services,routes,middleware,webhooks,utils}
mkdir -p backend/tests/{services,routes}
cd backend
npm init -y
npm install express sequelize pg twilio dotenv cors helmet express-rate-limit uuid
npm install --save-dev nodemon jest
```

- [ ] **Step 2: Create package.json scripts**

Update `backend/package.json`:
```json
{
  "name": "calling-platform-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --passWithNoTests"
  }
}
```

- [ ] **Step 3: Create .env.example**

Create `backend/.env.example`:
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/calling_platform
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_char_encryption_key_here
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

- [ ] **Step 4: Create Express app**

Create `backend/src/app.js`:
```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware (at end)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Internal server error' });
  }
  res.status(err.status || 500).json({
    error: err.message,
    stack: err.stack
  });
});

export default app;
```

- [ ] **Step 5: Create server entry point**

Create `backend/server.js`:
```javascript
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 6: Test backend starts**

```bash
cd backend
npm run dev
```

Expected: Server starts on port 3000, responds to GET /health with { "status": "ok" }

- [ ] **Step 7: Commit**

```bash
cd /Users/roymota/Desktop/04_DESARROLLO/Llamadas\ Venezuela
git add backend/
git commit -m "feat: initialize backend project structure

- Setup Express app with security middleware
- Configure CORS, rate limiting, helmet
- Create main server entry point"
```

---

### Task 2: Database Configuration & Models

**Files:**
- Create: `backend/src/config/database.js`
- Create: `backend/src/utils/encryption.js`
- Create: `backend/src/models/Tenant.js`
- Create: `backend/src/models/Operator.js`
- Create: `backend/src/models/SalesScript.js`
- Create: `backend/src/models/CallRecord.js`
- Create: `backend/src/models/index.js`

- [ ] **Step 1: Create encryption utility**

Create `backend/src/utils/encryption.js`:
```javascript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedData) {
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

- [ ] **Step 2: Create database configuration**

Create `backend/src/config/database.js`:
```javascript
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export async function initializeDatabase() {
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
}

export default sequelize;
```

- [ ] **Step 3: Create Tenant model**

Create `backend/src/models/Tenant.js`:
```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  twilio_account_sid: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  twilio_auth_token: {
    type: DataTypes.TEXT,
    allowNull: false,
    set(value) {
      this.setDataValue('twilio_auth_token', encrypt(value));
    },
    get() {
      const encrypted = this.getDataValue('twilio_auth_token');
      return encrypted ? decrypt(encrypted) : null;
    }
  },
  monthly_budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'UTC'
  }
}, {
  timestamps: true,
  tableName: 'tenants'
});

export default Tenant;
```

- [ ] **Step 4: Create Operator model**

Create `backend/src/models/Operator.js`:
```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Operator = sequelize.define('Operator', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tenants',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  twilio_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  sip_uri: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'operators',
  indexes: [
    {
      unique: true,
      fields: ['tenant_id', 'twilio_number']
    }
  ]
});

export default Operator;
```

- [ ] **Step 5: Create SalesScript model**

Create `backend/src/models/SalesScript.js`:
```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SalesScript = sequelize.define('SalesScript', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tenants',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'sales_scripts'
});

export default SalesScript;
```

- [ ] **Step 6: Create CallRecord model**

Create `backend/src/models/CallRecord.js`:
```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CallRecord = sequelize.define('CallRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Tenants',
      key: 'id'
    }
  },
  operator_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Operators',
      key: 'id'
    }
  },
  twilio_call_sid: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  from_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  to_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  price_per_minute: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('initiated', 'ringing', 'answered', 'completed', 'failed'),
    defaultValue: 'initiated'
  },
  recording_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'call_records',
  indexes: [
    {
      fields: ['tenant_id', 'createdAt']
    },
    {
      fields: ['operator_id']
    }
  ]
});

export default CallRecord;
```

- [ ] **Step 7: Create models index**

Create `backend/src/models/index.js`:
```javascript
import Tenant from './Tenant.js';
import Operator from './Operator.js';
import SalesScript from './SalesScript.js';
import CallRecord from './CallRecord.js';

// Define associations
Tenant.hasMany(Operator, { foreignKey: 'tenant_id' });
Operator.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(SalesScript, { foreignKey: 'tenant_id' });
SalesScript.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(CallRecord, { foreignKey: 'tenant_id' });
CallRecord.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Operator.hasMany(CallRecord, { foreignKey: 'operator_id' });
CallRecord.belongsTo(Operator, { foreignKey: 'operator_id' });

export { Tenant, Operator, SalesScript, CallRecord };
```

- [ ] **Step 8: Update server.js to initialize database**

Modify `backend/server.js`:
```javascript
import app from './src/app.js';
import { initializeDatabase } from './src/config/database.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

- [ ] **Step 9: Commit**

```bash
git add backend/src/{models,config,utils}
git commit -m "feat: setup database models and encryption

- Create Tenant, Operator, SalesScript, CallRecord models
- Setup Sequelize ORM with PostgreSQL
- Implement AES-256 encryption for auth tokens"
```

---

---

## IMPLEMENTATION STATUS (Updated 2026-04-18 - 14:45)

### ✅ PHASE 1 COMPLETE: Backend MVP (9/9 tasks DONE)

**Task 1: Backend Project Setup** ✅ DONE
- Express app with security middleware (helmet, cors, rate limiting)
- All dependencies installed (express, sequelize, pg, twilio, etc.)
- Health check endpoint at GET /health

**Task 2: Database Configuration & Models** ✅ DONE
- Sequelize ORM with PostgreSQL connection pooling
- 4 Models: Tenant (encrypted Twilio creds), Operator, SalesScript, CallRecord
- AES-256-CBC encryption for sensitive data
- Proper foreign key relationships and indexes

**Task 3: Middleware** ✅ DONE
- tenancyMiddleware: X-Tenant-ID header + session-based isolation
- errorHandler: env-aware error responses (dev: full stack, prod: generic)
- Validation utils: E.164 phone, SIP URI, email regex
- Rate limiting: 10 calls/min per operator, 100 req/15min per tenant

**Task 4: Twilio Service** ✅ DONE
- TwilioService singleton with initiateCall() & getRecording()
- Per-tenant Twilio client management
- Call recording configuration (record-from-answer, mono channels)

**Task 5: Calls Service & Routes** ✅ DONE
- CallsService: recordCall, updateCallEvent, getCallLogs, getCallById
- Routes: POST /calls/initiate, GET /calls/logs, GET /calls/:id
- Tenant isolation + pagination + filtering + phone validation

**Task 6: Operators Service & Routes** ✅ DONE
- OperatorsService: Full CRUD with phone & SIP URI validation
- Routes: GET /operators, POST /operators, GET /:id, PUT /:id, DELETE /:id
- Unique constraint on (tenant_id, twilio_number)

**Task 7: Scripts Service & Routes** ✅ DONE
- ScriptsService: CRUD for sales scripts
- Routes: GET /scripts, POST /scripts, GET /:id, PUT /:id, DELETE /:id
- Support for plain text static scripts

**Task 8: Analytics Service & Routes** ✅ DONE
- AnalyticsService: getDashboardSummary, getCallsByOperator, getCostBreakdown, checkBudgetAlert
- Routes: /summary (today + MTD), /operators, /cost, /budget-alert
- Sequelize aggregations for efficient queries

**Task 9: Twilio Webhook & Auth Routes** ✅ DONE
- Webhook: POST /webhooks/twilio (receives call events from Twilio)
- Auth: POST /login (tenant key), POST /logout, GET /verify
- Session-based auth with tenant_id propagation

### 📊 BACKEND API SUMMARY

**15 API Endpoints Ready:**
- 3 Auth endpoints (login, logout, verify)
- 3 Calls endpoints (initiate, logs, detail)
- 5 Operators endpoints (list, create, get, update, delete)
- 5 Scripts endpoints (list, create, get, update, delete)
- 4 Analytics endpoints (summary, operators, cost, budget-alert)
- 1 Webhook endpoint (Twilio events)

See `docs/API_ENDPOINTS.md` for complete reference.

### ⏳ PHASE 2 IN PROGRESS: Frontend (Tasks 10-14)

**Task 10:** Frontend Project Setup (Vite + React)
**Task 11:** Types & API Client (TypeScript types + axios)
**Task 12:** Auth & Store (Zustand + login)
**Task 13:** Main Components (Dashboard, CallLogs, Operators, Scripts)
**Task 14:** Analytics & Advanced (Charts, budget alerts, modals)

### 📋 TODO PHASE 3:
**Tasks 15-19:** Environment setup, Railway backend deploy, Vercel frontend deploy, Twilio config, final testing

---