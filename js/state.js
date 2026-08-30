(function(){
  'use strict';
  const KEY='qishan_site_state_v3';
  const LEGACY_KEY='qishan_site_state_v2';
  const blank=()=>({version:3,visitedPages:[],searchHistory:[],openedDocs:[],finalChoice:null,ending:null});
  function normalize(raw){
    const b=blank(); if(!raw||typeof raw!=='object')return b;
    b.visitedPages=Array.isArray(raw.visitedPages)?raw.visitedPages.filter(x=>x&&typeof x.path==='string').slice(-80):[];
    b.searchHistory=Array.isArray(raw.searchHistory)?raw.searchHistory.filter(x=>x&&typeof x.q==='string').slice(-30):[];
    b.openedDocs=Array.isArray(raw.openedDocs)?raw.openedDocs.filter(x=>typeof x==='string').slice(-30):[];
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
    hasVisited(fragment){return load().visitedPages.some(x=>x.path.includes(fragment))},
    clear(){try{localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY)}catch(e){}}
  };
  window.QishanState=api;
})();
