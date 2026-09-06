import { initAiPriceModal } from './ai-price.js';

/**
 * auth.js — OTP-based role login & registration for UYIRVA
 */
initAiPriceModal();

// ─── Modal open/close ───
const modal = document.querySelector('#auth-modal');
const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
}

function showAuth(mode = 'login') {
  setAuthMode(mode === 'signup');
  modal?.classList.add('open');
  modal?.setAttribute('aria-hidden', 'false');
  document.getElementById('phone-inp')?.focus();
}
function closeAuth() {
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-auth-open]').forEach(el => {
  el.addEventListener('click', (e) => {
    const mode = el.getAttribute('data-auth-open');
    showAuth(mode);
  });
});
document.querySelector('.auth-close')?.addEventListener('click', closeAuth);
modal?.addEventListener('click', e => { if (e.target === modal) closeAuth(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuth(); });

// ─── Scroll-based reveal ───
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries =>
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); } }),
    { threshold: .25 }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
}

// ─── OTP & AUTH MODE STATE ───
let _selectedRole = 'FARMER';
let _phone = '';
let _generatedOTP = '';
let _timerInterval = null;
let _isSignupMode = false; // false = Login mode, true = Signup mode

function setAuthMode(isSignup) {
  _isSignupMode = isSignup;
  const title = document.getElementById('auth-title');
  const copy = document.getElementById('auth-copy');
  const switchText = document.getElementById('auth-switch-text');
  const toggleBtn = document.getElementById('toggle-auth-mode');
  const step1Err = document.getElementById('step1-err');
  if (step1Err) step1Err.textContent = '';

  if (_isSignupMode) {
    if (title) title.textContent = 'Create UYIRVA Account';
    if (copy) copy.textContent = 'Enter your mobile number and role to register as a new user.';
    if (switchText) switchText.textContent = 'Already have an account?';
    if (toggleBtn) toggleBtn.textContent = 'Sign in';
  } else {
    if (title) title.textContent = 'Sign In to UYIRVA';
    if (copy) copy.textContent = 'Enter your registered mobile number and role to continue.';
    if (switchText) switchText.textContent = "Don't have an account?";
    if (toggleBtn) toggleBtn.textContent = 'Sign up';
  }
}

document.getElementById('toggle-auth-mode')?.addEventListener('click', () => {
  setAuthMode(!_isSignupMode);
});

// Role selector & detail field updater
const updateRoleDetailField = (role) => {
  const label = document.getElementById('role-detail-label');
  const input = document.getElementById('role-detail-inp');
  if (!label || !input) return;

  if (role === 'FARMER') {
    label.textContent = 'Farm Size (Acres) *';
    input.type = 'number';
    input.placeholder = 'e.g. 5.0';
    input.min = '0.5';
    input.max = '1000';
    input.step = '0.5';
  } else if (role === 'BUYER') {
    label.textContent = 'Business Type *';
    input.type = 'text';
    input.placeholder = 'e.g. Supermarket, Wholesaler, Hotel';
    input.removeAttribute('min');
    input.removeAttribute('max');
  } else if (role === 'FPO') {
    label.textContent = 'FPO Organization Name *';
    input.type = 'text';
    input.placeholder = 'e.g. Pollachi Farmers Producer Org';
    input.removeAttribute('min');
    input.removeAttribute('max');
  } else {
    label.textContent = 'Logistics Fleet Type *';
    input.type = 'text';
    input.placeholder = 'e.g. Mini Truck (2 Ton)';
    input.removeAttribute('min');
    input.removeAttribute('max');
  }
};

document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    _selectedRole = btn.dataset.role;
    updateRoleDetailField(_selectedRole);
  });
});

// ─── INPUT RESTRICTIONS & FORMAT MASKS ───
const phoneInp = document.getElementById('phone-inp');
if (phoneInp) {
  phoneInp.addEventListener('input', e => {
    // Digits only, max 10 chars
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
  });
}

const nameInp = document.getElementById('name-inp');
if (nameInp) {
  nameInp.addEventListener('input', e => {
    // Letters and spaces only, max 50 chars
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
  });
}

// ─── STEP 1: Send OTP ───
document.getElementById('send-otp-btn')?.addEventListener('click', () => {
  const phoneVal = document.getElementById('phone-inp').value.trim();
  const err = document.getElementById('step1-err');
  err.textContent = '';

  if (!phoneVal) {
    err.textContent = 'Mobile number is required.';
    return;
  }
  if (!/^[6-9]\d{9}$/.test(phoneVal)) {
    err.textContent = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    return;
  }

  _phone = phoneVal;
  _generatedOTP = String(Math.floor(100000 + Math.random() * 900000));

  document.getElementById('otp-step1').hidden = true;
  document.getElementById('otp-step2').hidden = false;
  document.getElementById('otp-phone-display').textContent = '+91 ' + _phone.replace(/(\d{5})(\d{5})/, '$1 $2');
  document.getElementById('otp-demo-val').textContent = _generatedOTP;
  document.getElementById('step2-err').textContent = '';
  document.querySelectorAll('.otp-box').forEach(b => b.value = '');
  document.querySelectorAll('.otp-box')[0].focus();
  startTimer(60);
});

// OTP box auto-navigation
document.querySelectorAll('.otp-box').forEach((box, i, arr) => {
  box.addEventListener('input', e => {
    const v = e.target.value.replace(/\D/g, '');
    e.target.value = v.slice(-1);
    if (v && i < arr.length - 1) arr[i + 1].focus();
  });
  box.addEventListener('keydown', e => {
    if (e.key === 'Backspace' && !e.target.value && i > 0) arr[i - 1].focus();
  });
  box.addEventListener('paste', e => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
    arr.forEach((b, j) => { b.value = pasted[j] || ''; });
    if (pasted.length) arr[Math.min(pasted.length, 5)].focus();
  });
});

// Countdown timer
function startTimer(seconds) {
  clearInterval(_timerInterval);
  const timerEl = document.getElementById('otp-timer');
  let remaining = seconds;
  const tick = () => {
    if (remaining <= 0) {
      clearInterval(_timerInterval);
      timerEl.innerHTML = 'OTP expired. <button class="otp-resend" id="resend-btn" type="button">Resend OTP</button>';
      document.getElementById('resend-btn')?.addEventListener('click', resendOtp);
      return;
    }
    timerEl.textContent = `Resend OTP in ${remaining}s`;
    remaining--;
  };
  tick();
  _timerInterval = setInterval(tick, 1000);
}

function resendOtp() {
  _generatedOTP = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('otp-demo-val').textContent = _generatedOTP;
  document.querySelectorAll('.otp-box').forEach(b => b.value = '');
  document.querySelectorAll('.otp-box')[0].focus();
  document.getElementById('step2-err').textContent = '';
  startTimer(60);
}

// ─── STEP 2: Verify OTP ───
document.getElementById('verify-otp-btn')?.addEventListener('click', () => {
  const entered = Array.from(document.querySelectorAll('.otp-box')).map(b => b.value).join('');
  const err = document.getElementById('step2-err');
  err.textContent = '';

  if (entered.length < 6) { err.textContent = 'Please enter all 6 digits of the OTP.'; return; }
  if (entered !== _generatedOTP) { err.textContent = 'Incorrect OTP. Please try again.'; return; }

  clearInterval(_timerInterval);

  // Look up user in persistent registry
  const usersRegistry = JSON.parse(localStorage.getItem('uyirva_users_registry') || '{}');
  const existingUser = usersRegistry[_phone];

  // LOGIN MODE or EXISTING USER -> NEVER ASK FOR NAME OR QUESTIONS! Direct redirect to dashboard!
  if (!_isSignupMode || (existingUser && existingUser.full_name)) {
    const userToLog = existingUser || {
      id: `UYIR-${Math.floor(10000 + Math.random() * 90000)}`,
      full_name: `${_selectedRole.charAt(0) + _selectedRole.slice(1).toLowerCase()} User`,
      phone: _phone,
      role: _selectedRole,
      location: 'Coimbatore'
    };
    userToLog.role = _selectedRole;
    // Save/update registry
    usersRegistry[_phone] = userToLog;
    localStorage.setItem('uyirva_users_registry', JSON.stringify(usersRegistry));
    redirectToDashboard(userToLog);
  } else {
    // SIGNUP MODE for NEW USER -> Show Registration Questions
    document.getElementById('otp-step2').hidden = true;
    document.getElementById('otp-step3').hidden = false;
    updateRoleDetailField(_selectedRole);
    setTimeout(() => document.getElementById('name-inp').focus(), 50);
  }
});

// ─── STEP 3: Complete Signup (New Users Only) ───
document.getElementById('complete-btn')?.addEventListener('click', () => {
  const nameVal = document.getElementById('name-inp').value.trim();
  const locVal = document.getElementById('loc-inp').value;
  const detailVal = document.getElementById('role-detail-inp').value.trim();
  const err = document.getElementById('step3-err');
  err.textContent = '';

  // Required Field Check — Full Name
  if (!nameVal) {
    err.textContent = 'Full name is required.';
    return;
  }
  // Format & Length Check — Name
  if (!/^[a-zA-Z\s]{2,50}$/.test(nameVal)) {
    err.textContent = 'Full name should contain only letters and spaces (2 to 50 characters).';
    return;
  }

  // Required Field Check — Location
  if (!locVal) {
    err.textContent = 'Please select your primary district.';
    return;
  }

  // Role-Specific Validation & Range Check
  if (_selectedRole === 'FARMER') {
    const acres = parseFloat(detailVal);
    if (isNaN(acres) || acres < 0.5 || acres > 1000) {
      err.textContent = 'Farm size must be a valid number between 0.5 and 1000 acres.';
      return;
    }
  } else if (!detailVal) {
    err.textContent = 'Please answer the role detail question.';
    return;
  }

  // Create & Register New User Profile
  const newUser = {
    id: `UYIR-${Math.floor(10000 + Math.random() * 90000)}`,
    full_name: nameVal,
    phone: _phone,
    role: _selectedRole,
    location: locVal,
    extra_info: detailVal
  };

  // Save to persistent registry
  const usersRegistry = JSON.parse(localStorage.getItem('uyirva_users_registry') || '{}');
  usersRegistry[_phone] = newUser;
  localStorage.setItem('uyirva_users_registry', JSON.stringify(usersRegistry));

  redirectToDashboard(newUser);
});

document.getElementById('name-inp')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('complete-btn').click();
});

// Back to step 1
document.getElementById('back-step1')?.addEventListener('click', () => {
  clearInterval(_timerInterval);
  document.getElementById('otp-step2').hidden = true;
  document.getElementById('otp-step1').hidden = false;
  document.getElementById('step1-err').textContent = '';
});

// ─── Redirect ───
function redirectToDashboard(user) {
  localStorage.setItem('uyirva_user', JSON.stringify(user));
  const role = (user.role || 'FARMER').toLowerCase();
  const routes = {
    buyer: '/pages/buyer/dashboard.html',
    farmer: '/dashboard.html',
    fpo: '/dashboard.html',
    logistics: '/dashboard.html',
    admin: '/dashboard.html'
  };
  location.assign(routes[role] || '/dashboard.html');
}
