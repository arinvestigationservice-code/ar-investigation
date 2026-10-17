# A R Investigation Website

## Files
index.html, about.html, services.html, how-it-works.html, verify.html, contact.html, privacy.html, terms.html,
style.css, script.js, robots.txt, sitemap.xml, supabase-verify.sql
Upload ALL of them to GitHub (old pages are replaced; nothing else needs deleting).

## Before publishing - edit the CONFIG block at the top of script.js
- phone: your number with country code, digits only, e.g. "919876543210".
  Leave "" and the Call / WhatsApp buttons stay hidden.
- formEndpoint: create a free form at https://formspree.io, paste its URL here.
  Leave "" and the form falls back to opening the visitor's email app
  (sent to ar.investigation.service@gmail.com).
- registration: optional line about your registration/licence, shown in About.

Also check: location text ("Agra, Uttar Pradesh, India") in index.html.

## GitHub Pages
1. Create a GitHub repository, e.g. `ar-investigation`.
2. Upload all files from this folder.
3. Settings -> Pages -> Deploy from a branch -> `main` and `/ (root)`.
4. Save. GitHub gives you the website URL.
5. Submit https://arinvestigationservice-code.github.io/ar-investigation/sitemap.xml in Google Search Console.

## Staff verification (ID card QR)
1. Supabase -> SQL Editor: run `supabase-verify.sql` once.
2. Vault -> ID Cards: the QR on the back opens
   https://arinvestigationservice-code.github.io/ar-investigation/verify.html?id=<ID>
   (Vault -> Settings -> "Website address" can change the base link).
3. The visitor enters the ID number (prefilled from the QR) and the captcha code, then taps Verify.
4. Terminate a person from their vault profile (admin only): the letter is required, saved in the vault,
   and the website shows the person as Terminated.
Re-print ID cards after this update, because old cards do not have the new QR.
