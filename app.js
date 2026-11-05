(() => {
  "use strict";
  const cfg = window.ANNAI_CONFIG || {};
  const configured = cfg.supabaseUrl && cfg.supabaseAnonKey &&
    cfg.supabaseUrl.startsWith("https://") && !cfg.supabaseUrl.includes("PASTE_") &&
    !cfg.supabaseAnonKey.includes("PASTE_");
  const db = configured && window.supabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
  let currentUser = null, currentProfile = null, authMode = "login", activeDash = "overview";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast = msg => { const el=$("#toast"); el.textContent=msg; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),3800); };
  const setStatus = (form, msg, error=false) => { const el=$(".form-status",form); if(el){el.textContent=msg;el.classList.toggle("error",!!error);} };
  const formData = form => Object.fromEntries(new FormData(form).entries());
  const openModal = id => { const el=$("#"+id); el.classList.add("open"); el.setAttribute("aria-hidden","false"); };
  const closeModal = id => { const el=$("#"+id); el.classList.remove("open"); el.setAttribute("aria-hidden","true"); };
  const safeDate = v => { if(!v) return "Date to be announced"; const d=new Date(v); return isNaN(d) ? esc(v) : d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}); };
  $("#year").textContent = new Date().getFullYear();

  $("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
  $$("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));
  ["openLogin","footerLogin"].forEach(id=>$("#"+id).addEventListener("click",()=>openModal("authModal")));
  $("#openEventInterest").addEventListener("click",()=>openModal("eventModal"));
  $$("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
  $$(".modal-backdrop").forEach(b=>b.addEventListener("click",e=>{if(e.target===b)closeModal(b.id)}));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")$$(".modal-backdrop.open").forEach(m=>closeModal(m.id));});

  function needConfig() {
    if(!db){toast("Website demo mode: add your Supabase URL and anon key in config.js, then reload.");return false;}
    return true;
  }
  async function saveSubmission(table, payload, form) {
    if(!needConfig()){setStatus(form,"Setup required: add Supabase settings in config.js before using live forms.",true);return;}
    const {error}=await db.from(table).insert(payload);
    if(error){console.error(error);setStatus(form,"Could not submit. Check database setup or try again later.",true);return;}
    form.reset();setStatus(form,"Thank you! Your submission has been received.");toast("Submission received successfully.");
  }
  $("#donationForm").addEventListener("submit", async e=>{e.preventDefault();const d=formData(e.currentTarget);await saveSubmission("donation_pledges",{full_name:d.full_name,phone:d.phone,email:d.email||null,amount:d.amount,purpose:d.purpose,status:"new"},e.currentTarget);});
  $("#volunteerForm").addEventListener("submit", async e=>{e.preventDefault();const d=formData(e.currentTarget);await saveSubmission("volunteer_applications",{full_name:d.full_name,age:Number(d.age),phone:d.phone,email:d.email||null,interest:d.interest,message:d.message||null,status:"new"},e.currentTarget);});
  $("#scholarshipForm").addEventListener("submit", async e=>{e.preventDefault();const d=formData(e.currentTarget);await saveSubmission("scholarship_requests",{full_name:d.full_name,phone:d.phone,course:d.course,support_type:d.support_type,message:d.message||null,status:"new"},e.currentTarget);});
  $("#contactForm").addEventListener("submit", async e=>{e.preventDefault();const d=formData(e.currentTarget);await saveSubmission("contact_messages",{full_name:d.full_name,phone:d.phone,email:d.email||null,topic:d.topic,message:d.message,status:"new"},e.currentTarget);});
  $("#eventInterestForm").addEventListener("submit", async e=>{e.preventDefault();const d=formData(e.currentTarget);await saveSubmission("event_interests",{full_name:d.full_name,phone:d.phone,event_name:d.event_name,message:d.message||null,status:"new"},e.currentTarget);if(!$(".form-status",e.currentTarget).classList.contains("error"))setTimeout(()=>closeModal("eventModal"),1400);});

  function switchAuth(mode){
    authMode=mode; $$(".auth-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.authTab===mode));
    $("#signupFields").hidden=mode!=="signup"; $("#passwordLabel").hidden=mode==="reset";
    $("#authTitle").textContent=mode==="login"?"Welcome back":mode==="signup"?"Become a member":"Reset your password";
    $("#authSubmit").textContent=mode==="login"?"Login":mode==="signup"?"Create member account":"Send reset link";
    const pass=$("#authForm [name=password]");pass.required=mode!=="reset";pass.autocomplete=mode==="signup"?"new-password":"current-password";
    $("#authForm .form-status").textContent="";
  }
  $$(".auth-tabs button").forEach(b=>b.addEventListener("click",()=>switchAuth(b.dataset.authTab)));
  $("#authForm").addEventListener("submit",async e=>{
    e.preventDefault();if(!needConfig())return;
    const form=e.currentTarget,d=formData(form);setStatus(form,"Please wait…");
    let result;
    if(authMode==="signup"){
      if(!d.full_name||!d.phone){setStatus(form,"Enter your name and mobile number.",true);return;}
      result=await db.auth.signUp({email:d.email,password:d.password,options:{data:{full_name:d.full_name,phone:d.phone}}});
      if(!result.error){setStatus(form,"Account created. Check your email to confirm your address. If confirmation is disabled, you may be signed in automatically.");if(result.data.session){currentUser=result.data.user;await ensureProfile(d.full_name,d.phone);closeModal("authModal");await showDashboard();}}
    } else if(authMode==="login"){
      result=await db.auth.signInWithPassword({email:d.email,password:d.password});
      if(!result.error){currentUser=result.data.user;await loadProfile();closeModal("authModal");await showDashboard();}
    } else {
      result=await db.auth.resetPasswordForEmail(d.email,{redirectTo:location.origin+location.pathname});
      if(!result.error)setStatus(form,"If the email is registered, a password reset link has been sent.");
    }
    if(result?.error)setStatus(form,result.error.message,true);
  });
  async function ensureProfile(name,phone){
    if(!currentUser)return;
    await db.from("profiles").upsert({id:currentUser.id,full_name:name||currentUser.user_metadata?.full_name||"",phone:phone||currentUser.user_metadata?.phone||"",email:currentUser.email},{onConflict:"id",ignoreDuplicates:true});
    await loadProfile();
  }
  async function loadProfile(){
    if(!currentUser)return;
    let {data}=await db.from("profiles").select("*").eq("id",currentUser.id).maybeSingle();
    if(!data){await ensureProfile(currentUser.user_metadata?.full_name,currentUser.user_metadata?.phone);return;}
    currentProfile=data;
  }
  async function refreshAuth(){
    if(!db)return;
    const {data}=await db.auth.getSession();if(data.session){currentUser=data.session.user;await loadProfile();}
  }
  async function showDashboard(){
    if(!currentUser)return;$("#dashboard").hidden=false;document.body.style.overflow="hidden";
    $("#dashboardHeading").textContent=currentProfile?.role==="admin"?"Admin control centre":"Member dashboard";
    $("#adminTab").hidden=currentProfile?.role!=="admin";
    activeDash="overview";$$("[data-dash]").forEach(b=>b.classList.toggle("active",b.dataset.dash===activeDash));await renderDash();
  }
  function hideDashboard(){ $("#dashboard").hidden=true;document.body.style.overflow=""; }
  $("#logoutBtn").addEventListener("click",async()=>{if(db)await db.auth.signOut();currentUser=null;currentProfile=null;hideDashboard();toast("You have logged out.");});
  $$("[data-dash]").forEach(b=>b.addEventListener("click",async()=>{if(b.dataset.dash==="admin"&&currentProfile?.role!=="admin")return;activeDash=b.dataset.dash;$$("[data-dash]").forEach(x=>x.classList.toggle("active",x===b));await renderDash();}));

  async function renderDash(){
    const root=$("#dashContent");root.innerHTML='<div class="dash-panel"><p>Loading…</p></div>';
    if(activeDash==="profile"){renderProfile(root);return;}
    if(activeDash==="submissions"){await renderSubmissions(root);return;}
    if(activeDash==="admin"&&currentProfile?.role==="admin"){await renderAdmin(root);return;}
    let counts={};
    if(db&&currentProfile?.role==="admin"){
      for(const t of ["profiles","donation_pledges","volunteer_applications","events","contact_messages"]){const r=await db.from(t).select("id",{count:"exact",head:true});counts[t]=r.count||0;}
    }
    root.innerHTML=`<div class="dash-panel"><h3>Hello, ${esc(currentProfile?.full_name||currentUser?.email||"Member")} 👋</h3><p style="color:#706a7b;font-size:13px">Welcome to your Annai Women's Charitable Trust portal. Keep your contact details current and use the requests section to follow up with the trust team.</p></div>
    <div class="stats-grid"><div class="stat-card"><strong>${currentProfile?.role==="admin"?(counts.profiles||0):"✓"}</strong><span>${currentProfile?.role==="admin"?"Registered accounts":"Member access"}</span></div><div class="stat-card"><strong>${currentProfile?.role==="admin"?(counts.donation_pledges||0):"♡"}</strong><span>${currentProfile?.role==="admin"?"Donation pledges":"Support our mission"}</span></div><div class="stat-card"><strong>${currentProfile?.role==="admin"?(counts.volunteer_applications||0):"✿"}</strong><span>${currentProfile?.role==="admin"?"Volunteer applications":"Community action"}</span></div></div>
    <div class="dash-panel" style="margin-top:18px"><h3>Quick actions</h3><p style="font-size:12px;color:#706a7b">Update your profile, submit a welfare enquiry, register interest in events, or support a community program from the website.</p><button class="btn btn-outline" data-go="profile">Update profile</button> <button class="btn btn-outline" data-go="submissions">View my requests</button></div>`;
    $$("[data-go]",root).forEach(b=>b.addEventListener("click",()=>{$(`[data-dash="${b.dataset.go}"]`).click();}));
  }
  function renderProfile(root){
    const p=currentProfile||{};
    root.innerHTML=`<div class="dash-panel"><h3>My profile</h3><form id="profileForm"><div class="admin-form-grid"><label>Full name<input name="full_name" required value="${esc(p.full_name||"")}"></label><label>Mobile number<input name="phone" value="${esc(p.phone||"")}"></label><label>Email<input value="${esc(currentUser?.email||"")}" disabled></label><label>Member role<input value="${esc(p.role||"member")}" disabled></label></div><button class="btn btn-primary" style="margin-top:16px">Save profile</button><div class="form-status"></div></form></div>
    <div class="dash-panel"><h3>Account security</h3><p style="font-size:12px;color:#706a7b">Use “Reset password” on the login screen if you need a password reset. Never share your password or email verification link.</p></div>`;
    $("#profileForm").addEventListener("submit",async e=>{e.preventDefault();const d=formData(e.currentTarget);const {error}=await db.from("profiles").update({full_name:d.full_name,phone:d.phone,updated_at:new Date().toISOString()}).eq("id",currentUser.id);if(error)setStatus(e.currentTarget,"Could not save profile: "+error.message,true);else{currentProfile={...currentProfile,...d};setStatus(e.currentTarget,"Profile updated.");}});
  }
  async function renderSubmissions(root){
    const tables=[["donation_pledges","Donation pledges"],["volunteer_applications","Volunteer applications"],["scholarship_requests","Education support"],["contact_messages","Messages"],["event_interests","Event interests"]];
    let html='<div class="dash-panel"><h3>My requests</h3><p style="font-size:12px;color:#706a7b">Requests submitted from the public forms are handled by the trust team. The list below is available to admins; member submissions can be followed up by the trust.</p></div>';
    if(currentProfile?.role==="admin"){
      for(const [table,title] of tables){const {data,error}=await db.from(table).select("*").order("created_at",{ascending:false}).limit(100);html+=`<div class="dash-panel"><h3>${title} <span style="font-size:11px;color:#8b8394">(${data?.length||0})</span></h3>${error?'<p class="form-status error">Unable to load this table. Check database schema and policies.</p>':renderRows(data||[],table)}</div>`;}
    } else html+='<div class="dash-panel"><p style="font-size:13px;color:#706a7b">For help with a request, call 78268 82255 and share the name and mobile number used in your submission.</p></div>';
    root.innerHTML=html;wireStatusUpdates(root);
  }
  function renderRows(rows,table){
    if(!rows.length)return '<p style="font-size:12px;color:#706a7b">No entries yet.</p>';
    const keys=Object.keys(rows[0]).filter(k=>["created_at","full_name","phone","email","amount","purpose","interest","course","support_type","topic","event_name","status","message"].includes(k));
    return `<div class="table-wrap"><table><thead><tr>${keys.map(k=>`<th>${esc(k.replaceAll("_"," "))}</th>`).join("")}<th>Action</th></tr></thead><tbody>${rows.map(r=>`<tr>${keys.map(k=>`<td>${esc(k==="created_at"?safeDate(r[k]):r[k])}</td>`).join("")}<td><button class="table-action" data-update-table="${table}" data-update-id="${esc(r.id)}" data-current-status="${esc(r.status||"new")}">Update status</button></td></tr>`).join("")}</tbody></table></div>`;
  }
  function wireStatusUpdates(root){$$("[data-update-table]",root).forEach(b=>b.addEventListener("click",async()=>{const next=prompt("Enter status (new, reviewing, contacted, approved, completed, closed):",b.dataset.currentStatus);if(!next)return;const allowed=["new","reviewing","contacted","approved","completed","closed"];if(!allowed.includes(next.toLowerCase())){toast("Use one of the listed status values.");return;}const {error}=await db.from(b.dataset.updateTable).update({status:next.toLowerCase()}).eq("id",b.dataset.updateId);if(error)toast("Update failed: "+error.message);else{toast("Status updated.");await renderDash();}}));}
  async function renderAdmin(root){
    const {data:events}=await db.from("events").select("*").order("event_date",{ascending:true}).limit(100);
    const {data:campaigns}=await db.from("campaigns").select("*").order("created_at",{ascending:false}).limit(100);
    root.innerHTML=`<div class="dash-panel"><h3>Publish an event</h3><form id="eventAdminForm"><div class="admin-form-grid"><label>Event title<input name="title" required></label><label>Event date<input name="event_date" type="date"></label><label>Venue<input name="venue"></label><label>Cover image URL<input name="image_url" placeholder="https://…"></label><label class="wide">Description<textarea name="description" rows="3"></textarea></label></div><button class="btn btn-primary" style="margin-top:12px">Publish event</button><div class="form-status"></div></form></div>
    <div class="dash-panel"><h3>Publish a campaign / announcement</h3><form id="campaignAdminForm"><div class="admin-form-grid"><label>Title<input name="title" required></label><label>Type<select name="campaign_type"><option>Campaign</option><option>Announcement</option><option>Sponsorship</option><option>Meeting</option><option>Welfare camp</option></select></label><label class="wide">Description<textarea name="description" rows="3"></textarea></label><label class="wide">Image / video URL (optional)<input name="media_url" placeholder="Public image or video URL"></label></div><button class="btn btn-primary" style="margin-top:12px">Publish update</button><div class="form-status"></div></form></div>
    <div class="dash-panel"><h3>Published events</h3>${renderEventAdminRows(events||[])}</div><div class="dash-panel"><h3>Campaigns & announcements</h3>${renderCampaignAdminRows(campaigns||[])}</div>
    <div class="dash-panel"><h3>Admin checklist</h3><p style="font-size:12px;color:#706a7b">Manage public events and campaigns here. For secure photo/video storage, create a private or public Supabase Storage bucket and use a controlled upload flow. This starter uses external media URLs; never paste secret keys into a browser field. Review requests under “My requests”.</p></div>`;
    $("#eventAdminForm").addEventListener("submit",async e=>{e.preventDefault();const d=formData(e.currentTarget);const {error}=await db.from("events").insert({title:d.title,event_date:d.event_date||null,venue:d.venue||null,image_url:d.image_url||null,description:d.description||null,is_published:true,created_by:currentUser.id});if(error)setStatus(e.currentTarget,"Could not publish: "+error.message,true);else{setStatus(e.currentTarget,"Event published.");await renderAdmin(root);await loadPublicEvents();}});
    $("#campaignAdminForm").addEventListener("submit",async e=>{e.preventDefault();const d=formData(e.currentTarget);const {error}=await db.from("campaigns").insert({title:d.title,campaign_type:d.campaign_type,description:d.description||null,media_url:d.media_url||null,is_published:true,created_by:currentUser.id});if(error)setStatus(e.currentTarget,"Could not publish: "+error.message,true);else{setStatus(e.currentTarget,"Update published.");await renderAdmin(root);}});
    $$("[data-delete-event]").forEach(b=>b.addEventListener("click",async()=>{if(!confirm("Delete this event?"))return;const {error}=await db.from("events").delete().eq("id",b.dataset.deleteEvent);if(error)toast("Delete failed.");else{toast("Event deleted.");await renderAdmin(root);await loadPublicEvents();}}));
    $$("[data-delete-campaign]").forEach(b=>b.addEventListener("click",async()=>{if(!confirm("Delete this update?"))return;const {error}=await db.from("campaigns").delete().eq("id",b.dataset.deleteCampaign);if(error)toast("Delete failed.");else{toast("Update deleted.");await renderAdmin(root);}}));
  }
  function renderEventAdminRows(rows){if(!rows.length)return '<p style="font-size:12px;color:#706a7b">No events published.</p>';return '<div class="table-wrap"><table><thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Action</th></tr></thead><tbody>'+rows.map(r=>`<tr><td>${esc(r.title)}</td><td>${esc(safeDate(r.event_date))}</td><td>${esc(r.venue||"—")}</td><td><button class="table-action" data-delete-event="${esc(r.id)}">Delete</button></td></tr>`).join("")+'</tbody></table></div>';}
  function renderCampaignAdminRows(rows){if(!rows.length)return '<p style="font-size:12px;color:#706a7b">No updates published.</p>';return '<div class="table-wrap"><table><thead><tr><th>Title</th><th>Type</th><th>Action</th></tr></thead><tbody>'+rows.map(r=>`<tr><td>${esc(r.title)}</td><td>${esc(r.campaign_type)}</td><td><button class="table-action" data-delete-campaign="${esc(r.id)}">Delete</button></td></tr>`).join("")+'</tbody></table></div>';}
  async function loadPublicEvents(){
    if(!db)return;const {data,error}=await db.from("events").select("id,title,event_date,venue,description,image_url").eq("is_published",true).order("event_date",{ascending:true}).limit(6);
    if(error||!data?.length)return;
    $("#eventsGrid").innerHTML=data.map((e,i)=>`<article class="event-card">${e.image_url?`<img src="${esc(e.image_url)}" alt="">`:`<img src="assets/trust-photo-${String([3,6,9][i%3]).padStart(2,"0")}.jpeg" alt="">`}<div class="event-body"><div class="event-date">${esc(safeDate(e.event_date))}</div><h3>${esc(e.title)}</h3><p>${esc(e.description||"Community activity by Annai Women's Charitable Trust.")}</p><p>⌖ ${esc(e.venue||"Hosur, Tamil Nadu")}</p><button data-public-event="${esc(e.title)}">Register interest →</button></div></article>`).join("");
    $$("[data-public-event]").forEach(b=>b.addEventListener("click",()=>{$("#eventInterestForm [name=event_name]").value=b.dataset.publicEvent;openModal("eventModal");}));
  }
  async function loadPublicCampaigns(){
    if(!db)return;const {data}=await db.from("campaigns").select("id,title,campaign_type,description,media_url").eq("is_published",true).order("created_at",{ascending:false}).limit(6);
    if(!data?.length)return;
    data.forEach(c=>{const figure=document.createElement("figure");figure.className="gallery-item";const media=c.media_url||"assets/trust-photo-05.jpeg";const isVideo=/\.(mp4|webm|ogg)(\?|$)/i.test(media);figure.innerHTML=`${isVideo?`<video controls preload="metadata" src="${esc(media)}"></video>`:`<img src="${esc(media)}" alt="${esc(c.title)}">`}<figcaption>${esc(c.title)}</figcaption>`;$("#galleryGrid").appendChild(figure);});
  }
  (async()=>{if(db){await refreshAuth();if(currentUser)await loadProfile();await loadPublicEvents();await loadPublicCampaigns();db.auth.onAuthStateChange(async(event,session)=>{if(event==="SIGNED_OUT"){currentUser=null;currentProfile=null;hideDashboard();}else if(session){currentUser=session.user;setTimeout(async()=>{await loadProfile();},0);}});}})();
})();