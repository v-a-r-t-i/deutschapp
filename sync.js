function saveLocalCache(){
  try{
    localStorage.setItem('cache_'+CU.id, JSON.stringify({
      known:[...known],
      sm2:sm2Cache,
      streakN,lastStudy,bestStreak,xpTotal,
      mistakes,
      selCats:[...selCats],
      selLevel,
      sessionDate:tday(),
      sessionReviewed,sessionCorrect,sessionXP,
      savedAt:Date.now()
    }));
  }catch(e){}
}
function loadLocalCache(){
  if(!CU)return false;
  try{
    let raw=localStorage.getItem('cache_'+CU.id);
    if(!raw)return false;
    let c=JSON.parse(raw);
    if(c.known)known=new Set(c.known);
    if(c.sm2)sm2Cache=c.sm2;
    if(c.streakN!==undefined)streakN=c.streakN;
    if(c.lastStudy)lastStudy=c.lastStudy;
    if(c.bestStreak!==undefined)bestStreak=c.bestStreak;
    if(c.xpTotal!==undefined)xpTotal=c.xpTotal;
    if(c.mistakes)mistakes=c.mistakes;
    if(c.selCats&&c.selCats.length){
      let validCats=c.selCats.filter(k=>DATA[k]!==undefined);
      if(validCats.length)selCats=new Set(validCats);
    }
    if(c.selLevel)selLevel=c.selLevel;
    if(c.sessionDate===tday()){
      if(c.sessionReviewed!==undefined)sessionReviewed=c.sessionReviewed;
      if(c.sessionCorrect!==undefined)sessionCorrect=c.sessionCorrect;
      if(c.sessionXP!==undefined)sessionXP=c.sessionXP;
    }
    return true;
  }catch(e){return false;}
}
async function loadWords(){
  try{
    // Snapshot local levels so we can preserve them if Supabase lacks a lvl column
    let localLvl={};
    Object.keys(DATA).forEach(c=>(DATA[c]||[]).forEach(w=>{localLvl[w.de]=w.lvl||'A1';}));
    let words=await sbFetch('words','select=*&language=eq.'+lang+'&order=category');
    if(Array.isArray(words)&&words.length){
      let newData={};

      let seen={};
      words.forEach(w=>{
        if(!newData[w.category])newData[w.category]=[];
        let key=w.category+'|'+w.de;
        if(seen[key])return; // skip duplicates
        seen[key]=true;
        newData[w.category].push({
          de:w.de,
          art:w.art,
          en:w.en,
          lvl:w.lvl||localLvl[w.de]||'A1',
          phrases:Array.isArray(w.phrases)?w.phrases:[]
        });
      });
      // Only replace if we got valid data
      if(Object.keys(newData).length>0){
        // Merge: keep local-only German words not yet synced to Supabase
        // Skip for Korean — data.js has no Korean content; merging it would
        // dump all 188 German words into Korean mode.
        let supaWords=new Set();
        Object.keys(newData).forEach(c=>newData[c].forEach(w=>supaWords.add(c+'|'+w.de)));
        if(lang==='de'){
          Object.keys(DATA).forEach(cat=>{
            (DATA[cat]||[]).forEach(w=>{
              if(!supaWords.has(cat+'|'+w.de)){
                if(!newData[cat])newData[cat]=[];
                newData[cat].push(w);
              }
            });
          });
        }
        Object.keys(DATA).forEach(k=>delete DATA[k]);
        Object.assign(DATA,newData);
        console.log('Words loaded (Supabase + local merge):',Object.values(DATA).flat().length);
      }
    } else if(lang!=='de'){
      // Non-German with no Supabase words — wipe German fallback so study
      // modes show an empty state rather than wrong-language cards.
      Object.keys(DATA).forEach(k=>delete DATA[k]);
    }
  }catch(e){console.warn('words load error:',e);}
}

async function loadProg(){
  if(!CU)return;
  selCats=new Set(Object.keys(DATA));
  // Load from localStorage cache instantly
  let hasCached=loadLocalCache();
  buildQ();setTab('flash');
  if(hasCached)updAll();
  // Then sync from Supabase in background
  setDot('syncing');
  // Load words from Supabase (in parallel with user data)
  let [wp, skArr] = await Promise.all([
    sbFetch('word_progress','select=*&user_id=eq.'+CU.id).catch(()=>[]),
    sbFetch('streaks','select=*&user_id=eq.'+CU.id+'&limit=1').catch(()=>[]),
    loadWords()
  ]);
  if(Array.isArray(wp)&&wp.length){
    known=new Set();sm2Cache={};
    wp.forEach(r=>{sm2Cache[r.word_de]={interval:r.interval,reps:r.reps,ef:parseFloat(r.ef),next:r.next_review};if(r.known)known.add(r.word_de);});
  }
  let sk=Array.isArray(skArr)?skArr[0]:null;
  if(sk){streakN=sk.streak_count||0;lastStudy=sk.last_study_date;bestStreak=sk.best_streak||0;xpTotal=sk.xp_total||0;}
  setDot('');
  // Preserve user's category selection — only default to all if nothing was saved
  let cachedCats=[...selCats];
  if(cachedCats.length===0)selCats=new Set(Object.keys(DATA));
  saveLocalCache();
  updAll();buildQ();setTab('flash');
}
async function markStudied(){
  let today=tday();if(lastStudy===today)return;
  let yest=new Date();yest.setDate(yest.getDate()-1);
  streakN=lastStudy===yest.toISOString().split('T')[0]?streakN+1:1;
  if(streakN>bestStreak)bestStreak=streakN;
  lastStudy=today;
  await sb.from('streaks').upsert({user_id:CU.id,streak_count:streakN,best_streak:bestStreak,last_study_date:today,xp_total:xpTotal,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  updAll();
}
function addXP(amt,type){
  xpTotal+=amt;sessionXP+=amt;
  markStudied();
  // Award 1 weekly study BP per 15 correct answers
  // sessionCorrect is already incremented before addXP is called
  if(CU&&typeof sessionCorrect!=='undefined'){
    const BP_PER_N=5;
    let store=getBPStore();
    let prevCount=store.weeklyCorrect||0;
    let newCount=sessionCorrect+(store.weeklyCorrectBase||0);
    let prevMilestone=Math.floor(prevCount/BP_PER_N);
    let newMilestone=Math.floor(newCount/BP_PER_N);
    if(newMilestone>prevMilestone){
      let gained=newMilestone-prevMilestone;
      store.delta=(store.delta||0)+gained;
      store.weeklyCorrect=newCount;
      saveBPStore(store);
      // Show BP popup
      let bp=document.createElement('div');
      bp.style.cssText='position:fixed;top:60px;right:20px;background:rgba(139,92,246,0.9);color:#fff;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;z-index:200;animation:fadeup 1.5s ease forwards;pointer-events:none;margin-top:30px;';
      bp.textContent='+'+gained+' BP';
      document.body.appendChild(bp);
      setTimeout(()=>bp.remove(),1500);
    }else{
      store.weeklyCorrect=newCount;
      saveBPStore(store);
    }
  }
  // Always save xpTotal immediately on every gain
  if(CU){
    saveLocalCache();
    sbUpsert('streaks',{
      user_id:CU.id,
      streak_count:streakN,
      best_streak:bestStreak,
      last_study_date:lastStudy||tday(),
      xp_total:xpTotal,
      updated_at:new Date().toISOString()
    }).then(ok=>{if(ok)saveLocalCache();});
  }
  updAll();
  // Show XP popup
  let pop=document.createElement('div');
  pop.style.cssText='position:fixed;top:60px;right:20px;background:var(--xp);color:#fff;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;z-index:200;animation:fadeup 1.5s ease forwards;pointer-events:none;';
  pop.textContent='+'+amt+' XP';
  document.body.appendChild(pop);
  let style=document.createElement('style');
  style.textContent='@keyframes fadeup{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-40px)}}';
  document.head.appendChild(style);
  setTimeout(()=>pop.remove(),1500);
  // Level up check
  let prevLvl=getLevelInfo(xpTotal-amt);
  let newLvl=getLevelInfo(xpTotal);
  if(newLvl.lvl>prevLvl.lvl&&typeof confetti==='function')confetti();
  if(newLvl.lvl>prevLvl.lvl){
    lp.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--xp);color:#fff;padding:20px 32px;border-radius:var(--r);font-size:18px;font-weight:700;z-index:300;text-align:center;';
    lp.innerHTML='⭐ Level Up!<br><span style="font-size:14px;font-weight:400">'+newLvl.name+'</span>';
    document.body.appendChild(lp);
    setTimeout(()=>lp.remove(),2500);
  }
}

// ── AI PHRASES ────────────────────────────────────────
// ── CHALLENGE NOTIFICATIONS ──────────────────────────
let _realtimeChannel=null;
let _pollChallengeTimer=null;
let _seenRooms=new Set();

function subscribeToChalllenges(){
  if(!CU)return;
  // Realtime (needs invited_id column + Realtime enabled on race_rooms in Supabase dashboard)
  try{
    _realtimeChannel=sb.channel('challenges_'+CU.id)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'race_rooms',
        filter:'invited_id=eq.'+CU.id},
        payload=>{if(payload.new?.status==='waiting')showChallengeNotif(payload.new);})
      .subscribe();
  }catch(e){}
  // Polling fallback — checks every 8s regardless of Realtime
  _pollChallengeTimer=setInterval(pollForChallenges, 8000);
}

function unsubscribeFromChallenges(){
  if(_realtimeChannel){try{sb.removeChannel(_realtimeChannel);}catch(e){}  _realtimeChannel=null;}
  clearInterval(_pollChallengeTimer);_pollChallengeTimer=null;
  _seenRooms.clear();
}

async function pollForChallenges(){
  if(!CU)return;
  // Look for rooms from the last 5 minutes targeting this user
  let since=new Date(Date.now()-5*60*1000).toISOString();
  let rows=await sbFetch('race_rooms',
    'invited_id=eq.'+CU.id+'&status=eq.waiting&created_at=gte.'+since+'&order=created_at.desc&limit=5',true);
  if(!Array.isArray(rows))return;
  for(let room of rows){
    let id=room.id||room.code;
    if(!_seenRooms.has(id)){_seenRooms.add(id);showChallengeNotif(room);}
  }
}

function showChallengeNotif(room){
  sbFetch('profiles','select=display_name&id=eq.'+room.creator_id,true).then(rows=>{
    let name=(rows&&rows[0]?.display_name)||'Someone';
    document.getElementById('challenge-notif')?.remove();
    let n=document.createElement('div');
    n.id='challenge-notif';
    let code=room.code;
    n.innerHTML='<div style="display:flex;align-items:center;gap:10px"><span style="font-size:20px">⚔️</span><div style="flex:1"><b>'+name+'</b> challenged you!</div>'
      +'<button id="accept-challenge-btn" style="background:var(--green);color:#fff;border:none;border-radius:var(--rs);padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">Accept</button>'
      +'<button id="dismiss-challenge-btn" style="background:transparent;border:none;font-size:20px;cursor:pointer;color:var(--txt2);line-height:1">×</button></div>';
    setTimeout(()=>{
      let ab=document.getElementById('accept-challenge-btn');
      if(ab)ab.onclick=()=>{acceptChallenge(code);document.getElementById('challenge-notif')?.remove();};
      let db=document.getElementById('dismiss-challenge-btn');
      if(db)db.onclick=()=>document.getElementById('challenge-notif')?.remove();
    },0);
    n.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg);border:1.5px solid var(--green);border-radius:var(--r);padding:12px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.18);z-index:400;min-width:300px;max-width:420px;';
    let style=document.createElement('style');
    style.textContent='@keyframes slideup{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(style);
    n.style.animation='slideup 0.25s ease';
    document.body.appendChild(n);
    setTimeout(()=>n.remove(),30000);
  });
}

function acceptChallenge(code){
  sbFetch('race_rooms','code=eq.'+code+'&limit=1',true).then(rows=>{
    if(!rows?.length)return;
    let room=rows[0];
    let words;
    try{words=JSON.parse(room.words||'[]');}catch(e){words=[];}
    raceSt={room,words,idx:0,score:0,startTime:null,done:false,isCreator:false,waiting:true};
    ranksSubTab='race';
    if(typeof rSocial==='function')rSocial();
    else if(typeof setTab==='function')setTab('social');
    if(typeof pollRaceStart==='function')pollRaceStart(room.id||room.code,code);
  });
}



