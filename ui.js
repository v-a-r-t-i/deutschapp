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
function lvlOk(w){return selLevel==='all'||(w.lvl||'A1')===selLevel;}
function aw(){let w=[];for(let c of selCats)for(let i of(DATA[c]||[]))if(lvlOk(i))w.push({...i,cat:c});return w;}
function allW(){let w=[];for(let c of Object.keys(DATA))for(let i of(DATA[c]||[]))if(lvlOk(i))w.push({...i,cat:c});return w;}
function cp(cat){let ws=(DATA[cat]||[]).filter(lvlOk);return{k:ws.filter(w=>known.has(w.de)).length,t:ws.length};}
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


// ── MOBILE NAV SYNC ───────────────────────────────────
function setMobNav(tab){
  let key=['flash','listen','quiz','fill','gender','lesen','studyhome'].includes(tab)?'study':tab==='home'?'home':tab;
  let mobileMap={home:'mob-home',study:'mob-study',browse:'mob-browse',plan:'mob-plan',social:'mob-social'};
  let desktopMap={home:'desk-home',study:'desk-study',browse:'desk-browse',plan:'desk-plan',social:'desk-social'};
  document.querySelectorAll('.mob-nav-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.desk-nav-btn').forEach(b=>b.classList.remove('active'));
  let mob=document.getElementById(mobileMap[key]);if(mob)mob.classList.add('active');
  let desk=document.getElementById(desktopMap[key]);if(desk)desk.classList.add('active');
  // Sync mobile mode label and sheet active state
  let modeLabels={flash:'📖 Flash',listen:'👂 Listen',quiz:'❓ Quiz',fill:'✏️ Fill-in',gender:'🏷️ Gender',lesen:'📄 Lesen'};
  let lbl=document.getElementById('mob-mode-label');
  if(lbl&&modeLabels[tab])lbl.textContent=modeLabels[tab];
  document.querySelectorAll('.mode-sheet-btn').forEach(b=>b.classList.remove('active'));
  let msb=document.getElementById('ms-'+tab);if(msb)msb.classList.add('active');
}



// ── MOBILE MODE SHEET ────────────────────────────────
function openModeSheet(){
  let sheet=document.getElementById('mob-mode-sheet');
  if(sheet)sheet.style.display='block';
}
function closeModeSheet(){
  let sheet=document.getElementById('mob-mode-sheet');
  if(sheet)sheet.style.display='none';
}


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
  let pct=t?Math.round(k/t*100):0;
  // Mobile: one compact line. Desktop: full stat cards.
  if(window.innerWidth<=700){
    return`<div class="stats-compact"><span style="color:var(--green);font-weight:700">${k}/${t}</span> known · <span style="color:var(--bd);font-weight:700">${d}</span> due<div class="prog-bar" style="margin-top:6px"><div class="prog-fill" style="width:${pct}%"></div></div></div>`;
  }
  return`<div class="stats-row"><div class="stat"><div class="stat-n">${t}</div><div class="stat-l">words</div></div><div class="stat"><div class="stat-n" style="color:var(--green)">${k}</div><div class="stat-l">known</div></div><div class="stat"><div class="stat-n" style="color:var(--bd)">${d}</div><div class="stat-l">due today</div></div></div><div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>`;
}
function levelH(){
  let levels=[['all','Alle'],['A1','A1'],['A2','A2']];
  let counts={all:allCountForLevel('all'),A1:allCountForLevel('A1'),A2:allCountForLevel('A2')};
  return '<div class="level-toggle">'+levels.map(([v,l])=>
    '<button class="level-btn'+(selLevel===v?' active':'')+'" onclick="setLevel(\''+v+'\')">'+l+'<span class="level-count">'+counts[v]+'</span></button>'
  ).join('')+'</div>';
}
function allCountForLevel(lv){
  let n=0;
  for(let c of Object.keys(DATA))for(let w of (DATA[c]||[]))if(lv==='all'||(w.lvl||'A1')===lv)n++;
  return n;
}
function setLevel(lv){
  selLevel=lv;
  saveLocalCache();
  buildQ();
  setTab(tab);
}
function catH(){
  let active=[...selCats];
  let all=Object.keys(DATA);
  let singleCat=selCats.size===1?active[0]:null;
  let summary=selCats.size===all.length?'Alle Kategorien'
    :active.length<=2?active.join(', ')
    :active.length+' Kategorien';
  let nudge=singleCat?`<div style="font-size:12px;color:var(--txt2);margin-bottom:8px">Nur <b>${singleCat}</b></div>`:'';
  let desktopOpen=window.innerWidth>700;
  return levelH()+nudge+`<details class="cat-picker" id="cat-picker"${desktopOpen?' open':''}>
    <summary class="cat-summary">
      <span class="cat-summary-label">📚 ${summary}</span>
      <span class="cat-summary-arr">›</span>
    </summary>
    <div class="cat-sheet">${all.map(cat=>{
      let p=cp(cat);let active=selCats.has(cat);
      if(p.t===0)return '';
      return`<button class="cat-chip${active?' active':''}" onclick="togCat('${cat}')">${ring(p.k,p.t)}${cat}</button>`;
    }).join('')}</div>
  </details>`;
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
const studyTabs=['flash','listen','quiz','fill','gender','lesen','studyhome'];
function setTab(t){
  tab=t;
  localStorage.setItem('app_tab', t);  // persist tab across visits
  setMobNav(t);
  let isStudy=studyTabs.includes(t);
  if(isStudy)lastStudyTab=t;
  // Update main tabs
  document.querySelectorAll('.tab').forEach((b,i)=>{
    let names=['study','browse','plan','social'];
    b.classList.toggle('active',names[i]===(isStudy?'study':t));
  });
  // Show/hide study mode pills
  let sm=document.getElementById('study-modes');
  let showPills=isStudy&&t!=='studyhome'&&t!=='home';
  if(sm)sm.style.display=showPills?'flex':'none';
  let studyPills=['flash','listen','quiz','fill','gender','lesen'];
  let studyLabels=lang==='kr'?['Flash','Listen','Quiz','Fill-in','Formality','Read']:['Flash','Listen','Quiz','Fill-in','Gender','Lesen'];
  document.getElementById('study-modes').innerHTML=studyPills.map((t,i)=>
    `<div class="mode-pill${tab===t?' active':''}" id="pill-${t}" onclick="setStudyTab('${t}')">${studyLabels[i]}</div>`
  ).join('');
  updAll();
  updateMapFAB();
  if(t==='home'){rMap();return;}
  if(t==='studyhome'){rStudyHome();return;}
  if(t==='flash'){buildQ();rFlash();return;}
  if(t==='lesen'){if(!lesenSt.started)buildLesenSt();rLesen();return;}
  else if(t==='listen'){buildListenQ();rListen();}
  else if(t==='quiz'){buildQuizQ();quizSt=null;rQuiz();}
  else if(t==='fill'){blankSt=null;rFill();}
  else if(t==='gender'){buildGQ();rGender();}
  else if(t==='browse'){rBrowseGrid();return;}
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
  if(!queue.length){
    let emptyMsg=lang==='de'
      ?'<div class="end-card"><div class="end-emoji">🎉</div><div class="end-title">Queue empty!</div></div>'
      :`<div class="end-card"><div class="end-emoji">🚧</div><div class="end-title">No ${lang==='kr'?'Korean':'words'} yet</div><div class="end-sub">Words for this language haven't been added to the database yet. Check back soon!</div></div>`;
    c.innerHTML=statsH()+catH()+emptyMsg;return;
  }
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
    <div id="compound-area" style="margin-top:8px"></div>
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
function revCard(){
  if(revealed)return;revealed=true;
  document.getElementById('fc-f').style.display='none';
  document.getElementById('fc-b').style.display='block';
  document.getElementById('fc-h').style.display='none';
  document.getElementById('fc-btns').style.display='block';
  document.getElementById('ai-area').style.display='none';
  let ca=document.getElementById('compound-area');
  if(ca){
    let item=queue[qIdx];
    let bare=(item.de||'').replace(/^(der|die|das|ein|eine)\s+/i,'').trim();
    if(lang==='de'&&bare.length>=8){
      ca.innerHTML=`<button class="cmp-btn" onclick="showCompound('${item.de.replace(/'/g,"\\'")}')">🧩 Break down this word</button>`;
    }else{ca.innerHTML='';}
  }
}
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
  let ws=aw();
  let sameCat=ws.filter(w=>w.de!==item.de&&w.cat===item.cat);
  let diffCat=ws.filter(w=>w.de!==item.de&&w.cat!==item.cat);
  shuf(sameCat);shuf(diffCat);
  let pool=[...sameCat,...diffCat];
  let opts=[item.en,...pool.slice(0,3).map(w=>w.en)];shuf(opts);
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
function genQ(ws){
  let item=quizQueue[quizQIdx++];
  if(!item)return;
  // Prefer distractors from the same category so answers aren't obviously wrong
  let sameCat=ws.filter(w=>w.de!==item.de&&w.cat===item.cat);
  let diffCat=ws.filter(w=>w.de!==item.de&&w.cat!==item.cat);
  shuf(sameCat);shuf(diffCat);
  // Fill up to 3 distractors: same-cat first, then diff-cat
  let pool=[...sameCat,...diffCat];
  let opts=[item.en,pool[0].en,pool[1].en,pool[2].en];
  shuf(opts);
  quizSt={item,cor:item.en,opts,ans:false,ch:null,typed:'',correct_ans:false};
}
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



// ── SVG ISLAND BUILDER — tileset sprite body, pixel-art decorations ───
// Body: Ground_grass_flying.png segment 0 (48×76), scaled 3× → 144×228.
// Stretched wide via preserveAspectRatio='none' to keep squat proportions.
// The sprite contains: teal pool top, white bumpy rim, grey stalactites.

const _DEC = {
  body:    'data:image/png;base64,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',
  tree:    'data:image/png;base64,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',
  flower:  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAADNklEQVR4nO2bv2oUURTGx8VCCK5B0UKzBt00CiI2gpDKIoWlpBAEER9AEbXxAWzFwhew9gksLKxEsRDBFPkDulGC4BITBDtTefbbMMc5k8zkm5v5ftVhuZkMfJwf5967m2VCCCGEEG3kAPsF2sjluSd//9Ud5osIBUBHCtojUDv3H921z9UBZBQAGSmoRjztIOoAMgqAzEH2C7SFwc8Nq3vHularA8goADJSUMXg5DN/53bhenUAGQVAJkkFYZsj7149btTGcnn1h9X9qRO5a9QBZBQAmWQUFDlXeZpluWpCmqYpdQAZBUAmGQUheK6CoJpwDU4jmaOp3agJ9Xhp7lrhenw3dQAZBUAmGQVtU0TueYunJtwE9WF93WqKoA4gowDIJKMgxNMRTiDe2QsytsafXuz5dehIHUBGAZBJUkGIpyNPKZ6aXGWNP6dyHakDyCgAMskrCEEtdNYWTRcXb92zNZFbKuQ/k1Lh0XcEdQAZBUBmXykI+fV70+qPL55Z7ekIiUxKw5kLVn9Z+rTj91QHkFEAZBp1QV0X5/rzNrEcmThsn6OOPDwdob6GKwOrj57tlXqmOoCMAiDTCgUhdejo/ZsPVktBiaEAyOzbjViEUydPW+1t1hDvHAm1U3YiUgeQUQBkWjcFITgRTfVGutgcrlsdmY4QKSgxFACZ5BXk/V4sAt6gsXSkDiCjAMgksxHzVOP9Xsz7pvQ27JnTcMM1xufXVkY2a6idyOfqADIKgEzjpqCaVFMK77ZrHXQ0ef5q7t8+vzG6oD8+0y/8X+oAMgqATCMU5P0KvqxevO/5VIU3yTy88tbqM9MTuWs8HakDyCgAMo1QELKbsx2ks7ZYxWPGiGy+IjpC1AFkFACZximoDvCoGcFjZ6R7qJv7+bfvXwv/V2/2utWoIw91ABkFQKYVCvLwbsEQT0ceqKmIjtQBZBQAmVYrCInoCImoCXX04Gb+enUAGQVARgrKoayOkMgmDnWkDiCjAMgk872gvWRh+SWouZyONv6MbvEik5I6gIwCIKMpqARVTUc4EakDyCgAMlLQDil7y4asDkaX+OoAMgqAjBRUMZ6aENzoqQPIKAAyW6I2+RWrsR1fAAAAAElFTkSuQmCC',
  ruins:   'data:image/png;base64,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',
  crystal: 'data:image/png;base64,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',
  cloud:   'data:image/png;base64,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',
  rock:    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADaElEQVR4nO2avWsUQRTAfyeiEC2ioBFjLCIBC0njRzwQC4OdIMaof4CNH1XSJpAosU1IkVqwEBQ/UGxEFBHhDGoTgk0wRT7UJKIRVNDmLM7nuu8ymdm72bvAzq/L7czuZt9v37w3d7lisUiWWVfvG6g3600HcrlcTW7g4OFjKyr4+tUzLzdgMzwYUOsL6ohfvnJtxXFjA31F8GeCicwbkDO9I75ygI741es3AFiYmXWaPzbQB1RuQsgBFlLLARJ5ibjgGvlaEQzwfUJfkX969x4Ae9v3y0eprArBgLROPPGyAED7kTwATbtbnOY9uXUn9veXpU9+b0wRDEj7Ajqia41gQL1vQLP0Yb6m1wsGpHXihflSJCWi23Y2rzpexumsf+bCJSDqCXyTeQO8d4NSCUqfLxWdoE3QkZeIm0jaHYZu0ELVBiTt97URnae7nK6jcTUhGGChYgMk8t3nLwJRzS/Uqu+3mRAMsOCtDrB1f76NcO0ubQQDfJ9Qur/j57pjn1drhMy/OTIK+NsnCAakdWK9D2AzwoZE3jfBgKQTdK2/MDPnNM/XzpDvPcJggOtAHXlB+v6m5tX7/bVKMMA2QH/To9fv9nwHABOFcSAyQcyolrR3ijJvgLEbPJTvXDXyGjFAcN0L1OM11e4UhW7Qwj8DpP8/NTxcBJi7/QiADXtaAejvHwTsJugdn0pxjbwm6f5AMECeSNfISOzRLL59B0DbyaMATD14AbibUCtMXeLix1JO2XX2BAD3e3tzEAwoo6wO+D5beoISeRPy5Otlgo68Cfl/JLcBsdwQDEg6wfWXH2ntAUrEp398BaB10xag8i4xGGA6MF+YBKA5v2/F42LCw+ePY5/LKlFtjtBm6cjr1anx7zjJ/o35AwBsbtkBRKsAPT2x82beAGMlKNlTs1x4A0QVoo5ER1vJmPGpydg8McMVU3bXBghy/YbtW4Eo8kKoAwwYc4A8QW2CvFum3KCRSA0NDQKRITZ0lrdhi7yJzBtQlgOE/yonoNwEMUDevd/vp4Hot722d9UUWWOW//krNm65YWNs3Le5z7HjpsiHHKAwGiDYTNDIKiHo1ULQ5riOE/Q6L9je+WCAwmqAJqkRgl41pNI0jTMdF8oqPEeCAYrEBmi0EbUiaeSFYIDC+L1AVsi8AX8ALYHV6bozIh8AAAAASUVORK5CYII=',
};

function svgIsle(cfg){
  let {w=180, dec='tree', decW=80, decH=88, decOffX=0, decOffY=0, badgeHtml=''}=cfg;
  let cx = w/2;

  // Body sprite is 144×228. We want bodyH = w*0.62 (squat, like current look).
  // Stretching horizontally squishes the stalactites wide — matches the tileset style.
  let bodyH = Math.round(w * 0.62);
  let totalH = bodyH + w*0.14; // room for cloud + shadow below

  // The sprite's teal pool rim sits at ~21% from top of the 228px tall sprite
  // → same fraction applies after stretching: rimY = bodyH * 0.21
  let rimY = Math.round(bodyH * 0.21);

  // Decoration sits above the rim, centred
  let decX = Math.round((w - decW)/2) + decOffX;
  let decY = rimY - decH + decOffY;

  // Floating rock off left side
  let rockW = w*0.11, rockH = w*0.11;
  let rockX = w*0.02, rockY = bodyH*0.35;

  // Cloud wisp below island
  let cloudW = w*0.60, cloudH = w*0.20;
  let cloudX = cx - cloudW/2, cloudY = bodyH - cloudH*0.25;

  let decTag = dec
    ? `<image href="${_DEC[dec]}" x="${decX}" y="${decY}" width="${decW}" height="${decH}" preserveAspectRatio="xMidYMax meet" style="image-rendering:pixelated"/>`
    : '';

  let svg = `<svg viewBox="0 0 ${w} ${totalH.toFixed(0)}" width="${w}" height="${totalH.toFixed(0)}"
      xmlns="http://www.w3.org/2000/svg"
      style="display:block;overflow:visible;image-rendering:pixelated">
    <!-- Island body sprite, stretched wide -->
    <image href="${_DEC.body}" x="0" y="0" width="${w}" height="${bodyH}"
           preserveAspectRatio="none" style="image-rendering:pixelated"/>
    <!-- Decoration (tree/flower/ruins/crystal) -->
    ${decTag}
    <!-- Floating rock -->
    <image href="${_DEC.rock}" x="${rockX.toFixed(1)}" y="${rockY.toFixed(1)}" width="${rockW.toFixed(1)}" height="${rockH.toFixed(1)}" style="image-rendering:pixelated" opacity="0.80"/>
    <!-- Cloud wisp -->
    <image href="${_DEC.cloud}" x="${cloudX.toFixed(1)}" y="${cloudY.toFixed(1)}" width="${cloudW.toFixed(1)}" height="${cloudH.toFixed(1)}" preserveAspectRatio="xMidYMid meet" style="image-rendering:pixelated" opacity="0.55"/>
    <!-- Drop shadow -->
    <ellipse cx="${cx}" cy="${(totalH-3).toFixed(1)}" rx="${(w*0.30).toFixed(1)}" ry="4" fill="rgba(0,0,0,0.10)"/>
  </svg>`;

  return `<div style="position:relative;width:${w}px;display:inline-block">${badgeHtml}${svg}</div>`;
}
function rMap(){
  let c=document.getElementById('content');
  if(!c)return;
  let all=aw(),due=all.filter(w=>s2due(w.de)).length;
  let knownC=all.filter(w=>known.has(w.de)).length;
  let store=getBPStore();
  let weekBP=Math.max(0,(store.delta||0)+Math.floor((store.weeklyCorrect||0)/5));
  let greeting=getGreeting();
  let name=CP?.display_name||'';

  let lernen  = svgIsle({w:196, dec:'tree',    decW:90,  decH:94,  decOffY:-4,
    badgeHtml:due>0?`<div class="isle-badge" style="position:absolute;top:-8px;right:-4px;z-index:10">${due} due</div>`:''});
  let woerter = svgIsle({w:155, dec:'flower',  decW:62,  decH:68,  decOffY:-2});
  let gemein  = svgIsle({w:158, dec:'ruins',   decW:82,  decH:86,  decOffY:-2});
  let planen  = svgIsle({w:130, dec:'crystal', decW:54,  decH:66,  decOffY:-2});

  c.innerHTML=`
<div class="map-outer">
  <div class="map-greeting">${greeting}${name?', <b>'+name+'</b>':''}</div>
  <div class="map-ocean">
    <div class="map-wave mw1"></div><div class="map-wave mw2"></div><div class="map-wave mw3"></div>
    <div class="map-scatter">

      <div class="isle isle-lernen" onclick="setTab('studyhome')">
        ${lernen}
        <div class="isle-label">Lernen</div>
        <div class="isle-sub">${knownC} known</div>
      </div>

      <div class="isle isle-woerter" onclick="setTab('browse')">
        ${woerter}
        <div class="isle-label">Wörter</div>
        <div class="isle-sub">${Object.keys(DATA).length} Kategorien</div>
      </div>

      <div class="isle isle-gemein" onclick="setTab('social')">
        ${gemein}
        <div class="isle-label">Gemeinschaft</div>
        <div class="isle-sub">${weekBP} BP this week</div>
      </div>

      <div class="isle isle-planen" onclick="setTab('plan')">
        ${planen}
        <div class="isle-label">Planen</div>
        <div class="isle-sub">Study plan</div>
      </div>

    </div>
  </div>
</div>`;

  updateMapFAB();
}


function getGreeting(){
  let h=new Date().getHours();
  if(h<12)return'🌅 Guten Morgen';
  if(h<17)return'☀️ Guten Tag';
  if(h<21)return'🌆 Guten Abend';
  return'🌙 Gute Nacht';
}

function updateMapFAB(){
  let fab=document.getElementById('map-fab');
  if(!fab)return;
  fab.style.display=(tab==='home')?'none':'flex';
}


// ── STUDY HOME ────────────────────────────────────────
function rStudyHome(){
  let c=document.getElementById('content');
  if(!c)return;
  let all=aw(),due=all.filter(w=>s2due(w.de)).length;
  let known_c=all.filter(w=>known.has(w.de)).length;
  let streak=streakN||0;
  let modes=[
    {id:'flash',icon:'📖',label:'Flash'},
    {id:'listen',icon:'👂',label:'Listen'},
    {id:'quiz',icon:'❓',label:'Quiz'},
    {id:'fill',icon:'✏️',label:'Fill-in'},
    {id:'gender',icon:'🏷️',label:'Gender'},
    {id:'lesen',icon:'📄',label:'Lesen'},
  ];
  c.innerHTML=`
<div class="sh-wrap">
  <button class="sh-back" onclick="setTab('home')">← Map</button>

  <div class="sh-hero">
    <div class="sh-stat-row">
      <div class="sh-stat">
        <div class="sh-num ${due>0?'sh-num-alert':''}">${due}</div>
        <div class="sh-lbl">due today</div>
      </div>
      <div class="sh-divider-v"></div>
      <div class="sh-stat">
        <div class="sh-num">${known_c}</div>
        <div class="sh-lbl">known</div>
      </div>
      <div class="sh-divider-v"></div>
      <div class="sh-stat">
        <div class="sh-num sh-num-streak">🔥${streak}</div>
        <div class="sh-lbl">day streak</div>
      </div>
    </div>
    <button class="sh-start-btn" onclick="setTab('${lastStudyTab||'flash'}')">
      ${due>0?'Start Review ('+due+' due)':'Start Studying →'}
    </button>
  </div>

  <div class="sh-section-lbl">Choose a mode</div>
  <div class="sh-modes">
    ${modes.map(m=>`<button class="sh-mode-btn${(lastStudyTab||'flash')===m.id?' sh-mode-active':''}" onclick="setTab('${m.id}')">
      <span class="sh-mode-icon">${m.icon}</span>
      <span class="sh-mode-name">${m.label}</span>
    </button>`).join('')}
  </div>

  <div class="sh-section-lbl" style="margin-top:20px">Category</div>
  ${catH()}
</div>`;
}

// ── BROWSE GRID (category cards) ─────────────────────
function rBrowseGrid(){
  let c=document.getElementById('content');
  if(!c)return;
  let cats=Object.keys(DATA);
  let total=0,knownTotal=0;
  cats.forEach(cat=>{let p=cp(cat);total+=p.t;knownTotal+=p.k;});
  let overallPct=total?Math.round(knownTotal/total*100):0;
  c.innerHTML=`
<div class="bg-wrap">
  <button class="sh-back" onclick="setTab('home')">← Map</button>
  <div class="bg-header">
    <div>
      <div style="font-size:20px;font-weight:800">Wörter</div>
      <div style="font-size:13px;color:var(--txt2)">${allW().length} words · ${overallPct}% known · Goethe A1/A2</div>
    </div>
    <div class="bg-level-toggle">${levelH()}</div>
  </div>
  <div class="bg-grid">
    ${cats.map(cat=>{
      let p=cp(cat);
      let pct=p.t?Math.round(p.k/p.t*100):0;
      let col=pct===100?'var(--green)':pct>50?'#60a5fa':pct>0?'#f59e0b':'rgba(255,255,255,0.2)';
      return `<div class="bg-card" onclick="openCatBrowse('${cat}')">
        <div class="bg-card-top">
          <div class="bg-cat-name">${cat}</div>
          <div class="bg-pct" style="color:${col}">${pct}%</div>
        </div>
        <div class="bg-bar"><div class="bg-bar-fill" style="width:${pct}%;background:${col}"></div></div>
        <div class="bg-card-sub">${p.k} / ${p.t} known</div>
      </div>`;
    }).join('')}
  </div>
  <div id="cat-browse-detail"></div>
</div>`;
}

function openCatBrowse(cat){
  let detail=document.getElementById('cat-browse-detail');
  if(!detail)return;
  // Toggle - if already open for this cat, close it
  if(detail.dataset.cat===cat&&detail.style.display!=='none'){
    detail.style.display='none';
    detail.dataset.cat='';
    return;
  }
  detail.dataset.cat=cat;
  detail.style.display='block';
  // Scroll to it
  setTimeout(()=>detail.scrollIntoView({behavior:'smooth',block:'start'}),50);
  // Render word list for this category
  let ws=(DATA[cat]||[]).filter(lvlOk);
  let html=`<div class="bg-detail">
    <div class="bg-detail-hdr">${cat} <button onclick="document.getElementById('cat-browse-detail').style.display='none'" style="float:right;background:none;border:none;color:var(--txt3);cursor:pointer;font-size:18px">✕</button></div>
    ${ws.map(item=>{
      let k=known.has(item.de),artS=item.art?`<span class="lw-art">${item.art}</span>`:'';
      let lvlBadge=`<span class="lw-lvl lw-lvl-${item.lvl||'A1'}">${item.lvl||'A1'}</span>`;
      return `<div class="bg-word">
        <div class="bg-word-left">
          <button class="psb" onclick="speak('${item.de.replace(/'/g,"\\'")}',this)">🔊</button>
          ${artS}<span class="lw-de">${item.de}</span>
          <span class="lw-en">— ${item.en}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          ${lvlBadge}
          <button class="bg-known-btn${k?' bg-known-active':''}" onclick="toggleKnown('${item.de}',${!k})">${k?'✓':''}</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
  detail.innerHTML=html;
}


// ── LESEN MODE ───────────────────────────────────────
let lesenSt={idx:0,answers:[],checked:false,score:0,started:false};

function getLesenTexts(){
  let base=typeof LESEN_TEXTS!=='undefined'?LESEN_TEXTS:[];
  // Merge in any AI-generated texts from this session
  let aiTexts=(typeof lesenGenCache!=='undefined')
    ?[...(lesenGenCache.A1||[]),...(lesenGenCache.A2||[])]
    :[];
  let all=[...base,...aiTexts];
  return all.filter(t=>selLevel==='all'||(t.lvl||'A1')===selLevel);
}

function buildLesenSt(){
  lesenSt={idx:0,answers:[],checked:false,score:0,started:true};
}

function rLesen(){
  let c=document.getElementById('content');
  if(!c)return;
  let texts=getLesenTexts();
  let lvlForGen=selLevel==='all'?'A1':selLevel;

  // If no texts at all, show loading spinner and kick off generation
  if(!texts.length){
    c.innerHTML='<div style="text-align:center;padding:60px"><span class="spinner" style="width:22px;height:22px;border-width:3px;margin:0 auto;display:block;margin-bottom:14px"></span><div style="color:var(--txt2);font-size:14px">Loading your first text…</div></div>';
    genLesenText(lvlForGen).then(()=>rLesen());
    return;
  }

  let lesenLvlToggle='<div style="display:flex;gap:6px">'+
    [['all','Alle'],['A1','A1'],['A2','A2']].map(([v,l])=>
      '<button onclick="selLevel=\''+v+'\';lesenSt.idx=0;lesenSt.answers=[];lesenSt.checked=false;saveLocalCache();rLesen()" style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;border:1.5px solid '+(selLevel===v?'var(--green)':'rgba(255,255,255,0.12)')+';background:'+(selLevel===v?'rgba(45,212,167,0.15)':'transparent')+';color:'+(selLevel===v?'var(--green)':'var(--txt2)')+';cursor:pointer">'+l+'</button>'
    ).join('')+'</div>';

  let idx=lesenSt.idx%texts.length;
  let t=texts[idx];
  let lvlBadge='<span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;background:'+(t.lvl==='A1'?'rgba(45,212,167,0.16)':'rgba(96,165,250,0.16)')+';color:'+(t.lvl==='A1'?'#2dd4a7':'#93c5fd')+'">'+t.lvl+'</span>';
  let progress=(idx+1)+' / '+texts.length;
  let textHtml=t.text.replace(/\n/g,'<br>');

  let questionsHtml='';
  if(lesenSt.checked){
    let correct=0;
    let resultRows=t.questions.map((q,qi)=>{
      let chosen=lesenSt.answers[qi];
      let ok=chosen===q.ans;
      if(ok)correct++;
      return '<div style="margin-bottom:10px;padding:10px 14px;border-radius:var(--rs);background:'+(ok?'rgba(45,212,167,0.1)':'rgba(244,113,116,0.1)')+';border:1px solid '+(ok?'rgba(45,212,167,0.3)':'rgba(244,113,116,0.3)')+'">'+
        '<div style="font-size:13px;font-weight:600;margin-bottom:4px">'+(ok?'✓':'✗')+' '+q.q+'</div>'+
        '<div style="font-size:12px;color:var(--txt2)">Your answer: <b>'+q.opts[chosen!==undefined?chosen:0]+'</b>'+(ok?'':' → Correct: <b>'+q.opts[q.ans]+'</b>')+'</div>'+
        '</div>';
    }).join('');
    lesenSt.score=correct;
    // Pre-generate next AI text in background silently
    let nextIdx=lesenSt.idx+1;
    if(nextIdx>=texts.length&&typeof genLesenText==='function'){
      genLesenText(lvlForGen); // fire and forget — will be ready by the time user clicks Next
    }
    questionsHtml='<div style="text-align:center;margin-bottom:16px">'+
      '<div style="font-size:32px">'+(correct===t.questions.length?'🏆':correct>=t.questions.length/2?'👍':'💪')+'</div>'+
      '<div style="font-size:22px;font-weight:800;margin:6px 0">'+correct+' / '+t.questions.length+' correct</div>'+
      '</div>'+resultRows+
      '<button class="btn-next" onclick="lesenSt.idx++;lesenSt.answers=[];lesenSt.checked=false;rLesen()">Next Text →</button>';
  } else {
    questionsHtml=t.questions.map((q,qi)=>{
      return '<div style="margin-bottom:14px"><div style="font-size:14px;font-weight:600;margin-bottom:8px">'+(qi+1)+'. '+q.q+'</div>'+
        q.opts.map((o,oi)=>{
          let sel=lesenSt.answers[qi]===oi;
          return '<button onclick="lesenSt.answers['+qi+']='+oi+';rLesen()" style="display:block;width:100%;text-align:left;padding:10px 14px;margin-bottom:6px;border-radius:var(--rs);border:1.5px solid '+(sel?'var(--green)':'rgba(255,255,255,0.1)')+';background:'+(sel?'rgba(45,212,167,0.14)':'rgba(255,255,255,0.04)')+';color:white;cursor:pointer;font-size:13px;transition:.15s"><span style="font-weight:700;margin-right:8px">'+'ABC'[oi]+'.</span>'+o+'</button>';
        }).join('')+'</div>';
    }).join('');
    let allAnswered=t.questions.every((_,qi)=>lesenSt.answers[qi]!==undefined);
    questionsHtml+='<button class="btn-next'+(allAnswered?'':' disabled')+'" '+(allAnswered?'onclick="lesenSt.checked=true;rLesen()"':'disabled style="opacity:0.4;cursor:default"')+'>Check answers ✓</button>';
  }

  c.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'+
    '<div style="display:flex;align-items:center;gap:8px">'+lvlBadge+'<span style="font-size:13px;color:var(--txt2)">Text '+progress+'</span></div>'+
    lesenLvlToggle+
    '</div>'+
    '<div class="lesen-card">'+
      '<div style="font-size:15px;font-weight:700;margin-bottom:12px">'+t.title+'</div>'+
      '<div id="lesen-text" style="font-size:14px;line-height:1.9;color:var(--txt2);border-bottom:1px solid var(--bor);padding-bottom:14px;margin-bottom:14px">'+wrapLesenWords(t.text)+'</div>'+
      '<div id="lesen-tooltip" style="display:none;position:fixed;background:#1e1b2e;border:1px solid rgba(139,92,246,0.4);border-radius:10px;padding:6px 12px;font-size:12px;color:#e9d5ff;pointer-events:none;z-index:999;box-shadow:0 4px 20px rgba(0,0,0,0.4)"></div>'+
      '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--txt3);margin-bottom:12px">Questions</div>'+
      questionsHtml+
    '</div>';
  // Load glossary in background — first from DATA, then AI for unknowns
  loadLesenGlossary(t);
}

// ── LESEN WORD TOOLTIPS ───────────────────────────────
let lesenGlossary={};  // key: lowercase bare word → English meaning

function wrapLesenWords(text){
  // Wrap each word token in a clickable span; preserve punctuation and newlines
  return text.replace(/\n/g,'<br>').replace(/([A-Za-zÄÖÜäöüß]+)/g,(word)=>{
    return `<span class="lw-tip" onclick="showLTip(event,'${word.replace(/'/g,"\\'")}')">${word}</span>`;
  });
}

function showLTip(e,word){
  let tip=document.getElementById('lesen-tooltip');
  if(!tip)return;
  let bare=word.toLowerCase().replace(/^(der|die|das|ein|eine|einen|einem|einer|des|dem|den)\s+/i,'');
  let meaning=lesenGlossary[bare]||lesenGlossary[word.toLowerCase()];
  if(!meaning){tip.style.display='none';return;}
  tip.textContent=meaning;
  tip.style.display='block';
  tip.style.left=Math.min(e.clientX+12,window.innerWidth-180)+'px';
  tip.style.top=(e.clientY-36)+'px';
  clearTimeout(tip._t);
  tip._t=setTimeout(()=>tip.style.display='none',2200);
}
document.addEventListener('click',e=>{
  if(!e.target.classList.contains('lw-tip')){
    let tip=document.getElementById('lesen-tooltip');
    if(tip)tip.style.display='none';
  }
});

async function loadLesenGlossary(t){
  // 1. Build word list from text
  let words=[...new Set((t.text.match(/[A-Za-zÄÖÜäöüß]+/g)||[]).map(w=>w.toLowerCase()))];
  // 2. Check DATA first — free and instant
  let allWords=Object.values(DATA).flat();
  let dataMap={};
  allWords.forEach(w=>{dataMap[w.de.toLowerCase()]=w.en;});
  let found={},missing=[];
  words.forEach(w=>{
    if(dataMap[w])found[w]=dataMap[w];
    else missing.push(w);
  });
  // Seed glossary immediately with what we have
  Object.assign(lesenGlossary,found);
  // 3. Ask AI for the rest in one shot (skip very short/common words)
  let toFetch=missing.filter(w=>w.length>3&&!/^(aber|auch|noch|sehr|schon|dann|dass|eine|einer|einen|einem|nicht|sein|sind|wird|wurde|haben|hatte|nach|über|unter|diese|dieser|dieses|wenn|weil|oder|und|mit|von|bei|für|aus|zum|zur|des|dem|den|ihm|ihr|sie|wir|ich|das|der|die|ein|zu)$/.test(w));
  if(!toFetch.length)return;
  try{
    let resp=await fetch('https://yngsuxuamhzefkkjsgus.supabase.co/functions/v1/ai-proxy',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+(authToken||SKEY)},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:400,
        messages:[{role:'user',content:`Translate these German words to English. Return JSON only: {"word":"meaning",...}\nWords: ${toFetch.join(', ')}`}]})
    });
    let data=await resp.json();
    let txt=(data.content?.[0]?.text||'').replace(/```json|```/g,'').trim();
    let parsed=JSON.parse(txt);
    Object.assign(lesenGlossary,parsed);
  }catch(e){}
}

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
    <div style="font-size:13px;color:var(--txt2)">${allW().length} Wörter · ${selLevel==='all'?'A1+A2':selLevel} · Goethe-orientiert</div>
    <button id="regen-all-btn" class="refresh-phrase" onclick="regenAllPhrases()" style="font-size:12px;padding:6px 12px">✨ Regenerate all phrases</button>
  </div>
  <div id="regen-progress" style="display:none;margin-bottom:16px"></div>`;
  for(let cat of selCats){
    let ws=(DATA[cat]||[]).filter(lvlOk),p=cp(cat);
    if(ws.length===0)continue;
    html+=`<div class="list-sec"><div class="list-cat-hdr">${cat}<span style="font-size:12px;color:var(--txt2);font-weight:400">${p.k}/${p.t}</span></div>`;
    for(let item of ws){
      let k=known.has(item.de),artS=item.art?`<span class="lw-art">${item.art}</span>`:'';
      let phH=item.phrases.map(p=>`<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px"><div><div class="lp-de">${bw(p[0],item.de)}</div><div class="lp-en">${p[1]}</div></div><button class="psb" onclick="speak('${p[0].replace(/'/g,"\\'")}',this)" style="margin-left:auto;flex-shrink:0">🔊</button></div>`).join('');
      html+=`<div class="list-word"><div class="list-hdr" onclick="this.nextElementSibling.classList.toggle('open')"><div class="lw-left"><button class="psb" onclick="event.stopPropagation();speak('${item.de.replace(/'/g,"\\'")}',this)">🔊</button>${artS}<span class="lw-de">${item.de}</span><span class="lw-en">— ${item.en}</span></div><div style="display:flex;align-items:center;gap:6px"><span class="lw-lvl lw-lvl-${item.lvl||'A1'}">${item.lvl||'A1'}</span>${k?'<span class="lw-known">✓</span>':''}<span style="color:var(--txt3);font-size:16px">›</span></div></div><div class="list-body">${phH}<button class="refresh-phrase" style="margin-top:8px" onclick="refreshPhrases('${item.de}',this.nextElementSibling)">✨ AI phrases</button><div></div><button class="mark-btn${k?' known':''}" onclick="toggleKnown('${item.de}',${!k})">${k?'Mark as learning':'Mark as known ✓'}</button></div></div>`;
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
  if(ranksSubTab==='race'){
    c.innerHTML=rRaceUI();
    if(raceSt&&!raceSt.done&&!raceSt.waiting&&raceSt.startTime){clearTimeout(raceSt&&raceSt.timerOut);setTimeout(startRaceTimer,50);}
    if(!raceSt)loadRaceRoom();
    return;
  }
  let store=getBPStore();
  let weekBP=Math.max(0,(store.delta||0)+Math.floor((store.weeklyCorrect||0)/5));
  let tabs=[['friends','👥','Friends'],['river','🚤','River'],['battle','⚔️','Battle']];
  let tabHtml='<div class="sc-tabs">'+tabs.map(([t,ic,l])=>{
    let active=ranksSubTab===t?' active':'';
    return '<button class="sc-tab'+active+'" onclick="ranksSubTab=\''+t+'\';rSocial()"><span class="sc-tab-icon">'+ic+'</span><span>'+l+'</span></button>';
  }).join('')+'</div>';
  let html='<button class="sh-back" onclick="setTab(\'home\')">← Map</button>'+
    '<div class="sc-hero"><div class="sc-hero-stat"><div class="sc-hero-n">'+weekBP+'</div><div class="sc-hero-l">BP this week</div></div>'+
    '<div class="sc-hero-stat"><div class="sc-hero-n">'+getDaysUntilReset()+'d</div><div class="sc-hero-l">until reset</div></div></div>'+
    tabHtml;
  if(ranksSubTab==='river')html+=rRiverUI();
  else if(ranksSubTab==='battle')html+=rBattleUI();
  else html+=rFriendsUI();
  c.innerHTML=html;
  if(ranksSubTab==='friends')loadFriends();
  if(ranksSubTab==='river')loadRiver();
  if(ranksSubTab==='battle')loadBattle();
}
function rRanks(){ranksSubTab='friends';rSocial();}
function raceNav(){ranksSubTab='race';rSocial();}


// ── BATTLE ARENA ──────────────────────────────────────
function rBattleUI(){
  let bp=getBP(xpTotal);
  let store=getBPStore();
  let wins=(store.battles||[]).filter(b=>b.won).length;
  let losses=(store.battles||[]).filter(b=>!b.won).length;
  let daysLeft=getDaysUntilReset();
  return '<div id="battle-wrap">'
    +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">'
    +'<div style="background:rgba(255,255,255,0.05);border:1px solid var(--bor);border-radius:var(--r);padding:12px;text-align:center"><div style="font-size:26px;font-weight:700;color:var(--green)">'+bp+'</div><div style="font-size:11px;color:var(--txt2)">Total BP</div></div>'
    +'<div style="background:rgba(255,255,255,0.05);border:1px solid var(--bor);border-radius:var(--r);padding:12px;text-align:center"><div style="font-size:26px;font-weight:700">'+wins+'W '+losses+'L</div><div style="font-size:11px;color:var(--txt2)">This week</div></div>'
    +'<div style="background:rgba(255,255,255,0.05);border:1px solid var(--bor);border-radius:var(--r);padding:12px;text-align:center"><div style="font-size:26px;font-weight:700;color:var(--bd)">'+daysLeft+'d</div><div style="font-size:11px;color:var(--txt2)">Until reset</div></div>'
    +'</div>'
    +'<div style="background:rgba(245,158,11,0.1);border-left:3px solid #f59e0b;border-radius:var(--rs);padding:10px 12px;margin-bottom:14px;font-size:12px;color:#fcd34d">⚔️ Win to steal <b>5 BP</b>. Lose and give 5 BP. Only ±2 levels can battle. Resets every Monday.</div>'
    +'<div style="font-size:13px;font-weight:600;margin-bottom:10px">Opponents near your level</div>'
    +'<div id="battle-opponents"><div style="text-align:center;padding:16px;color:var(--txt3);font-size:13px"><span class="spinner"></span> Matching…</div></div>'
    +'</div>';
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
      let badge=fought?'<span style="font-size:10px;background:'+(fought.won?'rgba(34,197,94,0.14)':'rgba(239,68,68,0.12)')+';color:'+(fought.won?'#86efac':'#fca5a5')+';padding:2px 7px;border-radius:10px;margin-left:4px">'+(fought.won?'Won +5':'Lost -5')+'</span>':'';
      return '<div style="background:rgba(255,255,255,0.04);border:1px solid var(--bor);border-radius:var(--r);padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">'
        +'<div><div style="font-size:14px;font-weight:600">'+u.name+badge+'</div>'
        +'<div style="font-size:11px;color:var(--txt2);margin-top:2px">Lvl '+u.lvl+' · '+theirBP+' BP</div></div>'
        +'<button class="btn-sm-green" style="padding:7px 14px" id="battle-btn-'+u.id+'">⚔️ Battle</button>'
        +'</div>';
    }).join('');
    // Bind battle buttons after render to avoid quote issues
    opponents.forEach(u=>{
      let btn=document.getElementById('battle-btn-'+u.id);
      if(btn)btn.onclick=()=>startBattle(u.id,u.name,u.xp);
    });
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


function rRiverUI(){
  return `<div id="river-wrap"><div style="text-align:center;padding:24px 0;color:var(--txt3);font-size:13px"><span class="spinner"></span> Loading river…</div></div>`;
}

// ── BP / WEEKLY HELPERS ───────────────────────────────
function getWeekStart(){
  let d=new Date();d.setHours(0,0,0,0);
  d.setDate(d.getDate()-((d.getDay()+6)%7));
  return d.toISOString().split('T')[0];
}
function getDaysUntilReset(){
  let now=new Date(),next=new Date(now);
  next.setDate(now.getDate()+(8-((now.getDay()+6)%7+1))%7||7);
  next.setHours(0,0,0,0);
  return Math.ceil((next-now)/86400000);
}
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
    // Preserve weeklyCorrect (study BP) — don't overwrite with battle-only data
    store.delta=delta;store.battles=battles;
    // Re-add study BP on top of battle delta
    let studyBP=Math.floor((store.weeklyCorrect||0)/5);
    store.delta+=studyBP;
    saveBPStore(store);
  }catch(e){}
}
async function saveBattleResult(winnerId,loserId,roomId,stake){
  try{
    await sbUpsert('battle_log',{winner_id:winnerId,loser_id:loserId,room_id:roomId,stake,week_start:getWeekStart()});
  }catch(e){}
}


async function loadRiver(){
  let wrap=document.getElementById('river-wrap');
  if(!wrap)return;
  try{
    let week=getWeekStart();
    let [profiles,battles]=await Promise.all([
      sbFetch('profiles','select=id,display_name&limit=100'),
      sbFetch('battle_log','week_start=eq.'+week+'&select=winner_id,loser_id,stake',true)
    ]);
    let pMap={};(profiles||[]).forEach(p=>pMap[p.id]=p.display_name||'Learner');

    // Compute weekly BP per user from battle_log
    let weeklyBP={};
    (battles||[]).forEach(b=>{
      weeklyBP[b.winner_id]=(weeklyBP[b.winner_id]||0)+(b.stake||5);
      weeklyBP[b.loser_id]=(weeklyBP[b.loser_id]||0)-(b.stake||5);
    });

    // Include all known profiles on the river; BP comes from battle_log only.
    // Users with no battles this week sit at 0 — still visible, just at the start line.
    let allIds=new Set([...Object.keys(pMap),...Object.keys(weeklyBP)]);
    if(CU)allIds.add(CU.id);
    let users=[...allIds].map(id=>({
      id,name:pMap[id]||id.slice(0,8),
      weekBP:Math.max(0,weeklyBP[id]||0),
      isMe:id===CU?.id
    })).filter(u=>u.isMe||pMap[u.id]); // only show users we have a display name for

    // Override my own weekly BP with local store (most up-to-date)
    // Must include BOTH battle delta AND study BP (weeklyCorrect / BP_PER_N)
    let myStore=getBPStore();
    let battleDelta=myStore.delta||0;
    let studyBP=Math.floor((myStore.weeklyCorrect||0)/5);
    let myWeekBP=Math.max(0,battleDelta+studyBP);
    if(CU){
      let me=users.find(u=>u.isMe);
      if(me)me.weekBP=myWeekBP;
      else users.push({id:CU.id,name:CP?.display_name||'You',weekBP:myWeekBP,isMe:true});
    }

    users.sort((a,b)=>b.weekBP-a.weekBP);
    renderRiver(users,wrap);
  }catch(e){
    if(wrap)wrap.innerHTML='<div style="color:var(--rd);font-size:13px;padding:12px">Could not load river data.</div>';
  }
}
function renderRiver(users,wrap,compact=false){
  users=users.slice().sort((a,b)=>b.weekBP-a.weekBP);
  users.forEach((u,i)=>{u.rank=i+1;});

  let me=users.find(u=>u.isMe)||{id:'me',name:'You',weekBP:0,rank:1,isMe:true};
  let myIdx=users.findIndex(u=>u.isMe);

  let rivals=[];
  for(let d=1;rivals.length<4&&d<=users.length;d++){
    if(myIdx-d>=0)rivals.push(users[myIdx-d]);
    if(rivals.length<4&&myIdx+d<users.length)rivals.push(users[myIdx+d]);
  }
  while(rivals.length<4)rivals.push(null);

  const LANES=[11,28,50,72,89];
  let shown=[];
  rivals.slice(0,2).forEach((u,i)=>{if(u){u.lane=i;shown.push(u);}});
  me.lane=2;shown.push(me);
  rivals.slice(2,4).forEach((u,i)=>{if(u){u.lane=3+i;shown.push(u);}});

  const topBP=Math.max(...shown.map(u=>u.weekBP),1);
  const allZero=shown.every(u=>u.weekBP===0);
  const getY=u=>allZero?10:Math.round(10+Math.sqrt(u.weekBP/Math.max(topBP*1.2,1))*82);

  let height=compact?300:480;
  let daysLeft=getDaysUntilReset();
  let rank=me.rank||'?';

  // Animated wave layers
  let waves=`
    <div class="rv-wave rv-wave1"></div>
    <div class="rv-wave rv-wave2"></div>
    <div class="rv-wave rv-wave3"></div>`;

  // Lane dividers with shimmer
  let lanesHTML=LANES.map((x,i)=>
    `<div class="rv-lane-div" style="left:${x}%"></div>`
  ).join('');

  // Start line
  let startLine=`
    <div class="rv-start-line"></div>
    <div class="rv-start-label">⚓ Week Start</div>`;

  // Boats — SVG-based with wake trail
  let boatsHTML=shown.map((u,i)=>{
    let y=getY(u);
    let x=LANES[u.lane];
    let isMe=u.isMe;
    let delay=(i*0.4).toFixed(1);
    let boatSVG=isMe
      ? `<svg width="36" height="36" viewBox="0 0 36 36">
          <ellipse cx="18" cy="26" rx="14" ry="5" fill="rgba(139,92,246,0.5)"/>
          <polygon points="18,4 28,24 8,24" fill="#a78bfa"/>
          <polygon points="18,6 24,20 18,20" fill="white" opacity="0.9"/>
          <rect x="17" y="6" width="2" height="18" fill="#c4b5fd"/>
        </svg>`
      : `<svg width="28" height="28" viewBox="0 0 28 28">
          <ellipse cx="14" cy="21" rx="11" ry="4" fill="rgba(100,180,255,0.3)"/>
          <polygon points="14,4 22,20 6,20" fill="#64b5f6"/>
          <polygon points="14,6 19,17 14,17" fill="white" opacity="0.7"/>
          <rect x="13" y="5" width="1.5" height="14" fill="#90caf9"/>
        </svg>`;

    return `<div class="rv-boat-wrap${isMe?' rv-me-wrap':''}"
      style="bottom:${y}%;left:${x}%;animation-delay:${delay}s">
      <div class="rv-wake"></div>
      <div class="rv-boat-inner">
        ${boatSVG}
      </div>
      <div class="rv-boat-label${isMe?' rv-me-label':''}">
        <span class="rv-boat-name">${isMe?'<b>'+u.name+'</b>':u.name}</span>
        <span class="rv-boat-bp">${u.weekBP} BP</span>
      </div>
    </div>`;
  }).join('');

  let header=compact?''
    :`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div>
        <div style="font-size:16px;font-weight:600;margin-bottom:2px">🚤 Weekly River</div>
        <div style="font-size:13px;color:var(--txt2)">Rank <b>#${rank}</b> of ${users.length} · <b>${me.weekBP||0} BP</b> this week</div>
      </div>
      <div style="text-align:right;font-size:12px;color:var(--txt3)">Resets in<br><b style="color:var(--txt2)">${daysLeft}d</b></div>
    </div>`;

  let footer=compact?''
    :'<div style="font-size:12px;color:var(--txt3);margin-top:10px;text-align:center">⚔️ Win battles · 📖 Study to move up · resets Monday</div>';

  wrap.innerHTML=header
    +`<div class="rv-container" style="height:${height}px">`
    +waves+lanesHTML+startLine+boatsHTML
    +`<div class="rv-leader-badge">🏆 Leader</div>`
    +'</div>'+footer;
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
    // Fetch this week's battle_log to get accurate weekly BP for friends
    let myStore=getBPStore();
    let week=getWeekStart();
    sbFetch('battle_log','week_start=eq.'+week+'&select=winner_id,loser_id,stake',true).then(battles=>{
      let weeklyBP={};
      (battles||[]).forEach(b=>{
        weeklyBP[b.winner_id]=(weeklyBP[b.winner_id]||0)+(b.stake||5);
        weeklyBP[b.loser_id]=(weeklyBP[b.loser_id]||0)-(b.stake||5);
      });
      riverUsers.forEach(u=>{u.weekBP=Math.max(0,weeklyBP[u.id]||0);});
      riverUsers.push({id:CU.id,name:CP?.display_name||'You',weekBP:Math.max(0,myStore.delta||0),xp:xpTotal,streak:streakN,isMe:true});
      riverUsers.sort((a,b)=>b.weekBP-a.weekBP);
      renderRiver(riverUsers,riverWrap,true);
    });
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
  let words;
  try{words=JSON.parse(room.words||'[]');}catch(e){words=[];}
  if(!words.length){if(s)s.textContent='Invalid room data.';return;}
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
  // Battle mode: fixed 60s, score = correct answers
  let BATTLE_SECS=60;
  let elapsed=r.startTime?Math.floor((Date.now()-r.startTime)/1000):0;
  let remaining=Math.max(0,BATTLE_SECS-elapsed);

  // Time up — finish
  if(remaining===0&&!r.done){finishRace();return rRaceResults();}

  let item=r.words[r.idx%r.words.length];
  let ws=aw();if(ws.length<4)ws=Object.values(DATA).flat();
  let oth=ws.filter(w=>w.de!==item.de);shuf(oth);
  let opts=[item.en,...oth.slice(0,3).map(w=>w.en)];shuf(opts);
  r.answered=false;

  let pct=Math.round((remaining/BATTLE_SECS)*100);
  let timerCol=remaining>20?'var(--green)':remaining>10?'#f59e0b':'#ef4444';

  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:13px;color:var(--txt2)">✅ ${r.score} correct</span>
      <span style="font-size:18px;font-weight:800;color:${timerCol}" id="race-timer-display">${remaining}s</span>
      <span style="font-size:13px;color:var(--txt2)">#${r.idx+1}</span>
    </div>
    <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:3px;margin-bottom:14px;overflow:hidden">
      <div id="race-timer-bar" style="height:100%;width:${pct}%;background:${timerCol};border-radius:3px;transition:width 1s linear"></div>
    </div>
    <div class="card" style="text-align:center">
      ${item.art?`<div class="art-s">${item.art}</div>`:''}
      <div class="de-word">${item.de}</div>
      <div style="font-size:13px;color:var(--txt2);margin-top:6px">What does this mean?</div>
    </div>
    <div class="quiz-grid" style="margin-top:12px">
      ${opts.map(o=>`<button class="q-opt" onclick="ansRace('${o.replace(/'/g,"\\'")}','${item.en.replace(/'/g,"\\'")}',this)">${o}</button>`).join('')}
    </div>
    <button class="btn-next" style="background:rgba(255,255,255,0.05);color:var(--txt2);margin-top:8px;font-size:12px" onclick="clearTimeout(raceSt&&raceSt.timerOut);raceSt=null;rRanks()">✕ Quit</button>
  </div>`;
}


function startRaceTimer(){
  if(!raceSt||raceSt.done||raceSt.waiting||!raceSt.startTime)return;
  const BATTLE_SECS=60;
  // Tick every second — update timer display and progress bar
  function tick(){
    if(!raceSt||raceSt.done)return;
    let elapsed=Math.floor((Date.now()-raceSt.startTime)/1000);
    let remaining=Math.max(0,BATTLE_SECS-elapsed);
    let pct=Math.round((remaining/BATTLE_SECS)*100);
    let timerCol=remaining>20?'var(--green)':remaining>10?'#f59e0b':'#ef4444';
    let disp=document.getElementById('race-timer-display');
    let bar=document.getElementById('race-timer-bar');
    if(disp)disp.textContent=remaining+'s';
    if(disp)disp.style.color=timerCol;
    if(bar){bar.style.width=pct+'%';bar.style.background=timerCol;}
    if(remaining<=0){finishRace();raceNav();return;}
    raceSt.timerOut=setTimeout(tick,1000);
  }
  raceSt.timerOut=setTimeout(tick,1000);
}


function ansRace(chosen,correct,btn){
  if(!raceSt||raceSt.answered)return;
  raceSt.answered=true;
  let ok=chosen===correct;
  let btns=btn.closest('.quiz-grid').querySelectorAll('.q-opt');
  btns.forEach(b=>{
    b.disabled=true;
    if(b.textContent.trim()===correct)b.className='q-opt correct';
    else if(b===btn&&!ok)b.className='q-opt wrong';
  });
  if(ok){
    raceSt.score++;
    let badge=document.createElement('div');
    badge.textContent='✓ +1';
    badge.style.cssText='position:fixed;top:40%;left:50%;transform:translateX(-50%);font-size:32px;font-weight:800;color:var(--green);pointer-events:none;animation:fadeup 0.7s forwards';
    document.body.appendChild(badge);
    setTimeout(()=>badge.remove(),700);
  }
  // Move to next word after short pause (300ms correct, 700ms wrong)
  setTimeout(()=>{
    if(!raceSt)return;
    raceSt.answered=false;
    raceSt.idx++;
    // When words run out, pull a fresh shuffled batch from the full word pool
    if(raceSt.idx>=raceSt.words.length){
      let allWords=aw();if(allWords.length<4)allWords=Object.values(DATA).flat();
      let fresh=allWords.filter(w=>!raceSt.usedDe?.has(w.de));
      if(fresh.length<4)fresh=allWords; // reset used tracking if near-exhausted
      shuf(fresh);
      raceSt.words=[...raceSt.words,...fresh.slice(0,10)];
    }
    if(!raceSt.usedDe)raceSt.usedDe=new Set();
    raceSt.usedDe.add(raceSt.words[raceSt.idx]?.de);
    raceNav();
  },ok?300:700);
}


async function finishRace(){
  if(raceSt.done)return;
  raceSt.done=true;
  if(window._pendingBattle){raceSt.battle=window._pendingBattle;window._pendingBattle=null;}
  let roomId=raceSt.room.id||raceSt.room.code;
  await sbUpsert('race_results',{room_id:roomId,user_id:CU.id,display_name:CP?.display_name||'You',score:raceSt.score,total:60});
  // Poll for opponent result — retry up to 15 times (30 seconds max)
  if(raceSt.battle){
    let opponentId=raceSt.battle.opponentId;
    let attempts=0;
    let pollBP=async()=>{
      attempts++;
      let results=await sbFetch('race_results','room_id=eq.'+roomId+'&order=score.desc');
      let mine=results?.find(r=>r.user_id===CU.id);
      let theirs=results?.find(r=>r.user_id===opponentId);
      // If both results in, resolve immediately
      if(mine&&theirs){
        let won=mine.score>theirs.score;
        if(won)await saveBattleResult(CU.id,opponentId,roomId,raceSt.battle.stake);
        await syncBPFromSupabase();
        raceSt.battle.resolved=true;
        raceSt.battle.won=won;
        // Update comparison table if visible
        updateResultsScreen(results);
        // Inject BP banner
        let stake=raceSt.battle.stake||5;
        let col=won?'var(--green)':'var(--rd)',bg=won?'var(--gl)':'var(--rl)';
        let banner=document.getElementById('bp-battle-banner');
        if(banner)banner.outerHTML='<div style="margin-bottom:14px;padding:10px 14px;border-radius:var(--r);background:'+bg+';border-left:3px solid '+col+'"><div style="font-size:15px;font-weight:700;color:'+col+'">'+(won?'⚔️ Battle Won! +'+stake+' BP':'⚔️ Battle Lost… -'+stake+' BP')+'</div><div style="font-size:12px;color:var(--txt2);margin-top:2px">'+(won?'You stole BP from '+raceSt.battle.opponentName:raceSt.battle.opponentName+' stole your BP')+'</div></div>';
        return;
      }
      // Keep polling if opponent hasn't finished yet (max 15 attempts = 30s)
      if(attempts<15)setTimeout(pollBP,2000);
      else{
        // Opponent never finished — you win by default
        if(mine){
          await saveBattleResult(CU.id,opponentId,roomId,raceSt.battle.stake);
          await syncBPFromSupabase();
          raceSt.battle.resolved=true;raceSt.battle.won=true;
          let banner=document.getElementById('bp-battle-banner');
          if(banner)banner.outerHTML='<div style="margin-bottom:14px;padding:10px 14px;border-radius:var(--r);background:var(--gl);border-left:3px solid var(--green)"><div style="font-size:15px;font-weight:700;color:var(--green)">⚔️ Battle Won! +'+raceSt.battle.stake+' BP</div><div style="font-size:12px;color:var(--txt2);margin-top:2px">Opponent did not finish</div></div>';
        }
      }
    };
    setTimeout(pollBP,2000);
  }
}


function updateResultsScreen(res){
  let el=document.getElementById('race-comparison');
  if(!el)return;
  if(!res?.length){el.innerHTML='<div style="text-align:center;color:var(--txt2);font-size:13px;padding:12px">Waiting for opponent to finish…</div>';return;}
  let cards=res.map((p,i)=>{
    let isMe=p.user_id===CU?.id;
    let medal=i===0?'🥇':i===1?'🥈':'🥉';
    let winner=i===0;
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:'+(isMe?'rgba(72,199,142,0.1)':'rgba(255,255,255,0.04)')+';border-radius:var(--r);margin-bottom:8px;border:'+(isMe?'1.5px solid var(--green)':'1px solid rgba(255,255,255,0.08)')+'">'+
      '<div><div style="font-size:14px;font-weight:600">'+medal+' '+(p.display_name||'Player')+(isMe?' (you)':'')+'</div>'+
      '<div style="font-size:12px;color:var(--txt2);margin-top:2px">'+(winner?'Winner':'')+'</div></div>'+
      '<div style="font-size:22px;font-weight:800;color:'+(winner?'var(--green)':'var(--txt)')+'">'+p.score+' correct</div></div>';
  }).join('');
  el.innerHTML='<div style="font-size:13px;font-weight:600;margin-bottom:8px">Results</div>'+cards+
    (res.length<2?'<div style="font-size:12px;color:var(--txt3);text-align:center;margin-top:6px">⏳ Waiting for opponent…</div>':'');
}


function rRaceResults(){
  let r=raceSt;
  let maxScore=60; // 60 second battle
  let pct=r.score; // score IS correct count
  let emoji=r.score>=15?'🏆':r.score>=10?'🎉':r.score>=5?'👍':'💪';
  let roomId=r.room.id||r.room.code;
  // BP battle banner — shown after finishRace resolves (2.5s delay)
  // BP banner injected after result resolves (2.5s delay in finishRace)
  let bpBanner='<div id="bp-battle-banner"></div>';
  if(r.battle&&r.battle.resolved){
    let won=r.battle.won,stake=r.battle.stake||5;
    let col=won?'var(--green)':'var(--rd)',bg=won?'var(--gl)':'var(--rl)';
    bpBanner='<div style="margin-bottom:14px;padding:10px 14px;border-radius:var(--r);background:'+bg+';border-left:3px solid '+col+'"><div style="font-size:15px;font-weight:700;color:'+col+'">'+(won?'⚔️ Battle Won! +'+stake+' BP':'⚔️ Battle Lost… -'+stake+' BP')+'</div><div style="font-size:12px;color:var(--txt2);margin-top:2px">'+(won?'You stole BP from '+r.battle.opponentName:r.battle.opponentName+' stole your BP')+'</div></div>';
  }
  let html='<div><div style="text-align:center;margin-bottom:16px"><div style="font-size:36px">'+emoji+'</div><div style="font-size:22px;font-weight:700;margin:6px 0">'+r.score+' correct</div><div style="font-size:13px;color:var(--txt2)">in 60 seconds · '+(r.score>=10?'Great round!':r.score>=5?'Good effort!':'Keep practicing!')+'</div></div>'+bpBanner+'<div id="race-comparison"><div style="text-align:center;color:var(--txt2);font-size:13px">Loading results...</div></div><button class="btn-next" style="margin-top:16px" onclick="raceSt=null;raceNav()">Done</button></div>';
  // Poll for results — keeps retrying until opponent result appears
  let fetchAttempts=0;
  let pollResults=async()=>{
    fetchAttempts++;
    let res=await sbFetch('race_results','room_id=eq.'+roomId+'&order=score.desc');
    updateResultsScreen(res);
    let el=document.getElementById('race-comparison');
    if(el&&res&&res.length<2&&fetchAttempts<10)setTimeout(pollResults,2000);
  };
  setTimeout(pollResults,500);
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