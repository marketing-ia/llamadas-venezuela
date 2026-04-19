import twilio from 'twilio';

export function getTwilioClient(accountSid, authToken) {
  return twilio(accountSid, authToken);
}

export function getTwilioClientByTenant(tenant) {
  return getTwilioClient(tenant.twilio_account_sid, tenant.twilio_auth_token);
}
