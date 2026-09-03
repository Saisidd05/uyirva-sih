const user = JSON.parse(localStorage.getItem('uyirva_user') || 'null');
const token = localStorage.getItem('uyirva_access_token');
const app = document.querySelector('#dashboard-app');
const apiBase = window.UYIRVA_API_URL || window.location.origin;

if (!user || !token) {
  location.assign('index.html');
} else {
  const role = String(user.role).toLowerCase();
  const api = async (path, options = {}) => {
    const response = await fetch(`${apiBase}${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers } });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('uyirva_access_token');
        localStorage.removeItem('uyirva_user');
        location.assign('index.html');
        return new Promise(() => {});
      }
      throw new Error(data.detail || 'Request failed');
    }
    return data;
  };
  const logout = () => { localStorage.clear(); location.assign('index.html'); };
  const shell = (title, content) => {
    app.innerHTML = `<div class="dashboard-top"><div><div class="eyebrow">UYIRVA · ${role.toUpperCase()}</div><h1>${title}</h1><p>Welcome to your marketplace workspace.</p></div><button class="button logout-button" id="logout">Sign out</button></div>${content}`;
    document.querySelector('#logout').onclick = logout;
  };

  async function farmer() {
    const [data, listingData, matchData] = await Promise.all([api('/api/farmer/dashboard'), api('/api/farmer/listings'), api('/api/farmer/matches')]);
    const listingHtml = listingData.listings.length ? listingData.listings.map(item => `<div class="listing-item">${item.photo_url ? `<img src="${item.photo_url}" alt="${item.crop}">` : ''}<div><b>${item.crop}</b><p>${item.quantity} kg · ₹${item.price}/kg</p><small>${item.freshness} · ${item.agmark} · ${item.quality_grade}</small></div></div>`).join('') : '<p>No vegetables listed yet. Click “List vegetables” to publish your first listing.</p>';
    const matchHtml = matchData.matches.map(match => `<div class="buyer-requirement"><b>${match.buyer_name}</b><span>${match.match_score}% match · ${match.distance_km} km away</span><p>${match.requirement}</p><small>Needs: ${match.requested_kg} kg · ₹${match.offered_price}/kg · ${match.freshness_required} · ${match.quality_required} · AGMARK: ${match.agmark_required}</small></div>`).join('');
    shell('Farmer Home', `<div class="feature-grid"><div class="feature-card"><h3>My vegetable listings</h3><strong>${data.stats.active_listings}</strong><p>Active listings · Pending orders: ${data.stats.pending_orders}</p><button class="button primary" id="create">List vegetables</button></div><div class="feature-card"><h3>Action needed</h3><p>${data.actions.unread_matches} buyer matches · ${data.actions.disputes_awaiting_response} disputes</p></div><div class="feature-card"><h3>Demand planning</h3><p>${data.demand_insight.recommendation}</p></div><div class="feature-card"><h3>This month earnings</h3><strong>₹${data.stats.month_earnings}</strong></div></div><div class="feature-card"><h3>My listed vegetables</h3><div class="listing-list">${listingHtml}</div></div><div class="feature-card"><h3>Buyer requirements</h3><p class="buyer-note">Buyers looking for vegetables near you. Publish your listing to receive offers.</p><div class="buyer-requirements">${matchHtml}</div></div>`);
    document.querySelector('#create').onclick = () => document.querySelector('#listing-modal').classList.add('open');
  }

  async function buyer() {
    const data = await api('/api/buyer/dashboard'); const listings = await api('/api/buyer/listings');
    shell('Buyer Home', `<div class="feature-grid"><div class="feature-card"><h3>Active orders</h3><strong>${data.stats.active_orders}</strong><p>Awaiting confirmation: ${data.stats.awaiting_confirmation}</p></div><div class="feature-card"><h3>Spend this month</h3><strong>₹${data.stats.month_spend}</strong><p>Average paid: ₹${data.stats.average_price_paid}</p></div></div><div class="feature-card"><h3>Farmgate listings</h3>${listings.listings.length ? listings.listings.map(item => `<p><b>${item.crop}</b> — ${item.quantity} kg · ₹${item.price}/kg <button class="button primary" data-order="${item.id}">Order</button></p>`).join('') : 'No listings available yet.'}</div>`);
    document.querySelectorAll('[data-order]').forEach(button => button.onclick = async () => { await api('/api/orders', { method: 'POST', body: JSON.stringify({ listing_id: button.dataset.order, quantity: 100, order_type: 'bulk' }) }); buyer(); });
  }

  async function logistics() { const [orders, route] = await Promise.all([api('/api/logistics/orders'), api('/api/logistics/route')]); shell('Logistics Partner', `<div class="feature-card"><h3>Assigned pooled orders</h3><strong>${orders.orders.length}</strong><p>${route.distance_km} km · ${route.estimated_duration_minutes} minutes</p></div>`); }
  async function admin() { const data = await api('/api/admin/dashboard'); shell('Admin Control Centre', `<div class="feature-card"><h3>Adoption rate</h3><strong>${data.analytics.adoption_rate}%</strong></div>`); }

  ({ farmer, buyer, logistics, admin }[role] || (() => shell('Dashboard', 'Unsupported role.')))().catch(error => shell('Dashboard error', `<p>${error.message}</p>`));

  const modal = document.querySelector('#listing-modal');
  const form = document.querySelector('#listing-form');
  const photoInput = form?.elements.photo;
  const preview = document.querySelector('#listing-image-preview');
  let photoData = '';
  document.querySelector('.auth-close')?.addEventListener('click', () => modal.classList.remove('open'));
  photoInput?.addEventListener('change', () => {
    const file = photoInput.files[0]; if (!file) return;
    preview.src = URL.createObjectURL(file); preview.hidden = false;
    const reader = new FileReader(); reader.onload = () => { photoData = reader.result; }; reader.readAsDataURL(file);
  });
  form?.addEventListener('submit', async event => {
    event.preventDefault(); const error = document.querySelector('#listing-error'); error.textContent = '';
    const values = Object.fromEntries(new FormData(form));
    try { await api('/api/farmer/listings', { method: 'POST', body: JSON.stringify({ ...values, photo_url: photoData }) }); modal.classList.remove('open'); form.reset(); preview.hidden = true; photoData = ''; farmer(); }
    catch (err) { error.textContent = err.message; }
  });
}
