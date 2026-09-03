const Listing = require('../models/Listing.model');
const priceEngine = require('../services/priceEngine.service');
const matchingEngine = require('../services/matchingEngine.service');
const qualityVision = require('../services/qualityVision.service');

function suggestPrice(body) { if (!body.crop || !body.quantity) return { status: 422, body: { detail: 'Crop and quantity are required' } }; return { status: 200, body: { ...priceEngine.getSuggestion(body), history: priceHistory(body.crop, body.region) } }; }
function qualityScore(body) { if (!body.crop) return { status: 422, body: { detail: 'Crop is required' } }; return { status: 200, body: qualityVision.assess(body) }; }
function createListing(farmer, body) {
  if (!body.crop || !Number(body.quantity) || !Number(body.price)) return { status: 422, body: { detail: 'Vegetable, quantity, and farmer rate are required' } };
  const quality = qualityVision.assess(body);
  const listing = Listing.create({ farmer_id: farmer.sub, crop: body.crop, quantity: Number(body.quantity), price: Number(body.price), photo_url: body.photo_url || null, freshness: body.freshness || 'Fresh today', agmark: body.agmark || 'Not certified', quality_grade: body.quality_grade || quality.grade, quality_score: quality.score, location: body.location || null, language: body.language || 'en', price_source: 'farmer_set', status: body.offline_draft ? 'draft' : 'active' });
  return { status: 201, body: { listing, quality, price_suggestion: priceEngine.getSuggestion(listing) } };
}
function myListings(farmer) { return { status: 200, body: { listings: Listing.findByFarmer(farmer.sub) } }; }
function editListing(farmer, id, body) { const listing = Listing.findById(id); if (!listing || listing.farmer_id !== farmer.sub) return { status: 404, body: { detail: 'Listing not found' } }; return { status: 200, body: { listing: Listing.update(id, body) } }; }
function relist(farmer, id) { const listing = Listing.findById(id); if (!listing || listing.farmer_id !== farmer.sub) return { status: 404, body: { detail: 'Listing not found' } }; return { status: 200, body: { listing: Listing.relist(id) } }; }
function syncDrafts(farmer, body) { const drafts = Array.isArray(body.drafts) ? body.drafts : []; return { status: 201, body: { synced: drafts.map(draft => createListing(farmer, { ...draft, offline_draft: false }).body.listing) } }; }
function incomingMatches(farmer) { const matches = Listing.findByFarmer(farmer.sub).filter(listing => listing.status === 'active').flatMap(matchingEngine.getMatches).sort((a, b) => b.match_score - a.match_score); return { status: 200, body: { matches: matches.length ? matches : matchingEngine.buyerRequirements() } }; }
function priceHistory(crop, region = 'Tamil Nadu') { const now = new Date(); return [30, 20, 10, 0].map(daysAgo => ({ date: new Date(now - daysAgo * 86400000).toISOString().slice(0, 10), price: (priceEngine.getSuggestion({ crop, quantity: 100, location: region }).recommended_min + 2 + daysAgo / 30) })); }
module.exports = { suggestPrice, qualityScore, createListing, myListings, editListing, relist, syncDrafts, incomingMatches, priceHistory };
