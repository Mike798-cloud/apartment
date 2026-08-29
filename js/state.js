(function(){
  'use strict';
  const KEY='qishan_site_state_v2';
  const blank=()=>({version:2,visitedPages:[],searchHistory:[],openedDocs:[],finalClaims:null,ending:null});
  function normalize(raw){
    const b=blank(); if(!raw||typeof raw!=='object')return b;
    b.visitedPages=Array.isArray(raw.visitedPages)?raw.visitedPages.filter(x=>x&&typeof x.path==='string').slice(-80):[];
    b.searchHistory=Array.isArray(raw.searchHistory)?raw.searchHistory.filter(x=>x&&typeof x.q==='string').slice(-30):[];
    b.openedDocs=Array.isArray(raw.openedDocs)?raw.openedDocs.filter(x=>typeof x==='string').slice(-30):[];
    b.finalClaims=raw.finalClaims&&typeof raw.finalClaims==='object'?raw.finalClaims:null;
    b.ending=typeof raw.ending==='string'?raw.ending:null;
    return b;
  }
  function load(){try{return normalize(JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){return blank()}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(normalize(s)))}catch(e){}}
  function canonical(path){try{return new URL(path,location.href).pathname.replace(/\/+$/,'/')||'/'}catch(e){return path}}
  const api={
    get:load,
    patch(obj){const s=load();Object.assign(s,obj||{});save(s);return s},
    visit(path,title){const s=load(),p=canonical(path||location.pathname);s.visitedPages=s.visitedPages.filter(x=>x.path!==p);s.visitedPages.push({path:p,title:title||document.title.replace(/\s*-\s*栖山公寓$/,''),at:Date.now()});s.visitedPages=s.visitedPages.slice(-80);save(s)},
    search(q){q=(q||'').trim();if(!q)return;const s=load();s.searchHistory=s.searchHistory.filter(x=>x.q!==q);s.searchHistory.push({q,at:Date.now()});s.searchHistory=s.searchHistory.slice(-30);save(s)},
    doc(name){if(!name)return;const s=load();s.openedDocs=s.openedDocs.filter(x=>x!==name);s.openedDocs.push(name);s.openedDocs=s.openedDocs.slice(-30);save(s)},
    hasVisited(fragment){return load().visitedPages.some(x=>x.path.includes(fragment))},
    clear(){try{localStorage.removeItem(KEY)}catch(e){}}
  };
  window.QishanState=api;
})();
