import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.DATABASE_URL?.includes('railway.internal') ? false : {
      require: true,
      rejectUnauthorized: false
    }
  }
});

export async function initializeDatabase() {
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  await seedDefaultTenant();
}

async function seedDefaultTenant() {
  // Import lazily to avoid circular deps
  const { default: Tenant } = await import('../models/Tenant.js');
  const count = await Tenant.count();
  if (count === 0) {
    const tenant = await Tenant.create({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Llamadas Venezuela',
      twilio_account_sid: process.env.TWILIO_ACCOUNT_SID || 'placeholder',
      twilio_auth_token: process.env.TWILIO_AUTH_TOKEN || 'placeholder',
      monthly_budget: 500.00,
      timezone: 'America/Caracas'
    });
    console.log(`Default tenant created. Login with tenant key: ${tenant.id}`);
  }
}

export default sequelize;
