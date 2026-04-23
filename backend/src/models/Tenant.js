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
  },
  twilio_api_key_sid: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  twilio_api_key_secret: {
    type: DataTypes.TEXT,
    allowNull: true,
    set(value) {
      this.setDataValue('twilio_api_key_secret', value ? encrypt(value) : null);
    },
    get() {
      const v = this.getDataValue('twilio_api_key_secret');
      return v ? decrypt(v) : null;
    }
  },
  twiml_app_sid: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'tenants'
});

export default Tenant;
