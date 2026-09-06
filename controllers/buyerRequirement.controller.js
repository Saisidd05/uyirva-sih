const User = require('../models/User.model');
const BuyerRequirement = require('../models/BuyerRequirement.model');
const Listing = require('../models/Listing.model');

function distanceFor(requirement, listing) {
  if (Number.isFinite(requirement.distance_km)) return requirement.distance_km;
  return requirement.location === listing.location ? 8 : 24;
}
function directory(farmer, query = {}) {
  const listings = Listing.findByFarmer(farmer.sub).filter(item => item.status === 'active');
  const crops = new Set(listings.map(item => String(item.crop).toLowerCase()));
  if (!crops.size) return { status: 200, body: { buyers: [] } };
  let buyers = BuyerRequirement.findOpen().filter(requirement => !crops.size || crops.has(String(requirement.crop).toLowerCase())).map(requirement => {
    const buyer = User.findById(requirement.buyer_id) || {};
    const matched = listings.some(item => String(item.crop).toLowerCase() === String(requirement.crop).toLowerCase());
    const contactVisible = Boolean(requirement.public_contact || matched || requirement.messaged_farmer_ids?.includes(farmer.sub));
    return { id: requirement.id, buyer_id: requirement.buyer_id, buyer_name: buyer.full_name || requirement.buyer_name || 'Verified buyer', buyer_type: buyer.buyer_type || requirement.buyer_type || 'buyer', crop: requirement.crop, quantity: requirement.quantity, price_min: requirement.price_min, price_max: requirement.price_max, delivery_window: requirement.delivery_window, distance_km: distanceFor(requirement, listings.find(item => String(item.crop).toLowerCase() === String(requirement.crop).toLowerCase()) || {}), contact: contactVisible ? { phone: buyer.phone || requirement.phone || null, email: buyer.email || requirement.email || null } : null, contact_visible: contactVisible };
  });
  if (query.crop) buyers = buyers.filter(item => item.crop.toLowerCase() === String(query.crop).toLowerCase());
  const sort = query.sort || 'crop_match';
  const compare = { distance: (a, b) => a.distance_km - b.distance_km, quantity: (a, b) => b.quantity - a.quantity, price: (a, b) => b.price_max - a.price_max }[sort];
  if (compare) buyers.sort(compare);
  return { status: 200, body: { buyers } };
}
module.exports = { directory };
