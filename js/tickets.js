(function(){
  'use strict';
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function norm(s){return String(s||'').toLowerCase().replace(/[，。；、/\\\s_-]+/g,'')}
  function terms(s){return String(s||'').trim().split(/[\s,，、/]+/).map(norm).filter(Boolean)}
  function haystack(t){return norm([t.id,t.date,t.room,t.text,t.status].concat(t.keywords||[]).join(' '))}
  function render(q){
    const box=document.querySelector('#ticket-list'),count=document.querySelector('#ticket-count');if(!box||!window.QISHAN_TICKETS)return;
    const ts=terms(q);
    if(!ts.length){box.innerHTML='<div class="empty-state">输入房号、工单号或故障关键词后查询。公开查询不会自动列出全部住户记录。</div>';if(count)count.textContent='';return}
    const rows=QISHAN_TICKETS.filter(t=>{const h=haystack(t);return ts.every(x=>h.includes(x))});
    if(window.QishanState)QishanState.search(String(q||'').trim());
    if(count)count.textContent=rows.length?`${rows.length} 条公开记录`:'没有匹配记录';
    box.innerHTML=rows.length?rows.map(t=>`<div class="ticket"><div class="row"><b>${esc(t.id)}</b><span class="meta">${esc(t.date)}</span></div><p>${esc(t.room)} · ${esc(t.text)}</p><span class="tag">${esc(t.status)}</span></div>`).join(''):'<div class="empty-state">没有找到匹配的公开工单。可以缩短关键词，或换用房号、工单号和故障名称。</div>';
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const q=document.querySelector('#ticket-q'),b=document.querySelector('#ticket-btn');if(!q||!b)return;
    const initial=new URLSearchParams(location.search).get('q')||'';if(initial)q.value=initial;render(initial);
    const go=()=>render(q.value);b.addEventListener('click',go);q.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}})
  })
})();
