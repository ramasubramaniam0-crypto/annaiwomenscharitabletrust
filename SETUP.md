# Annai Women's Charitable Trust — Website Starter

A responsive static website starter built with HTML, CSS and vanilla JavaScript. It includes the supplied images, programme sections, gallery, contact information and membership/volunteer/coordinator/sponsorship/scholarship enquiry form.

## Files
- `index.html` — main website
- `styles.css` — responsive design
- `script.js` — mobile menu and enquiry form behaviour
- `privacy.html` — starter privacy notice
- `assets/` — images supplied in this conversation

## Important: what is and isn't implemented
This is the front-end website. The enquiry form opens the visitor's email application; it does **not** securely save form submissions. Member/admin login, real passwords, dashboard, database, donations/payment processing, private photo/video uploads, event management, email/SMS notifications and role permissions are **not implemented**. They require a secure backend and must not be simulated with passwords stored in browser code.

## Quick preview in Visual Studio Code
1. Extract this ZIP to a folder on your computer.
2. Install Visual Studio Code from the official website: https://code.visualstudio.com/
3. In VS Code choose **File → Open Folder** and select `annai_trust_website`.
4. Open `index.html`. For a convenient local preview, install the VS Code **Live Server** extension, then right-click `index.html` → **Open with Live Server**.
5. Check the mobile layout and all photos before publishing.

## Publish with GoDaddy
1. Sign in to the GoDaddy account that owns your domain and open **My Products**.
2. Check the hosting product attached to your domain. GoDaddy Website Builder and GoDaddy Web Hosting/cPanel are different products and have different publishing steps.
3. If you have **Web Hosting (cPanel)**: open cPanel → File Manager → the domain's document root (often `public_html`) → upload the ZIP → select it → Extract. Make sure `index.html` is directly in the document root, not nested in an extra folder. Keep the `assets` folder beside it.
4. If you have **GoDaddy Website Builder** only, you generally cannot deploy this code ZIP as a custom full-stack application through the visual editor. You need a compatible hosting product or an external app host and then connect the domain using the host's documented DNS settings.
5. Enable HTTPS/SSL in the hosting account and test the website on the domain from a private/incognito browser window.

## Recommended full-stack architecture for the next phase
For real member accounts and admin control, use:
- Front end: this site (or a framework such as Next.js)
- Authentication/database/storage: Supabase or another managed backend with email verification, row-level security and private file storage
- Admin roles: separate `admin`, `coordinator`, `member` permissions; never rely on hiding buttons in the browser
- Donations: a reputable payment gateway account owned by the Trust; never store card data or UPI PINs yourself
- Forms: save submissions through a protected backend endpoint and restrict access to authorised admins
- Uploads: validate file types/size, scan uploads where possible, and use private storage for member documents
- Backups, privacy notice, consent, retention/deletion policy, audit logs, strong admin MFA and recovery procedures

## Before going live
- Verify trust name, registration details, phone number, email, address and every programme claim.
- Replace sample/illustrative event images with genuine event photos and obtain consent from identifiable adults/guardians before publishing photos of children.
- Confirm the email address `info@annaiwomens.org` exists; otherwise update it in `index.html` and `script.js`.
- Confirm the phone number in `index.html`.
- Do not claim a government affiliation or publish beneficiary totals unless verified and authorised.
- Add the Trust's approved donation instructions only after confirming the account and receipt process.
- Add an accurate privacy notice and terms before collecting personal information.
