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
  function setupClear(){document.querySelectorAll('[data-clear-state]').forEach(b=>b.addEventListener('click',()=>{if(confirm('仅清除本浏览器保存的最近浏览、搜索与给许唯的回复。继续吗？')){QishanState&&QishanState.clear();location.reload()}}))}
  function setupActiveNav(){const here=location.pathname.replace(/\/+$/,'/');let root;try{root=new URL((document.body.dataset.root||'')+'index.html',document.baseURI||location.href).pathname}catch(e){return}document.querySelectorAll('.nav a').forEach(a=>{try{const p=new URL(a.href,document.baseURI||location.href).pathname.replace(/\/+$/,'/');const active=p===root?(here===root||here===root.replace(/index\.html$/,'')):here.startsWith(p.replace(/index\.html$/,''));if(active)a.setAttribute('aria-current','page')}catch(e){}})}
  function setupImageLoading(){document.querySelectorAll('img:not(.hero-media img)').forEach(img=>{if(!img.hasAttribute('loading'))img.loading='lazy';img.decoding='async'})}
  function loadNarrativeStyles(){const root=document.body.dataset.root||'';if(document.querySelector('link[data-qs-narrative]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=root+'css/narrative.css';l.dataset.qsNarrative='1';document.head.appendChild(l)}
  function loadSupport(){const root=document.body.dataset.root||'';if(!document.querySelector('link[data-qs-support]')){const l=document.createElement('link');l.rel='stylesheet';l.href=root+'css/support.css';l.dataset.qsSupport='1';document.head.appendChild(l)}if(!document.querySelector('script[data-qs-support]')){const s=document.createElement('script');s.src=root+'js/support.js';s.dataset.qsSupport='1';document.body.appendChild(s)}}
  document.addEventListener('DOMContentLoaded',()=>{if(window.QishanState)QishanState.visit(location.pathname,document.body.dataset.pageTitle||document.title);setupSharedLinkIntro();setupMenu();setupLightbox();setupDocs();setupClear();setupActiveNav();setupImageLoading();loadNarrativeStyles();loadSupport()});
})();
