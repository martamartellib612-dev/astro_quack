/* barra laterale, menu e tema chiaro/scuro per le pagine del blog, privacy e 404 */
(function(){
  var $=function(s){return document.querySelector(s);};
  var path=location.pathname.replace(/\/+$/,'')||'/';
  document.querySelectorAll('.nav a, .sheet-nav a').forEach(function(a){
    var h=a.getAttribute('href');var on=h===path||(h==='/blog'&&path.indexOf('/blog')===0);
    a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');});
  function isDark(){var t=document.documentElement.dataset.theme;return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;}
  function label(){var l=isDark()?'Pagine chiare':'Pagine scure';['#themeBtn','#themeBtn3'].forEach(function(s){var b=$(s);if(b)b.textContent=l;});}
  function toggle(){var t=isDark()?'light':'dark';try{localStorage.setItem('aq-theme',JSON.stringify(t));}catch(e){}document.documentElement.dataset.theme=t;label();}
  ['#themeBtn','#themeBtn3'].forEach(function(s){var b=$(s);if(b)b.addEventListener('click',toggle);});label();
  var dlg=$('#menuDlg'),more=$('#navMore');
  if(dlg&&more){more.addEventListener('click',function(){dlg.showModal();});
    var x=$('#menuClose');if(x)x.addEventListener('click',function(){dlg.close();});
    dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close();});}
})();
