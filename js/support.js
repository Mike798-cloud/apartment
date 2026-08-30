(function(){
  'use strict';
  /* 交互结构沿用《松涛粮站》的 1 元自愿支持逻辑：三重本地标记、二维码、已完成/稍后、感谢提示。
     《栖山公寓》只调整触发时机、文案和视觉，不把支持状态接入任何页面或后续。 */
  const STORE='_qishan_apartment_support_v1';
  const SESSION='_qishan_apartment_support_session';
  const COOKIE='_qishan_apartment_pay_flag';
  const FIRST='_qishan_apartment_support_first_at';
  const AUTO='_qishan_apartment_support_auto_seen';
  const QR='https://mike798-cloud.github.io/songtao-grainstation/paycode.png';
  const MIN_ELAPSED=150000;
  const FALLBACK=300000;
  function safeGet(store,key){try{return store.getItem(key)||''}catch(e){return ''}}
  function safeSet(store,key,val){try{store.setItem(key,val)}catch(e){}}
  function cookieGet(name){try{return document.cookie.split(';').map(x=>x.trim()).find(x=>x.indexOf(name+'=')===0)?.slice(name.length+1)||''}catch(e){return ''}}
  function cookieSet(name,val,days){try{const d=new Date(Date.now()+days*864e5);document.cookie=name+'='+encodeURIComponent(val)+';expires='+d.toUTCString()+';path=/;SameSite=Lax'}catch(e){}}
  function token(){const raw=Date.now()+'_'+Math.random().toString(36).slice(2,10)+'_abc_studio';try{return btoa(raw)}catch(e){return raw}}
  const Support={
    lastFocus:null,
    deferTimer:null,
    hasPaid(){return !!(safeGet(localStorage,STORE)||safeGet(sessionStorage,SESSION)||cookieGet(COOKIE))},
    markPaid(){const t=token();safeSet(localStorage,STORE,t);safeSet(sessionStorage,SESSION,t);cookieSet(COOKIE,t,365)},
    shouldDefer(){
      if(document.hidden)return true;
      if(document.querySelector('.lightbox.open'))return true;
      const a=document.activeElement;
      return !!(a&&/^(INPUT|TEXTAREA|SELECT)$/i.test(a.tagName));
    },
    show(opts){
      opts=opts||{};
      if(this.hasPaid()){
        if(opts.manual)this.toast('已经记录过你的支持，感谢你。');
        return;
      }
      if(!opts.manual&&this.shouldDefer())return this.deferAuto();
      let overlay=document.getElementById('qs-support-overlay');
      if(!overlay){this.create();overlay=document.getElementById('qs-support-overlay')}
      if(!overlay)return;
      this.lastFocus=document.activeElement;
      overlay.style.display='flex';
      overlay.classList.remove('is-closing');
      document.documentElement.classList.add('support-open');
      requestAnimationFrame(()=>requestAnimationFrame(()=>overlay.classList.add('is-open')));
      const close=overlay.querySelector('.qs-support-close');if(close)close.focus();
    },
    hide(){
      const o=document.getElementById('qs-support-overlay');if(!o)return;
      o.classList.add('is-closing');o.classList.remove('is-open');
      document.documentElement.classList.remove('support-open');
      setTimeout(()=>{o.style.display='none';o.classList.remove('is-closing');if(this.lastFocus&&this.lastFocus.focus)this.lastFocus.focus()},360);
    },
    complete(){this.markPaid();this.hide();this.toast('感谢你的支持。栖山的下一页还会继续更新。')},
    toast(text){
      document.querySelectorAll('.qs-support-toast').forEach(x=>x.remove());
      const t=document.createElement('div');t.className='qs-support-toast';t.setAttribute('role','status');t.textContent=text;document.body.appendChild(t);
      setTimeout(()=>t.classList.add('show'),30);setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),320)},3000)
    },
    create(){
      const html=`<div class="qs-support-overlay" id="qs-support-overlay" role="dialog" aria-modal="true" aria-labelledby="qs-support-title" aria-describedby="qs-support-desc" style="display:none">
        <div class="qs-support-card"><button class="qs-support-close" type="button" aria-label="关闭支持窗口">×</button><div class="qs-support-inner">
          <div class="qs-support-head"><div class="qs-support-title" id="qs-support-title"><span class="qs-support-heart">♡</span><span>支持《栖山公寓》</span><span class="qs-support-heart">♡</span></div><div class="qs-support-sub">1元 自愿打赏 · 不影响浏览与后续</div></div>
          <div class="qs-support-body"><div class="qs-support-qr"><img src="${QR}" alt="1元收款码"><div class="qs-support-qr-fallback">收款码加载失败<br>可打开下方备用图片</div></div><div class="qs-support-tip">请用 <strong>某宝</strong> 扫码打赏 1 元</div>
          <div class="qs-support-message" id="qs-support-desc"><p class="warm">你好，我是 abc studio 的独立开发者。</p><p>《栖山公寓》里看似普通的房源、旧照片、工单与图纸，都需要反复核对时间、编号和细节。<br>如果这次浏览让你愿意多停留一会儿，一元支持会成为继续做下一部作品的动力。</p><p class="small-note">支持不会改变页面、给许唯的回复或任何后续。</p><p><a href="${QR}" target="_blank" rel="noopener">收款码未显示？打开备用图片</a></p></div></div>
          <div class="qs-support-footer"><div class="qs-support-hint">支持记录仅保存在当前浏览器。清除浏览器数据后，网站可能无法识别之前的记录。</div><div class="qs-support-actions"><button class="qs-support-btn primary" type="button" data-support-done>已完成支持 ♡</button><button class="qs-support-btn secondary" type="button" data-support-later>下次一定</button></div></div><div class="qs-support-studio">abc studio</div>
        </div></div></div>`;
      document.body.insertAdjacentHTML('beforeend',html);
      const o=document.getElementById('qs-support-overlay');
      o.querySelector('.qs-support-close').addEventListener('click',()=>this.hide());
      o.querySelector('[data-support-later]').addEventListener('click',()=>this.hide());
      o.querySelector('[data-support-done]').addEventListener('click',()=>this.complete());
      o.querySelector('.qs-support-qr img').addEventListener('error',e=>e.currentTarget.parentElement.classList.add('is-error'));
      o.addEventListener('click',e=>{if(e.target===o)this.hide()});
      o.addEventListener('keydown',e=>{
        if(e.key==='Escape'){e.preventDefault();this.hide();return}
        if(e.key!=='Tab')return;
        const f=[...o.querySelectorAll('button,a[href]')].filter(x=>!x.disabled&&x.offsetParent!==null);if(!f.length)return;
        const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      });
    },
    bindButton(b){if(!b||b.dataset.supportBound)return;b.dataset.supportBound='1';b.addEventListener('click',e=>{e.preventDefault();this.show({manual:true})})},
    installManualEntry(){
      document.querySelectorAll('[data-open-support]').forEach(b=>this.bindButton(b));
      const footer=document.querySelector('.footer-grid>div:last-child p');
      if(footer&&!footer.querySelector('[data-open-support]')){
        footer.insertAdjacentHTML('beforeend','<br><button type="button" class="qs-support-footer-link" data-open-support>支持作者 1元</button>');
        this.bindButton(footer.querySelector('[data-open-support]'));
      }
      const result=document.querySelector('.result-box');
      if(result&&!result.querySelector('[data-open-support]')){
        const div=document.createElement('div');div.className='qs-support-result';div.innerHTML='<button class="btn secondary" type="button" data-open-support>支持作者 1元</button>';result.appendChild(div);this.bindButton(div.querySelector('button'));
      }
    },
    meaningfulCount(){
      try{if(!window.QishanState)return 0;const s=QishanState.get();const skip=/\/(search|help|feedback|legal)\//;return new Set((s.visitedPages||[]).map(x=>x.path).filter(p=>p&&p!=='/'&&!skip.test(p))).size}catch(e){return 0}
    },
    deferAuto(){
      clearTimeout(this.deferTimer);this.deferTimer=setTimeout(()=>{if(!this.hasPaid()&&safeGet(localStorage,AUTO)==='1')this.show({manual:false})},15000)
    },
    planAuto(){
      if(this.hasPaid()||safeGet(localStorage,AUTO))return;
      if(/\/feedback\//.test(location.pathname))return;
      let first=Number(safeGet(localStorage,FIRST));if(!first){first=Date.now();safeSet(localStorage,FIRST,String(first))}
      const elapsed=Date.now()-first,count=this.meaningfulCount();
      if(elapsed>=MIN_ELAPSED&&count>=4)return this.autoOpen(900);
      const wait=Math.max(1200,FALLBACK-elapsed);
      setTimeout(()=>{if(!this.hasPaid()&&!safeGet(localStorage,AUTO))this.autoOpen(0)},wait);
    },
    autoOpen(delay){setTimeout(()=>{if(this.hasPaid()||safeGet(localStorage,AUTO))return;safeSet(localStorage,AUTO,'1');if(this.shouldDefer())this.deferAuto();else this.show({manual:false})},delay||0)},
    init(){this.installManualEntry();this.planAuto()}
  };
  window.QishanSupport=Support;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>Support.init(),{once:true});else Support.init();
})();
