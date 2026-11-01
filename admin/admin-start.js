/* l’indirizzo del sito si ricava da solo: funziona sia su .vercel.app sia sul dominio definitivo */
CMS.init({ config: { backend: { name: 'github', repo: 'martamartellib612-dev/astro_quack', branch: 'main', base_url: location.origin, auth_endpoint: 'api/auth' } } });
CMS.registerPreviewStyle('/assets/fonts/fonts.css');
CMS.registerPreviewStyle('/assets/css/style.css');
