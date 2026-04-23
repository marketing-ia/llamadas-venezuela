const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'marketingiasaas@gmail.com';
const FROM_NAME = 'Llamadas Venezuela';
const APP_URL = process.env.FRONTEND_URL || 'https://app.marketingkoraia.com';

export async function sendTrialWelcome({ name, email, password, trialDays, maxCalls }) {
  if (!BREVO_API_KEY) {
    console.log(`[Email] BREVO_API_KEY not set — trial credentials for ${email}: password=${password}`);
    return;
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + trialDays);
  const expiryStr = expiryDate.toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' });

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email, name }],
      subject: 'Tu acceso de prueba a Llamadas Venezuela',
      htmlContent: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
          <h2 style="color:#1e293b;margin-bottom:8px">Hola, ${name} 👋</h2>
          <p style="color:#475569">Tu cuenta de prueba en <strong>Llamadas Venezuela</strong> está lista.</p>

          <div style="background:#f1f5f9;border-radius:8px;padding:20px;margin:24px 0">
            <p style="margin:0 0 8px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Tus credenciales</p>
            <p style="margin:4px 0;color:#1e293b"><strong>URL:</strong> <a href="${APP_URL}" style="color:#3b82f6">${APP_URL}</a></p>
            <p style="margin:4px 0;color:#1e293b"><strong>Email:</strong> ${email}</p>
            <p style="margin:4px 0;color:#1e293b"><strong>Contraseña:</strong> <code style="background:#e2e8f0;padding:2px 6px;border-radius:4px">${password}</code></p>
          </div>

          <div style="background:#fef3c7;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="margin:0;color:#92400e;font-size:14px">
              ⏱ Tu prueba vence el <strong>${expiryStr}</strong> con un límite de <strong>${maxCalls} llamadas</strong>.
            </p>
          </div>

          <a href="${APP_URL}" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Entrar a la plataforma →
          </a>

          <p style="color:#94a3b8;font-size:12px;margin-top:32px">
            Si tienes dudas, responde a este correo.
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Brevo error ${res.status}`);
  }

  console.log(`[Email] Trial welcome sent to ${email}`);
}
