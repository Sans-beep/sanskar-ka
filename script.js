
function startBirthdayWeather(){const p=document.getElementById('p2');if(!p)return;p.classList.remove('sunrise');clearTimeout(window.birthdayWeatherTimer);window.birthdayWeatherTimer=setTimeout(()=>p.classList.add('sunrise'),4600)}
function resetBirthdayWeather(){const p=document.getElementById('p2');if(!p)return;clearTimeout(window.birthdayWeatherTimer);p.classList.remove('sunrise')}
function fadeInAudio(a,target=.5,duration=700){
  if(!a)return;
  if(a._fadeTimer)clearInterval(a._fadeTimer);
  a.volume=0;
  const p=a.play();
  if(p&&p.catch)p.catch(()=>{});
  const started=performance.now();
  a._fadeTimer=setInterval(()=>{
    const t=Math.min(1,(performance.now()-started)/duration);
    a.volume=target*t;
    if(t>=1){clearInterval(a._fadeTimer);a._fadeTimer=null;}
  },30);
}
function fadeOutAudio(a,duration=500,reset=true){
  if(!a)return;
  if(a._fadeTimer)clearInterval(a._fadeTimer);
  const start=a.volume, started=performance.now();
  a._fadeTimer=setInterval(()=>{
    const t=Math.min(1,(performance.now()-started)/duration);
    a.volume=start*(1-t);
    if(t>=1){
      clearInterval(a._fadeTimer);a._fadeTimer=null;
      a.pause();
      if(reset)a.currentTime=0;
    }
  },30);
}
function playBirthdaySong(){const a=document.getElementById('birthdaySong');if(a){a.pause();a.currentTime=0;fadeInAudio(a,.42,850)}}
function pauseBirthdaySong(){fadeOutAudio(document.getElementById('birthdaySong'),450,true)}

const pages=[...document.querySelectorAll('.page')];
let i=0,busy=false,phase1Ending=false;
function setCurrentPage(n){
  pages.forEach((p,k)=>{
    p.classList.toggle('active',k===n);
    p.style.pointerEvents=k===n?'auto':'none';
    if(k!==n)p.style.animation='none';
  });
  i=n;
  window.sitePageIndex=i;
  syncGlobalBack();
}

window.sitePageIndex=0;
let proofFile=null,proofUploaded=false;

function go(n){
  if(busy || n<0 || n>=pages.length || n===i)return;
  busy=true;
  const oldIndex=i, old=pages[i], next=pages[n], forward=n>i;
  if(oldIndex===1)pauseBirthdaySong();
  if(oldIndex===2){
    const t=document.getElementById('throwbackSong');
    if(t)fadeOutAudio(t,450,true);
  }
  const card=document.querySelector('.card');
  const transitionDoodles=document.getElementById('transitionDoodles');
  const transitionMap={
    '0-1':{cls:'t01',items:[['☼','12%','22%','-28px','12px','0','-8deg'],['✧','82%','27%','24px','10px','0','12deg'],['⌁','19%','76%','-18px','18px','0','-10deg'],['♡','76%','72%','18px','-12px','0','8deg']]},
    '1-2':{cls:'t12',items:[['☀','15%','30%','-22px','8px','0','-14deg'],['⌁','86%','35%','22px','4px','0','12deg'],['✦','72%','78%','18px','18px','0','-8deg']]},
    '2-3':{cls:'t23',items:[['✎','10%','20%','-20px','10px','0','-12deg'],['▱','88%','24%','20px','8px','0','10deg'],['⌁','18%','82%','-14px','-14px','0','-6deg'],['✧','78%','76%','18px','-10px','0','9deg']]},
    '3-4':{cls:'t34',items:[['↗','13%','42%','-18px','0','0','-12deg'],['—','87%','62%','20px','-8px','0','0deg'],['✦','70%','18%','12px','-14px','0','6deg']]},
    '4-5':{cls:'t45',items:[['✓','17%','25%','-16px','6px','0','-8deg'],['✦','84%','29%','18px','4px','0','10deg'],['♡','81%','76%','16px','-10px','0','-7deg'],['⌁','13%','72%','-12px','-8px','0','8deg']]},
    '5-6':{cls:'t56',items:[['✉','11%','31%','-18px','8px','0','-12deg'],['♡','89%','24%','18px','10px','0','9deg'],['❀','82%','79%','18px','-14px','0','-7deg'],['⌁','18%','81%','-14px','-8px','0','8deg']]},
    '6-5':{cls:'t65',items:[['✉','86%','31%','18px','8px','0','10deg'],['↙','12%','24%','-18px','10px','0','-9deg']]}
  };
  const trans=transitionMap[`${oldIndex}-${n}`]||{cls:'generic',items:[['♡','15%','25%','-18px','8px','0','-8deg'],['✦','84%','70%','18px','-10px','0','9deg']]};
  card.className=card.className.replace(/\bt\d+\b/g,'').trim(); card.classList.add('transitioning',trans.cls);
  transitionDoodles.innerHTML='';
  trans.items.forEach((d,k)=>{const el=document.createElement('span');el.className='transition-doodle '+(k%3===0?'big':'soft');el.textContent=d[0];el.style.left=d[1];el.style.top=d[2];el.style.setProperty('--sx',d[3]);el.style.setProperty('--sy',d[4]);el.style.setProperty('--ex',`${k%2?'-':'+'}${8+k*3}px`);el.style.setProperty('--ey',`${k%2?'-':'+'}${10+k*2}px`);el.style.setProperty('--sr',d[5]);el.style.setProperty('--er',d[6]);el.style.animationDelay=`${k*70}ms`;transitionDoodles.appendChild(el)});
  // Start the old page's exit while it is still active.
  // Removing .active first caused a one-frame hide, followed by the exit animation
  // restarting from opacity:1 — which looked like Page 2 appeared twice.
  pages.forEach(p=>{
    p.style.pointerEvents='none';
    p.classList.remove('active','exit-left','exit-right','enter-left','enter-right');
    p.style.animation='none';
  });
  // Run each incoming animation directly once. Using both .active and .enter-*
  // classes was causing the browser to restart the incoming animation.
  const incoming={
    '0-1':'cardInRight .72s cubic-bezier(.18,.82,.2,1) both',
    '1-2':'cardInRight .72s cubic-bezier(.18,.82,.2,1) both',
    '2-3':'photoIn .78s cubic-bezier(.18,.86,.2,1) both',
    '3-4':'liftIn .82s cubic-bezier(.2,.85,.18,1) both',
    '4-5':'softPushIn .72s cubic-bezier(.2,.82,.2,1) both',
    '5-6':'paperIn .86s cubic-bezier(.18,.86,.18,1) both'
  };
  const outgoing=forward
    ? 'cardOutLeft .58s cubic-bezier(.55,.08,.72,.35) both'
    : 'cardOutRight .58s cubic-bezier(.55,.08,.72,.35) both';
  old.classList.add(forward?'exit-left':'exit-right');
  old.style.animation=outgoing;
  old.style.pointerEvents='none';
  next.classList.add('active');
  next.style.pointerEvents='none';
  const incomingKey=oldIndex+'-'+n;
  next.style.animation=incoming[incomingKey]||(
    forward?'cardInRight .72s cubic-bezier(.18,.82,.2,1) both':
    'cardInLeft .72s cubic-bezier(.18,.82,.2,1) both'
  );
  i=n;
  window.sitePageIndex=i;
  syncGlobalBack();
  if(n===6)renderUnlockPage();
  if(n===8)startConstSky();else if(oldIndex===8)stopConstSky();
  const thread=document.getElementById('storyThread');
  if(thread){thread.classList.remove('play');void thread.offsetWidth;thread.classList.add('play');}
  if(n===1){
    startBirthdayWeather();
    playBirthdaySong();
  }else if(oldIndex===1){
    resetBirthdayWeather();
  }
  const throwbackSong=document.getElementById('throwbackSong');
  if(throwbackSong && n===2){
    throwbackSong.currentTime=0;
    fadeInAudio(throwbackSong,.48,850);
  }
  setTimeout(()=>{
    old.classList.remove('active','exit-left','exit-right','enter-left','enter-right');
    next.style.animation='none';
    old.style.animation='none';
    card.classList.remove('transitioning',trans.cls);
    transitionDoodles.innerHTML='';
    busy=false;
    pages.forEach((p,k)=>{
      p.style.pointerEvents='none';
      if(k===i)p.style.pointerEvents='auto';
    });
  },900);
}
/* GLOBAL NAVIGATION — one handler for every forward control + one dedicated back control. */
function handleNextButton(button){
  if(!button || busy)return;
  const page=button.closest('.page');
  const index=pages.indexOf(page);
  if(index<0 || index!==i)return;
  if(index<pages.length-1)go(index+1);
}
document.querySelectorAll('.next').forEach(button=>{
  button.onclick=function(e){
    e.preventDefault();
    e.stopPropagation();
    handleNextButton(button);
  };
});
const globalBack=document.getElementById('globalBack');
function syncGlobalBack(){const show=i>0&&!phase1Ending;globalBack.style.display=show?"flex":"none";globalBack.classList.toggle("show",show);}
globalBack.onclick=function(e){
  e.preventDefault();
  e.stopPropagation();
  if(busy || i===0)return;
  go(i-1);
};
setCurrentPage(0);

function runPhase1Ending(){
  phase1Ending=true;
  const overlay=document.getElementById('codeReveal');
  const grant=document.getElementById('revealGrant');
  const wait=document.getElementById('revealWait');
  const found=document.getElementById('revealFound');
  const number=document.getElementById('revealNumber');
  const final=document.getElementById('revealFinal');
  const back=document.getElementById('globalBack');
  if(back)back.style.display='none';
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden','false');
  [grant,wait,found,number,final].forEach(el=>el.classList.remove('show'));
  [[grant,180],[wait,1150],[found,2250],[number,3400],[final,4450]].forEach(([el,delay])=>setTimeout(()=>el.classList.add('show'),delay));
}
let unlocked=false;
try{unlocked=sessionStorage.getItem('sanskar_unlocked')==='1';}catch(_){}
function markUnlocked(persist){unlocked=true;if(persist===false)return;try{sessionStorage.setItem('sanskar_unlocked','1');}catch(_){}}
const unlockBtnEl=document.getElementById('unlock');
const unlockLabel0=unlockBtnEl?unlockBtnEl.textContent:'unlock \u2192';
const codePlaceholder0='\u2022 \u2022 \u2022 \u2022 \u2022 \u2022 \u2022 \u2022 \u2022';
function renderUnlockPage(){
  const input=document.getElementById('code'),button=document.getElementById('unlock'),e=document.getElementById('error');
  if(unlocked||ownerMode){
    if(input){input.disabled=true;input.value='';input.placeholder='already unlocked \u2661';}
    if(button){button.disabled=false;button.textContent='continue \u2192';}
    if(e)e.textContent='';
  }else{
    if(input){input.disabled=false;input.value='';input.placeholder=codePlaceholder0;}
    if(button){button.disabled=false;button.textContent=unlockLabel0;}
    if(e)e.textContent='';
  }
}
function unlock(){
  const owner = new URLSearchParams(location.search).has('owner');
  const v=document.getElementById('code').value.trim().toUpperCase();
  const e=document.getElementById('error');
  const input=document.getElementById('code');
  const button=document.getElementById('unlock');

  if(unlocked || owner || v===activeUnlockCode()){
    const firstCeremony=!unlocked;
    markUnlocked(!owner);
    e.textContent='';
    renderUnlockPage();
    if(firstCeremony){
      input.disabled=true;
      button.disabled=true;
      runPhase1Ending();
    }else{
      enterPhase2();
    }
  }else{
    e.textContent='Oh my bhondu girl not today \u{1F62D}\u{1FAF6}';
    input.value='';
  }
}document.getElementById('unlock').onclick=unlock;
document.getElementById('code').onkeydown=e=>{if(e.key==='Enter')unlock()};
const ownerMode=new URLSearchParams(location.search).has('owner');
const proofUpload=document.getElementById('proofUpload'), proofPhoto=document.getElementById('proofPhoto'), proofImage=document.getElementById('proofImage'), uploadStatus=document.getElementById('uploadStatus'), p4Next=document.getElementById('p4Next');
if(ownerMode){
  /* Owner mode is sandboxed: never read or keep a saved unlock, so testing
     here can never leave the normal link unlocked in the same tab. */
  unlocked=false;
  try{sessionStorage.removeItem('sanskar_unlocked');}catch(_){}
  proofUploaded=true;
  proofFile=null;
  proofUpload.disabled=true;
  p4Next.disabled=false;
  p4Next.removeAttribute('disabled');
  document.getElementById('proofPolaroid').classList.add('verified');
  uploadStatus.textContent='owner mode ♡ upload skipped';
}
proofUpload.addEventListener('change',()=>{if(ownerMode)return;const file=proofUpload.files&&proofUpload.files[0];if(!file)return;if(!file.type.startsWith('image/')){uploadStatus.textContent='that one is not a photo 😭';proofUpload.value='';proofFile=null;p4Next.disabled=true;proofPhoto.classList.remove('has-image');proofImage.removeAttribute('src');return}if(file.size>10*1024*1024){uploadStatus.textContent='that photo is a little too big 😭';proofUpload.value='';proofFile=null;p4Next.disabled=true;proofPhoto.classList.remove('has-image');proofImage.removeAttribute('src');return}proofFile=file;proofUploaded=false;if(proofImage.dataset.objectUrl)URL.revokeObjectURL(proofImage.dataset.objectUrl);const previewUrl=URL.createObjectURL(file);proofImage.dataset.objectUrl=previewUrl;proofImage.src=previewUrl;proofPhoto.classList.add('has-image');document.getElementById('proofPolaroid').classList.remove('verified');uploadStatus.textContent='evidence acquired ♡';p4Next.disabled=false;});
p4Next.addEventListener('click',async()=>{if(proofUploaded){setTimeout(()=>go(i+1),0);return}if(!proofFile)return;p4Next.disabled=true;uploadStatus.textContent='sending your evidence… ♡';const data=new FormData();data.append('file',proofFile);data.append('upload_preset','kashish_birthday');try{const res=await fetch('https://api.cloudinary.com/v1_1/aifv5z3a/image/upload',{method:'POST',body:data});if(!res.ok)throw new Error('upload failed');await res.json();proofUploaded=true;document.getElementById('proofPolaroid').classList.add('verified');uploadStatus.textContent='okay, i believe you ♡';setTimeout(()=>go(i+1),900)}catch(err){console.error(err);uploadStatus.textContent="hmm… the evidence didn't send. try again 😭";p4Next.disabled=false}});


let secretTaps=0,tapReset;
const env=document.getElementById('secretEnvelope');
const count=document.getElementById('tapCount');
const pop=document.getElementById('letterPop');
const joy=document.getElementById('joy');
const burst=document.getElementById('heartBurst');
const tapSound=new Audio('tiu-tiu-tiooo.mp3');
tapSound.preload='auto';
tapSound.volume=.72;

function closeLetter(){
  pop.classList.remove('open');
  pop.setAttribute('aria-hidden','true');
  const song=document.getElementById('letterSong');
  if(song){ clearTimeout(window.letterSongStop); fadeOutAudio(song,500,true); }
}
document.getElementById('closeLetter').onclick=closeLetter;
pop.addEventListener('click',e=>{if(e.target===pop)closeLetter()});

env.addEventListener('click',()=>{
  secretTaps++;
  clearTimeout(tapReset);
  tapSound.currentTime=0;
  tapSound.play().catch(()=>{});
  count.innerHTML=secretTaps<9
    ? `something feels suspicious… <b>${secretTaps}/9</b> ♡`
    : `you found it. ♡`;

  env.animate(
    [{transform:'rotate(1deg) scale(1)'},{transform:'rotate(-2deg) scale(.97)'},{transform:'rotate(1deg) scale(1)'}],
    {duration:240,easing:'ease-out'}
  );

  if(secretTaps===9){
    secretTaps=0;
    clearTimeout(tapReset);
    joy.classList.remove('show'); void joy.offsetWidth; joy.classList.add('show');

    burst.innerHTML='';
    const hearts=['♡','♥','✦','♡','✧','♥','♡','✦','❀','♡','♥','✧'];
    hearts.forEach((h,k)=>{
      const el=document.createElement('span');
      el.textContent=h;
      const a=2*Math.PI*k/hearts.length, r=95+Math.random()*85;
      el.style.setProperty('--x',`${Math.cos(a)*r}px`);
      el.style.setProperty('--y',`${Math.sin(a)*r}px`);
      el.style.setProperty('--s',`${.7+Math.random()*.7}`);
      el.style.setProperty('--r',`${-30+Math.random()*60}deg`);
      el.style.animationDelay=`${k*22}ms`;
      burst.appendChild(el);
    });

    // Start audio during the user gesture so mobile autoplay policies are more reliable.
    const letterSong=document.getElementById('letterSong');
    if(letterSong){letterSong.currentTime=20;fadeInAudio(letterSong,.56,900);}
    // The actual letter opens automatically after the heart burst.
    setTimeout(()=>{
      pop.classList.add('open');
      pop.setAttribute('aria-hidden','false');
      const song=document.getElementById('letterSong');
      clearTimeout(window.letterSongStop);
      window.letterSongStop=setTimeout(()=>fadeOutAudio(song,900,true),40000);
    },620);
  }else{
    tapReset=setTimeout(()=>{
      secretTaps=0;
      count.innerHTML='there’s something here… <b>♡</b>';
    },2200);
  }
});


/* ===== Phase 2 — cinematic video + Jaan Nisaar only ===== */
const phase2Song=document.getElementById('phase2Song');
const phase2Page=document.getElementById('p8');
const phase2Videos=[
  document.getElementById('phase2AnimationA'),
  document.getElementById('phase2AnimationB')
].filter(Boolean);
let phase2VideoIndex=0;
let phase2SongPlaying=false;
let phase2LoopTimer=null;
let phase2Crossfading=false;
let phase2VideoStarted=false;

function activePhase2Video(){
  return phase2Videos[phase2VideoIndex]||null;
}

function preparePhase2Video(v){
  if(!v)return;
  v.muted=true;
  v.loop=false;
  v.playsInline=true;
  v.preload='auto';
}

function resetPhase2VideoPair(){
  clearTimeout(phase2LoopTimer);
  phase2VideoIndex=0;
  phase2Crossfading=false;
  phase2VideoStarted=false;

  phase2Videos.forEach((v,k)=>{
    preparePhase2Video(v);
    v.pause();
    try{v.currentTime=0}catch(_){} 
    v.classList.toggle('is-visible',k===0);
    v.style.transition='opacity 420ms cubic-bezier(.22,.72,.2,1)';
  });
}

function armPhase2Pair(){
  phase2Videos.forEach(v=>{
    preparePhase2Video(v);
    v.load();
  });
}

function schedulePhase2SeamlessLoop(){
  clearTimeout(phase2LoopTimer);
  const current=activePhase2Video();
  if(!current)return;

  const duration=current.duration;
  if(!Number.isFinite(duration)||duration<=0){
    phase2LoopTimer=setTimeout(schedulePhase2SeamlessLoop,100);
    return;
  }

  const remaining=Math.max(0,duration-current.currentTime);
  // Start the replacement before the source clip ends. The replacement
  // always starts at 0s; it is never allowed to inherit the old clip's time.
  const lead=Math.min(0.72,Math.max(0.48,duration*0.04));
  phase2LoopTimer=setTimeout(()=>crossfadePhase2Video(),Math.max(120,(remaining-lead)*1000));
}

async function crossfadePhase2Video(){
  if(phase2Crossfading||phase2Videos.length<2)return;

  const current=activePhase2Video();
  const nextIndex=(phase2VideoIndex+1)%phase2Videos.length;
  const next=phase2Videos[nextIndex];
  if(!current||!next)return;

  phase2Crossfading=true;
  clearTimeout(phase2LoopTimer);

  // Critical fix: the standby copy must be restarted from the FIRST FRAME.
  // Previously both copies played continuously, so at the seam the "next"
  // copy was also near the end of the clip. Swapping to it caused a visible
  // jump/flicker. Now only the visible copy runs until the seam.
  next.pause();
  try{next.currentTime=0}catch(_){}
  next.classList.add('is-visible');

  const playPromise=next.play();
  if(playPromise?.catch)await playPromise.catch(()=>{});

  // Give the browser at least two paint opportunities to decode/show frame 0
  // before fading the old layer away. This avoids a black/blank compositor frame.
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

  current.classList.remove('is-visible');

  setTimeout(()=>{
    current.pause();
    try{current.currentTime=0}catch(_){}
    phase2VideoIndex=nextIndex;
    phase2Crossfading=false;
    schedulePhase2SeamlessLoop();
  },460);
}
function pausePhase2Song(){
  if(!phase2Song)return;
  fadeOutAudio(phase2Song,650,true);
  phase2SongPlaying=false;
}

function playPhase2Song(){
  if(!phase2Song)return;
  phase2Song.loop=true;
  phase2Song.volume=.46;
  phase2Song.currentTime=0;
  phase2SongPlaying=true;
  const p=phase2Song.play();
  if(p?.catch){
    p.catch(()=>{
      const retry=()=>phase2Song.play().catch(()=>{});
      document.addEventListener('pointerdown',retry,{once:true,passive:true});
      document.addEventListener('touchstart',retry,{once:true,passive:true});
    });
  }
}

function playPhase2Video(){
  if(!phase2Videos.length)return;
  resetPhase2VideoPair();
  const first=activePhase2Video();
  first.muted=true;
  first.loop=false;
  first.currentTime=0;

  const start=()=>{
    if(phase2VideoStarted)return;
    phase2VideoStarted=true;

    // Only the visible copy starts. The second copy is kept loaded but paused;
    // it is restarted at 0s at each seam and crossfaded in before the old copy ends.
    first.play().catch(()=>{});
    schedulePhase2SeamlessLoop();
  };

  start();
  document.addEventListener('pointerdown',start,{once:true,passive:true});
  document.addEventListener('touchstart',start,{once:true,passive:true});
}

function stopPhase2Video(){
  clearTimeout(phase2LoopTimer);
  phase2Crossfading=false;
  phase2VideoStarted=false;
  resetPhase2Moonlight();
  phase2Videos.forEach(v=>{
    v.pause();
    try{v.currentTime=0}catch(_){}
    v.classList.remove('is-visible');
  });
  if(phase2Videos[0])phase2Videos[0].classList.add('is-visible');
  phase2VideoIndex=0;
}




/* ===== Phase 2 — moonlight interaction ===== */
const phase2MoonlightHit=document.getElementById('phase2MoonlightHit');
const phase2MoonlightLayer=document.getElementById('phase2MoonlightLayer');
const phase2MoonlightTrail=document.getElementById('phase2MoonlightTrail');
const phase2MoonlightAura=document.getElementById('phase2MoonlightAura');
const phase2MoonlightFlash=document.getElementById('phase2MoonlightFlash');
const phase2MoonlightStar=document.getElementById('phase2MoonlightStar');
const phase2MoonlightPrompt=document.getElementById('phase2MoonlightPrompt');
const phase2MoonlightNote=document.getElementById('phase2MoonlightNote');
const phase2MoonlightCtx=phase2MoonlightTrail?.getContext('2d');

const phase2MoonlightState={
  pointerId:null,
  drawing:false,
  points:[],
  distance:0,
  last:null,
  complete:false,
  raf:0,
  fadeTimer:null
};

// Video fit is device-specific: cover on phones (old behavior, no bars),
// contain on laptop (whole animation visible on a paper-light stage).
function phase2VideoFit(){
  return window.matchMedia('(min-width:700px)').matches?'contain':'cover';
}

// The video is 720x1280 portrait. Maps a point in the video (as fractions)
// to its on-screen position under the active fit mode.
function phase2VideoFrame(){
  const W=phase2Page.clientWidth,H=phase2Page.clientHeight,vr=720/1280;
  let dw,dh,ox,oy;
  if(phase2VideoFit()==='contain'){
    if(W/H>vr){dh=H;dw=vr*H;ox=(W-dw)/2;oy=0;}
    else{dw=W;dh=W/vr;ox=0;oy=(H-dh)/2;}
  }else{
    if(W/H>vr){dw=W;dh=W/vr;ox=0;oy=(H-dh)/2;}
    else{dh=H;dw=vr*H;ox=(W-dw)/2;oy=0;}
  }
  return {x:ox,y:oy,w:dw,h:dh};
}

function phase2MoonPoint(){
  // Crescent moon sits top-right in the video frame (~72% across, ~9% down).
  const f=phase2VideoFrame();
  return {
    x:f.x+f.w*.72,
    y:f.y+f.h*.09
  };
}

function phase2MoonRadius(){
  // Deliberately generous and scaled to the displayed video: the interaction
  // should never require pixel-perfect tapping.
  return Math.max(60,phase2VideoFrame().w*.12);
}

function positionPhase2MoonEffects(){
  const c=phase2MoonPoint();
  if(phase2MoonlightAura){
    phase2MoonlightAura.style.left=c.x+'px';
    phase2MoonlightAura.style.top=c.y+'px';
  }
  if(phase2MoonlightStar){
    phase2MoonlightStar.style.left=c.x+'px';
    phase2MoonlightStar.style.top=c.y+'px';
  }
  if(phase2MoonlightFlash){
    const W=phase2Page.clientWidth||1,H=phase2Page.clientHeight||1;
    const glow='rgba(212,175,55,.26)';
    phase2MoonlightFlash.style.background=
      'radial-gradient(circle at '+(c.x/W*100).toFixed(2)+'% '+(c.y/H*100).toFixed(2)+'%,'+glow+',transparent 27%)';
  }
}

function phase2MoonInside(p){
  const c=phase2MoonPoint();
  const rx=phase2MoonRadius()*1.35;
  const ry=phase2MoonRadius()*1.35;
  return (((p.x-c.x)*(p.x-c.x))/(rx*rx)+((p.y-c.y)*(p.y-c.y))/(ry*ry))<=1;
}

function resizePhase2MoonlightCanvas(){
  if(!phase2MoonlightTrail||!phase2MoonlightCtx)return;
  const rect=phase2Page.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  phase2MoonlightTrail.width=Math.max(1,Math.round(rect.width*dpr));
  phase2MoonlightTrail.height=Math.max(1,Math.round(rect.height*dpr));
  phase2MoonlightTrail.style.width=rect.width+'px';
  phase2MoonlightTrail.style.height=rect.height+'px';
  phase2MoonlightCtx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize',()=>{resizePhase2MoonlightCanvas();positionPhase2MoonEffects();},{passive:true});

function phase2MoonlightPosition(e){
  const r=phase2Page.getBoundingClientRect();
  return {x:e.clientX-r.left,y:e.clientY-r.top};
}

function phase2MoonlightRender(){
  if(!phase2MoonlightCtx)return;
  const ctx=phase2MoonlightCtx;
  const w=phase2Page.clientWidth,h=phase2Page.clientHeight;
  ctx.clearRect(0,0,w,h);

  const now=performance.now();
  phase2MoonlightState.points=phase2MoonlightState.points.filter(p=>now-p.t<1000);

  if(phase2MoonlightState.points.length>1){
    ctx.save();
    ctx.lineCap='round';
    ctx.lineJoin='round';

    for(let k=1;k<phase2MoonlightState.points.length;k++){
      const prev=phase2MoonlightState.points[k-1];
      const cur=phase2MoonlightState.points[k];
      const life=Math.max(0,1-(now-cur.t)/1000);
      const taper=k/phase2MoonlightState.points.length;

      ctx.shadowBlur=16+16*taper;
      // Ink-on-white video: draw in ink with a warm gold glow in both fit modes.
      ctx.shadowColor=`rgba(212,175,55,${.20+.42*life})`;
      ctx.strokeStyle=`rgba(43,38,32,${.14+.62*life})`;
      ctx.lineWidth=1.5+5*taper;

      ctx.beginPath();
      ctx.moveTo(prev.x,prev.y);
      ctx.lineTo(cur.x,cur.y);
      ctx.stroke();
    }

    const last=phase2MoonlightState.points[phase2MoonlightState.points.length-1];
    ctx.shadowBlur=24;
    ctx.shadowColor='rgba(212,175,55,.55)';
    ctx.fillStyle='rgba(43,38,32,.92)';
    ctx.beginPath();
    ctx.arc(last.x,last.y,3,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  phase2MoonlightState.raf=requestAnimationFrame(phase2MoonlightRender);
}

function phase2StartMoonlightRender(){
  if(phase2MoonlightState.raf)return;
  phase2MoonlightState.raf=requestAnimationFrame(phase2MoonlightRender);
}

function phase2ClearMoonlightCanvas(){
  if(phase2MoonlightState.raf){
    cancelAnimationFrame(phase2MoonlightState.raf);
    phase2MoonlightState.raf=0;
  }
  if(phase2MoonlightCtx){
    phase2MoonlightCtx.clearRect(0,0,phase2Page.clientWidth,phase2Page.clientHeight);
  }
}

function phase2MoonlightBegin(e){
  if(!phase2MoonlightHit||phase2MoonlightState.pointerId!==null)return;
  e.preventDefault();

  phase2MoonlightState.pointerId=e.pointerId;
  phase2MoonlightState.drawing=false;
  phase2MoonlightState.points=[];
  phase2MoonlightState.distance=0;
  phase2MoonlightState.last=phase2MoonlightPosition(e);
  phase2MoonlightState.downX=phase2MoonlightState.last.x;
  phase2MoonlightState.downY=phase2MoonlightState.last.y;
  phase2MoonlightState.downT=performance.now();
  clearTimeout(phase2MoonlightState.hintTimer);
  phase2MoonlightState.complete=false;

  try{phase2MoonlightHit.setPointerCapture(e.pointerId)}catch(_){}

  phase2MoonlightPrompt.classList.add('hidden');
  phase2MoonlightAura.classList.add('active');
  phase2MoonlightState.auraStarted=true;

  phase2StartMoonlightRender();

  if(phase2MoonInside(phase2MoonlightState.last)){
    phase2MoonlightState.drawing=true;
    phase2MoonlightState.points.push({...phase2MoonlightState.last,t:performance.now()});
  }

  phase2MoonlightNote.textContent='move across the moon';
  phase2MoonlightNote.classList.remove('show');
  void phase2MoonlightNote.offsetWidth;
  phase2MoonlightNote.classList.add('show');
}

function phase2MoonlightMove(e){
  if(!phase2MoonlightHit||phase2MoonlightState.pointerId!==e.pointerId)return;
  e.preventDefault();

  const p=phase2MoonlightPosition(e);
  const last=phase2MoonlightState.last||p;
  const step=Math.hypot(p.x-last.x,p.y-last.y);
  phase2MoonlightState.last=p;

  // Gesture can start anywhere. It becomes the actual moonlight interaction
  // automatically when the finger crosses the generous moon zone.
  if(!phase2MoonlightState.drawing){
    if(phase2MoonInside(p)){
      phase2MoonlightState.drawing=true;
      phase2MoonlightState.points.push({x:p.x,y:p.y,t:performance.now()});
      phase2MoonlightNote.textContent='keep drawing…';
    }else{
      return;
    }
  }

  if(step<1)return;

  phase2MoonlightState.distance+=step;
  phase2MoonlightState.points.push({x:p.x,y:p.y,t:performance.now()});

  const needed=Math.max(120,phase2Page.clientWidth*.46);
  const ratio=Math.min(1,phase2MoonlightState.distance/needed);
  phase2MoonlightAura.style.opacity=String(.26+.62*ratio);
  phase2MoonlightAura.style.transform=`translate(-50%,-50%) scale(${.94+ratio*.14})`;

  if(!phase2MoonlightState.complete&&ratio>=1){
    phase2MoonlightState.complete=true;
    phase2MoonlightAura.classList.add('complete');
    phase2MoonlightFlash.classList.remove('fire');
    void phase2MoonlightFlash.offsetWidth;
    phase2MoonlightFlash.classList.add('fire');

    phase2MoonlightNote.textContent='you left a little light here.';
    phase2MoonlightNote.classList.remove('show');
    void phase2MoonlightNote.offsetWidth;
    phase2MoonlightNote.classList.add('show');

    phase2Page.dispatchEvent(new CustomEvent('phase2:moonlight-complete'));
    if(window.trackStoryEvent)window.trackStoryEvent('moonlight-complete',{});
  }
}

function phase2MoonlightEnd(e){
  if(!phase2MoonlightHit||phase2MoonlightState.pointerId!==e.pointerId)return;
  if(e.type==='pointerup'){
    const tapDt=performance.now()-(phase2MoonlightState.downT||0);
    const tapUp=phase2MoonlightPosition(e);
    const tapMoved=Math.hypot(tapUp.x-(phase2MoonlightState.downX||0),tapUp.y-(phase2MoonlightState.downY||0));
    if(tapDt<450&&tapMoved<16&&phase2MoonInside({x:phase2MoonlightState.downX||0,y:phase2MoonlightState.downY||0})){
      openLostFrame();
    }
  }
  e.preventDefault();

  phase2MoonlightState.pointerId=null;
  phase2MoonlightState.drawing=false;
  try{phase2MoonlightHit.releasePointerCapture(e.pointerId)}catch(_){}

  clearTimeout(phase2MoonlightState.fadeTimer);
  phase2MoonlightState.fadeTimer=setTimeout(()=>{
    phase2MoonlightAura.classList.remove('active','complete');
    phase2MoonlightNote.classList.remove('show');
    phase2MoonlightState.points=[];
    if(phase2MoonlightCtx)phase2MoonlightCtx.clearRect(0,0,phase2Page.clientWidth,phase2Page.clientHeight);
  },phase2MoonlightState.complete?1100:220);
}

function resetPhase2Moonlight(){
  if(!phase2MoonlightHit)return;
  clearTimeout(phase2MoonlightState.fadeTimer);
  phase2MoonlightState.pointerId=null;
  phase2MoonlightState.drawing=false;
  phase2MoonlightState.points=[];
  phase2MoonlightState.distance=0;
  phase2MoonlightState.last=null;
  phase2MoonlightState.downX=0;
  phase2MoonlightState.downY=0;
  phase2MoonlightState.downT=0;
  clearTimeout(phase2MoonlightState.hintTimer);
  phase2MoonlightState.complete=false;

  phase2MoonlightAura.classList.remove('active','complete');
  phase2MoonlightAura.style.opacity='';
  phase2MoonlightAura.style.transform='';
  phase2MoonlightFlash.classList.remove('fire');
  phase2MoonlightPrompt.classList.remove('hidden');
  phase2MoonlightNote.classList.remove('show');
  phase2MoonlightNote.textContent='';
  phase2ClearMoonlightCanvas();

  if(phase2MoonlightLayer)phase2MoonlightLayer.setAttribute('aria-hidden','true');
}

function activatePhase2Moonlight(){
  if(!phase2MoonlightHit)return;
  // Make the gesture target full-screen at runtime so mobile browser hit-testing
  // cannot miss because of video cropping or a small moon hit-circle.
  phase2MoonlightHit.style.position='absolute';
  phase2MoonlightHit.style.inset='0';
  phase2MoonlightHit.style.left='0';
  phase2MoonlightHit.style.top='0';
  phase2MoonlightHit.style.width='100%';
  phase2MoonlightHit.style.height='100%';
  phase2MoonlightHit.style.maxWidth='none';
  phase2MoonlightHit.style.transform='none';
  phase2MoonlightHit.style.borderRadius='0';
  phase2MoonlightHit.style.zIndex='6';
  phase2MoonlightHit.style.pointerEvents='auto';
  phase2MoonlightHit.style.touchAction='none';
  resetPhase2Moonlight();
  phase2MoonlightLayer.setAttribute('aria-hidden','false');
  phase2MoonlightPrompt.classList.remove('hidden');
  phase2MoonlightPrompt.style.animation='none';
  void phase2MoonlightPrompt.offsetWidth;
  phase2MoonlightPrompt.style.animation='';
  resizePhase2MoonlightCanvas();
  positionPhase2MoonEffects();
  clearTimeout(phase2MoonlightState.hintTimer);
  phase2MoonlightState.hintTimer=setTimeout(()=>{
    if(!phase2MoonlightState.complete&&!phase2MoonlightState.drawing&&lostFrame&&!lostFrame.classList.contains('open')){
      phase2MoonlightNote.textContent='psst… tap the moon.';
      phase2MoonlightNote.classList.remove('show');
      void phase2MoonlightNote.offsetWidth;
      phase2MoonlightNote.classList.add('show');
    }
  },7000);
}

// When leaving the moon page the full-screen gesture layer must stop
// intercepting taps — a child with pointer-events:auto stays hittable even
// when its parent page is pointer-events:none, so without this it silently
// eats every forward button on every page (the back button sits above it,
// which is why only back kept working).
function deactivatePhase2MoonlightHit(){
  if(!phase2MoonlightHit)return;
  phase2MoonlightHit.style.pointerEvents='none';
}

if(phase2MoonlightHit){
  phase2MoonlightHit.addEventListener('pointerdown',phase2MoonlightBegin,{passive:false});
  phase2MoonlightHit.addEventListener('pointermove',phase2MoonlightMove,{passive:false});
  phase2MoonlightHit.addEventListener('pointerup',phase2MoonlightEnd,{passive:false});
  phase2MoonlightHit.addEventListener('pointercancel',phase2MoonlightEnd,{passive:false});
  phase2MoonlightHit.addEventListener('lostpointercapture',()=>{
    if(phase2MoonlightState.pointerId!==null){
      phase2MoonlightState.pointerId=null;
      phase2MoonlightState.drawing=false;
    }
  });

  phase2MoonlightHit.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    e.preventDefault();
    phase2MoonlightState.complete=false;
    phase2MoonlightAura.classList.add('active');
    phase2MoonlightState.drawing=true;
    phase2MoonlightState.distance=Math.max(120,phase2Page.clientWidth*.46);
    phase2MoonlightState.last=phase2MoonPoint();
    phase2MoonlightState.complete=true;
    phase2MoonlightAura.classList.add('complete');
    phase2MoonlightFlash.classList.remove('fire');
    void phase2MoonlightFlash.offsetWidth;
    phase2MoonlightFlash.classList.add('fire');
  });
}

function enterPhase2(){
  phase1Ending=false;
  const overlay=document.getElementById('codeReveal');
  if(overlay){
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
  }
  activatePhase2Moonlight();
  playPhase2Song();
  playPhase2Video();
  go(7);
}

const enterPhase2Button=document.getElementById('enterPhase2');
if(enterPhase2Button){
  enterPhase2Button.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    enterPhase2();
  });
}

// One clean Phase 2 wrapper: leaving Phase 2 stops both media.
// No room/Lost Frame/fullscreen navigation layer.
const phase2BaseGo=go;
go=function(n){
  if(i===7 && n!==7){
    pausePhase2Song();
    stopPhase2Video();
    closeLostFrame();
    deactivatePhase2MoonlightHit();
  }
  if(i===8 && n!==8){
    closeHerVideo();
  }
  return phase2BaseGo(n);
};

/* ===== Umami analytics: birthday experience instrumentation =====
   Privacy boundary:
   - Uses Umami's anonymous session model.
   - Does not send names, email addresses, uploaded filenames, photo contents,
     GPS coordinates, or the secret code itself.
   - Owner/test mode is excluded so your own testing does not pollute production data.
*/
(function initBirthdayAnalytics(){
  // Our script runs before Umami's deferred tracker, so events fired early
  // would be silently dropped. Queue them and flush once Umami is ready.
  const queue=[];
  let umamiReady=false,identified=false;
  const isOwner=new URLSearchParams(location.search).has('owner');
  const send=(name,data={})=>{
    try{
      if(isOwner)return;
      if(umamiReady&&window.umami&&typeof window.umami.track==='function'){
        window.umami.track(name,data);
      }else{
        queue.push([name,data]);
        if(queue.length>60)queue.shift();
      }
    }catch(_){}
  };
  const flush=()=>{
    try{
      if(isOwner||!window.umami||typeof window.umami.track!=='function')return;
      umamiReady=true;
      if(!identified&&typeof window.umami.identify==='function'){
        identified=true;
        window.umami.identify({experience:'kashish-birthday',version:'phase-3'});
      }
      while(queue.length){
        const item=queue.shift();
        try{window.umami.track(item[0],item[1]);}catch(_){}
      }
    }catch(_){}
  };
  let polls=0;
  const pollTimer=setInterval(()=>{flush();if(umamiReady||++polls>40)clearInterval(pollTimer);},250);
  window.addEventListener('load',flush);
  // Interaction code later in this file reports milestones through this.
  window.trackStoryEvent=send;

  const safeSource=()=>{
    const q=new URLSearchParams(location.search);
    const keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','from'];
    const out={};
    keys.forEach(k=>{const v=q.get(k);if(v)out[k]=v.slice(0,120)});
    return out;
  };

  // Umami automatically records pageviews, referrers, URL, language, screen,
  // device/browser and performance data. We add the story-specific layer.
  send('site-loaded',{experience:'birthday',entry_page:1});

  const source=safeSource();
  if(Object.keys(source).length)send('link-source',source);

  // Session labeling happens inside flush(), once Umami is actually ready.

  // Navigation: record every story page reached.
  const previousGo=window.go;
  if(typeof previousGo==='function'){
    window.go=function(n){
      const from=window.sitePageIndex;
      const result=previousGo(n);
      if(from!==n){
        send('phase-view',{phase:n+1,from_page:from+1});
        send('phase-transition',{from_page:from+1,to_page:n+1,direction:n>from?'forward':'back'});
      }
      return result;
    };
  }

  // Page-1 CTA.
  document.querySelectorAll('.page .next').forEach((el)=>{
    el.addEventListener('click',()=>send('continue-click',{page:Number(el.closest('.page')?.id?.replace('p',''))||0}));
  });

  // Phase 1 milestone events.
  const code=document.getElementById('code');
  const unlock=document.getElementById('unlock');
  if(unlock)unlock.addEventListener('click',()=>{
    const value=(code?.value||'').trim().toUpperCase();
    send('code-attempt',{result:value===activeUnlockCode()?'correct':'incorrect'});
  });

  const enter2=document.getElementById('enterPhase2');
  if(enter2)enter2.addEventListener('click',()=>send('phase-1-complete',{phase:1}));

  // Chocolate proof: never send the filename or image itself.
  const upload=document.getElementById('proofUpload');
  if(upload)upload.addEventListener('change',()=>{
    if(upload.files?.length)send('proof-photo-selected',{type:'image'});
  });

  const originalFetch=window.fetch;
  window.fetch=function(...args){
    const url=String(args[0]||'');
    const p=originalFetch.apply(this,args);
    if(url.includes('api.cloudinary.com/v1_1/aifv5z3a/image/upload')){
      p.then(r=>{
        send(r.ok?'proof-upload-success':'proof-upload-failed',{service:'cloudinary'});
      }).catch(()=>send('proof-upload-failed',{service:'cloudinary',reason:'network'}));
    }
    return p;
  };

  // Letter interaction: track the meaningful milestones, not every tap count.
  const envelope=document.getElementById('secretEnvelope');
  let envelopeTaps=0;
  if(envelope)envelope.addEventListener('click',()=>{
    envelopeTaps++;
    if(envelopeTaps===1)send('letter-discovered',{});
    if(envelopeTaps===9)send('letter-unlocked',{taps:9});
  });
  const letter=document.getElementById('letterPop');
  if(letter){
    let letterOpened=false;
    const observer=new MutationObserver(()=>{
      if(letter.classList.contains('open')&&!letterOpened){
        letterOpened=true;
        send('letter-opened',{});
      }
    });
    observer.observe(letter,{attributes:true,attributeFilter:['class']});
  }

  // Phase 2 interactions (moonlight drawing, Lost Frame) are tracked at their
  // source via window.trackStoryEvent. Back navigation is still useful here.
  const back=document.getElementById('globalBack');
  if(back)back.addEventListener('click',()=>send('back-navigation',{from_page:window.sitePageIndex+1}));

  // Send one event when the page is being left; this is not a replacement for
  // Umami's session/realtime data, just a clean story-level endpoint.
  let leftSent=false;
  const markLeft=()=>{
    if(leftSent)return;
    leftSent=true;
    send('site-exit',{last_page:(window.sitePageIndex||0)+1});
  };
  window.addEventListener('pagehide',markLeft,{once:true});
})();


/* ===== Phase 2 — The Lost Frame (tap the moon) ===== */
const lostFrame=document.getElementById('lostFrame');
const lfIntro=document.getElementById('lfIntro');
const lfRail=document.getElementById('lfRail');
const lfSecret=document.getElementById('lfSecret');
const lfDetail=document.getElementById('lfDetail');
const lfTitle=document.getElementById('lfTitle');
const lfNote=document.getElementById('lfNote');
const lfNotes=['you always notice the quiet ones.','three years later and this one still feels familiar.','not everything needs a reason.','there is something hiding here.','you nearly skipped this one.','19. that\'s all.','okay… you found the frame i didn\'t label.','maybe the last frame isn\'t actually the last.'];
let lostFrameOpen=false;

function openLostFrame(){
  if(!lostFrame||lostFrameOpen)return;
  lostFrameOpen=true;
  if(typeof phase2MoonlightState!=='undefined')clearTimeout(phase2MoonlightState.hintTimer);
  resetPhase2Moonlight();
  const back=document.getElementById('globalBack');
  if(back)back.style.display='none';
  lfIntro.classList.remove('hidden');
  lfRail.classList.remove('show');
  lfSecret.classList.remove('show');
  lfDetail.classList.remove('open');
  lostFrame.classList.add('open');
  lostFrame.setAttribute('aria-hidden','false');
  if(window.trackStoryEvent)window.trackStoryEvent('lost-frame-opened',{});
}
function closeLostFrame(){
  if(!lostFrame||!lostFrameOpen)return;
  lostFrameOpen=false;
  if(window.trackStoryEvent)window.trackStoryEvent('lost-frame-closed',{});
  phase2LostDone=true;maybeShowPhase3Cta();
  lfDetail.classList.remove('open');
  lostFrame.classList.remove('open');
  lostFrame.setAttribute('aria-hidden','true');
  if(typeof syncGlobalBack==='function')syncGlobalBack();
}
const lfEnterBtn=document.getElementById('lfEnter');
if(lfEnterBtn)lfEnterBtn.addEventListener('click',()=>{
  lfIntro.classList.add('hidden');
  setTimeout(()=>lfRail.classList.add('show'),250);
});
/* Frames are drag-only now: no tap-to-open detail. */
const lfDetailClose=document.getElementById('lfDetailClose');
if(lfDetailClose)lfDetailClose.addEventListener('click',e=>{
  e.stopPropagation();
  lfDetail.classList.remove('open');
});
if(lfDetail)lfDetail.addEventListener('click',e=>{
  if(e.target===lfDetail)lfDetail.classList.remove('open');
});
/* "there's more" is reserved for future slides/phases — parked for now. */
/* "there's more" button: gated — it appears only after she finishes the moonlight
   drawing AND has opened + closed the Lost Frame (phase 2 fully explored). */
const lostFrameCta=document.getElementById('lostFrameCta');
if(lostFrameCta)lostFrameCta.addEventListener('click',e=>{e.stopPropagation();if(window.trackStoryEvent)window.trackStoryEvent('phase3-cta-click',{});go(8);});
let phase2MoonDone=false,phase2LostDone=false;
function maybeShowPhase3Cta(){
  if(phase2MoonDone&&phase2LostDone&&lostFrameCta)lostFrameCta.classList.add('show');
}
const phase2PageEl=document.getElementById('p8');
if(phase2PageEl)phase2PageEl.addEventListener('phase2:moonlight-complete',()=>{
  phase2MoonDone=true;maybeShowPhase3Cta();
});
const lfCloseBtn=document.getElementById('lfClose');
if(lfCloseBtn)lfCloseBtn.addEventListener('click',e=>{
  e.stopPropagation();
  closeLostFrame();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(lfDetail)lfDetail.classList.remove('open');
    closeLostFrame();
  }
});

/* ===== Phase 3 — Constellation =====
   Add photos later: set `photo` to the image URL (or repo path, e.g. 'mem-1.jpg').
   Titles/captions below are placeholders — replace with the real ones anytime. */
const CONSTELLATION_MEMORIES=[
  {title:'the first hello',caption:'where it all started ♡',photo:null},
  {title:'that laugh',caption:'you know the one.',photo:null},
  {title:'4:18 pm',caption:'an ordinary day, my favorite memory.',photo:null},
  {title:'the song',caption:'ours, on repeat.',photo:null},
  {title:'almost said it',caption:'you felt it too.',photo:null},
  {title:'the long walk',caption:'we took the long way home.',photo:null},
  {title:'today',caption:'still my favorite.',photo:null,video:'https://raw.githubusercontent.com/Sans-beep/sanskar-ka/3cb9941f7a75032fbbcf2df233349d0e4b49c611/her-video.mp4'},
];
const CONSTELLATION_STARS=[
  {x:72,y:22,pink:true},{x:50,y:30},{x:28,y:22},{x:20,y:46},{x:50,y:76},{x:66,y:62},{x:80,y:46}
];
const CONSTELLATION_HEART=[2,1,0,6,5,4,3,2];
const constFound=new Set();
let constFinaleShown=false;

function initConstellation(){
  const sky=document.getElementById('constSky');
  if(!sky||sky.dataset.init)return;
  sky.dataset.init='1';
  CONSTELLATION_STARS.forEach((s,idx)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='const-star'+(s.pink?' pink':'');
    b.style.left=s.x+'%';
    b.style.top=s.y+'%';
    b.style.animationDelay=(idx*0.45)+'s';
    b.textContent=s.pink?'✦':'✧';
    b.setAttribute('aria-label','memory star '+(idx+1));
    b.addEventListener('click',e=>{e.stopPropagation();openConstMemory(idx);});
    sky.appendChild(b);
  });
  const close=document.getElementById('constClose');
  if(close)close.addEventListener('click',e=>{e.stopPropagation();closeConstMemory();});
}

function markConstFound(idx){
  if(constFound.has(idx))return false;
  const m=CONSTELLATION_MEMORIES[idx];
  constFound.add(idx);
  const sky=document.getElementById('constSky');
  const star=document.querySelectorAll('#constSky .const-star')[idx];
  if(star){
    star.classList.add('found');star.classList.remove('pink');
    if(sky){
      const r=star.getBoundingClientRect(),sr=sky.getBoundingClientRect();
      constBurst(r.left-sr.left+r.width/2,r.top-sr.top+r.height/2,true);
    }
  }
  if(sky){
    const lab=document.createElement('span');
    lab.className='const-label';lab.textContent=m.title;
    lab.style.left=CONSTELLATION_STARS[idx].x+'%';
    lab.style.top=CONSTELLATION_STARS[idx].y+'%';
    sky.appendChild(lab);
  }
  document.getElementById('constCount').textContent=constFound.size+' / '+CONSTELLATION_STARS.length;
  if(window.trackStoryEvent)window.trackStoryEvent('memory-found',{star:idx+1});
  drawConstProgress();
  return true;
}

/* The video star ("today"): no photo card — the video is the finale reward.
   Tapping it marks it found like any star; the cinematic plays once all 7
   are found. Tapping it again after the finale replays the video. */
function openVideoStar(idx){
  const newly=markConstFound(idx);
  const left=CONSTELLATION_STARS.length-constFound.size;
  const hint=document.getElementById('constHint');
  if(hint){
    if(left>0){
      hint.textContent=newly?"this one's saved for last ♡":(left+' more hiding ✦');
      hint.classList.remove('hide');
    }else hint.classList.add('hide');
  }
  if(left===0&&!constFinaleShown){
    constFinaleShown=true;
    setTimeout(runConstFinale,900);
  }else if(!newly&&constFinaleShown){
    openHerVideo();
  }
}

function openConstMemory(idx){
  const m=CONSTELLATION_MEMORIES[idx];
  if(!m)return;
  if(m.video){openVideoStar(idx);return;}
  const card=document.getElementById('constCard');
  if(!card)return;
  const photo=document.getElementById('constPhoto');
  document.getElementById('constTitle').textContent=m.title;
  document.getElementById('constText').textContent=m.caption;
  if(photo)photo.innerHTML=m.photo
    ? '<img src="'+m.photo+'" alt="">'
    : '<div class="ph-empty">✦</div>';
  card.classList.add('open');
  card.setAttribute('aria-hidden','false');
  card.style.setProperty('--tilt',((idx%2?1:-1)*(1+(idx%3)*.6)).toFixed(1)+'deg');
  markConstFound(idx);
  const left=CONSTELLATION_STARS.length-constFound.size;
  const hint=document.getElementById('constHint');
  if(hint){
    if(left>0){hint.textContent=left+' more hiding ✦';hint.classList.remove('hide');}
    else hint.classList.add('hide');
  }
}

function closeConstMemory(){
  const card=document.getElementById('constCard');
  if(card){card.classList.remove('open');card.setAttribute('aria-hidden','true');}
  if(constFound.size===CONSTELLATION_STARS.length&&!constFinaleShown){
    constFinaleShown=true;
    setTimeout(runConstFinale,450);
  }
}

function runConstFinale(){
  const sky=document.getElementById('constSky');
  const svg=document.getElementById('constLines');
  if(!sky||!svg)return;
  svg.innerHTML='';
  const W=sky.clientWidth,H=sky.clientHeight;
  const pts=CONSTELLATION_HEART.map(k=>{
    const s=CONSTELLATION_STARS[k];
    return (s.x/100*W).toFixed(1)+','+(s.y/100*H).toFixed(1);
  });
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d','M'+pts.join(' L')+' Z');
  svg.appendChild(path);
  let len=1200;
  try{len=path.getTotalLength();}catch(e){/* jsdom lacks SVG geometry; real browsers are fine */}
  path.style.strokeDasharray=len;
  path.style.strokeDashoffset=len;
  path.getBoundingClientRect();
  path.style.transition='stroke-dashoffset 2.6s ease-in-out';
  path.style.strokeDashoffset='0';
  if(window.trackStoryEvent)window.trackStoryEvent('constellation-complete',{stars:CONSTELLATION_STARS.length});
  CONSTELLATION_HEART.forEach((k,i)=>{
    const s=CONSTELLATION_STARS[k];
    setTimeout(()=>constBurst(s.x/100*W,s.y/100*H,true),900+i*160);
  });
  document.getElementById('constHint').classList.add('hide');
  setTimeout(()=>{
    const f=document.getElementById('constFinale');
    if(f){f.classList.add('show');f.setAttribute('aria-hidden','false');}
  },1400);
  // After the heart finishes drawing, dive toward her star — then her video.
  herZoomT=setTimeout(zoomToHer,3600);
}

/* Finale cinematic: zoom the whole sky toward her star, then fade in the
   fullscreen video. Pending timeouts are cleared if she leaves mid-flight. */
let herZoomT=0,herVideoT=0,herVideoPlayed=false;
function zoomToHer(){
  if(window.sitePageIndex!==8)return;
  const sky=document.getElementById('constSky');
  const p9=document.getElementById('p9');
  if(!sky||!p9)return;
  const s=CONSTELLATION_STARS[6];
  const x=s.x/100*sky.clientWidth,y=s.y/100*sky.clientHeight;
  p9.classList.add('zooming','cine');
  sky.style.transformOrigin=x.toFixed(1)+'px '+y.toFixed(1)+'px';
  void sky.offsetWidth;
  sky.style.transform='scale(2.8)';
  herVideoT=setTimeout(openHerVideo,2500);
}
function openHerVideo(){
  if(window.sitePageIndex!==8)return;
  const ov=document.getElementById('herVideo');
  const v=document.getElementById('herVideoEl');
  if(!ov||!v)return;
  document.getElementById('herMuted').classList.add('hidden');
  ov.classList.add('open');
  ov.setAttribute('aria-hidden','false');
  try{v.currentTime=0;}catch(e){}
  v.muted=false;
  const pr=v.play();
  if(pr&&typeof pr.catch==='function')pr.catch(()=>{
    // Browser blocked sound: keep it looping muted; tapping the video unmutes.
    v.muted=true;
    try{v.play();}catch(e){}
    document.getElementById('herMuted').classList.remove('hidden');
  });
  if(!herVideoPlayed){
    herVideoPlayed=true;
    if(window.trackStoryEvent)window.trackStoryEvent('her-video-played',{});
  }
}
function closeHerVideo(){
  clearTimeout(herZoomT);clearTimeout(herVideoT);
  const v=document.getElementById('herVideoEl');
  if(v){try{v.pause();}catch(e){}}
  const ov=document.getElementById('herVideo');
  if(ov){ov.classList.remove('open');ov.setAttribute('aria-hidden','true');}
  const p9=document.getElementById('p9');
  if(p9)p9.classList.remove('zooming','cine');
  const sky=document.getElementById('constSky');
  if(sky){sky.style.transform='';sky.style.transformOrigin='';}
  if(typeof syncGlobalBack==='function')syncGlobalBack();
}
(function wireHerVideo(){
  const v=document.getElementById('herVideoEl');
  if(v)v.addEventListener('click',()=>{
    if(v.muted){
      v.muted=false;
      document.getElementById('herMuted').classList.add('hidden');
    }
  });
  const hb=document.getElementById('herBack');
  if(hb)hb.addEventListener('click',closeHerVideo);
})();

initConstellation();

/* ===== Phase 3 — living night sky engine =====
   Twinkling starfield + nebula + milky way + shooting stars on canvas,
   tap-anywhere sparkle bursts, parallax, proximity glow on memory stars,
   and progressive constellation lines as memories are found. */
const constSkyState={raf:0,stars:[],parts:[],shoot:null,nextShoot:0,px:0,py:0,tpx:0,tpy:0,W:0,H:0,neb:null,dpr:1};

function constSkySetup(){
  const sky=document.getElementById('constSky');
  const cv=document.getElementById('constBg');
  if(!sky||!cv||sky.dataset.sky)return;
  sky.dataset.sky='1';
  for(let k=0;k<130;k++){
    constSkyState.stars.push({
      x:Math.random(),y:Math.random(),
      r:.4+Math.random()*1.3,
      ph:Math.random()*Math.PI*2,
      sp:.6+Math.random()*1.8,
      depth:.25+Math.random()*.75,
      warm:Math.random()<.22
    });
  }
  constSkyState.nextShoot=performance.now()+2500+Math.random()*4000;
  sky.addEventListener('pointermove',e=>{
    const r=sky.getBoundingClientRect();
    constSkyState.tpx=((e.clientX-r.left)/r.width-.5)*2;
    constSkyState.tpy=((e.clientY-r.top)/r.height-.5)*2;
    constelProximity(e.clientX,e.clientY);
  },{passive:true});
  sky.addEventListener('pointerdown',e=>{
    if(e.target.closest('.const-star,.const-card,.const-finale'))return;
    const r=sky.getBoundingClientRect();
    constBurst(e.clientX-r.left,e.clientY-r.top,false);
  },{passive:true});
  window.addEventListener('resize',()=>{constSkyResize();drawConstProgress();},{passive:true});
  constSkyResize();
}

function constSkyResize(){
  const sky=document.getElementById('constSky');
  const cv=document.getElementById('constBg');
  if(!sky||!cv)return;
  const r=sky.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,1.5);
  const W=Math.max(1,Math.round(r.width)),H=Math.max(1,Math.round(r.height));
  constSkyState.W=W;constSkyState.H=H;constSkyState.dpr=dpr;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  const neb=document.createElement('canvas');neb.width=W;neb.height=H;
  const nx=neb.getContext('2d');
  if(nx){
  const blobs=[[.2,.25,.5,'91,60,140'],[.85,.7,.55,'40,70,160'],[.6,.12,.4,'150,80,120']];
  blobs.forEach(b=>{
    const g=nx.createRadialGradient(b[0]*W,b[1]*H,0,b[0]*W,b[1]*H,Math.max(W,H)*b[2]);
    g.addColorStop(0,'rgba('+b[3]+',.14)');g.addColorStop(1,'rgba('+b[3]+',0)');
    nx.fillStyle=g;nx.fillRect(0,0,W,H);
  });
  nx.save();nx.translate(W*.5,H*.45);nx.rotate(-.5);
  const mg=nx.createLinearGradient(0,-H*.28,0,H*.28);
  mg.addColorStop(0,'rgba(150,170,220,0)');mg.addColorStop(.5,'rgba(150,170,220,.10)');mg.addColorStop(1,'rgba(150,170,220,0)');
  nx.fillStyle=mg;nx.fillRect(-W,-H*.28,W*2,H*.56);nx.restore();
  constSkyState.neb=neb;
  }
}

function constSkyTick(now){
  const st=constSkyState;
  if(!st.raf)return;
  const cv=document.getElementById('constBg');
  if(!cv){st.raf=0;return;}
  const ctx=cv.getContext('2d');
  if(!ctx){st.raf=requestAnimationFrame(constSkyTick);return;}
  const W=st.W,H=st.H,dpr=st.dpr||1;
  if(!W||!H){st.raf=requestAnimationFrame(constSkyTick);return;}
  st.px+=(st.tpx-st.px)*.06;st.py+=(st.tpy-st.py)*.06;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  if(st.neb)ctx.drawImage(st.neb,0,0,W,H);
  const t=now/1000;
  for(const s of st.stars){
    const tw=.45+.55*Math.abs(Math.sin(t*s.sp+s.ph));
    ctx.globalAlpha=tw*(.35+.65*s.depth);
    ctx.fillStyle=s.warm?'#ffe3b3':'#dfe9ff';
    ctx.beginPath();
    ctx.arc(s.x*W+st.px*16*s.depth,s.y*H+st.py*12*s.depth,s.r,0,6.2832);
    ctx.fill();
  }
  ctx.globalAlpha=1;
  if(!st.shoot&&now>st.nextShoot){
    st.shoot={x:W*(.15+Math.random()*.7),y:-20,vx:-(4+Math.random()*4),vy:5+Math.random()*3,life:1};
    st.nextShoot=now+5000+Math.random()*6000;
  }
  if(st.shoot){
    const sh=st.shoot;
    sh.x+=sh.vx;sh.y+=sh.vy;sh.life-=.022;
    if(sh.life<=0||sh.y>H+40)st.shoot=null;
    else{
      const grad=ctx.createLinearGradient(sh.x,sh.y,sh.x-sh.vx*10,sh.y-sh.vy*10);
      grad.addColorStop(0,'rgba(255,255,255,'+(.9*sh.life).toFixed(2)+')');
      grad.addColorStop(1,'rgba(255,255,255,0)');
      ctx.strokeStyle=grad;ctx.lineWidth=2;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(sh.x,sh.y);ctx.lineTo(sh.x-sh.vx*10,sh.y-sh.vy*10);ctx.stroke();
    }
  }
  const ps=st.parts;
  for(let k=ps.length-1;k>=0;k--){
    const p=ps[k];
    p.x+=p.vx;p.y+=p.vy;p.vy+=.03;p.life-=p.decay;
    if(p.life<=0){ps.splice(k,1);continue;}
    ctx.globalAlpha=Math.max(0,p.life);
    ctx.fillStyle=p.color;
    ctx.beginPath();ctx.arc(p.x,p.y,p.size*(.5+p.life*.5),0,6.2832);ctx.fill();
  }
  ctx.globalAlpha=1;
  st.raf=requestAnimationFrame(constSkyTick);
}

function startConstSky(){
  constSkySetup();
  const st=constSkyState;
  if(st.raf)return;
  st.raf=requestAnimationFrame(constSkyTick);
}
function stopConstSky(){
  const st=constSkyState;
  if(st.raf){cancelAnimationFrame(st.raf);st.raf=0;}
}

function constBurst(x,y,big){
  const st=constSkyState;
  const n=big?26:12;
  for(let k=0;k<n;k++){
    const a=Math.random()*Math.PI*2,sp=(big?2.6:1.8)*(.4+Math.random());
    st.parts.push({x:x,y:y,
      vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-.6,
      life:1,decay:.02+Math.random()*.02,
      size:1+Math.random()*(big?2.6:1.8),
      color:Math.random()<.5?'#ffd98a':'#fff6e6'});
  }
  if(st.parts.length>320)st.parts.splice(0,st.parts.length-320);
}

function constelProximity(cx,cy){
  const stars=document.querySelectorAll('#constSky .const-star');
  stars.forEach(b=>{
    const r=b.getBoundingClientRect();
    const dx=cx-(r.left+r.width/2),dy=cy-(r.top+r.height/2);
    b.classList.toggle('near',Math.hypot(dx,dy)<110);
  });
}

/* Faint gold segments join found stars in heart order — the constellation
   builds as she finds memories; the finale redraws it in full glory. */
function drawConstProgress(){
  const svg=document.getElementById('constLines');
  const sky=document.getElementById('constSky');
  if(!svg||!sky||constFinaleShown)return;
  const W=sky.clientWidth,H=sky.clientHeight;
  if(!W||!H)return;
  svg.innerHTML='';
  const order=CONSTELLATION_HEART;
  for(let k=0;k<order.length-1;k++){
    const a=order[k],b=order[k+1];
    if(!constFound.has(a)||!constFound.has(b))continue;
    const sa=CONSTELLATION_STARS[a],sb=CONSTELLATION_STARS[b];
    const ln=document.createElementNS('http://www.w3.org/2000/svg','line');
    ln.setAttribute('x1',(sa.x/100*W).toFixed(1));ln.setAttribute('y1',(sa.y/100*H).toFixed(1));
    ln.setAttribute('x2',(sb.x/100*W).toFixed(1));ln.setAttribute('y2',(sb.y/100*H).toFixed(1));
    ln.setAttribute('class','const-seg');
    svg.appendChild(ln);
  }
}


/* ===== Make your own — customizable copies for followers =====
   A follower opens "make your own ♡", fills in names / code / date /
   memories, and gets a personalized link (details live in the URL hash).
   Opening such a link swaps the personal content in place. The default
   experience (no hash) stays exactly the user's own.
   Privacy: the hash is stripped from the address bar right after reading,
   so personal names never reach Umami pageview URLs. */
function escHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function readCustomParams(){
  const out={mems:[]};
  try{
    const h=location.hash.replace(/^#/,'');
    if(!h)return out;
    const q=new URLSearchParams(h);
    ['to','from','code','date'].forEach(k=>{const v=(q.get(k)||'').trim();if(v)out[k]=v;});
    for(let k=1;k<=7;k++){
      const v=q.get('m'+k);
      if(v==null)continue;
      const i=v.indexOf('|');
      out.mems.push([i<0?v:v.slice(0,i),i<0?'':v.slice(i+1)]);
    }
  }catch(e){}
  return out;
}
const customParams=readCustomParams();
const customCodeValue=(customParams.code||'').toUpperCase().slice(0,16)||null;
function activeUnlockCode(){return customCodeValue||'KASHISH19';}
function applyCustomization(){
  const cp=customParams;
  const has=cp.to||cp.from||cp.date||cp.mems.length;
  if(location.hash){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
  if(!has)return;
  if(cp.to){
    document.title='For '+cp.to+' ♡';
    const hero=document.querySelector('#p1 .script.hero');
    if(hero)hero.innerHTML='Hey<br>'+escHtml(cp.to);
    const fk=document.querySelector('#p1 .top span:first-child');
    if(fk)fk.textContent='FOR '+cp.to.toUpperCase();
    const lt=document.querySelector('.letter-title');
    if(lt)lt.textContent='For '+cp.to+', ♡';
    const ta=document.querySelector('.throwback-photo img');
    if(ta)ta.alt='A childhood birthday memory of '+cp.to;
  }
  if(cp.from){
    const sig=document.getElementById('letterSig');
    if(sig)sig.textContent='— '+cp.from+' ♡';
  }
  if(cp.date){
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(cp.date);
    if(m){
      const disp=m[3]+'.'+m[2]+'.'+m[1].slice(2);
      document.querySelectorAll('.top span').forEach(s=>{
        if(s.textContent.trim()==='19.10.26')s.textContent=disp;
      });
    }
  }
  cp.mems.forEach((pair,k)=>{
    if(k<CONSTELLATION_MEMORIES.length){
      if(pair[0])CONSTELLATION_MEMORIES[k].title=pair[0];
      if(pair[1])CONSTELLATION_MEMORIES[k].caption=pair[1];
    }
  });
}
applyCustomization();
