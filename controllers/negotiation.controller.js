const Listing = require('../models/Listing.model');
const Message = require('../models/Message.model');
const BuyerRequirement = require('../models/BuyerRequirement.model');
function canAccess(farmer, matchId) { return Listing.findByFarmer(farmer.sub).some(item => matchId.startsWith(item.id)) || BuyerRequirement.all().some(item => item.id === matchId); }
function messages(farmer, matchId) { if (!canAccess(farmer, matchId)) return { status: 404, body: { detail: 'Match not found' } }; return { status: 200, body: { messages: Message.findByMatch(matchId) } }; }
function send(farmer, matchId, body) { if (!canAccess(farmer, matchId)) return { status: 404, body: { detail: 'Match not found' } }; if (!body.text) return { status: 422, body: { detail: 'Message text is required' } }; return { status: 201, body: { message: Message.create({ match_id: matchId, sender_id: farmer.sub, sender_role: 'farmer', text: body.text, language: body.language || 'en' }) } }; }
function decide(farmer, matchId, body) { if (!['accepted', 'countered', 'declined'].includes(body.action)) return { status: 422, body: { detail: 'Use accepted, countered, or declined' } }; return { status: 200, body: { match_id: matchId, action: body.action, counter_price: body.action === 'countered' ? Number(body.counter_price) : null, updated_by: farmer.sub } }; }
module.exports = { messages, send, decide };
