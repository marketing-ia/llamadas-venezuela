import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CallRecord = sequelize.define('CallRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    }
  },
  operator_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'operators',
      key: 'id'
    }
  },
  twilio_call_sid: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  from_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  to_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  price_per_minute: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('initiated', 'ringing', 'answered', 'completed', 'failed'),
    defaultValue: 'initiated'
  },
  recording_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'call_records',
  indexes: [
    {
      fields: ['tenant_id', 'createdAt']
    },
    {
      fields: ['operator_id']
    }
  ]
});

export default CallRecord;
