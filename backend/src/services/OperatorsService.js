import { Operator } from '../models/index.js';
import { validateSipUri, validatePhoneNumber } from '../utils/validation.js';

class OperatorsService {
  async createOperator(tenantId, data) {
    const { name, twilioNumber, sipUri } = data;

    if (!name || !twilioNumber || !sipUri) {
      throw new Error('Missing required fields');
    }

    if (!validatePhoneNumber(twilioNumber)) {
      throw new Error('Invalid Twilio phone number');
    }

    if (!validateSipUri(sipUri)) {
      throw new Error('Invalid SIP URI format');
    }

    const operator = await Operator.create({
      tenant_id: tenantId,
      name,
      twilio_number: twilioNumber,
      sip_uri: sipUri
    });

    return operator;
  }

  async updateOperator(tenantId, operatorId, data) {
    const operator = await Operator.findOne({
      where: { id: operatorId, tenant_id: tenantId }
    });

    if (!operator) {
      throw new Error('Operator not found');
    }

    if (data.twilioNumber && !validatePhoneNumber(data.twilioNumber)) {
      throw new Error('Invalid Twilio phone number');
    }

    if (data.sipUri && !validateSipUri(data.sipUri)) {
      throw new Error('Invalid SIP URI format');
    }

    if (data.name) operator.name = data.name;
    if (data.twilioNumber) operator.twilio_number = data.twilioNumber;
    if (data.sipUri) operator.sip_uri = data.sipUri;

    return operator.save();
  }

  async deleteOperator(tenantId, operatorId) {
    const operator = await Operator.findOne({
      where: { id: operatorId, tenant_id: tenantId }
    });

    if (!operator) {
      throw new Error('Operator not found');
    }

    await operator.destroy();
    return { success: true };
  }

  async listOperators(tenantId) {
    return Operator.findAll({
      where: { tenant_id: tenantId },
      order: [['createdAt', 'ASC']]
    });
  }

  async getOperatorById(tenantId, operatorId) {
    return Operator.findOne({
      where: { id: operatorId, tenant_id: tenantId }
    });
  }
}

export default new OperatorsService();
