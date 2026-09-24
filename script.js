
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
    '6-7':'roomIn .95s cubic-bezier(.2,.8,.2,1) both'
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
  if(!page || pages[i]!==page)return;
  if(i<pages.length-1)go(i+1);
}
document.querySelectorAll('.next').forEach(button=>{
  button.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    handleNextButton(button);
  });
});
document.addEventListener('click',e=>{
  const nextButton=e.target.closest('.next');
  if(!nextButton)return;
  e.preventDefault();
  e.stopPropagation();
  handleNextButton(nextButton);
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


/* ===== Phase 2 interaction layer ===== */
const phase2Song=document.getElementById('phase2Song');
const phase2Page=document.getElementById('p8');
const roomNote=document.getElementById('roomNote');
const roomMemory=document.getElementById('roomMemory');
const roomScene=document.getElementById('roomScene');
const roomAudioStatus=document.getElementById('roomAudioStatus');
let phase2SongPlaying=false;

function pausePhase2Song(){
  if(!phase2Song)return;
  fadeOutAudio(phase2Song,650,true);
  phase2SongPlaying=false;
  if(phase2Page)phase2Page.classList.remove('playing');
}
function showRoomNote(text){
  if(!roomNote)return;
  roomNote.innerHTML=text;
  roomNote.classList.remove('show'); void roomNote.offsetWidth; roomNote.classList.add('show');
  clearTimeout(window.roomNoteTimer);
  window.roomNoteTimer=setTimeout(()=>roomNote.classList.remove('show'),4200);
}
function openMemory(html){
  if(!roomMemory)return;
  roomMemory.innerHTML='<div class="memory-paper">'+html+'<button class="memory-close" type="button">okay, close</button></div>';
  roomMemory.classList.add('show');
  roomMemory.setAttribute('aria-hidden','false');
}
function closeMemory(){
  if(!roomMemory)return;
  roomMemory.classList.remove('show');
  roomMemory.setAttribute('aria-hidden','true');
}
function playPhase2Song(){
  if(!phase2Song)return;
  phase2Song.currentTime=0;
  phase2SongPlaying=true;
  if(phase2Page)phase2Page.classList.add('playing');
  if(roomAudioStatus)roomAudioStatus.textContent='Jaan Nisaar — for this room ♡';
  const promise=fadeInAudio(phase2Song,.46,1100);
  void promise;
  setTimeout(()=>{
    if(!phase2SongPlaying)return;
    if(phase2Song.readyState<2 && roomAudioStatus)roomAudioStatus.textContent='add jaan-nisaar.mp3 to the repo to hear this ♡';
  },900);
}
function enterRoom(){
  phase1Ending=false;
  const overlay=document.getElementById('codeReveal');
  if(overlay){
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
  }
  go(7);
}
const enterPhase2=document.getElementById('enterPhase2');
if(enterPhase2)enterPhase2.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();enterRoom();});

if(phase2Page){
  const activate=(el)=>el&&el.click();
  phase2Page.querySelectorAll('[data-object]').forEach(el=>{
    const obj=el.dataset.object;
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(el);}});
    el.addEventListener('click',()=>{
      if(obj==='lamp'){
        phase2Page.classList.toggle('lamp-on');
        showRoomNote(phase2Page.classList.contains('lamp-on')
          ? 'you always liked soft light better.<br><span style="font-size:16px">apparently that still counts.</span>'
          : 'okay. back to the soft light.');
      }
      if(obj==='music'){
        if(phase2SongPlaying){pausePhase2Song();if(roomAudioStatus)roomAudioStatus.textContent='the room went quiet.';}
        else playPhase2Song();
      }
      if(obj==='drawer'){
        openMemory('<h3>little things.</h3><p>some memories don't need a date.</p><p>the weird jokes.<br>the random screenshots.<br>the things you almost forgot.</p><p>they still made it here. ♡</p>');
      }
      if(obj==='window'){
        phase2Page.classList.toggle('night');
        showRoomNote(phase2Page.classList.contains('night')
          ? 'the same room.<br>a completely different memory.'
          : 'look at that sky.');
      }
      if(obj==='wall'){
        showRoomNote('hidden between all the noise:<br><strong style="font-size:24px">you.</strong>');
      }
      if(obj==='notebook'){
        openMemory('<h3>from the notebook.</h3><p>things i would probably never say out loud:</p><p>your laugh is still contagious.<br>you make ordinary days less ordinary.<br>and somehow, you are still very you.</p><p>— a note left here ♡</p>');
      }
      if(obj==='box'){
        phase2Page.classList.add('open-box','found-all');
        showRoomNote('you found the last thing.<br><span style="font-size:17px">phase three can wait one second.</span>');
        setTimeout(()=>openMemory('<h3>19.</h3><p>not a clue this time.</p><p>just a tiny reminder that this room was made for one very specific person.</p><p>happy birthday, Kashish. ♡</p>'),500);
      }
    });
  });
  roomMemory.addEventListener('click',e=>{if(e.target===roomMemory||e.target.closest('.memory-close'))closeMemory();});
}

const _originalGo=go;
go=function(n){
  if(i===7 && n!==7)pausePhase2Song();
  return _originalGo(n);
};

const _originalRunPhase1Ending=runPhase1Ending;
runPhase1Ending=function(){
  _originalRunPhase1Ending();
  setTimeout(()=>document.getElementById('revealFinal')?.classList.add('show'),4450);
};
