/* filtro per rubrica nella pagina /blog */
(function(){var r=new URLSearchParams(location.search).get('rubrica')||'tutte';
document.querySelectorAll('.filters [data-r]').forEach(function(a){a.setAttribute('aria-pressed',String(a.dataset.r===r));});
document.querySelectorAll('#list .post-card').forEach(function(c){c.hidden=r!=='tutte'&&c.dataset.r!==r;});})();
