const User = require('../models/User.model');
function queue() { return { status: 200, body: { users: User.all().filter(user => ['farmer', 'buyer', 'logistics'].includes(user.role) && user.verification_status !== 'approved') } }; }
function decide(userId, body) { if (!['approved', 'rejected'].includes(body.decision)) return { status: 422, body: { detail: 'Use approved or rejected' } }; const user = User.updateVerification(userId, body.decision); return user ? { status: 200, body: { user } } : { status: 404, body: { detail: 'User not found' } }; }
module.exports = { queue, decide };
