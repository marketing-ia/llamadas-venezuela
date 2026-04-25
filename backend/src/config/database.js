import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('your_password');

export const sequelize = isLocal
  ? new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../../../data/local.sqlite'),
      logging: false
    })
  : new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
      dialectOptions: {
        ssl: process.env.DATABASE_URL?.includes('railway.internal') ? false : {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

export async function initializeDatabase(Tenant, OutboundNumber, User) {
  await sequelize.sync({ alter: true });
  const count = await Tenant.count();
  if (count === 0) {
    const TENANT_ID = '00000000-0000-0000-0000-000000000001';
    await Tenant.create({
      id: TENANT_ID,
      name: 'Llamadas Venezuela',
      twilio_account_sid: process.env.TWILIO_ACCOUNT_SID || 'placeholder',
      twilio_auth_token: process.env.TWILIO_AUTH_TOKEN || 'placeholder',
      monthly_budget: 500.00,
      timezone: 'America/Caracas'
    });
    await OutboundNumber.create({
      tenant_id: TENANT_ID, phone_number: process.env.CALLER_ID || '+584242987181',
      label: 'Principal', slot: 1, is_active: true
    });
    // Seed master + demo trial (imported here to avoid circular dep)
    const { hashPassword } = await import('../utils/password.js');
    await User.create({
      tenant_id: TENANT_ID,
      email: 'hola@marketingkoraia.com',
      name: 'Marketing Kora IA',
      password_hash: hashPassword('KoraIA2026!'),
      role: 'master',
      trial_expires_at: null,
      max_calls: null
    });
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 3);
    await User.create({
      tenant_id: TENANT_ID,
      email: 'prueba@llamadas.app',
      name: 'Prueba',
      password_hash: hashPassword('prueba01'),
      role: 'trial',
      trial_expires_at: trialExpiry,
      max_calls: 10,
      calls_used: 0
    });
    console.log('Seed OK — master + trial users created');
  }
  // Ensure master user exists even on existing tenants (migration)
  const { hashPassword } = await import('../utils/password.js');
  const masterExists = await User.findOne({ where: { email: 'hola@marketingkoraia.com' } });
  if (!masterExists) {
    const TENANT_ID = '00000000-0000-0000-0000-000000000001';
    await User.create({
      tenant_id: TENANT_ID,
      email: 'hola@marketingkoraia.com',
      name: 'Marketing Kora IA',
      password_hash: hashPassword('KoraIA2026!'),
      role: 'master',
      trial_expires_at: null,
      max_calls: null
    });
    console.log('Master user created');
  }
  const trialExists = await User.findOne({ where: { email: 'prueba@llamadas.app' } });
  if (!trialExists) {
    const TENANT_ID = '00000000-0000-0000-0000-000000000001';
    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 3);
    await User.create({
      tenant_id: TENANT_ID,
      email: 'prueba@llamadas.app',
      name: 'Prueba',
      password_hash: hashPassword('prueba01'),
      role: 'trial',
      trial_expires_at: trialExpiry,
      max_calls: 10,
      calls_used: 0
    });
    console.log('Trial demo user created');
  }

  // Update master password if MASTER_PASSWORD env var is set
  if (process.env.MASTER_PASSWORD) {
    const master = await User.findOne({ where: { email: 'hola@marketingkoraia.com' } });
    if (master) {
      master.password_hash = hashPassword(process.env.MASTER_PASSWORD);
      await master.save();
      console.log('[Security] Master password updated from MASTER_PASSWORD env var');
    }
  }

  // Re-sync Twilio credentials if ENCRYPTION_KEY changed (decryption would fail)
  const TENANT_ID = '00000000-0000-0000-0000-000000000001';
  const tenant = await Tenant.findByPk(TENANT_ID);
  if (tenant && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_AUTH_TOKEN !== 'placeholder') {
    try {
      tenant.twilio_auth_token; // attempt decrypt — throws if key mismatch
    } catch {
      console.log('[Security] Encryption key rotation detected — re-syncing Twilio credentials from env');
      tenant.twilio_auth_token = process.env.TWILIO_AUTH_TOKEN;
      await tenant.save();
    }
  }
}

export default sequelize;
