const LEVELS=[
  {lvl:1,name:"Anfänger",min:0,max:100},
  {lvl:2,name:"Lerner",min:100,max:250},
  {lvl:3,name:"Schüler",min:250,max:500},
  {lvl:4,name:"Kenner",min:500,max:900},
  {lvl:5,name:"Fortgeschritten",min:900,max:1500},
  {lvl:6,name:"Experte",min:1500,max:2500},
  {lvl:7,name:"Meister",min:2500,max:99999}
];
const XP_RATES={flash_good:5,flash_easy:10,flash_hard:2,quiz_correct:8,fill_correct:8,gender_correct:5,listen_correct:10};
function getLevelInfo(xp){return LEVELS.find(l=>xp>=l.min&&xp<l.max)||LEVELS[LEVELS.length-1];}

// ── SM-2 ─────────────────────────────────────────────
let sm2Cache={};
function s2g(de){return sm2Cache[de]||{interval:0,reps:0,ef:2.5,next:null,confidence:3};}
function s2r(de,q){
  let c=s2g(de);
  // Standard SM-2 with proper intervals
  if(q>=3){
    if(c.reps===0)c.interval=1;
    else if(c.reps===1)c.interval=6;
    else c.interval=Math.round(c.interval*c.ef);
    // Easy bonus: double the interval
    if(q===5)c.interval=Math.round(c.interval*1.3);
    c.reps++;
  }else{
    c.reps=0;
    c.interval=1;
  }
  c.ef=Math.max(1.3,c.ef+0.1-(5-q)*(0.08+(5-q)*0.02));
  let nx=new Date();nx.setDate(nx.getDate()+c.interval);
  c.next=nx.toISOString().split('T')[0];
  sm2Cache[de]=c;schedSync(de,c);return c;
}
function s2due(de){let c=s2g(de);if(!c.next)return true;return c.next<=tday();}
function tday(){return new Date().toISOString().split('T')[0];}

// ── STATE ─────────────────────────────────────────────
let CU=null,CP=null,syncT=null,pending={},authToken=null;
let known=new Set(),streakN=0,bestStreak=0,lastStudy=null,doneDays=new Set();
let xpTotal=0,sessionXP=0,sessionCorrect=0,sessionReviewed=0;
let mistakes=[];
let tab='flash',flashMode='de',answerMode='choice',selCats=new Set(),queue=[],qIdx=0,revealed=false,confSel=3;
let selLevel='all'; // 'all' | 'A1' | 'A2'
let quizSt=null,blankSt=null,gQ=[],gIdx=0,gAns=false,gScore={ok:0,tot:0};
let listenSt=null;
let quizQueue=[],quizQIdx=0;
let ranksSubTab='friends';
let raceSt=null;
let catSessionCount={};
let aiPhraseCache={};

// ── SYNC ─────────────────────────────────────────────
function setDot(s){let d=document.getElementById('sync-dot');if(d)d.className='sync-dot'+(s==='syncing'?' syncing':s==='err'?' err':'');}
function schedSync(de,sm){pending[de]={...sm,known:known.has(de)};clearTimeout(syncT);syncT=setTimeout(flush,2000);}
async function flush(){
  if(!CU||!Object.keys(pending).length)return;
  setDot('syncing');
  let rows=Object.entries(pending).map(([de,d])=>({user_id:CU.id,word_de:de,known:d.known,interval:d.interval,reps:d.reps,ef:d.ef,next_review:d.next,updated_at:new Date().toISOString()}));
  pending={};
  let{error}=await sb.from('word_progress').upsert(rows,{onConflict:'user_id,word_de'});
  setDot(error?'err':'');
}
// Raw fetch helper - bypasses broken Supabase JS client
async function sbFetch(table, params='', silent=false){
  let token=authToken||SKEY;
  let url=SURL+'/rest/v1/'+table+(params?'?'+params:'');
  try{
    let r=await fetch(url,{
      headers:{
        'apikey':SKEY,
        'Authorization':'Bearer '+token,
        'Content-Type':'application/json',
        'Prefer':'return=representation'
      }
    });
    let data=await r.json();
    if(!r.ok){if(!silent&&typeof showErr==='function')showErr('DB error: '+table,data?.message||r.status);return[];}
    return data;
  }catch(e){
    if(!silent&&typeof showErr==='function')showErr('Network error: '+table,e.message);
    return[];
  }
}
async function sbUpsert(table, body){
  let token=authToken||SKEY;
  try{
    let r=await fetch(SURL+'/rest/v1/'+table,{
      method:'POST',
      headers:{
        'apikey':SKEY,
        'Authorization':'Bearer '+token,
        'Content-Type':'application/json',
        'Prefer':'resolution=merge-duplicates,return=representation'
      },
      body:JSON.stringify(body)
    });
    if(!r.ok){let d=await r.json().catch(()=>({}));if(typeof showErr==='function')showErr('Save error: '+table,d?.message||r.status);return null;}
    return r.json();
  }catch(e){
    if(typeof showErr==='function')showErr('Network error saving: '+table,e.message);
    return null;
  }
}