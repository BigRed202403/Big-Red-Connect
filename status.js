// ===============================
// Big Red Connect — status.js (cloud-synced, always-current timestamp)
// Reads global status.json from GitHub and always displays current Central time
// ===============================
(function () {
  const TZ = "America/Chicago";
  const CLOUD_URL = "https://raw.githubusercontent.com/bigred202403/Big-Red-Connect/main/status.json";

  // Ensure local fallback exists
  function ensureDefaultStatus() {
    const s = localStorage.getItem("bigred_status");
    const t = localStorage.getItem("bigred_status_time");
    if (!s || !t) {
      const iso = new Date().toISOString();
      localStorage.setItem("bigred_status", "offline");
      localStorage.setItem("bigred_status_time", iso);
    }
  }

  // Read status from cloud first, then local
  async function readStatus() {
    try {
      const res = await fetch(CLOUD_URL + "?nocache=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const j = await res.json();
        if (j && j.status) {
          localStorage.setItem("bigred_status", j.status);
          localStorage.setItem("bigred_status_time", j.updated);
          return { status: j.status.toLowerCase(), iso: j.updated };
        }
      }
    } catch (err) {
      console.warn("Cloud fetch failed; using local fallback.", err);
    }
    ensureDefaultStatus();
    const status = (localStorage.getItem("bigred_status") || "").toLowerCase();
    const iso = localStorage.getItem("bigred_status_time") || new Date().toISOString();
    return { status, iso };
  }

  // Format current Central Time
  function fmtCT(isoString) {
    const d = isoString ? new Date(isoString) : new Date();
    const dateStr = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric", year: "numeric" }).format(d);
    const timeStr = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(d);
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "short" }).formatToParts(d);
    const tzAbbrev = (parts.find(p => p.type === "timeZoneName") || {}).value || "CT";
    return { dateStr, timeStr, tzAbbrev };
  }

  // 🟢 Modified to always show current time (not stored ISO)
  function pillText(status) {
    const { dateStr, timeStr, tzAbbrev } = fmtCT(new Date().toISOString());
    switch (status) {
      case "online":
        return { text: `🟢 Online — as of ${dateStr} · ${timeStr} ${tzAbbrev}`, cls: "online" };
      case "away":
        return { text: `🟡 Limited Availability — as of ${dateStr} · ${timeStr} ${tzAbbrev}`, cls: "away" };
      case "offline":
      default:
        return { text: `🔴 Offline — as of ${dateStr} · ${timeStr} ${tzAbbrev}`, cls: "offline" };
    }
  }

  async function renderPill() {
    const { status } = await readStatus();
    const pill = document.getElementById("status-pill");
    if (!pill) return;
    pill.classList.remove("online", "away", "offline", "status--loading");
    const { text, cls } = pillText(status);
    pill.textContent = text;
    pill.classList.add(cls);
    document.dispatchEvent(new CustomEvent("statusUpdated", { detail: status || "unknown" }));
  }

  // Run when ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPill);
  } else {
    renderPill();
  }

  // Listen for localStorage updates
  window.addEventListener("storage", e => {
    if (e.key === "bigred_status" || e.key === "bigred_status_time") renderPill();
  });

  // Manual admin helper
  window.__BRC_setStatus = function (status) {
    const iso = new Date().toISOString();
    localStorage.setItem("bigred_status", (status || "offline").toLowerCase());
    localStorage.setItem("bigred_status_time", iso);
    renderPill();
  };
})();