import { initAccountModal } from './account.js';

/**
 * buyer-dashboard.js — Full Buyer Dashboard module for UYIRVA
 * Tabs: Requirements | Farmer Listings | Logistics | My Orders
 */

// ─── Auth guard ───
const user = JSON.parse(localStorage.getItem('uyirva_user') || 'null');
// Normalize role — accept 'buyer', 'BUYER', 'Buyer' etc.
const userRole = (user?.role || '').toUpperCase();
if (!user) {
  location.assign('/');
}
// If role is set but not buyer, update it so the dashboard works
if (user && userRole !== 'BUYER') {
  user.role = 'BUYER';
  localStorage.setItem('uyirva_user', JSON.stringify(user));
}

// ─── Apply buyer background & Init Account Modal ───
document.body.classList.add('buyer-mode');
initAccountModal();

// ─── Data store (localStorage backed) ───
const store = {
  requirements: JSON.parse(localStorage.getItem('uyirva_req') || '[]'),
  orders: JSON.parse(localStorage.getItem('uyirva_orders') || '[]')
};
const save = () => {
  localStorage.setItem('uyirva_req', JSON.stringify(store.requirements));
  localStorage.setItem('uyirva_orders', JSON.stringify(store.orders));
};
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();

// ─── Init header ───
const nameEl = document.getElementById('db-user-name');
if (nameEl) nameEl.textContent = user.full_name || 'Buyer';

const avatarEl = document.getElementById('db-avatar');
if (avatarEl) avatarEl.textContent = (user.full_name || 'B')[0];

document.getElementById('db-logout')?.addEventListener('click', () => {
  localStorage.removeItem('uyirva_access_token');
  localStorage.removeItem('uyirva_user');
  location.assign('/');
});

// ─── Tab switching ───
document.querySelectorAll('.db-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.db-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.db-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`#panel-${btn.dataset.tab}`).classList.add('active');
  });
});

// ─── Stats update ───
function updateStats() {
  document.getElementById('stat-req').textContent = store.requirements.length;
  document.getElementById('stat-orders').textContent = store.orders.filter(o => o.status !== 'Delivered').length;
}

// ─── Status badge ───
function statusBadge(s) {
  const cls = { Pending: 'open', Accepted: 'matched', 'In Transit': 'transit', Delivered: 'delivered' };
  return `<span class="badge ${cls[s] || 'open'}">${s}</span>`;
}

// ─── RENDER: Requirements ───
function renderRequirements() {
  const list = document.getElementById('req-list');
  if (!store.requirements.length) {
    list.innerHTML = `<div class="empty-state"><div class="es-icon">📋</div><p>No requirements posted yet.<br>Add one above to start matching with farmers.</p></div>`;
    return;
  }
  list.innerHTML = store.requirements.map(r => `
    <div class="req-card glass">
      <div>
        <h3>${r.crop} — ${r.qty}</h3>
        <div class="meta">
          <span>🏷️ Grade ${r.grade}</span>
          ${r.price ? `<span>💰 Max ₹${r.price}/kg</span>` : ''}
          ${r.date ? `<span>📅 By ${r.date}</span>` : ''}
          <span>📍 ${r.location}</span>
          ${r.notes ? `<span>📝 ${r.notes}</span>` : ''}
        </div>
        <div style="margin-top:8px">${statusBadge(r.status)}</div>
      </div>
      <div class="req-actions">
        <button class="btn-sm" onclick="editReq('${r.id}')">Edit</button>
        <button class="btn-sm danger" onclick="deleteReq('${r.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// ─── RENDER: Farmers ───
function renderFarmers() {
  const grid = document.getElementById('farmer-grid');
  const cropFilter = document.getElementById('farmer-filter-crop')?.value.toLowerCase() || '';
  const farmerListings = JSON.parse(localStorage.getItem('uyirva_farmer_listings') || '[]');

  const filtered = farmerListings.filter(f => {
    if (cropFilter && !f.crop.toLowerCase().includes(cropFilter)) return false;
    return true;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">🌾</div><p>No farmer produce listings available yet.<br>Listings published by farmers will appear here live.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(f => `
    <div class="farmer-card glass">
      <div class="fc-top">
        <div>
          <div class="fc-name">🧑‍🌾 Farmer Produce</div>
          <div class="fc-loc">📍 ${f.location || 'Coimbatore'}</div>
        </div>
        <div>
          <div class="fc-dist">⭐ Fresh</div>
        </div>
      </div>
      <div class="produce-list">
        <div class="produce-row">
          <span class="p-name">${f.crop}</span>
          <span class="p-qty">${f.quantity} kg</span>
          <span class="p-price">₹${f.price}/kg</span>
        </div>
      </div>
      <small style="color:var(--muted);display:block;margin-top:6px">Grade: ${f.quality_grade || 'Standard'} · ${f.freshness || 'Fresh'}</small>
      <button class="btn-primary" style="width:100%;justify-content:center;margin-top:10px" onclick="placeOrderForListing('${f.id}')">📦 Place Order</button>
    </div>
  `).join('');
}

// ─── RENDER: Logistics ───
function renderLogistics() {
  const grid = document.getElementById('logistics-grid');
  const logisticsList = JSON.parse(localStorage.getItem('uyirva_logistics') || '[]');

  if (!logisticsList.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">🚚</div><p>No logistics partners listed yet.<br>Registered logistics providers will appear here.</p></div>`;
    return;
  }
}

// ─── RENDER: Orders ───
function renderOrders() {
  const list = document.getElementById('orders-list');
  const statusFilter = document.getElementById('order-filter-status').value;
  const filtered = store.orders.filter(o => !statusFilter || o.status === statusFilter);
  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><div class="es-icon">📦</div><p>No orders yet.<br>Browse farmer listings and place your first order.</p></div>`;
    return;
  }
  const steps = ['Order Placed', 'Farmer Accepted', 'Logistics Assigned', 'In Transit', 'Delivered'];
  list.innerHTML = filtered.map(o => {
    const stepIdx = { Pending: 0, Accepted: 1, 'In Transit': 3, Delivered: 4 }[o.status] ?? 0;
    return `
      <div class="order-card glass">
        <div class="order-top">
          <div>
            <div class="order-id">Order #${o.id} · ${o.date}</div>
            <div class="order-crop">${o.crop} from ${o.farmer}</div>
          </div>
          ${statusBadge(o.status)}
        </div>
        <div class="order-details">
          <div class="od-item"><small>Quantity</small>${o.qty}</div>
          <div class="od-item"><small>Total Price</small><strong style="color:var(--wheat)">${o.total}</strong></div>
          <div class="od-item"><small>Delivery</small>${o.delivery}</div>
          <div class="od-item"><small>Logistics</small>${o.logistics}</div>
        </div>
        <div class="order-progress">
          <small style="color:var(--muted)">Order Progress</small>
          <div class="progress-track">
            ${steps.map((s, i) => {
              let cls = '';
              if (i < stepIdx) cls = 'done';
              else if (i === stepIdx) cls = 'active';
              return (i > 0 ? '<span class="pt-arrow">→</span>' : '') + `<span class="pt-step ${cls}">${s}</span>`;
            }).join('')}
          </div>
        </div>
        ${o.status === 'Pending' ? `<div style="margin-top:12px"><button class="btn-sm danger" onclick="cancelOrder('${o.id}')">Cancel Order</button></div>` : ''}
      </div>
    `;
  }).join('');
}

// ─── ACTIONS (global so onclick= works) ───
window.deleteReq = id => {
  store.requirements = store.requirements.filter(r => r.id !== id);
  save(); updateStats(); renderRequirements();
};
window.editReq = id => {
  const r = store.requirements.find(x => x.id === id);
  if (!r) return;
  document.getElementById('req-crop').value = r.crop;
  document.getElementById('req-qty').value = r.qty;
  document.getElementById('req-grade').value = r.grade;
  document.getElementById('req-price').value = r.price || '';
  document.getElementById('req-date').value = r.date || '';
  document.getElementById('req-loc').value = r.location;
  document.getElementById('req-notes').value = r.notes || '';
  store.requirements = store.requirements.filter(x => x.id !== id);
  save(); updateStats(); renderRequirements();
  document.getElementById('req-crop').scrollIntoView({ behavior: 'smooth', block: 'center' });
};
window.placeOrderForListing = listingId => {
  const farmerListings = JSON.parse(localStorage.getItem('uyirva_farmer_listings') || '[]');
  const listing = farmerListings.find(f => f.id === listingId);
  if (!listing) return;
  const totalPrice = (parseFloat(listing.quantity || 0) * parseFloat(listing.price || 0)).toLocaleString();
  store.orders.unshift({
    id: uid(),
    crop: listing.crop,
    farmer: 'Farmer Produce',
    qty: `${listing.quantity} kg`,
    total: `₹${totalPrice}`,
    delivery: listing.location || 'Coimbatore',
    logistics: 'Direct Partner Transport',
    status: 'Pending',
    date: new Date().toLocaleDateString('en-IN')
  });
  save(); updateStats();
  document.querySelectorAll('.db-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.db-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-tab="orders"]').classList.add('active');
  document.getElementById('panel-orders').classList.add('active');
  renderOrders();
  alert(`✅ Order placed for ${listing.crop} (${listing.quantity} kg)!`);
};
window.bookLogistics = id => {
  const lp = LOGISTICS.find(l => l.id === id);
  alert(`✅ Booking request sent to ${lp.name}!\nThey will confirm within 2 hours.`);
};
window.cancelOrder = id => {
  if (!confirm('Cancel this order?')) return;
  store.orders = store.orders.filter(o => o.id !== id);
  save(); updateStats(); renderOrders();
};

// ─── Requirement form ───
document.getElementById('req-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const newReq = {
    id: uid(),
    crop: document.getElementById('req-crop').value.trim(),
    qty: document.getElementById('req-qty').value.trim(),
    grade: document.getElementById('req-grade').value,
    price: document.getElementById('req-price').value,
    date: document.getElementById('req-date').value,
    location: document.getElementById('req-loc').value.trim(),
    notes: document.getElementById('req-notes').value.trim(),
    status: 'Open'
  };
  store.requirements.unshift(newReq);
  save();
  e.currentTarget.reset();
  updateStats();
  renderRequirements();
  document.getElementById('req-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  alert(`✅ Requirement for ${newReq.crop} (${newReq.qty}) posted successfully!`);
});

// ─── Filter events ───
document.getElementById('farmer-filter-crop')?.addEventListener('change', renderFarmers);
document.getElementById('farmer-filter-dist')?.addEventListener('change', renderFarmers);
document.getElementById('logi-filter-type')?.addEventListener('change', renderLogistics);
document.getElementById('logi-filter-avail')?.addEventListener('change', renderLogistics);
document.getElementById('order-filter-status')?.addEventListener('change', renderOrders);

// ─── Initial render ───
updateStats();
renderRequirements();
renderFarmers();
renderLogistics();
renderOrders();
