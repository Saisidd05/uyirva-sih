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

// ─── Sample data ───
const FARMERS = [
  { id: 'F1', name: 'Murugan Farms', location: 'Coimbatore', dist: '4.2 km', rating: '4.8', produce: [{ name: 'Tomato', qty: '800 kg', price: '₹24/kg' }, { name: 'Brinjal', qty: '350 kg', price: '₹18/kg' }] },
  { id: 'F2', name: 'Lakshmi Agro', location: 'Erode', dist: '11.7 km', rating: '4.6', produce: [{ name: 'Onion', qty: '1200 kg', price: '₹21/kg' }, { name: 'Garlic', qty: '200 kg', price: '₹55/kg' }] },
  { id: 'F3', name: 'Selvam & Sons', location: 'Salem', dist: '28.3 km', rating: '4.9', produce: [{ name: 'Potato', qty: '950 kg', price: '₹22/kg' }, { name: 'Carrot', qty: '400 kg', price: '₹30/kg' }] },
  { id: 'F4', name: 'Devi Organics', location: 'Tiruppur', dist: '7.5 km', rating: '4.7', produce: [{ name: 'Banana', qty: '600 kg', price: '₹28/kg' }, { name: 'Coconut', qty: '500 units', price: '₹15/pc' }] },
  { id: 'F5', name: 'Suresh Horticulture', location: 'Namakkal', dist: '19.1 km', rating: '4.5', produce: [{ name: 'Chilli', qty: '300 kg', price: '₹65/kg' }, { name: 'Turmeric', qty: '250 kg', price: '₹80/kg' }] },
  { id: 'F6', name: 'Anbu Farms', location: 'Pollachi', dist: '5.8 km', rating: '4.8', produce: [{ name: 'Mango', qty: '700 kg', price: '₹45/kg' }, { name: 'Guava', qty: '300 kg', price: '₹32/kg' }] }
];

const LOGISTICS = [
  { id: 'L1', name: 'Vel Transports', owner: 'Velmurugan K.', rating: '4.9 ★', loc: 'Coimbatore', vehicles: [{ type: 'Mini Truck', cap: '2 Ton', icon: '🚚', avail: true }, { type: 'Pickup Van', cap: '800 kg', icon: '🚐', avail: true }, { type: 'Refrigerator Van', cap: '1.5 Ton', icon: '❄️', avail: false }] },
  { id: 'L2', name: 'Muthu Cargo', owner: 'Muthu Rajan', rating: '4.7 ★', loc: 'Erode', vehicles: [{ type: 'Lorry (14 ft)', cap: '5 Ton', icon: '🚛', avail: true }, { type: 'Mini Truck', cap: '2 Ton', icon: '🚚', avail: false }] },
  { id: 'L3', name: 'Sri Logistics', owner: 'Sridhar P.', rating: '4.8 ★', loc: 'Salem', vehicles: [{ type: 'Pickup Van', cap: '800 kg', icon: '🚐', avail: true }, { type: 'Auto Tempo', cap: '500 kg', icon: '🛺', avail: true }, { type: 'Lorry (20 ft)', cap: '8 Ton', icon: '🚛', avail: true }] },
  { id: 'L4', name: 'Kaviya Fleet', owner: 'Kavitha M.', rating: '4.6 ★', loc: 'Tiruppur', vehicles: [{ type: 'Refrigerator Van', cap: '2 Ton', icon: '❄️', avail: true }, { type: 'Mini Truck', cap: '1.5 Ton', icon: '🚚', avail: true }] }
];

// ─── Init header ───
document.getElementById('db-user-name').textContent = user.full_name;
document.getElementById('db-avatar').textContent = user.full_name[0];
document.getElementById('db-logout').addEventListener('click', () => {
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
  const cropFilter = document.getElementById('farmer-filter-crop').value.toLowerCase();
  const distFilter = parseFloat(document.getElementById('farmer-filter-dist').value) || 999;
  const filtered = FARMERS.filter(f => {
    if (parseFloat(f.dist) > distFilter) return false;
    if (cropFilter && !f.produce.some(p => p.name.toLowerCase().includes(cropFilter))) return false;
    return true;
  });
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">🌾</div><p>No farmers match your filter. Try widening your search.</p></div>`;
    return;
  }
  grid.innerHTML = filtered.map(f => `
    <div class="farmer-card glass">
      <div class="fc-top">
        <div>
          <div class="fc-name">🧑‍🌾 ${f.name}</div>
          <div class="fc-loc">📍 ${f.location}</div>
        </div>
        <div>
          <div class="fc-dist">${f.dist}</div>
          <div style="font-size:.72rem;color:var(--wheat);text-align:right;margin-top:4px">⭐ ${f.rating}</div>
        </div>
      </div>
      <div class="produce-list">
        ${f.produce.map(p => `
          <div class="produce-row">
            <span class="p-name">${p.name}</span>
            <span class="p-qty">${p.qty}</span>
            <span class="p-price">${p.price}</span>
          </div>
        `).join('')}
      </div>
      <button class="btn-primary" style="width:100%;justify-content:center;margin-top:10px" onclick="placeOrder('${f.id}')">📦 Place Order</button>
    </div>
  `).join('');
}

// ─── RENDER: Logistics ───
function renderLogistics() {
  const grid = document.getElementById('logistics-grid');
  const typeFilter = document.getElementById('logi-filter-type').value;
  const availFilter = document.getElementById('logi-filter-avail').value;
  grid.innerHTML = LOGISTICS.map(l => {
    let vehicles = l.vehicles;
    if (typeFilter) vehicles = vehicles.filter(v => v.type === typeFilter);
    if (availFilter === 'yes') vehicles = vehicles.filter(v => v.avail);
    if (!vehicles.length) return '';
    return `
      <div class="logistics-card glass">
        <div class="lc-header">
          <div>
            <div class="lc-name">🏢 ${l.name}</div>
            <div style="font-size:.75rem;color:var(--muted)">Owner: ${l.owner} · ${l.loc}</div>
          </div>
          <div class="lc-rating">${l.rating}</div>
        </div>
        <div class="vehicles-list">
          ${vehicles.map(v => `
            <div class="vehicle-row">
              <div class="veh-icon">${v.icon}</div>
              <div class="veh-info">
                <div class="vtype">${v.type}</div>
                <div class="vcap">Capacity: ${v.cap}</div>
              </div>
              <span class="veh-avail ${v.avail ? 'yes' : 'no'}">${v.avail ? 'Available' : 'Booked'}</span>
            </div>
          `).join('')}
        </div>
        ${vehicles.some(v => v.avail) ? `<button class="btn-primary" style="width:100%;justify-content:center;margin-top:12px" onclick="bookLogistics('${l.id}')">Book Transport</button>` : ''}
      </div>
    `;
  }).join('');
  if (!grid.innerHTML.trim()) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">🚚</div><p>No logistics partners match your filter.</p></div>`;
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
window.placeOrder = farmerId => {
  const farmer = FARMERS.find(f => f.id === farmerId);
  if (!farmer) return;
  const produce = farmer.produce[0];
  store.orders.unshift({
    id: uid(), crop: produce.name, farmer: farmer.name,
    qty: '500 kg', total: '₹12,000', delivery: farmer.location,
    logistics: 'Vel Transports', status: 'Pending',
    date: new Date().toLocaleDateString('en-IN')
  });
  save(); updateStats();
  // Switch to Orders tab
  document.querySelectorAll('.db-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.db-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-tab="orders"]').classList.add('active');
  document.getElementById('panel-orders').classList.add('active');
  renderOrders();
  alert(`✅ Order placed for ${produce.name} from ${farmer.name}!`);
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
  store.requirements.unshift({
    id: uid(),
    crop: document.getElementById('req-crop').value.trim(),
    qty: document.getElementById('req-qty').value.trim(),
    grade: document.getElementById('req-grade').value,
    price: document.getElementById('req-price').value,
    date: document.getElementById('req-date').value,
    location: document.getElementById('req-loc').value.trim(),
    notes: document.getElementById('req-notes').value.trim(),
    status: 'Open'
  });
  save(); e.currentTarget.reset(); updateStats(); renderRequirements();
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
