const crypto = require('crypto');
const transactions = new Map();
function create(data) { const transaction = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...data }; transactions.set(transaction.id, transaction); return transaction; }
function findByBuyer(buyerId) { return [...transactions.values()].filter(item => item.buyer_id === buyerId); }
function all() { return [...transactions.values()]; }
module.exports = { create, findByBuyer, all };
