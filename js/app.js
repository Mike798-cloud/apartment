(function(){
  'use strict';
  function setupMenu(){const b=document.querySelector('.menu-btn'),n=document.querySelector('.nav');if(!b||!n)return;b.addEventListener('click',()=>{const open=n.classList.toggle('open');b.setAttribute('aria-expanded',String(open));b.textContent=open?'关闭':'菜单'});document.addEventListener('click',e=>{if(innerWidth<=900&&n.classList.contains('open')&&!n.contains(e.target)&&e.target!==b){n.classList.remove('open');b.setAttribute('aria-expanded','false');b.textContent='菜单'}})}
  function setupLightbox(){
    let lb=document.querySelector('.lightbox');
    if(!lb){lb=document.createElement('div');lb.className='lightbox';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','图片放大查看');lb.innerHTML='<div class="lightbox-toolbar"><button type="button" data-zoomout aria-label="缩小">−</button><span class="lightbox-zoom" aria-live="polite">100%</span><button type="button" data-zoomin aria-label="放大">＋</button><button type="button" data-close aria-label="关闭">×</button></div><div class="lightbox-stage"><img alt=""></div>';document.body.appendChild(lb)}
    const img=lb.querySelector('img'),stage=lb.querySelector('.lightbox-stage'),readout=lb.querySelector('.lightbox-zoom');let zoom=1,lastFocus=null,pinchStart=0,pinchZoom=1;
    function setZoom(v){zoom=Math.max(.6,Math.min(4,v));img.style.transform=`scale(${zoom})`;if(readout)readout.textContent=Math.round(zoom*100)+'%'}
    function open(src,alt){lastFocus=document.activeElement;img.src=src;img.alt=alt||'';setZoom(1);lb.classList.add('open');document.documentElement.classList.add('lightbox-open');lb.querySelector('[data-close]').focus()}
    function close(){lb.classList.remove('open');document.documentElement.classList.remove('lightbox-open');img.src='';if(lastFocus&&lastFocus.focus)lastFocus.focus()}
    lb.querySelector('[data-close]').addEventListener('click',close);lb.querySelector('[data-zoomin]').addEventListener('click',()=>setZoom(zoom+.25));lb.querySelector('[data-zoomout]').addEventListener('click',()=>setZoom(zoom-.25));img.addEventListener('dblclick',()=>setZoom(zoom>1?1:1.9));stage.addEventListener('wheel',e=>{if(!lb.classList.contains('open'))return;e.preventDefault();setZoom(zoom+(e.deltaY<0?.18:-.18))},{passive:false});
    // 手机双指缩放；仍可单指滚动查看放大后的图纸/旧照片。
    stage.addEventListener('touchstart',e=>{if(e.touches.length===2){const [a,b]=e.touches;pinchStart=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);pinchZoom=zoom}},{passive:true});
    stage.addEventListener('touchmove',e=>{if(e.touches.length!==2||!pinchStart)return;const [a,b]=e.touches,dist=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);setZoom(pinchZoom*(dist/pinchStart));e.preventDefault()},{passive:false});
    stage.addEventListener('touchend',e=>{if(e.touches.length<2)pinchStart=0},{passive:true});
    lb.addEventListener('click',e=>{if(e.target===lb)close()});
    document.querySelectorAll('.image-viewer').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',(el.alt||'图片')+'，按回车放大');const run=()=>open(el.currentSrc||el.src,el.alt);el.addEventListener('click',run);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run()}})});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lb.classList.contains('open'))close()});
  }
  function setupDocs(){document.querySelectorAll('[data-doc]').forEach(a=>a.addEventListener('click',()=>window.QishanState&&QishanState.doc(a.dataset.doc)))}
  function setupClear(){document.querySelectorAll('[data-clear-state]').forEach(b=>b.addEventListener('click',()=>{if(confirm('仅清除本浏览器保存的最近浏览、搜索与看房备忘。继续吗？')){QishanState&&QishanState.clear();location.reload()}}))}
  function setupActiveNav(){const here=location.pathname.replace(/\/+$/,'/'),root=new URL((document.body.dataset.root||'')+'index.html',location.href).pathname;document.querySelectorAll('.nav a').forEach(a=>{try{const p=new URL(a.href,location.href).pathname.replace(/\/+$/,'/');const active=p===root?(here===root||here===root.replace(/index\.html$/,'')):here.startsWith(p.replace(/index\.html$/,''));if(active)a.setAttribute('aria-current','page')}catch(e){}})}
  function setupImageLoading(){document.querySelectorAll('img:not(.hero-media img)').forEach(img=>{if(!img.hasAttribute('loading'))img.loading='lazy';img.decoding='async'})}
  function loadSupport(){const root=document.body.dataset.root||'';if(!document.querySelector('link[data-qs-support]')){const l=document.createElement('link');l.rel='stylesheet';l.href=root+'css/support.css';l.dataset.qsSupport='1';document.head.appendChild(l)}if(!document.querySelector('script[data-qs-support]')){const s=document.createElement('script');s.src=root+'js/support.js';s.dataset.qsSupport='1';document.body.appendChild(s)}}
  document.addEventListener('DOMContentLoaded',()=>{if(window.QishanState)QishanState.visit(location.pathname,document.body.dataset.pageTitle||document.title);setupMenu();setupLightbox();setupDocs();setupClear();setupActiveNav();setupImageLoading();loadSupport()});
})();
