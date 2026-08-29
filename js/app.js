(function(){
  'use strict';

  const READING_KEYS={
    '首页':['136 套住宅','A栋 1403 · 52㎡ 两室一厅','2024 年完成格局优化'],
    '找房':['A栋公开租赁资料对应 68 套','B栋对应 69 套'],
    'A栋 1403':['A栋 14 层 / 共17层','建筑使用面积约 52㎡','2024 年完成格局优化','厨卫排风接入楼栋公共竖井','A栋高区公共排风维护'],
    '户型与楼层导览':['A栋 14 层 · 当前导览','当前住户导览示意 · 2024-06-10 更新','个别楼层可能存在尾号不连续的情况','备案图会保留设备/储藏等非住宅空间'],
    '失物招领':['LF231103 · 2023-11-03','A栋 1404 门前','透明伞面，深灰弯柄，绿色束带'],
    '2021 邻里摄影日':['社区活动 · 2021-05-22','A栋活动合影 · 原图经住户授权公开','A栋高层走廊'],
    '2022 冬季公共区域保洁':['社区维护 · 2022-12-09','A栋高层走廊 · 保洁工作记录','公共镜面'],
    '六月窗景 · 住户作品选':['住户作品 · 2023-06-24','《高架尽头》 · 周芷珩 · A栋住户','作品拍摄于 2023 年 6 月'],
    '停车与访客':['2023-09-16','2023-10-03','2023-10-28','2023-11-19','周岚','A栋14层','尾号 8216'],
    '维修工单公开查询':['2023-12-04','厨房排风反味，晚间更明显','2023-12-09','卫生间夜间持续低频嗡鸣','2023-12-14','早起偶有头晕','2023-12-15','排风偶有倒灌','周小姐白天不在，晚上回来晚，请短信联系','2023-12-17 21:30','排风倒灌再次出现，夜间异味明显','2023-12-18 02:18','公共区域紧急入户协助与通风处理'],
    'A栋高区夜间排风临时检查':['设施维护 · 2023-12-17 22:05 发布','12 月 17 日 22:30 至 12 月 18 日 01:30','21:30 前已登记的高区排风问题','罗启明 维修主管'],
    '社区关怀服务简报 · 2023年12月':['12 月 18 日凌晨','A栋一位年轻住户','不符合公寓长期租住规范的燃气设备使用痕迹','本页面内容最后更新于 2023-12-20'],
    'A栋 1404 · 历史页面':['2023-12-19 下架','历史图片 · 拍摄时间未保留 · 原图已压缩归档','约 18㎡','运营内部短租登记','窗外能看到高架尽头的灯','留言时间：2023-08'],
    '旧宿舍更新完成':['社区更新 · 2018-10-02','2018 年夏 · 外立面与公共管线施工阶段','公共排风','衡达工程 · 现场工程协调冯启元','公开文件署名“冯工”'],
    '关于栖山':['2017 年由澄川置业收购并启动更新','2018 年以长期租赁社区形式运营','2024-02','A栋部分历史空间完成并户与资产资料调整'],
    '隐私与网站信息':['更新时间并不完全一致','停止招租的房源可能进入历史归档','活动照片可能因授权变化被移除或替换','多数内容页底部显示“最后更新日期”','历史新闻通常保留原发布日期，并另行记录页面维护日期'],
    '下载中心':['A栋14层消防与疏散备案摘录','2018 年公开备案摘录','2018 栖山公寓旧改工程公开摘要','住户设备与公共排风说明'],
    'A栋14层公共排风维护':['A栋14层','公共排风竖井','1403、1405','个别支管保留后续观察','持续倒灌或异味']
  };
  function storageGet(store,key){try{return store.getItem(key)}catch(e){return null}}
  function storageSet(store,key,val){try{store.setItem(key,val)}catch(e){}}
  function setupSharedLinkIntro(){
    const box=document.querySelector('[data-shared-link-intro]');if(!box)return;
    if(storageGet(sessionStorage,'qs_shared_intro_v14')==='1'){box.remove();return}
    box.hidden=false;box.setAttribute('aria-hidden','false');document.documentElement.classList.add('intro-open');
    const remember=()=>{storageSet(sessionStorage,'qs_shared_intro_v14','1');document.documentElement.classList.remove('intro-open')};
    const enter=box.querySelector('[data-shared-enter]'),close=box.querySelector('[data-shared-close]');
    if(enter)enter.addEventListener('click',remember);
    if(close)close.addEventListener('click',()=>{remember();box.remove();document.querySelector('#main a, #main button')?.focus()});
    box.addEventListener('keydown',e=>{if(e.key==='Escape'&&close){e.preventDefault();close.click()}});
    setTimeout(()=>enter?.focus(),30);
  }
  function shouldSkipText(node){const p=node.parentElement;return !p||!p.closest('script,style,noscript,strong,em,a,button,input,textarea,select,option,.reading-guide,.shared-link-intro')}
  function markPhrase(root,phrase){
    let guard=0;
    while(guard++<80){
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){return shouldSkipText(n)&&n.nodeValue.includes(phrase)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});const n=walker.nextNode();if(!n)break;
      const text=n.nodeValue,idx=text.indexOf(phrase),frag=document.createDocumentFragment();
      if(idx)frag.append(document.createTextNode(text.slice(0,idx)));
      const strong=document.createElement('strong'),em=document.createElement('em');strong.className='reading-key';em.textContent=phrase;strong.appendChild(em);frag.append(strong);
      if(idx+phrase.length<text.length)frag.append(document.createTextNode(text.slice(idx+phrase.length)));
      n.parentNode.replaceChild(frag,n);
    }
  }
  function setupReadingMarks(){
    const title=document.body.dataset.pageTitle||'',phrases=(READING_KEYS[title]||[]).slice().sort((a,b)=>b.length-a.length);if(!phrases.length)return;
    const roots=[document.querySelector('.page-title'),document.querySelector('#main')].filter(Boolean);let observer=null,pending=false;
    const run=()=>{pending=false;if(observer)observer.disconnect();roots.forEach(r=>phrases.forEach(p=>markPhrase(r,p)));if(observer&&roots[1])observer.observe(roots[1],{childList:true,subtree:true})};
    observer=new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(run)}});run();
  }
  function setupReadingGuide(){
    if(storageGet(sessionStorage,'qs_reading_guide_v14')==='1')return;const header=document.querySelector('.site-header');if(!header)return;
    const bar=document.createElement('div');bar.className='reading-guide';bar.innerHTML='<div class="wrap"><p><strong><em>阅读辅助已开启：</em></strong> 粗斜体表示值得留意的客观信息（房号、日期、地点、维护描述或图片说明），不代表答案。</p><button type="button" aria-label="关闭阅读辅助说明">知道了</button></div>';
    header.insertAdjacentElement('afterend',bar);bar.querySelector('button').addEventListener('click',()=>{storageSet(sessionStorage,'qs_reading_guide_v14','1');bar.remove()});
  }

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
  function setupActiveNav(){const here=location.pathname.replace(/\/+$/,'/');let root;try{root=new URL((document.body.dataset.root||'')+'index.html',document.baseURI||location.href).pathname}catch(e){return}document.querySelectorAll('.nav a').forEach(a=>{try{const p=new URL(a.href,document.baseURI||location.href).pathname.replace(/\/+$/,'/');const active=p===root?(here===root||here===root.replace(/index\.html$/,'')):here.startsWith(p.replace(/index\.html$/,''));if(active)a.setAttribute('aria-current','page')}catch(e){}})}
  function setupImageLoading(){document.querySelectorAll('img:not(.hero-media img)').forEach(img=>{if(!img.hasAttribute('loading'))img.loading='lazy';img.decoding='async'})}
  function loadSupport(){const root=document.body.dataset.root||'';if(!document.querySelector('link[data-qs-support]')){const l=document.createElement('link');l.rel='stylesheet';l.href=root+'css/support.css';l.dataset.qsSupport='1';document.head.appendChild(l)}if(!document.querySelector('script[data-qs-support]')){const s=document.createElement('script');s.src=root+'js/support.js';s.dataset.qsSupport='1';document.body.appendChild(s)}}
  document.addEventListener('DOMContentLoaded',()=>{if(window.QishanState)QishanState.visit(location.pathname,document.body.dataset.pageTitle||document.title);setupSharedLinkIntro();setupMenu();setupLightbox();setupDocs();setupClear();setupActiveNav();setupImageLoading();setupReadingMarks();setupReadingGuide();loadSupport()});
})();
