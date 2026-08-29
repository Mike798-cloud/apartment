(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded',()=>{const s=QishanState?QishanState.get():{},box=document.querySelector('#ending-box');if(!box)return;const e=s.ending||'avoid';const data={
    avoid:{eyebrow:'仅发给许唯',title:'先避开这套房',body:'许唯最后没有签下 1403。两周后，栖山公寓的房源页面照常更新，A栋14层仍按当前五户展示。你保留了这份备忘，没有继续把旧资料向外扩散。',tail:'安全地离开，有时已经足够。只是那些互相对不上的旧记录仍留在网站里。'},
    public:{eyebrow:'公开材料',title:'材料开始被转载',body:'公开资料很快被转发到本地论坛和媒体渠道。物业与外包方随后接受进一步核查，历史空间的改造与事故责任进入正式讨论；与此同时，周芷珩的住户作品、留言和生活细节也被反复转载，周岚拒绝了公开采访。',tail:'事实被看见了，但被看见的也包括一个人的私生活。'},
    archive:{eyebrow:'先交给授权联系人',title:'资料被留在更合适的人手里',body:'周岚确认收到公开材料，并要求先由家属与代理人员整理。数周后，物业发布 A栋高区排风复检与部分房源暂停签约通知，1403 暂停招租，旧事故的责任认定重新启动。',tail:'有些真相不需要先成为热闹，才算被认真对待。'}
  };const r=data[e];box.innerHTML=`<div class="eyebrow">${r.eyebrow}</div><h2>${r.title}</h2><p>${r.body}</p><p class="ending-tail">${r.tail}</p>`})
})();
