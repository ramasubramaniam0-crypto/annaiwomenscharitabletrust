# Annai Women's Charitable Trust — Website Starter

இந்த ZIP-ல் அழகான responsive website, நீங்கள் அனுப்பிய படங்கள், உறுப்பினர் பதிவு, நன்கொடை விசாரணை, தன்னார்வலர் பதிவு, நிகழ்ச்சி/கல்வி உதவி விண்ணப்பப் படிவங்கள், உள்நுழைவு மற்றும் dashboard தொடக்க வடிவம் உள்ளன.

## முக்கியம்
- இப்போது `index.html`-ஐ திறந்தால் website preview இயங்கும்.
- Supabase இணைக்கும்வரை படிவத் தகவல்கள் இந்த browser-ல் மட்டும் demo-வாக சேமிக்கப்படும். வேறு சாதனத்தில்/நிரந்தரமாகச் சேமிக்கப்படாது.
- உண்மையான member accounts, admin control, database, uploads ஆகியவற்றுக்கு Supabase அமைப்பு அவசியம்.
- GoDaddy-ல் hosting/domain இருப்பது மட்டும் backend database அல்லது login உருவாக்காது.
- உங்கள் GoDaddy password, Supabase secret/service-role key-ஐ HTML/JavaScript-ல் ஒருபோதும் எழுத வேண்டாம்.
- இந்த template-ல் donation payment gateway இணைக்கப்படவில்லை; தற்போது donation interest/pledge form மட்டுமே. பணம் பெற payment provider-ஐ தனியாக பாதுகாப்பாக இணைக்க வேண்டும்.
- website-ல் உள்ள நிகழ்ச்சிகள்/பயனாளர்கள் பற்றிய எண்ணிக்கைகள் sample text. உண்மையான தகவல்களால் மாற்றவும். அனுமதி இல்லாமல் பயனாளர்களின் புகைப்படங்களை வெளியிட வேண்டாம்.

## 1. கணினியில் திறப்பது
1. ZIP-ஐ extract செய்யவும்.
2. Visual Studio Code-ல் `annai_womens_trust_website` folder-ஐ Open Folder செய்யவும்.
3. `public/index.html`-ஐ browser-ல் திறக்கவும். சிறந்த preview-க்கு VS Code-ல் Live Server extension பயன்படுத்தலாம்.

## 2. Supabase backend அமைப்பது
1. https://supabase.com/ இல் project உருவாக்கவும்.
2. SQL Editor திறந்து `supabase/schema.sql` முழுவதையும் run செய்யவும்.
3. Project Settings → API பகுதியில் Project URL மற்றும் publishable/anon key எடுக்கவும்.
4. `public/js/config.js`-ல் `SUPABASE_URL` மற்றும் `SUPABASE_ANON_KEY` மதிப்புகளை நிரப்பவும். Publishable/anon key browser-ல் பயன்படுத்துவதற்கானது; database பாதுகாப்பை RLS policies கையாளும்.
5. Authentication → URL Configuration பகுதியில் உங்கள் website URL-ஐ Site URL மற்றும் Redirect URLs-ல் சேர்க்கவும்.
6. முதலில் ஒரு கணக்கை website வழியாக உருவாக்கவும். பின்னர் SQL Editor-ல் கீழே உள்ள command-ஐ உங்கள் account UUID கொண்டு run செய்து admin ஆக அமைக்கவும்:
   `insert into public.user_roles (user_id, role) values ('YOUR-USER-UUID', 'admin');`
   UUID-ஐ Authentication → Users-ல் பார்க்கலாம்.
7. Supabase Storage-ல் `trust-media` என்ற public bucket உருவாக்கி, தேவையான upload policies-ஐ அமைக்கவும். இது செய்யும்வரை படங்களை project-இல் உள்ள `public/images` folder-ல் வைத்துப் பயன்படுத்தவும்.

## 3. GoDaddy-ல் வெளியிடுவது
**GoDaddy cPanel/Linux Hosting** இருந்தால்:
1. GoDaddy account → My Products → Web Hosting → Manage → cPanel → File Manager.
2. `public_html` folder-ஐத் திறக்கவும்.
3. `public` folder-உள்ளே இருக்கும் files/folders-ஐ `public_html`-க்கு upload செய்யவும் (folder-ஐ உள்ளே nesting செய்ய வேண்டாம்).
4. உங்கள் domain-ஐத் திறந்து சோதிக்கவும்.
5. Supabase backend தனியாக இயங்கும்; GoDaddy-ல் PHP/Node backend வேண்டுமெனில் hosting plan ஆதரவு பார்க்க வேண்டும்.

**GoDaddy Website Builder மட்டும் இருந்தால்:** இந்த முழு project-ஐ அப்படியே upload செய்யும் வசதி இருக்காமல் இருக்கலாம். Hosting plan-ஐ உறுதிப்படுத்தி cPanel hosting அல்லது static hosting முறையைத் தேர்வு செய்யவும்.

## 4. மாற்ற வேண்டிய விவரங்கள்
`public/index.html`-ல் phone, email, address, founder/chairman, social links ஆகியவற்றை சரிபார்க்கவும். தற்போதைய phone/address எடுத்துக்காட்டு விவரங்களாக இருக்கலாம்; வெளியிடுவதற்கு முன் உறுதிப்படுத்தவும்.

## கோப்புகள்
- `public/index.html` — website
- `public/css/styles.css` — design
- `public/js/config.js` — backend settings
- `public/js/app.js` — forms, login, dashboard
- `supabase/schema.sql` — tables and row-level security
