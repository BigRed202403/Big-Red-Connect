// ===============================
// Big Red Connect — status.js (Cloudflare Proxy Edition)
// Renders a consistent status pill on every page
// Uses Central Time and fetches live status via Cloudflare Worker
// ===============================
(function () {
  const TZ = "America/Chicago";
  const CLOUD_URL =
    "https://bigred-status-updater.bigredtransportation.workers.dev/status";

  // ===== Local fallback =====
  function ensureDefaultStatus() {
    const s = localStorage.getItem("bigred_status");
    const t = localStorage.getItem("bigred_status_time");
    if (!s || !t) {
      const iso = new Date().toISOString();
      localStorage.setItem("bigred_status", "offline");
      localStorage.setItem("bigred_status_time", iso);
    }
  }

  // ===== Cloud-aware reader =====
  async function readStatus() {
    try {
      const res = await fetch(CLOUD_URL + "?nocache=" + Date.now(), {
        cache: "no-store",
      });
      if (res.ok) {
        const j = await res.json();
        if (j && j.status) {
          // Update local cache for other tabs
          localStorage.setItem("bigred_status", j.status);
          localStorage.setItem("bigred_status_time", j.updated);
          return { status: j.status.toLowerCase(), iso: j.updated };
        }
      }
    } catch (e) {
      console.warn("⚠️ Cloud fetch failed; using local fallback.", e);
    }

    // Local fallback if Cloudflare unreachable
    ensureDefaultStatus();
    const status = (localStorage.getItem("bigred_status") || "").toLowerCase();
    const iso =
      localStorage.getItem("bigred_status_time") ||
      new Date().toISOString();
    return { status, iso };
  }

  // ===== Time formatting (Central) =====
  function fmtCT(isoString) {
    const d = isoString ? new Date(isoString) : new Date();

    const dateStr = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);

    const timeStr = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "numeric",
      minute: "2-digit",
    }).format(d);

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      timeZoneName: "short",
    }).formatToParts(d);
    const tzAbbrev =
      (parts.find((p) => p.type === "timeZoneName") || {}).value || "CT";

    return { dateStr, timeStr, tzAbbrev };
  }

  // ===== Build pill text =====
  function pillText(status, iso) {
    const { dateStr, timeStr, tzAbbrev } = fmtCT(iso);
    switch (status) {
      case "online":
        return {
          text: `🟢 Online — as of ${dateStr} · ${timeStr} ${tzAbbrev}`,
          cls: "online",
        };
      case "away":
        return {
          text: `🟡 Limited Availability — as of ${dateStr} · ${timeStr} ${tzAbbrev}`,
          cls: "away",
        };
      case "offline":
      default:
        return {
          text: `🔴 Offline — as of ${dateStr} · ${timeStr} ${tzAbbrev}`,
          cls: "offline",
        };
    }
  }

  // ===== Render pill =====
  async function renderPill() {
    const { status, iso } = await readStatus();
    const pill = document.getElementById("status-pill");
    if (!pill) return;

    pill.classList.remove("online", "away", "offline", "status--loading");
    const { text, cls } = pillText(status, iso);
    pill.textContent = text;
    if (cls) pill.classList.add(cls);

    // Notify any listeners (e.g., live map)
    document.dispatchEvent(
      new CustomEvent("statusUpdated", { detail: status || "unknown" })
    );
  }

  // ===== Init and auto-refresh =====
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPill);
  } else {
    renderPill();
  }

  // Refresh every 30 seconds for live sync
  setInterval(renderPill, 30000);

  // React to localStorage sync (for in-browser control use)
  window.addEventListener("storage", (e) => {
    if (e.key === "bigred_status" || e.key === "bigred_status_time") {
      renderPill();
    }
  });

  // Manual dev helper
  window.__BRC_setStatus = function (status) {
    const iso = new Date().toISOString();
    localStorage.setItem("bigred_status", (status || "offline").toLowerCase());
    localStorage.setItem("bigred_status_time", iso);
    renderPill();
  };
})();
