/* ===== EDIT ONLY THIS BLOCK =====
   phone: digits with country code, e.g. "919876543210" (leave "" to hide Call/WhatsApp buttons)
   formEndpoint: Formspree URL e.g. "https://formspree.io/f/xxxxxxx" (leave "" to use email fallback)
   registration: e.g. "Registered under ..." (leave "" to hide)
================================== */
const CONFIG = {
  email: "ar.investigation.service@gmail.com",
  phone: "",
  formEndpoint: "",
  registration: "",
  // Document Vault ka Supabase (publishable key public hoti hai, safe hai)
  supabaseUrl: "https://tbqgmynknagpvuoqzbkw.supabase.co",
  supabaseKey: "sb_publishable_XpiGkGktxzTPBSsOXP5w4g_7zTzyZqV"
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* Menu */
const menuBtn = $(".menu-btn"), navLinks = $("#navLinks");
menuBtn.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
$$("#navLinks a").forEach(a => a.addEventListener("click", () => {
  navLinks.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
}));

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { navLinks.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
});

$("#year").textContent = new Date().getFullYear();

/* Phone / WhatsApp buttons */
if (CONFIG.phone) {
  const digits = CONFIG.phone.replace(/\D/g, "");
  const pretty = "+" + digits;
  $$("[data-call]").forEach(el => {
    el.href = "tel:" + pretty;
    el.hidden = false;
  });
  $$("[data-wa]").forEach(el => {
    el.href = "https://wa.me/" + digits + "?text=" + encodeURIComponent("Hello, I would like to discuss a verification requirement.");
    el.hidden = false;
  });
}
if (CONFIG.registration) {
  const r = $("#regLine");
  r.textContent = CONFIG.registration;
  r.hidden = false;
}

/* Enquiry form */
const form = $("#enquiryForm"), msg = $("#formMsg"), btn = $("#submitBtn");
function showMsg(text, ok) {
  msg.textContent = text;
  msg.className = "form-msg " + (ok ? "ok" : "err");
  msg.hidden = false;
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (form.company.value) return; // honeypot (bots)
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const email = form.email.value.trim();
  const service = form.service.value;
  const message = form.message.value.trim();

  if (!name || !phone || !service) return showMsg("Please fill name, mobile number and service.", false);
  if (!/^[+\d][\d\s-]{7,}$/.test(phone)) return showMsg("Please enter a valid mobile number.", false);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return showMsg("Please enter a valid email address.", false);

  if (CONFIG.formEndpoint) {
    btn.disabled = true; btn.textContent = "Sending...";
    try {
      const res = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name, phone, email, service, message, _subject: "New Verification Enquiry - " + service })
      });
      if (!res.ok) throw new Error("fail");
      form.reset();
      showMsg("Thank you! Your enquiry has been sent. We will contact you soon.", true);
    } catch (err) {
      showMsg("Could not send right now. Please email us at " + CONFIG.email + ".", false);
    }
    btn.disabled = false; btn.textContent = "Send Enquiry";
    return;
  }

  /* Fallback: open email app */
  const subject = encodeURIComponent("New Verification Enquiry - " + service);
  const body = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\n\nRequirement:\n${message}`);
  showMsg("Opening your email app. If nothing opens, please email " + CONFIG.email + " directly.", true);
  window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
});


/* ===== Staff verification (ID number + captcha) ===== */
const vForm = $("#verifyForm"), vBtn = $("#verifyBtn"), vOut = $("#verifyResult");
const capCanvas = $("#captchaCanvas");
let captchaText = "";

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
function fmtDate(d) {
  if (!d) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* Captcha: random 5 characters (no confusing 0/O/1/I), drawn with noise on a canvas */
function rnd(n) {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return b[0] % n;
}
function drawCaptcha() {
  const ctx = capCanvas.getContext("2d"), w = capCanvas.width, h = capCanvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#f3f6fa";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = "rgba(7,24,47," + (0.15 + rnd(20) / 100) + ")";
    ctx.lineWidth = 1 + rnd(2);
    ctx.beginPath();
    ctx.moveTo(rnd(w), rnd(h));
    ctx.bezierCurveTo(rnd(w), rnd(h), rnd(w), rnd(h), rnd(w), rnd(h));
    ctx.stroke();
  }
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = "rgba(24,166,166," + (0.2 + rnd(30) / 100) + ")";
    ctx.fillRect(rnd(w), rnd(h), 2, 2);
  }
  const step = w / (captchaText.length + 1);
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let i = 0; i < captchaText.length; i++) {
    ctx.save();
    ctx.translate(step * (i + 1), h / 2 + (rnd(11) - 5));
    ctx.rotate((rnd(41) - 20) * Math.PI / 180);
    ctx.font = "700 " + (28 + rnd(8)) + "px 'Space Grotesk', Arial, sans-serif";
    ctx.fillStyle = "#07182f";
    ctx.fillText(captchaText[i], 0, 0);
    ctx.restore();
  }
}
function newCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  try {
    captchaText = Array.from({ length: 5 }, () => chars[rnd(chars.length)]).join("");
  } catch (e) {   // very old browser without crypto.getRandomValues
    captchaText = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }
  const txt = $("#captchaText");
  try {
    if (!capCanvas || !capCanvas.getContext) throw new Error("no canvas");
    drawCaptcha();
    capCanvas.hidden = false;
    if (txt) txt.hidden = true;
  } catch (e) {   // canvas blocked: show the code as styled text instead
    if (capCanvas) capCanvas.hidden = true;
    if (txt) { txt.textContent = captchaText; txt.hidden = false; }
  }
}

function showNotFound() {
  vOut.replaceChildren();
  const box = el("div", "vnf");
  box.append(el("b", "", "No matching record found."));
  box.append(document.createElement("br"));
  box.append("Please check the ID number. If this person cannot be verified, do not treat them as an A R Investigation representative. Contact us at " + CONFIG.email + ".");
  vOut.append(box);
  vOut.hidden = false;
}
function showStaff(r) {
  const status = r.status || "Active";
  const kind = status === "Active" ? "ok" : (status === "Left" ? "off" : "bad");
  const card = el("div", "vcard " + kind);
  card.append(el("div", "vbanner",
    kind === "ok" ? "✓ Verified: authorised A R Investigation representative"
      : "✕ NOT an authorised representative (status: " + status + ")"));
  const body = el("div", "vbody");
  const photo = el("div", "vphoto");
  if (typeof r.photo === "string" && r.photo.indexOf("data:image/") === 0) {
    const img = document.createElement("img");
    img.alt = "Photo of " + (r.name || "staff");
    img.src = r.photo;
    photo.append(img);
  } else {
    photo.textContent = (r.name || "?").charAt(0).toUpperCase();
  }
  const dl = el("dl", "vlist");
  const add = (k, v, cls) => { if (!v) return; dl.append(el("dt", "", k)); dl.append(el("dd", cls || "", v)); };
  add("Name", r.name);
  add("Role", r.role);
  add("ID number", r.eid);
  add("Location", r.city);
  add("Joining date", fmtDate(r.join));
  add("Status", status, "st-" + kind);
  if (status === "Terminated") add("Terminated on", fmtDate(r.term), "st-bad");
  body.append(photo, dl);
  card.append(body);
  if (kind !== "ok") card.append(el("div", "vfoot", "If this person is working in the field on our behalf, please contact us at " + CONFIG.email + "."));
  vOut.replaceChildren(card);
  vOut.hidden = false;
}
async function verifyStaff(id) {
  vBtn.disabled = true; vBtn.textContent = "Checking...";
  try {
    const res = await fetch(CONFIG.supabaseUrl + "/rest/v1/rpc/verify_person", {
      method: "POST",
      headers: { "apikey": CONFIG.supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify({ p_eid: id })
    });
    if (!res.ok) {
      let detail = "";
      try { const j = await res.json(); detail = [j.code, j.message].filter(Boolean).join(": "); } catch (x) {}
      throw new Error("HTTP " + res.status + (detail ? " - " + detail : ""));
    }
    const data = await res.json();
    if (data && data.name) showStaff(data); else showNotFound();
  } catch (err) {
    console.error("Verify failed:", err);
    const box = el("div", "vnf", "Could not check right now. Please try again, or email us at " + CONFIG.email + ".");
    box.append(document.createElement("br"));
    box.append(el("small", "", "Technical detail: " + (err && err.message ? err.message : "network error")));
    vOut.replaceChildren(box);
    vOut.hidden = false;
  }
  vBtn.disabled = false; vBtn.textContent = "Verify";
}
function vMsg(text) {
  vOut.replaceChildren(el("div", "vnf", text));
  vOut.hidden = false;
}
if (vForm) vForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = vForm.vid.value.trim(), cap = vForm.vcaptcha.value.trim().toUpperCase();
  if (!id || !cap) return vMsg("Please enter the ID number and the captcha code.");
  if (cap !== captchaText) {
    vForm.vcaptcha.value = "";
    newCaptcha();
    return vMsg("The captcha code is wrong. Please type the new code shown in the picture.");
  }
  vForm.vcaptcha.value = "";
  newCaptcha();   // every check needs a fresh captcha
  verifyStaff(id);
});
const capNew = $("#captchaNew");
if (capNew) capNew.addEventListener("click", () => { newCaptcha(); vForm.vcaptcha.value = ""; vForm.vcaptcha.focus(); });
if (vForm) newCaptcha();

/* QR scan: ?id=... fills the ID number, the visitor then types the captcha */
(function () {
  const id = (new URLSearchParams(location.search).get("id") || "").trim();
  if (!id || !vForm) return;
  vForm.vid.value = id;
  history.replaceState(null, "", location.pathname + "#verify");
  vForm.vcaptcha.focus({ preventScroll: true });
})();
