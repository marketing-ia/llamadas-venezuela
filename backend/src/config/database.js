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

export async function initializeDatabase(Tenant, OutboundNumber) {
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
    // Seed outbound number pool (4 slots — slot 1 pre-configured)
    await OutboundNumber.create({
      tenant_id: TENANT_ID,
      phone_number: '+584242987181',
      label: 'Principal',
      slot: 1,
      is_active: true
    });
    console.log('Default tenant created. Tenant key:', TENANT_ID);
    console.log('Outbound number +584242987181 seeded in slot 1');
  }
}

export default sequelize;
