const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '.data');
const listingsFile = path.join(dataDir, 'listings.json');

function loadListings() {
  try {
    if (fs.existsSync(listingsFile)) {
      const data = fs.readFileSync(listingsFile, 'utf8');
      const arr = JSON.parse(data || '[]');
      return new Map(arr.map(item => [item.id, item]));
    }
  } catch (e) {
    console.error('Error reading listings file:', e);
  }
  return new Map();
}

function saveListingsMap(map) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(listingsFile, JSON.stringify([...map.values()], null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving listings file:', e);
  }
}

const listings = loadListings();

function create(data) {
  const listing = { id: crypto.randomUUID(), status: 'active', created_at: new Date().toISOString(), ...data };
  listings.set(listing.id, listing);
  saveListingsMap(listings);
  return listing;
}
function findByFarmer(farmerId) { return [...listings.values()].filter(listing => listing.farmer_id === farmerId); }
function all() { return [...listings.values()]; }
function findById(id) { return listings.get(id) || null; }
function update(id, values) {
  const listing = findById(id);
  if (!listing) return null;
  Object.assign(listing, values, { updated_at: new Date().toISOString() });
  saveListingsMap(listings);
  return listing;
}
function relist(id) { return update(id, { status: 'active', relisted_at: new Date().toISOString() }); }
module.exports = { create, findByFarmer, findById, all, update, relist };

