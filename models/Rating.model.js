const ratings = new Map();
function create(data) { const rating = { id: `RAT-${ratings.size + 1}`, created_at: new Date().toISOString(), ...data }; ratings.set(rating.id, rating); return rating; }
function findByFarmer(farmerId) { return [...ratings.values()].filter(rating => rating.farmer_id === farmerId); }
function all() { return [...ratings.values()]; }
module.exports = { create, findByFarmer, all };
