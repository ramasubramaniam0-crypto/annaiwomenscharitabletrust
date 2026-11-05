# Annai Women's Charitable Trust — Website Starter
**Responsive public website + member login + admin dashboard + Supabase backend starter**

This ZIP contains a website built around the purple/pink trust identity and the images supplied in the conversation. It is intended to be uploaded to GoDaddy hosting and edited in Visual Studio Code.

## Included
- Public pages: About, programs, donation pledge, volunteer registration, education/scholarship enquiry, events, gallery, contact.
- Member account creation, email/password login, password reset, profile page.
- Admin dashboard: publish events and campaigns/announcements, review incoming forms, update request status, delete event/campaign posts.
- Supabase SQL schema with Row Level Security (RLS).
- Supplied photos copied into `assets/`.
- Responsive layout for desktop and mobile.

## Important before launch
1. **This ZIP is code, not a live deployment.** It does not automatically connect to your GoDaddy account or publish itself.
2. Create/configure your Supabase project and run `supabase-schema.sql`.
3. Put only the Supabase **Project URL** and **anon/public key** in `config.js`. Never put the `service_role` key or any secret key in browser files.
4. Create your own account via Member Login → Create account. Then promote that exact trusted account to admin using the SQL command below.
5. Donation form records a **pledge only**. It does not process money. Before accepting online payments, integrate a trusted payment gateway such as Razorpay using a server-side verified flow; do not collect card numbers or UPI PINs in this website.
6. The website is not a substitute for legal, accounting, child-safeguarding, privacy or statutory compliance review. Add your actual registration details, privacy policy, terms, verified contact email, and photo/video consent before public launch.
7. Admin dashboard currently supports publishing events and campaigns/announcements using URLs for media. Direct secure photo/video upload and full editing of every site section are not included in this starter.

## Step-by-step in Tamil

### பகுதி 1 — ZIP திறந்து VS Code-ல் பார்க்க
1. ZIP file-ஐ கணினியில் பதிவிறக்கம் செய்து Extract செய்யவும்.
2. `annai-womens-charitable-trust-website` folder-ஐ Visual Studio Code-ல் **File → Open Folder** மூலம் திறக்கவும்.
3. `index.html`, `styles.css`, `app.js`, `config.js`, `supabase-schema.sql` ஆகிய கோப்புகள் இருக்கும்.
4. முதலில் `index.html`-ஐ Live Server extension மூலம் preview செய்யலாம். Backend அமைக்கும்வரை forms உண்மையான தகவலைச் சேமிக்காது.

### பகுதி 2 — Supabase backend அமைக்க
1. Supabase-ல் புதிய project உருவாக்கவும்.
2. Project Dashboard → **SQL Editor** → **New query** திறக்கவும்.
3. இந்த ZIP-இல் உள்ள `supabase-schema.sql` முழுவதையும் copy செய்து SQL Editor-ல் paste செய்து Run செய்யவும்.
4. Project Settings → API (அல்லது API Keys) பகுதியில் Project URL மற்றும் **anon/public key**-ஐ எடுக்கவும். `service_role` / secret key-ஐ பயன்படுத்த வேண்டாம்.
5. VS Code-ல் `config.js` திறந்து:
   - `PASTE_YOUR_SUPABASE_PROJECT_URL_HERE` இடத்தில் Project URL
   - `PASTE_YOUR_SUPABASE_ANON_KEY_HERE` இடத்தில் anon/public key
   என மாற்றி Save செய்யவும்.
6. Supabase Authentication → URL Configuration பகுதியில் உங்கள் இணையதள domain-ஐ Site URL / Redirect URLs-ல் சேர்க்கவும். Local preview பயன்படுத்தினால் local URL-ஐயும் சேர்க்கவும்.
7. Website-ல் Member Login → Create account மூலம் உங்கள் நம்பகமான admin account-ஐ உருவாக்கவும். Email confirmation கேட்டால் email-ஐ confirm செய்யவும்.

### பகுதி 3 — Admin உரிமை கொடுக்க
1. Supabase Dashboard → SQL Editor திறக்கவும்.
2. கீழே உள்ள query-ல் `admin@example.com` என்பதற்குப் பதிலாக நீங்கள் உருவாக்கிய trusted admin email-ஐ எழுதவும்; பிறகு Run செய்யவும்:

```sql
insert into public.profiles (id, full_name, email, role)
select id, coalesce(raw_user_meta_data->>'full_name','Trust Admin'), email, 'admin'
from auth.users
where email = 'admin@example.com'
on conflict (id) do update set role = 'admin';
```

3. Website-இல் log out செய்து மீண்டும் log in செய்யவும். Dashboard-ல் **Admin control** tab தோன்ற வேண்டும்.
4. Admin control-ல் event, campaign, announcement வெளியிடலாம். “My requests” tab-ல் donation pledges, volunteer applications, scholarship requests, messages மற்றும் event interests பார்க்கவும்; status மாற்றவும்.

### பகுதி 4 — GoDaddy-ல் publish செய்ய
1. GoDaddy-ல் உங்கள் domain மற்றும் hosting plan-ஐத் திறக்கவும்.
2. Hosting plan-ல் **cPanel / File Manager / public_html** அணுகல் இருந்தால், File Manager-ஐ திறக்கவும்.
3. `public_html`-ல் உள்ள பழைய website-ஐ backup எடுக்காமல் delete செய்ய வேண்டாம்.
4. இந்த project folder-இன் உள்ளடக்கங்களை (index.html, styles.css, app.js, config.js, assets folder உட்பட) hosting-ன் website root / `public_html`-க்கு upload செய்யவும். ZIP upload செய்தால் server-ல் Extract செய்யவும்.
5. உங்கள் domain-ஐ திறந்து HTTPS/SSL வேலை செய்கிறதா உறுதிப்படுத்தவும். `config.js` மற்றும் `assets/` browser-ல் திறக்கப்படுகிறதா சோதிக்கவும்.
6. Supabase Authentication URL Configuration-ல் உங்கள் உண்மையான domain-ஐ சேர்க்கவும்.
7. Donation pledge, volunteer, scholarship, contact form, member login, admin login அனைத்தையும் test செய்யவும்.

**குறிப்பு:** GoDaddy Website Builder மற்றும் cPanel hosting வேறுபடும். Website Builder-ல் இந்த முழு project-ஐ நேரடியாக upload செய்ய முடியாமல் இருக்கலாம். உங்கள் hosting plan-ல் static files upload செய்யும் வசதி இருக்க வேண்டும். Node.js hosting பயன்படுத்தினால் இதை static website ஆக deploy செய்யலாம்.

## Customize
- Trust name, contact phone, address: `index.html`
- Colours, fonts, layout: `styles.css`
- Forms, authentication and dashboard: `app.js`
- Backend URL/key: `config.js`
- Tables and security policies: `supabase-schema.sql`
- Photos: `assets/trust-photo-01.jpeg` etc.

## Security and privacy
- Public form visitors may submit a record but cannot read submissions; only authenticated admins can view them under RLS.
- Admin role must be granted from the Supabase SQL Editor by a trusted project owner.
- Never expose Supabase service-role keys, email provider secrets, payment secrets or passwords in `config.js`.
- Add CAPTCHA/rate limiting and server-side validation before heavy public use; public forms can otherwise receive spam.
- Store only the personal information needed to follow up. Publish a privacy notice and define retention/access practices.
- The sample contact email is intentionally not fabricated; replace it with a verified trust email.
- The supplied images may be illustrative or generated. Use authentic photos only where you have permission and consent.

## Troubleshooting
- **“Setup required” message:** `config.js` still contains placeholders, or the Supabase SDK/config is unavailable.
- **Forms fail:** verify SQL ran successfully, table names match, and browser console/network logs.
- **Cannot create account:** verify Supabase Auth email settings and allowed redirect URLs.
- **Admin tab missing:** run the admin promotion SQL for the exact account, then sign out and sign in again.
- **Events do not appear:** ensure event is published (`is_published = true`) and RLS policies exist.
- **GoDaddy 404:** upload `index.html` directly to the correct document root; don't leave it one folder too deep.

## Project files
- `index.html` — public website and portal UI
- `styles.css` — responsive styling
- `app.js` — Supabase authentication, forms, dashboard
- `config.js` — public configuration placeholders
- `supabase-schema.sql` — database schema + RLS policies
- `assets/` — supplied trust images
