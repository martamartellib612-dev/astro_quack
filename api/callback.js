// Accesso al pannello con GitHub (OAuth), passo 2: scambia il codice con un token e lo consegna
// solo alla finestra del pannello sullo stesso indirizzo del sito.
const crypto = require('crypto');
const HOST_OK = /^[a-z0-9.-]+(:\d+)?$/i;
const safeEqual = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const js = v => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  if (req.method !== 'GET' || !HOST_OK.test(host)) { res.statusCode = 400; return res.end('Richiesta non valida.'); }
  const url = new URL(req.url, `https://${host}`);
  const code = url.searchParams.get('code'), state = url.searchParams.get('state');
  const cookie = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('aq_oauth_state='));
  const expected = cookie ? cookie.slice('aq_oauth_state='.length) : '';
  let status = 'error', payload = { error: 'Accesso non riuscito' };
  try {
    if (!code || !state || !expected || !safeEqual(state, expected)) throw new Error('Richiesta non valida');
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code })
    });
    const data = await r.json();
    if (!data.access_token) throw new Error('Accesso non autorizzato');
    status = 'success'; payload = { token: data.access_token, provider: 'github' };
  } catch (e) { payload = { error: 'Accesso non riuscito: riprova' }; }
  const origin = `https://${host}`;
  const msg = `authorization:github:${status}:${JSON.stringify(payload)}`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
  res.setHeader('Set-Cookie', 'aq_oauth_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  res.end(`<!doctype html><meta charset="utf-8"><title>Accesso</title><p>Accesso in corso…</p><script>
(function(){var origin=${js(origin)},msg=${js(msg)};
if(!window.opener){document.body.textContent='Apri il pannello da /admin e riprova.';return;}
function receive(e){if(e.origin!==origin)return;window.removeEventListener('message',receive,false);window.opener.postMessage(msg,origin);setTimeout(function(){window.close();},300);}
window.addEventListener('message',receive,false);window.opener.postMessage('authorizing:github',origin);})();
</script>`);
};
