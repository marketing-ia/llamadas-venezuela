import twilio from 'twilio';
import { getTwilioClientByTenant } from '../config/twilio.js';
import { Tenant, Operator, OutboundNumber } from '../models/index.js';

const { AccessToken } = twilio.jwt;
const { VoiceGrant } = AccessToken;

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

  async setupVoiceInfrastructure(tenant) {
    const client = getTwilioClientByTenant(tenant);

    // Create API Key if missing
    if (!tenant.twilio_api_key_sid || !tenant.twilio_api_key_secret) {
      const key = await client.newKeys.create({ friendlyName: 'Llamadas Venezuela Voice' });
      tenant.twilio_api_key_sid = key.sid;
      tenant.twilio_api_key_secret = key.secret;
      await tenant.save();
      console.log('Created Twilio API Key:', key.sid);
    }

    // Create TwiML App if missing
    if (!tenant.twiml_app_sid) {
      const voiceUrl = `${process.env.BACKEND_URL}/api/webhooks/twiml/app`;
      const app = await client.applications.create({
        friendlyName: 'Llamadas Venezuela Voice App',
        voiceUrl,
        voiceMethod: 'POST',
      });
      tenant.twiml_app_sid = app.sid;
      await tenant.save();
      console.log('Created TwiML App:', app.sid);
    } else {
      // Keep Voice URL updated in case BACKEND_URL changed
      const voiceUrl = `${process.env.BACKEND_URL}/api/webhooks/twiml/app`;
      await client.applications(tenant.twiml_app_sid).update({ voiceUrl, voiceMethod: 'POST' });
    }
  }

  async generateVoiceToken(tenantId, identity) {
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant.twilio_api_key_sid || !tenant.twiml_app_sid) {
      await this.setupVoiceInfrastructure(tenant);
      await tenant.reload();
    }

    const grant = new VoiceGrant({
      outgoingApplicationSid: tenant.twiml_app_sid,
      incomingAllow: true,
    });

    const token = new AccessToken(
      tenant.twilio_account_sid,
      tenant.twilio_api_key_sid,
      tenant.twilio_api_key_secret,
      { identity, ttl: 3600 }
    );
    token.addGrant(grant);
    return { token: token.toJwt(), identity };
  }

  async getRecording(tenantId, recordingSid) {
    const tenant = await Tenant.findByPk(tenantId);
    const client = getTwilioClientByTenant(tenant);
    return client.recordings(recordingSid).fetch();
  }
}

export default new TwilioService();
