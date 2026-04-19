export function validatePhoneNumber(phone) {
  // Simple E.164 format validation: +1-20 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
}

export function validateSipUri(uri) {
  // SIP URI format: sip://user@host or sip:+number@host
  const sipRegex = /^sip:[a-zA-Z0-9+@:.\-_~]+$/;
  return sipRegex.test(uri);
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
