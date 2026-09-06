/**
 * account.js — UYIRVA User Account / Profile CRUD Manager
 * Provides full Create/Read/Update/Delete (CRUD) functionality for logged in accounts.
 * Triggered by clicking the user name/avatar pill in the top navigation bar.
 */

export function initAccountModal() {
  let modal = document.querySelector('#account-modal');
  if (!modal) {
    const div = document.createElement('div');
    div.id = 'account-modal-wrapper';
    div.innerHTML = `
      <div class="auth-modal" id="account-modal" role="dialog" aria-modal="true" aria-hidden="true">
        <div class="auth-card glass account-card">
          <button class="auth-close" id="account-modal-close" type="button" aria-label="Close">×</button>
          
          <!-- Header / Overview -->
          <div class="account-header">
            <div class="account-avatar" id="acc-avatar">U</div>
            <div class="account-title-area">
              <h2 id="acc-display-name">User Name</h2>
              <div class="account-badges">
                <span class="role-badge" id="acc-display-role">FARMER</span>
                <span class="status-badge" id="acc-display-status">✓ Verified Account</span>
              </div>
            </div>
          </div>

          <!-- Account Action Tabs -->
          <div class="account-tabs-bar">
            <button type="button" class="acc-tab active" data-acc-tab="view">👤 Profile Overview</button>
            <button type="button" class="acc-tab" data-acc-tab="edit">✏️ Edit Details</button>
            <button type="button" class="acc-tab danger" data-acc-tab="danger">⚠️ Security & Reset</button>
          </div>

          <!-- READ TAB (Profile Details View) -->
          <div class="acc-tab-content active" id="acc-tab-view">
            <div class="acc-info-grid">
              <div class="acc-info-item">
                <small>Full Name</small>
                <strong id="info-name">—</strong>
              </div>
              <div class="acc-info-item">
                <small>Phone Number</small>
                <strong id="info-phone">—</strong>
              </div>
              <div class="acc-info-item">
                <small>Email Address</small>
                <strong id="info-email">—</strong>
              </div>
              <div class="acc-info-item">
                <small>Primary District</small>
                <strong id="info-location">—</strong>
              </div>
              <div class="acc-info-item full-width">
                <small>Detailed Address / Delivery Spot</small>
                <strong id="info-address">—</strong>
              </div>
              <div class="acc-info-item">
                <small>Member Unique ID</small>
                <strong id="info-id" style="color:var(--wheat)">—</strong>
              </div>
              <div class="acc-info-item">
                <small>Role Specialization</small>
                <strong id="info-extra">—</strong>
              </div>
            </div>
            <button class="button primary" id="btn-goto-edit" type="button" style="width:100%;margin-top:16px">Edit Account Profile</button>
          </div>

          <!-- UPDATE / EDIT TAB (CRUD Form) -->
          <form class="auth-form acc-tab-content" id="acc-edit-form" style="display:none">
            <div class="form-section">
              <h3>1. Personal & Contact Info</h3>
              <div class="field-grid">
                <label>Full Name *
                  <input name="full_name" id="acc-input-name" placeholder="Your full name" required>
                </label>
                <label>Phone Number *
                  <input name="phone" id="acc-input-phone" type="tel" placeholder="+91..." required>
                </label>
                <label class="full-width">Email Address
                  <input name="email" id="acc-input-email" type="email" placeholder="name@example.com">
                </label>
              </div>
            </div>

            <div class="form-section">
              <h3>2. Location & Address</h3>
              <div class="field-grid">
                <label>District / Region *
                  <select name="location" id="acc-input-location" required>
                    <option value="">Select District</option>
                    <option value="Coimbatore">Coimbatore</option>
                    <option value="Tiruppur">Tiruppur</option>
                    <option value="Erode">Erode</option>
                    <option value="Pollachi">Pollachi</option>
                    <option value="Salem">Salem</option>
                    <option value="Namakkal">Namakkal</option>
                    <option value="Mettupalayam">Mettupalayam</option>
                  </select>
                </label>
                <label class="full-width">Full Address / Spot
                  <input name="address" id="acc-input-address" placeholder="Door No, Street Name, Landmark...">
                </label>
              </div>
            </div>

            <div class="form-section">
              <h3>3. Account Role & Notes</h3>
              <div class="field-grid">
                <label>Primary Account Role
                  <select name="role" id="acc-input-role">
                    <option value="FARMER">Farmer</option>
                    <option value="BUYER">Buyer</option>
                    <option value="FPO">FPO Organization</option>
                    <option value="LOGISTICS">Logistics Partner</option>
                  </select>
                </label>
                <label>Specialization / Notes
                  <input name="extra_info" id="acc-input-extra" placeholder="e.g. Organic veggies, Wholesale procurement">
                </label>
              </div>
            </div>

            <p class="auth-error" id="acc-edit-msg"></p>
            <div style="display:flex;gap:10px">
              <button class="button secondary" id="btn-cancel-edit" type="button" style="flex:1">Cancel</button>
              <button class="button primary" type="submit" style="flex:2">Save Account Changes</button>
            </div>
          </form>

          <!-- DELETE TAB (Account Reset / Deletion) -->
          <div class="acc-tab-content" id="acc-tab-danger" style="display:none">
            <div class="danger-box glass">
              <h3 style="color:#ff8888;margin:0 0 8px">⚠️ Delete Account & Reset Session</h3>
              <p style="font-size:.85rem;color:var(--muted);margin-bottom:14px">This will remove your account session from this browser and reset all active requirement posts & local orders.</p>
              <button class="button danger-btn" id="btn-delete-account" type="button">Delete Profile & Sign Out</button>
            </div>
          </div>

        </div>
      </div>
    `;
    document.body.appendChild(div);
    modal = document.querySelector('#account-modal');
  }

  // Bind click handlers to navbar user components
  const bindUserPillTriggers = () => {
    const pills = document.querySelectorAll('.db-user-pill, #nav-user-name, #nav-avatar, .db-user-avatar-nav, .db-user-info');
    pills.forEach(el => {
      el.style.cursor = 'pointer';
      el.title = 'Click to open Account Settings';
      el.onclick = (e) => {
        e.preventDefault();
        openAccountModal();
      };
    });
  };
  bindUserPillTriggers();

  // Modal close handlers
  const closeBtn = document.querySelector('#account-modal-close');
  if (closeBtn) closeBtn.onclick = () => modal.classList.remove('open');
  modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };

  // Tab navigation
  const tabs = modal.querySelectorAll('.acc-tab');
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.accTab;
      document.querySelector('#acc-tab-view').style.display = target === 'view' ? 'block' : 'none';
      document.querySelector('#acc-edit-form').style.display = target === 'edit' ? 'grid' : 'none';
      document.querySelector('#acc-tab-danger').style.display = target === 'danger' ? 'block' : 'none';
    };
  });

  const gotoEdit = document.querySelector('#btn-goto-edit');
  if (gotoEdit) gotoEdit.onclick = () => modal.querySelector('[data-acc-tab="edit"]').click();

  const cancelEdit = document.querySelector('#btn-cancel-edit');
  if (cancelEdit) cancelEdit.onclick = () => modal.querySelector('[data-acc-tab="view"]').click();

  // UPDATE: Save Account Details
  const form = document.querySelector('#acc-edit-form');
  form.onsubmit = (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem('uyirva_user') || '{}');
    const updated = {
      ...currentUser,
      full_name: document.querySelector('#acc-input-name').value.trim(),
      phone: document.querySelector('#acc-input-phone').value.trim(),
      email: document.querySelector('#acc-input-email').value.trim(),
      location: document.querySelector('#acc-input-location').value,
      address: document.querySelector('#acc-input-address').value.trim(),
      role: document.querySelector('#acc-input-role').value,
      extra_info: document.querySelector('#acc-input-extra').value.trim()
    };
    localStorage.setItem('uyirva_user', JSON.stringify(updated));

    // Live update UI
    updateNavAndProfileUI(updated);
    const msg = document.querySelector('#acc-edit-msg');
    msg.style.color = '#76ff03';
    msg.textContent = '✓ Profile updated successfully!';
    setTimeout(() => {
      msg.textContent = '';
      modal.querySelector('[data-acc-tab="view"]').click();
    }, 1000);
  };

  // DELETE: Delete Account & Clear Session
  const deleteBtn = document.querySelector('#btn-delete-account');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      if (confirm('Are you sure you want to delete your profile account and sign out?')) {
        localStorage.clear();
        location.assign('/');
      }
    };
  }

  function openAccountModal() {
    const u = JSON.parse(localStorage.getItem('uyirva_user') || '{}');
    updateNavAndProfileUI(u);

    // Populate edit fields
    document.querySelector('#acc-input-name').value = u.full_name || '';
    document.querySelector('#acc-input-phone').value = u.phone || '';
    document.querySelector('#acc-input-email').value = u.email || '';
    document.querySelector('#acc-input-location').value = u.location || 'Coimbatore';
    document.querySelector('#acc-input-address').value = u.address || '';
    document.querySelector('#acc-input-role').value = (u.role || 'FARMER').toUpperCase();
    document.querySelector('#acc-input-extra').value = u.extra_info || '';

    // Switch to view tab
    modal.querySelector('[data-acc-tab="view"]').click();
    modal.classList.add('open');
  }

  function updateNavAndProfileUI(u) {
    const name = u.full_name || u.phone || 'User';
    const initial = name.charAt(0).toUpperCase();
    const role = (u.role || 'FARMER').toUpperCase();

    // Modal view updates
    document.querySelector('#acc-avatar').textContent = initial;
    document.querySelector('#acc-display-name').textContent = name;
    document.querySelector('#acc-display-role').textContent = role;
    
    document.querySelector('#info-name').textContent = name;
    document.querySelector('#info-phone').textContent = u.phone || 'Not provided';
    document.querySelector('#info-email').textContent = u.email || 'Not provided';
    document.querySelector('#info-location').textContent = u.location || 'Coimbatore';
    document.querySelector('#info-address').textContent = u.address || 'Not provided';
    document.querySelector('#info-id').textContent = u.id || `UYIR-${Math.floor(10000 + Math.random() * 90000)}`;
    document.querySelector('#info-extra').textContent = u.extra_info || 'General';

    // Navbar live updates
    const navName = document.querySelector('#nav-user-name');
    if (navName) navName.textContent = name;

    const navRole = document.querySelector('#nav-role-badge');
    if (navRole) navRole.textContent = role;

    const navAvatar = document.querySelector('#nav-avatar');
    if (navAvatar) navAvatar.textContent = initial;

    const dbUserName = document.querySelector('#db-user-name');
    if (dbUserName) dbUserName.textContent = name;

    const dbAvatar = document.querySelector('#db-avatar');
    if (dbAvatar) dbAvatar.textContent = initial;
  }
}
