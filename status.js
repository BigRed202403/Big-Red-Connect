// ===============================
// Big Red Connect — status.js (v2 Cloudflare Edition)
// Optimized for Cloudflare Workers + Live GPS Reader
// ===============================
(function () {
  const TZ = "America/Chicago";
  const CLOUD_URL = "https://bigred-status-updater.bigredtransportation.workers.dev/status";
  const GPS_URL = "https://location-reader.bigredtransportation.workers.dev/?nocache=";

  // -------------------------------
  // Helper: Fetch status from Worker
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

  // -------------------------------
  // Status Pill Display
  // -------------------------------
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
    const base = "https://raw.githubusercontent.com/BigRed202403/Big-Red-Connect/main/";
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan
    const day = now.getDate();
    const inRange = (s, e) => day >= s && day <= e;

    // 🦃 October — Thanksgiving look
    if (month === 9) return base + "Big%20Red%20Live%20Holiday%201.png";

    // 🦃 November — Thanksgiving week override
    if (month === 10) {
      if (inRange(24, 30)) return base + "Big%20Red%20Live%20Thanksgiving.png";
      return base + "Big%20Red%20Live%20Holiday%201.png";
    }

    // 🎄 December — Christmas week override
    if (month === 11) {
      if (inRange(20, 26)) return base + "Big%20Red%20Live%20Christmas.png";
      return base + "Big%20Red%20Live%20Holiday%201.png";
    }

    // 🧣 January 1–5 — New Year continuation
    if (month === 0 && inRange(1, 5)) return base + "Big%20Red%20Live%20Holiday%201.png";

    // ☀️ Default rotation (Feb–Sep)
    return day % 2 === 0
      ? base + "Big%20Red%20Live%20Text%20Only.png"
      : base + "Big%20Red%20Live%202.png";
  }

  // -------------------------------
  // Caption Logic (with CTA)
  // -------------------------------
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getSeasonalCaption(month, day, timestamp) {
    const inRange = (s, e) => day >= s && day <= e;
    const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // 🦃 Thanksgiving Week
    if (month === 10 && inRange(24, 30)) {
      return pickRandom([
        `🦃 Big Red Connect is LIVE — keeping your Thanksgiving connections safe and flat-rate this week!`,
        `🍁 Heading out for Thanksgiving fun? Ride local, ride safe — Big Red’s got you covered.`,
        `🦃 Flat rates, full bellies, and family time — Big Red Connect is rolling through Thanksgiving week!`,
      ]) + CTA(timestamp);
    }

    // 🎄 Christmas Week
    if (month === 11 && inRange(20, 26)) {
      return pickRandom([
        `🎄 Big Red Connect is LIVE — keeping the Christmas cheer rolling, one safe connection at a time!`,
        `🎅 From last call to Christmas Eve — Big Red Connect’s got your flat-rate holiday ride home.`,
        `🎁 Ride local, ride bright — Big Red Connect is your Christmas week connection!`,
      ]) + CTA(timestamp);
    }

    // 🎁 General Holiday Season (Nov–Dec)
    if (month === 10 || month === 11) {
      return pickRandom([
        `🎁 Big Red Connect is LIVE — plan ahead this holiday season!`,
        `🎄 Holiday nights, flat rates, and local rides — Big Red’s on the move.`,
        `✨ From OKC lights to home safe — plan ahead with Big Red.`,
      ]) + CTA(timestamp);
    }

    // 🍂 Fall / October
    if (month === 9) {
      return pickRandom([
        `🍂 Fall nights, flat rates, hometown rides — Big Red Connect is LIVE.`,
        `🦃 November’s coming fast — plan your local ride tonight.`,
        `🚗 Big Red’s rolling through fall — local, affordable, trusted.`,
      ]) + CTA(timestamp);
    }

    // 🌤️ Default
    return pickRandom([
      `🚗 Big Red Connect is LIVE — happy ${weekday}, OKC! Plan your flat-rate connection now.`,
      `🕓 Big Red Connect is rolling — no surge, no surprises, just solid local moves.`,
      `🚗 From work to play — Big Red Connect is LIVE with predictable flat rates.`,
    ]) + CTA(timestamp);
  }

  function CTA(timestamp) {
    return `\n\n🕓 ${timestamp}\n\nNo surprises. Just solid local moves.\nText ‘RED’ to 405-378-4024 — your affordable flat-rate ride connection.\nVeteran Owned • Affordable • Local • Trusted.`;
  }

  // -------------------------------
  // Main Render
  // -------------------------------
  async function renderPill() {
    const { status, iso } = await readStatus();
    const pill = document.getElementById("status-pill");
    if (!pill) return;

    pill.classList.remove("online", "away", "offline", "status--loading");
    const { text, cls } = renderPillContent(status, iso);
    pill.textContent = text;
    pill.classList.add(cls);

    // For optional caption/image display (if desired)
    const dt = new Date();
    const month = dt.getMonth();
    const day = dt.getDate();
    const timestamp = dt.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: TZ
    });

    // Example usage: console.log for future FB automation or share page
    console.log("🖼️", getSeasonalImage());
    console.log("💬", getSeasonalCaption(month, day, timestamp));
  }

  // -------------------------------
  // Optional: Live GPS Reader
  // -------------------------------
  async function updateLiveLocation() {
    try {
      const res = await fetch(GPS_URL + Date.now(), { cache: "no-store" });
      const data = await res.json();
      console.log(`📍 Live GPS → Lat: ${data.latitude}, Lng: ${data.longitude}`);
      // Optional: integrate with map or display element here
    } catch (err) {
      console.warn("⚠️ GPS fetch failed:", err);
    }
  }

  // -------------------------------
  // Midnight + 5-second refresh loops
  // -------------------------------
  function scheduleMidnightRefresh() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 5, 0); // 5 sec after midnight
    const msUntilMidnight = next - now;
    setTimeout(() => {
      console.log("🌙 Midnight refresh triggered");
      renderPill();
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

  // 🔁 Faster sync loop (5 seconds)
  setInterval(() => {
    renderPill();
    updateLiveLocation();
  }, 5000);

  scheduleMidnightRefresh();
})();
