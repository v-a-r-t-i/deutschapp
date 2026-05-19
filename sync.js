function saveLocalCache(){
  try{
    localStorage.setItem('cache_'+CU.id, JSON.stringify({
      known:[...known],
      sm2:sm2Cache,
      streakN,lastStudy,bestStreak,xpTotal,
      mistakes,
      selCats:[...selCats],
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
    if(c.selCats&&c.selCats.length)selCats=new Set(c.selCats);
    return true;
  }catch(e){return false;}
}
async function loadWords(){
  try{
    let words=await sbFetch('words','select=*&language=eq.de&order=category');
    if(Array.isArray(words)&&words.length){
      // Rebuild DATA from Supabase
      let newData={};
      words.forEach(w=>{
        if(!newData[w.category])newData[w.category]=[];
        newData[w.category].push({
          de:w.de,
          art:w.art,
          en:w.en,
          phrases:Array.isArray(w.phrases)?w.phrases:[]
        });
      });
      // Only replace if we got valid data
      if(Object.keys(newData).length>0){
        Object.keys(DATA).forEach(k=>delete DATA[k]);
        Object.assign(DATA,newData);
        console.log('Words loaded from Supabase:',words.length);
      }
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
  selCats=new Set(Object.keys(DATA));
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
  if(newLvl.lvl>prevLvl.lvl){
    let lp=document.createElement('div');
    lp.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--xp);color:#fff;padding:20px 32px;border-radius:var(--r);font-size:18px;font-weight:700;z-index:300;text-align:center;';
    lp.innerHTML='⭐ Level Up!<br><span style="font-size:14px;font-weight:400">'+newLvl.name+'</span>';
    document.body.appendChild(lp);
    setTimeout(()=>lp.remove(),2500);
  }
}

// ── AI PHRASES ────────────────────────────────────────