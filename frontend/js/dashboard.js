const savedUser = JSON.parse(localStorage.getItem('uyirva_user') || 'null');
const app = document.querySelector('#dashboard-app');
const token = localStorage.getItem('uyirva_access_token');
const apiBase = window.UYIRVA_API_URL || 'http://127.0.0.1:8080';

if (!savedUser || !token) {
  location.assign('index.html');
} else {
  const role = savedUser.role.toUpperCase();
  
  async function fetchDashboard() {
    try {
      const response = await fetch(`${apiBase}/api/${role.toLowerCase()}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to load dashboard data");
      return await response.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function renderDashboard() {
    const data = await fetchDashboard();
    
    if (role === 'FARMER') {
      let listingsHtml = '';
      if (data && data.listings && data.listings.length > 0) {
        data.listings.forEach(l => {
          listingsHtml += `
            <li>
              <strong>${l.crop_name} - ${l.quantity_kg}kg</strong>
              <ul>
                <li><strong>AI Price Recommendation:</strong> ${l.ai_price_recommendation} (Expected: ₹${l.expected_price}/kg)</li>
                <li><strong>AI Quality Score:</strong> ${l.ai_quality_score}</li>
              </ul>
            </li>
          `;
        });
      } else {
        listingsHtml = "<p>No active listings. Create one to begin!</p>";
      }

      app.innerHTML = `
        <div class="dashboard-top">
          <div>
            <div class="eyebrow">UYIRVA · FARMER</div>
            <h1>Farmer Dashboard</h1>
            <p>Welcome, ${savedUser.full_name}. Manage your produce and respond to buyer demand.</p>
          </div>
          <button class="button logout-button" id="logout" type="button">Sign out</button>
        </div>
        
        <div class="action-row">
          <button class="button primary" id="btn-create-listing">🎤 New Voice/Visual Listing</button>
        </div>

        <div class="feature-grid">
          <div class="feature-card">
            <h3>Your Active Listings & AI Insights</h3>
            <ul>${listingsHtml}</ul>
          </div>
          
          <div class="feature-card">
            <h3>Live Demand Indicator</h3>
            <p><strong>Trending ${data?.demand_indicator?.status || 'High'}:</strong> ${data?.demand_indicator?.crop || 'Tomato'} (${data?.demand_indicator?.message || 'Demand is active.'})</p>
          </div>
          
          <div class="feature-card">
            <h3>Payout & Escrow Dashboard</h3>
            <p>Expected Settlement: <strong>₹${data?.payout_expected || 0}</strong></p>
            <p><span class="status-badge status-escrow">Funds in Escrow (Awaiting Delivery)</span></p>
          </div>
        </div>
      `;

      // Listing modal logic
      const createBtn = document.getElementById('btn-create-listing');
      const listingModal = document.getElementById('listing-modal');
      
      if (createBtn && listingModal) {
        createBtn.addEventListener('click', () => {
          listingModal.classList.add('open');
          listingModal.setAttribute('aria-hidden', 'false');
        });
        
        listingModal.querySelector('.auth-close').addEventListener('click', () => {
          listingModal.classList.remove('open');
        });
        
        document.getElementById('listing-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const crop = e.target.querySelector('input[type="text"]').value || "Tomato";
          const qty = parseInt(e.target.querySelector('input[type="number"]').value || "500");
          
          try {
            const res = await fetch(`${apiBase}/api/farmer/listings`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ crop_name: crop, quantity_kg: qty, expected_price: 25 })
            });
            if (res.ok) {
              alert('Listing saved to DB successfully!');
              listingModal.classList.remove('open');
              renderDashboard(); // Reload data
            } else {
              alert('Error creating listing.');
            }
          } catch(err) {
            console.error(err);
          }
        });
      }

    } else if (role === 'BUYER') {
      
      app.innerHTML = `
        <div class="dashboard-top">
          <div>
            <div class="eyebrow">UYIRVA · BUYER</div>
            <h1>Buyer Dashboard</h1>
            <p>Welcome, ${savedUser.full_name}. Discover supply and manage your procurement.</p>
          </div>
          <button class="button logout-button" id="logout" type="button">Sign out</button>
        </div>
        
        <div class="action-row">
          <button class="button primary" onclick="alert('Searching supply...')">🔍 Search Supply & Match</button>
        </div>

        <div class="feature-grid">
          <div class="feature-card">
            <h3>Supplier Matches</h3>
            <p>Found ${data?.matches[0]?.farmer_count || 0} compatible farmers for ${data?.matches[0]?.crop_name || 'produce'} (Available: ${data?.matches[0]?.total_available_kg || 0}kg).</p>
            <button class="button secondary">View Matches</button>
          </div>
          
          <div class="feature-card">
            <h3>Smart Order Pooling</h3>
            <p>Your order is pooled with ${data?.pooled_orders?.nearby_buyers || 0} nearby buyers.</p>
            <ul>
              <li><strong>Route Optimized:</strong> Saved ${data?.pooled_orders?.route_savings_km || 0}km</li>
              <li><strong>Logistics Cost:</strong> ${data?.pooled_orders?.cost_reduction || 'Reduced'}</li>
            </ul>
          </div>
          
          <div class="feature-card">
            <h3>Payment & Escrow</h3>
            <p>Active Order ID: ${data?.escrow?.order_id || '#000'}</p>
            <p><span class="status-badge status-escrow">${data?.escrow?.status || 'Pending'}</span></p>
            <button class="button primary" style="margin-top:8px">${data?.escrow?.action_required || 'Action'}</button>
          </div>
        </div>
      `;

    } else {
      app.innerHTML = `<p>FPO role functionality coming soon.</p>`;
    }

    // Bind logout button after render
    const logoutBtn = document.querySelector('#logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('uyirva_access_token');
        localStorage.removeItem('uyirva_refresh_token');
        localStorage.removeItem('uyirva_user');
        location.assign('index.html');
      });
    }
  }

  // Initialize
  renderDashboard();
}
