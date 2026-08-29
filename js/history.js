(function(){
  'use strict';
  function relLabel(path){return path.replace(/\/index\.html$/,'/').replace(/^.*\//,'')||'首页'}
  function renderRecent(){
    if(!window.QishanState)return;
    const s=QishanState.get();const rows=(s.visitedPages||[]).slice(-7).reverse();
    document.querySelectorAll('[data-recent]').forEach(box=>{
      const current=location.pathname;
      const useful=rows.filter(x=>x.path!==current).slice(0,6);
      if(!useful.length){box.innerHTML='<p class="muted">尚无最近浏览记录。</p>';return}
      const root=document.body.dataset.root||'';
      box.innerHTML=useful.map(x=>{
        let href=x.path;
        const marker='/';
        const idx=href.lastIndexOf('/');
        // use absolute path when served normally; this remains valid under GitHub Pages because history entries contain deployed base path
        const d=new Date(x.at);const t=isNaN(d)?'':`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        return `<a class="recent-item" href="${href}"><span>${escapeHtml(x.title||relLabel(x.path))}</span><small>${t}</small></a>`
      }).join('');
    });
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  document.addEventListener('DOMContentLoaded',renderRecent);
})();
