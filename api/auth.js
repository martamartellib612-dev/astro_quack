// Accesso al pannello con GitHub (OAuth), passo 1: reindirizza a GitHub.
// Variabili d’ambiente su Vercel: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
// e facoltativa GITHUB_OAUTH_SCOPE ("public_repo" se il repository è pubblico, predefinito; "repo" solo se è privato).
const crypto = require('crypto');
const HOST_OK = /^[a-z0-9.-]+(:\d+)?$/i;
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.statusCode = 405; return res.end(); }
  const id = process.env.GITHUB_CLIENT_ID;
  if (!id) { res.statusCode = 500; return res.end('Configurazione mancante.'); }
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  if (!HOST_OK.test(host)) { res.statusCode = 400; return res.end('Richiesta non valida.'); }
  const scope = process.env.GITHUB_OAUTH_SCOPE === 'repo' ? 'repo' : 'public_repo';
  const state = crypto.randomBytes(24).toString('hex');
  const redirect = `https://${host}/api/callback`;
  res.setHeader('Set-Cookie', `aq_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.statusCode = 302;
  res.setHeader('Location', `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(id)}&redirect_uri=${encodeURIComponent(redirect)}&scope=${scope}&state=${state}&allow_signup=false`);
  res.end();
};
