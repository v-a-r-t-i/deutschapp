async function genAIPhrases(word,level=1){
  if(aiPhraseCache[word+level])return aiPhraseCache[word+level];
  try{
    let resp=await fetch('https://yngsuxuamhzefkkjsgus.supabase.co/functions/v1/ai-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+SKEY},
      body:JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:200,
        messages:[{role:'user',content:'Generate 2 short German sentences using the word "'+word+'" at A1 level. The word must appear in each sentence. Vary them from common examples. Return JSON only, no markdown: {"phrases":[["German sentence","English translation"],["German sentence 2","English translation 2"]]}'}]
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
    blockEl.innerHTML=phrases.map(p=>`<div class="phrase-block"><div class="ai-badge">AI ✨</div><div class="phrase-row"><div><div class="phrase-de">${bw(p[0],de)}</div><div class="phrase-en">${p[1]}</div></div><button class="psb" onclick="speak('${p[0].replace(/'/g,"\\'")}',this)">🔊</button></div></div>`).join('');
  }else{
    blockEl.innerHTML='<div style="font-size:12px;color:var(--rd);padding:8px">Could not generate phrases. Using defaults.</div>';
  }
}

// ── AI PLAN ───────────────────────────────────────────
async function genAIPlan(){
  let goal=document.getElementById('plan-goal').value.trim();
  let days=document.getElementById('plan-days').value.trim();
  let time=document.getElementById('plan-time').value.trim();
  let words=document.getElementById('plan-words').value.trim();
  if(!goal){alert('Please describe your goal!');return;}
  let btn=document.getElementById('ai-plan-btn');
  btn.disabled=true;btn.textContent='Generating...';
  let resultEl=document.getElementById('ai-plan-result');
  resultEl.style.display='block';resultEl.innerHTML='<span class="spinner"></span> Thinking...';
  let knownCount=known.size;
  let prompt=`You are a German A1 language learning expert. Create a study plan.
Student info: knows ${knownCount}/50 words, current streak: ${streakN} days, XP level: ${getLevelInfo(xpTotal).name}
Goal: ${goal}
Available days: ${days||'7'}
Study time per day: ${time||'20'} minutes
Specific words to focus on: ${words||'all categories'}

Create a day-by-day plan using these modes: Flash DE, Flash EN, Quiz, Fill-in, Gender, Listen.
Apply spaced repetition principles. Be specific about which categories to study each day.
Format as a clear day-by-day plan with time splits. Keep it concise.`;
  try{
    let resp=await fetch('https://yngsuxuamhzefkkjsgus.supabase.co/functions/v1/ai-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+SKEY},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:600,messages:[{role:'user',content:prompt}]})
    });
    let data=await resp.json();
    let txt=data.content?.[0]?.text||'Could not generate plan.';
    // Render markdown-like formatting
    let html=txt
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/^#{1,3}\s+(.+)$/gm,'<div style="font-size:14px;font-weight:700;color:var(--txt);margin:14px 0 6px">$1</div>')
      .replace(/^---+$/gm,'<hr style="border:none;border-top:0.5px solid var(--bor);margin:10px 0">')
      .replace(/^- (.+)$/gm,'<div style="padding:3px 0 3px 12px;border-left:2px solid var(--green);margin:4px 0;font-size:13px">$1</div>')
      .replace(/\n/g,'<br>');
    resultEl.innerHTML=`<div style="background:var(--bg2);border-radius:var(--r);padding:16px;font-size:13px;line-height:1.7;color:var(--txt2)">${html}</div>`;
  }catch(e){
    resultEl.innerHTML='Error generating plan. Please try again.';
  }
  btn.disabled=false;btn.textContent='Generate my plan ✨';
}

// ── AUTH ─────────────────────────────────────────────