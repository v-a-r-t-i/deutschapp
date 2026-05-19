function speak(t,btn){
  if(!window.speechSynthesis)return;
  speechSynthesis.cancel();
  if(btn&&btn.classList.contains('speaking')){btn.classList.remove('speaking');return;}
  document.querySelectorAll('.speaking').forEach(b=>b.classList.remove('speaking'));
  let u=new SpeechSynthesisUtterance(t);
  u.lang='de-DE';
  u.rate=0.75;  // slower = clearer
  u.pitch=1.0;
  // Prefer high quality voices: Google Deutsch, then any de-DE, then any de
  let voices=speechSynthesis.getVoices();
  let preferred=voices.find(v=>v.name.includes('Google')&&v.lang.startsWith('de'))
    ||voices.find(v=>v.lang==='de-DE')
    ||voices.find(v=>v.lang.startsWith('de'));
  if(preferred)u.voice=preferred;
  if(btn){btn.classList.add('speaking');u.onend=()=>btn.classList.remove('speaking');}
  speechSynthesis.speak(u);
}
function bw(s,w){return s.replace(new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:en|es|er|em|s|n)?)','gi'),'<span class="hw">$1</span>');}
function aw(){let w=[];for(let c of selCats)for(let i of(DATA[c]||[]))w.push({...i,cat:c});return w;}
function allW(){let w=[];for(let c of Object.keys(DATA))for(let i of(DATA[c]||[]))w.push({...i,cat:c});return w;}
function cp(cat){let ws=DATA[cat]||[];return{k:ws.filter(w=>known.has(w.de)).length,t:ws.length};}
function shuf(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}}
function ring(k,t){let r=7,c=2*Math.PI*r,p=t?k/t:0,da=(p*c).toFixed(1),ga=((1-p)*c).toFixed(1),col=p===1?'#1D9E75':p>0?'#5DCAA5':'rgba(128,128,128,0.2)';return`<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="${r}" fill="none" stroke="rgba(128,128,128,0.15)" stroke-width="2"/><circle cx="8" cy="8" r="${r}" fill="none" stroke="${col}" stroke-width="2" stroke-dasharray="${da} ${ga}" stroke-linecap="round" transform="rotate(-90 8 8)"/></svg>`;}
function updAll(){
  let all=aw(),t=all.length,k=all.filter(x=>known.has(x.de)).length;
  let due=all.filter(w=>s2due(w.de)).length;
  let lvl=getLevelInfo(xpTotal);
  let pct=xpTotal>=lvl.max?100:Math.round((xpTotal-lvl.min)/(lvl.max-lvl.min)*100);
  // nav
  let sp=document.getElementById('streak-el');if(sp){let today=tday(),yest=new Date();yest.setDate(yest.getDate()-1);let act=lastStudy===today||lastStudy===yest.toISOString().split('T')[0];sp.textContent=(act?'🔥':'❄️')+' '+streakN;sp.className='streak'+(act?'':' cold');}
  let dp=document.getElementById('due-pill');if(dp)dp.textContent=due+' due';
  let xpp=document.getElementById('xp-pill');if(xpp)xpp.textContent='⭐ '+xpTotal+' XP';
  // left sidebar
  let lb=document.getElementById('sw-level-badge');if(lb)lb.textContent='⭐ Lvl '+lvl.lvl+' · '+lvl.name;
  let xfl=document.getElementById('sw-xp-fill');if(xfl)xfl.style.width=pct+'%';
  let xll=document.getElementById('sw-xp-lbl');if(xll)xll.textContent=xpTotal+' XP';
  let xnl=document.getElementById('sw-xp-next');if(xnl)xnl.textContent=(lvl.max-xpTotal)+' to next';
  let skw=document.getElementById('sw-known');if(skw)skw.textContent=k;
  let sst=document.getElementById('sw-streak');if(sst){let act=lastStudy===tday();sst.textContent=(act?'🔥':'❄️')+' '+streakN;}
  let sbs=document.getElementById('sw-best');if(sbs)sbs.textContent=bestStreak+'🏆';
  let sac=document.getElementById('sw-accuracy');if(sac)sac.textContent=sessionReviewed?Math.round(sessionCorrect/sessionReviewed*100)+'%':'—';
  // sidebar cats
  let sc=document.getElementById('sw-cats');
  if(sc)sc.innerHTML=Object.keys(DATA).map(cat=>{let p=cp(cat);let pct2=p.t?Math.round(p.k/p.t*100):0;return`<div class="sw-cat"><span class="sw-cat-name">${cat}</span><span class="sw-cat-pct">${pct2}%</span></div>`;}).join('');
  // right sidebar
  let rr=document.getElementById('sr-reviewed');if(rr)rr.textContent=sessionReviewed;
  let rc=document.getElementById('sr-correct');if(rc)rc.textContent=sessionCorrect;
  let rx=document.getElementById('sr-xp');if(rx)rx.textContent='+'+sessionXP;
  let rm=document.getElementById('sr-mistakes');
  if(rm){rm.innerHTML=mistakes.length?mistakes.slice(-8).map(w=>`<span class="mistake-chip">${w}</span>`).join(''):'<span style="color:var(--txt3)">No mistakes yet!</span>';}
  let rdSoon=document.getElementById('sr-due');
  if(rdSoon){let dueSoon=allW().filter(w=>s2due(w.de)).slice(0,6);rdSoon.innerHTML=dueSoon.length?dueSoon.map(w=>`<span class="mistake-chip" style="background:var(--bl);color:var(--bd);border-color:var(--bd)">${w.de}</span>`).join(''):'<span style="color:var(--txt3)">All caught up!</span>';}
}
function statsH(){
  let all=aw(),t=all.length,k=all.filter(x=>known.has(x.de)).length,d=all.filter(w=>s2due(w.de)).length;
  return`<div class="stats-row"><div class="stat"><div class="stat-n">${t}</div><div class="stat-l">words</div></div><div class="stat"><div class="stat-n" style="color:var(--green)">${k}</div><div class="stat-l">known</div></div><div class="stat"><div class="stat-n" style="color:var(--bd)">${d}</div><div class="stat-l">due today</div></div></div><div class="prog-bar"><div class="prog-fill" style="width:${t?Math.round(k/t*100):0}%"></div></div>`;
}
function catH(){
  // interleave nudge
  let nudge='';
  let singleCat=selCats.size===1?[...selCats][0]:null;
  if(singleCat){let cnt=catSessionCount[singleCat]||0;if(cnt>10)nudge=`<div class="nudge"><span>💡 You've been on <b>${singleCat}</b> for a while. Mix in another category for 30% better retention!</span><button onclick="document.querySelector('.nudge').style.display='none'">Dismiss</button></div>`;}
  return nudge+'<div class="cat-grid">'+Object.keys(DATA).map(cat=>{let p=cp(cat);return`<button class="cat-btn${selCats.has(cat)?' active':''}" onclick="togCat('${cat}')">${ring(p.k,p.t)}${cat}</button>`;}).join('')+'</div>';
}
function togCat(cat){
  if(selCats.has(cat)){if(selCats.size>1)selCats.delete(cat);}else selCats.add(cat);
  catSessionCount[cat]=(catSessionCount[cat]||0)+1;
  saveLocalCache();
  setTab(tab);
}
function phFull(item){return item.phrases.map(p=>`<div class="phrase-block"><div class="phrase-row"><div><div class="phrase-de">${bw(p[0],item.de)}</div><div class="phrase-en">${p[1]}</div></div><button class="psb" onclick="speak('${p[0].replace(/'/g,"\\'")}',this)">🔊</button></div></div>`).join('');}
function phDE(item){return item.phrases.map(p=>`<div class="phrase-block"><div class="phrase-row"><div class="phrase-de">${bw(p[0],item.de)}</div><button class="psb" onclick="speak('${p[0].replace(/'/g,"\\'")}',this)">🔊</button></div></div>`).join('');}
function modeToggle(){return`<div class="mode-row"><button class="mode-btn${answerMode==='choice'?' active':''}" onclick="answerMode='choice';setTab(tab)">4 Options</button><button class="mode-btn${answerMode==='type'?' active':''}" onclick="answerMode='type';setTab(tab)">Type it</button><button class="mode-btn${answerMode==='mistakes'?' active':''}" onclick="answerMode='mistakes';buildQ();rFlash()">Mistakes only</button></div>`;}

// ── TABS ─────────────────────────────────────────────
function setTab(t){
  tab=t;
  document.querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('active',['flash','listen','quiz','fill','gender','browse','plan'][i]===t));
  updAll();
  if(t==='flash'){buildQ();rFlash();}
  else if(t==='listen'){buildListenQ();rListen();}
  else if(t==='quiz'){buildQuizQ();quizSt=null;rQuiz();}
  else if(t==='fill'){blankSt=null;rFill();}
  else if(t==='gender'){buildGQ();rGender();}
  else if(t==='browse')rBrowse();
  else if(t==='ranks')rRanks();
  else rPlan();
}

// ── FLASH ─────────────────────────────────────────────
function buildQ(){
  let all=aw();
  if(answerMode==='mistakes'){
    queue=all.filter(w=>mistakes.includes(w.de));
    if(!queue.length)queue=all;
  }else{
    let due=all.filter(w=>s2due(w.de)),nd=all.filter(w=>!s2due(w.de));
    due.sort((a,b)=>{let ca=s2g(a.de),cb=s2g(b.de);if(!ca.next&&!cb.next)return 0;if(!ca.next)return -1;if(!cb.next)return 1;return ca.next.localeCompare(cb.next);});
    queue=[...due,...nd];
  }
  qIdx=0;revealed=false;confSel=3;
}
function rFlash(){
  let c=document.getElementById('content');
  if(!queue.length){c.innerHTML=statsH()+catH()+'<div class="end-card"><div class="end-emoji">🎉</div><div class="end-title">Queue empty!</div></div>';return;}
  if(qIdx>=queue.length){maybeShowSummary();c.innerHTML=statsH()+catH()+`<div class="end-card"><div class="end-emoji">✅</div><div class="end-title">All done!</div><div class="end-sub">Come back tomorrow for your next cards.</div><button class="btn-next" onclick="buildQ();rFlash()">Review again ↺</button></div>`;return;}
  revealed=false;
  let item=queue[qIdx],sm=s2g(item.de),isR=(flashMode==='en');
  let autoAI=(sm.reps||0)>=4;
  let dueC=queue.filter(w=>s2due(w.de)).length;
  let artS=item.art?`<div class="art-s">${item.art}</div>`:'';
  let front=isR?`<div style="text-align:center"><div class="de-word" style="font-size:22px;color:var(--green)">${item.en}</div><div style="font-size:13px;color:var(--txt2);margin-top:4px">German word?</div></div><div style="font-size:12px;color:var(--txt3);text-align:center;margin-top:8px">Phrases hidden until reveal</div>`:`<div style="text-align:center">${artS}<div class="de-word">${item.de}</div></div><div class="divider"></div>${phDE(item)}`;
  let back=isR?`<div style="text-align:center">${artS}<div class="de-word">${item.de}</div></div><div class="divider"></div>${phFull(item)}`:`<div class="en-word">${item.en}</div><div class="divider"></div>${phFull(item)}`;
  let smI=sm.next?`EF:${sm.ef.toFixed(2)} · ${sm.interval}d · next:${sm.next}`:'New card';
  c.innerHTML=statsH()+catH()+
  `<div class="mode-row">
    <button class="mode-btn${flashMode==='de'?' active':''}" onclick="flashMode='de';buildQ();rFlash()">Flash DE</button>
    <button class="mode-btn${flashMode==='en'?' active':''}" onclick="flashMode='en';buildQ();rFlash()">Flash EN</button>
    <button class="mode-btn${answerMode==='mistakes'?' active':''}" onclick="answerMode=${answerMode==='mistakes'?`'choice'`:`'mistakes'`};buildQ();rFlash()">⚠️ Mistakes</button>
  </div>
  <div class="info-box">🧠 <b>SM-2:</b> ${dueC} due · card ${qIdx+1}/${queue.length} · ${smI}</div>
  <div class="card">
    <div class="card-top"><span class="cat-tag">${item.cat}</span><button class="speak-btn" onclick="speak('${item.de.replace(/'/g,"\\'")}',this)">🔊 hören</button></div>
    <div id="fc-f">${front}</div>
    <div id="fc-b" style="display:none">${back}</div>
    <div id="ai-area" style="margin-top:4px"><div id="ai-phrase-area"></div></div>
    <div class="hint-txt" id="fc-h" onclick="revCard()">tap to reveal ↓</div>
  </div>
  <div id="fc-btns" style="display:none">

    <div class="btn-row">
      <button class="btn" style="background:var(--rl);color:var(--rd);border-color:#D85A30" onclick="rate(1)">Again</button>
      <button class="btn" style="background:var(--yl);color:var(--yd);border-color:#D4A020" onclick="rate(3)">Hard</button>
      <button class="btn btn-g" onclick="rate(4)">Good</button>
      <button class="btn" style="background:var(--gl);color:var(--gd);font-weight:600;border-color:var(--green)" onclick="rate(5)">Easy</button>
    </div>
    <div class="sm2-note" id="sm2n"></div>
  </div>`;
}
function revCard(){if(revealed)return;revealed=true;document.getElementById('fc-f').style.display='none';document.getElementById('fc-b').style.display='block';document.getElementById('fc-h').style.display='none';document.getElementById('fc-btns').style.display='block';document.getElementById('ai-area').style.display='none';}
function rate(q){
  let item=queue[qIdx],r=s2r(item.de,q);
  sessionReviewed++;
  if(q>=3){known.add(item.de);sessionCorrect++;addXP(q===5?XP_RATES.flash_easy:q===3?XP_RATES.flash_hard:XP_RATES.flash_good,'flash');}
  else{mistakes=[...new Set([...mistakes,item.de])].slice(-20);}
  updAll();
  document.getElementById('sm2n').innerHTML=q===1?`↩ Repeating tomorrow · EF:${r.ef.toFixed(2)}`:`Next in <b>${r.interval}d</b> · EF:${r.ef.toFixed(2)}`;
  setTimeout(()=>{qIdx++;rFlash();},700);
}

// ── LISTEN MODE ───────────────────────────────────────
function buildListenQ(){let all=aw();shuf(all);listenSt={queue:all,idx:0,answered:false,chosen:null};}
function rListen(){
  let c=document.getElementById('content');
  if(!listenSt||listenSt.idx>=listenSt.queue.length){
    c.innerHTML=statsH()+catH()+`<div class="end-card"><div class="end-emoji">👂</div><div class="end-title">Listening round done!</div><button class="btn-next" onclick="buildListenQ();rListen()">Again ↺</button></div>`;return;
  }
  let item=listenSt.queue[listenSt.idx];
  let ws=aw();let others=ws.filter(w=>w.de!==item.de);shuf(others);
  let opts=[item.en,...others.slice(0,3).map(w=>w.en)];shuf(opts);
  let optHtml=opts.map(o=>{
    let cl=listenSt.answered?(o===item.en?'correct':(o===listenSt.chosen?'wrong':'')):'';
    return`<button class="q-opt ${cl}" ${listenSt.answered?'disabled':''} onclick="ansListen('${o.replace(/'/g,"\\'")}','${item.en.replace(/'/g,"\\'")}','${item.de.replace(/'/g,"\\'")}')"><b>${o}</b></button>`;
  }).join('');
  let rev=listenSt.answered?`<div style="text-align:center;margin-top:10px"><div class="de-word" style="font-size:22px">${item.de}</div>${item.art?`<div class="art-s">${item.art}</div>`:''}</div>${phFull(item)}`:'';
  c.innerHTML=statsH()+catH()+
  `<div class="listen-card">
    <div style="font-size:13px;color:var(--txt2);margin-bottom:16px">Listen and identify the word — ${listenSt.queue.length-listenSt.idx} left</div>
    <button class="listen-btn" onclick="speak('${item.de.replace(/'/g,"\\'")}',null);this.style.transform='scale(0.95)';setTimeout(()=>this.style.transform='',200)">🔊</button>
    <div style="font-size:13px;color:var(--txt2)">What word did you hear?</div>
  </div>
  <div class="quiz-grid">${optHtml}</div>${rev}
  ${listenSt.answered?`<button class="btn-next" onclick="listenSt.idx++;listenSt.answered=false;rListen()">Next →</button>`:''}`;
  if(!listenSt.answered)setTimeout(()=>speak(item.de,null),300);
}
function ansListen(chosen,correct,de){
  listenSt.answered=true;listenSt.chosen=chosen;
  sessionReviewed++;
  if(chosen===correct){known.add(de);sessionCorrect++;addXP(XP_RATES.listen_correct,'listen');}
  else mistakes=[...new Set([...mistakes,de])].slice(-20);
  updAll();rListen();
}

// ── QUIZ ──────────────────────────────────────────────
function buildQuizQ(){let all=aw();shuf(all);let due=all.filter(w=>s2due(w.de)),nd=all.filter(w=>!s2due(w.de));quizQueue=[...due,...nd];quizQIdx=0;}
function rQuiz(){
  let c=document.getElementById('content'),ws=aw();
  if(ws.length<4){c.innerHTML=statsH()+catH()+'<div class="end-card"><div class="end-title">Select more categories</div></div>';return;}
  if(!quizSt&&quizQIdx>=quizQueue.length){c.innerHTML=statsH()+catH()+modeToggle()+'<div class="end-card"><div class="end-emoji">✅</div><div class="end-title">All done!</div><div class="end-sub">Come back tomorrow for your next cards.</div><button class="btn-next" onclick="buildQuizQ();quizSt=null;rQuiz()">Review again ↺</button></div>';return;}
  if(!quizSt)genQ(ws);let q=quizSt;
  if(answerMode==='type'){
    let rev=q.ans?`<div style="margin-top:10px;text-align:center;font-size:16px;font-weight:500;color:${q.correct_ans?'var(--green)':'#D85A30'}">${q.correct_ans?'✓ Correct!':'✗ '+q.item.de}</div>${phFull(q.item)}`:'';
    c.innerHTML=statsH()+catH()+modeToggle()+
    `<div class="card" style="text-align:center">
      <div class="card-top"><span class="cat-tag">${q.item.cat}</span><button class="speak-btn" onclick="speak('${q.item.de.replace(/'/g,"\\'")}',this)">🔊</button></div>
      ${q.item.art?`<div class="art-s">${q.item.art}</div>`:''}<div class="de-word">${q.item.de}</div>
      <div style="font-size:13px;color:var(--txt2);margin-top:6px">Type the English meaning:</div>
      <input class="type-input${q.ans?(q.correct_ans?' correct':' wrong'):''}" id="type-ans" placeholder="type here..." ${q.ans?'disabled':''} onkeydown="if(event.key==='Enter')submitType()" value="${q.ans?q.typed:''}">
      <div class="type-hint">Press Enter to submit</div>
    </div>${rev}${q.ans?`<button class="btn-next" onclick="nQ()">Next →</button>`:''}`;
    if(!q.ans)setTimeout(()=>{let el=document.getElementById('type-ans');if(el)el.focus();},50);
    return;
  }
  let opts=q.opts.map(o=>{let cl=q.ans?(o===q.cor?'correct':(o===q.ch?'wrong':'')):'';return`<button class="q-opt ${cl}" ${q.ans?'disabled':''} onclick="ansQ('${o.replace(/'/g,"\\'")}')"><b>${o}</b></button>`;}).join('');
  let rev=q.ans?phFull(q.item):'';
  c.innerHTML=statsH()+catH()+modeToggle()+
  `<div class="card" style="text-align:center">
    <div class="card-top"><span class="cat-tag">${q.item.cat}</span><button class="speak-btn" onclick="speak('${q.item.de.replace(/'/g,"\\'")}',this)">🔊</button></div>
    ${q.item.art?`<div class="art-s">${q.item.art}</div>`:''}<div class="de-word">${q.item.de}</div>
    <div style="font-size:13px;color:var(--txt2);margin-top:6px">What does this mean?</div>
  </div>
  <div class="quiz-grid">${opts}</div>${rev}${q.ans?`<button class="btn-next" onclick="nQ()">Next →</button>`:''}`;
}
function genQ(ws){let item=quizQueue[quizQIdx++];if(!item)return;let oth=ws.filter(w=>w.de!==item.de);shuf(oth);let opts=[item.en,oth[0].en,oth[1].en,oth[2].en];shuf(opts);quizSt={item,cor:item.en,opts,ans:false,ch:null,typed:'',correct_ans:false};}
function ansQ(o){quizSt.ans=true;quizSt.ch=o;sessionReviewed++;if(o===quizSt.cor){known.add(quizSt.item.de);sessionCorrect++;addXP(XP_RATES.quiz_correct,'quiz');s2r(quizSt.item.de,4);}else{mistakes=[...new Set([...mistakes,quizSt.item.de])].slice(-20);}updAll();rQuiz();}
function submitType(){
  let inp=document.getElementById('type-ans');if(!inp||quizSt.ans)return;
  let typed=inp.value.trim().toLowerCase();
  let correct=quizSt.item.en.toLowerCase();
  let isOk=typed===correct||correct.includes(typed)||typed.includes(correct.split('/')[0]);
  quizSt.ans=true;quizSt.typed=inp.value;quizSt.correct_ans=isOk;
  sessionReviewed++;
  if(isOk){known.add(quizSt.item.de);sessionCorrect++;addXP(XP_RATES.quiz_correct+2,'quiz');s2r(quizSt.item.de,5);}
  else{mistakes=[...new Set([...mistakes,quizSt.item.de])].slice(-20);}
  updAll();rQuiz();
}
function nQ(){quizSt=null;rQuiz();}

// ── FILL-IN ───────────────────────────────────────────
function rFill(){
  let c=document.getElementById('content'),ws=aw();
  if(ws.length<4){c.innerHTML=statsH()+catH()+'<div class="end-card"><div class="end-title">Select more categories</div></div>';return;}
  if(!blankSt)genB(ws);let q=blankSt,ph=q.phrase[0];
  let re=new RegExp('\\b'+q.item.de+'\\b','gi');
  let display=re.test(ph)?ph.replace(re,'<span class="blank"></span>'):ph.replace(q.item.de,'<span class="blank"></span>');
  if(answerMode==='type'){
    let rev=q.ans?`<div style="margin-top:10px;text-align:center;font-size:15px;font-weight:500;color:${q.ok?'var(--green)':'#D85A30'}">${q.ok?'✓ Richtig!':'✗ '+q.item.de}</div><div style="margin-top:8px">${phFull(q.item)}</div>`:'';
    c.innerHTML=statsH()+catH()+modeToggle()+
    `<div class="card" style="text-align:center">
      <div class="card-top"><span class="cat-tag">${q.item.cat}</span><button class="speak-btn" onclick="speak('${ph.replace(/'/g,"\\'")}',this)">🔊 hören</button></div>
      <div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Type the missing word:</div>
      <div class="blank-phrase">${display}</div>
      <input class="type-input${q.ans?(q.ok?' correct':' wrong'):''}" id="fill-ans" placeholder="type the German word..." ${q.ans?'disabled':''} onkeydown="if(event.key==='Enter')submitFillType()" value="${q.ans?q.typed:''}">
    </div>${rev}${q.ans?`<button class="btn-next" onclick="nB()">Next →</button>`:''}`;
    if(!q.ans)setTimeout(()=>{let el=document.getElementById('fill-ans');if(el)el.focus();},50);
    return;
  }
  let opts=q.opts.map(o=>{let cl=q.ans?(o===q.item.de?'correct':(o===q.ch?'wrong':'')):'';return`<button class="q-opt ${cl}" ${q.ans?'disabled':''} onclick="ansB('${o.replace(/'/g,"\\'")}')"><b>${o}</b></button>`;}).join('');
  let rev=q.ans?`<div class="phrase-block" style="margin-top:10px"><div class="phrase-row"><div><div class="phrase-de">${bw(ph,q.item.de)}</div><div class="phrase-en">${q.phrase[1]}</div></div><button class="psb" onclick="speak('${ph.replace(/'/g,"\\'")}',this)">🔊</button></div></div>`:'';
  c.innerHTML=statsH()+catH()+modeToggle()+
  `<div class="card" style="text-align:center">
    <div class="card-top"><span class="cat-tag">${q.item.cat}</span></div>
    <div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Fill in the missing word:</div>
    <div class="blank-phrase">${display}</div>
  </div>
  <div class="quiz-grid">${opts}</div>${rev}${q.ans?`<button class="btn-next" onclick="nB()">Next →</button>`:''}`;
}
function genB(ws){let cands=ws.filter(w=>w.phrases.some(p=>p[0].includes(w.de)));if(!cands.length)cands=ws;let item=cands[Math.floor(Math.random()*cands.length)];let pw=item.phrases.find(p=>p[0].includes(item.de))||item.phrases[0];let oth=ws.filter(w=>w.de!==item.de);shuf(oth);let opts=[item.de,...oth.slice(0,3).map(w=>w.de)];shuf(opts);blankSt={item,phrase:pw,opts:opts.slice(0,4),ans:false,ch:null,typed:'',ok:false};}
function ansB(o){blankSt.ans=true;blankSt.ch=o;sessionReviewed++;if(o===blankSt.item.de){known.add(blankSt.item.de);sessionCorrect++;addXP(XP_RATES.fill_correct,'fill');s2r(blankSt.item.de,4);}else{mistakes=[...new Set([...mistakes,blankSt.item.de])].slice(-20);}updAll();rFill();}
function submitFillType(){
  let inp=document.getElementById('fill-ans');if(!inp||blankSt.ans)return;
  let typed=inp.value.trim();
  let ok=typed.toLowerCase()===blankSt.item.de.toLowerCase();
  blankSt.ans=true;blankSt.typed=typed;blankSt.ok=ok;
  sessionReviewed++;
  if(ok){known.add(blankSt.item.de);sessionCorrect++;addXP(XP_RATES.fill_correct+2,'fill');s2r(blankSt.item.de,5);}
  else{mistakes=[...new Set([...mistakes,blankSt.item.de])].slice(-20);}
  updAll();rFill();
}
function nB(){blankSt=null;rFill();}

// ── GENDER ────────────────────────────────────────────
function buildGQ(){let ns=aw().filter(w=>w.art!==null);shuf(ns);gQ=ns;gIdx=0;gAns=false;}
function rGender(){
  let c=document.getElementById('content'),ns=aw().filter(w=>w.art!==null);
  if(!ns.length){c.innerHTML=statsH()+'<div class="end-card"><div class="end-title">No nouns in selection</div></div>';return;}
  if(gIdx>=gQ.length){let pct=gScore.tot?Math.round(gScore.ok/gScore.tot*100):0;c.innerHTML=statsH()+catH()+`<div class="end-card"><div class="end-emoji">${pct>=80?'🎉':'💪'}</div><div class="end-title">Round done — ${pct}%</div><div class="end-sub">${gScore.ok}/${gScore.tot} correct</div><button class="btn-next" style="max-width:220px;margin:0 auto;display:block" onclick="gScore={ok:0,tot:0};buildGQ();rGender()">Try again ↺</button></div>`;return;}
  let item=gQ[gIdx];
  let btns=['der','die','das'].map(a=>{let cl=gAns?(a===item.art?'correct':(a!==item.art&&a===window._gc?'wrong':'')):'';return`<button class="g-btn ${cl}" ${gAns?'disabled':''} onclick="ansG('${a}')">${a}</button>`;}).join('');
  let res=gAns?`<div class="gender-result ${window._gc===item.art?'ok':'no'}">${window._gc===item.art?'✓ Richtig!':'✗ '+item.art+' '+item.de}</div>`:'';
  c.innerHTML=`<div class="gender-score"><div class="gscore"><div class="gscore-n" style="color:var(--green)">${gScore.ok}</div><div class="gscore-l">correct</div></div><div class="gscore"><div class="gscore-n" style="color:#D85A30">${gScore.tot-gScore.ok}</div><div class="gscore-l">wrong</div></div><div class="gscore"><div class="gscore-n">${gQ.length-gIdx}</div><div class="gscore-l">left</div></div></div>`+
  catH()+
  `<div class="gender-card"><div class="card-top" style="justify-content:space-between"><span class="cat-tag">${item.cat}</span><button class="speak-btn" onclick="speak('${item.de.replace(/'/g,"\\'")}',this)">🔊 hören</button></div><div class="gender-word">${item.de}</div><div class="gender-hint">der · die · das — which article?</div><div class="gender-btns">${btns}</div>${res}${gAns?`<div style="font-size:13px;color:var(--txt2);margin-top:6px">${item.en}</div><button class="btn-next" style="margin-top:12px" onclick="nG()">Next →</button>`:''}</div>`;
}
function ansG(a){if(gAns)return;gAns=true;window._gc=a;let item=gQ[gIdx];let ok=a===item.art;gScore.tot++;sessionReviewed++;if(ok){gScore.ok++;sessionCorrect++;addXP(XP_RATES.gender_correct,'gender');}else{mistakes=[...new Set([...mistakes,item.de])].slice(-20);}updAll();rGender();}
function nG(){gIdx++;gAns=false;rGender();}

// ── BROWSE ────────────────────────────────────────────
function rBrowse(){
  let c=document.getElementById('content'),html=statsH()+catH();
  for(let cat of selCats){
    let ws=DATA[cat]||[],p=cp(cat);
    html+=`<div class="list-sec"><div class="list-cat-hdr">${cat}<span style="font-size:12px;color:var(--txt2);font-weight:400">${p.k}/${p.t}</span></div>`;
    for(let item of ws){
      let k=known.has(item.de),artS=item.art?`<span class="lw-art">${item.art}</span>`:'';
      let phH=item.phrases.map(p=>`<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px"><div><div class="lp-de">${bw(p[0],item.de)}</div><div class="lp-en">${p[1]}</div></div><button class="psb" onclick="speak('${p[0].replace(/'/g,"\\'")}',this)" style="margin-left:auto;flex-shrink:0">🔊</button></div>`).join('');
      html+=`<div class="list-word"><div class="list-hdr" onclick="this.nextElementSibling.classList.toggle('open')"><div class="lw-left"><button class="psb" onclick="event.stopPropagation();speak('${item.de.replace(/'/g,"\\'")}',this)">🔊</button>${artS}<span class="lw-de">${item.de}</span><span class="lw-en">— ${item.en}</span></div><div style="display:flex;align-items:center;gap:6px">${k?'<span class="lw-known">✓</span>':''}<span style="color:var(--txt3);font-size:16px">›</span></div></div><div class="list-body">${phH}<button class="refresh-phrase" style="margin-top:8px" onclick="refreshPhrases('${item.de}',this.nextElementSibling)">✨ AI phrases</button><div></div><button class="mark-btn${k?' known':''}" onclick="toggleKnown('${item.de}',${!k})">${k?'Mark as learning':'Mark as known ✓'}</button></div></div>`;
    }
    html+='</div>';
  }
  c.innerHTML=html;
}
async function toggleKnown(de,val){
  if(val)known.add(de);else known.delete(de);
  let sm=s2g(de);
  await sb.from('word_progress').upsert({user_id:CU.id,word_de:de,known:val,interval:sm.interval,reps:sm.reps,ef:sm.ef,next_review:sm.next,updated_at:new Date().toISOString()},{onConflict:'user_id,word_de'});
  rBrowse();
}

// ── PLAN ─────────────────────────────────────────────
function rPlan(){
  let c=document.getElementById('content');
  let done=doneDays.size,todayDay=Math.max(1,Math.min(11,Math.floor((new Date()-new Date('2026-05-16'))/86400000)+1));
  let html=`<div style="margin-bottom:12px"><div style="font-size:16px;font-weight:600;margin-bottom:10px">11-day plan · May 16–26</div>
  <div class="plan-stats"><div class="stat"><div class="stat-n">50</div><div class="stat-l">words</div></div><div class="stat"><div class="stat-n">40</div><div class="stat-l">min/day</div></div><div class="stat"><div class="stat-n">${done}</div><div class="stat-l">days done</div></div><div class="stat"><div class="stat-n">${streakN}</div><div class="stat-l">🔥 streak</div></div></div>
  <div class="prog-bar"><div class="prog-fill" style="width:${Math.round(done/11*100)}%"></div></div></div>

  <!-- AI PLAN GENERATOR -->
  <div class="ai-plan-wrap">
    <div class="ai-plan-title">✨ AI Personal Plan Generator</div>
    <div class="ai-plan-field"><label>Your goal (e.g. "Pass my A1 exam on June 5th")</label><input type="text" id="plan-goal" placeholder="What do you want to achieve?"></div>
    <div class="ai-plan-field"><label>Available days</label><input type="number" id="plan-days" placeholder="7" min="1" max="30"></div>
    <div class="ai-plan-field"><label>Minutes per day</label><input type="number" id="plan-time" placeholder="20" min="5" max="120"></div>
    <div class="ai-plan-field"><label>Specific words/categories to focus on (optional)</label><input type="text" id="plan-words" placeholder="e.g. Essen/Trinken, Reisen"></div>
    <button class="ai-gen-btn" id="ai-plan-btn" onclick="genAIPlan()">Generate my plan ✨</button>
    <div class="ai-result" id="ai-plan-result" style="margin-top:10px;min-height:20px"></div>
  </div>`;

  for(let d of PLAN){
    let isDone=doneDays.has(d.day),isT=d.day===todayDay,isR=d.type==='review'||d.type==='final';
    let dc=isDone?'d':isT?'t':isR?'r':'',badge=isDone?'<span class="badge badge-g">✓ Done</span>':isT?'<span class="badge badge-g">Today</span>':isR?'<span class="badge badge-b">Review</span>':'';
    let sub=d.newWords.length?`${d.newWords.length} new words`:d.type==='review'?'Full review':d.type==='final'?'Final test':'';
    let phH=d.phases.map(p=>`<div class="phase-row"><div class="ph-min">${p.min}m</div><div class="ph-mode">${p.mode}</div><div class="ph-desc">${p.desc}</div></div>`).join('');
    let nwH=d.newWords.length?`<div class="sec-lbl">New words</div><div class="chips">${d.newWords.map(w=>`<span class="chip">${w}</span>`).join('')}</div>`:'';
    let mnH=d.mnemonics.length?`<div class="sec-lbl">Mnemonics</div><div class="sci-box">${d.mnemonics.map(m=>`<div class="mnem-item">${m}</div>`).join('')}</div>`:'';
    html+=`<div class="day-card${isT?' today':''}"><div class="day-hdr" onclick="togDay(${d.day})"><div class="day-num ${dc}">${isDone?'✓':d.day}</div><div class="day-meta"><div class="day-title">${d.date} — ${d.newCat||'Review'}</div><div class="day-sub">${sub}</div></div><div class="day-right">${badge}<div class="day-min">${d.totalMin}m</div><div id="dc${d.day}">›</div></div></div><div class="day-body${isT?' open':''}" id="db${d.day}"><div class="sec-lbl">Session plan</div>${phH}${nwH}${mnH}<div class="sec-lbl">Science note</div><div class="sci-box">${d.science}</div><button class="${isDone?'undone-btn':'done-btn'}" onclick="togDone(${d.day})">${isDone?'Mark as not done':'Mark as done ✓'}</button></div></div>`;
  }
  c.innerHTML=html;
  document.getElementById('ai-plan-result').style.display='none';
}
function togDay(day){let b=document.getElementById('db'+day),ch=document.getElementById('dc'+day);let o=b.classList.toggle('open');if(ch)ch.textContent=o?'‹':'›';}
function togDone(day){if(doneDays.has(day))doneDays.delete(day);else doneDays.add(day);rPlan();}

// ── RANKS ────────────────────────────────────────────
function rRanks(){
  let c=document.getElementById('content');
  let tabs=['global','friends','race'];
  let labels=['🏆 Ranks','👥 Friends','⚡ Race'];
  let html=statsH()+`<div style="display:flex;gap:6px;margin-bottom:16px">${tabs.map((t,i)=>`<button class="mode-btn${ranksSubTab===t?' active':''}" onclick="ranksSubTab='${t}';rRanks()">${labels[i]}</button>`).join('')}</div>`;
  if(ranksSubTab==='global'){html+=rRanksGlobal();}
  else if(ranksSubTab==='friends'){html+=rFriendsUI();}
  else{html+=rRaceUI();}
  c.innerHTML=html;
  if(ranksSubTab==='friends')loadFriends();
  if(ranksSubTab==='race')loadRaceRoom();
}

function rRanksGlobal(){
  let lvl=getLevelInfo(xpTotal);
  let html=`<div style="margin-bottom:12px"><div style="font-size:16px;font-weight:600;margin-bottom:4px">⭐ Rank Ladder</div><div style="font-size:13px;color:var(--txt2);margin-bottom:16px">Earn XP by studying to level up</div></div>`;
  for(let l of LEVELS){
    let isCurrent=l.lvl===lvl.lvl;
    let isDone=xpTotal>=l.max&&l.lvl<LEVELS.length;
    let pct=isDone?100:isCurrent?Math.round((xpTotal-l.min)/(l.max-l.min)*100):xpTotal>=l.min?100:0;
    html+=`<div style="border:${isCurrent?'1.5px solid var(--green)':'0.5px solid var(--bor)'};border-radius:var(--r);padding:14px 16px;margin-bottom:8px;background:${isCurrent?'var(--gl)':'var(--bg)'}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:50%;background:${isCurrent?'var(--green)':isDone?'var(--bg3)':'var(--bg2)'};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:${isCurrent?'#fff':'var(--txt2)'}">${l.lvl}</div>
          <div>
            <div style="font-size:15px;font-weight:600;color:${isCurrent?'var(--gd)':'var(--txt)'}">${l.name}${isCurrent?' ← you are here':''}</div>
            <div style="font-size:12px;color:var(--txt2)">${l.min}–${l.max===99999?'∞':l.max} XP</div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--txt2)">${isDone?'✓ Done':isCurrent?xpTotal+' / '+l.max+' XP':l.min+' XP to unlock'}</div>
      </div>
      <div style="height:4px;background:var(--bg3);border-radius:2px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${isCurrent?'var(--green)':isDone?'var(--bg3)':'var(--bg3)'};border-radius:2px;transition:width 0.4s"></div>
      </div>
      <div style="margin-top:8px;font-size:12px;color:var(--txt2)">
        ${l.lvl===1?'Earn XP by answering correctly in any mode':
          l.lvl===2?'Flash Easy: +10 · Quiz: +8 · Type: +10':
          l.lvl===3?'Listen mode gives +10 XP per correct answer':
          l.lvl===4?'Gender drill: +5 · Fill-in: +8 XP':
          l.lvl===5?'Mix all modes for fastest XP gain':
          l.lvl===6?'Daily streaks multiply your XP over time':
          'Maximum level — Meister of German A1!'}
      </div>
    </div>`;
  }
  // How to earn XP breakdown
  html+=`<div style="background:var(--bg2);border-radius:var(--r);padding:14px 16px;margin-top:8px">
    <div style="font-size:13px;font-weight:600;margin-bottom:10px">How to earn XP</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      ${[['🎴 Flash Easy','10 XP'],['🎴 Flash Good','5 XP'],['🎴 Flash Hard','2 XP'],['❓ Quiz correct','8 XP'],['⌨️ Type correct','10 XP'],['📝 Fill-in correct','8 XP'],['🔤 Gender correct','5 XP'],['👂 Listen correct','10 XP']].map(([k,v])=>`<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 8px;background:var(--bg);border-radius:var(--rs)"><span style="color:var(--txt2)">${k}</span><span style="color:var(--green);font-weight:500">${v}</span></div>`).join('')}
    </div>
  </div>`;
  return html;
}

// ── FRIENDS ───────────────────────────────────────────
function rFriendsUI(){
  return `<div id="friends-wrap">
    <div style="font-size:16px;font-weight:600;margin-bottom:4px">👥 Friends</div>
    <div style="font-size:13px;color:var(--txt2);margin-bottom:14px">Add friends to compare progress</div>
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <input id="friend-search" class="type-input" placeholder="Search by name..." style="flex:1;margin:0" oninput="searchFriends(this.value)">
    </div>
    <div id="friend-search-results"></div>
    <div id="friend-requests-section"></div>
    <div id="friends-list"><div style="text-align:center;color:var(--txt2);font-size:13px;padding:20px">Loading...</div></div>
  </div>`;
}

async function loadFriends(){
  if(!CU)return;
  let [fsRes,profRes]=await Promise.all([
    sbFetch('friendships','or=(user_id.eq.'+CU.id+',friend_id.eq.'+CU.id+')'),
    sbFetch('profiles','select=id,display_name&role=eq.student')
  ]);
  let fs=fsRes||[],allProfs=profRes||[];
  // Pending incoming
  let incoming=fs.filter(f=>f.friend_id===CU.id&&f.status==='pending');
  let reqHtml='';
  if(incoming.length){
    reqHtml=`<div style="font-size:13px;font-weight:600;margin-bottom:8px">Pending requests (${incoming.length})</div>`;
    for(let r of incoming){
      let p=allProfs.find(x=>x.id===r.user_id);
      let name=p?.display_name||r.user_id.slice(0,8);
      reqHtml+=`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg2);border-radius:var(--r);margin-bottom:6px">
        <span style="font-size:14px;font-weight:500">${name} wants to be friends</span>
        <button class="btn-sm-green" onclick="acceptFriend('${r.id}')">Accept</button>
      </div>`;
    }
    reqHtml+=`<div style="margin-bottom:14px"></div>`;
  }
  let reqEl=document.getElementById('friend-requests-section');
  if(reqEl)reqEl.innerHTML=reqHtml;
  // Accepted friends
  let accepted=fs.filter(f=>f.status==='accepted');
  let friendIds=accepted.map(f=>f.user_id===CU.id?f.friend_id:f.user_id);
  let listEl=document.getElementById('friends-list');
  if(!listEl)return;
  if(!friendIds.length){listEl.innerHTML='<div style="text-align:center;color:var(--txt2);font-size:13px;padding:20px">No friends yet — search for someone above!</div>';return;}
  let wpRes=await sbFetch('word_progress','?user_id=in.('+friendIds.join(',')+')&select=user_id,known');
  let skRes=await sbFetch('streaks','?user_id=in.('+friendIds.join(',')+')&select=user_id,xp_total,streak_count');
  let wp=wpRes||[],sk=skRes||[];
  let html='<div style="font-size:13px;font-weight:600;margin-bottom:8px">Your friends</div>';
  for(let fid of friendIds){
    let p=allProfs.find(x=>x.id===fid);
    let name=p?.display_name||fid.slice(0,8);
    let known=(wp.filter(x=>x.user_id===fid&&x.known)).length;
    let skd=sk.find(x=>x.user_id===fid);
    let xp=skd?.xp_total||0,streak=skd?.streak_count||0;
    let lvl=getLevelInfo(xp);
    html+=`<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--bg2);border-radius:var(--r);margin-bottom:8px">
      <div>
        <div style="font-size:14px;font-weight:600">${name}</div>
        <div style="font-size:12px;color:var(--txt2);margin-top:2px">Lvl ${lvl.lvl} ${lvl.name} · ❄️ ${streak}d streak</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:15px;font-weight:700;color:var(--green)">${known} words</div>
        <div style="font-size:12px;color:var(--txt2)">${xp} XP</div>
      </div>
    </div>`;
  }
  listEl.innerHTML=html;
}

async function searchFriends(q){
  let el=document.getElementById('friend-search-results');
  if(!el)return;
  if(q.length<2){el.innerHTML='';return;}
  let res=await sbFetch('profiles','display_name=ilike.*'+encodeURIComponent(q)+'*&select=id,display_name&id=neq.'+CU.id);
  if(!res?.length){el.innerHTML='<div style="font-size:13px;color:var(--txt2);margin-bottom:10px">No users found.</div>';return;}
  // Get existing friendship ids
  let fsRes=await sbFetch('friendships','or=(user_id.eq.'+CU.id+',friend_id.eq.'+CU.id+')');
  let fs=fsRes||[];
  let html='';
  for(let p of res.slice(0,5)){
    let existing=fs.find(f=>(f.user_id===p.id||f.friend_id===p.id));
    let btn=existing
      ?`<span style="font-size:12px;color:var(--txt2)">${existing.status==='pending'?'Pending':'Friends ✓'}</span>`
      :`<button class="btn-sm-green" onclick="sendFriendReq('${p.id}','${p.display_name}',this)">Add</button>`;
    html+=`<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg2);border-radius:var(--r);margin-bottom:6px">
      <span style="font-size:14px;font-weight:500">${p.display_name}</span>${btn}</div>`;
  }
  el.innerHTML=html+'<div style="margin-bottom:12px"></div>';
}

async function sendFriendReq(friendId,name,btn){
  btn.disabled=true;btn.textContent='Sending...';
  await sbUpsert('friendships',{user_id:CU.id,friend_id:friendId,status:'pending'});
  btn.textContent='Sent ✓';
}

async function acceptFriend(fsId){
  await fetch(SURL+'/rest/v1/friendships?id=eq.'+fsId,{method:'PATCH',headers:{'apikey':SKEY,'Authorization':'Bearer '+(authToken||SKEY),'Content-Type':'application/json'},body:JSON.stringify({status:'accepted'})});
  loadFriends();
}

// ── RACE ───────────────────────────────────────────────
function rRaceUI(){
  if(raceSt&&!raceSt.done)return rRaceActive();
  if(raceSt&&raceSt.done)return rRaceResults();
  return `<div>
    <div style="font-size:16px;font-weight:600;margin-bottom:4px">⚡ Race</div>
    <div style="font-size:13px;color:var(--txt2);margin-bottom:18px">Race a friend — same words, who scores higher?</div>
    <div style="display:flex;flex-direction:column;gap:10px;max-width:320px;margin:0 auto">
      <button class="btn-next" onclick="createRace()">⚡ Create Race Room</button>
      <div style="text-align:center;font-size:12px;color:var(--txt2)">— or join a friend's room —</div>
      <input id="race-code-input" class="type-input" placeholder="Enter 4-letter code..." maxlength="4" style="text-align:center;font-size:20px;letter-spacing:6px;text-transform:uppercase;margin:0">
      <button class="btn-next" style="background:var(--bg3);color:var(--txt)" onclick="joinRace()">Join Room</button>
    </div>
    <div id="race-status" style="text-align:center;margin-top:16px;font-size:14px;color:var(--txt2)"></div>
  </div>`;
}

function loadRaceRoom(){} // placeholder so rRanks doesn't error

async function createRace(){
  let statusEl=document.getElementById('race-status');
  if(statusEl)statusEl.textContent='Creating room...';
  let words=aw();shuf(words);words=words.slice(0,10);
  let code=Math.random().toString(36).slice(2,6).toUpperCase();
  let room={code,creator_id:CU.id,words:JSON.stringify(words),status:'waiting'};
  let res=await sbUpsert('race_rooms',room);
  if(!res){if(statusEl)statusEl.textContent='Error creating room. Try again.';return;}
  let savedRoom=Array.isArray(res)?res[0]:room;
  raceSt={room:savedRoom,words,idx:0,score:0,startTime:Date.now(),done:false,isCreator:true};
  rRanks();
}

async function joinRace(){
  let code=document.getElementById('race-code-input')?.value.trim().toUpperCase();
  if(code.length!==4){let s=document.getElementById('race-status');if(s)s.textContent='Enter a 4-letter code.';return;}
  let res=await sbFetch('race_rooms','code=eq.'+code+'&limit=1');
  if(!res?.length){let s=document.getElementById('race-status');if(s)s.textContent='Room not found.';return;}
  let room=res[0];
  let words=JSON.parse(room.words);
  raceSt={room,words,idx:0,score:0,startTime:Date.now(),done:false,isCreator:false};
  rRanks();
}

function rRaceActive(){
  let r=raceSt;
  if(r.idx>=r.words.length){finishRace();return rRaceResults();}
  let item=r.words[r.idx];
  let ws=aw();
  let oth=ws.filter(w=>w.de!==item.de);shuf(oth);
  let opts=[item.en,...oth.slice(0,3).map(w=>w.en)];shuf(opts);
  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span style="font-size:13px;color:var(--txt2)">⚡ Race · ${r.idx+1}/${r.words.length}</span>
      <span style="font-size:13px;font-weight:600;color:var(--green)">Score: ${r.score}</span>
    </div>
    <div class="card" style="text-align:center">
      ${item.art?`<div class="art-s">${item.art}</div>`:''}
      <div class="de-word">${item.de}</div>
      <div style="font-size:13px;color:var(--txt2);margin-top:6px">What does this mean?</div>
    </div>
    <div class="quiz-grid" style="margin-top:12px">
      ${opts.map(o=>`<button class="q-opt" onclick="ansRace('${o.replace(/'/g,"\\'")}','${item.en.replace(/'/g,"\\'")}',this)">${o}</button>`).join('')}
    </div>
    <button class="btn-next" style="background:var(--bg3);color:var(--txt2);margin-top:8px;font-size:12px" onclick="raceSt=null;rRanks()">✕ Quit race</button>
  </div>`;
}

function ansRace(chosen,correct,btn){
  let btns=btn.closest('.quiz-grid').querySelectorAll('.q-opt');
  btns.forEach(b=>{b.disabled=true;if(b.textContent.trim()===correct)b.className='q-opt correct';else if(b===btn&&chosen!==correct)b.className='q-opt wrong';});
  if(chosen===correct)raceSt.score++;
  setTimeout(()=>{raceSt.idx++;rRanks();},600);
}

async function finishRace(){
  if(raceSt.done)return;
  raceSt.done=true;
  let timeMs=Date.now()-raceSt.startTime;
  await sbUpsert('race_results',{room_id:raceSt.room.id||raceSt.room.code,user_id:CU.id,display_name:CP?.display_name||'You',score:raceSt.score,total:raceSt.words.length,time_ms:timeMs});
}

function rRaceResults(){
  let r=raceSt;
  let pct=Math.round(r.score/r.words.length*100);
  let emoji=pct===100?'🏆':pct>=70?'🎉':pct>=40?'👍':'💪';
  return `<div style="text-align:center;padding:20px 0">
    <div style="font-size:48px;margin-bottom:8px">${emoji}</div>
    <div style="font-size:22px;font-weight:700;margin-bottom:4px">${r.score} / ${r.words.length}</div>
    <div style="font-size:14px;color:var(--txt2);margin-bottom:20px">${pct}% correct</div>
    <button class="btn-next" onclick="raceSt=null;rRanks()">Back to Race</button>
  </div>`;
}

// ── TEACHER ───────────────────────────────────────────

async function loadTeacher(){
  let tc=document.getElementById('teacher-content');
  let{data:profiles}=await sb.from('profiles').select('*').eq('role','student');
  let{data:allWP}=await sb.from('word_progress').select('*');
  let{data:allSK}=await sb.from('streaks').select('*');
  if(!profiles?.length){tc.innerHTML='<div class="dash-wrap"><div class="dash-title">Class Dashboard</div><p style="color:var(--txt2);font-size:14px;margin-top:20px">No students yet. Share:<br><strong>https://v-a-r-t-i.github.io/deutschapp</strong></p></div>';return;}
  let totalW=Object.values(DATA).reduce((a,b)=>a+b.length,0);
  let today=tday(),yest=new Date();yest.setDate(yest.getDate()-1);let yStr=yest.toISOString().split('T')[0];
  let activeToday=allSK?.filter(s=>s.last_study_date===today).length||0;
  let avgKnown=profiles.length?Math.round((allWP?.filter(p=>p.known).length||0)/profiles.length):0;
  let html=`<div class="dash-wrap"><div class="dash-title">Class Dashboard</div><div class="dash-sub">${profiles.length} student${profiles.length>1?'s':''} · ${totalW} words total</div><button class="refresh-btn" onclick="loadTeacher()">↺ Refresh</button>
  <div class="dash-stats"><div class="dash-stat"><div class="dash-n">${profiles.length}</div><div class="dash-l">students</div></div><div class="dash-stat"><div class="dash-n">${activeToday}</div><div class="dash-l">active today</div></div><div class="dash-stat"><div class="dash-n">${avgKnown}</div><div class="dash-l">avg known</div></div></div>`;
  profiles.sort((a,b)=>{let ka=allWP?.filter(p=>p.user_id===a.id&&p.known).length||0,kb=allWP?.filter(p=>p.user_id===b.id&&p.known).length||0;return kb-ka;});
  for(let p of profiles){
    let wp=allWP?.filter(x=>x.user_id===p.id)||[];
    let sk=allSK?.find(s=>s.user_id===p.id);
    let kn=wp.filter(x=>x.known).length,due=wp.filter(x=>x.next_review&&x.next_review<=today).length;
    let sn=sk?.streak_count||0,bs=sk?.best_streak||sn,xp=sk?.xp_total||0;
    let ld=sk?.last_study_date;
    let active=ld===today||ld===yStr;
    let ldStr=ld?(ld===today?'today':ld===yStr?'yesterday':ld):'never';
    let pct=Math.round(kn/totalW*100);
    let lvl=getLevelInfo(xp);
    html+=`<div class="student-card"><div class="student-top"><div><div class="student-name">${p.display_name||'Unnamed'}</div><div class="student-email">${p.email}</div></div><div class="sbadges"><span class="sb sb-g">${kn}/${totalW}</span>${due?`<span class="sb sb-b">${due} due</span>`:''}<span class="sb ${active?'sb-y':'sb-r'}">${active?'🔥':'❄️'} ${sn}d</span><span class="sb" style="background:var(--xpl);color:var(--xp)">⭐ Lvl ${lvl.lvl}</span></div></div><div class="s-prog"><div class="s-prog-fill" style="width:${pct}%"></div></div><div class="s-prog-lbl">${pct}% · last seen ${ldStr} · best streak: ${bs}d</div></div>`;
  }
  html+='</div>';tc.innerHTML=html;
}

function showXPInfo(){
  let lvl=getLevelInfo(xpTotal);
  alert(`Level ${lvl.lvl}: ${lvl.name}\n${xpTotal} XP total\n${lvl.max-xpTotal} XP to next level\n\nHow to earn XP:\nFlash Easy: +10\nFlash Good: +5\nFlash Hard: +2\nQuiz correct: +8\nType correct: +10\nFill-in correct: +8\nGender correct: +5\nListen correct: +10`);
}


speechSynthesis.onvoiceschanged=()=>{};