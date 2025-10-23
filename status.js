// ===============================
// Big Red Connect — status.js (fixed)
// Renders a consistent status pill on every page
// Uses Central Time and defaults to "Offline" if unset
// ===============================
(function () {
  const TZ = "America/Chicago";

  function ensureDefaultStatus() {
    const s = localStorage.getItem("bigred_status");
    const t = localStorage.getItem("bigred_status_time");
    if (!s || !t) {
      const iso = new Date().toISOString();
      localStorage.setItem("bigred_status", "offline");
      localStorage.setItem("bigred_status_time", iso);
    }
  }

  function readStatus() {
    ensureDefaultStatus();
    const status = (localStorage.getItem("bigred_status") || "").toLowerCase();
    const iso = localStorage.getItem("bigred_status_time") || null;
    return { status, iso };
  }

  function fmtCT(isoString) {
    const d = isoString ? new Date(isoString) : new Date();

    const dateStr = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(d);

    const timeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "numeric",
      minute: "2-digit"
    }).format(d);

    // Extract "CST"/"CDT"
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      timeZoneName: "short"
    }).formatToParts(d);
    const tzAbbrev = (parts.find(p => p.type === "timeZoneName") || {}).value || "CT";

    return { dateStr, timeStr, tzAbbrev };
  }

  function pillText(status, iso) {
    const { dateStr, timeStr, tzAbbrev } = fmtCT(iso);
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

  function renderPill() {
    const { status, iso } = readStatus();
    const pill = document.getElementById("status-pill");
    if (!pill) return;

    pill.classList.remove("online", "away", "offline", "status--loading");
    const { text, cls } = pillText(status, iso);
    pill.textContent = text;
    if (cls) pill.classList.add(cls);

    // Let pages react (e.g., live map toggle)
    document.dispatchEvent(new CustomEvent("statusUpdated", { detail: status || "unknown" }));
  }

  // Initial render
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPill);
  } else {
    renderPill();
  }

  // React to tab sync (localStorage changes)
  window.addEventListener("storage", (e) => {
    if (e.key === "bigred_status" || e.key === "bigred_status_time") {
      renderPill();
    }
  });

  // Admin helper to manually update status
  window.__BRC_setStatus = function (status) {
    const iso = new Date().toISOString();
    localStorage.setItem("bigred_status", (status || "offline").toLowerCase());
    localStorage.setItem("bigred_status_time", iso);
    renderPill();
  };
})();