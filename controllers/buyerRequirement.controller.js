const Listing = require('../models/Listing.model');
const Order = require('../models/Order.model');
const matchingEngine = require('../services/matchingEngine.service');

// The directory is deliberately match-driven: it does not expose the broader
// buyer marketplace to farmers who have no relationship with a buyer.
function directory(farmer, query = {}) {
  const listings = Listing.findByFarmer(farmer.sub).filter(item => item.status === 'active');
  const orders = Order.all().filter(item => item.seller_id === farmer.sub);
  let buyers = listings.flatMap(listing => matchingEngine.getMatches(listing).map(match => {
    const hasOrder = orders.some(order => order.listing_id === listing.id && order.buyer_id === match.buyer_id);
    // This list contains only buyer matches for this farmer's listings, so
    // contact details can be used immediately to discuss the requirement.
    const contactVisible = true;
    return { id: `${listing.id}:${match.rank}`, match_id: listing.id, buyer_id: match.buyer_id, buyer_name: match.buyer_name, buyer_type: match.buyer_type, crop: match.crop, quantity: match.requested_kg, price_min: match.price_min, price_max: match.price_max, delivery_location: match.delivery_location, delivery_window: match.delivery_window, distance_km: match.distance_km, contact_visible: contactVisible, contact: { phone: match.phone, email: match.email }, requirements: { freshness: match.freshness_required || 'Not specified', quality: match.quality_required || 'Not specified', agmark: match.agmark_required || 'Not specified' }, has_order: hasOrder };
  }));
  if (query.crop) buyers = buyers.filter(item => item.crop.toLowerCase() === String(query.crop).toLowerCase());
  const compare = { distance: (a, b) => a.distance_km - b.distance_km, quantity: (a, b) => b.quantity - a.quantity, price: (a, b) => b.price_max - a.price_max }[query.sort];
  if (compare) buyers.sort(compare);
  return { status: 200, body: { buyers } };
}
module.exports = { directory };
