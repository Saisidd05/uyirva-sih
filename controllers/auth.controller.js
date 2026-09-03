const authService = require('../services/auth.service');
const User = require('../models/User.model');
function requestFarmerOtp(body) { if (!body.phone || !/^\+?[0-9]{10,15}$/.test(String(body.phone).replace(/[\s-]/g, ''))) return { status: 422, body: { detail: 'Enter a valid phone number' } }; return { status: 200, body: authService.requestOtp(body.phone, 'farmer') }; }
function verifyFarmerOtp(body) { try { const access_token = authService.verifyOtp(body.phone, body.otp, 'farmer'); const user = User.ensurePhoneUser(body.phone, 'farmer'); return { status: 200, body: { access_token, token_type: 'bearer', user: { id: user.id, phone: body.phone, role: 'farmer' }, redirect_to: '/farmer/dashboard' } }; } catch (error) { return { status: 401, body: { detail: error.message } }; } }
module.exports = { requestFarmerOtp, verifyFarmerOtp };
