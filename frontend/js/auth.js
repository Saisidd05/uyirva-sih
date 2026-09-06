const button = document.querySelector('.menu-btn');
const menu = document.querySelector('.mobile-menu');
const modal = document.querySelector('#auth-modal');
const loginForm = document.querySelector('#login-form');
const loginSubmit = document.querySelector('#login-submit');

if (button && menu) button.addEventListener('click', () => menu.classList.toggle('open'));
function showAuth() { modal?.classList.add('open'); }
function closeAuth() { modal?.classList.remove('open'); }
function showError(message = '') { loginForm.querySelector('.auth-error').textContent = message; }
const otpField = document.querySelector('#otp-field');
const api = async (path, body) => { const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const data = await response.json(); if (!response.ok) throw new Error(data.detail || 'Request failed'); return data; };
document.querySelectorAll('[data-auth-open]').forEach(item => item.addEventListener('click', showAuth));
document.querySelector('.auth-close')?.addEventListener('click', closeAuth);
loginForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const phone = loginForm.elements.phone.value.trim();
  loginSubmit.disabled = true; showError();
  try {
    if (otpField.hidden) {
      await api('/api/auth/farmer/request-otp', { phone });
      otpField.hidden = false;
      loginForm.elements.otp.required = true;
      loginSubmit.textContent = 'Verify OTP & open dashboard';
      loginForm.elements.otp.focus();
      showError('Test OTP sent. Enter 123456 to continue.');
    } else {
      const result = await api('/api/auth/farmer/verify-otp', { phone, otp: loginForm.elements.otp.value.trim() });
      localStorage.removeItem('uyirva_demo_mode');
      localStorage.setItem('uyirva_access_token', result.access_token);
      localStorage.setItem('uyirva_user', JSON.stringify(result.user));
      location.assign('dashboard.html');
    }
  } catch (error) { showError(error.message); }
  finally { loginSubmit.disabled = false; }
});
