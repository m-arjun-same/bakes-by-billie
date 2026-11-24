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
  gsap.from('.nl-1',{yPercent:38,opacity:0,duration:1,ease:'power1.out',delay:.1});
  gsap.from('.nl-2',{yPercent:38,opacity:0,duration:1,ease:'power1.out',delay:.28});
  gsap.from('.hero-portrait',{y:60,opacity:0,duration:1,ease:'power1.out',delay:.45});
  gsap.from('.hero-left',{y:30,opacity:0,duration:.8,delay:.8,ease:'power1.out'});
  gsap.from('.hero-bake',{y:30,opacity:0,duration:.8,delay:.95,ease:'power1.out'});
  gsap.from('.hero-letter',{y:30,opacity:0,duration:.8,delay:1.1,ease:'power1.out'});
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

/* HERO — Elias template systems: on-hero chrome hide, lens cursor, bake cycle, letter */
document.body.classList.add('on-hero','hero-active');
ScrollTrigger.create({trigger:'#hero',start:'top bottom',end:'bottom top',
  onToggle:st=>{ document.body.classList.toggle('on-hero',st.isActive);
    document.body.classList.toggle('hero-active',st.isActive); }});
$('#heroContact').addEventListener('click',()=>{ const q=$('#quote'); q.classList.add('open'); q.setAttribute('aria-hidden','false'); });
/* lens cursor */
const hCur=$('#heroCursor'), hCurTxt=$('#heroCursorTxt'), nameAlt=document.querySelector('.name-alt'), heroEl=$('#hero');
let lensOn=false;
heroEl.addEventListener('mousemove',e=>{ hCur.style.left=e.clientX+'px'; hCur.style.top=e.clientY+'px';
  if(lensOn){ const r=heroEl.getBoundingClientRect();
    nameAlt.style.clipPath=`circle(92px at ${e.clientX-r.left}px ${e.clientY-r.top}px)`; } });
heroEl.addEventListener('mouseleave',()=>{ nameAlt.style.clipPath='circle(0px at -200px -200px)'; });
function curState(el,state,txt){ el.addEventListener('mouseenter',()=>{ hCur.className='hero-cursor '+state; hCurTxt.textContent=txt||''; });
  el.addEventListener('mouseleave',()=>{ hCur.className='hero-cursor'; hCurTxt.textContent=''; }); }
$$('.hero a,.hero button').forEach(el=>{ if(el.id!=='bakeCard'&&el.id!=='bakeNext') curState(el,'is-link'); });
$('#heroName').addEventListener('mouseenter',()=>{ lensOn=true; });
$('#heroName').addEventListener('mouseleave',()=>{ lensOn=false; nameAlt.style.clipPath='circle(0px at -200px -200px)'; });
/* latest-bake cycle (reference: book flips to next on click) */
const BAKES=[
 {img:'assets/img/postie.webp',title:'The<br>Postie<br>Box',label:'The Latest Bake',cats:'Boxes / Post / Sweet'},
 {img:'assets/img/treatbox.webp',title:'Christmas<br>Eve<br>Box',label:'Also from the Shed',cats:'Seasonal / Christmas / £22'},
 {img:'assets/img/choc-stack.webp',title:'Brownie<br>Stack<br>Box',label:'Also from the Shed',cats:'Treats / Brownies / Sharing'}];
let bakeI=0, flipping=false;
function nextBake(){ if(flipping) return; flipping=true; bakeI=(bakeI+1)%BAKES.length; const b=BAKES[bakeI];
  gsap.to('#bakeCard',{rotateY:-88,duration:.38,ease:'power2.in',onComplete:()=>{
    $('#bakeImg').src=b.img; $('#bakeCoverTitle').innerHTML=b.title;
    $('#bakeLabel').textContent=b.label; $('#bakeCats').textContent=b.cats;
    gsap.fromTo('#bakeCard',{rotateY:88},{rotateY:0,duration:.45,ease:'power2.out',onComplete:()=>flipping=false}); }}); }
const bc=$('#bakeCard');
bc.addEventListener('click',nextBake); $('#bakeNext').addEventListener('click',nextBake);
curState(bc,'is-click','Click'); curState($('#bakeNext'),'is-click','Click');
/* letter to tomorrow — typewriter, seal & send -> envelope, next letter */
const LETTERS=[
 'I will put the kettle on and be at the shed before the brownies sell out.',
 'I will take the long walk to Wemyss Street and earn the last slice.',
 'I will order the birthday cake early — not the night before.',
 'I will bring my human to the shed. Murphy owes me a biscuit.'];
let letterI=0, typeTimer=null;
function typeLetter(){ const el=$('#letterText'); const full=LETTERS[letterI]; let n=0; el.textContent='';
  $('#letterCount').textContent='Letter 0'+(letterI+1)+' / 04';
  clearInterval(typeTimer);
  typeTimer=setInterval(()=>{ n++; el.textContent=full.slice(0,n); if(n>=full.length) clearInterval(typeTimer); },34); }
typeLetter();
$('#letterSeal').addEventListener('click',()=>{ clearInterval(typeTimer);
  $('#letterPaper').style.display='none'; const env=$('#letterEnv'); env.classList.add('show');
  const d=new Date(); d.setDate(d.getDate()+((6-d.getDay()+7)%7||7));
  const sat=d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'}).toUpperCase();
  $('#envNote').textContent='Sealed for tomorrow · '+sat;
  env.querySelector('.env-postmark').innerHTML='Tomorrow<br>'+sat;
  setTimeout(()=>{ env.classList.remove('show'); $('#letterPaper').style.display='';
    letterI=(letterI+1)%LETTERS.length; typeLetter(); },2600); });

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

/* SOUND — Buddy's track (assets/audio/music.mp3), looped.
   Autoplay: browsers only unlock audio after a first gesture, so playback
   starts on the first tap/click/keypress — unless sound was turned off. */
const bgm=$('#bgm'); bgm.volume=.5;
const sndBtn=$('#snd'); let on=false;
function setSound(want){ on=want; sndBtn.classList.toggle('on',on); sndBtn.setAttribute('aria-pressed',on);
  localStorage.setItem('billie-sound',on?'1':'0');
  if(on){ const p=bgm.play(); if(p) p.catch(()=>{}); } else bgm.pause(); }
sndBtn.addEventListener('click',()=>setSound(!on));
if(localStorage.getItem('billie-sound')!=='0'){ const p=bgm.play();
  if(p) p.then(()=>setSound(true)).catch(()=>{ const h=()=>{ setSound(true);
      ['pointerdown','keydown','touchstart'].forEach(e2=>window.removeEventListener(e2,h)); };
    ['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,h,{passive:true})); }); }

/* Pause motion */
let paused=false;
$('#pauseMotion').addEventListener('click',function(){ paused=!paused;
  this.textContent=paused?'Resume motion':'Pause motion';
  if(paused){ if(lenis) lenis.stop(); gsap.globalTimeline.pause(); }
  else{ if(lenis) lenis.start(); gsap.globalTimeline.resume(); } });

$$('.ttl__card,.ttl__quote-slot').forEach(el=>gsap.from(el,{y:44,opacity:0,duration:.9,ease:'power1.out',scrollTrigger:{trigger:el,start:'top 90%'}}));
window.addEventListener('load',()=>ScrollTrigger.refresh());
})();
