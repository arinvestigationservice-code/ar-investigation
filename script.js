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


/* ===== Staff verification (ID number + verification code) ===== */
const vForm = $("#verifyForm"), vBtn = $("#verifyBtn"), vOut = $("#verifyResult");

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
function showNotFound() {
  vOut.replaceChildren();
  const box = el("div", "vnf");
  box.append(el("b", "", "No matching record found."));
  box.append(document.createElement("br"));
  box.append("Please check the ID number and code. If this person cannot be verified, do not treat them as an A R Investigation representative. Contact us at " + CONFIG.email + ".");
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
async function verifyStaff(id, code) {
  vBtn.disabled = true; vBtn.textContent = "Checking...";
  try {
    const res = await fetch(CONFIG.supabaseUrl + "/rest/v1/rpc/verify_person", {
      method: "POST",
      headers: { "apikey": CONFIG.supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify({ p_eid: id, p_code: code })
    });
    if (!res.ok) throw new Error("http " + res.status);
    const data = await res.json();
    if (data && data.name) showStaff(data); else showNotFound();
  } catch (err) {
    vOut.replaceChildren(el("div", "vnf", "Could not check right now. Please try again, or email us at " + CONFIG.email + "."));
    vOut.hidden = false;
  }
  vBtn.disabled = false; vBtn.textContent = "Verify";
}
vForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = vForm.vid.value.trim(), code = vForm.vcode.value.trim();
  if (!id || !code) {
    vOut.replaceChildren(el("div", "vnf", "Please enter both the ID number and the verification code."));
    vOut.hidden = false;
    return;
  }
  verifyStaff(id, code);
});
/* QR scan: ?id=...&code=... opens the page and verifies automatically */
(function () {
  const q = new URLSearchParams(location.search), id = (q.get("id") || "").trim(), code = (q.get("code") || "").trim();
  if (!id || !code) return;
  vForm.vid.value = id; vForm.vcode.value = code;
  history.replaceState(null, "", location.pathname + "#verify"); // code address bar mein na dikhe
  verifyStaff(id, code);
})();
