function switchAuth(t){
  ['login','signup','forgot'].forEach(x=>{
    let f=document.getElementById(x+'-form');
    if(f)f.style.display=x===t?'block':'none';
  });
  // Auth tabs only visible on login/signup, not forgot
  let tabsEl=document.querySelector('.auth-tabs');
  if(tabsEl)tabsEl.style.display=t==='forgot'?'none':'flex';
  ['login','signup'].forEach(x=>{
    let tab=document.getElementById('tab-'+x);
    if(tab)tab.className='auth-tab'+(x===t?' active':'');
  });
  document.getElementById('auth-err').textContent='';
  document.getElementById('auth-err').style.color='';
}
function togglePass(id,btn){
  let inp=document.getElementById(id);
  let show=inp.type==='password';
  inp.type=show?'text':'password';
  btn.textContent=show?'🙈':'👁';
}
async function doForgotPassword(){
  let e=document.getElementById('fp-email').value.trim();
  if(!e){document.getElementById('auth-err').textContent='Enter your email.';return;}
  let btn=document.getElementById('fp-btn');btn.disabled=true;btn.textContent='Sending...';
  let{error}=await sb.auth.resetPasswordForEmail(e,{redirectTo:window.location.href});
  btn.disabled=false;btn.textContent='Send reset link';
  if(error){document.getElementById('auth-err').textContent=error.message;return;}
  document.getElementById('auth-err').style.color='var(--green)';
  document.getElementById('auth-err').textContent='✓ Reset link sent! Check your email.';
}
async function doGoogleSignIn(){
  let{error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.href}});
  if(error){document.getElementById('auth-err').textContent=error.message;}
}
async function doLogin(){
  let e=document.getElementById('li-email').value.trim(),p=document.getElementById('li-pass').value;
  if(!e||!p){document.getElementById('auth-err').textContent='Please fill in all fields.';return;}
  let btn=document.getElementById('li-btn');btn.disabled=true;btn.textContent='Signing in...';
  document.getElementById('auth-err').style.color='var(--green)';
  document.getElementById('auth-err').textContent='✓ Logging in...';
  let{data,error}=await sb.auth.signInWithPassword({email:e,password:p});
  if(error){
    btn.disabled=false;btn.textContent='Sign in';
    document.getElementById('auth-err').style.color='';
    document.getElementById('auth-err').textContent=error.message;
    return;
  }
  // Don't call handleSession here — onAuthStateChange will fire and handle it
}
async function doSignup(){
  let name=document.getElementById('su-name').value.trim(),e=document.getElementById('su-email').value.trim(),p=document.getElementById('su-pass').value,role=document.getElementById('su-role').value;
  if(!name||!e||!p){document.getElementById('auth-err').textContent='Please fill in all fields.';return;}
  if(p.length<6){document.getElementById('auth-err').textContent='Password must be at least 6 characters.';return;}
  let btn=document.getElementById('su-btn');btn.disabled=true;btn.textContent='Creating account...';
  let{data,error}=await sb.auth.signUp({email:e,password:p});
  if(error){btn.disabled=false;btn.textContent='Create account';document.getElementById('auth-err').textContent=error.message;return;}
  if(data.user)await sbUpsert('profiles',{id:data.user.id,email:e,display_name:name,role});
  btn.disabled=false;btn.textContent='Create account';
  document.getElementById('auth-err').textContent='Account created! Sign in now.';
  switchAuth('login');
}
async function doSignout(){
  await sb.auth.signOut();
  known=new Set();sm2Cache={};streakN=0;lastStudy=null;xpTotal=0;sessionXP=0;CU=null;CP=null;
  document.getElementById('auth-screen').style.display='flex';
  document.getElementById('main-app').style.display='none';
  document.getElementById('teacher-app').style.display='none';
}

async function handleSession(session){
  try{
    if(session?.user){
      CU=session.user;
      authToken=session.access_token||null;
      if(selCats.size===0)selCats=new Set(Object.keys(DATA));
      // Fetch profile with timeout so it never hangs forever
      let p=null;
      try{
        let profilePromise=sbFetch('profiles','id=eq.'+CU.id+'&limit=1');
        let timeoutPromise=new Promise(r=>setTimeout(()=>r(null),2000));
        let res=await Promise.race([profilePromise,timeoutPromise]);
        p=Array.isArray(res)?res[0]:null;
      }catch(e){console.warn('Profile fetch failed:',e);}
      CP=p;
      if(p?.role==='teacher'){
        document.getElementById('loading-screen').style.display='none';
        document.getElementById('auth-screen').style.display='none';
        document.getElementById('main-app').style.display='none';
        document.getElementById('teacher-app').style.display='block';
        loadTeacher();
      }else{
        document.getElementById('loading-screen').style.display='none';
        document.getElementById('auth-screen').style.display='none';
        document.getElementById('main-app').style.display='block';
        document.getElementById('teacher-app').style.display='none';
        let ub=document.getElementById('user-btn');if(ub)ub.textContent=CP?.display_name||CU.email;
        loadProg();
      }
    }else{
      document.getElementById('loading-screen').style.display='none';
      document.getElementById('auth-screen').style.display='flex';
      document.getElementById('main-app').style.display='none';
      document.getElementById('teacher-app').style.display='none';
    }
  }catch(err){
    console.error('Auth error:',err);
    document.getElementById('loading-screen').style.display='none';
    document.getElementById('auth-screen').style.display='flex';
    document.getElementById('main-app').style.display='none';
    document.getElementById('teacher-app').style.display='none';
  }
}

// ── PASSWORD RESET HANDLER ────────────────────────────
// Supabase redirects back with #access_token=...&type=recovery
(function checkResetToken(){
  let hash=window.location.hash;
  if(hash.includes('type=recovery')){
    // Show reset password form instead of normal login
    document.addEventListener('DOMContentLoaded',()=>{
      let authCard=document.querySelector('.auth-card');
      if(!authCard)return;
      authCard.innerHTML=`
        <div class="auth-logo">🇩🇪</div>
        <div class="auth-title">Set New Password</div>
        <div class="auth-sub">Choose a new password for your account</div>
        <div class="field" style="margin-top:20px">
          <label>New Password (min 6 chars)</label>
          <div class="pass-wrap"><input type="password" id="np-pass" placeholder="••••••••"><button class="eye-btn" onclick="togglePass('np-pass',this)" tabindex="-1">👁</button></div>
        </div>
        <button class="auth-btn" id="np-btn" onclick="doSetNewPassword()">Set New Password</button>
        <div class="auth-err" id="auth-err"></div>
      `;
      document.getElementById('auth-screen').style.display='flex';
      document.getElementById('loading-screen').style.display='none';
    });
  }
})();

async function doSetNewPassword(){
  let p=document.getElementById('np-pass').value;
  if(!p||p.length<6){document.getElementById('auth-err').textContent='Password must be at least 6 characters.';return;}
  let btn=document.getElementById('np-btn');btn.disabled=true;btn.textContent='Saving...';
  let{error}=await sb.auth.updateUser({password:p});
  if(error){btn.disabled=false;btn.textContent='Set New Password';document.getElementById('auth-err').textContent=error.message;return;}
  document.getElementById('auth-err').style.color='var(--green)';
  document.getElementById('auth-err').textContent='✓ Password updated! Signing you in...';
  // Clear hash and let onAuthStateChange log them in
  window.history.replaceState(null,'',window.location.pathname);
}
// Add timeout fallback in case getSession hangs
// Initial session check with fallback timeout
let initialCheckDone=false;
setTimeout(()=>{
  if(!initialCheckDone){
    initialCheckDone=true;
    document.getElementById('loading-screen').style.display='none';
    document.getElementById('auth-screen').style.display='flex';
  }
},3000);

// Always handle auth state changes (login, logout, token refresh)
sb.auth.onAuthStateChange((_ev,session)=>{
  initialCheckDone=true;
  handleSession(session);
});

// Also check immediately on load
sb.auth.getSession().then(({data:{session}})=>{
  initialCheckDone=true;
  handleSession(session);
}).catch(()=>{
  initialCheckDone=true;
  document.getElementById('loading-screen').style.display='none';
  document.getElementById('auth-screen').style.display='flex';
});

// ── DAILY SUMMARY ─────────────────────────────────────
let summaryShown=false;
function maybeShowSummary(){
  if(summaryShown||sessionReviewed<5)return;
  summaryShown=true;
  let pct=sessionReviewed?Math.round(sessionCorrect/sessionReviewed*100):0;
  let lvl=getLevelInfo(xpTotal);
  document.getElementById('sum-emoji').textContent=pct>=80?'🎉':pct>=60?'👍':'💪';
  document.getElementById('sum-title').textContent='Session Summary';
  document.getElementById('sum-sub').textContent='Nice work! Here\'s what you achieved:';
  document.getElementById('sum-stats').innerHTML=`
    <div class="sum-stat"><div class="sum-stat-n">${sessionReviewed}</div><div class="sum-stat-l">reviewed</div></div>
    <div class="sum-stat"><div class="sum-stat-n">${pct}%</div><div class="sum-stat-l">accuracy</div></div>
    <div class="sum-stat"><div class="sum-stat-n">+${sessionXP}</div><div class="sum-stat-l">XP earned</div></div>
    <div class="sum-stat"><div class="sum-stat-n">${streakN}🔥</div><div class="sum-stat-l">day streak</div></div>
  `;
  document.getElementById('summary-overlay').style.display='flex';
}
function closeSummary(){document.getElementById('summary-overlay').style.display='none';summaryShown=false;}

// ── HELPERS ───────────────────────────────────────────