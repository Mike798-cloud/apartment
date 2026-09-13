(function(){
  'use strict';
  const KEY='qishan_site_state_v3';
  const LEGACY_KEY='qishan_site_state_v2';
  const blank=()=>({version:3,visitedPages:[],searchHistory:[],openedDocs:[],ticketQueries:[],memos:[],finalChoice:null,ending:null});
  function normalizeMemo(x){
    if(!x||typeof x!=='object')return null;
    const text=typeof x.text==='string'?x.text.trim().slice(0,500):'';
    if(!text)return null;
    return {
      id:typeof x.id==='string'&&x.id.trim()?x.id.trim().slice(0,120):('memo-'+Date.now()),
      text,
      category:typeof x.category==='string'&&x.category.trim()?x.category.trim().slice(0,40):'还想现场确认',
      sourcePath:typeof x.sourcePath==='string'?x.sourcePath.slice(0,300):'',
      sourceTitle:typeof x.sourceTitle==='string'?x.sourceTitle.slice(0,120):'',
      at:Number.isFinite(x.at)?x.at:Date.now()
    };
  }
  function normalize(raw){
    const b=blank(); if(!raw||typeof raw!=='object')return b;
    b.visitedPages=Array.isArray(raw.visitedPages)?raw.visitedPages.filter(x=>x&&typeof x.path==='string').slice(-80):[];
    b.searchHistory=Array.isArray(raw.searchHistory)?raw.searchHistory.filter(x=>x&&typeof x.q==='string').slice(-30):[];
    b.openedDocs=Array.isArray(raw.openedDocs)?raw.openedDocs.filter(x=>typeof x==='string').slice(-30):[];
    b.ticketQueries=Array.isArray(raw.ticketQueries)?raw.ticketQueries.filter(x=>x&&typeof x.q==='string').map(x=>({q:x.q.slice(0,120),ids:Array.isArray(x.ids)?x.ids.filter(id=>typeof id==='string').slice(0,20):[],at:Number.isFinite(x.at)?x.at:Date.now()})).slice(-30):[];
    b.memos=Array.isArray(raw.memos)?raw.memos.map(normalizeMemo).filter(Boolean).slice(-60):[];
    if(raw.finalChoice&&typeof raw.finalChoice==='object'){
      const c=raw.finalChoice;
      b.finalChoice={
        action:typeof c.action==='string'?c.action:'',
        reply:typeof c.reply==='string'?c.reply.slice(0,500):'',
        note:typeof c.note==='string'?c.note.slice(0,180):'',
        submittedAt:Number.isFinite(c.submittedAt)?c.submittedAt:Date.now()
      };
    }else if(raw.finalClaims&&typeof raw.finalClaims==='object'&&typeof raw.finalClaims.action==='string'){
      const legacyAction=raw.finalClaims.action==='family'?'contact':raw.finalClaims.action;
      b.finalChoice={action:legacyAction,reply:'',note:'',submittedAt:Number(raw.finalClaims.submittedAt)||Date.now()};
    }
    b.ending=typeof raw.ending==='string'?raw.ending:null;
    return b;
  }
  function readRaw(){
    try{
      const current=localStorage.getItem(KEY);
      if(current)return JSON.parse(current);
      const legacy=localStorage.getItem(LEGACY_KEY);
      if(legacy)return JSON.parse(legacy);
    }catch(e){}
    return {};
  }
  function load(){return normalize(readRaw())}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(normalize(s)))}catch(e){}}
  function canonical(path){try{return new URL(path,location.href).pathname.replace(/\/+$/,'/')||'/'}catch(e){return path}}
  const api={
    get:load,
    patch(obj){const s=load();Object.assign(s,obj||{});save(s);return s},
    visit(path,title){const s=load(),p=canonical(path||location.pathname);s.visitedPages=s.visitedPages.filter(x=>x.path!==p);s.visitedPages.push({path:p,title:title||document.title.replace(/\s*-\s*栖山公寓$/,''),at:Date.now()});s.visitedPages=s.visitedPages.slice(-80);save(s)},
    search(q){q=(q||'').trim();if(!q)return;const s=load();s.searchHistory=s.searchHistory.filter(x=>x.q!==q);s.searchHistory.push({q,at:Date.now()});s.searchHistory=s.searchHistory.slice(-30);save(s)},
    doc(name){if(!name)return;const s=load();s.openedDocs=s.openedDocs.filter(x=>x!==name);s.openedDocs.push(name);s.openedDocs=s.openedDocs.slice(-30);save(s)},
    ticketSearch(q,ids){q=(q||'').trim();if(!q)return;const s=load();s.ticketQueries=s.ticketQueries.filter(x=>x.q!==q);s.ticketQueries.push({q:q.slice(0,120),ids:Array.isArray(ids)?ids.filter(x=>typeof x==='string').slice(0,20):[],at:Date.now()});s.ticketQueries=s.ticketQueries.slice(-30);save(s)},
    assessEvidence(){
      const s=load(),paths=(s.visitedPages||[]).map(x=>x.path||''),docs=s.openedDocs||[],tq=s.ticketQueries||[];
      const seen=frag=>paths.some(p=>p.includes(frag));
      const hasDoc=name=>docs.includes(name);
      const matched=id=>tq.some(x=>(x.ids||[]).includes(id));
      const facts={
        currentRoom:seen('/homes/a-1403'),
        floorPlan:seen('/plans/')||hasDoc('fire-evacuation-a14')||hasDoc('renovation-2018-summary'),
        currentExhaust:seen('/notices/2026-07')||matched('QS260714-A1403'),
        oldRoom:seen('/homes/archive/a-1404'),
        historicalExhaust:seen('/notices/2023-12-17')||matched('QS231204-1401')||matched('QS231209-1403')||matched('QS231215-1404')||matched('QS231217-1405')||matched('QS231218-A14')||matched('QS231220-A14'),
        incident:seen('/news/2023-care-note')||matched('QS231218-A14'),
        residentIdentity:seen('/news/2023-summer-window'),
        archiveContact:seen('/news/2024-archive-thanks'),
        visitorLink:seen('/service/parking')
      };
      return {facts,options:{
        avoid:{allowed:facts.currentRoom&&(facts.floorPlan||facts.currentExhaust),reason:'至少先看过 1403 房源，并核对一项户型或物业记录。'},
        verify:{allowed:facts.currentRoom&&facts.currentExhaust,reason:'还缺少能说明 1403 现况与楼栋排风问题的公开记录。'},
        contact:{allowed:facts.currentRoom&&facts.archiveContact&&facts.residentIdentity&&(facts.oldRoom||facts.incident||facts.visitorLink),reason:'目前还没有足够信息确认该联系谁，以及对方为什么与旧资料有关。'},
        public:{allowed:facts.currentRoom&&facts.floorPlan&&facts.historicalExhaust&&facts.oldRoom&&facts.incident&&facts.residentIdentity,reason:'现有材料还不足以同时支撑房况、楼栋系统与旧记录之间的公开判断。'}
      }};
    },
    progress(){
      const s=load(),e=api.assessEvidence(),f=e.facts||{},o=e.options||{};
      let percent=0,summary='还没有形成有效的看房记录。',stage='尚未开始';
      if(f.currentRoom){percent=14;stage='核对房源';summary='已经开始核对 A栋1403 的公开房源信息。'}
      if(f.currentRoom&&(f.floorPlan||f.currentExhaust)){percent=28;stage='核对现况';summary='房源现况与至少一项户型或物业资料已经交叉核对。'}
      if(f.oldRoom||(f.currentRoom&&f.floorPlan&&f.currentExhaust)){percent=44;stage='翻查旧资料';summary='调查已经进入历史房源、旧改或楼层结构资料。'}
      if(f.historicalExhaust||f.incident){percent=60;stage='核对历史记录';summary='已经核对到与 A栋高区有关的历史物业或事件记录。'}
      if(f.residentIdentity){percent=74;stage='确认人物线索';summary='旧记录中的住户身份线索已经能够相互印证。'}
      if(f.residentIdentity&&(f.archiveContact||f.visitorLink)){percent=86;stage='交叉关联';summary='人物与旧资料之间已经出现可交叉核对的关联。'}
      if((o.contact&&o.contact.allowed)||(o.public&&o.public.allowed)){percent=94;stage='形成判断';summary='主要公开材料已经能够支撑较完整的判断。'}
      const endingByAction={avoid:'avoid',verify:'verify',contact:'archive',public:'public'};
      const action=s.finalChoice&&s.finalChoice.action;
      const validChoice=!!(action&&endingByAction[action]===s.ending&&o[action]&&o[action].allowed);
      if(validChoice){percent=100;stage='调查完成';summary='已经回复许唯，本次调查完成。'}
      return {percent,stage,summary,complete:percent===100};
    },
    memoAdd(item){const row=normalizeMemo(item);if(!row)return null;const s=load();s.memos=s.memos.filter(x=>x.id!==row.id);s.memos.push(row);s.memos=s.memos.slice(-60);save(s);return row},
    memoRemove(id){if(!id)return;const s=load();s.memos=s.memos.filter(x=>x.id!==id);save(s)},
    memoClear(){const s=load();s.memos=[];save(s)},
    hasMemo(id){return !!id&&load().memos.some(x=>x.id===id)},
    hasVisited(fragment){return load().visitedPages.some(x=>x.path.includes(fragment))},
    clear(){try{localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY)}catch(e){}}
  };
  window.QishanState=api;
})();
