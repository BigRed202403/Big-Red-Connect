// ===============================
// Big Red Connect — status.js
// Availability Pill + Homepage Ticker
// ===============================
(function () {
  const TZ = "America/Chicago";
  const CLOUD_URL = "https://bigred-status-updater.bigredtransportation.workers.dev/status";
  const TICKER_URL = "https://homepage-ticker.bigredtransportation.workers.dev/";

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

      if (j && typeof j.status === "string") {
        return {
          status: j.status.toLowerCase(),
          iso: j.lastUpdated || j.updated || new Date().toISOString()
        };
      }

      if ("online" in j) {
        return {
          status: j.online ? "online" : "offline",
          iso: j.lastUpdated || new Date().toISOString()
        };
      }

      throw new Error("Unrecognized payload format");
    } catch (e) {
      console.warn("⚠️ Worker fetch failed, defaulting offline:", e);
      return {
        status: "offline",
        iso: new Date().toISOString()
      };
    }
  }

  // ----------------------------------
  // Read homepage ticker from ticker worker
  // ----------------------------------
  async function readTicker() {
    try {
      const res = await fetch(`${TICKER_URL}?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) throw new Error("Ticker fetch failed");
      return await res.json();
    } catch (e) {
      console.warn("⚠️ Ticker fetch failed:", e);
      return {
        active: false,
        message: "",
        expires: ""
      };
    }
  }

  // ----------------------------------
  // Format timestamp (CT)
  // ----------------------------------
  function fmtCT(iso) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      month: "numeric",
      day: "numeric",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  }

  // ----------------------------------
  // Availability pill copy
  // ----------------------------------
  function renderPillContent(status, iso) {
    const stamp = fmtCT(iso);

    switch (status) {
      case "online":
        return {
          text: `🟢 Available — text to line it up · Updated ${stamp}`,
          cls: "online"
        };
      case "away":
        return {
          text: `🟡 Limited availability — text to check · Updated ${stamp}`,
          cls: "away"
        };
      default:
        return {
          text: `🔴 Not available right now — text to plan ahead · Updated ${stamp}`,
          cls: "offline"
        };
    }
  }

  // ----------------------------------
  // Render homepage ticker
  // ----------------------------------
  function renderTicker(tickerData) {
    const bar = document.getElementById("tickerBar");
    const text = document.getElementById("tickerText");

    if (!bar || !text) return;

    const isActive =
      tickerData &&
      tickerData.active === true &&
      typeof tickerData.message === "string" &&
      tickerData.message.trim().length > 0 &&
      (!tickerData.expires || Date.now() < Date.parse(tickerData.expires));

    if (!isActive) {
      bar.classList.add("hidden");
      text.textContent = "";
      return;
    }

    text.textContent = tickerData.message.trim();
    bar.classList.remove("hidden");
  }

  // ----------------------------------
  // Render pill + ticker
  // ----------------------------------
  async function renderPill() {
    const [statusData, tickerData] = await Promise.all([
      readStatus(),
      readTicker()
    ]);

    const { status, iso } = statusData;

    const pill = document.getElementById("status-pill");
    if (pill) {
      pill.classList.remove("online", "away", "offline", "status--loading");
      const { text, cls } = renderPillContent(status, iso);
      pill.textContent = text;
      pill.classList.add(cls);
    }

    renderTicker(tickerData);

    localStorage.setItem("bigred_status", status);

    const event = new CustomEvent("statusUpdated", {
      detail: { status, iso, tickerData }
    });
    document.dispatchEvent(event);

    if (status !== lastKnownStatus) {
      console.log(`🔄 Status changed: ${lastKnownStatus} → ${status}`);
      lastKnownStatus = status;
    }
  }

  // ----------------------------------
  // Auto-refresh
  // ----------------------------------
  function scheduleAutoRefresh() {
    setInterval(renderPill, 5000);
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