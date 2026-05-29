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



// ── SVG ISLAND BUILDER — tileset sprites + CSS-animated decorations ───
// Body: Ground_grass_flying.png segment (48×76) stretched wide.
// Animated: tree (6 frames), statue (4 frames), flying rocks (4 frames).
// CSS steps() animation cycles through sprite sheet frames.

const _A = {
  body:        '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',
  treeSheet:   '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',
  rocksSheet:  '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',
  cloudSheet:  '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',
  statueSheet: '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',
  flower:      'iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAACwUlEQVR42u2dsYoTURSGx2AhBEdR3EIzLjppXJBlG0GwskhhKSkEQcQHUERtfABbsfAFtvYJLLawEsVCFtZiNws6UYJgWBMEu7HKzUmYw9xrMslM7vdVlzA7Gyb7f/znToYNAgAAAAAfOcYlWDzXWi/S0brG5VgufAAoyD/tPH72kASgIEBBy9IOCUBBMOI4l2AxJL8GZh2dDUkACgIUVHTzaT+4TwJQEKyegmTMJR/ePi/VYNnp/jTruLFGAlAQVFdBNvsqL4MgzTtP2TRFAvgAUFDlkPsqEqkmeYxsI4GiqVnUJPW41brl9P5JAApCQZVgShGZ+y2amuQQFIvji1YTCUBBsJItSNORbCDa3oumpkBvL2mROiIBKAgFVRpNR5pSNDWpypo8z9x1RAJQEApaGaQWar19o4vNe48yh68Zm1JKAlAQoCCF33+GZv15+1WQpyPXptRvXjXrrwe7JAAFwX/hxQMaV+K2aSyn6iczdWTVggRSX/3DxKzPXI6czkkCUBAK8ooidPTx3ScUhIKAQcyVC+cv5g5rWvORGpHacW1EJAAF0YK8RTaiRjTWxbB/5NSOJCgIBYFXCtKeF7NB3kFblo5IAApiEKu0arTnxbRvSk9hzrku7nBNsLfjNKxJ7di8TgJQEC3IB9U4od3tOhI6Or1xM/NnX98Z36A/14xJAAqC8itIewreVS/a93zmhdZknl5/b9aX1uuZx2g6IgEoCAVVogU5/2X19uf+3myGLxsdkQAUBKVVUBHIrWaJ3HaWhCfCzNe///iW+7uiG7czdUQCUBB4qyAbNbnqSENqykZHJAAFoSCw1JGrmqSOntwNSQAKAhRUhI5chzipIxKAgvyG/6CRwZfOG6FmNx0N/g6cmhIJQEG0IFhwO5KNiASgIBQEM+pIYqOmbpKQABQEKGiRatIGPRKAgvzmH6I2+RUFo2VoAAAAAElFTkSuQmCC',
  crystal:     'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAFfElEQVR42u2dPYhcVRTHz0iCmqCuMSEQiQimEcRCRY1YCDZBbQMBsbAQBBFshHQiNgEbQZB0FkEQYqmyjWAR8q2FFqKsRBQDErPZKMYEhbUYT8wc58y5982bt/e+9/t1M5Odj8f9/865H5MZra+vCwyXm7gEDABgAAADABgAwAAABgAMiU1dvdBoNOr1hXz42RenLqh88cn7jT54V+szGAADQBuJf+3jNyYef+e5N+kBAAP0Nvk28acujy/lY3f8zSwAMMDgks86AGAAkl+fETAABoA2kv/X+T9ERGTzrq0YADBA75Ovia8dDIABoI3k11b7MQBggCHWfAwAZRlAE9j05EzT11NSk681PjKBPv7I2wf1rk4/HwaAOgygSdz7wVvjO55fbFK8Wh8lua/dPwaAMnoATdaiTBAl39Z8PdFz7PwwBgAGwADDxOv2T8m4pj95//j+Y99cyzLZ1R8uiojILffehQEAAxTTC1i01kcm2Lxr09RZQO3dPwaAMnuAtkyQen7/uglkcqXPS7y3HqC1HwMABiixJ7C1PtUE9v3Y2v/78R/pAQADZNfmG3bLZs6fc3fX9PkfeOWlmWa5bgLZOn12kGkCDAAYoA1sNz3vipqt/babt4m2vYE1QV+SjwGg7FmANcJtT9wzsxdIrf1eglNN4PUSGAAwQBs136LJt4mzJvCSHyU96vL/Z4J/b3vvu5ZdQAwAZfcAmqRonz01+W2ZwFv5s+/r7OuHZNZ6BQaAYRlAu/Q9+54REZG1z74SEZGlpx+cmfDUXbar3/88/vv77p7oHeY1QaqpFP1c9ACAAeZJkrciuKgzd1HytfbXnngMAGXPAqLke7W/beyKYWryV5Y/raL7xwBQhgHsbCBKfmSEtrt8/fde4q+troqIyM3bttEDAAZIxktObsJzkxyZwD6emvzaaj8GgDJ6AE2S1wu0Ter3/KPk9wUMgAG64YbaOLEnoInyTJDaC+geQJT0KPkXjpxISnzttR8DQBk9QGpPkGoC7wRRW8nvGxgAA3RL1At4CWxr92/e5KfWfu+XRDOuDwaAAfYAll+Ofi4iIjv3P5XU/Xdd872k2+8+ZqDPN8IAsHBGXf1Ktffr4fasYJRENYE3K7CzgLaTb/cuUlcuo5NM9hQxvx4O9ADT0PUBW/svn/l6wgBe8pvWei/5ySuViclnHQCGbQBNmk2qd+JGk+8xb/Kjml5r8jEAlGEAb2XQS77dPVx08pvW/tKTjwGg7FmAl3zLlQu/iojIlh3bp87z23r91NrvfUt4ivEEAwAGiHqBKPmWec/pe38X1X7+fwDAAG2Sm3zbC0TrCqnJj2p/rcnHAFCWAY4eeXddROTQh18mJdwzQW4vED3u1f7ak48BoAwDaPJTyTXBvMm3iT/33ke9GgAYAAPUkXybeM8E3mwgSv6lb7+beVv589LkbOLK2mqVtR8DgIhswJlAL/na/e9+9PGk+b2t/dYEejuq9alJV269c/x8F8+tLDT5nAmEYcwC1tZ+a9Tte7U/dT2g1OTTA0A/DZDb9UcmaLoeYJMfJV7pW/IxAJTRA+SaILdXaJp8TbzSt+RjAKjLALm9gr0/t9YfPPCQiIjsf+HVUZ8HAAbAAGXw8r49IiJyePmkiPy3Ith0ty9Kuk28oskfChgAA/QLrxewSbfmWVq6fZADAAMMnGJ2A+2ewOHllaxewCb+p9Mnpybd4iV/o7t/dgNhWD2AJlFNEM0Kmia+9OTTA0C/ewAl2h2MeoLcxEfJL80A9ADQbwPMa4K2El9q7ccAMAwDNDVBV4nv6vowC4BhGyDXCLk0rfEYADDARhigqRna7uYxAGAAwADAAAAGADAAgAEADABgAAADABgAUDn/AIA1xTglPm5ZAAAAAElFTkSuQmCC',
  ruins:       'iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAATPElEQVR42u2dTaid1RWG9y3iIFiwAdNCSEqqggh14qSDNCbSTKqlNClCwGCJE+mkxJa2WJDSgXTQKp0UJwYkgiA1pVSdKObHDJw4SUGEaC8mCq0Vq1QcBOF2cM+6N+e9Z9219/7+znfO80zi/TnnfPv7rvt999prrb2ytraWAGA5+Qq3AIAJAACYAACACQAAmAAAgAkAAJgAAIAJAACYAACACQAAmAAAgAkAAJgAAIAJAACYAACACQAAmAAAgAkAAJgAAIAJAACYAACACQAAmAAAgAkAAJgAAIAJAACYAACACQAAmAAAgAkAAJgAACCXG8Z2wSsrKzy1GdzzvSNr1399/rUz3KgWWVtbwwEAAA4A5lDxX3zphamfH73/gTWcAOAAAAAHsOiKD4ADAIAiVsYW3Vy2XQBT/lLF/89//5dSSumR4w8nYgHNYRcAAIgBwDC8demdlFJKd991x7aKrzx9+pmJE0jsCgAOAABwAKN3Asrqu++txwwOHcAJAA4AAGLYBZhTLPpvyn3l6ofbKv+W1ztOwGB3oAx2AQCAGAD0q/zG3j27t3UCpWhMICJyCpqpWPs+gAMAABwANOH82QtZsYDcDEOrLqx9n83MRHYhcAAAMBewCzDna3/FYgBe9N99f3ECt3ztq72My8tQtF2IscQG2AUAAGIAMCylyq8xgR8fuW9Q5TfU6RAbwAEAADGA5YoB5K79TcFHN75gF8KLDcybEyAGAAA4gEVxAEP30c9V/rE7gFpHMG9OAAcAAAvH0uwCqOKb8tp+eF999O06Hnvid60q/9XV91NKKe3Z9825fg42HrveB08cH7WTwwEAAA5gLIrvYbnsmvPetaJ41X0XXn196mtP2ftSfvucUvS6nj/1bEoppf2HDqaUUnru1OkiJxA9V/IJcAAAkMnC7AKUKr4R5cQfvf+BTpyAXq/FBFT5PUVVRW7bAXiKf/HsuazXm8LnOgFDnYDWDBw78dD6/XN2E66L6aQ2nRy7AACAA5gXB1Cr+KUOQJ1AV7EBG48qYukau1bpPWehip87bn0+ptym/Nrr0JyPOQCLDdh15eYPeM+z6fPDAQAADmBoDh4+OrWPbr3yStH99dIqub5iA+oIPrxyJaWU0u69e1td+3vK39b4PMemuyC1XY5L+xuUPj8cAAAsHEuTCRhl1P3lzMtFTkDzBtpSyhnvs5ZSSvtu/VYn96Vr5Veicw723Xbrtk4g97lGz7Gr54cDAAAcQF+YkmgsoLZ6zpxAbWygdeeyoUxHZjqB2kzAvpTf1v6muFGnIHUCtc9z3p4jDgAAcABdoRljFj1vmkPvKUlXuwC5TsB2AZrS9Zpf76NF89WxRSceqSOwvIFc54MjwAEAwNgdwHVKFVXtrWfWpYMz36d2/7xv5Y/Gb06nNBbQl/Ibb55/Yzo2IPv6pY7gwOF7ZzqC3Of71B//zP/9OAAAHMAoiZTLU0qNATR1BFCG3fdbjkxn7unuQK0jMCcQ9S/o2wHhAAAABzAUmkPvKZPnBKyKbWjFsH11LzNw3pyN7l7oGvzkz3+67ggmufxenoA5gqaxAZQfBwAAExb2XABVSq96zjs115RIM9CGcgLReKIOOUOPR/sd6HPQffncjMHIERhPPPZ4o3FSDQgAxAAWDVNEyzS7cnX9+1qNVtsVd6hxbCrksOPJrQXQaswoJlAaGwAcAAAsiwPwos+GrkG9+nNTyqGjx7njiero+xpPaRWgxTD093KdAOAAAAAHkKecUV6AMW/7xvM6Hu35V1r/7xG9nrU/DgAAcABleHkBW3rSnWU8JWv9XOVuC28XILenIA4AAHAAy678jKcd5iVaX9pdGAcAADiAZcUUo/akoWUfj1b3zZsTABwAAOAAtscyzyyHnvHkYXkI+rlk8OEAAAAHMA4WTbH6Hk9tVV+El/G3KDEbHAAA4ABgXGhtwnfu+W4nzsPL+ItqAcgDwAEAAA4gD3YByqg9/bctJ6AKz74/DgAAcAB1sG9dpvzHTjw0yH3T6L85AfsXJ4ADAAAcwHLHAJoqvIeeTKTnDXjnFPTtBAAHAAA4gOWkdG3udfhRjt7/QEppc99/wxlM1t5DOQL6AOAAAAAH0I9izjtdxTTMIfziZ79OKaV07OGfzFTioXL1cQI4AADAAcyHYs6bo/nRk09ORfn/+uijK7NeZ/fD4w9/+n1KabMj0IHD9079XHP1+3YEbeUDRKdSj/X0YBwAAA4AxhIDMOX+5JWLrTiaz6/+a9v39c7qU6wX4FuX3tn2enJP8sl1CpwMhAMAABzAuGIAugbvG1N+I9dRRLGBu++6I8sJ9KXs7ALgAAAABzAfa3clV3mNnd/fX/T7Xkzj2j/enfr66dPPVL2v1/MvWsPb66yHoEEVHw4AAHAAi6n4tvY2Bd5/6ODUz6Mz/p4/9ezU1xfPnlv/j8JTf71c/9JdkNLf19iBdQ821BEouQ6BtT8OAABwAMMqvyq+ocpvXF19f+b3Tel1rR5l6pUy9Ik+6ggswzCC2AEOAABwAM2oVT5Tft1fN+XXDjp6lp6xe+/e6bX9BC9Kn5uz37YTeO7U6az38WIaqvQelmHoOQJ7f2/N7zkqwAEA4AC4BWmmgkRRZG+tHyn/5c8/TSmldPtNNxet9eeFpspvaKagZRA2dQS5nw84AAAcwLIO3NaGtUqh9fNbHIE5iYkT+PLrO9eV/4frvfEu/229Z94N//4ka62fG7sojQVEOfsXXn29FcX3HJdF79t2BKz9cQAAgAOYxqLvFm2PYgFRDECdgHLjt29LKaW0c883UkopffbBxymllHbdfedU7EDzBNqitirP7oMqe1PnFDmBpjECRXdTAAcAABNWxtbLzOvNpoqsa3KrurOovDmA3Nx7rcLzlD+3zt+U/6aJM7Drq40BWHRee/KVKnFfMRSPKKPPcwJevoLFROwcg/OvnVnp4u+SnoAAgAMYygFECuw5AMNb69oa0tbypti5TiDaLfCuM3IC3n68jSNS0tpqOb0vVtPQtxPI7TegdOUEcAAAgAMYOgaQq/zRboBS6wRKsbP57Hp/9dvfZCm/52SaElUnelWNXWfi2XU9eOJ4kQPoygngAAAAB9C3A4jq73PX/HqWnZ5u68UEjLYcgTqAXIfSluJGGXQ2ftsV0Z6GfTkC7zo1MxAHgAMAAIfRZQJGvfY8dM2v+9gWFbd/VWG8+v22YwGbirTuBHIdQKSUngJHa3xF8yH064uvzH7d/nSwVUdgr9frtwzC2szBZQMHAIADGA/evropsTkBW6OvSizg3NuXUkopHbzzrpkKoj835V99758z1/5dE+1WRErqKWWk+N5uR4R3boE6A3MEXTsBA0eAAwAAYWHzADQm8MVH63X3Xj1+VK/vRf1zT/bJPdFHHY7tCrQVXVeljPIbctH77b2Pdy5CX5mETzz2uMRa2oFdAADAAcyLA/CUR5UpUi7vdab8x048lHXdeqJPrlMorWHIdQBtKX/kBCK6dgJ6/+3+tpW5iQMAABzA0A6g1BFECu9Rqvy1SqWOoKkTiJQ/ckiRc2pK205Ax+s5rLacAA4AAHAA8+IASp1AqfLndp2tVTJPwfScgVwnUFrLoOOOqM2PiM5MbBrjUKdW2uEJBwAAOICxOoBap+DtVw+FZiSWVgsangPwFLmtXQ77PO/97fXRuHIdTnTdbTsBHAAA4ADG5gDmVfm96kN1AF4swMM66Dxy/OGZytx0dyOqLvTeXx1A6bisG7Jl+uVmTrblBHAAAIADGLsDsKi3pyBaLdiX4htRHsA9hw5Mfd9641nffO10ZAqYq/y5ux8as/B2T8wZeOc16HhKxxU5OPsczwnkOgIcAACMjoU/GzC3P79mtqkiX/7805TSZrXguUm14O033dzJdWv/Ae/sQF3TmhJaNdyVq82UvPSUXc/J1J7Wq+MxbFx6vkHp59jvm1OwvgVd1QzgAACAGEDXMYDaDECvq7A6ATvd96O33s5yAhsOwvk9XetH+/Rd7ZfXKrUqv40ndxcligXkKnl0XkFuzKI0FkAMAACIAczLmt+o7dijPQU3mHQOihTciDoNRYq/pQrPPs+JCWjXY09pTSFrFd+wXRFzNl6eQsTGGlxqH3JPcGqq/J4TtPu/qLEAHAAADmC8Sm8zc+5+vrem1Fx2U2RV5hvldTt2TRzBrtnOYOdEQT774OOp2IFXT1/bmcdbM1v0fCNafrad+7+h/OJsbhflLz2Dcehx5f694QAAAAcwFKXKb3gn5Xh1416MQBU7tytu9HNvXPq6TyYxgNJoebSG9tbm3lpZnc2qdC6qdQJtjcvN56jM39DnMnZHgAMAwAGMHy+Tz2Z8zd3X6HdTR+CdEVirGFHmYoSeduwpY7Rf7zkD7w/HO5HJU+RScselaCbnZcnk1MzLyKERAwAAHEDf5Cqhl7vvVfHVOoIoZ7ypYngxDu2kc2zf7Go+q5rzagKiNbo6A6+jkO6be/kKXmZl6Zo8d1wbf+iTvAtTfotZXJ5kcu5YMuXHAQDAAp4OPPn+l5OzAC1K7a0Rvai0OoJo7dr2PrGdCaiZjFFHHf251csrXuZiFK3fkrE3ue+ecqpTMEfgZkg6z0EdWem47Dp2ynWaE8j9e8MBAAAOYN4cgToBVaSN3HtZa0aOwKtyq+2D7ym9EnXoUYdia+s3z7+x/rVzOm6kzLk5/F79vOHlR+jvmUOzjMprUiNRSlvPZdGVHwcAAIvfEUiVIYpKa3VbW9QqfaT86lzUsZRGy3NjAXr/LAMwyo/w0AzH6PNLxxVdhzrJRc39xwEAwOI4gNy8AN0l0LWvF5XOzRQzpeha6SNqq+68DD6vC3LTjD5FYwXROLxdgFLnoQq/LGt/HAAALM4uQK5T2KIM8rXmDURRf1X+0tNtm3bk6SpWcnmSRxF1QW57V0Tx7p8XAyjtp+A5SHYBAAAHsCiUVtd5nXu0R5wpv62ZNXrdlcJ7a/DS+vktPQcn47XxqyPylD9SXq0V8Nb+bZPbE9KwXQx2AQAAB7DsjsCL9ucqdG1UPlfxI7xouafY3vctk3J18q+u+VVpczMDu1b+0piM9n1YdCeAAwDAAUDpDG/KULrGLFV6rZfXarfSPvi1mKLryUlG1EGp7V0Cz9l4naFyYzLaA9EyHOkKDAA4gGWl9qzB2jW918Nuh3NacOl+eSmq/FFmY9eOIMoD+ETuTxSTyY2xbPN3MEpngAMAwAEsL17uvnH+tTMrs9Z+h0/+ci1HwVMgLF4HG1P63BOF2kY/x5Q/90zB0i7LpY4gigF4tQ1t1TBsiQWcPEkMAABwAKNS/hdfemFbZXnkeFq73gnoGlC73+aeBuwpX+3ZgE0VzMYVKX8unkMwZxA5gtoYgHd/vT4Q0S6LPh92AQAAB7Doyh8ppzoB2yf/aNJnXnPovTVuad36Rv6BKFrpWjnimrN2bprZ6J2/oOcc1OJlHOr912pH3WXpy4nhAAAAB9A3kTKeP3uhSHEM7TOv0fvaTjX6/Wj3InetXJrfkHuuQtNYQVOi2gOtdlzW8wFwAAA4gOVZ+0cZbJHye6f9RkoanTnXVa555HS8cxVyz/Zr2xG0Na7ovpdCLQAA4ADGjq05n1s9nVIq76CTewpwaa+5tpVl9d33tv261AmkSkdg++zeqcylmXnRuEo7Py3bmh8HAADL6wD6ouu1vedsSh1NthOQHHvPERiaEel1Fe5qXF6sptah4QAAAAcwdtru1Tf0WjIaT7T2j5TT8Lr5aqegDQcwybTzugpvuU7JwW86rui+L5vS4wAAYHkcgCpZ09590ZpyUcZTetKS5xC8DMlV57pvdDodje054QAAAAcwlDKW4kWZNUddc/n7iiKXjq/peHKvv3S/3dtFUMfgVTmWjkuvCyeAAwAAYWVtbW1cF7yykqWU2sVWO9qU7gZcPHtuSsFqTwyqVX4dj2Xg2fW3PZ7ccdU6MHUgFtPoelxdOYGx/X+EAwCA8TuAqJedKoqha8l9t92aUkpp757dKaXNqkBdY3alMJ6SRspfOh5dO7flBGodgqf88z4uHAAA4AD65shTT2VFm1UxjUhhjNMv/z2ltFnFtnFW3CRjLermW7ufruPwHE3X42k6rtxxqgPQcZ17+1JKKaXj9/1g5vuqQyt9Tm05ARwAAOAAhooB5DqBqD7dFMfr69/1mtKL/kdOwBtX7njaVvym4/LORnTHJ339+xoXDgAAcABDOYBcJ/CF0wdeT+yxOnbLXbc+/zt27exU+UvHcy3zJKJoPH0pZGmsI3oexpa+/j0/JxwAAOAAhnYAkdJ4qAI17SLbdy2Ad95AdA6B9/Our9/rohydeqydiWqfEw4ABwAAyxID6Iquq8uiasOux9tX9dyijAMHAAA4gKFjALVr0Nzvz1tdeVOnMC/jadq/f+hOQDgAAMABAAAOAACYAACACQAAmAAAgAkAAJgAAIAJAACYAACACQAAmAAAgAkAAJgAAIAJAACYAACACQAAmAAAgAkAAJgAAIAJAACYAACACQAAmAAAgAkAAJgAAIAJAIAJAACYAACACQAAmAAAgAkAAJgAAGAB+T8Gf/+Bi1DOmgAAAABJRU5ErkJggg==',
  cloud:       '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',
  rock:        'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADKElEQVR42u2au2sUURTGvxFRiBZR0IhrLCIBC9nGRxwQC4OdIMaof4CNjyppE0iU2GZJkVqwEBQfKDYiioiwBrWRYBNMkexqNhEfoII2Y7E50XvYm3vmua5zTpfMTHZyv9/9zvku6wVBgDzXGuS81toueJ6XyQvsP3ikIYIvXzxJ5AVchCsBWX8gV/zipSsN75scGQqSJEEJsG112x5JygO44pevXgMA1ObmRc9PjgzF8gT1gGZ5AClPilNJldc5oFUJSEr5x7fvAAB2F/eubOc0uoISkNYffvO8DAAoHvIBAB07O0XPPbpxy/j509KCekBLT4JcUU2Dec8Crlp6X1UC/gsCatWqoeiW7QWR8tz1T527YGQCJeBfT4M0CVLOp4mOipPAlSfFk0qHmgbTJiBs3udE9J7si/TiUhKUgLQIIOX7z543Zv6sc7+LBCUgqznAlf6SJkKaLnUOyHoSpPR39Ez/qoqFJYKev16aSPScQAnI6hzARYSrSHnNAs0mgM/6tblKJCKiVtJnhEpAVOV57u8oFFpyAZQAqfK2lFf0e+qTYHnKIIHIiFtpnxRpGrSlpQN+byDJ9ytZYJkArpzrLJDfb3P9qCdFmgalBFD+PzE+HgBA5eYDAMC6XV0AgOHhUREJ/MQnbr93KR/3fEAJoBXpK5WMpVl8/RYA0H38MABg5t6zUCRkVbaUuPih7ik7Th8DANwdHPSUAMkc8G1+wVDetfLNIoErbyv6f8jbAHhKQJw0KP3mR1pngKT47PfPAICuDZtipUQlwHahWp4GABT8PauScP/pQ+P31CXiegQniyvPu1M7da9l92/39wEANnZuM7oABgaUANEkSO7J60v5lTEhciV6uuvETM1MNyRDWjZ35wRQ0ee3bd1sKE+lc0BYD6AV5CTQ3rJ5Ay9Samxs1CDEVdzlXeVSXruA1AOo/pqcGpJABNDe+/VuFsCf7/a69qpNWavL//hpelHbeuO+r5WPIuXVA6QESEmwdQkq3i04CUSO9D7uRWH3vBIQloC4RHDP4JOm7T7bdd6lXIorAUkT4CIiqwqrvBLgIiCvlXsCfgMtgdXp0IEEBgAAAABJRU5ErkJggg==',
};
const _AD = {
  treeFW:74, treeFH:76, treeN:6,
  rocksFW:48, rocksFH:88, rocksN:4,
  cloudFW:48, cloudFH:49, cloudN:4,
  statueFW:108, statueFH:65, statueN:4,
};

// Inject animation CSS once
(function(){
  if(document.getElementById('isle-anim-css')) return;
  let s=document.createElement('style'); s.id='isle-anim-css';
  s.textContent=`
    @keyframes isle-sprite { to { background-position-x: calc(-100% - 0px); } }
    .isle-spr { image-rendering: pixelated; background-repeat: no-repeat;
                background-size: 100% 100%; position:absolute; }
    .isle-body { image-rendering: pixelated; display:block; }
  `;
  document.head.appendChild(s);
})();

function mkSpr(sheet, fw, fh, n, dispW, dispH, fps, style=''){
  // Creates an animated sprite div using CSS background-position steps
  let totalW = fw*n;
  let dur = (n/fps).toFixed(2);
  // background-size: totalW/fw * dispW = n*dispW wide, dispH tall
  let bsW = n*dispW, bsH = dispH;
  return `<div class="isle-spr" style="width:${dispW}px;height:${dispH}px;`
    +`background-image:url('${sheet}');`
    +`background-size:${bsW}px ${bsH}px;`
    +`background-position:0 0;`
    +`animation:isle-sprite ${dur}s steps(${n},end) infinite;`
    +`${style}"></div>`;
}

function svgIsle(cfg){
  let {w=180, dec='tree', decW=80, decH=88, decOffX=0, decOffY=0, badgeHtml='', id=''}=cfg;
  let cx=w/2;
  let bodyH = Math.round(w*0.62);
  let rimY   = Math.round(bodyH*0.21); // teal pool rim from top
  let totalH = bodyH + Math.round(w*0.14);

  // Decoration sprite positioned above rim
  let decX = Math.round((w-decW)/2)+decOffX;
  let decY = rimY - decH + decOffY;

  // Animated tree (Lernen island)
  let decEl = '';
  if(dec==='tree'){
    let dw=Math.round(w*0.54), dh=Math.round(dw*(_AD.treeFH/_AD.treeFW));
    let dx=Math.round((w-dw)/2)+decOffX, dy=rimY-dh+decOffY+4;
    decEl=mkSpr(_A.treeSheet,_AD.treeFW,_AD.treeFH,_AD.treeN,dw,dh,8,
      `left:${dx}px;top:${dy}px;`);
  } else if(dec==='statue'){
    // Animated statue for Gemeinschaft
    let dw=Math.round(w*0.58), dh=Math.round(dw*(_AD.statueFH/_AD.statueFW));
    let dx=Math.round((w-dw)/2)+decOffX, dy=rimY-dh+decOffY+6;
    decEl=mkSpr(_A.statueSheet,_AD.statueFW,_AD.statueFH,_AD.statueN,dw,dh,4,
      `left:${dx}px;top:${dy}px;`);
  } else if(dec==='flower'){
    let dw=decW, dh=decH;
    let dx=Math.round((w-dw)/2)+decOffX, dy=rimY-dh+decOffY;
    decEl=`<div class="isle-spr" style="width:${dw}px;height:${dh}px;left:${dx}px;top:${dy}px;`
      +`background-image:url('${_A.flower}');background-size:100% 100%;"></div>`;
  } else if(dec==='crystal'){
    let dw=decW, dh=decH;
    let dx=Math.round((w-dw)/2)+decOffX, dy=rimY-dh+decOffY;
    decEl=`<div class="isle-spr" style="width:${dw}px;height:${dh}px;left:${dx}px;top:${dy}px;`
      +`background-image:url('${_A.crystal}');background-size:100% 100%;"></div>`;
  } else if(dec==='ruins'){
    let dw=decW, dh=decH;
    let dx=Math.round((w-dw)/2)+decOffX, dy=rimY-dh+decOffY;
    decEl=`<div class="isle-spr" style="width:${dw}px;height:${dh}px;left:${dx}px;top:${dy}px;`
      +`background-image:url('${_A.ruins}');background-size:100% 100%;"></div>`;
  }

  // Animated flying rocks beside island
  let rkW=Math.round(w*0.14), rkH=Math.round(rkW*(_AD.rocksFH/_AD.rocksFW));
  let rocks=mkSpr(_A.rocksSheet,_AD.rocksFW,_AD.rocksFH,_AD.rocksN,rkW,rkH,6,
    `left:${Math.round(w*0.01)}px;top:${Math.round(bodyH*0.28)}px;opacity:0.75;`);

  // Animated cloud below island
  let clW=Math.round(w*0.55), clH=Math.round(clW*(_AD.cloudFH/_AD.cloudFW));
  let cloudEl=mkSpr(_A.cloudSheet,_AD.cloudFW,_AD.cloudFH,_AD.cloudN,clW,clH,4,
    `left:${Math.round((w-clW)/2)}px;top:${Math.round(bodyH-clH*0.3)}px;opacity:0.50;`);

  // SVG for the island body only
  let svg=`<svg viewBox="0 0 ${w} ${totalH}" width="${w}" height="${totalH}"
      xmlns="http://www.w3.org/2000/svg"
      style="display:block;overflow:visible;image-rendering:pixelated">
    <image href="${_A.body}" x="0" y="0" width="${w}" height="${bodyH}"
           preserveAspectRatio="none" style="image-rendering:pixelated"/>
    <ellipse cx="${cx}" cy="${totalH-3}" rx="${w*0.28}" ry="3.5" fill="rgba(0,0,0,0.10)"/>
  </svg>`;

  return `<div style="position:relative;width:${w}px;height:${totalH}px;display:inline-block">`
    + badgeHtml + svg + decEl + rocks + cloudEl
    + `</div>`;
}function rMap(){
  let c=document.getElementById('content');
  if(!c)return;
  let all=aw(),due=all.filter(w=>s2due(w.de)).length;
  let knownC=all.filter(w=>known.has(w.de)).length;
  let store=getBPStore();
  let weekBP=Math.max(0,(store.delta||0)+Math.floor((store.weeklyCorrect||0)/5));
  let greeting=getGreeting();
  let name=CP?.display_name||'';

  let lernen  = svgIsle({w:196, dec:'tree',    decOffY:-2,
    badgeHtml:due>0?`<div class="isle-badge" style="position:absolute;top:-8px;right:-4px;z-index:10">${due} due</div>`:''});
  let woerter = svgIsle({w:155, dec:'flower',  decW:58,  decH:64,  decOffY:-2});
  let gemein  = svgIsle({w:158, dec:'statue',  decOffY:-2});
  let planen  = svgIsle({w:130, dec:'crystal', decW:50,  decH:60,  decOffY:-2});

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