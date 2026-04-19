# 🤖 Instrucciones para Claude Code - Deployment Completo

## Visión General

Este documento contiene **instrucciones paso a paso** para que Claude Code implemente el deployment completo de **Llamadas Venezuela** a producción.

**Tiempo estimado:** 60-90 minutos  
**Resultado final:** Aplicación en vivo en Railway (backend) + Vercel (frontend)

---

## 🎯 OBJETIVO FINAL

Desplegar completamente la aplicación "Llamadas Venezuela" de modo que:

1. ✅ Backend funciona en Railway (`https://llamadas-venezuela.railway.app`)
2. ✅ Frontend funciona en Vercel (`https://llamadas-venezuela.vercel.app`)
3. ✅ Base de datos PostgreSQL funcionando en Railway
4. ✅ Twilio webhook configurado y activo
5. ✅ Testing E2E pasando correctamente

---

## 📋 FLUJO PRINCIPAL

```
INICIO
  ↓
[1] Solicitar credenciales
  ↓
[2] Validar y guardar credenciales en .secrets/
  ↓
[3] Inyectar en archivos .env
  ↓
[4] Actualizar configuración final
  ↓
[5] Hacer git commit y push
  ↓
[6] Desplegar backend a Railway
  ↓
[7] Desplegar frontend a Vercel
  ↓
[8] Configurar webhook de Twilio
  ↓
[9] Testing E2E
  ↓
COMPLETADO ✅
```

---

## 🔑 FASE 1: Solicitar y Guardar Credenciales

### Tarea 1.1: Solicitar credenciales al usuario

**Acción:** Pedir las siguientes credenciales:

```
1. TWILIO_ACCOUNT_SID (formato: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
2. TWILIO_AUTH_TOKEN (cadena larga)
3. RAILWAY_API_TOKEN (cadena larga, de https://railway.app/account/tokens)
4. VERCEL_TOKEN (cadena larga, de https://vercel.com/account/tokens)
```

**Instrucciones para el usuario:**

```markdown
# Necesito 4 credenciales. Por favor proporcionalas:

## Twilio
- Ir a: https://www.twilio.com/console
- Copiar Account SID y Auth Token

## Railway
- Ir a: https://railway.app/account/tokens
- Crear nuevo token
- Copiar el token

## Vercel
- Ir a: https://vercel.com/account/tokens
- Crear nuevo token
- Copiar el token

(Proporciona cada valor cuando esté listo)
```

### Tarea 1.2: Validar formato de credenciales

**Para cada credencial:**

1. TWILIO_ACCOUNT_SID:
   - Debe empezar con `AC`
   - Debe tener 34 caracteres
   - No debe contener espacios

2. TWILIO_AUTH_TOKEN:
   - Debe tener 32+ caracteres
   - No debe contener espacios

3. RAILWAY_API_TOKEN:
   - No debe estar vacío
   - No debe contener espacios
   - Token válido de Railway

4. VERCEL_TOKEN:
   - No debe estar vacío
   - No debe contener espacios
   - Token válido de Vercel

### Tarea 1.3: Crear archivo .secrets/credentials.json

**Crear archivo:** `.secrets/credentials.json`

**Contenido:**

```json
{
  "createdAt": "2024-04-19T07:00:00Z",
  "twilio": {
    "accountSid": "<TWILIO_ACCOUNT_SID>",
    "authToken": "<TWILIO_AUTH_TOKEN>"
  },
  "railway": {
    "apiToken": "<RAILWAY_API_TOKEN>"
  },
  "vercel": {
    "token": "<VERCEL_TOKEN>"
  }
}
```

**Verificación:**
- ✅ Archivo exists en `.secrets/credentials.json`
- ✅ JSON válido (no errores de sintaxis)
- ✅ Todos los campos presentes

---

## 🔧 FASE 2: Inyectar Credenciales en .env Files

### Tarea 2.1: Actualizar backend/.env

**Leer:** `.secrets/credentials.json`

**Actualizar:** `backend/.env`

Reemplazar:
```env
TWILIO_ACCOUNT_SID=AC_YOUR_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=your_auth_token_here
```

Con valores reales de `credentials.json`

**Resultado:**
```env
TWILIO_ACCOUNT_SID=<actual_value>
TWILIO_AUTH_TOKEN=<actual_value>
```

### Tarea 2.2: Configurar DATABASE_URL

**Para Railway:**

Aún no tenemos `DATABASE_URL` (se genera después de crear proyecto en Railway).

**Acción provisional:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/calling_platform
```

**Se actualizará en Fase 4 con URL real de Railway**

---

## 🚀 FASE 3: Git Commit y Push

### Tarea 3.1: Preparar commit

```bash
cd /Users/roymota/Desktop/04_DESARROLLO/Llamadas\ Venezuela/

git status
# Debe mostrar cambios en:
# - backend/.env
# - frontend/.env (si se actualizó)
```

### Tarea 3.2: Hacer commit

```bash
git add backend/.env frontend/.env

git commit -m "feat: configure deployment credentials for Railway and Vercel"

# Verificar:
git log -1 --oneline
```

### Tarea 3.3: Push a main

```bash
git push origin main

# Verificar en GitHub que los cambios llegaron
```

⚠️ **Nota:** `.env` files NO se pushean (están en .gitignore)  
✅ **Se pushea:** El contenido del commit anterior (sin credenciales)

---

## 🚂 FASE 4: Desplegar Backend a Railway

### Tarea 4.1: Crear proyecto en Railway

**En Railway:**

1. Ve a https://railway.app/dashboard
2. Haz clic en **"+ New Project"**
3. Selecciona **"Deploy from GitHub"**
4. Autoriza y selecciona: `tu-repo/Llamadas Venezuela`
5. Branch: `main`

### Tarea 4.2: Esperar detección automática

**Railway detectará:**
- ✅ Node.js (por package.json en /backend)
- ✅ Build command (por railway.json)
- ✅ Start command (por package.json)

**Tiempo:** ~2 minutos

### Tarea 4.3: Añadir PostgreSQL

**En proyecto Railway:**

1. Haz clic en **"+ Add Service"**
2. Busca **"PostgreSQL"**
3. Selecciona y espera a que se cree

**Railway automáticamente:**
- ✅ Crea base de datos
- ✅ Genera `DATABASE_URL`
- ✅ La inyecta en environment variables

**Tiempo:** ~2 minutos

### Tarea 4.4: Inyectar variables de entorno

**En panel del proyecto Backend:**

1. Pestaña **"Variables"**
2. Añade (desde `credentials.json`):

```
NODE_ENV=production
PORT=3000
JWT_SECRET=3b7fb0e2cbd1ebf7b0a2a12ce5415a668c3a464c040fddf2e58de7c84f459f25
ENCRYPTION_KEY=6b315a3fdacdf576342ee1d3ffbcc491
TWILIO_ACCOUNT_SID=<actual_value>
TWILIO_AUTH_TOKEN=<actual_value>
FRONTEND_URL=http://localhost:5173  (placeholder por ahora)
BACKEND_URL=http://localhost:3000   (placeholder por ahora)
```

3. DATABASE_URL: **Railway lo inyecta automáticamente**

### Tarea 4.5: Monitorear deployment

**En Railway:**

1. Pestaña **"Deployments"**
2. Ver logs en vivo
3. Esperar a que el deployment esté **"Success"** (color verde)

**Señales de éxito:**
```
✅ Build successful
✅ Server started on port 3000
✅ Database connected
```

**Tiempo:** ~5-10 minutos

### Tarea 4.6: Obtener URL pública del backend

**En Railway:**

1. Pestaña **"Deployments"**
2. Haz clic en deployment actual
3. En **"URL"** verás algo como: `https://llamadas-venezuela.railway.app`
4. **Guarda esta URL** - la necesitarás

---

## 🎨 FASE 5: Desplegar Frontend a Vercel

### Tarea 5.1: Crear proyecto en Vercel

**En Vercel:**

1. Ve a https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Selecciona: `tu-repo/Llamadas Venezuela`

### Tarea 5.2: Configurar build

**Vercel detectará automáticamente:**
- Framework: Vite ✅
- Root directory: `./frontend` ✅

### Tarea 5.3: Inyectar variables de entorno

**En Vercel, pestaña "Environment Variables":**

```
VITE_API_URL=https://llamadas-venezuela.railway.app/api
VITE_API_TIMEOUT=30000
```

(Reemplaza `llamadas-venezuela` con tu URL real de Railway)

### Tarea 5.4: Deploy

1. Haz clic en **"Deploy"**
2. Vercel construirá automáticamente
3. Espera a que sea verde (Success)

**Tiempo:** ~3-5 minutos

### Tarea 5.5: Obtener URL pública del frontend

**En Vercel:**

1. Once desplegado, verás URL como: `https://llamadas-venezuela.vercel.app`
2. **Guarda esta URL**

---

## 🔄 FASE 6: Actualizar URLs en Railway

Ahora que tienes ambas URLs, actualiza Railway con las correctas:

### Tarea 6.1: Actualizar variables en Railway

**En Railway Backend, pestaña Variables:**

Actualiza:
```
FRONTEND_URL=https://llamadas-venezuela.vercel.app
BACKEND_URL=https://llamadas-venezuela.railway.app
```

### Tarea 6.2: Triggerar redeploy

**En Railway:**
1. Haz clic en **"Deploy"**
2. Espera a que esté verde
3. **Tiempo:** ~2-3 minutos

---

## 🪝 FASE 7: Configurar Webhook de Twilio

### Tarea 7.1: Obtener URL del webhook

Tu webhook estará en:
```
https://llamadas-venezuela.railway.app/webhooks/twilio
```

(Reemplaza con tu URL real)

### Tarea 7.2: Registrar en Twilio

**En Twilio Console:**

1. Ve a https://www.twilio.com/console
2. **Voice > Phone Numbers**
3. Selecciona tu número telefónico
4. Busca **"Webhooks" o "Voice Configuration"**
5. En **"A Call Comes In"**, configura:
   - **URL:** `https://llamadas-venezuela.railway.app/webhooks/twilio`
   - **HTTP Method:** `POST`
6. **Save**

### Tarea 7.3: Probar webhook

```bash
curl -X POST https://llamadas-venezuela.railway.app/webhooks/twilio \
  -H "Content-Type: application/json" \
  -d '{"CallStatus":"ringing"}'
```

**Resultado esperado:** XML response (no 404 o 500)

---

## ✅ FASE 8: Testing E2E

### Tarea 8.1: Probar acceso al frontend

1. Abre: `https://llamadas-venezuela.vercel.app`
2. Deberías ver página de login
3. **✅ Si ves login:** Frontend funcionando

### Tarea 8.2: Probar login

1. Email: `admin@example.com`
2. Password: `AdminPassword123!`
3. Tenant: `tenant1`
4. Haz clic en **"Login"**

**✅ Si ves Dashboard:** Backend conectado

### Tarea 8.3: Probar crear operador

1. Ve a **"Operadores"**
2. Haz clic en **"+ Nuevo Operador"**
3. Completa:
   - Nombre: `Test Operator`
   - Email: `test@example.com`
   - Teléfono: `+5804129999999`
   - SIP: `sip:test@pbx.example.com`
4. Haz clic en **"Guardar"**

**✅ Si aparece en lista:** Database funcionando

### Tarea 8.4: Revisar logs

**En Railway:**
1. Backend > Logs
2. Busca por "ERROR"
3. No debe haber errores rojos

**En Vercel:**
1. Project > Logs
2. No debe haber errores

### Tarea 8.5: Probar analytics

1. Ve a **"Analytics"**
2. Deberías ver gráficos
3. Presupuestos visibles

---

## 📊 Checklist Final

- [ ] Credenciales guardadas en `.secrets/credentials.json`
- [ ] Backend `.env` actualizado con credenciales
- [ ] Frontend `.env` actualizado
- [ ] Git commit hecho y pusheado
- [ ] Proyecto Railway creado
- [ ] PostgreSQL en Railway creado
- [ ] Backend deployado a Railway (status: Success)
- [ ] Frontend deployado a Vercel (status: Success)
- [ ] URLs actualizadas en Railway
- [ ] Webhook de Twilio registrado
- [ ] Login funciona
- [ ] Crear operador funciona
- [ ] Analytics visible
- [ ] Sin errores en logs

---

## 🎉 ¡LISTO!

Si completaste todo lo anterior, tu aplicación está **EN VIVO** 🚀

**URLs finales:**
- 🎨 Frontend: `https://llamadas-venezuela.vercel.app`
- 🔌 Backend API: `https://llamadas-venezuela.railway.app/api`
- 📊 Dashboard: Accesible después de login

---

## 🆘 Troubleshooting

### "Frontend cannot reach API"
- [ ] Verifica `VITE_API_URL` en Vercel
- [ ] Verifica que Railway backend está online
- [ ] Revisa CORS en backend

### "Login fails"
- [ ] Revisa logs del backend en Railway
- [ ] Verifica credenciales de test
- [ ] Verifica DATABASE_URL

### "Twilio webhook not working"
- [ ] Verifica webhook URL es exacta
- [ ] Revisa logs del backend
- [ ] Prueba curl manualmente

Ver `DEPLOYMENT_GUIDE.md` para más troubleshooting.

---

## 📞 Contacto y Soporte

- **Documentación técnica:** `DEPLOYMENT_GUIDE.md`
- **Credenciales:** `CREDENTIALS_NEEDED.md`
- **Proyecto:** GitHub - rama `main`
- **Plataformas:** Railway, Vercel, Twilio

---

**Versión:** 1.0  
**Última actualización:** 2026-04-19  
**Estado:** ✅ LISTO PARA IMPLEMENTAR
