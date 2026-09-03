const escrowService = require('../services/escrow.service');
const Order = require('../models/Order.model');
function confirmReceipt(buyer, orderId) { const order = Order.findById(orderId); if (!order || order.buyer_id !== buyer.sub) return { status: 404, body: { detail: 'Order not found' } }; const escrow = escrowService.releaseFunds({ amount: order.total_amount, order_id: order.id }); Order.update(order.id, { escrow_status: 'released', status: 'completed', delivery_status: 'received' }); return { status: 200, body: { order, escrow } }; }
module.exports = { confirmReceipt };
