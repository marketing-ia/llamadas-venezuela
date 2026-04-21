import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OutboundNumber = sequelize.define('OutboundNumber', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'tenants', key: 'id' }
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  slot: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 4 }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'outbound_numbers',
  indexes: [
    { unique: true, fields: ['tenant_id', 'slot'] },
    { unique: true, fields: ['tenant_id', 'phone_number'] }
  ]
});

export default OutboundNumber;
