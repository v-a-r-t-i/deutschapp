async function genAIPhrases(word,level=1){
  if(aiPhraseCache[word+level])return aiPhraseCache[word+level];
  try{
    let resp=await fetch('https://yngsuxuamhzefkkjsgus.supabase.co/functions/v1/ai-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+SKEY},
      body:JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:200,
        messages:[{role:'user',content:'Generate 2 very short German sentences (max 8 words each) using the word "'+word+'" at A1 beginner level. Simple vocabulary only. The word must appear in each sentence. Return JSON only, no markdown: {"phrases":[["German sentence","English translation"],["German sentence 2","English translation 2"]]}'}]
      })
    });
    let data=await resp.json();
    let txt=data.content?.[0]?.text||'{}';
    let clean=txt.replace(/```json|```/g,'').trim();
    let parsed=JSON.parse(clean);
    if(parsed.phrases){aiPhraseCache[word+level]=parsed.phrases;return parsed.phrases;}
  }catch(e){console.error('AI phrase error:',e);}
  return null;
}

async function refreshPhrases(de,blockEl){
  blockEl.innerHTML='<div style="text-align:center;padding:8px;color:var(--txt3)"><span class="spinner"></span>Generating new phrases...</div>';
  let item=aw().find(w=>w.de===de);
  if(!item)return;
  let lvl=getLevelInfo(xpTotal).lvl;
  let phrases=await genAIPhrases(de,lvl);
  if(phrases){
    // Save back to Supabase so they persist
    await fetch(SURL+'/rest/v1/words?de=eq.'+encodeURIComponent(de)+'&language=eq.de',{
      method:'PATCH',
      headers:{'apikey':SKEY,'Authorization':'Bearer '+(authToken||SKEY),'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({phrases})
    });
    // Update local DATA cache too
    for(let cat of Object.keys(DATA)){
      let w=DATA[cat].find(x=>x.de===de);
      if(w){w.phrases=phrases;break;}
    }
    blockEl.innerHTML=phrases.map(p=>`<div class="phrase-block"><div class="ai-badge">AI ✨</div><div class="phrase-row"><div><div class="phrase-de">${bw(p[0],de)}</div><div class="phrase-en">${p[1]}</div></div><button class="psb" onclick="speak('${p[0].replace(/'/g,"\\'")}',this)">🔊</button></div></div>`).join('');
  }else{
    blockEl.innerHTML='<div style="font-size:12px;color:var(--rd);padding:8px">Could not generate phrases. Using defaults.</div>';
  }
}

// ── PHRASE EVOLUTION ─────────────────────────────────
// Called silently after every 5 reps — phrases get more complex as the learner progresses
async function evolvePhrasesFor(item){
  let reps=s2g(item.de).reps;
  // Level 1 (reps 5-9): simple A1 sentences
  // Level 2 (reps 10-14): slightly richer A2 sentences
  // Level 3 (reps 15+): natural B1 sentences
  let lvlLabel=reps>=15?'B1 natural':reps>=10?'A2 slightly richer':'A1 simple';
  let maxWords=reps>=15?12:reps>=10?10:8;
  try{
    let resp=await fetch(SURL+'/functions/v1/ai-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+(authToken||SKEY)},
      body:JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:150,
        messages:[{role:'user',content:`Write 2 German sentences (max ${maxWords} words each) using "${item.de}" (${item.en}) at ${lvlLabel} level. The word must appear in each sentence. Return JSON only: {"phrases":[["German","English"],["German","English"]]}`}]
      })
    });
    let data=await resp.json();
    let txt=data.content?.[0]?.text||'{}';
    let parsed=JSON.parse(txt.replace(/```json|```/g,'').trim());
    if(!parsed.phrases)return;
    // Save to Supabase
    await fetch(SURL+'/rest/v1/words?de=eq.'+encodeURIComponent(item.de)+'&language=eq.de',{
      method:'PATCH',
      headers:{'apikey':SKEY,'Authorization':'Bearer '+(authToken||SKEY),'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({phrases:parsed.phrases})
    });
    // Update local cache
    for(let cat of Object.keys(DATA)){
      let w=DATA[cat].find(x=>x.de===item.de);
      if(w){w.phrases=parsed.phrases;break;}
    }
    console.log(`Phrases evolved for "${item.de}" (${reps} reps → ${lvlLabel})`);
  }catch(e){/* silent fail */}
}

// ── AI PLAN ───────────────────────────────────────────
async function genAIPlan(){
  let goal=document.getElementById('plan-goal').value.trim();
  let days=parseInt(document.getElementById('plan-days').value)||7;
  let time=parseInt(document.getElementById('plan-time').value)||20;
  let focus=document.getElementById('plan-words').value.trim();
  if(!goal){alert('Please describe your goal first!');return;}
  let btn=document.getElementById('ai-plan-btn');
  btn.disabled=true;btn.textContent='Generating...';
  let resultEl=document.getElementById('ai-plan-result');
  resultEl.style.display='block';resultEl.innerHTML='<span class="spinner"></span> Building your plan...';
  let cats=Object.keys(DATA).join(', ');
  let today=new Date();
  let prompt=`You are a German A1 study planner. Return ONLY valid JSON, no markdown, no explanation.
Student: knows ${known.size} words, streak ${streakN} days, level ${getLevelInfo(xpTotal).name}
Goal: ${goal}
Days: ${days}, Minutes/day: ${time}
Available categories: ${cats}
Focus: ${focus||'all categories'}
Today: ${today.toDateString()}

Return this exact JSON structure:
{"title":"${days}-day plan","days":[{"day":1,"date":"${today.toLocaleDateString('en-GB',{weekday:'short',month:'short',day:'numeric'})}","category":"CategoryName","type":"new","totalMin":${time},"newWords":["word1","word2"],"phases":[{"min":10,"mode":"Flash DE","desc":"short description"}],"tip":"one helpful tip"}]}

Rules:
- "type" is one of: new, review, final
- "mode" is one of: Flash DE, Flash EN, Quiz, Fill-in, Gender, Listen
- phases must sum to totalMin
- newWords should be real German words from the categories
- generate exactly ${days} day objects
- date should increment from today
- tip should be a brief spaced-repetition or memory tip`;
  try{
    let resp=await fetch('https://yngsuxuamhzefkkjsgus.supabase.co/functions/v1/ai-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+SKEY},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:1200,messages:[{role:'user',content:prompt}]})
    });
    let data=await resp.json();
    let txt=data.content?.[0]?.text||'{}';
    let clean=txt.replace(/```json|```/g,'').trim();
    let plan=JSON.parse(clean);
    localStorage.setItem('saved_plan',JSON.stringify(plan));
    renderPlanCards(plan,resultEl);
  }catch(e){
    resultEl.innerHTML='<div style="color:var(--rd);font-size:13px">Error generating plan. Please try again.</div>';
  }
  btn.disabled=false;btn.textContent='Generate my plan ✨';
}

function renderPlanCards(plan,container){
  if(!plan||!plan.days||!plan.days.length){
    if(container)container.innerHTML='<div style="color:var(--rd);font-size:13px">Could not parse plan. Please try again.</div>';
    return;
  }
  let doneDays=JSON.parse(localStorage.getItem('plan_done')||'[]');
  let html=`<div style="font-size:13px;font-weight:600;color:var(--txt2);margin-bottom:12px">${plan.title||''}</div>`;
  plan.days.forEach(d=>{
    let isDone=doneDays.includes(d.day);
    let phases=d.phases.map(p=>`<div class="phase-row"><div class="ph-min">${p.min}m</div><div class="ph-mode">${p.mode}</div><div class="ph-desc">${p.desc}</div></div>`).join('');
    let words=d.newWords?.length?`<div class="sec-lbl">Words to learn</div><div class="chips">${d.newWords.map(w=>`<span class="chip">${w}</span>`).join('')}</div>`:'';
    let tip=d.tip?`<div class="sec-lbl">Tip</div><div class="sci-box">${d.tip}</div>`:'';
    let badge=isDone?'<span class="badge badge-g">✓ Done</span>':d.type==='review'?'<span class="badge badge-b">Review</span>':d.type==='final'?'<span class="badge badge-b">Final</span>':'';
    let dc=isDone?'d':d.type==='review'||d.type==='final'?'r':'';
    html+=`<div class="day-card"><div class="day-hdr" onclick="this.nextElementSibling.classList.toggle('open');let a=this.querySelector('.day-arr');if(a)a.textContent=this.nextElementSibling.classList.contains('open')?'‹':'›'">
      <div class="day-num ${dc}">${isDone?'✓':d.day}</div>
      <div class="day-meta"><div class="day-title">${d.date} — ${d.category||'Review'}</div><div class="day-sub">${d.newWords?.length?d.newWords.length+' words':d.type==='review'?'Full review':'Final test'}</div></div>
      <div class="day-right">${badge}<div class="day-min">${d.totalMin}m</div><span class="day-arr">›</span></div>
    </div>
    <div class="day-body">
      <div class="sec-lbl">Session plan</div>${phases}${words}${tip}
      <button class="${isDone?'undone-btn':'done-btn'}" onclick="togglePlanDay(${d.day},this)">${isDone?'Mark as not done':'Mark as done ✓'}</button>
    </div></div>`;
  });
  if(container)container.innerHTML=html;
}

function togglePlanDay(day,btn){
  let done=JSON.parse(localStorage.getItem('plan_done')||'[]');
  let idx=done.indexOf(day);
  if(idx>=0)done.splice(idx,1);else done.push(day);
  localStorage.setItem('plan_done',JSON.stringify(done));
  let plan=JSON.parse(localStorage.getItem('saved_plan')||'null');
  if(plan)renderPlanCards(plan,document.getElementById('ai-plan-result'));
}

// ── AUTH ─────────────────────────────────────────────