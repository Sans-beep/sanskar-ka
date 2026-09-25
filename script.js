
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
function unlock(){
  const owner = new URLSearchParams(location.search).has('owner');
  const v=document.getElementById('code').value.trim().toUpperCase();
  const e=document.getElementById('error');
  const input=document.getElementById('code');
  const button=document.getElementById('unlock');

  if(owner || v==='KASHISH19'){
    e.textContent='';
    input.disabled=true;
    button.disabled=true;
    runPhase1Ending();
  }else{
    e.textContent='Oh my bhondu girl not today 😭🫶🏻';
    input.value='';
  }
}document.getElementById('unlock').onclick=unlock;
document.getElementById('code').onkeydown=e=>{if(e.key==='Enter')unlock()};
const ownerMode=new URLSearchParams(location.search).has('owner');
const proofUpload=document.getElementById('proofUpload'), proofPhoto=document.getElementById('proofPhoto'), proofImage=document.getElementById('proofImage'), uploadStatus=document.getElementById('uploadStatus'), p4Next=document.getElementById('p4Next');
if(ownerMode){
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
  phase2Videos.forEach(v=>{
    v.pause();
    try{v.currentTime=0}catch(_){}
    v.classList.remove('is-visible');
  });
  if(phase2Videos[0])phase2Videos[0].classList.add('is-visible');
  phase2VideoIndex=0;
}

function enterPhase2(){
  phase1Ending=false;
  const overlay=document.getElementById('codeReveal');
  if(overlay){
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
  }
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
  const send=(name,data={})=>{
    try{
      if(new URLSearchParams(location.search).has('owner') || !window.umami || typeof window.umami.track!=='function') return;
      window.umami.track(name,data);
    }catch(_){}
  };

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

  // Keep the current session labeled without assigning a persistent identity.
  try{
    if(!new URLSearchParams(location.search).has('owner') && window.umami && typeof window.umami.identify==='function'){
      window.umami.identify({experience:'kashish-birthday',version:'phase-1'});
    }
  }catch(_){}

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
    send('code-attempt',{result:value==='KASHISH19'?'correct':'incorrect'});
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
    const observer=new MutationObserver(()=>{
      if(letter.classList.contains('open'))send('letter-opened',{});
    });
    observer.observe(letter,{attributes:true,attributeFilter:['class']});
  }

  // Phase 2 is intentionally just the cinematic video + song for now.
  // Back navigation is useful for understanding exploration.
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

