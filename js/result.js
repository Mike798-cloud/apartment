(function(){
  'use strict';
  const outcomes={
    avoid:{eyebrow:'你回复：先别签',title:'许唯换了一套房',body:'许唯当晚就回绝了 1403。几天后，她把新的房源链接发给你，抱怨自己又得重新比较通勤和采光。栖山公寓的页面仍照常更新，A栋14层继续按当前五户展示。',tail:'你没有解决那些旧记录里的矛盾，但至少没有让朋友把生活押在一个解释不清的地方。'},
    verify:{eyebrow:'你回复：先要书面说明',title:'签约被暂时搁置',body:'许唯把你的要求转给租赁顾问。最初的回复只有一句“历史问题已处理”，第二天物业补发了一份高区排风复检说明，并表示 1403 需要再次确认支管状态后才能安排签约。',tail:'没有人承认真正发生过什么，但一份原本不会出现的说明，因为你的追问被写了出来。'},
    public:{eyebrow:'你回复：公开核对',title:'材料开始被转载',body:'你把公开页面按日期整理后发到了本地论坛。物业与外包方随后接受进一步核查，旧空间改造与事故责任进入讨论；与此同时，周芷珩的住户作品、留言和生活细节也被反复转载。',tail:'事实被更多人看见了，被看见的也包括一个人的私生活。'},
    archive:{eyebrow:'你回复：先交给相关的人',title:'资料先离开了公共视线',body:'你把能公开查到的页面整理后发给了与旧资料有关的联系人。数周后，物业发布 A栋高区排风复检与部分房源暂停签约通知，1403 暂停招租，旧事故的责任认定重新启动。',tail:'有些事情没有先成为热闹，但仍然有人开始认真处理它。'}
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const box=document.querySelector('#ending-box');if(!box)return;
    const s=window.QishanState?QishanState.get():{};
    box.innerHTML='';
    if(!s.ending||!outcomes[s.ending]){
      const h=document.createElement('h2');h.textContent='还没有发送回复';
      const p=document.createElement('p');p.textContent='先回到上一页，告诉许唯你现在会怎么处理 1403。';
      box.append(h,p);return;
    }
    const r=outcomes[s.ending];
    const eyebrow=document.createElement('div');eyebrow.className='eyebrow';eyebrow.textContent=r.eyebrow;
    const h=document.createElement('h2');h.textContent=r.title;
    const p=document.createElement('p');p.textContent=r.body;
    const tail=document.createElement('p');tail.className='ending-tail';tail.textContent=r.tail;
    box.append(eyebrow,h,p,tail);
    if(s.finalChoice&&s.finalChoice.reply){
      const quote=document.createElement('div');quote.className='sent-reply';
      const label=document.createElement('span');label.textContent='你发给许唯';
      const text=document.createElement('p');text.textContent=s.finalChoice.reply;
      quote.append(label,text);box.prepend(quote);
    }
  });
})();
