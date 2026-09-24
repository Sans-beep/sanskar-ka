
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
    '5-6':'paperIn .86s cubic-bezier(.18,.86,.18,1) both',
    '6-7':'pullIn .8s cubic-bezier(.2,.84,.18,1) both'
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
document.addEventListener('click',e=>{
  const nextButton=e.target.closest('.next');
  if(!nextButton)return;
  e.preventDefault();
  e.stopPropagation();
  if(busy)return;
  const page=nextButton.closest('.page');
  if(!page || pages[i]!==page)return;
  if(i<pages.length-1)go(i+1);
},true);

const globalBack=document.getElementById('globalBack');
function syncGlobalBack(){const show=i>0&&!phase1Ending;globalBack.style.display=show?"flex":"none";globalBack.classList.toggle("show",show);}
globalBack.addEventListener('click',e=>{
  e.preventDefault();
  e.stopPropagation();
  if(busy || i===0)return;
  go(i-1);
});
syncGlobalBack();

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
  const v=document.getElementById('code').value.trim().toUpperCase();
  const e=document.getElementById('error');
  const input=document.getElementById('code');
  const button=document.getElementById('unlock');
  if(v==='KASHISH19'){
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

/* ===== Phase 2 — 19 Doors ===== */
const phase2Entrance=document.getElementById('p8');
const phase2Hallway=document.getElementById('p9');
const phase2Room=document.getElementById('phase2Room');
const doubleDoor=document.getElementById('doubleDoor');
const pushMessage=document.getElementById('pushMessage');
const pushMeter=document.getElementById('pushMeter');
const phase2Song=document.getElementById('phase2Song');
const leftDoors=document.getElementById('leftDoors');
const rightDoors=document.getElementById('rightDoors');
const hallHint=document.getElementById('hallwayHint');
const doorCounter=document.getElementById('doorCounter');
const doorProgress=document.getElementById('doorProgress');
const musicPill=document.getElementById('musicPill');
const roomNumber=document.getElementById('roomNumber');
const roomTitle=document.querySelector('.room-title');
const roomDetail=document.getElementById('roomDetail');
const roomNext=document.getElementById('roomNext');
const roomClose=document.getElementById('roomClose');

let phase2Pushes=0;
let phase2Started=false;
let phase2TargetIndex=0;
const phase2Path=[3,4,8,11,15,19];
const phase2Steps=[3,1,4,3,4,4];
const phase2DoorCopy={
  3:{title:'three steps in.',kicker:'you found it.',detail:'now go one more.'},
  4:{title:'that was quick.',kicker:'keep going.',detail:'now take four more.'},
  8:{title:'getting closer.',kicker:'you got the eight.',detail:'three more.'},
  11:{title:'okay, okay.',kicker:'halfway through the mess.',detail:'four more.'},
  15:{title:'almost there.',kicker:'don’t stop now.',detail:'four. then you’re done.'},
  19:{title:'you made it.',kicker:'the last door.',detail:'nineteen. ♡'}
};

function showPhase2Screen(screen){
  [phase2Entrance,phase2Hallway].forEach(el=>el&&el.classList.remove('phase2-active'));
  if(screen)screen.classList.add('phase2-active');
}

function resetPhase2Entrance(){
  phase2Pushes=0;
  if(doubleDoor){
    doubleDoor.classList.remove('opening');
    doubleDoor.dataset.force='0';
  }
  if(pushMeter)pushMeter.style.width='0%';
  if(pushMessage){
    pushMessage.textContent='push.';
    pushMessage.classList.remove('force');
  }
}

function enterPhase2(){
  phase1Ending=false;
  const reveal=document.getElementById('codeReveal');
  if(reveal){
    reveal.classList.remove('show');
    reveal.setAttribute('aria-hidden','true');
  }
  clearTimeout(window.phase2EntranceTimer);
  document.body.classList.add('phase2-mode');
  resetPhase2Entrance();
  showPhase2Screen(phase2Entrance);
  if(globalBack)globalBack.style.display='none';
}

function startPhase2Song(){
  if(!phase2Song)return;
  phase2Song.currentTime=0;
  fadeInAudio(phase2Song,.34,1200);
  if(musicPill)musicPill.textContent='♫ playing';
}

function stopPhase2Song(){
  if(phase2Song)fadeOutAudio(phase2Song,500,true);
}

function openPhase2Hallway(){
  doubleDoor.classList.add('opening');
  pushMessage.textContent='open.';
  pushMessage.classList.remove('force');
  startPhase2Song();
  setTimeout(()=>{
    showPhase2Screen(phase2Hallway);
    buildPhase2Doors();
  },1100);
}

function pushTheDoor(){
  if(phase2Pushes>=8)return;
  phase2Pushes++;
  doubleDoor.dataset.force=String(phase2Pushes);
  if(pushMeter)pushMeter.style.width=(phase2Pushes/8*100)+'%';

  const messages=[
    'again.',
    'more force.',
    'keep pushing.',
    'harder.',
    'don’t stop.',
    'almost.',
    'one last push.',
    'OPENING…'
  ];
  pushMessage.textContent=messages[phase2Pushes-1]||'again.';
  if(phase2Pushes>=2)pushMessage.classList.add('force');

  doubleDoor.animate(
    [{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale(.985)'},{transform:'translate(-50%,-50%) scale(1)'}],
    {duration:170,easing:'ease-out'}
  );

  if(phase2Pushes===8)openPhase2Hallway();
}

doubleDoor?.addEventListener('click',pushTheDoor);
doubleDoor?.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();pushTheDoor();}
});

function makeDoor(n){
  const b=document.createElement('button');
  b.type='button';
  b.className='hall-door';
  b.dataset.door=String(n);
  b.setAttribute('aria-label','Door '+String(n).padStart(2,'0'));
  b.textContent=String(n).padStart(2,'0');
  b.addEventListener('click',()=>handlePhase2Door(n,b));
  return b;
}

function buildPhase2Doors(){
  if(!leftDoors||!rightDoors)return;
  leftDoors.innerHTML='';
  rightDoors.innerHTML='';
  for(let n=19;n>=1;n-=2)leftDoors.appendChild(makeDoor(n));
  for(let n=2;n<=18;n+=2)rightDoors.appendChild(makeDoor(n));
  phase2TargetIndex=0;
  setPhase2Target();
}

function setPhase2Target(){
  const target=phase2Path[phase2TargetIndex];
  document.querySelectorAll('.hall-door').forEach(b=>{
    b.classList.toggle('next-door',Number(b.dataset.door)===target);
    b.disabled=false;
  });
  if(doorCounter)doorCounter.textContent=String(target).padStart(2,'0')+' / 19';
  if(doorProgress)doorProgress.textContent=phase2TargetIndex===0?'start with this one ♡':'keep following the numbers';
  if(hallHint)hallHint.textContent=phase2TargetIndex===0?'start with 03.':'keep going.';
}

function handlePhase2Door(n,button){
  const target=phase2Path[phase2TargetIndex];
  if(n!==target){
    button.classList.remove('wrong');void button.offsetWidth;button.classList.add('wrong');
    if(hallHint){hallHint.textContent='nope. not this one.';clearTimeout(window.phase2HintTimer);window.phase2HintTimer=setTimeout(()=>{hallHint.textContent=phase2TargetIndex===0?'start with 03.':'keep going.'},900);}
    return;
  }

  button.classList.remove('next-door');
  button.classList.add('found');
  phase2TargetIndex++;
  const copy=phase2DoorCopy[n]||phase2DoorCopy[19];
  roomNumber.textContent=String(n).padStart(2,'0');
  document.querySelector('.room-kicker').textContent=copy.kicker;
  roomTitle.textContent=copy.title;
  roomDetail.textContent=copy.detail;
  phase2Room.classList.add('open');
  phase2Room.setAttribute('aria-hidden','false');

  if(n===19){
    roomNext.textContent='you made it →';
    doorCounter.textContent='19 / 19';
    doorProgress.textContent='last door ♡';
  }else{
    roomNext.textContent='back to the hallway →';
  }
}

function closePhase2Room(){
  phase2Room.classList.remove('open');
  phase2Room.setAttribute('aria-hidden','true');
  if(phase2TargetIndex<phase2Path.length)setPhase2Target();
  else if(hallHint)hallHint.textContent='you made it. 19. ♡';
}

roomClose?.addEventListener('click',closePhase2Room);
document.querySelector('.room-backdrop')?.addEventListener('click',closePhase2Room);
roomNext?.addEventListener('click',()=>{
  if(phase2TargetIndex>=phase2Path.length){
    closePhase2Room();
    if(hallHint)hallHint.textContent='you made it. 19. ♡';
    return;
  }
  closePhase2Room();
});

function finishPhase1AndEnterPhase2(){
  const final=document.getElementById('revealFinal');
  const number=document.getElementById('revealNumber');
  phase2Started=true;
  enterPhase2();
}

const originalRunPhase1Ending=runPhase1Ending;
runPhase1Ending=function(){
  originalRunPhase1Ending();
  clearTimeout(window.phase2EntranceTimer);
  window.phase2EntranceTimer=setTimeout(()=>{
    finishPhase1AndEnterPhase2();
  },6100);
};

if(new URLSearchParams(location.search).get('phase')==='2'){
  window.addEventListener('load',()=>enterPhase2(),{once:true});
}
