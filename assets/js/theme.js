/* applica subito il tema chiaro o scuro scelto dal visitatore (pagine del blog, privacy, 404) */
try{const t=JSON.parse(localStorage.getItem('aq-theme'));if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}
