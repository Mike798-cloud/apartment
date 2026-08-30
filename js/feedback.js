(function(){
  'use strict';
  const choices={
    avoid:{ending:'avoid',reply:'我不建议签。不是因为某一条，而是这套房现在公开资料里有几处互相对不上。先换一套更省心。'},
    verify:{ending:'verify',reply:'先别签。让租赁顾问把 1403 的格局调整和高区排风维护情况书面说明清楚，再决定。'},
    contact:{ending:'archive',reply:'先别签。我想先把能公开查到的材料发给和旧资料有关的人确认一下，再给你结论。'},
    public:{ending:'public',reply:'先别签。我准备把这些公开资料按时间整理出来，让更多人一起核对。'}
  };
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function renderRecent(){
    const box=document.querySelector('[data-feedback-recent]');if(!box||!window.QishanState)return;
    const current=location.pathname;
    const rows=(QishanState.get().visitedPages||[]).filter(x=>x.path!==current&&!/\/(feedback|help|search)\//.test(x.path)).slice(-7).reverse();
    if(!rows.length){box.innerHTML='<p class="muted">这里还没有浏览记录。你可以先回到房源或用站内搜索继续看看。</p>';return}
    box.innerHTML=rows.map(x=>`<a class="recent-item" href="${esc(x.path)}"><span>${esc(x.title||'已浏览页面')}</span><small>重新打开</small></a>`).join('');
  }
  function selected(form){return form.querySelector('input[name="action"]:checked')?.value||''}
  function updatePreview(form){
    const key=selected(form),box=document.querySelector('[data-reply-preview]'),send=document.querySelector('[data-send-reply]');
    if(!box)return;
    if(!choices[key]){box.textContent='选一句你现在最愿意对许唯说的话。';if(send)send.disabled=true;return}
    const note=(form.elements.note?.value||'').trim();
    box.textContent=choices[key].reply+(note?' '+note:'');
    if(send)send.disabled=false;
  }
  function restore(form){
    if(!window.QishanState)return;
    const c=QishanState.get().finalChoice;if(!c)return;
    const key=choices[c.action]?c.action:'';const radio=key?form.querySelector('input[name="action"][value="'+key+'"]'):null;if(radio)radio.checked=true;
    if(form.elements.note&&c.note)form.elements.note.value=c.note;
  }
  document.addEventListener('DOMContentLoaded',()=>{
    renderRecent();
    const form=document.querySelector('#reply-form');if(!form)return;
    restore(form);updatePreview(form);
    form.addEventListener('change',()=>updatePreview(form));form.addEventListener('input',()=>updatePreview(form));
    form.addEventListener('submit',ev=>{
      ev.preventDefault();const action=selected(form);if(!choices[action]){form.reportValidity();return}
      const note=(form.elements.note?.value||'').trim().slice(0,180);const reply=choices[action].reply+(note?' '+note:'');
      if(window.QishanState)QishanState.patch({finalChoice:{action,reply,note,submittedAt:Date.now()},ending:choices[action].ending});
      location.href='result.html';
    });
  });
})();
