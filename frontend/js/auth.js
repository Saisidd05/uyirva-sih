const button = document.querySelector('.menu-btn');
const menu = document.querySelector('.mobile-menu');
const modal = document.querySelector('#auth-modal');
const loginForm = document.querySelector('#login-form');
const accountType = document.querySelector('#account-type');
const loginSubmit = document.querySelector('#login-submit');

if (button && menu) button.addEventListener('click', () => menu.classList.toggle('open'));
function showAuth() { modal?.classList.add('open'); }
function closeAuth() { modal?.classList.remove('open'); }
function showError(message = '') { loginForm.querySelector('.auth-error').textContent = message; }
function completeDemo(role) { localStorage.removeItem('uyirva_access_token'); localStorage.setItem('uyirva_demo_mode', 'true'); localStorage.setItem('uyirva_user', JSON.stringify({ id: `demo-${role}`, role })); location.assign('dashboard.html'); }
document.querySelectorAll('[data-auth-open]').forEach(item => item.addEventListener('click', showAuth));
document.querySelector('.auth-close')?.addEventListener('click', closeAuth);
loginForm?.addEventListener('submit', event => { event.preventDefault(); loginSubmit.disabled = true; showError(); completeDemo(accountType.value); });
