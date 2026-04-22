import { getTwilioClientByTenant } from '../config/twilio.js';
import { Tenant, Operator, OutboundNumber } from '../models/index.js';

const CALLER_ID = '+584242987181';
const SIP_TRUNK = 'romaia.pstn.twilio.com';

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

    const client = getTwilioClientByTenant(tenant);

    // Route through SIP trunk for PSTN termination
    const sipTo = `sip:${toNumber}@${SIP_TRUNK}`;

    const call = await client.calls.create({
      to: sipTo,
      from: CALLER_ID,
      url: `${process.env.BACKEND_URL}/api/webhooks/twiml`,
      statusCallback: `${process.env.BACKEND_URL}/api/webhooks/twilio`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      record: true,
      recordingChannels: 'mono'
    });

    return {
      callSid: call.sid,
      from: call.from,
      to: toNumber,
      status: call.status
    };
  }

  async endCall(tenantId, callSid) {
    const tenant = await Tenant.findByPk(tenantId);
    const client = getTwilioClientByTenant(tenant);
    try {
      await client.calls(callSid).update({ status: 'canceled' });
    } catch {
      await client.calls(callSid).update({ status: 'completed' });
    }
  }

  async getRecording(tenantId, recordingSid) {
    const tenant = await Tenant.findByPk(tenantId);
    const client = getTwilioClientByTenant(tenant);
    return client.recordings(recordingSid).fetch();
  }
}

export default new TwilioService();
