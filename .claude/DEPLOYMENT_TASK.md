# 🚀 DEPLOYMENT TASK FOR CLAUDE CODE

## Task Overview

**Objetivo:** Desplegar completamente "Llamadas Venezuela" a producción en 60-90 minutos.

**Stack:**
- Backend: Node.js + Express en Railway
- Frontend: React + Vite en Vercel
- Database: PostgreSQL en Railway
- Messaging: Twilio Integration

---

## Step-by-Step Instructions

### Phase 1: Collect Credentials (5 min)

**Do this FIRST:**

1. **Ask the user for 4 credentials:**

```markdown
I need to collect credentials to deploy your application. Please provide:

1. **Twilio Account SID**
   - Go to: https://www.twilio.com/console
   - Copy your Account SID (starts with AC)
   
2. **Twilio Auth Token**
   - Copy from the same Twilio console
   
3. **Railway API Token**
   - Go to: https://railway.app/account/tokens
   - Create new token and copy it
   
4. **Vercel API Token**
   - Go to: https://vercel.com/account/tokens
   - Create new token and copy it

Please provide each value when ready.
```

2. **Validate each credential:**
   - Twilio SID: Must start with "AC", 34 chars
   - Twilio Token: 30+ chars
   - Railway Token: Not empty
   - Vercel Token: Not empty

3. **Create `.secrets/credentials.json`:**

```json
{
  "createdAt": "2024-04-19T00:00:00Z",
  "twilio": {
    "accountSid": "<PROVIDED_VALUE>",
    "authToken": "<PROVIDED_VALUE>"
  },
  "railway": {
    "apiToken": "<PROVIDED_VALUE>"
  },
  "vercel": {
    "token": "<PROVIDED_VALUE>"
  }
}
```

### Phase 2: Configure Files (10 min)

1. **Read** `.secrets/credentials.json`
2. **Update** `backend/.env`:
   - Replace `TWILIO_ACCOUNT_SID` with real value
   - Replace `TWILIO_AUTH_TOKEN` with real value
3. **Update** `frontend/.env`:
   - Keep `VITE_API_URL=http://localhost:3000/api` (will update later)

### Phase 3: Git Commit & Push (5 min)

```bash
cd /Users/roymota/Desktop/04_DESARROLLO/Llamadas\ Venezuela/

git add backend/.env frontend/.env

git commit -m "feat: configure deployment credentials for Railway and Vercel"

git push origin main
```

### Phase 4: Deploy Backend to Railway (20 min)

1. **Create Railway project:**
   - Go to https://railway.app/dashboard
   - Click "+ New Project"
   - Select "Deploy from GitHub"
   - Select repository
   - Branch: main

2. **Add PostgreSQL:**
   - Click "+ Add Service"
   - Select "PostgreSQL"
   - Wait for creation

3. **Configure Environment Variables:**
   - Go to Backend service > Variables
   - Add:
     ```
     NODE_ENV=production
     PORT=3000
     JWT_SECRET=3b7fb0e2cbd1ebf7b0a2a12ce5415a668c3a464c040fddf2e58de7c84f459f25
     ENCRYPTION_KEY=6b315a3fdacdf576342ee1d3ffbcc491
     TWILIO_ACCOUNT_SID=<from credentials.json>
     TWILIO_AUTH_TOKEN=<from credentials.json>
     FRONTEND_URL=http://localhost:5173
     BACKEND_URL=http://localhost:3000
     ```
   - DATABASE_URL: Railway injects automatically

4. **Wait for deployment** (green status)

5. **Get Backend URL:**
   - Go to Deployments
   - Copy public URL (e.g., https://llamadas-venezuela.railway.app)
   - **Save this URL**

### Phase 5: Deploy Frontend to Vercel (15 min)

1. **Create Vercel project:**
   - Go to https://vercel.com/new
   - Import GitHub repository
   - Select main branch

2. **Configure Build:**
   - Framework: Vite (auto-detected)
   - Root: `./frontend`

3. **Add Environment Variables:**
   ```
   VITE_API_URL=https://[RAILWAY_URL]/api
   VITE_API_TIMEOUT=30000
   ```
   Replace `[RAILWAY_URL]` with URL from Phase 4

4. **Deploy**

5. **Get Frontend URL:**
   - Copy public URL (e.g., https://llamadas-venezuela.vercel.app)
   - **Save this URL**

### Phase 6: Update Railway with Final URLs (5 min)

Go back to Railway Backend:
- Update Variables:
  ```
  FRONTEND_URL=https://[VERCEL_URL]
  BACKEND_URL=https://[RAILWAY_URL]
  ```
- Click "Deploy" to apply changes

### Phase 7: Configure Twilio Webhook (5 min)

1. Go to https://www.twilio.com/console
2. Voice > Phone Numbers
3. Select your phone number
4. Set "A Call Comes In" webhook to:
   ```
   https://[RAILWAY_URL]/webhooks/twilio
   ```
5. Method: POST
6. Save

### Phase 8: E2E Testing (15 min)

1. **Test Frontend:**
   - Open https://[VERCEL_URL]
   - Should see login page

2. **Test Login:**
   - Email: admin@example.com
   - Password: AdminPassword123!
   - Tenant: tenant1
   - Should see Dashboard

3. **Test Create Operator:**
   - Go to "Operadores"
   - Create new operator
   - Should appear in list

4. **Check Logs:**
   - Railway Backend > Logs
   - Vercel > Logs
   - No red errors

---

## Expected Results

✅ User can access frontend at public URL  
✅ User can login with test credentials  
✅ User can create operators  
✅ Analytics dashboard works  
✅ No errors in production logs  
✅ Twilio webhook registered  

---

## Important Notes

1. **Credentials Storage:**
   - All saved in `.secrets/credentials.json`
   - File is in `.gitignore` (never committed)
   - Only visible locally

2. **Timeline:**
   - Phase 1: 5 min
   - Phase 2: 10 min
   - Phase 3: 5 min
   - Phase 4: 20 min
   - Phase 5: 15 min
   - Phase 6: 5 min
   - Phase 7: 5 min
   - Phase 8: 15 min
   - **Total: ~80 minutes**

3. **If Something Fails:**
   - Check logs in Railway/Vercel dashboards
   - Verify credentials are correct
   - Read `DEPLOYMENT_GUIDE.md` for troubleshooting
   - Don't commit credentials to Git

---

## Deliverables

After completion:

- ✅ Backend live on Railway
- ✅ Frontend live on Vercel
- ✅ PostgreSQL database active
- ✅ Twilio webhook configured
- ✅ Application fully functional
- ✅ No uncommitted credentials

---

## Files Referenced

- `CLAUDE_CODE_INSTRUCTIONS.md` - Detailed instructions
- `DEPLOYMENT_GUIDE.md` - Troubleshooting & deep dive
- `CREDENTIALS_NEEDED.md` - How to get credentials
- `DEPLOYMENT_CHECKLIST.md` - Quick reference
- `.secrets/credentials.json` - Your credentials (created)
- `backend/.env` - Backend configuration (updated)
- `frontend/.env` - Frontend configuration (unchanged)

---

**Status:** 🟢 READY TO EXECUTE  
**Last Updated:** 2026-04-19
