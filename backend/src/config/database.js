import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export async function initializeDatabase() {
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
}

export default sequelize;
