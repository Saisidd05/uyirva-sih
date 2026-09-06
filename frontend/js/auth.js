/**
 * auth.js — OTP-based role login for UYIRVA
 * 3-step flow: Phone + Role → OTP Verify → Name (new users)
 */

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

function showAuth() {
  modal?.classList.add('open');
  modal?.setAttribute('aria-hidden', 'false');
  document.getElementById('phone-inp')?.focus();
}
function closeAuth() {
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-auth-open]').forEach(el => el.addEventListener('click', showAuth));
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

// ─── OTP State ───
let _selectedRole = 'FARMER';
let _phone = '';
let _generatedOTP = '';
let _timerInterval = null;

// Role selector
document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    _selectedRole = btn.dataset.role;
  });
});

// ─── STEP 1: Send OTP ───
document.getElementById('send-otp-btn')?.addEventListener('click', () => {
  const phoneVal = document.getElementById('phone-inp').value.trim();
  const err = document.getElementById('step1-err');
  err.textContent = '';
  if (!/^[6-9]\d{9}$/.test(phoneVal)) {
    err.textContent = 'Please enter a valid 10-digit Indian mobile number.';
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
  const savedUser = JSON.parse(localStorage.getItem('uyirva_user') || 'null');
  const isReturning = savedUser && savedUser.phone === _phone;

  if (isReturning) {
    savedUser.role = _selectedRole;
    redirectToDashboard(savedUser);
  } else {
    document.getElementById('otp-step2').hidden = true;
    document.getElementById('otp-step3').hidden = false;
    setTimeout(() => document.getElementById('name-inp').focus(), 50);
  }
});

// ─── STEP 3: Complete signup ───
document.getElementById('complete-btn')?.addEventListener('click', () => {
  const nameVal = document.getElementById('name-inp').value.trim();
  const err = document.getElementById('step3-err');
  err.textContent = '';
  if (!nameVal || nameVal.length < 2) { err.textContent = 'Please enter your full name.'; return; }
  redirectToDashboard({ full_name: nameVal, phone: _phone, role: _selectedRole });
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
  const role = user.role.toLowerCase();
  // Use absolute paths so redirect works from any base URL
  const routes = {
    buyer: '/pages/buyer/dashboard.html',
    farmer: '/dashboard.html',
    fpo: '/dashboard.html',
    logistics: '/dashboard.html',
    admin: '/dashboard.html'
  };
  location.assign(routes[role] || '/dashboard.html');
}
