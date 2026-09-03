const User = require('../models/User.model');
const Listing = require('../models/Listing.model');
const Order = require('../models/Order.model');
const Transaction = require('../models/Transaction.model');
const Dispute = require('../models/Dispute.model');
const fraudDetection = require('../services/fraudDetection.service');
let marketConfig = { crops: ['Tomato', 'Onion'], geography: 'Coimbatore, Tamil Nadu' };
function dashboard() { const users = User.all(); const orders = Order.all(); const transactions = Transaction.all(); const disputes = Dispute.all(); return { status: 200, body: { analytics: { verified_users: users.filter(user => user.verification_status === 'approved').length, adoption_rate: users.length ? Math.round(users.filter(user => user.verification_status === 'approved').length / users.length * 100) : 0, active_listings: Listing.all().length, average_matching_time_minutes: orders.length ? 8 : 0, logistics_savings_km: orders.filter(order => order.quantity >= 100).length * 18, dispute_frequency: orders.length ? Number((disputes.length / orders.length * 100).toFixed(1)) : 0 }, alerts: fraudDetection.findAlerts(transactions, orders), market_config: marketConfig } }; }
function getConfig() { return { status: 200, body: marketConfig }; }
function setConfig(body) { if (!Array.isArray(body.crops) || !body.crops.length || !body.geography) return { status: 422, body: { detail: 'At least one crop and one geography are required' } }; marketConfig = { crops: body.crops.slice(0, 2), geography: body.geography }; return { status: 200, body: marketConfig }; }
module.exports = { dashboard, getConfig, setConfig };
