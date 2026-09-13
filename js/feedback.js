(function(){
  'use strict';
  const choices={
    avoid:{ending:'avoid',reply:'我不建议签。不是因为某一条，而是这套房现在公开资料里有几处互相对不上。先换一套更省心。'},
    verify:{ending:'verify',reply:'先别签。让租赁顾问把 1403 的格局调整和高区排风维护情况书面说明清楚，再决定。'},
    contact:{ending:'archive',reply:'先别签。我想先把能公开查到的材料发给和旧资料有关的人确认一下，再给你结论。'},
    public:{ending:'public',reply:'先别签。我准备把这些公开资料按时间整理出来，让更多人一起核对。'}
  };
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function evidence(){
    if(!window.QishanState||typeof QishanState.assessEvidence!=='function')return {options:{}};
    return QishanState.assessEvidence();
  }
  function renderRecent(){
    const box=document.querySelector('[data-feedback-recent]');if(!box||!window.QishanState)return;
    const current=location.pathname;
    const rows=(QishanState.get().visitedPages||[]).filter(x=>x.path!==current&&!/\/(feedback|help|search)\//.test(x.path)).slice(-7).reverse();
    if(!rows.length){box.innerHTML='<p class="muted">这里还没有浏览记录。你可以先回到房源或用站内搜索继续看看。</p>';return}
    box.innerHTML=rows.map(x=>`<a class="recent-item" href="${esc(x.path)}"><span>${esc(x.title||'已浏览页面')}</span><small>重新打开</small></a>`).join('');
  }
  function selected(form){return form.querySelector('input[name="action"]:checked')?.value||''}
  function applyEvidenceGates(form){
    const g=evidence();
    form.querySelectorAll('input[name="action"]').forEach(input=>{
      const rule=g.options&&g.options[input.value];
      const label=input.closest('.choice-card');
      const small=label&&label.querySelector('small');
      if(small&&!small.dataset.baseText)small.dataset.baseText=small.textContent;
      const allowed=!rule||rule.allowed!==false;
      input.disabled=!allowed;
      if(label){label.classList.toggle('evidence-locked',!allowed);label.setAttribute('aria-disabled',String(!allowed));}
      if(small)small.textContent=allowed?small.dataset.baseText:('暂不可选：'+(rule.reason||'还缺少支持这句话的公开记录。'));
      if(!allowed&&input.checked)input.checked=false;
    });
    const status=document.querySelector('[data-evidence-status]');
    if(status&&g.options){
      const open=Object.values(g.options).filter(x=>x&&x.allowed).length;
      status.textContent=open===4?'你已经查到足以支撑全部回复方向的公开信息。':open===0?'现在还缺少最基本的看房依据。先回到 1403，并再核对至少一项户型或物业记录。':'目前只有已有公开记录支持的回复可以选择；其他判断可以继续调查后再回来。';
    }
  }
  function updatePreview(form){
    const key=selected(form),box=document.querySelector('[data-reply-preview]'),send=document.querySelector('[data-send-reply]');
    if(!box)return;
    if(!choices[key]){box.textContent='选一句你现在最愿意对许唯说的话。';if(send)send.disabled=true;return}
    const rule=evidence().options?.[key];
    if(rule&&rule.allowed===false){box.textContent='这句话还缺少公开记录支持。可以继续调查后再回来。';if(send)send.disabled=true;return}
    const note=(form.elements.note?.value||'').trim();
    box.textContent=choices[key].reply+(note?' '+note:'');
    if(send)send.disabled=false;
  }
  function restore(form){
    if(!window.QishanState)return;
    const c=QishanState.get().finalChoice;if(!c)return;
    const key=choices[c.action]?c.action:'';
    const rule=key?evidence().options?.[key]:null;
    const radio=key&&(!rule||rule.allowed!==false)?form.querySelector('input[name="action"][value="'+key+'"]'):null;
    if(radio)radio.checked=true;
    if(form.elements.note&&c.note)form.elements.note.value=c.note;
  }
  document.addEventListener('DOMContentLoaded',()=>{
    renderRecent();
    const form=document.querySelector('#reply-form');if(!form)return;
    applyEvidenceGates(form);restore(form);updatePreview(form);
    form.addEventListener('change',()=>updatePreview(form));form.addEventListener('input',()=>updatePreview(form));
    form.addEventListener('submit',ev=>{
      ev.preventDefault();const action=selected(form);if(!choices[action]){form.reportValidity();return}
      const rule=evidence().options?.[action];
      if(rule&&rule.allowed===false){applyEvidenceGates(form);updatePreview(form);return}
      const note=(form.elements.note?.value||'').trim().slice(0,180);const reply=choices[action].reply+(note?' '+note:'');
      if(window.QishanState)QishanState.patch({finalChoice:{action,reply,note,submittedAt:Date.now()},ending:choices[action].ending});
      location.href='result.html';
    });
  });
})();
