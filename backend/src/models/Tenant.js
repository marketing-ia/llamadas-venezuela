import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  twilio_account_sid: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  twilio_auth_token: {
    type: DataTypes.TEXT,
    allowNull: false,
    set(value) {
      this.setDataValue('twilio_auth_token', encrypt(value));
    },
    get() {
      const encrypted = this.getDataValue('twilio_auth_token');
      return encrypted ? decrypt(encrypted) : null;
    }
  },
  monthly_budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'UTC'
  }
}, {
  timestamps: true,
  tableName: 'tenants'
});

export default Tenant;
