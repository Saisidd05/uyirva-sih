const crypto = require('crypto');
const messages = new Map();
function create(data) { const message = { id: crypto.randomUUID(), created_at: new Date().toISOString(), translated_text: data.translated_text || data.text, ...data }; messages.set(message.id, message); return message; }
function findByMatch(matchId) { return [...messages.values()].filter(message => message.match_id === matchId); }
module.exports = { create, findByMatch };
