const button = document.querySelector('.menu-btn');
const menu = document.querySelector('.mobile-menu');

if (button && menu) {
  button.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', open);
    button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });

  menu.querySelectorAll('a').forEach(a => 
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    })
  );
}

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: .25 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
}

const modal = document.querySelector('#auth-modal');
const loginPanel = document.querySelector('#login-panel');
const registerPanel = document.querySelector('#register-panel');
const statusBox = document.querySelector('#account-status');
const apiBase = window.UYIRVA_API_URL || 'http://127.0.0.1:8080';

function showAuth(view) {
  if (!modal) return;
  loginPanel.hidden = view !== 'login';
  registerPanel.hidden = view !== 'register';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  (view === 'login' ? loginPanel : registerPanel).querySelector('input').focus();
}

function closeAuth() {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-auth-open]').forEach(el => 
  el.addEventListener('click', () => showAuth(el.dataset.authOpen))
);

const authClose = document.querySelector('.auth-close');
if (authClose) authClose.addEventListener('click', closeAuth);

if (modal) {
  modal.addEventListener('click', e => { if (e.target === modal) closeAuth(); });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuth(); });

function redirectToDashboard(user) {
  localStorage.setItem('uyirva_user', JSON.stringify(user));
  location.assign(`dashboard.html`);
}

async function submitAuth(form, path) {
  const error = form.querySelector('.auth-error');
  const submit = form.querySelector('[type="submit"]');
  error.textContent = '';
  submit.disabled = true;
  submit.textContent = 'Please wait…';
  try {
    const payload = Object.fromEntries(new FormData(form));
    const response = await fetch(`${apiBase}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || 'Unable to complete your request.');
    
    localStorage.setItem('uyirva_access_token', data.access_token);
    localStorage.setItem('uyirva_refresh_token', data.refresh_token || '');
    redirectToDashboard(data.user || { full_name: payload.full_name || 'UYIRVA member', email: payload.email, role: payload.role });
  } catch (err) {
    error.textContent = err.message === 'Failed to fetch' ? 'Cannot reach the UYIRVA server. Start the FastAPI backend on port 8080.' : err.message;
  } finally {
    submit.disabled = false;
    submit.textContent = path === 'register' ? 'Create account' : 'Sign in';
  }
}

const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    submitAuth(e.currentTarget, 'login');
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    submitAuth(e.currentTarget, 'register');
  });
}

// Redirect logged-in users away from the landing page
if (localStorage.getItem('uyirva_user') && location.pathname.endsWith('index.html')) {
  location.assign('dashboard.html');
}
