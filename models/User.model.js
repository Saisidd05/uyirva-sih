const crypto = require('crypto');
const users = new Map();
const passwordHash = password => crypto.createHash('sha256').update(String(password)).digest('hex');
function findByEmail(email) { return [...users.values()].find(user => user.email === String(email).toLowerCase()) || null; }
function createBuyer({ email, password, phone }) { const existing = findByEmail(email); if (existing) return existing; const user = { id: crypto.randomUUID(), email: String(email).toLowerCase(), phone: phone || null, role: 'buyer', password_hash: passwordHash(password), verification_status: 'pending' }; users.set(user.id, user); return user; }
function verifyBuyerPassword(email, password) { const user = findByEmail(email); return user && user.role === 'buyer' && user.password_hash === passwordHash(password) ? user : null; }
function ensurePhoneUser(phone, role) { const existing = [...users.values()].find(user => user.phone === phone && user.role === role); if (existing) return existing; const user = { id: crypto.randomUUID(), email: null, phone, role, verification_status: 'pending' }; users.set(user.id, user); return user; }
function all() { return [...users.values()]; }
function updateVerification(id, verification_status) { const user = users.get(id); if (!user) return null; user.verification_status = verification_status; return user; }
function ensureAdmin(email) { const existing = findByEmail(email); if (existing) return existing; const user = { id: crypto.randomUUID(), email: String(email).toLowerCase(), phone: null, role: 'admin', verification_status: 'approved' }; users.set(user.id, user); return user; }
function findById(id) { return users.get(id) || null; }
function update(id, values) { const user = findById(id); if (!user) return null; Object.assign(user, values); return user; }
module.exports = { createBuyer, verifyBuyerPassword, ensurePhoneUser, all, findById, update, updateVerification, ensureAdmin };
