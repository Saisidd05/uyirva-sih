import { initAccountModal } from './account.js';

/**
 * logistics-dashboard.js — Full Logistics Owner Dashboard module for UYIRVA
 * Features:
 * 1. Owner vehicle stack management (Add vehicle, register fleet, status update)
 * 2. Buyer requirements list & Direct vehicle assignment
 * 3. Vehicle selection notification trigger to logistics owner
 * 4. Active delivery route tracking & Interactive map with Google Maps GPS Navigation
 */

// ─── Auth guard ───
const user = JSON.parse(localStorage.getItem('uyirva_user') || 'null');
if (!user) { location.assign('/'); }

// Apply mode styling & init account modal
document.body.classList.add('logistics-mode');
initAccountModal();

// ─── Local Storage Keys ───
const STORE_VEHICLES = 'uyirva_logistics_vehicles';
const STORE_NOTIFS = 'uyirva_logistics_notifs';
const STORE_TRIPS = 'uyirva_logistics_trips';

// Default mock vehicles if empty
function getDefaultVehicles() {
  return [
    { id: 'VEH-101', name: 'Ashok Leyland Dost', number: 'TN 38 CZ 4920', type: 'Mini Truck (2 Ton)', status: 'Available', location: 'Coimbatore', capacity: '2000 kg', driver: 'M. Selvam', driverPhone: '9842100011' },
    { id: 'VEH-102', name: 'Mahindra Bolero Pickup', number: 'TN 37 B 8812', type: 'Pickup Van', status: 'Available', location: 'Pollachi', capacity: '1500 kg', driver: 'K. Rajesh', driverPhone: '9842100022' },
    { id: 'VEH-103', name: 'Tata 407 Reefer', number: 'TN 38 AB 1109', type: 'Refrigerator Van', status: 'In Transit', location: 'Mettupalayam', capacity: '3500 kg', driver: 'P. Anand', driverPhone: '9842100033' }
  ];
}

function getVehicles() {
  const data = localStorage.getItem(STORE_VEHICLES);
  if (!data) {
    const def = getDefaultVehicles();
    localStorage.setItem(STORE_VEHICLES, JSON.stringify(def));
    return def;
  }
  return JSON.parse(data);
}

function saveVehicles(vList) {
  localStorage.setItem(STORE_VEHICLES, JSON.stringify(vList));
}

function getNotifications() {
  return JSON.parse(localStorage.getItem(STORE_NOTIFS) || '[]');
}

function saveNotifications(nList) {
  localStorage.setItem(STORE_NOTIFS, JSON.stringify(nList));
}

function getTrips() {
  return JSON.parse(localStorage.getItem(STORE_TRIPS) || '[]');
}

function saveTrips(tList) {
  localStorage.setItem(STORE_TRIPS, JSON.stringify(tList));
}

// ─── Header user setup ───
const nameEl = document.getElementById('db-user-name');
if (nameEl) nameEl.textContent = user.full_name || 'Logistics Partner';

const avatarEl = document.getElementById('db-avatar');
if (avatarEl) avatarEl.textContent = (user.full_name || 'L')[0];

document.getElementById('db-logout')?.addEventListener('click', () => {
  localStorage.removeItem('uyirva_access_token');
  localStorage.removeItem('uyirva_user');
  location.assign('/');
});

// ─── Tab Switching ───
document.querySelectorAll('.db-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.db-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.db-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector(`#panel-${btn.dataset.tab}`)?.classList.add('active');
  });
});

// ─── Update Header Badges & Stats ───
function updateStats() {
  const vehicles = getVehicles();
  const notifs = getNotifications();
  const trips = getTrips();

  const totalV = vehicles.length;
  const availV = vehicles.filter(v => v.status === 'Available').length;
  const unreadN = notifs.filter(n => !n.read).length;
  const activeT = trips.filter(t => t.status === 'In Transit').length;

  const statVeh = document.getElementById('stat-vehicles');
  if (statVeh) statVeh.textContent = `${availV} / ${totalV}`;

  const statNot = document.getElementById('stat-notifs');
  if (statNot) statNot.textContent = unreadN;

  const statActive = document.getElementById('stat-active-trips');
  if (statActive) statActive.textContent = activeT;

  const badgeNotif = document.getElementById('badge-notif-count');
  if (badgeNotif) badgeNotif.textContent = unreadN;
}

// ─── RENDER: Vehicle Stack View ───
function renderVehicles() {
  const container = document.getElementById('vehicle-stack-list');
  if (!container) return;

  const vehicles = getVehicles();
  if (!vehicles.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">🚚</div>
        <p>No vehicles added to your fleet yet.<br>Add your first vehicle above to start receiving buyer requests.</p>
      </div>`;
    return;
  }

  container.innerHTML = vehicles.map(v => `
    <div class="vehicle-card glass">
      <div class="vc-top">
        <div class="vc-badge-icon">${v.type.includes('Refrig') ? '❄️' : '🚛'}</div>
        <div class="vc-main">
          <h3>${v.name} <small>(${v.number})</small></h3>
          <p><strong>Type:</strong> ${v.type} &middot; <strong>Capacity:</strong> ${v.capacity}</p>
          <small>📍 Base Location: ${v.location} &middot; 👨‍✈️ Driver: ${v.driver} (${v.driverPhone})</small>
        </div>
        <div>
          <span class="badge ${v.status === 'Available' ? 'open' : 'transit'}">${v.status}</span>
        </div>
      </div>
      <div class="vc-actions">
        <button class="btn-sm" onclick="toggleVehicleStatus('${v.id}')">
          ${v.status === 'Available' ? 'Mark Maintenance' : 'Mark Available'}
        </button>
        <button class="btn-sm danger" onclick="deleteVehicle('${v.id}')">Remove</button>
      </div>
    </div>
  `).join('');
}

// Global actions for window
window.toggleVehicleStatus = id => {
  const vehicles = getVehicles();
  const v = vehicles.find(x => x.id === id);
  if (v) {
    v.status = v.status === 'Available' ? 'Under Maintenance' : 'Available';
    saveVehicles(vehicles);
    renderVehicles();
    updateStats();
  }
};

window.deleteVehicle = id => {
  if (!confirm('Are you sure you want to remove this vehicle from your fleet?')) return;
  const vehicles = getVehicles().filter(x => x.id !== id);
  saveVehicles(vehicles);
  renderVehicles();
  updateStats();
};

// ─── Add Vehicle Form ───
document.getElementById('add-vehicle-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('veh-name').value.trim();
  const num = document.getElementById('veh-num').value.trim().toUpperCase();
  const type = document.getElementById('veh-type').value;
  const cap = document.getElementById('veh-cap').value.trim();
  const loc = document.getElementById('veh-loc').value.trim();
  const driver = document.getElementById('veh-driver').value.trim();
  const driverPhone = document.getElementById('veh-phone').value.trim();

  if (!name || !num || !cap || !loc) return;

  const newVehicle = {
    id: `VEH-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    number: num,
    type,
    capacity: cap,
    location: loc,
    driver: driver || 'Owner Operator',
    driverPhone: driverPhone || user.phone || '9876543210',
    status: 'Available'
  };

  // 1. Update vehicle stack list
  const vehicles = getVehicles();
  vehicles.unshift(newVehicle);
  saveVehicles(vehicles);

  // 2. Also sync to global public logistics list so buyers can see it in Buyer Dashboard!
  const publicLogi = JSON.parse(localStorage.getItem('uyirva_logistics') || '[]');
  publicLogi.unshift({
    id: newVehicle.id,
    name: newVehicle.name,
    type: newVehicle.type,
    location: newVehicle.location,
    capacity: newVehicle.capacity,
    phone: newVehicle.driverPhone,
    available: true
  });
  localStorage.setItem('uyirva_logistics', JSON.stringify(publicLogi));

  e.target.reset();
  renderVehicles();
  renderBuyerListings();
  updateStats();

  // Instant smooth feedback message without blocking laggy alert dialogs!
  const feedback = document.getElementById('veh-add-feedback');
  if (feedback) {
    feedback.textContent = `✅ Vehicle ${name} (${num}) added to your stack!`;
    feedback.hidden = false;
    setTimeout(() => { feedback.hidden = true; }, 4000);
  }

  // Scroll down to newly added vehicle card smoothly
  document.getElementById('vehicle-stack-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ─── RENDER: Buyer Requirements List & Vehicle Assignment ───
function renderBuyerListings() {
  const container = document.getElementById('buyer-req-list');
  if (!container) return;

  const buyers = JSON.parse(localStorage.getItem('uyirva_req') || '[]');
  const vehicles = getVehicles().filter(v => v.status === 'Available');

  if (!buyers.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">📋</div>
        <p>No buyer requirement orders available currently.<br>Buyer demands will appear here for transport booking.</p>
      </div>`;
    return;
  }

  container.innerHTML = buyers.map(b => `
    <div class="buyer-card glass">
      <div class="bc-info">
        <h3>🛒 ${b.crop} Requirement — ${b.qty}</h3>
        <div class="meta">
          <span>📍 Delivery: ${b.location}</span>
          ${b.price ? `<span>💰 Target Price: ₹${b.price}/kg</span>` : ''}
          ${b.date ? `<span>📅 Deadline: ${b.date}</span>` : ''}
          <span>🏷️ Grade: Grade ${b.grade || 'A'}</span>
        </div>
        ${b.notes ? `<p style="margin-top:6px;font-size:.85rem;color:var(--muted)">Notes: ${b.notes}</p>` : ''}
      </div>
      <div class="bc-assign">
        <label style="font-size:.78rem;font-weight:700;display:block;margin-bottom:4px;color:var(--wheat)">Assign Vehicle to Buyer:</label>
        <div style="display:flex;gap:8px">
          <select id="assign-veh-${b.id}" style="padding:6px;border-radius:8px;background:rgba(9,36,20,.6);color:#fff;border:1px solid var(--line);font-size:.83rem">
            ${vehicles.length ? vehicles.map(v => `<option value="${v.id}">${v.name} (${v.number}) - ${v.capacity}</option>`).join('') : '<option value="">No Available Vehicles</option>'}
          </select>
          <button class="btn-primary" style="padding:6px 12px;font-size:.82rem" ${!vehicles.length ? 'disabled' : ''} onclick="assignVehicleToBuyer('${b.id}')">Assign &amp; Notify</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.assignVehicleToBuyer = reqId => {
  const buyers = JSON.parse(localStorage.getItem('uyirva_req') || '[]');
  const req = buyers.find(r => r.id === reqId);
  if (!req) return;

  const selectEl = document.getElementById(`assign-veh-${reqId}`);
  const vehId = selectEl?.value;
  if (!vehId) { alert('Please select an available vehicle first.'); return; }

  const vehicles = getVehicles();
  const veh = vehicles.find(v => v.id === vehId);
  if (!veh) return;

  // 1. Create Notification for Logistics Owner
  const notifs = getNotifications();
  const newNotif = {
    id: `NOTIF-${Date.now()}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('en-IN'),
    title: `🚚 Vehicle Assigned for Buyer Order!`,
    message: `Buyer selected vehicle ${veh.name} (${veh.number}) for ${req.crop} (${req.qty}) shipment to ${req.location}.`,
    read: false,
    crop: req.crop,
    qty: req.qty,
    location: req.location,
    vehicle: veh.name,
    vehNumber: veh.number
  };
  notifs.unshift(newNotif);
  saveNotifications(notifs);

  // 2. Create Active Trip with Navigation
  const trips = getTrips();
  const newTrip = {
    id: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
    crop: req.crop,
    qty: req.qty,
    pickup: 'Farmgate Warehouse (Pollachi)',
    destination: req.location,
    vehicle: `${veh.name} (${veh.number})`,
    driver: veh.driver,
    driverPhone: veh.driverPhone,
    status: 'In Transit',
    startedAt: new Date().toLocaleString('en-IN'),
    gpsOrigin: '10.9980,76.9660', // Coimbatore / Pollachi approx
    gpsDestination: req.location
  };
  trips.unshift(newTrip);
  saveTrips(trips);

  // Mark vehicle as In Transit
  veh.status = 'In Transit';
  saveVehicles(vehicles);

  updateStats();
  renderVehicles();
  renderNotifications();
  renderTrips();

  alert(`🔔 Notification Triggered!\nVehicle ${veh.name} assigned for ${req.crop} delivery to ${req.location}.\nActive navigation route generated in Navigation Tab.`);
};

// ─── RENDER: Notifications View ───
function renderNotifications() {
  const container = document.getElementById('notif-list');
  if (!container) return;

  const notifs = getNotifications();
  if (!notifs.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">🔔</div>
        <p>No notifications received yet.<br>When buyers or farmers select your vehicle, real-time alerts will appear here.</p>
      </div>`;
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div class="notif-card glass ${n.read ? 'read' : 'unread'}">
      <div class="nc-top">
        <strong>${n.title}</strong>
        <small>${n.date} at ${n.time}</small>
      </div>
      <p>${n.message}</p>
      <div class="nc-meta">
        <span>📦 Produce: ${n.crop} (${n.qty})</span>
        <span>📍 Destination: ${n.location}</span>
        <span>🚚 Vehicle: ${n.vehicle} (${n.vehNumber})</span>
      </div>
      ${!n.read ? `<button class="btn-sm" style="margin-top:8px" onclick="markNotifRead('${n.id}')">Mark as Read</button>` : ''}
    </div>
  `).join('');
}

window.markNotifRead = id => {
  const notifs = getNotifications();
  const n = notifs.find(x => x.id === id);
  if (n) {
    n.read = true;
    saveNotifications(notifs);
    renderNotifications();
    updateStats();
  }
};

// ─── RENDER: Active Trips & Navigation Map View ───
function renderTrips() {
  const container = document.getElementById('trips-list');
  if (!container) return;

  const trips = getTrips();
  if (!trips.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">🗺️</div>
        <p>No active delivery routes in progress.<br>Assign a vehicle to a buyer order to launch live GPS turn-by-turn navigation.</p>
      </div>`;
    return;
  }

  container.innerHTML = trips.map(t => {
    // Generate Google Maps navigation link
    const origin = encodeURIComponent(t.pickup);
    const dest = encodeURIComponent(t.destination);
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;

    return `
      <div class="trip-card glass">
        <div class="tc-head">
          <div>
            <h3>🚛 Route #${t.id} — ${t.crop} (${t.qty})</h3>
            <p><strong>Assigned Vehicle:</strong> ${t.vehicle} &middot; <strong>Driver:</strong> ${t.driver}</p>
          </div>
          <span class="badge ${t.status === 'Delivered' ? 'delivered' : 'transit'}">${t.status}</span>
        </div>

        <div class="route-box glass" style="margin:12px 0;padding:12px;background:rgba(8,31,18,.4)">
          <div style="display:flex;align-items:center;gap:8px;font-size:.88rem">
            <span>🟢 <b>Pickup:</b> ${t.pickup}</span>
            <span>➔</span>
            <span>🏁 <b>Destination:</b> ${t.destination}</span>
          </div>
          <small style="color:var(--muted);display:block;margin-top:4px">Dispatched at: ${t.startedAt}</small>
        </div>

        <!-- Simulated Interactive Map Preview -->
        <div class="map-view-box glass" style="height:180px;position:relative;border-radius:12px;overflow:hidden;background:linear-gradient(135deg, #1b3824, #0b2213);display:flex;flex-direction:column;justify-content:center;align-items:center;border:1px solid rgba(255,255,255,.2);margin-bottom:12px">
          <div style="font-size:2rem;margin-bottom:4px">📍 🚚 🗺️ 🏁</div>
          <strong style="color:var(--wheat)">Live GPS Tracking Mode Active</strong>
          <span style="font-size:.78rem;color:var(--muted)">Route: ${t.pickup} to ${t.destination}</span>
          <div style="margin-top:10px">
            <a class="btn-primary" href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="padding:8px 16px;font-size:.85rem;text-decoration:none;display:inline-flex;align-items:center;gap:6px">
              🧭 Open Google Maps Navigation &rarr;
            </a>
          </div>
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end">
          <a class="btn-secondary" href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="font-size:.82rem;padding:7px 14px;text-decoration:none">
            📍 Google Maps Route
          </a>
          ${t.status !== 'Delivered' ? `<button class="btn-sm" style="background:var(--leaf);color:#fff;border-color:var(--leaf)" onclick="completeTrip('${t.id}')">✅ Mark Order Delivered</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

window.completeTrip = id => {
  const trips = getTrips();
  const t = trips.find(x => x.id === id);
  if (t) {
    t.status = 'Delivered';
    saveTrips(trips);

    // Free up vehicle
    const vehicles = getVehicles();
    const veh = vehicles.find(v => t.vehicle.includes(v.number));
    if (veh) {
      veh.status = 'Available';
      saveVehicles(vehicles);
    }

    renderTrips();
    renderVehicles();
    updateStats();
    alert(`🎉 Delivery for Route #${t.id} marked as DELIVERED! Payment settlement initiated via Escrow.`);
  }
};

// ─── Initial Render Invocation ───
updateStats();
renderVehicles();
renderBuyerListings();
renderNotifications();
renderTrips();
