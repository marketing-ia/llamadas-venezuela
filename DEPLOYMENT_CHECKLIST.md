# ⚡ Quick Deployment Checklist - Llamadas Venezuela

**Completado:** ✅  
**En progreso:** ⏳  
**Pendiente:** ⏸️

---

## 📦 ARCHIVOS CREADOS (✅ COMPLETADO)

- ✅ `/backend/.env` - Configuración backend con valores seguros
- ✅ `/frontend/.env` - Configuración frontend  
- ✅ `railway.json` - Configuración para Railway deployment
- ✅ `vercel.json` - Configuración para Vercel deployment
- ✅ `DEPLOYMENT_GUIDE.md` - Guía detallada paso a paso
- ✅ Este archivo de checklist

---

## 🎯 PRÓXIMOS PASOS (⏳ TU TURNO)

### 1️⃣ ANTES DE HACER PUSH (5 min)

```bash
# En tu terminal, desde la raíz del proyecto:

# 1. Abre el archivo .env y actualiza Twilio credentials
nano backend/.env
# Reemplaza:
#   TWILIO_ACCOUNT_SID=AC_YOUR_ACCOUNT_SID_HERE
#   TWILIO_AUTH_TOKEN=your_auth_token_here
# Con tus valores reales

# 2. Verifica que los archivos existan
ls -la backend/.env
ls -la frontend/.env
ls -la railway.json
ls -la vercel.json
```

### 2️⃣ COMMIT Y PUSH

```bash
# Desde la raíz del proyecto
git add backend/.env frontend/.env railway.json vercel.json

git commit -m "feat: add deployment configuration and environment files for Railway/Vercel"

git push origin main
```

### 3️⃣ RAILWAY DEPLOYMENT (20 min)

**En https://railway.app:**

1. ✅ Crear nuevo proyecto
2. ✅ Conectar repo de GitHub
3. ✅ Seleccionar branch `main`
4. ✅ Railway detecta `server.js` automáticamente
5. ✅ Añadir servicio PostgreSQL
6. ✅ Esperar a que se auto-configure
7. ✅ Copiar `DATABASE_URL` desde PostgreSQL
8. ✅ Añadir todas las variables de `.env` a Backend
9. ✅ Deploy automático comienza
10. 🎯 **Obtener URL pública del backend**

**URL del backend se verá así:**  
`https://llamadas-venezuela.railway.app`

### 4️⃣ VERCEL DEPLOYMENT (15 min)

**En https://vercel.com:**

1. ✅ Ir a "Add New..." > "Project"
2. ✅ Importar repositorio
3. ✅ Framework: Vite (auto-detectado)
4. ✅ Root: `./frontend`
5. ✅ Añadir variable: `VITE_API_URL=https://tu-railway-url.railway.app/api`
6. ✅ Click Deploy
7. 🎯 **Obtener URL pública del frontend**

**URL del frontend se verá así:**  
`https://llamadas-venezuela.vercel.app`

### 5️⃣ ACTUALIZAR RAILWAY CON FRONTEND URL (2 min)

Vuelve a Railway > Variables del Backend:

```
FRONTEND_URL=https://tu-vercel-url.vercel.app
BACKEND_URL=https://tu-railway-url.railway.app
```

Click "Deploy" para aplicar cambios.

### 6️⃣ TWILIO WEBHOOK (5 min)

En https://www.twilio.com/console:

1. ✅ Voice > Phone Numbers
2. ✅ Selecciona tu número
3. ✅ En "A Call Comes In": POST a `https://tu-railway-url.railway.app/webhooks/twilio`
4. ✅ Save

### 7️⃣ TESTING (10 min)

1. ✅ Abre `https://tu-vercel-url.vercel.app`
2. ✅ Login: `admin@example.com` / `AdminPassword123!` / `tenant1`
3. ✅ Crea un operador en "Operadores"
4. ✅ Intenta iniciar una llamada en "Llamadas"
5. ✅ Revisa "Analytics" para logs

---

## 🔐 CREDENCIALES SEGURAS YA CONFIGURADAS

```
JWT_SECRET=3b7fb0e2cbd1ebf7b0a2a12ce5415a668c3a464c040fddf2e58de7c84f459f25
ENCRYPTION_KEY=6b315a3fdacdf576342ee1d3ffbcc491
```

✅ Estos valores ya están en `.env` - NO cambies

---

## ⚠️ IMPORTANTE

### `.env` files NO deben subirse a GitHub

Verifica que está en `.gitignore`:

```bash
cat .gitignore | grep ".env"
# Debería mostrar: *.env (o al menos *.env.local)
```

✅ `.env.example` files sí pueden compartirse (ya existen)

---

## 📞 CREDENCIALES DE PRUEBA (para testing)

```
Email: admin@example.com
Password: AdminPassword123!
Tenant: tenant1
```

Usa estas para verificar que el login funciona después del deployment.

---

## 🆘 SI ALGO FALLA

### Error: "Cannot connect to database"
- [ ] Verifica que `DATABASE_URL` esté en Railway variables
- [ ] Verifica que PostgreSQL esté online (Deployments tab)

### Error: "Frontend cannot reach API"
- [ ] Verifica `VITE_API_URL` en Vercel
- [ ] Verifica que Railway backend esté online
- [ ] Revisa logs en Railway

### Error: "Twilio webhook not working"
- [ ] Verifica webhook URL es exacta
- [ ] Revisa logs del backend en Railway

**Lee DEPLOYMENT_GUIDE.md para troubleshooting completo**

---

## 📊 TIMELINE

| Paso | Tiempo | Estado |
|------|--------|--------|
| Preparar credenciales | 5 min | ⏳ |
| Railway deployment | 20 min | ⏳ |
| Vercel deployment | 15 min | ⏳ |
| Actualizar URLs | 2 min | ⏳ |
| Twilio webhook | 5 min | ⏳ |
| Testing | 10 min | ⏳ |
| **TOTAL** | **57 min** | ⏳ |

---

## ✨ CUANDO TERMINES

Si todo sale bien, acceso a:

- 🎨 Frontend: `https://tu-vercel-url.vercel.app`
- 🔌 Backend API: `https://tu-railway-url.railway.app/api`
- 📊 Dashboard: Visible después de login

---

## 📚 DOCUMENTACIÓN

Todos estos archivos están en `/Desktop/04_DESARROLLO/Llamadas Venezuela/`:

- `DEPLOYMENT_GUIDE.md` ← Instrucciones detalladas paso a paso
- `DEPLOYMENT_CHECKLIST.md` ← Este archivo
- `backend/.env` ← Variables backend
- `frontend/.env` ← Variables frontend
- `railway.json` ← Config Railway
- `vercel.json` ← Config Vercel

---

## 🚀 LISTO PARA EMPEZAR?

1. Abre `DEPLOYMENT_GUIDE.md` en tu editor
2. Sigue paso a paso
3. ¡Que no te de miedo! Está automatizado al máximo

**¡Buena suerte! 🎉**
