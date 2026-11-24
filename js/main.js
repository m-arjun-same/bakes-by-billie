/* Bakes by Billie — own-code build in the Infinity Socks UI system.
   Lenis + GSAP/ScrollTrigger spine, loader, journey frames, helix,
   pinned bakes, iced-name compositor, REC testimonials, finale, HUD. */
(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.registerPlugin(ScrollTrigger);

/* ---------- Lenis smooth scroll ---------- */
let lenis=null;
if(!reduced && window.Lenis){
  lenis=new Lenis({lerp:.09,smoothWheel:true});
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollToEl(el){ if(lenis) lenis.scrollTo(el,{duration:1.6,easing:t=>1-Math.pow(1-t,3)}); else el.scrollIntoView({behavior:'smooth'}); }
$$('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();scrollToEl($(a.getAttribute('href')));}));

/* ---------- Loader (progress + giant numeral window, 8s failsafe) ---------- */
const loader=$('#loader'), lNum=$('#loaderNum'), lPct=$('#loaderPct'), lBar=$('#loaderBar');
document.documentElement.classList.add('is-intro');
if(lenis) lenis.stop();
let lp=0, loaderDone=false;
setTimeout(()=>$('#loaderSkip').classList.add('show'),1200);
function finishLoader(){
  if(loaderDone) return; loaderDone=true;
  loader.classList.add('done');
  document.documentElement.classList.remove('is-intro');
  if(lenis) lenis.start();
  gsap.from('.h1-line',{yPercent:60,opacity:0,stagger:.12,duration:1,ease:'power1.out',delay:.15});
  gsap.from('.hero-copy',{y:30,opacity:0,duration:.8,delay:.75,ease:'power1.out'});
}
const heroPreload=new Image();
heroPreload.src='assets/img/hero.webp';
const lTick=setInterval(()=>{
  lp=Math.min(100, lp + (heroPreload.complete? 7:2) + Math.random()*4);
  lNum.textContent=Math.floor(lp); lPct.textContent=Math.floor(lp)+'%'; lBar.style.width=lp+'%';
  if(lp>=100){clearInterval(lTick); setTimeout(finishLoader,250);}
},90);
setTimeout(finishLoader,8000); /* failsafe */
$('#loaderSkip').addEventListener('click',finishLoader);

/* ---------- Hero parallax ---------- */
gsap.to('#heroImg',{scale:1.12,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:.5}});
gsap.to('.hero-h1',{yPercent:-18,opacity:.25,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:.5}});

/* ---------- Court: journey frame sequence + helix ---------- */
const frames=[]; let framesReady=0;
for(let i=1;i<=10;i++){ const im=new Image(); im.src=`assets/img/j${i}.webp`; im.onload=()=>framesReady++; frames.push(im); }
const cv=$('#journeyCanvas'), cx=cv.getContext('2d');
let curFrame=-1;
function drawFrame(f){
  f=Math.max(0,Math.min(9,Math.round(f)));
  if(f===curFrame) return; const im=frames[f]; if(!im||!im.complete) return; curFrame=f;
  const s=Math.max(cv.width/im.width, cv.height/im.height), w=im.width*s, h=im.height*s;
  cx.clearRect(0,0,cv.width,cv.height); cx.drawImage(im,(cv.width-w)/2,(cv.height-h)/2,w,h);
}
const helix=$('#helix');
ScrollTrigger.create({trigger:'#court',start:'top top',end:'bottom bottom',scrub:.6,
  onUpdate:st=>{
    drawFrame((st.progress**0.7)*9);
    if(helix) helix.style.transform=`rotateX(-8deg) rotateY(${st.progress*300}deg)`;
    const cap=$('.court-caption'); if(cap) cap.style.transform=`translateY(${(0.5-st.progress)*40}px)`;
  }});

/* ---------- Tech panels: quarter wipes ---------- */
$$('.tpanel').forEach((p,i)=>{
  gsap.fromTo(p,{clipPath:'inset(0 0 100% 0)',opacity:.25},{clipPath:'inset(0 0 0% 0)',opacity:1,ease:'none',
    scrollTrigger:{trigger:p,start:'top 92%',end:'top 45%',scrub:.5}});
});
/* transition rows sweep at the tech boundary */
const trx=$('#trx'); for(let i=0;i<14;i++) trx.appendChild(document.createElement('i'));
const trxTl=gsap.timeline({paused:true});
trxTl.to('#trx i',{scaleX:1,duration:.45,stagger:.035,ease:'power1.inOut'})
     .to('#trx i',{scaleX:0,duration:.45,stagger:.035,ease:'power1.inOut'},'+=0.08');
ScrollTrigger.create({trigger:'#tech',start:'top 65%',onEnter:()=>trxTl.restart(),onEnterBack:()=>trxTl.restart()});

/* ---------- Iced-for-you compositor ---------- */
const ic=$('#icedCanvas'), ictx=ic.getContext('2d');
const base=new Image(); base.src='assets/img/cake-gold.webp';
function initials(name){
  const w=name.trim().split(/\s+/).filter(Boolean);
  if(!w.length) return 'X';
  return (w.length>1? w[0][0]+w[w.length-1][0] : w[0][0]).toUpperCase();
}
function drawIced(){
  if(!base.complete) return;
  ictx.clearRect(0,0,ic.width,ic.height);
  ictx.drawImage(base,0,0,ic.width,ic.height);
  const name=($('#nameInput').value||'').trim();
  ictx.save();
  ictx.translate(ic.width/2, ic.height*0.52);
  ictx.rotate(-0.03);
  ictx.textAlign='center';
  ictx.fillStyle='#FF3E8A';
  ictx.shadowColor='rgba(255,255,255,.65)'; ictx.shadowBlur=6;
  ictx.font='700 92px Caveat, cursive';
  ictx.fillText(name||'Your name', 0, 0);
  ictx.font='500 34px "Geist Mono", monospace';
  ictx.fillStyle='rgba(33,26,18,.75)';
  ictx.fillText(initials(name||'Your Name'), 0, 64);
  ictx.restore();
  $('#initialsOut').textContent=initials(name||'Your Name');
}
base.onload=drawIced;
$('#nameInput').addEventListener('input',drawIced);
gsap.from('#icedCanvas',{rotate:3,scale:.94,ease:'none',scrollTrigger:{trigger:'#iced',start:'top bottom',end:'center center',scrub:.6}});

/* ---------- Testimonials: running timecodes + lightbox ---------- */
const tcStart=Date.now();
setInterval(()=>{
  const s=Math.floor((Date.now()-tcStart)/1000);
  const f=String(Math.floor(((Date.now()-tcStart)%1000)/33)).padStart(2,'0');
  const str=`00:${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}:${f}`;
  $$('[data-tc]').forEach(el=>el.textContent=str);
},66);
const LB={
  billie:{img:'assets/img/billie.webp',cap:'Billie — one person behind the mixing bowl, back at the sheds from 27 November.'},
  pass:{img:'assets/img/billie-pass.webp',cap:'Registered, insured and food-hygiene certified — five years of Bakes by Billie.'},
  murphy:{img:'assets/img/murphy.webp',cap:"Murphy — Club President. Free homemade biscuit for every dog who brings their human to the Rosyth shed."}
};
const lb=$('#lb');
function openLb(k){ const d=LB[k]; if(!d) return;
  $('#lbImg').src=d.img; $('#lbCap').textContent=d.cap; lb.classList.add('open'); lb.setAttribute('aria-hidden','false');
  if(lenis) lenis.stop(); setTimeout(()=>$('#lbClose').focus(),60); }
function closeLb(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); if(lenis) lenis.start(); }
$$('.ttl-card').forEach(c=>c.addEventListener('click',()=>openLb(c.dataset.lb)));
$('#lbClose').addEventListener('click',closeLb);
lb.addEventListener('click',e=>{ if(e.target===lb) closeLb(); });

/* ---------- Finale: bags tuck + float ---------- */
const finTl=gsap.timeline({scrollTrigger:{trigger:'#finale',start:'top top',end:'bottom bottom',scrub:.6}});
finTl.fromTo('.bag-a',{y:220,rotate:-10},{y:0,rotate:-3,ease:'none'},0)
     .fromTo('.bag-b',{y:320,rotate:9},{y:-10,rotate:3,ease:'none'},0)
     .fromTo('.finale-card',{y:160,opacity:0},{y:0,opacity:1,ease:'none'},.35)
     .to('.finale-h',{yPercent:-30,opacity:.3,ease:'none'},0);

/* ---------- Dusk sun ---------- */
ScrollTrigger.create({trigger:'#dusk',start:'top bottom',end:'bottom top',scrub:.5,
  onUpdate:st=>$('.dusk').style.setProperty('--suno',(st.progress*46)+'%')});

/* ---------- Shot-clock HUD + scramble ---------- */
const CHARS='#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]*+=-';
function scramble(el,to){
  let n=0; const iv=setInterval(()=>{ n++;
    el.textContent=to.split('').map((c,i)=> i<n? c : CHARS[Math.floor(Math.random()*CHARS.length)]).join('');
    if(n>=to.length) clearInterval(iv); },34);
}
const STOPS=[['hero','TIP-OFF'],['court','IN THE KITCHEN'],['tech','THE BAKES'],['iced','ICED FOR YOU'],['testimonials','WORD FROM THE COVEN'],['finale','GET READY'],['foot','FINAL WHISTLE']];
let hudCur='';
STOPS.forEach(([id,name])=>{
  ScrollTrigger.create({trigger:'#'+id,start:'top 55%',end:'bottom 55%',
    onToggle:st=>{ if(st.isActive && hudCur!==id){ hudCur=id;
      $$('.hud-stops li').forEach(li=>li.classList.toggle('on',li.dataset.stop===id));
      scramble($('#hudName'),name);
      const idx=STOPS.findIndex(s=>s[0]===id);
      $('#hudClock').textContent='00:'+String(24-idx*3).padStart(2,'0');
    }}});
});
$$('.hud-stops li').forEach(li=>li.addEventListener('click',()=>scrollToEl($('#'+li.dataset.stop))));

/* ---------- Quote drawer ---------- */
const quote=$('#quote');
function openQuote(){ quote.classList.add('open'); quote.setAttribute('aria-hidden','false'); document.body.style.setProperty('--snd-push','-27.5em'); }
function closeQuote(){ quote.classList.remove('open'); quote.setAttribute('aria-hidden','true'); }
$('#quoteOpen').addEventListener('click',openQuote);
$('#quoteClose').addEventListener('click',closeQuote);
function qText(){ return encodeURIComponent(`Hi Billie! I'm ${$('#qName').value||'...'}. I'd love: ${$('#qType').value} for ${$('#qDate').value||'a date TBC'}. ${$('#qMsg').value||''}`); }
$('#qSend').addEventListener('click',()=>{ $('#qMail').href=`mailto:billie.king@sky.com?subject=Bakes by Billie enquiry&body=${qText()}`; });
$('#qMail').addEventListener('click',e=>{ e.preventDefault(); location.href=`mailto:billie.king@sky.com?subject=Bakes by Billie enquiry&body=${qText()}`; });

/* ---------- Sound: synthesised clicks + music-box bed (WebAudio, no files) ---------- */
let actx=null, bedTimer=null, sndOn=false;
function beep(freq,t0,dur,type='sine',gain=.04){
  const o=actx.createOscillator(), g=actx.createGain();
  o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(gain,actx.currentTime+t0);
  g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+t0+dur);
  o.connect(g).connect(actx.destination); o.start(actx.currentTime+t0); o.stop(actx.currentTime+t0+dur);
}
$('#snd').addEventListener('click',function(){
  if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
  sndOn=!sndOn; this.classList.toggle('on',sndOn); this.setAttribute('aria-pressed',sndOn);
  localStorage.setItem('billie-sound',sndOn?'1':'0');
  if(sndOn){ beep(660,0,.12,'triangle',.05);
    const notes=[523,659,784,1047,784,659];
    const loop=()=>{ notes.forEach((f,i)=>beep(f,i*.22,0.5,'sine',.018)); };
    loop(); bedTimer=setInterval(loop, notes.length*220+2600);
  } else { clearInterval(bedTimer); }
});
if(localStorage.getItem('billie-sound')==='1'){ /* stays off until tapped — browsers require a gesture */ }

/* ---------- Pause motion ---------- */
let paused=false;
$('#pauseMotion').addEventListener('click',function(){
  paused=!paused; this.textContent=paused?'Resume motion':'Pause motion';
  if(paused){ if(lenis) lenis.stop(); gsap.globalTimeline.pause(); }
  else{ if(lenis) lenis.start(); gsap.globalTimeline.resume(); }
});

/* reveals */
$$('.ttl-card,.finale-card').forEach(el=>gsap.from(el,{y:44,opacity:0,duration:.9,ease:'power1.out',scrollTrigger:{trigger:el,start:'top 88%'}}));
window.addEventListener('load',()=>ScrollTrigger.refresh());
})();
