<script>
// ===============================
// Big Red Connect — status.js
// Renders a consistent status pill on every page
// Shows local Central time with CST/CDT
// ===============================

(function () {
  const TZ = "America/Chicago";

  function readStatus() {
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
        return { text: `🔴 Offline — as of ${dateStr} · ${timeStr} ${tzAbbrev}`, cls: "offline" };
      default:
        return { text: "Checking status…", cls: "" };
    }
  }

  function renderPill() {
    const { status, iso } = readStatus();
    const pill = document.getElementById("status-pill");
    if (!pill) return;

    // reset classes
    pill.classList.remove("online", "away", "offline", "status--loading");

    const { text, cls } = pillText(status, iso);
    pill.textContent = text;
    if (cls) pill.classList.add(cls);

    // Let pages react if they need to (e.g., live map hide/show)
    const evt = new CustomEvent("statusUpdated", { detail: status || "unknown" });
    document.dispatchEvent(evt);
  }

  // Initial render
  document.addEventListener("DOMContentLoaded", renderPill);

  // If another tab changes status, update here too
  window.addEventListener("storage", (e) => {
    if (e.key === "bigred_status" || e.key === "bigred_status_time") {
      renderPill();
    }
  });

  // Optional: expose a tiny helper if an admin page wants to set it.
  window.__BRC_setStatus = function (status) {
    const iso = new Date().toISOString();
    localStorage.setItem("bigred_status", status);
    localStorage.setItem("bigred_status_time", iso);
    renderPill();
  };
})();
</script>