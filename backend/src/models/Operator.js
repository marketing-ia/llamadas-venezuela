import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Operator = sequelize.define('Operator', {
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  twilio_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  sip_uri: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'operators',
  indexes: [
    {
      unique: true,
      fields: ['tenant_id', 'twilio_number']
    }
  ]
});

export default Operator;
