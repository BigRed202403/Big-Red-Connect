// ===============================
// Big Red Connect — status.js (Fast Sync Version, Nov 2025)
// ===============================
(function () {
  const TZ = "America/Chicago";
  const CLOUD_URL = "https://bigred-status-updater.bigredtransportation.workers.dev/status";

  // ----------------------------------
  // Local cache setup
  // ----------------------------------
  let lastKnownStatus = localStorage.getItem("bigred_status") || "offline";

  // ----------------------------------
  // Fetch Worker status
  // ----------------------------------
  async function readStatus() {
    try {
      const res = await fetch(`${CLOUD_URL}?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Accept": "application/json" },
      });
      if (res.ok) {
        const j = await res.json();
        if (j && j.status) {
          return { status: j.status.toLowerCase(), iso: j.updated };
        }
      }
      throw new Error("Bad JSON or no status key");
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
      timeZone: TZ, month: "short", day: "numeric", year: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, hour: "numeric", minute: "2-digit", timeZoneName: "short",
    }).format(d);
    return `${date} · ${time}`;
  }

  // ----------------------------------
  // Pill rendering
  // ----------------------------------
  function renderPillContent(status, iso) {
    const stamp = fmtCT(iso);
    switch (status) {
      case "online":
        return { text: `🟢 Online — as of ${stamp}`, cls: "online" };
      case "away":
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

    // Broadcast to other scripts
    localStorage.setItem("bigred_status", status);
    const event = new CustomEvent("statusUpdated", { detail: status });
    document.dispatchEvent(event);

    // Log if changed
    if (status !== lastKnownStatus) {
      console.log(`🔄 Status changed: ${lastKnownStatus} → ${status}`);
      lastKnownStatus = status;
    }
  }

  // ----------------------------------
  // Auto-refresh faster (5s)
  // ----------------------------------
  function scheduleAutoRefresh() {
    setInterval(renderPill, 5000); // every 5 seconds
  }

  // ----------------------------------
  // Midnight image/caption refresh (still supported)
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
