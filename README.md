# A R Investigation Website

## Files
index.html, style.css, script.js, robots.txt, supabase-verify.sql

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
5. After you have the URL, add a sitemap.xml and submit it in Google Search Console.

## Staff verification (ID card QR)
1. Supabase -> SQL Editor: run `supabase-verify.sql` once.
2. Vault -> Settings -> "Website address": paste this website's URL (e.g. https://yourname.github.io/ar-investigation).
3. Vault -> ID Cards: every person gets a Verification Code automatically. The QR on the back opens
   `<website>/?id=...&code=...`, which verifies automatically. The ID number and code are also printed on the card.
4. Terminate a person from their vault profile (admin only): the letter is required, saved in the vault,
   and the website shows the person as Terminated.
Re-print ID cards after step 2, because old cards do not have the new QR.
