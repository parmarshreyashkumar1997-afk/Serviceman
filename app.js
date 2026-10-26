(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const BOOKINGS_KEY = "serviceman_demo_bookings_v1";
  const PROVIDERS_KEY = "serviceman_demo_providers_v1";
  let db = null;
  let currentLanguage = "en";

  function readLocal(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); }
    catch (_) { return []; }
  }
  function writeLocal(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
  function setMessage(id, text, ok) {
    const el = $(id); el.textContent = text; el.className = "message " + (ok ? "success" : "error");
  }
  function safeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function setupFirebase() {
    const config = window.SERVICEMAN_FIREBASE_CONFIG;
    if (!config || !config.apiKey || !config.projectId || !window.firebase) return;
    try {
      if (!firebase.apps.length) firebase.initializeApp(config);
      db = firebase.firestore();
      $("adminNotice").textContent = "Firebase connection initialized. The dashboard below is local-device demo data only; online admin access is not enabled.";
    } catch (err) {
      console.warn("Firebase initialization failed:", err);
      $("adminNotice").textContent = "Firebase could not initialize. Local demo mode is available.";
    }
  }
  async function saveOnline(collection, record) {
    if (!db) return false;
    try {
      await db.collection(collection).add({...record, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
      return true;
    } catch (err) {
      console.warn("Online save failed:", err);
      return false;
    }
  }
  function renderDashboard() {
    const bookings = readLocal(BOOKINGS_KEY);
    const providers = readLocal(PROVIDERS_KEY);
    $("stats").innerHTML = `
      <div class="stat"><span>Bookings</span><strong>${bookings.length}</strong></div>
      <div class="stat"><span>Electricians</span><strong>${providers.length}</strong></div>
      <div class="stat"><span>Pending</span><strong>${bookings.filter(b => b.status !== "Completed").length}</strong></div>`;
    const list = $("bookingsList");
    if (!bookings.length) { list.innerHTML = '<p class="muted">No local demo bookings yet.</p>'; return; }
    list.innerHTML = bookings.slice().reverse().map((b) => `
      <article class="booking-card">
        <p><strong>${safeText(b.name)}</strong> · ${safeText(b.phone)}</p>
        <p>${safeText(b.service)} — ${safeText(b.area)}</p>
        <p>${safeText(b.when)} · ${safeText(b.payment)}</p>
        <p>${safeText(b.problem || "No problem details supplied")}</p>
        <p><strong>Status:</strong> ${safeText(b.status || "Pending")}</p>
      </article>`).join("");
  }
  $("bookingForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const record = {
      name: $("customerName").value.trim(),
      phone: $("customerPhone").value.trim(),
      service: $("serviceType").value,
      area: $("area").value.trim(),
      when: $("when").value,
      problem: $("problem").value.trim(),
      payment: $("payment").value,
      status: "Pending",
      createdAtLocal: new Date().toISOString()
    };
    if (!record.name || !record.phone || !record.service || !record.area) {
      setMessage("bookingMessage", "Please complete all required fields.", false); return;
    }
    const records = readLocal(BOOKINGS_KEY); records.push(record); writeLocal(BOOKINGS_KEY, records);
    const online = await saveOnline("bookings", record);
    setMessage("bookingMessage", online
      ? "Booking saved on this device and sent to Firebase."
      : "Booking saved on this device. Online saving is not available yet; check Firebase config and Firestore rules.", true);
    $("bookingForm").reset(); renderDashboard();
  });
  $("providerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const record = {
      name: $("providerName").value.trim(),
      phone: $("providerPhone").value.trim(),
      experience: Number($("providerExp").value),
      serviceType: $("providerType").value,
      area: $("providerArea").value.trim(),
      createdAtLocal: new Date().toISOString()
    };
    if (!record.name || !record.phone || !record.area || record.experience < 0) {
      setMessage("providerMessage", "Please complete all required fields.", false); return;
    }
    const records = readLocal(PROVIDERS_KEY); records.push(record); writeLocal(PROVIDERS_KEY, records);
    const online = await saveOnline("providers", record);
    setMessage("providerMessage", online
      ? "Registration saved on this device and sent to Firebase for review."
      : "Registration saved on this device. Online saving is not available yet; check Firebase config and Firestore rules.", true);
    $("providerForm").reset(); renderDashboard();
  });
  document.querySelectorAll(".service").forEach((button) => button.addEventListener("click", () => {
    $("serviceType").value = button.dataset.service;
    $("booking").scrollIntoView({behavior:"smooth"});
  }));
  $("refreshBtn").addEventListener("click", renderDashboard);
  $("clearBtn").addEventListener("click", () => {
    if (!confirm("Clear bookings and electrician registrations saved on this device? This cannot be undone.")) return;
    localStorage.removeItem(BOOKINGS_KEY); localStorage.removeItem(PROVIDERS_KEY); renderDashboard();
  });
  $("exportBtn").addEventListener("click", () => {
    const rows = readLocal(BOOKINGS_KEY);
    const fields = ["name","phone","service","area","when","problem","payment","status","createdAtLocal"];
    const csv = [fields.join(","), ...rows.map(r => fields.map(f => `"${String(r[f] ?? "").replace(/"/g,'""')}"`).join(","))].join("\r\n");
    const blob = new Blob(["\ufeff" + csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "serviceman-bookings.csv"; a.click(); URL.revokeObjectURL(url);
  });
  $("languageToggle").addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "gu" : "en";
    document.documentElement.lang = currentLanguage === "gu" ? "gu" : "en";
    document.querySelectorAll("[data-en][data-gu]").forEach(el => { el.innerHTML = el.dataset[currentLanguage]; });
    $("languageToggle").textContent = currentLanguage === "en" ? "ગુજરાતી" : "English";
  });
  $("year").textContent = new Date().getFullYear();
  setupFirebase();
  renderDashboard();
})();