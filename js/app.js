(function(){
  'use strict';
  function storageGet(store,key){try{return store.getItem(key)}catch(e){return null}}
  function storageSet(store,key,val){try{store.setItem(key,val)}catch(e){}}
  function setupSharedLinkIntro(){
    const box=document.querySelector('[data-shared-link-intro]');
    const force=new URLSearchParams(location.search).get('intro')==='1';
    const key='qs_shared_intro_v16';
    let lastFocus=null;
    const focusables=()=>box?[...box.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')].filter(x=>x.offsetParent!==null):[];
    const openBox=()=>{
      if(!box)return;
      lastFocus=document.activeElement;
      box.hidden=false;box.setAttribute('aria-hidden','false');document.documentElement.classList.add('intro-open');
      setTimeout(()=>box.querySelector('[data-shared-enter]')?.focus(),30);
    };
    const closeBox=()=>{
      if(!box)return;
      storageSet(sessionStorage,key,'1');box.hidden=true;box.setAttribute('aria-hidden','true');document.documentElement.classList.remove('intro-open');
      if(lastFocus&&lastFocus.focus)lastFocus.focus();
    };
    if(box){
      if(force||storageGet(sessionStorage,key)!=='1')openBox();else closeBox();
      const enter=box.querySelector('[data-shared-enter]'),close=box.querySelector('[data-shared-close]');
      if(enter)enter.addEventListener('click',()=>storageSet(sessionStorage,key,'1'));
      if(close)close.addEventListener('click',()=>{closeBox();document.querySelector('#main a, #main button')?.focus()});
      box.addEventListener('keydown',e=>{
        if(e.key==='Escape'&&close){e.preventDefault();close.click();return}
        if(e.key!=='Tab'||box.hidden)return;
        const f=focusables();if(!f.length)return;const first=f[0],last=f[f.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      });
    }
    document.querySelectorAll('[data-shared-reopen]').forEach(btn=>btn.addEventListener('click',e=>{if(box){e.preventDefault();openBox()}}));
  }
  function setupMenu(){
    const b=document.querySelector('.menu-btn'),n=document.querySelector('.nav');if(!b||!n)return;
    const close=()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false');b.textContent='菜单'};
    b.addEventListener('click',()=>{const open=n.classList.toggle('open');b.setAttribute('aria-expanded',String(open));b.textContent=open?'关闭':'菜单'});
    document.addEventListener('click',e=>{if(innerWidth<=900&&n.classList.contains('open')&&!n.contains(e.target)&&e.target!==b)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&n.classList.contains('open')){close();b.focus()}});
  }
  function setupLightbox(){
    let lb=document.querySelector('.lightbox');
    if(!lb){lb=document.createElement('div');lb.className='lightbox';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','图片放大查看');lb.innerHTML='<div class="lightbox-toolbar"><button type="button" data-zoomout aria-label="缩小">−</button><span class="lightbox-zoom" aria-live="polite">100%</span><button type="button" data-zoomin aria-label="放大">＋</button><button type="button" data-close aria-label="关闭">×</button></div><div class="lightbox-stage"><img alt=""></div>';document.body.appendChild(lb)}
    const img=lb.querySelector('img'),stage=lb.querySelector('.lightbox-stage'),readout=lb.querySelector('.lightbox-zoom');let zoom=1,lastFocus=null,pinchStart=0,pinchZoom=1;
    function setZoom(v){zoom=Math.max(.6,Math.min(4,v));img.style.transform=`scale(${zoom})`;if(readout)readout.textContent=Math.round(zoom*100)+'%'}
    function open(src,alt){lastFocus=document.activeElement;img.src=src;img.alt=alt||'';setZoom(1);lb.classList.add('open');document.documentElement.classList.add('lightbox-open');lb.querySelector('[data-close]').focus()}
    function close(){lb.classList.remove('open');document.documentElement.classList.remove('lightbox-open');img.src='';if(lastFocus&&lastFocus.focus)lastFocus.focus()}
    lb.querySelector('[data-close]').addEventListener('click',close);lb.querySelector('[data-zoomin]').addEventListener('click',()=>setZoom(zoom+.25));lb.querySelector('[data-zoomout]').addEventListener('click',()=>setZoom(zoom-.25));img.addEventListener('dblclick',()=>setZoom(zoom>1?1:1.9));stage.addEventListener('wheel',e=>{if(!lb.classList.contains('open'))return;e.preventDefault();setZoom(zoom+(e.deltaY<0?.18:-.18))},{passive:false});
    stage.addEventListener('touchstart',e=>{if(e.touches.length===2){const [a,b]=e.touches;pinchStart=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);pinchZoom=zoom}},{passive:true});
    stage.addEventListener('touchmove',e=>{if(e.touches.length!==2||!pinchStart)return;const [a,b]=e.touches,dist=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);setZoom(pinchZoom*(dist/pinchStart));e.preventDefault()},{passive:false});
    stage.addEventListener('touchend',e=>{if(e.touches.length<2)pinchStart=0},{passive:true});
    lb.addEventListener('click',e=>{if(e.target===lb)close()});
    document.querySelectorAll('.image-viewer').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',(el.alt||'图片')+'，按回车放大');const run=()=>open(el.currentSrc||el.src,el.alt);el.addEventListener('click',run);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run()}})});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lb.classList.contains('open'))close()});
  }
  function setupDocs(){document.querySelectorAll('[data-doc]').forEach(a=>a.addEventListener('click',()=>window.QishanState&&QishanState.doc(a.dataset.doc)))}
  function setupClear(){document.querySelectorAll('[data-clear-state]').forEach(b=>b.addEventListener('click',()=>{if(confirm('仅清除本浏览器保存的最近浏览、搜索、看房备忘与给许唯的回复。继续吗？')){QishanState&&QishanState.clear();location.reload()}}))}
  function setupActiveNav(){const here=location.pathname.replace(/\/+$/,'/');let root;try{root=new URL((document.body.dataset.root||'')+'index.html',document.baseURI||location.href).pathname}catch(e){return}document.querySelectorAll('.nav a').forEach(a=>{try{const p=new URL(a.href,document.baseURI||location.href).pathname.replace(/\/+$/,'/');const active=p===root?(here===root||here===root.replace(/index\.html$/,'')):here.startsWith(p.replace(/index\.html$/,''));if(active)a.setAttribute('aria-current','page')}catch(e){}})}
  function setupImageLoading(){document.querySelectorAll('img:not(.hero-media img)').forEach(img=>{if(!img.hasAttribute('loading'))img.loading='lazy';img.decoding='async'})}
  function loadNarrativeStyles(){const root=document.body.dataset.root||'';if(document.querySelector('link[data-qs-narrative]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=root+'css/narrative.css';l.dataset.qsNarrative='1';document.head.appendChild(l)}
  function loadSupport(){const root=document.body.dataset.root||'';if(!document.querySelector('link[data-qs-support]')){const l=document.createElement('link');l.rel='stylesheet';l.href=root+'css/support.css';l.dataset.qsSupport='1';document.head.appendChild(l)}if(!document.querySelector('script[data-qs-support]')){const s=document.createElement('script');s.src=root+'js/support.js';s.dataset.qsSupport='1';document.body.appendChild(s)}}
  function loadMemoStyles(){const root=document.body.dataset.root||'';if(document.querySelector('link[data-qs-memo]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=root+'css/memo.css';l.dataset.qsMemo='1';document.head.appendChild(l)}
  function setupMemoTools(){
    if(!window.QishanState)return;
    const root=document.body.dataset.root||'',memoHref=root+'memo/index.html';
    const info=document.querySelector('.footer-grid>div:last-child p');
    if(info&&!info.querySelector('[data-memo-footer]')){const br=document.createElement('br'),a=document.createElement('a');a.href=memoHref;a.textContent='看房备忘';a.dataset.memoFooter='1';info.append(br,a)}
    const p=location.pathname.replace(/\/+$/,'/');
    if(p.endsWith('/feedback/index.html')||p.endsWith('/feedback/')){const hint=document.querySelector('.sidebar .box:last-child p');if(hint&&!hint.querySelector('[data-memo-feedback]')){hint.append(document.createElement('br'));const a=document.createElement('a');a.href=memoHref;a.textContent='查看看房备忘';a.dataset.memoFeedback='1';hint.append(a)}}
    const configs=[
      {match:x=>x.endsWith('/homes/a-1403.html')||x.endsWith('/homes/a-1403/'),id:'page-a1403',category:'房子本身',text:'A栋1403：¥4,980/月，52㎡，两室一厅，东向，14/17层；厨卫排风接公共竖井。现场还要确认窗体、水电表、固定设备与交付家具。'},
      {match:x=>x.endsWith('/plans/index.html')||x.endsWith('/plans/'),id:'page-plans-14f',category:'房子本身',text:'A栋14层当前导览只标1401、1402、1403、1405、1406五个住宅单元；公开导览与旧备案图用途不同，核对历史边界要再看2018旧改公开摘录。'},
      {match:x=>x.endsWith('/notices/2026-07.html')||x.endsWith('/notices/2026-07/'),id:'page-notice-2026-07',category:'物业与楼栋',text:'A栋14层近期有夜间低频异响。7月16日已完成公共排风段清洁与部分止回组件调整，但个别支管仍保留观察，若持续倒灌或异味建议继续报修。'}
    ];
    const cfg=configs.find(x=>x.match(p));if(!cfg)return;
    const article=document.querySelector('.article');if(!article||article.querySelector('[data-memo-capture]'))return;
    const box=document.createElement('div');box.className='memo-capture';box.dataset.memoCapture='1';
    const saved=QishanState.hasMemo(cfg.id);
    box.innerHTML='<div><b>看房备忘</b><small>把这一页的关键信息留在本机，之后可以一起对照。</small></div><div class="memo-capture-actions"><button class="btn secondary" type="button" data-memo-save></button><a class="text-link" data-memo-view>查看备忘</a></div>';
    const btn=box.querySelector('[data-memo-save]'),view=box.querySelector('[data-memo-view]');view.href=memoHref;
    const sync=()=>{const yes=QishanState.hasMemo(cfg.id);btn.textContent=yes?'已记入备忘':'记到看房备忘';btn.disabled=yes;btn.setAttribute('aria-pressed',String(yes))};
    btn.addEventListener('click',()=>{QishanState.memoAdd({id:cfg.id,text:cfg.text,category:cfg.category,sourcePath:location.pathname,sourceTitle:document.body.dataset.pageTitle||document.title,at:Date.now()});sync()});
    sync();const update=article.querySelector('.update-line');article.insertBefore(box,update||null);
  }
  document.addEventListener('DOMContentLoaded',()=>{if(window.QishanState&&!/\/memo\//.test(location.pathname))QishanState.visit(location.pathname,document.body.dataset.pageTitle||document.title);setupSharedLinkIntro();setupMenu();setupLightbox();setupDocs();setupClear();setupActiveNav();setupImageLoading();loadMemoStyles();setupMemoTools();loadNarrativeStyles();loadSupport()});
})();
