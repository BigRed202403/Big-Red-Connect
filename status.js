// ===============================
// Big Red Connect — status.js (Full Hybrid Version)
// ===============================
(function () {
  const TZ = "America/Chicago";
  const CLOUD_URL = "https://bigred-status-updater.bigredtransportation.workers.dev/status";
  const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/25268921/usf1s8c/";

  let lastKnownStatus = localStorage.getItem("bigred_status") || "offline";
  let lastWebhookTime = parseInt(localStorage.getItem("last_webhook_time") || "0", 10);

  // -------------------------------
  // Helper Functions
  // -------------------------------
  async function readStatus() {
    try {
      const res = await fetch(CLOUD_URL + "?t=" + Date.now(), {
        cache: "no-store",
        headers: { "Accept": "application/json" },
      });
      if (res.ok) {
        const j = await res.json();
        if (j && j.status) return { status: j.status.toLowerCase(), iso: j.updated };
      }
      throw new Error("Bad JSON");
    } catch (e) {
      console.warn("⚠️ Worker fetch failed, defaulting offline:", e);
      return { status: "offline", iso: new Date().toISOString() };
    }
  }

  function fmtCT(iso) {
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, month: "short", day: "numeric", year: "numeric"
    }).format(d);
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, hour: "numeric", minute: "2-digit", timeZoneName: "short"
    }).format(d);
    return `${date} · ${time}`;
  }

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

  // -------------------------------
  // Seasonal Image Logic
  // -------------------------------
  function getSeasonalImage() {
    const base = "https://raw.githubusercontent.com/BigRed202403/BigRed202403/main/";
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan
    const day = now.getDate();

    const inRange = (s, e) => day >= s && day <= e;

    // 🦃 October — use Thanksgiving look all month
    if (month === 9) {
      return base + "Big%20Red%20Live%20Holiday%201.png";
    }

    // 🦃 November — default holiday, Thanksgiving week override
    if (month === 10) {
      if (inRange(24, 30)) {
        return base + "Big%20Red%20Live%20Thanksgiving.png";
      } else {
        return base + "Big%20Red%20Live%20Holiday%201.png";
      }
    }

    // 🎄 December — default holiday, Christmas week override
    if (month === 11) {
      if (inRange(20, 26)) {
        return base + "Big%20Red%20Live%20Christmas.png";
      } else {
        return base + "Big%20Red%20Live%20Holiday%201.png";
      }
    }

    // 🧣 January — continue holiday look through New Year’s week
    if (month === 0 && inRange(1, 5)) {
      return base + "Big%20Red%20Live%20Holiday%201.png";
    }

    // ☀️ All other months (Feb–Sep) — rotate daily between Text Only & standard
    const evenDay = day % 2 === 0;
    return evenDay
      ? base + "Big%20Red%20Live%20Text%20Only.png"
      : base + "Big%20Red%20Live%202.png";
  }

  // -------------------------------
  // Randomized Caption System
  // -------------------------------
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getSeasonalCaption(month, day, timestamp) {
    const inRange = (s, e) => day >= s && day <= e;
    const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // 🦃 Thanksgiving Week (Nov 24–30)
    if (month === 10 && inRange(24, 30)) {
      return pickRandom([
        `🦃 Big Red Connect is LIVE — keeping your Thanksgiving connections safe and flat-rate this week!`,
        `🍁 Heading out for Thanksgiving fun? Ride local, ride safe — Big Red’s got you covered.`,
        `🦃 Flat rates, full bellies, and family time — Big Red Connect is rolling through Thanksgiving week!`,
      ]) + `\n\n🕓 ${timestamp}`;
    }

    // 🎄 Christmas Week (Dec 20–26)
    if (month === 11 && inRange(20, 26)) {
      return pickRandom([
        `🎄 Big Red Connect is LIVE — keeping the Christmas cheer rolling, one safe connection at a time!`,
        `🎅 From last call to Christmas Eve — Big Red Connect’s got your flat-rate holiday ride home.`,
        `🎁 Ride local, ride bright — Big Red Connect is your Christmas week connection!`,
      ]) + `\n\n🕓 ${timestamp}`;
    }

    // 🎁 Holiday Season (Nov–Dec default)
    if (month === 10 || month === 11) {
      return pickRandom([
        `🎁 Big Red Connect is LIVE — plan ahead this holiday season!`,
        `🎄 Holiday nights, flat rates, and local rides — Big Red’s on the move.`,
        `✨ From OKC lights to home safe — plan ahead with Big Red.`,
      ]) + `\n\n🕓 ${timestamp}`;
    }

    // 🍂 October (Thanksgiving look)
    if (month === 9) {
      return pickRandom([
        `🍂 Fall nights, flat rates, hometown rides — Big Red Connect is LIVE.`,
        `🦃 November’s coming fast — plan your local ride tonight.`,
        `🚗 Big Red’s rolling through fall — local, affordable, trusted.`,
      ]) + `\n\n🕓 ${timestamp}`;
    }

    // 🌤️ Default (rest of the year)
    return pickRandom([
      `🚗 Big Red Connect is LIVE — happy ${weekday}, OKC! Plan your flat-rate connection now.`,
      `🕓 Big Red Connect is rolling — no surge, no surprises, just solid local moves.`,
      `🚗 Your local flat-rate connection is LIVE — Big Red Connect, trusted in OKC.`,
      `🚗 From work to play — Big Red Connect is LIVE with predictable flat rates.`,
    ]) + `\n\n🕓 ${timestamp}`;
  }

  // -------------------------------
  // Zapier Webhook
  // -------------------------------
  async function sendZapierWebhook(status) {
    const now = Date.now();
    if (status !== "online" || now - lastWebhookTime < 10 * 60 * 1000) return; // 10-min cooldown

    const dt = new Date();
    const timestamp = dt.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
    const month = dt.getMonth();
    const day = dt.getDate();

    const caption = getSeasonalCaption(month, day, timestamp);
    const imageURL = getSeasonalImage();

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          message: caption,
          timestamp,
          image: imageURL,
          source: "status.js (Full Hybrid)"
        })
      });
      if (res.ok) {
        console.log("✅ Zapier webhook triggered successfully");
        localStorage.setItem("last_webhook_time", now.toString());
      } else {
        console.warn("❌ Zapier webhook failed:", res.status);
      }
    } catch (err) {
      console.error("⚠️ Webhook error:", err);
    }
  }

  // -------------------------------
  // UI & Sync Logic
  // -------------------------------
  async function renderPill() {
    const { status, iso } = await readStatus();
    const pill = document.getElementById("status-pill");
    if (!pill) return;

    pill.classList.remove("online", "away", "offline", "status--loading");
    const { text, cls } = renderPillContent(status, iso);
    pill.textContent = text;
    pill.classList.add(cls);

    localStorage.setItem("bigred_status", status);
    const event = new CustomEvent("statusUpdated", { detail: status });
    document.dispatchEvent(event);

    if (status !== lastKnownStatus && status === "online") {
      sendZapierWebhook(status);
    }
    lastKnownStatus = status;
  }

  // -------------------------------
  // Auto Midnight Refresh (updates image/caption daily)
  // -------------------------------
  function scheduleMidnightRefresh() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 5, 0); // 5 sec after midnight
    const msUntilMidnight = next - now;
    setTimeout(() => {
      console.log("🌙 Midnight refresh triggered");
      renderPill(); // pull fresh worker status
    }, msUntilMidnight);
  }

  // -------------------------------
  // Init
  // -------------------------------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPill);
  } else {
    renderPill();
  }
  setInterval(renderPill, 30000); // Worker refresh every 30 sec
  scheduleMidnightRefresh(); // recheck image/caption at midnight
})();