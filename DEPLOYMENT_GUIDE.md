# 🚀 Guía de Deployment - Llamadas Venezuela

Este documento contiene instrucciones paso a paso para desplegar la plataforma a producción usando **Railway** (backend) y **Vercel** (frontend).

**Tiempo estimado:** 45 minutos a 1 hora  
**Requisitos previos:**
- Cuenta Railway (https://railway.app) 
- Cuenta Vercel (https://vercel.com)
- Credenciales activas de Twilio
- Git instalado y configurado

---

## 📋 PASO 1: Preparar Credenciales (5 min)

### 1.1 Actualizar Twilio Credentials

Abre `/backend/.env` y reemplaza:

```env
TWILIO_ACCOUNT_SID=AC_YOUR_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=your_auth_token_here
```

Con tus valores reales de https://www.twilio.com/console

### 1.2 Verificar otros valores en .env

Estos ya están configurados con valores seguros generados:
- ✅ `JWT_SECRET=3b7fb0e2cbd1ebf7b0a2a12ce5415a668c3a464c040fddf2e58de7c84f459f25`
- ✅ `ENCRYPTION_KEY=6b315a3fdacdf576342ee1d3ffbcc491`
- ✅ `NODE_ENV=production`

---

## 🚂 PASO 2: Desplegar Backend a Railway (20 min)

### 2.1 Crear Proyecto en Railway

1. Ve a https://railway.app/dashboard
2. Haz clic en **"+ New Project"**
3. Selecciona **"Deploy from GitHub"**
4. Conecta tu repositorio (o usa "GitHub" si está autorizado)
5. Selecciona el branch `main`

### 2.2 Provisionar PostgreSQL

1. En el dashboard del proyecto, haz clic en **"+ Add service"**
2. Busca y selecciona **"PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. Espera ~1 minuto a que se complete

### 2.3 Configurar Variables de Entorno

En el panel del proyecto Backend:

1. Haz clic en **"Variables"**
2. Añade estas variables (copia desde tu `/backend/.env`):

```
NODE_ENV=production
PORT=3000
JWT_SECRET=3b7fb0e2cbd1ebf7b0a2a12ce5415a668c3a464c040fddf2e58de7c84f459f25
ENCRYPTION_KEY=6b315a3fdacdf576342ee1d3ffbcc491
TWILIO_ACCOUNT_SID=AC_xxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
```

3. Para `DATABASE_URL`: Railway **automáticamente lo inyecta** desde PostgreSQL
   - Si NO aparece automáticamente, cópialo desde la pestaña PostgreSQL → Variables

4. Para `FRONTEND_URL`: Pon un placeholder por ahora
   ```
   FRONTEND_URL=http://localhost:5173
   ```
   (Lo actualizaremos después cuando tengamos la URL de Vercel)

5. Para `BACKEND_URL`: Railway te dará una URL pública, por ahora:
   ```
   BACKEND_URL=http://localhost:3000
   ```
   (Lo actualizaremos después cuando esté deployado)

### 2.4 Deploy automático

1. Railway **automáticamente detecta** que es Node.js
2. Espera a que vea el archivo `railroad.json`
3. El build comenzará automáticamente
4. Verás logs en tiempo real
5. **Espera ~5 minutos** a que el servidor esté online

### 2.5 Obtener la URL del Backend

1. Una vez que el deploy termine, ve a la pestaña **"Deployments"**
2. Haz clic en el deployment más reciente
3. Copia la URL pública (algo como: `https://llamadas-venezuela.railway.app`)
4. **Guarda esta URL** - la necesitarás pronto

---

## 🎨 PASO 3: Desplegar Frontend a Vercel (15 min)

### 3.1 Crear Proyecto en Vercel

1. Ve a https://vercel.com/new
2. Importa tu repositorio (GitHub, GitLab, Bitbucket)
3. Selecciona el repositorio de Llamadas Venezuela

### 3.2 Configurar el Build

En las opciones de build:

- **Framework Preset:** Vite (detectado automáticamente)
- **Root Directory:** `./frontend` (Vercel lo detecta automáticamente)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 3.3 Configurar Variables de Entorno

En **"Environment Variables"**, añade:

```
VITE_API_URL=https://tu-railway-url.railway.app/api
VITE_API_TIMEOUT=30000
```

Reemplaza `tu-railway-url` con la URL que obtuviste en el Paso 2.5

### 3.4 Deploy

1. Haz clic en **"Deploy"**
2. Vercel construirá automáticamente
3. Espera ~3-5 minutos
4. **Copiar la URL de tu frontend** (algo como: `https://llamadas-venezuela.vercel.app`)

---

## 🔄 PASO 4: Actualizar URLs en Railway (5 min)

Ahora que tienes ambas URLs, actualiza las variables en Railway:

### 4.1 Backend - Variables

1. Ve al dashboard de Railway
2. Haz clic en el servicio **Backend**
3. Abre **"Variables"**
4. Actualiza:

```
FRONTEND_URL=https://tu-vercel-url.vercel.app
BACKEND_URL=https://tu-railway-url.railway.app
```

5. Haz clic en **"Deploy"** para que tome efecto

### 4.2 Esperar redeploy

Railway automáticamente redeploy cuando cambias variables (espera ~2 min)

---

## 🪝 PASO 5: Configurar Webhook de Twilio (10 min)

Una vez que el backend esté online:

### 5.1 Obtener URL del Webhook

La URL será: `https://tu-railway-url.railway.app/webhooks/twilio`

Reemplaza `tu-railway-url` con tu URL real de Railway

### 5.2 Registrar en Twilio Console

1. Ve a https://www.twilio.com/console
2. **Voice > Phone Numbers** (o Programmable Voice)
3. Selecciona tu número de teléfono
4. Busca **"Webhooks"** o **"Voice Configuration"**
5. En **"A Call Comes In"**, configura:
   - **URL:** `https://tu-railway-url.railway.app/webhooks/twilio`
   - **HTTP Method:** POST
6. Guarda

### 5.3 Probar conexión

Haz una petición HTTP para verificar:

```bash
curl -X POST https://tu-railway-url.railway.app/webhooks/twilio \
  -H "Content-Type: application/json" \
  -d '{"CallStatus":"ringing"}'
```

Deberías recibir un XML response de Twilio (no error 404)

---

## ✅ PASO 6: Testing E2E (15 min)

### 6.1 Prueba de Frontend

1. Abre `https://tu-vercel-url.vercel.app`
2. **Login:**
   - Email: `admin@example.com`
   - Password: `AdminPassword123!`
   - Tenant: `tenant1`
3. Deberías ver el Dashboard

### 6.2 Prueba de Conexión a Backend

1. En el Dashboard, ve a **"Operadores"**
2. Intenta crear un operador nuevo
3. Completa los campos:
   - **Nombre:** Test Operator
   - **Email:** test@example.com
   - **Teléfono:** +5804129999999
   - **SIP:** sip:test@pbx.example.com
4. Haz clic en **"Guardar"**
5. **Resultado esperado:** El operador aparece en la lista (conexión backend OK ✅)

### 6.3 Prueba de Llamadas

1. Ve a **"Llamadas"** / **"Iniciar Llamada"**
2. Selecciona un operador
3. Ingresa un número de teléfono
4. Haz clic en **"Iniciar Llamada"**
5. **Resultado esperado:** 
   - La llamada aparece en los logs
   - Deberías ver que se intentó conectar a Twilio
   - Status cambia según el estado de Twilio

### 6.4 Prueba de Analytics

1. Ve a **"Analytics"**
2. Deberías ver gráficos con datos de prueba (si hay llamadas)
3. Verifica presupuestos y alertas

### 6.5 Revisar Logs del Backend

En Railway:

1. Ve a tu servicio Backend
2. Abre **"Logs"**
3. Filtra por errores: busca `ERROR` o `error`
4. **No debe haber errores** ❌ Si los hay, analiza y corrige

---

## 🐛 Troubleshooting Común

### Frontend no se conecta al backend
**Síntoma:** Errores CORS o "cannot reach API"  
**Solución:**
1. Verifica `VITE_API_URL` en Vercel environment variables
2. Verifica que Railway backend esté online (revisa logs)
3. Asegúrate que `BACKEND_URL` en Railway está correcto

### Base de datos no se conecta
**Síntoma:** Errores "database connection failed"  
**Solución:**
1. Railway > PostgreSQL > Variables
2. Copia `DATABASE_URL` completo
3. Verifica que esté en backend variables

### Twilio webhook no responde
**Síntoma:** Llamadas no se registran en logs  
**Solución:**
1. Verifica URL webhook es exacta
2. Intenta llamar al endpoint webhook manualmente
3. Revisa logs del backend en Railway

### Variables de entorno no se aplican
**Síntoma:** Cambios en .env no afectan  
**Solución:**
1. Railway/Vercel requiere redeploy después de cambiar variables
2. En Railway: haz clic en "Deploy" en el panel
3. En Vercel: haz un nuevo push a GitHub o redeploy manual

---

## 📞 Configuración de Twilio (Referencia)

Si aún no tienes Twilio configurado:

1. **Crear cuenta:** https://www.twilio.com/try-twilio
2. **Obtener número:** Voice > Phone Numbers > Buy Numbers
3. **Configurar SIP Trunks (opcional):** Voice > SIP Trunks
4. **API Credentials:** Console > API Keys & Tokens

---

## ✨ Checklist Final

- [ ] `.env` files creados con credenciales reales
- [ ] Backend deployado a Railway ✅
- [ ] PostgreSQL base de datos creada ✅
- [ ] Frontend deployado a Vercel ✅
- [ ] Variables de entorno actualizadas en ambas plataformas ✅
- [ ] Webhook de Twilio registrado ✅
- [ ] Testing E2E completado ✅
- [ ] Sin errores en logs ✅
- [ ] Login funciona ✅
- [ ] API calls funcionan ✅

---

## 🎉 ¡Listo!

Si completaste todos los pasos, ¡tu plataforma está en producción!

**URLs importantes:**
- Frontend: `https://tu-vercel-url.vercel.app`
- Backend API: `https://tu-railway-url.railway.app/api`

**Próximos pasos:**
1. Monitorear logs regularmente
2. Configurar alertas en Sentry (opcional)
3. Escalar operadores y números telefónicos
4. Implementar features adicionales (email, WebSocket, etc.)

---

## 📚 Referencias

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Twilio Docs](https://www.twilio.com/docs)
- [Sequelize Docs](https://sequelize.org)
- [React Docs](https://react.dev)
