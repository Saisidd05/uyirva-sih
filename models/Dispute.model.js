const crypto = require('crypto');
const disputes = new Map();
function create(data) { const dispute = { id: crypto.randomUUID(), status: 'submitted', submitted_at: new Date().toISOString(), ...data }; disputes.set(dispute.id, dispute); return dispute; }
function all() { return [...disputes.values()]; }
function findById(id) { return disputes.get(id) || null; }
function update(id, values) { const dispute = findById(id); if (!dispute) return null; Object.assign(dispute, values); return dispute; }
module.exports = { create, all, findById, update };
