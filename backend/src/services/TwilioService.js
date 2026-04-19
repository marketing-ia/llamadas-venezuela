import { getTwilioClientByTenant } from '../config/twilio.js';
import { Tenant, Operator } from '../models/index.js';

class TwilioService {
  async initiateCall(tenantId, operatorId, toNumber) {
    try {
      const tenant = await Tenant.findByPk(tenantId);
      const operator = await Operator.findOne({
        where: { id: operatorId, tenant_id: tenantId }
      });

      if (!tenant || !operator) {
        throw new Error('Tenant or operator not found');
      }

      const client = getTwilioClientByTenant(tenant);

      const call = await client.api.calls.create({
        to: toNumber,
        from: operator.twilio_number,
        url: `${process.env.BACKEND_URL}/api/webhooks/twilio`,
        record: 'record-from-answer',
        recordingChannels: 'mono'
      });

      return {
        callSid: call.sid,
        from: call.from,
        to: call.to,
        status: call.status
      };
    } catch (error) {
      console.error('Failed to initiate call:', error);
      throw error;
    }
  }

  async getRecording(tenantId, recordingSid) {
    try {
      const tenant = await Tenant.findByPk(tenantId);
      const client = getTwilioClientByTenant(tenant);

      const recording = await client.recordings(recordingSid).fetch();
      return recording;
    } catch (error) {
      console.error('Failed to fetch recording:', error);
      throw error;
    }
  }
}

export default new TwilioService();
