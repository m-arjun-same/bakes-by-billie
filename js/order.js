/* Cake Room — 2D canvas compositor: cake photo x flavour tint x iced name. */
(function(){
"use strict";
const $=s=>document.querySelector(s);
const state={bake:'Custom cake',flavour:'Triple Chocolate',colour:'#5A3220',name:'',size:'8" — serves ~20',collect:'Cake Shed — 57 Wemyss Street, Rosyth',date:''};
function pick(id,key,cb){ const box=$(id); box.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
  box.querySelectorAll('button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); state[key]=b.dataset.v; if(cb) cb(b); render(); }); }
pick('#optBake','bake'); pick('#optSize','size'); pick('#optCollect','collect');
pick('#optFlavour','flavour',b=>{ state.colour=b.dataset.c||state.colour; });
$('#kitName').addEventListener('input',e=>{ state.name=e.target.value; render(); });
$('#kitDate').addEventListener('date',()=>{});
$('#kitDate').addEventListener('change',e=>{ state.date=e.target.value; render(); });

const cv=$('#kitCanvas'), ctx=cv.getContext('2d');
const base=new Image(); base.src='assets/img/cake-gold.webp'; base.onload=render;
function initials(name){ const w=name.trim().split(/\s+/).filter(Boolean); if(!w.length) return 'X';
  return (w.length>1? w[0][0]+w[w.length-1][0] : w[0][0]).toUpperCase(); }
function render(){
  if(base.complete){ ctx.clearRect(0,0,cv.width,cv.height); ctx.drawImage(base,0,0,cv.width,cv.height);
    /* flavour tint wash over the cake body */
    ctx.save(); ctx.globalCompositeOperation='multiply'; ctx.globalAlpha=.13; ctx.fillStyle=state.colour;
    ctx.beginPath(); ctx.ellipse(cv.width*.47,cv.height*.55,cv.width*.30,cv.height*.24,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(cv.width/2,cv.height*.52); ctx.rotate(-.03); ctx.textAlign='center';
    ctx.fillStyle='#FF3E8A'; ctx.shadowColor='rgba(255,255,255,.65)'; ctx.shadowBlur=6;
    ctx.font='700 92px Caveat, cursive'; ctx.fillText(state.name.trim()||'Your name',0,0);
    ctx.font='500 34px "Geist Mono", monospace'; ctx.fillStyle='rgba(33,26,18,.75)';
    ctx.fillText(initials(state.name||'Your Name'),0,64); ctx.restore();
  }
  const lines=[`BAKE — ${state.bake}`,`FLAVOUR — ${state.flavour}`,state.name?`ICED — ${state.name} (${initials(state.name)})`:null,
    `SIZE — ${state.size}`,`COLLECT — ${state.collect}`,state.date?`DATE — ${state.date}`:'DATE — to confirm',
    `PRICE — confirmed by Billie on enquiry`].filter(Boolean);
  $('#kitSummary').textContent=lines.join('\n');
  $('#kitSend').href=`mailto:billie.king@sky.com?subject=Bakes by Billie order&body=${encodeURIComponent('Hi Billie! My order:\n'+lines.join('\n'))}`;
}
render();
})();
