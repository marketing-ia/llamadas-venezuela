import Tenant from './Tenant.js';
import Operator from './Operator.js';
import SalesScript from './SalesScript.js';
import CallRecord from './CallRecord.js';

// Define associations
Tenant.hasMany(Operator, { foreignKey: 'tenant_id' });
Operator.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(SalesScript, { foreignKey: 'tenant_id' });
SalesScript.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Tenant.hasMany(CallRecord, { foreignKey: 'tenant_id' });
CallRecord.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Operator.hasMany(CallRecord, { foreignKey: 'operator_id' });
CallRecord.belongsTo(Operator, { foreignKey: 'operator_id' });

export { Tenant, Operator, SalesScript, CallRecord };
