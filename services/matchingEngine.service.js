function getMatches(listing) {
  const buyers = [
    { buyer_id: 'buyer-retail-1', buyer_name: 'Kovai Fresh Mart', buyer_type: 'retailer', distance_km: 18, requested_kg: 500, offered_price: 29, price_min: 27, price_max: 30, phone: '+919000000001', email: 'orders@kovaifresh.example', delivery_location: 'Coimbatore North', delivery_window: 'Tomorrow, 7–10 AM', freshness_required: 'Harvested within 24 hours', quality_required: 'Premium / Grade A', agmark_required: 'Preferred' },
    { buyer_id: 'buyer-hotel-1', buyer_name: 'Chennai Bulk Foods', buyer_type: 'restaurant', distance_km: 64, requested_kg: 300, offered_price: 28, price_min: 26, price_max: 29, phone: '+919000000002', email: 'procurement@chennaibulk.example', delivery_location: 'Gandhipuram, Coimbatore', delivery_window: 'Within 2 days', freshness_required: 'Fresh, same-day pickup', quality_required: 'Grade A or B', agmark_required: 'Not mandatory' },
    { buyer_id: 'buyer-fpo-1', buyer_name: 'Green Basket FPO', buyer_type: 'institution', distance_km: 31, requested_kg: 250, offered_price: 27, price_min: 25, price_max: 28, phone: '+919000000003', email: 'buying@greenbasket.example', delivery_location: 'Pollachi collection hub', delivery_window: 'This week', freshness_required: 'Fresh within 2 days', quality_required: 'Good quality', agmark_required: 'Preferred' }
  ];
  return buyers.map((buyer, index) => ({ ...buyer, listing_id: listing.id, crop: listing.crop, requirement: `Need ${listing.crop} for ${buyer.buyer_type} supply`, rank: index + 1, match_score: 94 - index * 7, status: index === 0 ? 'active' : 'interest' }));
}
function buyerRequirements() { return getMatches({ id: 'open-requirements', crop: 'fresh vegetables' }); }
module.exports = { getMatches, buyerRequirements };
