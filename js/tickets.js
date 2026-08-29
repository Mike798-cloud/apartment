(function(){
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function norm(s){return String(s||'').toLowerCase().replace(/[\s_-]+/g,'')}
  function render(q){const box=document.querySelector('#ticket-list');if(!box||!window.QISHAN_TICKETS)return;const n=norm(q);const rows=QISHAN_TICKETS.filter(t=>!n||norm([t.id,t.date,t.room,t.text,t.status].concat(t.keywords||[]).join(' ')).includes(n));box.innerHTML=rows.length?rows.map(t=>`<div class="ticket"><div class="row"><b>${esc(t.id)}</b><span class="meta">${esc(t.date)}</span></div><p>${esc(t.room)} · ${esc(t.text)}</p><span class="tag">${esc(t.status)}</span></div>`).join(''):'<div class="empty-state">没有找到匹配的公开工单。可尝试房号、工单号或故障关键词。</div>'}
  document.addEventListener('DOMContentLoaded',()=>{const q=document.querySelector('#ticket-q'),b=document.querySelector('#ticket-btn');if(!q||!b)return;render('');const go=()=>render(q.value);b.addEventListener('click',go);q.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}})})
})();
