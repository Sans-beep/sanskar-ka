
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
  const storyLayer=document.getElementById('storyThread');
  const ambientLayer=document.querySelector('.ambient');
  if(storyLayer)storyLayer.classList.toggle('phase2-hidden',i===7);
  if(ambientLayer)ambientLayer.classList.toggle('phase2-hidden',i===7);
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
  clearTimeout(window.phase1ToPhase2Timer);
  window.phase1ToPhase2Timer=setTimeout(()=>{
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    phase1Ending=false;
    go(7);
  },6200);
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
const proofUpload=document.getElementById('proofUpload'), proofPhoto=document.getElementById('proofPhoto'), proofImage=document.getElementById('proofImage'), uploadStatus=document.getElementById('uploadStatus'), p4Next=document.getElementById('p4Next');
proofUpload.addEventListener('change',()=>{const file=proofUpload.files&&proofUpload.files[0];if(!file)return;if(!file.type.startsWith('image/')){uploadStatus.textContent='that one is not a photo 😭';proofUpload.value='';proofFile=null;p4Next.disabled=true;proofPhoto.classList.remove('has-image');proofImage.removeAttribute('src');return}if(file.size>10*1024*1024){uploadStatus.textContent='that photo is a little too big 😭';proofUpload.value='';proofFile=null;p4Next.disabled=true;proofPhoto.classList.remove('has-image');proofImage.removeAttribute('src');return}proofFile=file;proofUploaded=false;if(proofImage.dataset.objectUrl)URL.revokeObjectURL(proofImage.dataset.objectUrl);const previewUrl=URL.createObjectURL(file);proofImage.dataset.objectUrl=previewUrl;proofImage.src=previewUrl;proofPhoto.classList.add('has-image');document.getElementById('proofPolaroid').classList.remove('verified');uploadStatus.textContent='evidence acquired ♡';p4Next.disabled=false;});
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


/* =========================================================
   PHASE 2 — SLOT MACHINE ENGINE
   Nine spins, tactile interactions, synthesized machine audio.
   ========================================================= */
(()=>{
  const p2=document.getElementById('p8');
  const machine=document.getElementById('slotMachine');
  const lever=document.getElementById('slotLever');
  const spinButton=document.getElementById('spinButton');
  const counter=document.getElementById('p2Counter');
  const spinSub=document.getElementById('spinSub');
  const status=document.getElementById('slotStatus');
  const progress=document.getElementById('p2ProgressFill');
  const hint=document.getElementById('p2Hint');
  const glitch=document.getElementById('p2Glitch');
  const finale=document.getElementById('p2Finale');
  const finaleOne=document.getElementById('finaleOne');
  const finaleTwo=document.getElementById('finaleTwo');
  const finaleTitle=document.getElementById('finaleTitle');
  if(!p2||!machine||!lever||!spinButton)return;

  const symbols=['seven','cherry','star','cake','k','19','bow','butter'];
  const patterns={
    1:['cherry','seven','star'],
    2:['k','bow','19'],
    3:['star','cherry','seven'],
    4:['19','bow','k'],
    5:['seven','star','cherry'],
    6:['bow','k','19'],
    7:['cherry','19','star'],
    8:['k','seven','bow'],
    9:['cake','cake','cake']
  };
  const spinNotes={
    1:'MAKE ONE CHOICE.',
    2:'STAY WITH IT.',
    3:'DON’T TOUCH ANYTHING ELSE.',
    4:'SIGNAL STABILIZING.',
    5:'LISTEN.',
    6:'HEAVY MECHANISM.',
    7:'CALIBRATING.',
    8:'…',
    9:'FINAL ATTEMPT.'
  };
  let spins=0,busy2=false,phase2Audio=null;
  const reels=[...machine.querySelectorAll('.reel-column')];
  const strips=reels.map(r=>r.querySelector('.reel-strip'));

  function glyph(type){
    const s=document.createElement('span');
    s.className='slot-glyph glyph-'+type;
    s.setAttribute('aria-hidden','true');
    return s;
  }
  function buildReels(){
    strips.forEach((strip,reelIndex)=>{
      strip.innerHTML='';
      for(let j=0;j<112;j++){
        const cell=document.createElement('div');
        cell.className='reel-cell';
        cell.appendChild(glyph(symbols[(j+reelIndex*2)%symbols.length]));
        strip.appendChild(cell);
      }
      strip.style.transform='translate3d(0,0,0)';
    });
  }
  buildReels();

  function pad(n){return String(n).padStart(2,'0')}
  function setCounter(n){
    const v=pad(Math.min(n,9))+' / 09';
    counter.textContent=v;spinSub.textContent=v;
  }
  function setStatus(textValue){
    status.lastElementChild.textContent=textValue;
  }
  function setProgress(done){
    progress.style.width=(done/9*100)+'%';
  }

  function getAudio(){
    try{
      const C=window.AudioContext||window.webkitAudioContext;
      if(!C)return null;
      if(!phase2Audio)phase2Audio=new C();
      if(phase2Audio.state==='suspended')phase2Audio.resume().catch(()=>{});
      return phase2Audio;
    }catch(e){return null}
  }
  function tone(freq,dur=.08,type='triangle',vol=.035,slide=0){
    const ac=getAudio();if(!ac)return;
    const o=ac.createOscillator(),g=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,ac.currentTime);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),ac.currentTime+dur);
    g.gain.setValueAtTime(vol,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);
    o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+dur);
  }
  function noise(dur=.16,vol=.025){
    const ac=getAudio();if(!ac)return;
    const size=Math.max(1,Math.floor(ac.sampleRate*dur));
    const buffer=ac.createBuffer(1,size,ac.sampleRate),data=buffer.getChannelData(0);
    for(let k=0;k<size;k++)data[k]=(Math.random()*2-1)*(1-k/size);
    const src=ac.createBufferSource(),g=ac.createGain(),f=ac.createBiquadFilter();
    f.type='lowpass';f.frequency.value=1800;g.gain.value=vol;
    src.buffer=buffer;src.connect(f);f.connect(g);g.connect(ac.destination);src.start();src.stop(ac.currentTime+dur);
  }
  function mechanicalStart(){
    tone(112,.16,'square',.028,-38);
    setTimeout(()=>tone(76,.2,'sawtooth',.022,34),75);
    noise(.12,.018);
  }
  function reelTick(delay=0){
    setTimeout(()=>tone(205,.045,'square',.018,-80),delay);
  }
  function reelStop(reelIndex,delay){
    setTimeout(()=>{
      tone(290+reelIndex*65,.09,'triangle',.034,45);
      noise(.055,.012);
    },delay);
  }

  function pullLever(){
    lever.classList.remove('pulled');void lever.offsetWidth;lever.classList.add('pulled');
    setTimeout(()=>lever.classList.remove('pulled'),540);
  }

  function animateStrip(strip,reelIndex,spinNo,desired,delay,duration){
    const cellH=reels[reelIndex].querySelector('.reel-cell')?.offsetHeight||68;
    const windowH=reels[reelIndex].parentElement?.offsetHeight||220;
    const symbolIndex=symbols.indexOf(desired);
    const cycleStart=(spinNo*8)+8+reelIndex*3;
    const targetIndex=cycleStart+(symbolIndex-(cycleStart%symbols.length)+symbols.length)%symbols.length;
    const stopOffset=Math.max(0,targetIndex*cellH-(windowH-cellH)/2);
    const previousOffset=Number(strip.dataset.offset||0);
    strip.style.transition='none';
    strip.style.transform='translate3d(0,'+(-previousOffset)+'px,0)';
    void strip.offsetHeight;
    strip.style.transition='transform '+duration+'ms cubic-bezier(.11,.74,.17,1)';
    setTimeout(()=>{
      strip.style.transform='translate3d(0,'+(-stopOffset)+'px,0)';
      strip.dataset.offset=String(stopOffset);
    },delay);
    reelTick(delay+Math.max(80,duration*.22));
    reelTick(delay+Math.max(180,duration*.48));
    reelStop(reelIndex,delay+duration-35);
    return delay+duration;
  }

  function visualSpin(spinNo){
    p2.classList.remove('spin-shake','spin-sticky','machine-calm','spin-jolt','spin-heavy','spin-shift','spin-overload');
    if(spinNo===1)p2.classList.add('spin-jolt');
    if(spinNo===2)p2.classList.add('spin-shake');
    if(spinNo===3)p2.classList.add('spin-sticky');
    if(spinNo===6)p2.classList.add('spin-heavy');
    if(spinNo===7)p2.classList.add('spin-shift');
    if(spinNo===8)p2.classList.add('machine-calm');
    if(spinNo===9)p2.classList.add('spin-overload');
    if(spinNo===4){
      glitch.classList.remove('show');void glitch.offsetWidth;glitch.classList.add('show');
    }
  }

  function finishSpin(spinNo){
    spins=spinNo;
    setProgress(spins);
    if(spins<9){
      setCounter(spins+1);
      setStatus(spinNotes[spins+1]);
      hint.textContent=spins===8?'the machine knows.':(spins===5?'don’t overthink it.':'the lever is not decorative.');
      busy2=false;
      spinButton.disabled=false;
      lever.disabled=false;
    }else{
      setCounter(9);
      setStatus('RESULT: THREE OF A KIND.');
      hint.textContent='you made it all the way here.';
      spinButton.disabled=true;lever.disabled=true;
      setTimeout(showFinale,850);
    }
  }

  function showFinale(){
    finale.classList.add('show');
    finale.setAttribute('aria-hidden','false');
    finaleOne.classList.remove('show');finaleTwo.classList.remove('show');
    finale.classList.remove('cakes-in','title-in','sub-in');
    setTimeout(()=>finaleOne.classList.add('show'),260);
    setTimeout(()=>finaleTwo.classList.add('show'),1050);
    setTimeout(()=>finale.classList.add('cakes-in'),1830);
    setTimeout(()=>finale.classList.add('title-in'),2750);
    setTimeout(()=>finale.classList.add('sub-in'),3380);
    tone(164,.12,'triangle',.03,35);
    setTimeout(()=>tone(246,.12,'triangle',.028,45),140);
    setTimeout(()=>tone(369,.18,'triangle',.035,65),280);
    setTimeout(()=>tone(492,.32,'sine',.026,0),520);
  }

  function spin(){
    if(busy2||spins>=9)return;
    busy2=true;
    const spinNo=spins+1;
    spinButton.disabled=true;lever.disabled=true;
    setCounter(spinNo);
    setStatus(spinNotes[spinNo]);
    hint.textContent=spinNo===5?'listen.':(spinNo===8?'…':'pull it.');
    visualSpin(spinNo);
    pullLever();
    mechanicalStart();

    const pattern=patterns[spinNo];
    const baseDuration=spinNo===6?1250:(spinNo===8?1350:(spinNo===9?1550:980));
    const delays=spinNo===3?[0,180,360]:spinNo===9?[0,600,1300]:[0,105,210];
    const durations=spinNo===5?[1100,1220,1340]:spinNo===8?[1350,1420,1490]:spinNo===9?[720,880,1080]:[baseDuration,baseDuration+95,baseDuration+175];
    const ends=pattern.map((s,k)=>animateStrip(strips[k],k,spinNo,s,delays[k],durations[k]));
    const maxEnd=Math.max(...ends);
    ends.forEach((end,k)=>{if(spinNo===9&&k<2)setTimeout(()=>tone(150+k*28,.07,'square',.018,-40),end+20)});
    setTimeout(()=>finishSpin(spinNo),maxEnd+190);
  }

  spinButton.addEventListener('click',spin);
  lever.addEventListener('click',spin);
  setCounter(1);setProgress(0);setStatus(spinNotes[1]);
})();
