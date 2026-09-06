const Listing = require('../models/Listing.model');
const priceEngine = require('../services/priceEngine.service');
const matchingEngine = require('../services/matchingEngine.service');
const qualityVision = require('../services/qualityVision.service');

function suggestPrice(body) { if (!body.crop || !body.quantity) return { status: 422, body: { detail: 'Crop and quantity are required' } }; return { status: 200, body: { ...priceEngine.getSuggestion(body), history: priceHistory(body.crop, body.region) } }; }
function qualityScore(body) { if (!body.crop) return { status: 422, body: { detail: 'Crop is required' } }; return { status: 200, body: qualityVision.assess(body) }; }
function createListing(farmer, body) {
  const quantity = Number(body.quantity), price = Number(body.price);
  if (!body.crop || !Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(price) || price <= 0) return { status: 422, body: { detail: 'Crop is required; quantity and expected price must be valid positive numbers.' } };
  if (!body.harvest_date || !body.pickup_ready_at || !body.location) return { status: 422, body: { detail: 'Harvest date, pickup-ready time, and pickup location are required.' } };
  if (new Date(body.harvest_date) < new Date(new Date().toDateString()) || new Date(body.pickup_ready_at) < new Date()) return { status: 422, body: { detail: 'Harvest and pickup-ready dates cannot be in the past.' } };
  if (!Array.isArray(body.photos) && !body.photo_url) return { status: 422, body: { detail: 'Upload at least one crop photo.' } };
  const quality = qualityVision.assess(body);
  const listing = Listing.create({ farmer_id: farmer.sub, crop: body.crop, variety: body.variety || null, quantity, unit: body.unit === 'quintal' ? 'quintal' : 'kg', price, harvest_date: body.harvest_date || null, pickup_ready_at: body.pickup_ready_at || null, photos: body.photos || (body.photo_url ? [body.photo_url] : []), photo_url: body.photo_url || body.photos?.[0], notes: String(body.notes || '').slice(0, 300), freshness: body.freshness || 'Fresh today', agmark: body.agmark || 'Not certified', quality_grade: body.quality_grade || quality.grade, quality_score: quality.score, location: body.location || null, language: body.language || 'en', price_source: 'farmer_set', status: body.offline_draft ? 'draft' : 'active' });
  return { status: 201, body: { listing, quality, price_suggestion: priceEngine.getSuggestion(listing) } };
}
function myListings(farmer) { return { status: 200, body: { listings: Listing.findByFarmer(farmer.sub) } }; }
function editListing(farmer, id, body) { const listing = Listing.findById(id); if (!listing || listing.farmer_id !== farmer.sub) return { status: 404, body: { detail: 'Listing not found' } }; if (body.quantity !== undefined && (!Number.isFinite(Number(body.quantity)) || Number(body.quantity) < 1)) return { status: 422, body: { detail: 'Quantity must be a number of at least 1.' } }; if (body.price !== undefined && (!Number.isFinite(Number(body.price)) || Number(body.price) < 1)) return { status: 422, body: { detail: 'Price must be a number of at least 1.' } }; const values = { ...body }; if (values.quantity !== undefined) values.quantity = Number(values.quantity); if (values.price !== undefined) values.price = Number(values.price); return { status: 200, body: { listing: Listing.update(id, values) } }; }
function relist(farmer, id) { const listing = Listing.findById(id); if (!listing || listing.farmer_id !== farmer.sub) return { status: 404, body: { detail: 'Listing not found' } }; return { status: 200, body: { listing: Listing.relist(id) } }; }
function syncDrafts(farmer, body) { const drafts = Array.isArray(body.drafts) ? body.drafts : []; return { status: 201, body: { synced: drafts.map(draft => createListing(farmer, { ...draft, offline_draft: false }).body.listing) } }; }
function incomingMatches(farmer) { const matches = Listing.findByFarmer(farmer.sub).filter(listing => listing.status === 'active').flatMap(matchingEngine.getMatches).sort((a, b) => b.match_score - a.match_score); return { status: 200, body: { matches: matches.length ? matches : matchingEngine.buyerRequirements() } }; }
function priceHistory(crop, region = 'Tamil Nadu') { const now = new Date(); return [30, 20, 10, 0].map(daysAgo => ({ date: new Date(now - daysAgo * 86400000).toISOString().slice(0, 10), price: (priceEngine.getSuggestion({ crop, quantity: 100, location: region }).recommended_min + 2 + daysAgo / 30) })); }
module.exports = { suggestPrice, qualityScore, createListing, myListings, editListing, relist, syncDrafts, incomingMatches, priceHistory };
