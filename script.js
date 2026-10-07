/* ===== EDIT ONLY THIS BLOCK =====
   phone: digits with country code, e.g. "919876543210" (leave "" to hide Call/WhatsApp buttons)
   formEndpoint: Formspree URL e.g. "https://formspree.io/f/xxxxxxx" (leave "" to use email fallback)
   registration: e.g. "Registered under ..." (leave "" to hide)
================================== */
const CONFIG = {
  email: "ar.investigation.service@gmail.com",
  phone: "917078894411",
  formEndpoint: "https://formspree.io/f/mjyggave",
  registration: ""
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
