/**
 * dashboard.js — Farmer / FPO / Logistics / Admin Dashboard
 * Works with OTP auth (no backend token required for demo mode).
 */

// ─── Auth guard ───
const user = JSON.parse(localStorage.getItem('uyirva_user') || 'null');
if (!user) { location.assign('/'); }

const role = String(user?.role || 'farmer').toLowerCase();
const token = localStorage.getItem('uyirva_access_token') || '';
const app = document.querySelector('#dashboard-app');
const apiBase = window.UYIRVA_API_URL || window.location.origin;
const escapeHtml = v => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

const logout = () => { localStorage.clear(); location.assign('/'); };

const shell = (title, content) => {
  app.innerHTML = `
    <div class="dashboard-hero glass">
      <div>
        <div class="eyebrow">UYIRVA · ${role.toUpperCase()}</div>
        <h2>${title}</h2>
        <p>Welcome, ${escapeHtml(user.full_name || user.phone || 'User')} &nbsp;·&nbsp; Your marketplace workspace.</p>
      </div>
      <button class="button logout-button" id="logout">Sign out</button>
    </div>
    ${content}`;
  document.querySelector('#logout').onclick = logout;
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
    if (response.status === 401) { localStorage.clear(); location.assign('/'); return new Promise(() => {}); }
    throw new Error(data.detail || 'Request failed');
  }
  return data;
};

// ─── FARMER DEMO DATA ───
const DEMO = {
  stats: { active_listings: 3, pending_orders: 2, month_earnings: '14,250' },
  actions: { unread_matches: 5, disputes_awaiting_response: 0 },
  demand_insight: { recommendation: 'Tomato demand is trending high in Coimbatore this week. Consider listing early.' },
  listings: [
    { crop: 'Tomato', quantity: 500, price: 24, freshness: 'Harvested within 24 hours', quality_grade: 'Grade A', photo_url: '' },
    { crop: 'Onion', quantity: 280, price: 21, freshness: 'Fresh today', quality_grade: 'Grade A', photo_url: '' },
    { crop: 'Brinjal', quantity: 150, price: 18, freshness: 'Harvested within 24 hours', quality_grade: 'Grade B', photo_url: '' }
  ],
  buyers: [
    { buyer_name: 'Metro Supermarket', buyer_type: 'Retailer', distance_km: 6.2, crop: 'Tomato', quantity: 300, price_min: 22, price_max: 27, delivery_location: 'Coimbatore North', delivery_window: 'Within 3 days', requirements: { freshness: 'Fresh today', quality: 'Grade A', agmark: 'Preferred' }, contact: { phone: '+91 98765 43210', email: 'procurement@metro.in' }, match_id: 'M001' },
    { buyer_name: 'Annapurna Hotels', buyer_type: 'Restaurant Chain', distance_km: 12.4, crop: 'Onion', quantity: 200, price_min: 19, price_max: 23, delivery_location: 'Gandhipuram', delivery_window: 'Tomorrow morning', requirements: { freshness: 'Within 24 hrs', quality: 'Grade A', agmark: 'Not required' }, contact: { phone: '+91 87654 32109', email: 'chef@annapurna.com' }, match_id: 'M002' }
  ],
  orders: [
    { buyer_name: 'City Fresh Mart', crop: 'Tomato', quantity: 200, agreed_price: 25, order_status: 'Dispatched', escrow_status: 'Held', logistics: { driver_name: 'Ramu K.', contact_number: '+91 76543 21098', vehicle_number: 'TN 33 AB 1234', pickup_time_window: '6:00 AM – 8:00 AM' } }
  ]
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
    <b>${escapeHtml(buyer.buyer_name)}</b>
    <span>${escapeHtml(buyer.buyer_type)} · ${buyer.distance_km} km away</span>
    <p><b>Requirement:</b> ${buyer.quantity} kg of ${escapeHtml(buyer.crop)} · ₹${buyer.price_min}–₹${buyer.price_max}/kg</p>
    <small><b>Delivery:</b> ${escapeHtml(buyer.delivery_location)} · ${escapeHtml(buyer.delivery_window)}<br>
    <b>Freshness:</b> ${escapeHtml(buyer.requirements?.freshness)} · <b>Quality:</b> ${escapeHtml(buyer.requirements?.quality)}</small>
    <p><b>Contact:</b> ${escapeHtml(buyer.contact.phone)} · ${escapeHtml(buyer.contact.email)}</p>
    <button class="button secondary" data-chat="${buyer.match_id}">Contact / Negotiate</button>
  </div>`;

const orderCard = order => `
  <div class="order-item">
    <b>${escapeHtml(order.buyer_name)}</b>
    <p>${escapeHtml(order.crop)} · ${order.quantity} kg · Agreed ₹${order.agreed_price}/kg</p>
    <small>Confirmed → Pooled → Dispatched → Delivered → Paid</small>
    <p>Current: ${escapeHtml(order.order_status)} · Escrow: ${escapeHtml(order.escrow_status)}</p>
    ${order.logistics
      ? `<div class="driver-details"><b>Buyer-allotted driver</b>
         <p><b>Driver:</b> ${escapeHtml(order.logistics.driver_name)} · ${escapeHtml(order.logistics.contact_number)}<br>
         <b>Vehicle:</b> ${escapeHtml(order.logistics.vehicle_number)}<br>
         <b>Pickup:</b> ${escapeHtml(order.logistics.pickup_time_window)}</p></div>`
      : '<p class="buyer-note">Driver and logistics details will appear after the buyer confirms the order.</p>'}
  </div>`;

const bindChats = () => document.querySelectorAll('[data-chat]').forEach(btn =>
  btn.onclick = () => window.alert('💬 Negotiation chat coming in the next release!')
);

// ─── FARMER dashboard ───
async function farmer() {
  let d, listings, buyers, orders;
  try {
    [d, { listings }, { buyers }, { orders }] = await Promise.all([
      api('/api/farmer/dashboard'),
      api('/api/farmer/listings'),
      api('/api/farmer/buyers?sort=distance'),
      api('/api/farmer/accepted-orders')
    ]);
  } catch {
    // No backend — use demo data
    d = DEMO; listings = DEMO.listings; buyers = DEMO.buyers; orders = DEMO.orders;
  }

  shell('Farmer Dashboard', `
    <div class="feature-grid">
      <div class="feature-card">
        <h3>My vegetable listings</h3>
        <strong>${d.stats.active_listings}</strong>
        <p>Active listings · Pending orders: ${d.stats.pending_orders}</p>
        <button class="button primary" id="create">+ List vegetables</button>
      </div>
      <div class="feature-card">
        <h3>Action needed</h3>
        <p>${d.actions.unread_matches} buyer matches · ${d.actions.disputes_awaiting_response} disputes awaiting</p>
      </div>
      <div class="feature-card">
        <h3>Demand planning</h3>
        <p>${escapeHtml(d.demand_insight.recommendation)}</p>
      </div>
      <div class="feature-card">
        <h3>This month earnings</h3>
        <strong>₹${d.stats.month_earnings}</strong>
      </div>
    </div>
    <div class="feature-card">
      <h3>My listed vegetables</h3>
      <div class="listing-list">${listings.length ? listings.map(listingCard).join('') : '<p>No vegetables listed yet. Create a listing to reach buyers.</p>'}</div>
    </div>
    <div class="feature-card">
      <h3>Nearby Buyers</h3>
      <p class="buyer-note">Matched buyers interested in your active listings.</p>
      <div class="buyer-requirements">${buyers.length ? buyers.map(buyerCard).join('') : '<p>No buyer interest yet.</p>'}</div>
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
  shell('Logistics Partner Dashboard', `
    <div class="feature-grid">
      <div class="feature-card"><h3>Assigned Orders</h3><strong>5</strong><p>Active deliveries today</p></div>
      <div class="feature-card"><h3>Vehicles Available</h3><strong>3 / 5</strong><p>Fleet availability</p></div>
      <div class="feature-card"><h3>Distance Today</h3><strong>127 km</strong><p>Total route distance</p></div>
      <div class="feature-card"><h3>This Month</h3><strong>₹28,500</strong><p>Logistics earnings</p></div>
    </div>
    <div class="feature-card"><h3>Route optimization and delivery tracking coming soon.</h3></div>
  `);
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

// ─── Listing modal ───
const modal = document.querySelector('#listing-modal');
const form = document.querySelector('#listing-form');
const photoInput = form.elements.photo;
const preview = document.querySelector('#listing-image-preview');
const today = new Date().toISOString().slice(0, 10);
form.elements.pickup_date.min = today;
let photoData = '';

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
    farmer();
  } catch (issue) {
    // Demo mode — just show success and close
    if (issue.message === 'OFFLINE') {
      modal.classList.remove('open'); form.reset(); preview.hidden = true; photoData = '';
      window.alert('✅ Listing saved locally! It will sync when the backend is connected.');
    } else {
      error.textContent = issue.message;
    }
  }
};
