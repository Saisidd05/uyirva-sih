const crypto = require('crypto');
const requirements = new Map();

function create(data) {
  const requirement = { id: crypto.randomUUID(), status: 'open', created_at: new Date().toISOString(), ...data };
  requirements.set(requirement.id, requirement);
  return requirement;
}
function all() { return [...requirements.values()]; }
function findOpen() { return all().filter(item => item.status === 'open'); }
// Development records mirror the BuyerRequirement collection so the directory
// remains demonstrable without the buyer requirement form being open.
if (!requirements.size) [
  { buyer_id: 'buyer-retail-1', buyer_name: 'Kovai Fresh Mart', buyer_type: 'retailer', crop: 'Tomato', quantity: 500, price_min: 26, price_max: 30, delivery_window: 'Tomorrow, 7–10 AM', distance_km: 18, public_contact: true, phone: '+919000000001', email: 'buy@kovaifresh.example' },
  { buyer_id: 'buyer-hotel-1', buyer_name: 'Chennai Bulk Foods', buyer_type: 'restaurant', crop: 'Onion', quantity: 300, price_min: 28, price_max: 32, delivery_window: 'Within 2 days', distance_km: 64, public_contact: false },
  { buyer_id: 'buyer-fpo-1', buyer_name: 'Green Basket FPO', buyer_type: 'institution', crop: 'Potato', quantity: 250, price_min: 22, price_max: 26, delivery_window: 'This week', distance_km: 31, public_contact: false }
].forEach(create);
module.exports = { create, all, findOpen };
