(() => {
  const cfg = window.ANNAI_CONFIG || {};
  const configured = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const db = configured ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  $('#year').textContent = new Date().getFullYear();
  $('#menuToggle').addEventListener('click', () => $('#nav').classList.toggle('open'));
  $$('#nav a').forEach(a => a.addEventListener('click', () => $('#nav').classList.remove('open')));
  const modal = $('#loginModal');
  $('#loginOpen').addEventListener('click', () => { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); });
  $('#loginClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  function closeModal(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
  function toast(msg){ const el=$('#toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),4200); }
  function status(form,msg,error=false){ const el=$('.form-status',form); if(el){el.textContent=msg;el.style.color=error?'#b42318':'#17652c';} }
  function values(form){return Object.fromEntries(new FormData(form).entries());}
  async function submitRequest(form, table, requiredFields){
    form.addEventListener('submit', async e=>{
      e.preventDefault(); const data=values(form);
      if(!configured){
        const key='annai_demo_'+table; const arr=JSON.parse(localStorage.getItem(key)||'[]');
        arr.push({...data, created_at:new Date().toISOString(), demo:true}); localStorage.setItem(key,JSON.stringify(arr));
        status(form,'Demo பதிவு சேமிக்கப்பட்டது (இந்த browser-ல் மட்டும்). நிரந்தரப் பதிவுக்கு Supabase இணைக்கவும்.'); form.reset(); return;
      }
      const {error}=await db.from(table).insert(data);
      if(error){status(form,'பதிவு அனுப்ப முடியவில்லை: '+error.message,true);return;}
      status(form,'நன்றி! உங்கள் பதிவு வெற்றிகரமாக அனுப்பப்பட்டது.'); form.reset(); toast('உங்கள் பதிவு அனுப்பப்பட்டது.');
    });
  }
  submitRequest($('#memberForm'),'membership_applications');
  submitRequest($('#volunteerForm'),'volunteer_applications');
  submitRequest($('#donationForm'),'donation_enquiries');
  submitRequest($('#scholarshipForm'),'scholarship_applications');
  $('#signupForm').addEventListener('submit',async e=>{
    e.preventDefault(); const f=e.currentTarget,d=values(f);
    if(!configured){status(f,'கணக்கு உருவாக்குவதற்கு முன் config.js-ல் Supabase அமைக்கவும்.',true);return;}
    const {data,error}=await db.auth.signUp({email:d.email,password:d.password,options:{data:{full_name:d.full_name}}});
    if(error){status(f,error.message,true);return;}
    status(f,'கணக்கு உருவாக்கப்பட்டது. மின்னஞ்சல் சரிபார்ப்பு தேவைப்படலாம்.'); f.reset();
    if(data.session) await showDashboard(data.session.user);
  });
  $('#loginForm').addEventListener('submit',async e=>{
    e.preventDefault(); const f=e.currentTarget,d=values(f);
    if(!configured){status(f,'உள்நுழைவுக்கு முன் Supabase அமைப்பை முடிக்கவும்.',true);return;}
    const {data,error}=await db.auth.signInWithPassword({email:d.email,password:d.password});
    if(error){status(f,error.message,true);return;}
    status(f,'உள்நுழைவு வெற்றி.'); closeModal(); await showDashboard(data.user);
  });
  async function showDashboard(user){
    $('#dashboard').hidden=false;
    $('#accountInfo').textContent='உள்நுழைந்த கணக்கு: '+(user.email||'உறுப்பினர்');
    const {data:roleRows}=await db.from('user_roles').select('role').eq('user_id',user.id);
    const isAdmin=(roleRows||[]).some(r=>r.role==='admin');
    $('#adminPanel').hidden=!isAdmin; $('#memberPanel').hidden=isAdmin;
    $('#dashboard').scrollIntoView({behavior:'smooth'});
    if(isAdmin) loadAdminData();
  }
  async function loadAdminData(){
    const box=$('#adminData'); box.textContent='பதிவுகள் ஏற்றப்படுகின்றன…';
    const tables=['membership_applications','volunteer_applications','donation_enquiries','scholarship_applications'];
    let html='';
    for(const t of tables){
      const {data,error}=await db.from(t).select('*').order('created_at',{ascending:false}).limit(50);
      html+=`<h4>${t.replaceAll('_',' ')}</h4>`;
      if(error){html+=`<p>தரவைப் பெற முடியவில்லை: ${escapeHtml(error.message)}</p>`;continue;}
      if(!data.length){html+='<p>இன்னும் பதிவுகள் இல்லை.</p>';continue;}
      const cols=Object.keys(data[0]).filter(k=>k!=='id');
      html+='<table><thead><tr>'+cols.map(c=>`<th>${escapeHtml(c)}</th>`).join('')+'</tr></thead><tbody>';
      html+=data.map(row=>'<tr>'+cols.map(c=>`<td>${escapeHtml(String(row[c]??''))}</td>`).join('')+'</tr>').join('');
      html+='</tbody></table>';
    }
    box.innerHTML=html;
  }
  function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  $('#refreshAdmin').addEventListener('click',loadAdminData);
  $('#logoutBtn').addEventListener('click',async()=>{if(db) await db.auth.signOut();$('#dashboard').hidden=true;toast('வெளியேறிவிட்டீர்கள்.');});
  if(db){
    db.auth.getSession().then(({data})=>{if(data.session)showDashboard(data.session.user);});
    db.auth.onAuthStateChange((_event,session)=>{if(!session)$('#dashboard').hidden=true;});
  }
})();