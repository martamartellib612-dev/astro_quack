// Genera il sito pubblicato nella cartella dist/:
// copia i file, crea una pagina per ogni articolo del blog, l'indice /blog,
// sitemap.xml, robots.txt e i dati per i motori di ricerca.
// Si avvia da solo su Vercel a ogni modifica (vedi vercel.json). Nessuna dipendenza esterna.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'dist');
const SKIP = new Set(['dist', 'scripts', 'node_modules', '.git', '.vercel', '.github', 'api', 'content']);

// ---------- lettura dei contenuti ----------
const readJSON = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const SITE = readJSON('content/settings.json');
const SIGN_NAMES = ['Ariete', 'Toro', 'Gemelli', 'Cancro', 'Leone', 'Vergine', 'Bilancia', 'Scorpione', 'Sagittario', 'Capricorno', 'Acquario', 'Pesci'];
const POSTS_DIR = path.join(ROOT, 'content/posts');
const POSTS = (fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR) : []).filter(f => f.endsWith('.json')).map(f => {
  const p = readJSON('content/posts/' + f);
  return { ...p, slug: f.replace(/\.json$/, ''), date: new Date(p.date || Date.now()).toISOString(),
    signs: (p.signs || []).map(x => typeof x === 'number' ? x : SIGN_NAMES.indexOf(x)).filter(i => i >= 0) };
});
const EVENTS = ((fs.existsSync(path.join(ROOT, 'content/events.json')) ? readJSON('content/events.json') : {}).events || []).map(e => ({ ...e, date: String(e.date || '').slice(0, 10) }));
const BASE = String(SITE.url || '').replace(/\/+$/, '');
const mainJs = fs.readFileSync(path.join(ROOT, 'assets/js/main.js'), 'utf8');
const RUBRICHE = vm.runInNewContext('(' + mainJs.match(/const RUBRICHE=(\[[\s\S]*?\]);/)[1] + ')');
const rub = id => RUBRICHE.find(r => r.id === id) || RUBRICHE[0];
const SIGNS = [['Ariete', '\u2648'], ['Toro', '\u2649'], ['Gemelli', '\u264A'], ['Cancro', '\u264B'], ['Leone', '\u264C'], ['Vergine', '\u264D'], ['Bilancia', '\u264E'], ['Scorpione', '\u264F'], ['Sagittario', '\u2650'], ['Capricorno', '\u2651'], ['Acquario', '\u2652'], ['Pesci', '\u2653']];
const VS = '\uFE0E';
const now = new Date();
const all = POSTS.filter(p => p && p.slug && p.title && p.status !== 'bozza')
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));
const live = all.filter(p => new Date(p.date) <= now);
const logo = fs.readFileSync(path.join(ROOT, 'assets/img/logo.svg'), 'utf8').replace('<svg ', '<svg class="logo" aria-hidden="true" ');

// ---------- utilità ----------
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s || '').replace(/[#*>\[\]]/g, '').replace(/\(https?:[^)]*\)/g, '').replace(/\s+/g, ' ').trim();
const excerpt = p => (p.excerpt || strip(p.body).slice(0, 160)).trim();
const readMin = t => Math.max(1, Math.round(String(t || '').split(/\s+/).length / 200));
const dFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' });
const cover = p => `/assets/img/rubrica-${rub(p.rubrica).cover}.webp`;
const ogImg = p => `/assets/img/og/${rub(p.rubrica).cover}.jpg`;
const abs = u => BASE + u;
function md(src) { // stesso markdown essenziale del sito
  const lines = esc(src || '').split(/\n/); let html = '', list = null;
  const inline = t => t.replace(/!\[([^\]]*)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" decoding="async">')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^\w])_(.+?)_(?=[^\w]|$)/g, '$1<em>$2</em>').replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[\w-]+|\/(?!\/)[^\s)]*)\)/g, '<a href="$2">$1</a>');
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (/^[-*] /.test(l)) { if (list !== 'ul') { if (list) html += `</${list}>`; html += '<ul>'; list = 'ul'; } html += `<li>${inline(l.slice(2))}</li>`; continue; }
    if (/^\d+\. /.test(l)) { if (list !== 'ol') { if (list) html += `</${list}>`; html += '<ol>'; list = 'ol'; } html += `<li>${inline(l.replace(/^\d+\. /, ''))}</li>`; continue; }
    if (list) { html += `</${list}>`; list = null; }
    if (!l.trim()) continue;
    if (l.startsWith('### ')) html += `<h4>${inline(l.slice(4))}</h4>`;
    else if (l.startsWith('## ')) html += `<h3>${inline(l.slice(3))}</h3>`;
    else if (l.startsWith('&gt; ')) html += `<blockquote>${inline(l.slice(5))}</blockquote>`;
    else html += `<p>${inline(l)}</p>`;
  }
  if (list) html += `</${list}>`;
  return html;
}
const verify = SITE.googleVerification ? `<meta name="google-site-verification" content="${esc(SITE.googleVerification)}">\n` : '';
const fonts = `<link rel="preload" href="/assets/fonts/instrument-serif-latin-400-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts/fonts.css">`;
const icons = `<link rel="icon" href="/assets/img/logo.svg" type="image/svg+xml">
<link rel="icon" href="/assets/icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#170815">`;
const analytics = SITE.analytics ? '<script defer src="/_vercel/insights/script.js"></script>' : '';
const themeScript = `<script src="/assets/js/theme.js"></script>`;
const ORG = { '@type': 'Organization', name: 'AstroQuack', url: BASE + '/', logo: abs('/assets/img/logo.svg') };

function head({ title, desc, url, image, type = 'website', jsonld, noindex }) {
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}${verify}${icons}
<meta property="og:site_name" content="AstroQuack">
<meta property="og:locale" content="it_IT">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
${fonts}
<link rel="stylesheet" href="/assets/css/style.css">
${themeScript}
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
${analytics}
</head>`;
}
const pageHead = current => `<header class="page-head night"><div class="in">
  <a class="brand" href="/" aria-label="AstroQuack, torna alla home">${logo}<span>AstroQuack</span></a>
  <nav aria-label="Navigazione"><a href="/#cielo">Il cielo</a><a href="/#tema">Tema natale</a><a href="/blog"${current === 'blog' ? ' aria-current="page"' : ''}>Blog</a><a href="/#contattami">Scrivimi</a></nav>
</div></header>`;
const pageFoot = `<footer class="site-foot night"><div class="in">${logo}<span>© AstroQuack · Calcoli astronomici: Swiss Ephemeris 2.10 © Astrodienst AG · <a href="${esc(SITE.repo)}" rel="noopener">Codice sorgente</a> con licenza AGPL-3.0 · <a href="/privacy">Privacy</a></span></div></footer>`;
const card = p => {
  const r = rub(p.rubrica);
  return `<article class="post-card"><a class="pc-btn" href="/blog/${encodeURIComponent(p.slug)}">
  <span class="pc-img" style="background-image:url(${cover(p)})"><span class="pc-rub">${esc(r.name)}</span></span>
  <span class="pc-body"><span class="pc-date">${dFmt.format(new Date(p.date))} · ${readMin(p.body)} min</span><span class="pc-title">${esc(p.title)}</span><span class="pc-ex">${esc(excerpt(p))}</span></span></a></article>`;
};

// ---------- copia dei file ----------
fs.rmSync(OUT, { recursive: true, force: true });
(function copy(dir, rel = '') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!rel && (SKIP.has(e.name) || e.name.startsWith('.'))) continue;
    const s = path.join(dir, e.name), d = path.join(OUT, rel, e.name);
    if (e.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copy(s, path.join(rel, e.name)); }
    else { fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(s, d); }
  }
})(ROOT);

// ---------- security.txt (contatto per segnalare vulnerabilità) ----------
fs.mkdirSync(path.join(OUT, '.well-known'), { recursive: true });
const expires = new Date(now.getTime() + 365 * 864e5).toISOString();
fs.writeFileSync(path.join(OUT, '.well-known/security.txt'), `Contact: mailto:${SITE.email}\nExpires: ${expires}\nPreferred-Languages: it, en\nCanonical: ${BASE}/.well-known/security.txt\n`);

// ---------- home: metadati, dati strutturati, articoli pre-caricati ----------
let home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const homeDesc = 'AstroQuack: astrologia con le piume. Il cielo giorno per giorno, il calendario dei transiti, le lune del mese, il tema natale calcolato con Swiss Ephemeris e il blog delle rubriche.';
const homeLd = { '@context': 'https://schema.org', '@graph': [
  { '@type': 'WebSite', name: 'AstroQuack', url: BASE + '/', inLanguage: 'it-IT', description: homeDesc },
  ORG] };
home = home.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(homeDesc)}">
<link rel="canonical" href="${BASE}/">
${verify}<meta property="og:site_name" content="AstroQuack">
<meta property="og:locale" content="it_IT">
<meta property="og:type" content="website">
<meta property="og:title" content="AstroQuack · astrologia con le piume">
<meta property="og:description" content="${esc(homeDesc)}">
<meta property="og:url" content="${BASE}/">
<meta property="og:image" content="${abs('/assets/img/og/home.jpg')}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(homeLd).replace(/</g, '\\u003c')}</script>`);
home = home.replace('</head>', `${icons}\n${analytics}\n</head>`).replace(/<link rel="icon" href="assets\/img\/logo.svg" type="image\/svg\+xml">\n?/, '');
home = home.replace('<div class="blog-grid" id="blogGrid"></div>', `<div class="blog-grid" id="blogGrid">${live.slice(0, 6).map(card).join('')}</div>`);
fs.writeFileSync(path.join(OUT, 'index.html'), home);

// ---------- pagine degli articoli ----------
fs.mkdirSync(path.join(OUT, 'blog'), { recursive: true });
for (const p of all) {
  const r = rub(p.rubrica), url = `${BASE}/blog/${encodeURIComponent(p.slug)}`, future = new Date(p.date) > now;
  const rel = live.filter(x => x.rubrica === p.rubrica && x.slug !== p.slug).slice(0, 3);
  const ld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BlogPosting', headline: p.title, description: excerpt(p), datePublished: p.date, dateModified: p.updated || p.date,
      image: abs(ogImg(p)), url, mainEntityOfPage: url, inLanguage: 'it-IT', articleSection: r.name, author: ORG, publisher: ORG },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'AstroQuack', item: BASE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: BASE + '/blog' },
      { '@type': 'ListItem', position: 3, name: p.title, item: url }] }] };
  const html = head({ title: `${p.title} · AstroQuack`, desc: excerpt(p), url, image: abs(ogImg(p)), type: 'article', jsonld: ld, noindex: future }) + `
<body>
${pageHead('blog')}
<main class="article">
  <p class="crumbs"><a href="/">AstroQuack</a> › <a href="/blog">Blog</a> › <a href="/blog?rubrica=${esc(r.id)}">${esc(r.name)}</a></p>
  <div class="post-cover" style="background-image:url(${cover(p)})" role="img" aria-label="Illustrazione della rubrica ${esc(r.name)}"></div>
  <div class="post-inner">
    <p class="post-meta"><span class="pc-rub static">${esc(r.name)}</span> <time datetime="${esc(p.date)}">${dFmt.format(new Date(p.date))}</time> · ${readMin(p.body)} min di lettura</p>
    <h1 class="post-title">${esc(p.title)}</h1>
    ${p.excerpt ? `<p class="lede">${esc(p.excerpt)}</p>` : ''}
    <div class="prose">${md(p.body)}</div>
    ${(p.signs || []).length ? `<p class="post-signs">${p.signs.map(i => `<span class="chip-s"><span class="g">${SIGNS[i][1] + VS}</span>${SIGNS[i][0]}</span>`).join('')}</p>` : ''}
    <div class="post-cta"><p>Vuoi approfondire il tuo cielo?</p><a class="btn" href="/#contattami">Scrivimi</a></div>
    ${rel.length ? `<h2 style="margin:44px 0 16px;font-size:2rem">Della stessa rubrica</h2><div class="blog-grid">${rel.map(card).join('')}</div>` : ''}
  </div>
</main>
${pageFoot}
</body>
</html>`;
  fs.writeFileSync(path.join(OUT, 'blog', `${p.slug}.html`), html);
}

// ---------- indice del blog ----------
{
  const url = `${BASE}/blog`, desc = 'Le rubriche di AstroQuack: Paper-News, Paperelle in Love, Born in the Quack, SuperQuack, Monday Quack, La posta di Mara e ASR Papere.';
  const ld = { '@context': 'https://schema.org', '@type': 'Blog', name: 'Il blog di AstroQuack', url, description: desc, publisher: ORG,
    blogPost: live.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: `${BASE}/blog/${encodeURIComponent(p.slug)}`, datePublished: p.date })) };
  const chips = [{ id: 'tutte', name: 'Tutte' }, ...RUBRICHE].map(r => `<a class="chipf" href="/blog${r.id === 'tutte' ? '' : '?rubrica=' + r.id}" data-r="${r.id}">${esc(r.name)}</a>`).join('');
  const html = head({ title: 'Blog · AstroQuack', desc, url, image: abs('/assets/img/og/paper.jpg'), jsonld: ld }) + `
<body>
${pageHead('blog')}
<main class="blog-page">
  <h1 style="font-size:clamp(2.8rem,6vw,5rem)">Il blog delle <em style="color:var(--pink)">rubriche</em></h1>
  <p class="lede">Paper-News, Paperelle in Love, SuperQuack e tutte le altre: le rubriche di AstroQuack, da leggere con calma.</p>
  <nav class="filters" aria-label="Filtra per rubrica">${chips}</nav>
  <div class="blog-grid" id="list">${live.map(p => card(p).replace('<article class="post-card">', `<article class="post-card" data-r="${esc(p.rubrica)}">`)).join('') || '<p class="empty-ev">I primi articoli arrivano a breve.</p>'}</div>
</main>
${pageFoot}
<script src="/assets/js/blog-index.js"></script>
</body>
</html>`;
  fs.writeFileSync(path.join(OUT, 'blog', 'index.html'), html);
}


// ---------- contenuti per il browser ----------
fs.mkdirSync(path.join(OUT, 'content'), { recursive: true });
const publicSite = { url: BASE, email: SITE.email, repo: SITE.repo, web3formsKey: SITE.web3formsKey || '', newsletterAction: SITE.newsletterAction || '',
  newsletterEmailField: SITE.newsletterEmailField || 'email', newsletterExtraFields: SITE.newsletterExtraFields || '', social: SITE.social || {} };
fs.writeFileSync(path.join(OUT, 'content/config.js'), `/* generato da scripts/build.mjs a partire da content/settings.json */\nconst SITE=${JSON.stringify(publicSite)};\n`);
fs.writeFileSync(path.join(OUT, 'content/posts.js'), `/* generato da scripts/build.mjs a partire da content/posts/ */\nwindow.POSTS=${JSON.stringify(all.map(({ title, slug, rubrica, date, status, signs, excerpt, body }) => ({ title, slug, rubrica, date, status, signs, excerpt, body })))};\n`);
fs.writeFileSync(path.join(OUT, 'content/events.js'), `/* generato da scripts/build.mjs a partire da content/events.json */\nwindow.EVENTS=${JSON.stringify(EVENTS)};\nconst EVENTS=window.EVENTS;\n`);

// ---------- manifest per l’installazione su telefono ----------
fs.writeFileSync(path.join(OUT, 'manifest.webmanifest'), JSON.stringify({
  name: 'AstroQuack', short_name: 'AstroQuack', description: 'Astrologia con le piume', lang: 'it', start_url: '/', scope: '/', display: 'standalone',
  background_color: '#170815', theme_color: '#170815',
  icons: [{ src: '/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/assets/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] }, null, 2));

// ---------- informativa privacy ----------
{
  const tit = SITE.titolare ? esc(SITE.titolare) : '[nome e cognome della titolare, eventuale partita IVA]';
  const mail = esc(SITE.titolareContatto || SITE.email);
  const today = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Rome' }).format(now);
  const url = `${BASE}/privacy`;
  const html = head({ title: 'Informativa privacy · AstroQuack', desc: 'Come AstroQuack tratta i dati personali di chi visita il sito, scrive dal modulo di contatto o si iscrive alla newsletter.', url, image: abs('/assets/img/og/home.jpg'), jsonld: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Informativa privacy', url } }) + `
<body>
${pageHead('')}
<main class="article prose-page">
  <h1 class="post-title">Informativa <em style="color:var(--pink)">privacy</em></h1>
  <p class="post-meta">Ultimo aggiornamento: ${today}</p>
  <div class="prose">
  <h3>Chi è il titolare</h3>
  <p>Il titolare del trattamento è ${tit}, che gestisce il sito AstroQuack. Per qualsiasi domanda sui tuoi dati puoi scrivere a <a href="mailto:${mail}">${mail}</a>.</p>
  <h3>Quali dati trattiamo e perché</h3>
  <ul>
    <li><strong>Modulo «Scrivimi».</strong> Nome, email, motivo del contatto, modalità preferita e il testo del messaggio, per risponderti. Base giuridica: la tua richiesta e il tuo consenso (art. 6.1 lett. a e b del GDPR).${SITE.web3formsKey ? ' Il messaggio viene inoltrato via email tramite il servizio Web3Forms.' : ' Il messaggio parte dal tuo programma di posta, che lo invia direttamente alla nostra casella.'}</li>
    <li><strong>Newsletter.</strong> Se ti iscrivi, il tuo indirizzo email, per inviarti aggiornamenti su lune, articoli ed eventi. Base giuridica: il consenso, che puoi revocare in ogni momento con il link presente in ogni email.</li>
    <li><strong>Tema natale, sinastria e transiti.</strong> Date, ore e luoghi di nascita vengono elaborati soltanto nel tuo browser: non vengono inviati né salvati sui nostri server. Per comodità l’ultimo calcolo resta memorizzato nel tuo browser e puoi cancellarlo svuotando i dati del sito.</li>
    <li><strong>Statistiche di visita.</strong> Usiamo Vercel Web Analytics, che non usa cookie e raccoglie solo dati aggregati e anonimi (pagine viste, paese, tipo di dispositivo). Base giuridica: il legittimo interesse a capire come viene usato il sito (art. 6.1 lett. f).</li>
    <li><strong>Dati tecnici.</strong> Il fornitore di hosting registra per motivi di sicurezza dati tecnici delle richieste, come l’indirizzo IP, per un periodo limitato.</li>
  </ul>
  <h3>Per quanto tempo</h3>
  <p>I messaggi ricevuti sono conservati per il tempo necessario a rispondere e comunque non oltre 24 mesi. L’indirizzo per la newsletter resta finché non ti disiscrivi.</p>
  <h3>A chi vengono comunicati</h3>
  <p>Non vendiamo né cediamo i tuoi dati. Li trattano per nostro conto soltanto i fornitori tecnici necessari: Vercel Inc. (hosting e statistiche)${SITE.web3formsKey ? ', Web3Forms (inoltro dei messaggi)' : ''}${SITE.newsletterAction ? ', il servizio di invio della newsletter' : ''} e il servizio di posta elettronica della titolare. Alcuni hanno sede negli Stati Uniti e aderiscono al Data Privacy Framework UE-USA o usano le clausole contrattuali standard.</p>
  <h3>Cookie e memoria del browser</h3>
  <p>Il sito non usa cookie di profilazione né cookie di terze parti. Nel tuo browser vengono salvate solo preferenze tecniche (tema chiaro o scuro, impostazioni di calcolo, filtri del calendario) e gli ultimi dati inseriti nei calcolatori. I caratteri tipografici sono ospitati direttamente sul sito.</p>
  <h3>I tuoi diritti</h3>
  <p>Puoi chiedere in ogni momento l’accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione del trattamento, la portabilità e opporti al trattamento, oltre a revocare il consenso, scrivendo a <a href="mailto:${mail}">${mail}</a>. Hai anche il diritto di presentare reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" rel="noopener">garanteprivacy.it</a>).</p>
  </div>
</main>
${pageFoot}
</body>
</html>`;
  fs.writeFileSync(path.join(OUT, 'privacy.html'), html);
}

// ---------- pagina non trovata ----------
fs.writeFileSync(path.join(OUT, '404.html'), head({ title: 'Pagina non trovata · AstroQuack', desc: 'Questa pagina si è persa tra le stelle.', url: `${BASE}/404`, image: abs('/assets/img/og/home.jpg'), jsonld: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Pagina non trovata' }, noindex: true }) + `
<body class="night" style="min-height:100svh;display:flex;flex-direction:column">
${pageHead('')}
<main class="article" style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center">
  <p class="post-meta" style="font-size:1rem">errore 404</p>
  <h1 class="post-title">Questa pagina si è persa <em style="color:var(--pink)">tra le stelle</em></h1>
  <p class="lede" style="margin:18px auto 30px">Forse l’indirizzo è cambiato, o la paperella ha preso un’altra orbita.</p>
  <p style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn" href="/">Torna alla home</a><a class="btn ghost" href="/blog">Leggi il blog</a></p>
</main>
${pageFoot}
</body>
</html>`);

// ---------- sitemap e robots ----------
const day = d => new Date(d).toISOString().slice(0, 10);
const urls = [
  { loc: `${BASE}/`, lastmod: day(now), pri: '1.0' },
  { loc: `${BASE}/blog`, lastmod: live[0] ? day(live[0].updated || live[0].date) : day(now), pri: '0.8' },
  ...live.map(p => ({ loc: `${BASE}/blog/${encodeURIComponent(p.slug)}`, lastmod: day(p.updated || p.date), pri: '0.7' })),
  { loc: `${BASE}/privacy`, lastmod: day(now), pri: '0.2' }];
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pri}</priority></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);

console.log(`AstroQuack: ${all.length} articoli (${live.length} pubblicati), sitemap con ${urls.length} indirizzi, sito in dist/`);
