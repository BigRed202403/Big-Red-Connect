// ===============================
// Big Red Connect — status.js
// Fast Sync Version (Patched for KV Worker Dec 2025)
// ===============================
(function () {
  const TZ = "America/Chicago";

  // NEW: Your KV-powered Cloudflare Worker
  const CLOUD_URL = "https://bigred-status-updater.bigredtransportation.workers.dev/status";

  // ----------------------------------
  // Local cache setup (for quick load)
  // ----------------------------------
  let lastKnownStatus = localStorage.getItem("bigred_status") || "offline";

  // ----------------------------------
  // Read live driver status from Worker
  // ----------------------------------
  async function readStatus() {
    try {
      const res = await fetch(`${CLOUD_URL}?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) throw new Error("Network error");

      const j = await res.json();

      // ✅ Prefer explicit status from KV Worker
      if (j && typeof j.status === "string") {
        return {
          status: j.status.toLowerCase(),
          iso: j.lastUpdated || j.updated || new Date().toISOString()
        };
      }

      // ↩️ Fallback: derive from boolean "online" if present
      if ("online" in j) {
        return {
          status: j.online ? "online" : "offline",
          iso: j.lastUpdated || new Date().toISOString()
        };
      }

      throw new Error("Unrecognized payload format");

    } catch (e) {
      console.warn("⚠️ Worker fetch failed, defaulting offline:", e);
      return { status: "offline", iso: new Date().toISOString() };
    }
  }

  // ----------------------------------
  // Format timestamp (CT)
  // ----------------------------------
  function fmtCT(iso) {
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(d);
    return `${date} · ${time}`;
  }

  // ----------------------------------
  // Pill rendering logic
  // ----------------------------------
  function renderPillContent(status, iso) {
    const stamp = fmtCT(iso);
    switch (status) {
      case "online":
        return { text: `🟢 Online — as of ${stamp}`, cls: "online" };
      case "away":
        // This case still supported if Worker ever includes "status":"away"
        return { text: `🟡 Limited Availability — as of ${stamp}`, cls: "away" };
      default:
        return { text: `🔴 Offline — as of ${stamp}`, cls: "offline" };
    }
  }

  // ----------------------------------
  // Render pill + broadcast update
  // ----------------------------------
  async function renderPill() {
    const { status, iso } = await readStatus();

    const pill = document.getElementById("status-pill");
    if (pill) {
      pill.classList.remove("online", "away", "offline", "status--loading");
      const { text, cls } = renderPillContent(status, iso);
      pill.textContent = text;
      pill.classList.add(cls);
    }

    // Save to cache
    localStorage.setItem("bigred_status", status);

    // Notify all other scripts (live.html listens for this)
    const event = new CustomEvent("statusUpdated", { detail: status });
    document.dispatchEvent(event);

    // Log transitions
    if (status !== lastKnownStatus) {
      console.log(`🔄 Status changed: ${lastKnownStatus} → ${status}`);
      lastKnownStatus = status;
    }
  }

  // ----------------------------------
  // Auto-refresh (fast)
  // ----------------------------------
  function scheduleAutoRefresh() {
    setInterval(renderPill, 5000); // every 5 seconds
  }

  // ----------------------------------
  // Midnight refresh
  // ----------------------------------
  function scheduleMidnightRefresh() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 5, 0);
    const msUntilMidnight = next - now;
    setTimeout(() => {
      console.log("🌙 Midnight refresh triggered");
      renderPill();
    }, msUntilMidnight);
  }

  // ----------------------------------
  // Init
  // ----------------------------------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPill);
  } else {
    renderPill();
  }

  scheduleAutoRefresh();
  scheduleMidnightRefresh();
})();
