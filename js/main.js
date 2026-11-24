/* Bakes by Billie — own code, reference-exact UI system (Infinity structure/values).
   Lenis lerp .09 + GSAP ticker, loader, hero, court track, qq pinned quarters,
   knit name tool, ttl cards+cursor, rat finale, dusk, HUD scramble, quote, sound. */
(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.registerPlugin(ScrollTrigger);
let lenis=null;
if(!reduced && window.Lenis){
  lenis=new Lenis({lerp:.09,smoothWheel:true});
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}
function scrollToEl(el){ if(!el) return; if(lenis) lenis.scrollTo(el,{duration:1.6,easing:t=>1-Math.pow(1-t,3)}); else el.scrollIntoView({behavior:'smooth'}); }
$$('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();scrollToEl($(a.getAttribute('href')));}));

/* LOADER — progress + numeral window, 8s failsafe */
const loader=$('#loader'), lNum=$('#loaderNum'), lPct=$('#loaderPct'), lBar=$('#loaderBar');
document.documentElement.classList.add('is-intro');
if(lenis) lenis.stop();
let lp=0, done=false;
setTimeout(()=>$('#loaderSkip').classList.add('show'),1200);
function finishLoader(){ if(done) return; done=true; loader.classList.add('done');
  document.documentElement.classList.remove('is-intro'); if(lenis) lenis.start();
  gsap.from('.h1-t',{yPercent:46,opacity:0,stagger:.1,duration:1,ease:'power1.out',delay:.1});
  gsap.from('.hero__copy',{y:30,opacity:0,duration:.8,delay:.7,ease:'power1.out'});
  gsap.from('.hero__prod-card',{y:36,opacity:0,duration:.8,delay:.9,ease:'power1.out'});
}
const pre=new Image(); pre.src='assets/img/hero.webp';
const lt=setInterval(()=>{ lp=Math.min(100,lp+(pre.complete?7:2)+Math.random()*4);
  lNum.textContent=Math.floor(lp); lPct.textContent=Math.floor(lp)+'%'; lBar.style.width=lp+'%';
  if(lp>=100){clearInterval(lt); setTimeout(finishLoader,250);} },90);
setTimeout(finishLoader,8000);
$('#loaderSkip').addEventListener('click',finishLoader);

/* BAR — reference bar slides away scrolling down, returns scrolling up */
ScrollTrigger.create({start:0,end:'max',onUpdate:st=>{ const b=$('#bar');
  b.style.transform=(st.direction===1 && st.scroll()>260)?'translateY(-135%)':'none'; }});

/* HERO parallax */
gsap.to('#heroImg',{scale:1.1,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:.5}});
gsap.to('.hero-h1',{yPercent:-14,opacity:.3,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:.5}});
gsap.to('.hero__prod-card',{y:-46,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:.5}});

/* COURT — 39-frame logic adapted to 10 real bakes: frame = pow(p,.7)*9, lerp .22 */
const frames=[]; for(let i=1;i<=10;i++){ const im=new Image(); im.src=`assets/img/j${i}.webp`; frames.push(im); }
const cv=$('#journeyCanvas'), cx=cv.getContext('2d');
let curF=-1, dispF=0;
function drawFrame(f){ f=Math.max(0,Math.min(9,Math.round(f))); if(f===curF) return;
  const im=frames[f]; if(!im||!im.complete) return; curF=f;
  const s=Math.max(cv.width/im.width,cv.height/im.height), w=im.width*s, h=im.height*s;
  cx.clearRect(0,0,cv.width,cv.height); cx.drawImage(im,(cv.width-w)/2,(cv.height-h)/2,w,h); }
const helix=$('#helix');
ScrollTrigger.create({trigger:'#court',start:'top top',end:'bottom bottom',scrub:.6,
  onUpdate:st=>{ const target=(st.progress**0.7)*9; dispF+=(target-dispF)*0.22; drawFrame(dispF);
    if(helix) helix.style.transform=`rotateX(-8deg) rotateY(${st.progress*300}deg)`; }});

/* TRX rows at qq boundary */
const trx=$('#trx'); for(let i=0;i<14;i++) trx.appendChild(document.createElement('i'));
const trxTl=gsap.timeline({paused:true});
trxTl.to('#trx i',{scaleX:1,duration:.45,stagger:.035,ease:'power1.inOut'})
     .to('#trx i',{scaleX:0,duration:.45,stagger:.035,ease:'power1.inOut'},'+=0.08');
ScrollTrigger.create({trigger:'#tech',start:'top 65%',onEnter:()=>trxTl.restart(),onEnterBack:()=>trxTl.restart()});

/* QQ — pinned stage, panels wipe in quarters, endcap, bridge */
const panels=$$('.qq__panel'), strips=$$('.qq__strip span');
ScrollTrigger.create({trigger:'#tech',start:'top top',end:'bottom bottom',scrub:.5,
  onUpdate:st=>{ const p=st.progress, t=p*3;
    panels.forEach((pn,i)=>{ const local=i===0?1:Math.max(0,Math.min(1,t-(i-1)));
      pn.style.clipPath=`inset(0 0 ${(1-local)*100}% 0)`; pn.style.zIndex=10+i; });
    const seg=Math.min(3,Math.round(t));
    strips.forEach((s,i)=>s.classList.toggle('on',i===seg));
    $('.qq__endcap').style.opacity = p>0.93? String(Math.min(1,(p-0.93)/0.05)) : '0';
    $('.qq__bridge').style.opacity = p>0.9? '0':'1';
  }});

/* KNIT — name tool, card slides in over the pinned scene */
const ic=$('#icedCanvas'), ictx=ic.getContext('2d');
const base=new Image(); base.src='assets/img/cake-gold.webp';
function initials(name){ const w=name.trim().split(/\s+/).filter(Boolean); if(!w.length) return 'X';
  return (w.length>1? w[0][0]+w[w.length-1][0] : w[0][0]).toUpperCase(); }
function drawIced(){ if(!base.complete) return;
  ictx.clearRect(0,0,ic.width,ic.height); ictx.drawImage(base,0,0,ic.width,ic.height);
  const name=($('#nameInput').value||'').trim();
  ictx.save(); ictx.translate(ic.width/2,ic.height*0.52); ictx.rotate(-0.03); ictx.textAlign='center';
  ictx.fillStyle='#FF3E8A'; ictx.shadowColor='rgba(255,255,255,.65)'; ictx.shadowBlur=6;
  ictx.font='700 92px Caveat, cursive'; ictx.fillText(name||'Your name',0,0);
  ictx.font='500 34px "Geist Mono", monospace'; ictx.fillStyle='rgba(33,26,18,.75)';
  ictx.fillText(initials(name||'Your Name'),0,64); ictx.restore();
  $('#initialsOut').textContent=initials(name||'Your Name'); }
base.onload=drawIced;
$('#nameInput').addEventListener('input',drawIced);
gsap.fromTo('#knitCard',{xPercent:60,opacity:0},{xPercent:0,opacity:1,ease:'none',
  scrollTrigger:{trigger:'#team',start:'top top',end:'45% top',scrub:.6}});
gsap.fromTo('#icedCanvas',{rotate:-3,scale:1.14},{rotate:0,scale:1.06,ease:'none',
  scrollTrigger:{trigger:'#team',start:'top bottom',end:'bottom bottom',scrub:.6}});

/* TTL — timecodes, custom cursor, lightbox */
const t0=Date.now();
setInterval(()=>{ const ms=Date.now()-t0, s=Math.floor(ms/1000),
  f=String(Math.floor((ms%1000)/33)).padStart(2,'0'),
  str=`00:${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}:${f}`;
  $$('[data-tc]').forEach(el=>el.textContent=str); },66);
const cur=$('#ttlCursor'), ttl=$('#testimonials');
ttl.addEventListener('mousemove',e=>{ cur.style.left=e.clientX+'px'; cur.style.top=e.clientY+'px'; });
$$('.ttl__card').forEach(c=>{ c.addEventListener('mouseenter',()=>cur.classList.add('show'));
  c.addEventListener('mouseleave',()=>cur.classList.remove('show')); });
const LB={ billie:{img:'assets/img/billie.webp',cap:'Billie — one person behind the mixing bowl, back at the sheds from 27 November.'},
  murphy:{img:'assets/img/murphy.webp',cap:"Murphy — Club President. Free homemade biscuit for every dog who brings their human to the Rosyth shed."} };
const lb=$('#lb');
function openLb(k){ const d=LB[k]; if(!d) return; $('#lbImg').src=d.img; $('#lbCap').textContent=d.cap;
  lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); if(lenis) lenis.stop();
  setTimeout(()=>$('#lbClose').focus(),60); }
function closeLb(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); if(lenis) lenis.start(); }
$$('.ttl__card').forEach(c=>c.addEventListener('click',()=>openLb(c.dataset.lb)));
$('#lbClose').addEventListener('click',closeLb);
lb.addEventListener('click',e=>{ if(e.target===lb) closeLb(); });

/* RAT FINALE — packs rise + tilt by progress, cta lands late, head fades */
const fin=gsap.timeline({scrollTrigger:{trigger:'#finale',start:'top top',end:'bottom bottom',scrub:.6}});
fin.fromTo('.rat__pack--wht',{y:260},{y:0,ease:'none'},0)
   .fromTo('.rat__pack--blk',{y:360},{y:-16,ease:'none'},0)
   .fromTo('[data-tilt="a"]',{rotate:-9},{rotate:-3,ease:'none'},0)
   .fromTo('[data-tilt="b"]',{rotate:8},{rotate:3,ease:'none'},0)
   .fromTo('#ratCta',{y:170,opacity:0},{y:0,opacity:1,ease:'none'},.4)
   .fromTo('.rat__head',{yPercent:0,opacity:1},{yPercent:-26,opacity:.35,ease:'none'},0);

/* DUSK — sun + gradient centre travel */
ScrollTrigger.create({trigger:'#dusk',start:'top bottom',end:'bottom top',scrub:.5,
  onUpdate:st=>{ const d=$('#dusk'); d.style.setProperty('--ay',(-12+st.progress*58)+'%');
    d.style.setProperty('--suno',(st.progress*42)+'%'); }});

/* HUD — 7 stops + scramble */
const CH='#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]*+=-';
function scramble(el,to){ let n=0; const iv=setInterval(()=>{ n++;
  el.textContent=to.split('').map((c,i)=> i<n? c : CH[Math.floor(Math.random()*CH.length)]).join('');
  if(n>=to.length) clearInterval(iv); },34); }
const STOPS=[['hero','TIP-OFF'],['court','IN THE KITCHEN'],['tech','THE BAKES'],['team','ICED FOR YOU'],['testimonials','WORD FROM THE COVEN'],['finale','GET READY'],['foot','FINAL WHISTLE']];
let curStop='';
STOPS.forEach(([id,name],idx)=>{ ScrollTrigger.create({trigger:'#'+id,start:'top 55%',end:'bottom 55%',
  onToggle:st=>{ if(st.isActive && curStop!==id){ curStop=id;
    $$('.hud-stops li').forEach(li=>li.classList.toggle('on',li.dataset.stop===id));
    scramble($('#hudName'),name);
    $('#hudClock').textContent=String(24-idx*3).padStart(2,'0');
    $('#hudCount').textContent='0'+(idx+1)+' / 07'; } }}); });
$$('.hud-stops li').forEach(li=>li.addEventListener('click',()=>scrollToEl($('#'+li.dataset.stop))));
/* HUD box appears after the hero (reference: absent on hero, present from court on) */
ScrollTrigger.create({trigger:'#court',start:'top 85%',
  onEnter:()=>$('#hud').classList.add('show'), onLeaveBack:()=>$('#hud').classList.remove('show')});
$('#hudNext').addEventListener('click',()=>{ const i=STOPS.findIndex(s=>s[0]===curStop);
  scrollToEl($('#'+STOPS[Math.min(STOPS.length-1,i+1)][0])); });

/* QUOTE drawer */
const quote=$('#quote');
$('#quoteOpen').addEventListener('click',()=>{ quote.classList.add('open'); quote.setAttribute('aria-hidden','false'); });
$('#quoteClose').addEventListener('click',()=>{ quote.classList.remove('open'); quote.setAttribute('aria-hidden','true'); });
function qText(){ return encodeURIComponent(`Hi Billie! I'm ${$('#qName').value||'...'}. I'd love: ${$('#qType').value} for ${$('#qDate').value||'a date TBC'}. ${$('#qMsg').value||''}`); }
$('#qMail').addEventListener('click',e=>{ e.preventDefault(); location.href=`mailto:billie.king@sky.com?subject=Bakes by Billie enquiry&body=${qText()}`; });

/* SOUND — synthesised WebAudio (ref: generated buffers, one bed) */
let actx=null, bed=null, on=false;
function beep(f,t,d,type='sine',g=.018){ const o=actx.createOscillator(), gn=actx.createGain();
  o.type=type; o.frequency.value=f; gn.gain.setValueAtTime(g,actx.currentTime+t);
  gn.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+t+d);
  o.connect(gn).connect(actx.destination); o.start(actx.currentTime+t); o.stop(actx.currentTime+t+d); }
$('#snd').addEventListener('click',function(){ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
  on=!on; this.classList.toggle('on',on); this.setAttribute('aria-pressed',on);
  localStorage.setItem('billie-sound',on?'1':'0');
  if(on){ beep(660,0,.12,'triangle',.05); const notes=[523,659,784,1047,784,659];
    const loop=()=>notes.forEach((f,i)=>beep(f,i*.22,.5)); loop(); bed=setInterval(loop,notes.length*220+2600);
  } else clearInterval(bed); });

/* Pause motion */
let paused=false;
$('#pauseMotion').addEventListener('click',function(){ paused=!paused;
  this.textContent=paused?'Resume motion':'Pause motion';
  if(paused){ if(lenis) lenis.stop(); gsap.globalTimeline.pause(); }
  else{ if(lenis) lenis.start(); gsap.globalTimeline.resume(); } });

$$('.ttl__card,.ttl__quote-slot').forEach(el=>gsap.from(el,{y:44,opacity:0,duration:.9,ease:'power1.out',scrollTrigger:{trigger:el,start:'top 90%'}}));
window.addEventListener('load',()=>ScrollTrigger.refresh());
})();
