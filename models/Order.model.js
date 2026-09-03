const crypto = require('crypto');
const orders = new Map();
function create(data) { const order = { id: crypto.randomUUID(), status: 'confirmed', delivery_status: 'pickup_scheduled', escrow_status: 'secured', created_at: new Date().toISOString(), ...data }; orders.set(order.id, order); return order; }
function findByBuyer(buyerId) { return [...orders.values()].filter(order => order.buyer_id === buyerId); }
function findById(id) { return orders.get(id) || null; }
function all() { return [...orders.values()]; }
function update(id, values) { const order = findById(id); if (!order) return null; Object.assign(order, values); return order; }
function favorites(buyerId) { const buyerOrders = findByBuyer(buyerId); return buyerOrders.filter(order => order.favorite_listing_id).map(order => order.favorite_listing_id); }
module.exports = { create, findByBuyer, findById, all, update, favorites };
