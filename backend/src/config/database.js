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
      tenant_id: TENANT_ID, phone_number: '+584242987181',
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
    console.log('Seed OK — master: hola@marketingkoraia.com / KoraIA2026!');
    console.log('Seed OK — trial: prueba@llamadas.app / prueba01');
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
    console.log('Master user created: hola@marketingkoraia.com / KoraIA2026!');
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
    console.log('Trial demo user created: prueba@llamadas.app / prueba01');
  }
}

export default sequelize;
