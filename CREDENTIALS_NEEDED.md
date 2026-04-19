# 🔑 Credenciales Necesarias para Deployment

## Resumen

Para desplegar "Llamadas Venezuela" a producción necesitas **3 servicios externos**:

| Servicio | Requisito | Dónde obtener |
|----------|-----------|---------------|
| **Twilio** | ✅ OBLIGATORIO | https://www.twilio.com/console |
| **Railway** | ✅ OBLIGATORIO | https://railway.app/dashboard |
| **Vercel** | ✅ OBLIGATORIO | https://vercel.com/dashboard |

---

## 1️⃣ TWILIO

### Qué necesitas

```json
{
  "TWILIO_ACCOUNT_SID": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "TWILIO_AUTH_TOKEN": "your_auth_token_here"
}
```

### Cómo obtenerlo

1. Ve a https://www.twilio.com/console
2. En el dashboard, verás:
   - **Account SID:** Primer campo visible (empieza con `AC`)
   - **Auth Token:** Segundo campo visible (es un token largo)
3. **Copia ambos valores**

### Validación

```bash
# Tu Account SID debe tener este formato:
ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # 34 caracteres, empieza con AC

# Tu Auth Token debe ser una cadena larga
```

### Dónde se usa

- `backend/.env` → `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN`
- Backend hace llamadas a Twilio
- Webhook recibe eventos de llamadas

---

## 2️⃣ RAILWAY

### Qué necesitas

```json
{
  "RAILWAY_API_TOKEN": "your_railway_api_token_here"
}
```

### Cómo obtenerlo

1. Ve a https://railway.app/account/tokens
2. Haz clic en **"Create Token"**
3. Copia el token generado
4. **Guárdalo** - solo aparece una vez

### Validación

```bash
# Token de Railway es una cadena larga
# Formato: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Dónde se usa

- Para desplegar backend automáticamente
- Para crear/configurar PostgreSQL
- Para inyectar variables de entorno

---

## 3️⃣ VERCEL

### Qué necesitas

```json
{
  "VERCEL_TOKEN": "your_vercel_api_token_here"
}
```

### Cómo obtenerlo

1. Ve a https://vercel.com/account/tokens
2. Haz clic en **"Create"**
3. Dale un nombre (ej: "Llamadas Venezuela Deployment")
4. Copia el token generado
5. **Guárdalo** - solo aparece una vez

### Validación

```bash
# Token de Vercel empieza con algún prefijo
# Formato es una cadena larga
```

### Dónde se usa

- Para desplegar frontend automáticamente
- Para conectar el repositorio GitHub
- Para inyectar variables de entorno

---

## 📝 Formato de Almacenamiento

Las credenciales se almacenarán en `.secrets/credentials.json`:

```json
{
  "twilio": {
    "accountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "authToken": "your_auth_token_here"
  },
  "railway": {
    "apiToken": "your_railway_api_token_here"
  },
  "vercel": {
    "token": "your_vercel_api_token_here"
  },
  "github": {
    "token": "your_github_token_here (opcional)"
  }
}
```

⚠️ **Este archivo:**
- ✅ Está en `.gitignore` (protegido)
- ✅ Solo lo ve Claude Code
- ✅ Se usa para automatizar deployment
- ❌ NUNCA se commitea a GitHub

---

## ⚙️ Proceso Automático

Cuando ejecutes el deployment con Claude Code:

1. **Preguntará** por cada credencial
2. **Validará** que el formato sea correcto
3. **Guardará** en `.secrets/credentials.json`
4. **Inyectará** automáticamente en `.env` files
5. **Deploará** a Railway y Vercel

---

## ✅ Checklist Antes de Empezar

- [ ] Tienes cuenta de Twilio (https://www.twilio.com)
- [ ] Tienes Account SID de Twilio
- [ ] Tienes Auth Token de Twilio
- [ ] Tienes cuenta de Railway (https://railway.app)
- [ ] Tienes Railway API Token generado
- [ ] Tienes cuenta de Vercel (https://vercel.com)
- [ ] Tienes Vercel API Token generado
- [ ] Tienes Git configurado localmente
- [ ] Tienes Node.js instalado (v18+)
- [ ] Tienes conexión a internet estable

---

## 🔒 Seguridad

### Lo que hacemos bien ✅

- Credenciales en `.secrets/` (gitignored)
- Variables de entorno en `.env` (gitignored)
- Secrets almacenados solo localmente durante deployment
- En Railway/Vercel se usan environment variables (no archivos)

### Nunca hagas esto ❌

- ❌ Commitar `.secrets/` a GitHub
- ❌ Commitar `.env` files a GitHub
- ❌ Compartir `RAILWAY_API_TOKEN` o `VERCEL_TOKEN`
- ❌ Poner credenciales en comentarios
- ❌ Subirlas a ramas públicas

---

## 🚀 Próximo Paso

Una vez tengas todas las credenciales:

1. Abre Claude Code
2. Ejecuta: `Implementation: Complete Deployment`
3. Claude Code pedirá cada credencial
4. Proporciona los valores
5. ¡Sistema se encargará del resto!

---

## 📞 Referencias Rápidas

- **Twilio Console:** https://www.twilio.com/console
- **Railway Dashboard:** https://railway.app/dashboard
- **Railway Tokens:** https://railway.app/account/tokens
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Tokens:** https://vercel.com/account/tokens

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo regenerar los tokens?**
A: Sí, en cualquier momento. Solo actualiza `.secrets/credentials.json` y vuelve a ejecutar.

**P: ¿Qué pasa si pierdo un token?**
A: Regenera en la plataforma (Twilio, Railway, Vercel) y actualiza `.secrets/credentials.json`.

**P: ¿Son seguros los tokens en `.secrets/`?**
A: Sí, `.gitignore` protege la carpeta. Nunca se suben a GitHub.

**P: ¿Puedo usar credenciales diferentes para staging y producción?**
A: Sí, crea `.secrets/staging.json` y `.secrets/production.json` según sea necesario.
