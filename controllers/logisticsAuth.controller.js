const authService = require('../services/auth.service');
const User = require('../models/User.model');
function requestLogisticsOtp(body) { if (!body.phone) return { status: 422, body: { detail: 'Phone number is required' } }; return { status: 200, body: authService.requestOtp(body.phone, 'logistics') }; }
function verifyLogisticsOtp(body) { try { const access_token = authService.verifyOtp(body.phone, body.otp, 'logistics'); const user = User.ensurePhoneUser(body.phone, 'logistics'); return { status: 200, body: { access_token, token_type: 'bearer', user: { id: user.id, phone: body.phone, role: 'logistics' }, redirect_to: '/logistics/dashboard' } }; } catch (error) { return { status: 401, body: { detail: error.message } }; } }
module.exports = { requestLogisticsOtp, verifyLogisticsOtp };
