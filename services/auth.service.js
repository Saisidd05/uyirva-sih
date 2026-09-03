const crypto = require('crypto');
const secret = process.env.JWT_SECRET || 'uyirva-local-development';
const pendingOtps = new Map();
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
function signToken(payload) { const header = encode({ alg: 'HS256', typ: 'JWT' }); const body = encode({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 }); const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url'); return `${header}.${body}.${signature}`; }
function verifyToken(token) { const [header, body, signature] = token.split('.'); const expected = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url'); if (!signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('Invalid token'); const payload = JSON.parse(Buffer.from(body, 'base64url').toString()); if (payload.exp < Date.now() / 1000) throw new Error('Expired token'); return payload; }
// Serverless demo mode is opt-in: configure DEMO_OTP in Vercel. This avoids
// relying on in-memory OTP state across cold starts without enabling a public bypass.
const demoOtp = () => process.env.DEMO_OTP || '';
function requestOtp(phone, role = 'farmer') { const configuredDemoOtp = demoOtp(); const otp = configuredDemoOtp || String(Math.floor(100000 + Math.random() * 900000)); pendingOtps.set(`${role}:${phone}`, { otp, expiresAt: Date.now() + 300000 }); return { expires_in_seconds: 300, ...(configuredDemoOtp ? { demo_otp: configuredDemoOtp } : {}) }; }
function verifyOtp(phone, otp, role = 'farmer') { const record = pendingOtps.get(`${role}:${phone}`); const demoValid = Boolean(demoOtp()) && String(otp) === demoOtp(); if (!demoValid && (!record || record.expiresAt < Date.now() || record.otp !== String(otp))) throw new Error('Invalid or expired OTP'); pendingOtps.delete(`${role}:${phone}`); return signToken({ sub: phone, phone, role }); }
module.exports = { signToken, verifyToken, requestOtp, verifyOtp };
