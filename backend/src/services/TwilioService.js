import { getTwilioClientByTenant } from '../config/twilio.js';
import { Tenant, Operator, OutboundNumber } from '../models/index.js';

class TwilioService {
  // Round-robin index shared in memory (resets on restart — fine for MVP)
  #poolIndex = 0;

  async initiateCall(tenantId, operatorId, toNumber) {
    const tenant = await Tenant.findByPk(tenantId);
    const operator = await Operator.findOne({
      where: { id: operatorId, tenant_id: tenantId }
    });

    if (!tenant || !operator) {
      throw new Error('Tenant or operator not found');
    }

    const outboundNumber = await this.#pickOutboundNumber(tenantId);
    const client = getTwilioClientByTenant(tenant);

    const call = await client.calls.create({
      to: toNumber,
      from: outboundNumber.phone_number,
      url: `${process.env.BACKEND_URL}/api/webhooks/twiml`,
      statusCallback: `${process.env.BACKEND_URL}/api/webhooks/twilio`,
      statusCallbackEvent: ['answered', 'completed'],
      record: true,
      recordingChannels: 'mono'
    });

    return {
      callSid: call.sid,
      from: call.from,
      to: call.to,
      status: call.status
    };
  }

  async #pickOutboundNumber(tenantId) {
    const numbers = await OutboundNumber.findAll({
      where: { tenant_id: tenantId, is_active: true },
      order: [['slot', 'ASC']]
    });

    if (!numbers.length) {
      throw new Error('No active outbound numbers configured. Add a number in Settings > Phone Numbers.');
    }

    const picked = numbers[this.#poolIndex % numbers.length];
    this.#poolIndex = (this.#poolIndex + 1) % numbers.length;
    return picked;
  }

  async getRecording(tenantId, recordingSid) {
    const tenant = await Tenant.findByPk(tenantId);
    const client = getTwilioClientByTenant(tenant);
    return client.recordings(recordingSid).fetch();
  }
}

export default new TwilioService();
