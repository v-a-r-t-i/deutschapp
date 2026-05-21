function speak(t,btn){
  if(!window.speechSynthesis)return;
  speechSynthesis.cancel();
  if(btn&&btn.classList.contains('speaking')){btn.classList.remove('speaking');return;}
  document.querySelectorAll('.speaking').forEach(b=>b.classList.remove('speaking'));
  let u=new SpeechSynthesisUtterance(t);
  let isKr=lang==='kr';
  u.lang=isKr?'ko-KR':'de-DE';
  u.rate=isKr?0.85:0.75;
  u.pitch=1.0;
  let voices=speechSynthesis.getVoices();
  let preferred=isKr
    ?(voices.find(v=>v.name.includes('Google')&&v.lang.startsWith('ko'))||voices.find(v=>v.lang.startsWith('ko')))
    :(voices.find(v=>v.name.includes('Google')&&v.lang.startsWith('de'))||voices.find(v=>v.lang==='de-DE')||voices.find(v=>v.lang.startsWith('de')));
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
// ── MODAL ─────────────────────────────────────────────
function showModal({title,body,confirm='Confirm',cancel='Cancel',onConfirm,onCancel}={}){
  let existing=document.getElementById('app-modal');
  if(existing)existing.remove();
  let m=document.createElement('div');
  m.id='app-modal';
  m.innerHTML='<div class="modal-backdrop" onclick="closeModal()"></div><div class="modal-box"><div class="modal-title">'+(title||'')+'</div><div class="modal-body">'+(body||'')+'</div><div class="modal-btns">'+(cancel!==null?'<button class="modal-btn-cancel" onclick="closeModal()">'+cancel+'</button>':'')+'<button class="modal-btn-confirm" id="modal-confirm-btn">'+confirm+'</button></div></div>';
  document.body.appendChild(m);
  document.getElementById('modal-confirm-btn').onclick=()=>{if(onConfirm)onConfirm();closeModal();};
}
function closeModal(){let m=document.getElementById('app-modal');if(m)m.remove();}


function updAll(){
  // Throttled session save — at most once every 3s to catch wrong answers too
  if(CU){let now=Date.now();if(!updAll._lastSave||now-updAll._lastSave>3000){updAll._lastSave=now;saveLocalCache();}}
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
function phFull(item){return item.phrases.map(p=>`<div class="phrase-block"><div class="phrase-row"><div style="flex:1"><div class="phrase-de">${bw(p[0],item.de)}</div><div class="phrase-en">${p[1]}</div></div><button class="psb" onclick="speak('${p[0].replace(/'/g,"\\'")}',this)" style="flex-shrink:0;margin-left:10px">🔊</button></div></div>`).join('');}
function phDE(item){return item.phrases.map(p=>`<div class="phrase-block"><div class="phrase-row"><div class="phrase-de">${bw(p[0],item.de)}</div><button class="psb" onclick="speak('${p[0].replace(/'/g,"\\'")}',this)">🔊</button></div></div>`).join('');}
function modeToggle(){return`<div class="mode-row"><button class="mode-btn${answerMode==='choice'?' active':''}" onclick="answerMode='choice';setTab(tab)">4 Options</button><button class="mode-btn${answerMode==='type'?' active':''}" onclick="answerMode='type';setTab(tab)">Type it</button><button class="mode-btn${answerMode==='mistakes'?' active':''}" onclick="answerMode='mistakes';buildQ();rFlash()">⚠️ Hard Words</button></div>`;}

// ── TABS ─────────────────────────────────────────────
let lastStudyTab='flash';
const studyTabs=['flash','listen','quiz','fill','gender'];
function setTab(t){
  tab=t;
  let isStudy=studyTabs.includes(t);
  if(isStudy)lastStudyTab=t;
  // Update main tabs
  document.querySelectorAll('.tab').forEach((b,i)=>{
    let names=['study','browse','plan','social'];
    b.classList.toggle('active',names[i]===(isStudy?'study':t));
  });
  // Show/hide study mode pills
  let sm=document.getElementById('study-modes');
  if(sm)sm.style.display=isStudy?'flex':'none';
  let studyPills=['flash','listen','quiz','fill','gender'];
  let studyLabels=lang==='kr'?['Flash','Listen','Quiz','Fill-in','Formality']:['Flash','Listen','Quiz','Fill-in','Gender'];
  document.getElementById('study-modes').innerHTML=studyPills.map((t,i)=>
    `<div class="mode-pill${tab===t?' active':''}" id="pill-${t}" onclick="setStudyTab('${t}')">${studyLabels[i]}</div>`
  ).join('');
  updAll();
  if(t==='flash'){buildQ();rFlash();}
  else if(t==='listen'){buildListenQ();rListen();}
  else if(t==='quiz'){buildQuizQ();quizSt=null;rQuiz();}
  else if(t==='fill'){blankSt=null;rFill();}
  else if(t==='gender'){buildGQ();rGender();}
  else if(t==='browse')rBrowse();
  else if(t==='social')rSocial();
  else rPlan();
}
function setStudyTab(t){setTab(t);}

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
  let artS=lang==='kr'
    ?(item.art?`<div class="art-s" style="font-size:13px;color:var(--txt2);margin-top:4px">${item.art}</div>`:'')
    :(item.art?`<div class="art-s">${item.art}</div>`:'');
  let front=isR?`<div style="text-align:center"><div class="de-word" style="font-size:22px;color:var(--green)">${item.en}</div><div style="font-size:13px;color:var(--txt2);margin-top:4px">German word?</div></div><div style="font-size:12px;color:var(--txt3);text-align:center;margin-top:8px">Phrases hidden until reveal</div>`:`<div style="text-align:center">${artS}<div class="de-word">${item.de}</div></div><div class="divider"></div>${phDE(item)}`;
  let back=isR?`<div style="text-align:center">${artS}<div class="de-word">${item.de}</div></div><div class="divider"></div>${phFull(item)}`:`<div class="en-word">${item.en}</div><div class="divider"></div>${phFull(item)}`;
  let smI=sm.next?`EF:${sm.ef.toFixed(2)} · ${sm.interval}d · next:${sm.next}`:'New card';
  c.innerHTML=statsH()+catH()+
  `<div class="mode-row">
    <button class="mode-btn${flashMode==='de'?' active':''}" onclick="flashMode='de';buildQ();rFlash()">${lang==='kr'?'Flash 한국어':'Flash DE'}</button>
    <button class="mode-btn${flashMode==='en'?' active':''}" onclick="flashMode='en';buildQ();rFlash()">${lang==='kr'?'Flash EN':'Flash EN'}</button>
    <button class="mode-btn${answerMode==='mistakes'?' active':''}" onclick="answerMode=${answerMode==='mistakes'?`'choice'`:`'mistakes'`};buildQ();rFlash()">⚠️ Mistakes</button>
  </div>
  <div class="info-box">🧠 <b>SM-2:</b> ${dueC} due · card ${qIdx+1}/${queue.length} · ${smI}</div>
  <div class="card">
    <div class="card-top"><span class="cat-tag">${item.cat}</span><button class="speak-btn" onclick="speak('${item.de.replace(/'/g,"\\'")}',this)">${lang==='kr'?'🔊 듣기':'🔊 hören'}</button></div>
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
      <div class="card-top"><span class="cat-tag">${q.item.cat}</span><button class="speak-btn" onclick="speak('${ph.replace(/'/g,"\\'")}',this)">${lang==='kr'?'🔊 듣기':'🔊 hören'}</button></div>
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
  `<div class="gender-card"><div class="card-top" style="justify-content:space-between"><span class="cat-tag">${item.cat}</span><button class="speak-btn" onclick="speak('${item.de.replace(/'/g,"\\'")}',this)">${lang==='kr'?'🔊 듣기':'🔊 hören'}</button></div><div class="gender-word">${item.de}</div><div class="gender-hint">der · die · das — which article?</div><div class="gender-btns">${btns}</div>${res}${gAns?`<div style="font-size:13px;color:var(--txt2);margin-top:6px">${item.en}</div><button class="btn-next" style="margin-top:12px" onclick="nG()">Next →</button>`:''}</div>`;
}
function ansG(a){if(gAns)return;gAns=true;window._gc=a;let item=gQ[gIdx];let ok=a===item.art;gScore.tot++;sessionReviewed++;if(ok){gScore.ok++;sessionCorrect++;addXP(XP_RATES.gender_correct,'gender');}else{mistakes=[...new Set([...mistakes,item.de])].slice(-20);}updAll();rGender();}
function nG(){gIdx++;gAns=false;rGender();}

// ── BROWSE ────────────────────────────────────────────
function rBrowse(){
  let c=document.getElementById('content'),html=statsH()+catH();
  html+=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <div style="font-size:13px;color:var(--txt2)">${Object.values(DATA).flat().length} words across ${Object.keys(DATA).length} categories</div>
    <button id="regen-all-btn" class="refresh-phrase" onclick="regenAllPhrases()" style="font-size:12px;padding:6px 12px">✨ Regenerate all phrases</button>
  </div>
  <div id="regen-progress" style="display:none;margin-bottom:16px"></div>`;
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
  let html=`<div style="margin-bottom:20px">
    <div style="font-size:18px;font-weight:700;margin-bottom:4px;letter-spacing:-0.3px">✨ AI Study Planner</div>
    <div style="font-size:13px;color:var(--txt2);margin-bottom:16px">Describe your goal and get a personalised day-by-day plan</div>
    <div class="plan-stats">
      <div class="stat"><div class="stat-n">${known.size}</div><div class="stat-l">words known</div></div>
      <div class="stat"><div class="stat-n">${streakN}🔥</div><div class="stat-l">day streak</div></div>
    </div>
  </div>
  <div class="ai-plan-wrap">
    <div class="ai-plan-field"><label>Your goal</label><input type="text" id="plan-goal" placeholder='e.g. "Pass my A1 exam on June 5th"'></div>
    <div class="ai-plan-field"><label>Available days</label><input type="number" id="plan-days" placeholder="7" min="1" max="30"></div>
    <div class="ai-plan-field"><label>Minutes per day</label><input type="number" id="plan-time" placeholder="20" min="5" max="120"></div>
    <div class="ai-plan-field"><label>Categories to focus on (optional)</label><input type="text" id="plan-words" placeholder="e.g. Essen/Trinken, Reisen"></div>
    <button class="ai-gen-btn" id="ai-plan-btn" onclick="genAIPlan()">Generate my plan ✨</button>
  </div>
  <div id="ai-plan-result" style="margin-top:4px"></div>`;
  c.innerHTML=html;
  // Load saved plan if exists
  let saved=localStorage.getItem('saved_plan');
  if(saved){
    try{renderPlanCards(JSON.parse(saved),document.getElementById('ai-plan-result'));}catch(e){}
  }
}
// ── RANKS ────────────────────────────────────────────
// ── SOCIAL ────────────────────────────────────────────
function rSocial(){
  let c=document.getElementById('content');
  // Race is a hidden route — no tab button, shown when battle/race is active
  if(ranksSubTab==='race'){
    c.innerHTML=rRaceUI();
    if(raceSt&&!raceSt.done){clearTimeout(raceSt&&raceSt.timerOut);setTimeout(startRaceTimer,50);}
    if(!raceSt)loadRaceRoom();
    return;
  }
  let tabs=[['friends','👥 Friends'],['river','🚤 River'],['battle','⚔️ Battle']];
  let html='<div class="social-tabs">'+tabs.map(([t,l])=>'<button class="social-tab'+(ranksSubTab===t?' active':'')+'" onclick="ranksSubTab=\''+t+'\';rSocial()">'+l+'</button>').join('')+'</div>';
  if(ranksSubTab==='river')html+=rRiverUI();
  else if(ranksSubTab==='battle')html+=rBattleUI();
  else html+=rFriendsUI();
  c.innerHTML=html;
  if(ranksSubTab==='friends'||ranksSubTab==='leaderboard')loadFriends();
  if(ranksSubTab==='river')loadRiver();
  if(ranksSubTab==='battle')loadBattle();
}
function rRanks(){ranksSubTab='friends';rSocial();}
function raceNav(){ranksSubTab='race';rSocial();}

function rRiverUI(){
  return `<div id="river-wrap"><div style="text-align:center;padding:24px 0;color:var(--txt3);font-size:13px"><span class="spinner"></span> Loading river…</div></div>`;
}
async function loadRiver(){
  let wrap=document.getElementById('river-wrap');
  if(!wrap)return;
  try{
    let [profiles,streaksData]=await Promise.all([
      sbFetch('profiles','select=id,display_name&limit=100'),
      sbFetch('streaks','select=user_id,xp_total,streak_count&order=xp_total.desc&limit=100')
    ]);
    let pMap={};(profiles||[]).forEach(p=>pMap[p.id]=p.display_name||'Learner');
    let users=(streaksData||[]).map(s=>({
      id:s.user_id,name:pMap[s.user_id]||'Learner',
      xp:s.xp_total||0,streak:s.streak_count||0,
      isMe:s.user_id===CU?.id
    }));
    // Include self if not in list
    if(CU&&!users.find(u=>u.isMe))users.push({id:CU.id,name:CP?.display_name||'You',xp:xpTotal,streak:streakN,isMe:true});
    users.sort((a,b)=>b.xp-a.xp);
    renderRiver(users,wrap);
  }catch(e){
    if(wrap)wrap.innerHTML='<div style="color:var(--rd);font-size:13px;padding:12px">Could not load river data.</div>';
  }
}
function renderRiver(users,wrap,compact=false){
  users=users.slice().sort((a,b)=>b.xp-a.xp);
  // Position by BP (XP/10), scale relative to top user
  const getBP=xp=>Math.floor((xp||0)/10);
  users.forEach(u=>{u.bp=getBP(u.xp);});
  const topBP=Math.max(...users.map(u=>u.bp),1);
  const MAX_RIVER=Math.max(topBP*1.2,1);
  const bpToY=bp=>Math.round(4+Math.sqrt(Math.max(0,bp)/MAX_RIVER)*88);

  // Soft min-gap: only push if boats are within 4% — allows natural stacking
  const MIN_GAP=4;
  users.forEach(u=>{u.y=bpToY(u.bp);});
  for(let i=users.length-2;i>=0;i--){
    let lo=users[i+1],hi=users[i];
    if(hi.y-lo.y<MIN_GAP) hi.y=lo.y+MIN_GAP;
  }
  users.forEach(u=>{u.y=Math.min(94,u.y);});

  // X columns cycling, center reserved for me
  const xCols=[7,19,32,60,72,85,42];
  let ci=0;
  users.forEach(u=>{
    if(u.isMe){u.x=46;}
    else{u.x=xCols[ci%xCols.length];ci++;}
  });

  // Milestone lines in BP space
  const milestones=LEVELS.map(l=>({bp:Math.floor(l.min/10),name:l.name,lvl:l.lvl}))
    .filter(l=>l.bp>0&&l.bp<=MAX_RIVER*1.05);

  let myUser=users.find(u=>u.isMe);
  let myY=myUser?.y||4;
  let rank=users.findIndex(u=>u.isMe)+1||'?';
  let height=compact?320:520;

  let boatsHTML=users.map(u=>'<div class="rv-boat'+(u.isMe?' rv-me':'')+'" style="bottom:'+u.y+'%;left:'+u.x+'%">'+
    '<span class="rv-emoji">'+(u.isMe?'⛵':'🚣')+'</span>'+
    '<span class="rv-name">'+(u.isMe?'<b>'+u.name+'</b>':u.name)+'</span>'+
    '<span class="rv-xp">'+u.bp+' BP</span>'+
    '</div>').join('');

  let milestonesHTML=milestones.map(m=>{
    let p=Math.round(4+Math.sqrt(m.bp/MAX_RIVER)*88);
    return '<div class="rv-milestone" style="bottom:'+p+'%"><span class="rv-ms-line"></span><span class="rv-ms-label">Lvl '+m.lvl+' \u00b7 '+m.name+' ('+m.bp+' BP)</span></div>';
  }).join('');

  let header=compact?'':`<div style="margin-bottom:14px"><div style="font-size:16px;font-weight:600;margin-bottom:2px">🚤 The River</div><div style="font-size:13px;color:var(--txt2)">Your rank: <b>#${rank}</b> of ${users.length} \u00b7 ${myUser?.bp||0} BP</div></div>`;
  let footer=compact?'':'<div style="font-size:12px;color:var(--txt3);margin-top:10px;text-align:center">Earn XP to gain BP and sail further</div>';
  wrap.innerHTML=header+'<div class="rv-wrap"><div class="rv-river" style="height:'+height+'px"><div class="rv-current" style="height:'+myY+'%"></div>'+milestonesHTML+boatsHTML+'<div class="rv-start">\u2693 Start</div><div class="rv-end">\ud83c\udfc6 Leader</div></div></div>'+footer;
}

// ── BATTLE ARENA ──────────────────────────────────────
function getWeekStart(){
  let d=new Date();d.setHours(0,0,0,0);
  d.setDate(d.getDate()-((d.getDay()+6)%7)); // Monday
  return d.toISOString().split('T')[0];
}

// ── LOCAL BP CACHE (instant, synced from Supabase) ────
function getBPStore(){
  if(!CU)return{delta:0,battles:[]};
  let key='bp_'+CU.id+'_'+getWeekStart();
  try{let s=localStorage.getItem(key);if(s)return JSON.parse(s);}catch(e){}
  return{delta:0,battles:[]};
}
function saveBPStore(store){
  if(!CU)return;
  let key='bp_'+CU.id+'_'+getWeekStart();
  try{localStorage.setItem(key,JSON.stringify(store));}catch(e){}
}
function getBP(xp){
  let base=Math.floor((xp||0)/10);
  let store=getBPStore();
  return Math.max(0,base+(store.delta||0));
}
function getTotalBP(xp){return getBP(xp);}
function getDaysUntilReset(){
  let now=new Date(),next=new Date(now);
  next.setDate(now.getDate()+(8-((now.getDay()+6)%7+1))%7||7);
  next.setHours(0,0,0,0);
  return Math.ceil((next-now)/86400000);
}

// ── SYNC BP FROM SUPABASE ─────────────────────────────
async function syncBPFromSupabase(){
  if(!CU)return;
  let week=getWeekStart();
  try{
    let rows=await sbFetch('battle_log',
      'or=(winner_id.eq.'+CU.id+',loser_id.eq.'+CU.id+')&week_start=eq.'+week,true);
    if(!Array.isArray(rows)||!rows.length)return;
    let delta=0,battles=[];
    rows.forEach(r=>{
      let won=r.winner_id===CU.id;
      delta+=won?r.stake:-r.stake;
      battles.push({opponentId:won?r.loser_id:r.winner_id,won,week,delta:won?r.stake:-r.stake,room_id:r.room_id});
    });
    let store=getBPStore();
    store.delta=delta;store.battles=battles;
    saveBPStore(store);
  }catch(e){/* table may not exist yet — silent fail */}
}

// ── SAVE BATTLE RESULT TO SUPABASE ───────────────────
async function saveBattleResult(winnerId,loserId,roomId,stake){
  try{
    await sbUpsert('battle_log',{winner_id:winnerId,loser_id:loserId,room_id:roomId,stake,week_start:getWeekStart()});
  }catch(e){/* silent fail if table missing */}
}

function rBattleUI(){
  let bp=getBP(xpTotal);
  let store=getBPStore();
  let wins=(store.battles||[]).filter(b=>b.won).length;
  let losses=(store.battles||[]).filter(b=>!b.won).length;
  let daysLeft=getDaysUntilReset();
  return `<div id="battle-wrap">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">
      <div style="background:var(--bg2);border-radius:var(--r);padding:12px;text-align:center">
        <div style="font-size:26px;font-weight:700;color:var(--green)">${bp}</div>
        <div style="font-size:11px;color:var(--txt2)">Total BP</div>
      </div>
      <div style="background:var(--bg2);border-radius:var(--r);padding:12px;text-align:center">
        <div style="font-size:26px;font-weight:700">${wins}W ${losses}L</div>
        <div style="font-size:11px;color:var(--txt2)">This week</div>
      </div>
      <div style="background:var(--bg2);border-radius:var(--r);padding:12px;text-align:center">
        <div style="font-size:26px;font-weight:700;color:var(--bd)">${daysLeft}d</div>
        <div style="font-size:11px;color:var(--txt2)">Until reset</div>
      </div>
    </div>
    <div style="background:var(--yl);border-left:3px solid var(--yd);border-radius:var(--rs);padding:10px 12px;margin-bottom:14px;font-size:12px;color:var(--yd)">
      ⚔️ Win to steal <b>5 BP</b>. Lose and give 5 BP. Only ±2 levels can battle. Resets every Monday.
    </div>
    <div style="font-size:13px;font-weight:600;margin-bottom:10px">Opponents near your level</div>
    <div id="battle-opponents"><div style="text-align:center;padding:16px;color:var(--txt3);font-size:13px"><span class="spinner"></span> Matching…</div></div>
  </div>`;
}

async function loadBattle(){
  await syncBPFromSupabase();
  let wrap=document.getElementById('battle-opponents');
  if(!wrap)return;
  try{
    let myLvl=getLevelInfo(xpTotal).lvl;
    let [profiles,streaksData]=await Promise.all([
      sbFetch('profiles','select=id,display_name&limit=100'),
      sbFetch('streaks','select=user_id,xp_total,streak_count&order=xp_total.desc&limit=100')
    ]);
    let pMap={};(profiles||[]).forEach(p=>pMap[p.id]=p.display_name||'Learner');
    let opponents=(streaksData||[])
      .filter(s=>s.user_id!==CU?.id)
      .map(s=>({id:s.user_id,name:pMap[s.user_id]||'Learner',xp:s.xp_total||0,lvl:getLevelInfo(s.xp_total||0).lvl}))
      .filter(u=>Math.abs(u.lvl-myLvl)<=2);
    for(let i=opponents.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[opponents[i],opponents[j]]=[opponents[j],opponents[i]];}
    opponents=opponents.slice(0,8);
    if(!opponents.length){wrap.innerHTML='<div style="text-align:center;color:var(--txt2);font-size:13px;padding:16px">No opponents near your level yet.</div>';return;}
    let store=getBPStore();
    wrap.innerHTML=opponents.map(u=>{
      let theirBP=Math.floor((u.xp||0)/10);
      let fought=(store.battles||[]).find(b=>b.opponentId===u.id);
      let badge=fought?`<span style="font-size:10px;background:${fought.won?'var(--gl)':'var(--rl)'};color:${fought.won?'var(--gd)':'var(--rd)'};padding:2px 7px;border-radius:10px;margin-left:4px">${fought.won?'Won +5':'Lost -5'}</span>`:'';
      return `<div style="background:var(--bg2);border-radius:var(--r);padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
        <div><div style="font-size:14px;font-weight:600">${u.name}${badge}</div>
        <div style="font-size:11px;color:var(--txt2);margin-top:2px">Lvl ${u.lvl} · ${theirBP} BP</div></div>
        <button class="btn-sm-green" style="padding:7px 14px" onclick="startBattle('${u.id}','${u.name}',${u.xp})">⚔️ Battle</button>
      </div>`;
    }).join('');
  }catch(e){if(wrap)wrap.innerHTML='<div style="color:var(--rd);font-size:13px;padding:12px">Error loading opponents.</div>';}
}

function startBattle(fid,fname,fxp){
  let myBP=getBP(xpTotal),theirBP=Math.floor((fxp||0)/10);
  showModal({
    title:'⚔️ Battle '+fname+'?',
    body:'Winner steals <b>5 BP</b> from the loser.<div style="display:flex;justify-content:center;gap:24px;margin-top:12px"><div style="text-align:center"><div style="font-size:22px;font-weight:700;color:var(--green)">'+myBP+'</div><div style="font-size:11px;color:var(--txt2)">Your BP</div></div><div style="font-size:22px;color:var(--txt3);padding-top:8px">vs</div><div style="text-align:center"><div style="font-size:22px;font-weight:700;color:var(--bd)">'+theirBP+'</div><div style="font-size:11px;color:var(--txt2)">Their BP</div></div></div>',
    confirm:'⚔️ Battle!',
    onConfirm:()=>{
      window._pendingBattle={opponentId:fid,opponentName:fname,stake:5};
      challengeFriend(fid,fname);
    }
  });
}


// ── FRIENDS ───────────────────────────────────────────
function rFriendsUI(){
  return `<div id="friends-wrap">
    <div id="friends-river" style="margin-bottom:16px"><div style="text-align:center;padding:16px 0;color:var(--txt3);font-size:13px"><span class="spinner"></span> Loading river…</div></div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
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
    sbFetch('profiles','select=id,display_name')
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
  let [wpRes,skRes]=await Promise.all([
    sbFetch('word_progress','user_id=in.('+friendIds.join(',')+')'+'&select=user_id,known'),
    sbFetch('streaks','user_id=in.('+friendIds.join(',')+')'+'&select=user_id,xp_total,streak_count,last_study_date,updated_at')
  ]);
  let wp=wpRes||[],sk=skRes||[];
  let today=new Date().toISOString().split('T')[0];
  let myStudiedToday=lastStudy===today;
  let html='<div style="font-size:13px;font-weight:600;margin-bottom:10px">Your friends</div>';
  for(let fid of friendIds){
    let p=allProfs.find(x=>x.id===fid);
    let name=p?.display_name||fid.slice(0,8);
    let knownCount=(wp.filter(x=>x.user_id===fid&&x.known)).length;
    let skd=sk.find(x=>x.user_id===fid);
    let xp=skd?.xp_total||0,streak=skd?.streak_count||0;
    let lastDate=skd?.last_study_date||skd?.updated_at?.split('T')[0];
    let lvl=getLevelInfo(xp);
    // Last active label
    let lastActive='Never';
    if(lastDate){
      let diff=Math.floor((new Date(today)-new Date(lastDate))/(86400000));
      lastActive=diff===0?'Today':diff===1?'Yesterday':diff+'d ago';
    }
    // Mutual streak
    let friendStudiedToday=lastDate===today;
    let mutualBadge=(myStudiedToday&&friendStudiedToday)?'<span style="font-size:11px;background:var(--yl);color:var(--yd);padding:2px 8px;border-radius:10px;font-weight:600;margin-left:6px">🔥 Mutual streak</span>':'';
    let lastActiveDot=friendStudiedToday?'<span style="width:7px;height:7px;background:var(--green);border-radius:50%;display:inline-block;margin-right:4px"></span>':'';
    let initials=name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    let activeCls=friendStudiedToday?'fc-av-active':'';
    html+=`<div class="fc-row" onclick="toggleFriendActions('${fid}',this)">
      <div class="fc-av ${activeCls}">${initials}</div>
      <div class="fc-info">
        <div class="fc-row-name">${name}${mutualBadge?'<span class="fc-fire">🔥</span>':''}</div>
        <div class="fc-row-meta">Lvl ${lvl.lvl} · ${lastActiveDot}${lastActive} · ${streak}🔥</div>
      </div>
      <div class="fc-row-right">
        <div class="fc-row-xp">${xp} XP</div>
        <div class="fc-row-words">${knownCount}w</div>
      </div>
      <span class="fc-arr">›</span>
    </div>
    <div class="fc-detail" id="fc-${fid}" style="display:none">
      <button class="btn-sm-green" style="width:100%;padding:7px;margin-bottom:5px" onclick="event.stopPropagation();challengeFriend('${fid}','${name}')">⚡ Race Challenge</button>
      <button class="fc-battle-btn" onclick="event.stopPropagation();startBattle('${fid}','${name}',${xp})">⚔️ Battle (stake BP)</button>
      <button class="btn-sm" style="width:100%;padding:6px;margin-top:4px" onclick="event.stopPropagation();removeFriend('${fid}')">Remove friend</button>
    </div>`;
  }
  listEl.innerHTML=html;
  // Build mini river with friends + self
  let riverWrap=document.getElementById('friends-river');
  if(riverWrap){
    let riverUsers=friendIds.map(fid=>{
      let p=allProfs.find(x=>x.id===fid);
      let skd=sk.find(x=>x.user_id===fid);
      return {id:fid,name:p?.display_name||fid.slice(0,8),xp:skd?.xp_total||0,streak:skd?.streak_count||0,isMe:false};
    });
    riverUsers.push({id:CU.id,name:CP?.display_name||'You',xp:xpTotal,streak:streakN,isMe:true});
    riverUsers.sort((a,b)=>b.xp-a.xp);
    renderRiver(riverUsers,riverWrap,true);
  }
}
function toggleFriendActions(fid,row){
  let el=document.getElementById('fc-'+fid);
  if(!el)return;
  let open=el.style.display==='block';
  el.style.display=open?'none':'block';
  let arr=row.querySelector('.fc-arr');
  if(arr)arr.textContent=open?'›':'‹';
  row.classList.toggle('fc-row-open',!open);
}
async function removeFriend(fid){
  if(!confirm('Remove this friend?'))return;
  let token=authToken||SKEY;
  await fetch(SURL+'/rest/v1/friendships?or=(and(user_id.eq.'+CU.id+',friend_id.eq.'+fid+'),and(user_id.eq.'+fid+',friend_id.eq.'+CU.id+'))',{
    method:'DELETE',headers:{'apikey':SKEY,'Authorization':'Bearer '+token}
  });
  loadFriends();
}

async function challengeFriend(friendId,friendName,btnEl){
  let btn=btnEl||(typeof event!=='undefined'&&event?.target)||null;
  if(btn){btn.disabled=true;btn.textContent='Creating...';}
  let words=aw();if(words.length<4)words=Object.values(DATA).flat();
  shuf(words);words=words.slice(0,10);
  let code=Math.random().toString(36).slice(2,6).toUpperCase();
  let room={code,creator_id:CU.id,words:JSON.stringify(words),status:'waiting',invited_id:friendId};
  let res=await sbUpsert('race_rooms',room);
  if(!res){if(btn){btn.disabled=false;btn.textContent='⚡ Race Challenge';}return;}
  let savedRoom=(Array.isArray(res)&&res[0])||{...room};
  raceSt={room:savedRoom,words,idx:0,score:0,startTime:null,done:false,isCreator:true,waiting:true};
  closeModal();
  ranksSubTab='race';
  rSocial();
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
  if(raceSt&&raceSt.done)return rRaceResults();
  if(raceSt&&raceSt.waiting){
    let code=raceSt.room.code||'????';
    if(raceSt.isCreator){
      return `<div>
        <div style="font-size:16px;font-weight:600;margin-bottom:4px">⚡ Race Room Created!</div>
        <div style="font-size:13px;color:var(--txt2);margin-bottom:18px">Share this code with your friend, then click Start when they're ready</div>
        <div style="text-align:center;margin:24px 0">
          <div style="font-size:52px;font-weight:800;letter-spacing:14px;color:var(--green)">${code}</div>
          <div style="font-size:12px;color:var(--txt2);margin-top:10px">Friend enters this code to join</div>
        </div>
        <button class="btn-next" style="max-width:320px;margin:0 auto;display:block" onclick="startRaceAsHost()">▶ Start Race for Everyone</button>
        <button class="btn-next" style="background:var(--bg3);color:var(--txt2);max-width:320px;margin:8px auto 0;display:block" onclick="raceSt=null;rRanks()">Cancel</button>
      </div>`;
    } else {
      return `<div style="text-align:center;padding:30px 0">
        <div style="font-size:36px;margin-bottom:12px">⏳</div>
        <div style="font-size:16px;font-weight:600;margin-bottom:8px">Waiting for host to start...</div>
        <div style="font-size:13px;color:var(--txt2);margin-bottom:24px">Room code: <strong style="color:var(--green);letter-spacing:4px">${code}</strong></div>
        <button class="btn-next" style="background:var(--bg3);color:var(--txt2);max-width:200px;margin:0 auto;display:block" onclick="clearTimeout(raceSt.pollTimer);raceSt=null;rRanks()">Leave Room</button>
      </div>`;
    }
  }
  if(raceSt&&!raceSt.done)return rRaceActive();
  return `<div>
    <div style="font-size:16px;font-weight:600;margin-bottom:4px">⚡ Race</div>
    <div style="font-size:13px;color:var(--txt2);margin-bottom:18px">Race a friend — same words, faster = more points!</div>
    <div style="display:flex;flex-direction:column;gap:10px;max-width:320px;margin:0 auto">
      <button class="btn-next" onclick="createRace()">⚡ Create Race Room</button>
      <div style="text-align:center;font-size:12px;color:var(--txt2)">— or join a friend's room —</div>
      <input id="race-code-input" class="type-input" placeholder="Enter 4-letter code..." maxlength="4" style="text-align:center;font-size:20px;letter-spacing:6px;text-transform:uppercase;margin:0">
      <button class="btn-next" style="background:var(--bg3);color:var(--txt)" onclick="joinRace()">Join Room</button>
    </div>
    <div id="race-status" style="text-align:center;margin-top:16px;font-size:14px;color:var(--txt2)"></div>
  </div>`;
}

async function startRaceAsHost(){
  // Mark room as active in Supabase so joiner's poll picks it up
  let roomId=raceSt.room.id||raceSt.room.code;
  await fetch(SURL+'/rest/v1/race_rooms?code=eq.'+raceSt.room.code,{
    method:'PATCH',
    headers:{'apikey':SKEY,'Authorization':'Bearer '+(authToken||SKEY),'Content-Type':'application/json'},
    body:JSON.stringify({status:'active'})
  });
  raceSt.waiting=false;
  raceSt.startTime=Date.now();
  raceNav();
}

function loadRaceRoom(){}

async function createRace(){
  let statusEl=document.getElementById('race-status');
  if(statusEl){statusEl.textContent='Creating room...';statusEl.style.color='var(--txt2)';}
  let words=aw();if(words.length<4)words=Object.values(DATA).flat();
  shuf(words);words=words.slice(0,10);
  let code=Math.random().toString(36).slice(2,6).toUpperCase();
  let room={code,creator_id:CU.id,words:JSON.stringify(words),status:'waiting'};
  let res=await sbUpsert('race_rooms',room);
  if(!res){if(statusEl){statusEl.textContent='Error creating room. Try again.';statusEl.style.color='red';}return;}
  let savedRoom=(Array.isArray(res)&&res[0])||{...room,id:code};
  raceSt={room:savedRoom,words,idx:0,score:0,startTime:null,done:false,isCreator:true,waiting:true};
  raceNav();
}

async function joinRace(){
  let code=document.getElementById('race-code-input')?.value.trim().toUpperCase();
  if(!code||code.length!==4){let s=document.getElementById('race-status');if(s)s.textContent='Enter a 4-letter code.';return;}
  let s=document.getElementById('race-status');if(s)s.textContent='Looking for room...';
  let res=await sbFetch('race_rooms','code=eq.'+code+'&limit=1');
  if(!res?.length){if(s)s.textContent='Room not found. Check the code.';return;}
  let room=res[0];
  let words=JSON.parse(room.words);
  raceSt={room,words,idx:0,score:0,startTime:null,done:false,isCreator:false,waiting:true};
  // Show waiting screen, poll for host to start
  raceNav();
  pollRaceStart(room.id||room.code, code);
}

async function pollRaceStart(roomId, code){
  if(!raceSt||!raceSt.waiting)return;
  let res=await sbFetch('race_rooms','code=eq.'+code+'&select=status&limit=1');
  if(res?.[0]?.status==='active'){
    raceSt.waiting=false;
    raceSt.startTime=Date.now();
    raceNav();
    return;
  }
  raceSt.pollTimer=setTimeout(()=>pollRaceStart(roomId,code),2000);
}

function rRaceActive(){
  let r=raceSt;
  if(r.idx>=r.words.length){finishRace();return rRaceResults();}
  let item=r.words[r.idx];
  let ws=aw();if(ws.length<4)ws=Object.values(DATA).flat();
  let oth=ws.filter(w=>w.de!==item.de);shuf(oth);
  let opts=[item.en,...oth.slice(0,3).map(w=>w.en)];shuf(opts);
  r.questionStart=Date.now();
  r.answered=false;
  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:13px;color:var(--txt2)">⚡ ${r.idx+1} / ${r.words.length}</span>
      <span style="font-size:14px;font-weight:700;color:var(--green)">⭐ ${r.score} pts</span>
    </div>
    <div style="height:6px;background:var(--bg3);border-radius:3px;margin-bottom:14px;overflow:hidden">
      <div id="race-timer-bar" style="height:100%;width:100%;background:var(--green);border-radius:3px;transition:width 10s linear"></div>
    </div>
    <div class="card" style="text-align:center">
      ${item.art?`<div class="art-s">${item.art}</div>`:''}
      <div class="de-word">${item.de}</div>
      <div style="font-size:13px;color:var(--txt2);margin-top:6px">What does this mean?</div>
    </div>
    <div class="quiz-grid" style="margin-top:12px">
      ${opts.map(o=>`<button class="q-opt" onclick="ansRace('${o.replace(/'/g,"\\'")}','${item.en.replace(/'/g,"\\'")}',this)">${o}</button>`).join('')}
    </div>
    <button class="btn-next" style="background:var(--bg3);color:var(--txt2);margin-top:8px;font-size:12px" onclick="clearTimeout(raceSt&&raceSt.timerOut);raceSt=null;rRanks()">✕ Quit</button>
  </div>`;
}

function startRaceTimer(){
  if(!raceSt||raceSt.answered)return;
  let bar=document.getElementById('race-timer-bar');
  if(bar)requestAnimationFrame(()=>{bar.style.width='0%';});
  raceSt.timerOut=setTimeout(()=>{
    if(!raceSt||raceSt.answered)return;
    raceSt.answered=true;
    document.querySelectorAll('.q-opt').forEach(b=>{
      b.disabled=true;
      if(b.textContent.trim()===raceSt.words[raceSt.idx].en)b.className='q-opt correct';
    });
    setTimeout(()=>{if(raceSt){raceSt.answered=false;raceSt.idx++;rRanks();}},800);
  },10000);
}

function ansRace(chosen,correct,btn){
  if(!raceSt||raceSt.answered)return;
  raceSt.answered=true;
  clearTimeout(raceSt.timerOut);
  let elapsed=(Date.now()-raceSt.questionStart)/1000;
  let pts=chosen===correct?Math.max(1,Math.round(10-elapsed)):0;
  let btns=btn.closest('.quiz-grid').querySelectorAll('.q-opt');
  btns.forEach(b=>{b.disabled=true;if(b.textContent.trim()===correct)b.className='q-opt correct';else if(b===btn&&chosen!==correct)b.className='q-opt wrong';});
  if(chosen===correct){
    raceSt.score+=pts;
    let badge=document.createElement('div');
    badge.textContent='+'+pts+' pts';
    badge.style.cssText='position:fixed;top:40%;left:50%;transform:translateX(-50%);font-size:28px;font-weight:700;color:var(--green);pointer-events:none;animation:fadeUp 0.8s forwards';
    document.body.appendChild(badge);
    setTimeout(()=>badge.remove(),800);
  }
  setTimeout(()=>{if(raceSt){raceSt.answered=false;raceSt.idx++;raceNav();}},800);
}

async function finishRace(){
  if(raceSt.done)return;
  raceSt.done=true;
  let timeMs=Date.now()-raceSt.startTime;
  // Attach battle flag from pending battle
  if(window._pendingBattle){raceSt.battle=window._pendingBattle;window._pendingBattle=null;}
  await sbUpsert('race_results',{room_id:raceSt.room.id||raceSt.room.code,user_id:CU.id,display_name:CP?.display_name||'You',score:raceSt.score,total:raceSt.words.length*10,time_ms:timeMs});
  // BP transfer: wait briefly for opponent result, then decide winner
  if(raceSt.battle){
    setTimeout(async()=>{
      let roomId=raceSt.room.id||raceSt.room.code;
      let results=await sbFetch('race_results','room_id=eq.'+roomId+'&order=score.desc');
      if(!results?.length)return;
      let mine=results.find(r=>r.user_id===CU.id);
      let theirs=results.find(r=>r.user_id===raceSt.battle.opponentId);
      if(!mine)return;
      let myScore=mine.score,theirScore=theirs?.score??-1;
      let won=myScore>theirScore;
      // Save to Supabase (winner inserts the record)
      if(won){
        await saveBattleResult(CU.id,raceSt.battle.opponentId,roomId,raceSt.battle.stake);
      }
      // Sync full BP state from Supabase so both sides stay consistent
      await syncBPFromSupabase();
      raceSt.battle.resolved=true;
      raceSt.battle.won=won;
      // Inject BP banner into already-rendered results screen
      let banner=document.getElementById('bp-battle-banner');
      if(banner){
        let stake=raceSt.battle.stake||5;
        let col=won?'var(--green)':'var(--rd)',bg=won?'var(--gl)':'var(--rl)';
        banner.outerHTML='<div style="margin-bottom:14px;padding:10px 14px;border-radius:var(--r);background:'+bg+';border-left:3px solid '+col+'"><div style="font-size:15px;font-weight:700;color:'+col+'">'+(won?'⚔️ Battle Won! +'+stake+' BP':'⚔️ Battle Lost… -'+stake+' BP')+'</div><div style="font-size:12px;color:var(--txt2);margin-top:2px">'+(won?'You stole BP from '+raceSt.battle.opponentName:raceSt.battle.opponentName+' stole your BP')+'</div></div>';
      }
    },2500);
  }
}

function rRaceResults(){
  let r=raceSt;
  let maxScore=r.words.length*10;
  let pct=Math.round(r.score/maxScore*100);
  let emoji=pct>=90?'🏆':pct>=60?'🎉':pct>=30?'👍':'💪';
  let roomId=r.room.id||r.room.code;
  // BP battle banner — shown after finishRace resolves (2.5s delay)
  // BP banner injected after result resolves (2.5s delay in finishRace)
  let bpBanner='<div id="bp-battle-banner"></div>';
  if(r.battle&&r.battle.resolved){
    let won=r.battle.won,stake=r.battle.stake||5;
    let col=won?'var(--green)':'var(--rd)',bg=won?'var(--gl)':'var(--rl)';
    bpBanner='<div style="margin-bottom:14px;padding:10px 14px;border-radius:var(--r);background:'+bg+';border-left:3px solid '+col+'"><div style="font-size:15px;font-weight:700;color:'+col+'">'+(won?'⚔️ Battle Won! +'+stake+' BP':'⚔️ Battle Lost… -'+stake+' BP')+'</div><div style="font-size:12px;color:var(--txt2);margin-top:2px">'+(won?'You stole BP from '+r.battle.opponentName:r.battle.opponentName+' stole your BP')+'</div></div>';
  }
  let html='<div><div style="text-align:center;margin-bottom:16px"><div style="font-size:36px">'+emoji+'</div><div style="font-size:22px;font-weight:700;margin:6px 0">'+r.score+' / '+maxScore+' pts</div><div style="font-size:13px;color:var(--txt2)">'+pct+'% · '+r.words.length+' words</div></div>'+bpBanner+'<div id="race-comparison"><div style="text-align:center;color:var(--txt2);font-size:13px">Loading results...</div></div><button class="btn-next" style="margin-top:16px" onclick="raceSt=null;raceNav()">Done</button></div>';
  setTimeout(async()=>{
    let res=await sbFetch('race_results','room_id=eq.'+roomId+'&order=score.desc');
    let el=document.getElementById('race-comparison');
    if(!el)return;
    if(!res?.length){el.innerHTML='<div style="text-align:center;color:var(--txt2);font-size:13px">No opponent results yet.</div>';return;}
    let cards=res.map((p,i)=>{
      let isMe=p.user_id===CU.id;
      let pPct=Math.round(p.score/(p.total||maxScore)*100);
      let medal=i===0?'🥇':i===1?'🥈':'🥉';
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:${isMe?'var(--green-soft, rgba(72,199,142,0.12))':'var(--bg2)'};border-radius:var(--r);margin-bottom:8px;border:${isMe?'1.5px solid var(--green)':'1px solid var(--bor)'}">
        <div>
          <div style="font-size:14px;font-weight:600">${medal} ${p.display_name||'Player'}${isMe?' (you)':''}</div>
          <div style="font-size:12px;color:var(--txt2);margin-top:2px">${pPct}% efficiency</div>
        </div>
        <div style="font-size:20px;font-weight:800;color:${i===0?'var(--green)':'var(--txt)'}">${p.score} pts</div>
      </div>`;
    }).join('');
    el.innerHTML='<div style="font-size:13px;font-weight:600;margin-bottom:8px">Results</div>'+cards;
  },300);
  return html;
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

// ── ERROR REPORTER ────────────────────────────────────
function showErr(msg,detail=''){
  let id='err-toast-'+Date.now();
  let el=document.createElement('div');
  el.id=id;
  el.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#c0392b;color:#fff;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;z-index:9999;max-width:90vw;box-shadow:0 4px 12px rgba(0,0,0,0.2);cursor:pointer';
  el.textContent='⚠️ '+msg+(detail?' — '+detail:'');
  el.onclick=()=>el.remove();
  document.body.appendChild(el);
  setTimeout(()=>el?.remove(),8000);
  console.error('[DeutschApp]',msg,detail);
}

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection',e=>{
  let msg=e.reason?.message||String(e.reason)||'Unknown error';
  showErr('Unexpected error',msg);
});

// Catch JS errors
window.addEventListener('error',e=>{
  showErr('Script error',e.message+' ('+e.filename?.split('/').pop()+':'+e.lineno+')');
});

function confetti(){
  let colors=['#1D9E75','#7C3AED','#F0A020','#D85A30','#0C447C'];
  for(let i=0;i<60;i++){
    let el=document.createElement('div');
    el.style.cssText=`position:fixed;top:-10px;left:${Math.random()*100}vw;width:8px;height:8px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};pointer-events:none;z-index:9999;animation:confettiFall ${1.5+Math.random()}s linear forwards;animation-delay:${Math.random()*0.5}s`;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),2500);
  }
}

// ── LANGUAGE SWITCHER ────────────────────────────────
function switchLang(l){
  if(lang===l)return;
  localStorage.setItem('app_lang',l);
  window.location.reload();
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;
  if(tab==='flash'){
    if(e.code==='Space'){e.preventDefault();if(!revealed)revCard();else rate(4);}
    if(e.key==='1')rate(1);
    if(e.key==='2')rate(3);
    if(e.key==='3')rate(4);
    if(e.key==='4')rate(5);
  }
  if(tab==='quiz'||tab==='listen'){
    if(e.code==='Space'){
      e.preventDefault();
      let nextBtn=document.querySelector('.btn-next');
      if(nextBtn)nextBtn.click();return;
    }
    let opts=document.querySelectorAll('.q-opt');
    if(opts.length){
      let idx=parseInt(e.key)-1;
      if(idx>=0&&idx<opts.length&&!opts[idx].disabled)opts[idx].click();
    }
  }
});