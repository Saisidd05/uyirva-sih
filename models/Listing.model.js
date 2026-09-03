const crypto = require('crypto');
const listings = new Map();
function create(data) { const listing = { id: crypto.randomUUID(), status: 'active', created_at: new Date().toISOString(), ...data }; listings.set(listing.id, listing); return listing; }
function findByFarmer(farmerId) { return [...listings.values()].filter(listing => listing.farmer_id === farmerId); }
function all() { return [...listings.values()]; }
function findById(id) { return listings.get(id) || null; }
function update(id, values) { const listing = findById(id); if (!listing) return null; Object.assign(listing, values, { updated_at: new Date().toISOString() }); return listing; }
function relist(id) { return update(id, { status: 'active', relisted_at: new Date().toISOString() }); }
module.exports = { create, findByFarmer, findById, all, update, relist };
