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

// Default Mock Data Initializers
function initDefaultMockData() {
  if (!localStorage.getItem('uyirva_farmer_listings')) {
    const defaultListings = [
      { id: 'L-101', farmer_id: 'F1', farmer_name: 'Murugan Organic Farms', crop: 'Tomato (Hybrid)', quantity: '1200', price: '25', freshness: 'Harvested Today', quality_grade: 'Grade A', location: 'Pollachi, Coimbatore' },
      { id: 'L-102', farmer_id: 'F2', farmer_name: 'Lakshmi Agro Producers', crop: 'Shallots (Small Onion)', quantity: '1500', price: '38', freshness: 'Fresh 1-Day Harvest', quality_grade: 'Grade A', location: 'Perundurai, Erode' },
      { id: 'L-103', farmer_id: 'F3', farmer_name: 'Selvam & Sons Farms', crop: 'Ooty Carrot', quantity: '900', price: '34', freshness: 'Harvested Today', quality_grade: 'Grade A', location: 'Mettupalayam, Nilgiris' },
      { id: 'L-104', farmer_id: 'F4', farmer_name: 'Devi Natural Organics', crop: 'Green Chilli', quantity: '350', price: '65', freshness: 'Fresh Today', quality_grade: 'Grade A', location: 'Avinashi, Tiruppur' },
      { id: 'L-105', farmer_id: 'F5', farmer_name: 'Suresh Horticulture', crop: 'Cucumber (Green)', quantity: '800', price: '18', freshness: 'Harvested Today', quality_grade: 'Grade B', location: 'Oddanchatram, Dindigul' },
      { id: 'L-106', farmer_id: 'F6', farmer_name: 'Anbu Farms & Orchards', crop: 'G9 Banana', quantity: '1800', price: '26', freshness: 'Fresh Farmgate', quality_grade: 'Grade A', location: 'Cumbum, Theni' }
    ];
    localStorage.setItem('uyirva_farmer_listings', JSON.stringify(defaultListings));
  }

  if (!localStorage.getItem('uyirva_logistics')) {
    const defaultLogistics = [
      { id: 'L1', name: 'Vel Transports & Cold Chain', type: 'Ashok Leyland Dost / Reefer', location: 'Coimbatore', capacity: '2 Ton', phone: '9842100011', available: true },
      { id: 'L2', name: 'Muthu Cargo & Freight', type: 'Eicher Pro Lorry (14 ft)', location: 'Erode', capacity: '5 Ton', phone: '9842100022', available: true },
      { id: 'L3', name: 'Sri Logistics & Roadlines', type: 'Mahindra Bolero Pickup', location: 'Salem', capacity: '1.5 Ton', phone: '9842100033', available: true },
      { id: 'L4', name: 'Kaviya Fleet Logistics', type: 'Refrigerator Van (Cold-chain)', location: 'Tiruppur', capacity: '2 Ton', phone: '9842100044', available: true },
      { id: 'L5', name: 'Kongu Express Freight', type: 'Force Trump Pickup', location: 'Dindigul', capacity: '1.2 Ton', phone: '9842100055', available: true }
    ];
    localStorage.setItem('uyirva_logistics', JSON.stringify(defaultLogistics));
  }

  if (!localStorage.getItem('uyirva_req')) {
    const defaultReq = [
      { id: 'REQ-101', crop: 'Tomato (Hybrid)', qty: '1200 kg', location: 'Coimbatore Wholesale Mandi', price: '26', grade: 'A', date: '2026-09-15', notes: 'Requires immediate morning transport pickup from Pollachi farmgate.' },
      { id: 'REQ-102', crop: 'Shallots (Small Onion)', qty: '2500 kg', location: 'Erode Supermarket Hub', price: '40', grade: 'A', date: '2026-09-16', notes: 'Ventilated pickup van or mini truck required from Perundurai.' },
      { id: 'REQ-103', crop: 'Ooty Carrot', qty: '850 kg', location: 'Salem Hotel Chain Depot', price: '35', grade: 'A', date: '2026-09-14', notes: 'Standard tempo auto or mini truck required from Mettupalayam.' }
    ];
    localStorage.setItem('uyirva_req', JSON.stringify(defaultReq));
  }

  if (!localStorage.getItem('uyirva_orders')) {
    const defaultOrders = [
      { id: 'ORD-8821', crop: 'Tomato (Hybrid)', farmer: 'Murugan Organic Farms', qty: '1000 kg', total: '₹25,000', delivery: 'Coimbatore Wholesale Mandi', logistics: 'Vel Transports & Cold Chain', status: 'In Transit', date: new Date().toLocaleDateString('en-IN') },
      { id: 'ORD-8822', crop: 'Shallots (Small Onion)', farmer: 'Lakshmi Agro Producers', qty: '500 kg', total: '₹19,000', delivery: 'Erode Supermarket Hub', logistics: 'Muthu Cargo & Freight', status: 'Accepted', date: new Date().toLocaleDateString('en-IN') }
    ];
    localStorage.setItem('uyirva_orders', JSON.stringify(defaultOrders));
  }
}

initDefaultMockData();

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
  if (!grid) return;
  const typeFilter = document.getElementById('logi-filter-type')?.value.toLowerCase() || '';
  const availFilter = document.getElementById('logi-filter-avail')?.value || '';
  const logisticsList = JSON.parse(localStorage.getItem('uyirva_logistics') || '[]');

  const filtered = logisticsList.filter(l => {
    if (typeFilter && !(l.type || '').toLowerCase().includes(typeFilter)) return false;
    if (availFilter === 'yes' && !l.available) return false;
    return true;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">🚚</div><p>No matching logistics partners found.<br>Registered logistics providers will appear here.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map(l => `
    <div class="logistics-card glass">
      <div class="lc-header">
        <div>
          <div class="lc-name">🚚 ${l.name}</div>
          <small style="color:var(--muted)">📍 ${l.location || 'Coimbatore'} · Capacity: ${l.capacity || '2 Ton'}</small>
        </div>
        <div class="lc-rating">⭐ 4.8 / 5.0</div>
      </div>
      <div class="vehicles-list">
        <div class="vehicle-row">
          <div class="veh-icon">🚛</div>
          <div class="veh-info">
            <div class="vtype">${l.type || 'Mini Truck / Reefer'}</div>
            <div class="vcap">Cold-chain Escrow Protected</div>
          </div>
          <span class="veh-avail ${l.available ? 'yes' : 'no'}">${l.available ? 'Available' : 'Busy'}</span>
        </div>
      </div>
      <button class="btn-primary" style="width:100%;justify-content:center;margin-top:10px" onclick="bookLogistics('${l.id}')">📞 Book Vehicle</button>
    </div>
  `).join('');
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
let _pendingListingToOrder = null;

const confirmModal = document.getElementById('order-confirm-modal');
const closeConfirmBtn = document.getElementById('close-order-modal');
const cancelConfirmBtn = document.getElementById('btn-cancel-order');
const confirmOrderBtn = document.getElementById('btn-confirm-order');

function closeOrderModal() {
  confirmModal?.classList.remove('open');
  confirmModal?.setAttribute('aria-hidden', 'true');
  _pendingListingToOrder = null;
}

closeConfirmBtn?.addEventListener('click', closeOrderModal);
cancelConfirmBtn?.addEventListener('click', closeOrderModal);
confirmModal?.addEventListener('click', e => { if (e.target === confirmModal) closeOrderModal(); });

window.placeOrderForListing = listingId => {
  const farmerListings = JSON.parse(localStorage.getItem('uyirva_farmer_listings') || '[]');
  const listing = farmerListings.find(f => f.id === listingId);
  if (!listing) return;

  _pendingListingToOrder = listing;
  const totalPriceNum = parseFloat(listing.quantity || 0) * parseFloat(listing.price || 0);

  document.getElementById('modal-crop-name').textContent = listing.crop;
  document.getElementById('modal-farmer-name').textContent = listing.farmer_name || 'Farmer Produce';
  document.getElementById('modal-qty').textContent = `${listing.quantity} kg`;
  document.getElementById('modal-unit-price').textContent = `₹${listing.price}/kg`;
  document.getElementById('modal-total-price').textContent = `₹${totalPriceNum.toLocaleString()}`;

  confirmModal?.classList.add('open');
  confirmModal?.setAttribute('aria-hidden', 'false');
};

confirmOrderBtn?.addEventListener('click', () => {
  if (!_pendingListingToOrder) return;
  const listing = _pendingListingToOrder;
  const totalPrice = (parseFloat(listing.quantity || 0) * parseFloat(listing.price || 0)).toLocaleString();

  store.orders.unshift({
    id: uid(),
    crop: listing.crop,
    farmer: listing.farmer_name || 'Farmer Produce',
    qty: `${listing.quantity} kg`,
    total: `₹${totalPrice}`,
    delivery: listing.location || 'Coimbatore',
    logistics: 'Direct Partner Transport',
    status: 'Pending',
    date: new Date().toLocaleDateString('en-IN')
  });

  save(); updateStats();
  closeOrderModal();

  document.querySelectorAll('.db-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.db-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-tab="orders"]').classList.add('active');
  document.getElementById('panel-orders').classList.add('active');
  renderOrders();
});
window.bookLogistics = id => {
  const logisticsList = JSON.parse(localStorage.getItem('uyirva_logistics') || '[]');
  const lp = logisticsList.find(l => l.id === id) || { name: 'Logistics Partner' };
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
