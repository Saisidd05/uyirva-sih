import { initAccountModal } from './account.js';
import { initAiPriceModal } from './ai-price.js';

// ─── Auth guard ───
const user = JSON.parse(localStorage.getItem('uyirva_user') || 'null');
if (!user) { location.assign('/'); }

const role = String(user?.role || 'farmer').toLowerCase();
const token = localStorage.getItem('uyirva_access_token') || '';
const app = document.querySelector('#dashboard-app');
const apiBase = window.UYIRVA_API_URL || window.location.origin;
const escapeHtml = v => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

// Initialize Account & AI Price Modals
initAccountModal();
initAiPriceModal();

const logout = () => {
  localStorage.removeItem('uyirva_access_token');
  localStorage.removeItem('uyirva_user');
  location.assign('/');
};

const shell = (title, content) => {
  app.innerHTML = content;
  const navLogout = document.querySelector('#nav-logout');
  if (navLogout) navLogout.onclick = logout;
};

// ─── API helper (graceful offline fallback) ───
const api = async (path, options = {}) => {
  if (!token) throw new Error('OFFLINE');
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers }
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('uyirva_access_token');
      localStorage.removeItem('uyirva_user');
      location.assign('/');
      return new Promise(() => {});
    }
    throw new Error(data.detail || 'Request failed');
  }
  return data;
};

// ─── Card renderers ───
const listingCard = item => `
  <div class="listing-item">
    ${item.photo_url ? `<img src="${item.photo_url}" alt="${escapeHtml(item.crop)}">` : `<div style="width:78px;height:78px;border-radius:9px;background:rgba(233,185,73,.15);display:grid;place-items:center;font-size:2rem;flex-shrink:0">🌿</div>`}
    <div>
      <b>${escapeHtml(item.crop)}</b>
      <p>${item.quantity} kg · ₹${item.price}/kg</p>
      <small>${escapeHtml(item.freshness || '')} · ${escapeHtml(item.quality_grade || '')}</small>
    </div>
  </div>`;

const buyerCard = buyer => `
  <div class="buyer-requirement">
    <b>${escapeHtml(buyer.crop)} Required — ${escapeHtml(buyer.qty)}</b>
    <span>📍 ${escapeHtml(buyer.location || 'Coimbatore')}</span>
    <p><b>Max Price:</b> ₹${escapeHtml(buyer.price || 'Negotiable')}/kg · <b>Grade:</b> Grade ${escapeHtml(buyer.grade || 'A')}</p>
    <small><b>Required By:</b> ${escapeHtml(buyer.date || 'Immediate')} · <b>Notes:</b> ${escapeHtml(buyer.notes || 'None')}</small>
    <div style="margin-top:8px">
      <button class="button secondary" data-chat="${buyer.id}">Contact Buyer</button>
    </div>
  </div>`;

const orderCard = order => `
  <div class="order-item">
    <b>Order #${escapeHtml(order.id)} — ${escapeHtml(order.crop)}</b>
    <p>${escapeHtml(order.qty)} · Total: ${escapeHtml(order.total)}</p>
    <small>Delivery to: ${escapeHtml(order.delivery)} · Logistics: ${escapeHtml(order.logistics)}</small>
    <p>Status: <span class="tag high">${escapeHtml(order.status)}</span></p>
  </div>`;

const bindChats = () => document.querySelectorAll('[data-chat]').forEach(btn =>
  btn.onclick = () => window.alert('💬 Contacting buyer for negotiation...')
);

// ─── FARMER dashboard ───
async function farmer() {
  let listings = [], buyers = [], orders = [];
  try {
    const [_, listingsRes, buyersRes, ordersRes] = await Promise.all([
      api('/api/farmer/dashboard'),
      api('/api/farmer/listings'),
      api('/api/farmer/buyers?sort=distance'),
      api('/api/farmer/accepted-orders')
    ]);
    listings = listingsRes?.listings || [];
    buyers = buyersRes?.buyers || [];
    orders = ordersRes?.orders || [];
  } catch {
    // Read real user data from localStorage, scope to user if possible
    const localListings = JSON.parse(localStorage.getItem('uyirva_farmer_listings') || '[]');
    listings = user?.id ? localListings.filter(l => !l.farmer_id || l.farmer_id === user.id) : localListings;
    buyers = JSON.parse(localStorage.getItem('uyirva_req') || '[]');
    orders = JSON.parse(localStorage.getItem('uyirva_orders') || '[]');
  }

  const activeCount = listings.length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  shell('Farmer Dashboard', `
    <div class="feature-grid">
      <div class="feature-card">
        <h3>My vegetable listings</h3>
        <strong>${activeCount}</strong>
        <p>Active listings · Pending orders: ${pendingCount}</p>
        <button class="button primary" id="create">+ List vegetables</button>
      </div>
      <div class="feature-card">
        <h3>Action needed</h3>
        <p>${buyers.length} buyer requirements posted</p>
      </div>
      <div class="feature-card">
        <h3>Demand planning & AI Pricing</h3>
        <p>${listings.length > 0 ? 'Your vegetables are live for buyers.' : 'List your harvested vegetables to match with nearby buyers.'}</p>
        <button class="button secondary btn-sm" id="btn-ai-more-info" type="button" style="width:100%;margin-top:10px;font-size:.82rem">🤖 More Info &amp; AI Price Suggestions</button>
      </div>
      <div class="feature-card">
        <h3>This month earnings</h3>
        <strong>₹0</strong>
      </div>
    </div>
    <div class="feature-card">
      <h3>My listed vegetables</h3>
      <div class="listing-list">${listings.length ? listings.map(listingCard).join('') : '<p>No vegetables listed yet. Click "+ List vegetables" to post your produce.</p>'}</div>
    </div>
    <div class="feature-card">
      <h3>Nearby Buyers Requirements</h3>
      <p class="buyer-note">Buyer requirements posted on the marketplace platform.</p>
      <div class="buyer-requirements">${buyers.length ? buyers.map(buyerCard).join('') : '<p>No buyer requirements posted yet.</p>'}</div>
    </div>
    <div class="feature-card">
      <h3>Accepted orders</h3>
      <div class="order-list">${orders.length ? orders.map(orderCard).join('') : '<p>No buyer-confirmed orders yet.</p>'}</div>
    </div>
  `);
  document.querySelector('#create').onclick = () => document.querySelector('#listing-modal').classList.add('open');
  bindChats();
}

// ─── Other roles (demo shells) ───
async function fpo() {
  shell('FPO Dashboard', `
    <div class="feature-grid">
      <div class="feature-card"><h3>Member Farmers</h3><strong>24</strong><p>Active members in your FPO</p></div>
      <div class="feature-card"><h3>Pooled Listings</h3><strong>8</strong><p>Combined crop listings</p></div>
      <div class="feature-card"><h3>Total Volume</h3><strong>4,200 kg</strong><p>Available for buyers</p></div>
      <div class="feature-card"><h3>This Month</h3><strong>₹1,12,000</strong><p>Collective earnings</p></div>
    </div>
    <div class="feature-card"><h3>FPO management features coming soon.</h3><p>Member onboarding, collective pricing and pooled logistics are in the next sprint.</p></div>
  `);
}

async function logistics() {
  location.assign('/pages/logistics/dashboard.html');
}

async function admin() {
  shell('Admin Control Centre', `
    <div class="feature-grid">
      <div class="feature-card"><h3>Active Farmers</h3><strong>142</strong></div>
      <div class="feature-card"><h3>Active Buyers</h3><strong>58</strong></div>
      <div class="feature-card"><h3>Orders This Month</h3><strong>214</strong></div>
      <div class="feature-card"><h3>Platform Volume</h3><strong>₹8.4 L</strong></div>
    </div>
    <div class="feature-card"><h3>Admin analytics dashboard coming soon.</h3></div>
  `);
}

// ─── Route by role ───
({ farmer, fpo, logistics, admin }[role] || farmer)()
  .catch(err => shell('Dashboard', `<div class="feature-card"><p style="color:#ffaaaa">${escapeHtml(err.message)}</p></div>`));

// ─── Listing modal & AI Price predictor ───
const modal = document.querySelector('#listing-modal');
const form = document.querySelector('#listing-form');
const photoInput = form.elements.photo;
const preview = document.querySelector('#listing-image-preview');
const today = new Date().toISOString().slice(0, 10);
form.elements.pickup_date.min = today;
let photoData = '';

const AI_PRICES = {
  Tomato: { optimal: 27, min: 24, max: 29 },
  Onion: { optimal: 23, min: 21, max: 25 },
  Potato: { optimal: 22, min: 20, max: 24 },
  Brinjal: { optimal: 19, min: 17, max: 22 },
  Carrot: { optimal: 32, min: 28, max: 35 },
  Beans: { optimal: 40, min: 35, max: 44 },
  Cabbage: { optimal: 16, min: 14, max: 18 },
  Cauliflower: { optimal: 25, min: 22, max: 28 },
  Okra: { optimal: 28, min: 25, max: 30 },
  Chilli: { optimal: 68, min: 60, max: 75 },
  Cucumber: { optimal: 18, min: 16, max: 20 },
  Drumstick: { optimal: 52, min: 45, max: 58 },
  Turmeric: { optimal: 88, min: 82, max: 95 },
  Garlic: { optimal: 110, min: 100, max: 120 }
};

const cropSelect = form.elements.crop;
const priceInput = form.elements.price;
const aiPriceText = document.querySelector('#ai-price-text');
const btnUseAiPrice = document.querySelector('#btn-use-ai-price');

let currentAiOptimalPrice = null;

if (cropSelect) {
  cropSelect.onchange = () => {
    const veggie = cropSelect.value;
    if (veggie && AI_PRICES[veggie]) {
      const data = AI_PRICES[veggie];
      currentAiOptimalPrice = data.optimal;
      if (aiPriceText) aiPriceText.textContent = `🤖 AI Prediction for ${veggie}: ₹${data.optimal}/kg (Fair range: ₹${data.min}–₹${data.max}/kg)`;
      if (btnUseAiPrice) btnUseAiPrice.hidden = false;
      if (!priceInput.value) {
        priceInput.value = data.optimal;
      }
    } else {
      currentAiOptimalPrice = null;
      if (aiPriceText) aiPriceText.textContent = '🤖 Select vegetable to get AI Price Suggestion';
      if (btnUseAiPrice) btnUseAiPrice.hidden = true;
    }
  };
}

if (btnUseAiPrice) {
  btnUseAiPrice.onclick = () => {
    if (currentAiOptimalPrice && priceInput) {
      priceInput.value = currentAiOptimalPrice;
      priceInput.style.borderColor = 'var(--wheat)';
      setTimeout(() => { priceInput.style.borderColor = ''; }, 1500);
    }
  };
}

document.querySelector('.auth-close').onclick = () => modal.classList.remove('open');

photoInput.onchange = () => {
  const file = photoInput.files[0];
  const error = document.querySelector('#listing-error');
  if (!file) return;
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    photoInput.value = ''; error.textContent = 'Please choose a JPG or PNG image.'; return;
  }
  error.textContent = '';
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
  const reader = new FileReader();
  reader.onload = () => { photoData = reader.result; };
  reader.readAsDataURL(file);
};

form.onsubmit = async event => {
  event.preventDefault();
  const error = document.querySelector('#listing-error');
  error.textContent = '';
  if (!form.checkValidity() || !photoData) {
    error.textContent = 'Complete every required field and add a JPG or PNG image.';
    form.reportValidity(); return;
  }
  const values = Object.fromEntries(new FormData(form));
  if (values.pickup_date < today) { error.textContent = 'Pickup-ready date cannot be in the past.'; return; }
  const { pickup_date, pickup_time, ...listing } = values;
  try {
    await api('/api/farmer/listings', {
      method: 'POST',
      body: JSON.stringify({ ...listing, pickup_ready_at: `${pickup_date}T${pickup_time}`, unit: 'kg', photo_url: photoData })
    });
    modal.classList.remove('open'); form.reset(); preview.hidden = true; photoData = '';
    if (aiPriceText) aiPriceText.textContent = '🤖 Select vegetable to get AI Price Suggestion';
    if (btnUseAiPrice) btnUseAiPrice.hidden = true;
    farmer();
  } catch (issue) {
    // Offline mode — save listing to localStorage
    if (issue.message === 'OFFLINE') {
      const existing = JSON.parse(localStorage.getItem('uyirva_farmer_listings') || '[]');
      existing.unshift({
        id: Date.now().toString(),
        farmer_id: user?.id || 'farmer',
        crop: values.crop,
        quantity: values.quantity,
        price: values.price,
        freshness: values.freshness,
        quality_grade: values.quality_grade,
        location: values.location,
        photo_url: photoData
      });
      localStorage.setItem('uyirva_farmer_listings', JSON.stringify(existing));
      modal.classList.remove('open'); form.reset(); preview.hidden = true; photoData = '';
      if (aiPriceText) aiPriceText.textContent = '🤖 Select vegetable to get AI Price Suggestion';
      if (btnUseAiPrice) btnUseAiPrice.hidden = true;
      window.alert('✅ Vegetable listing published successfully!');
      farmer();
    } else {
      error.textContent = issue.message;
    }
  }
};

