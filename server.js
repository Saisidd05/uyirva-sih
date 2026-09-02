const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const dataDirectory = path.join(root, '.data');
const usersFile = path.join(dataDirectory, 'users.json');
const port = Number(process.env.PORT || 8000);

fs.mkdirSync(dataDirectory, { recursive: true });
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '[]', 'utf8');

function users() { return JSON.parse(fs.readFileSync(usersFile, 'utf8')); }
function saveUsers(value) { fs.writeFileSync(usersFile, JSON.stringify(value, null, 2), 'utf8'); }
function send(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' });
  response.end(JSON.stringify(payload));
}
function hash(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, value: crypto.scryptSync(password, salt, 64).toString('hex') };
}
function token(user) {
  return crypto.createHmac('sha256', 'uyirva-local-development').update(`${user.id}:${Date.now()}`).digest('base64url');
}
function publicUser(user) { return { id: user.id, full_name: user.full_name, email: user.email, role: user.role }; }
function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; if (body.length > 100_000) request.destroy(); });
    request.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch { reject(new Error('Invalid JSON body')); } });
  });
}
function serveFile(request, response) {
  const requestPath = request.url === '/' ? '/kootu.html' : decodeURIComponent(request.url.split('?')[0]);
  const filePath = path.resolve(root, `.${requestPath}`);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return send(response, 404, { detail: 'Not found' });
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mp4': 'video/mp4' };
  response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {});
  if (request.method === 'GET' && request.url === '/api/health') return send(response, 200, { status: 'ok' });
  if (request.method === 'POST' && request.url === '/api/auth/register') {
    try {
      const payload = await readBody(request);
      const required = ['full_name', 'email', 'phone', 'password', 'role'];
      if (required.some(key => !payload[key])) return send(response, 422, { detail: 'Please complete every field.' });
      if (!['FARMER', 'BUYER', 'FPO'].includes(payload.role)) return send(response, 422, { detail: 'Choose a valid role.' });
      if (String(payload.password).length < 8) return send(response, 422, { detail: 'Password must contain at least 8 characters.' });
      const records = users(), email = String(payload.email).trim().toLowerCase();
      if (records.some(user => user.email === email)) return send(response, 400, { detail: 'Email already registered' });
      const password = hash(payload.password);
      const user = { id: crypto.randomUUID(), full_name: String(payload.full_name).trim(), email, phone: String(payload.phone).trim(), role: payload.role, password };
      records.push(user); saveUsers(records);
      return send(response, 200, { access_token: token(user), token_type: 'bearer', refresh_token: token(user), user: publicUser(user) });
    } catch (error) { return send(response, 400, { detail: error.message }); }
  }
  if (request.method === 'POST' && request.url === '/api/auth/login') {
    try {
      const payload = await readBody(request), email = String(payload.email || '').trim().toLowerCase();
      const user = users().find(record => record.email === email);
      if (!user) return send(response, 401, { detail: 'Invalid credentials' });
      const attempted = hash(String(payload.password || ''), user.password.salt).value;
      if (!crypto.timingSafeEqual(Buffer.from(attempted), Buffer.from(user.password.value))) return send(response, 401, { detail: 'Invalid credentials' });
      return send(response, 200, { access_token: token(user), token_type: 'bearer', refresh_token: token(user), user: publicUser(user) });
    } catch (error) { return send(response, 400, { detail: error.message }); }
  }
  if (request.method === 'GET') return serveFile(request, response);
  return send(response, 404, { detail: 'Not found' });
}).listen(port, '127.0.0.1', () => console.log(`UYIRVA is running at http://127.0.0.1:${port}`));
