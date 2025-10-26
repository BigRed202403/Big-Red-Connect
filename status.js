// ===============================
// Big Red Connect — status.js (Cloudflare Worker Live Version)
// Fetches live status directly from Worker (no GitHub caching)
// ===============================
(function () {
  const TZ = "America/Chicago";
  const CLOUD_URL = "https://bigred-status-updater.bigredtransportation.workers.dev/status";

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

  async function renderPill() {
    const { status, iso } = await readStatus();
    const pill = document.getElementById("status-pill");
    if (!pill) return;
    pill.classList.remove("online", "away", "offline", "status--loading");
    const { text, cls } = renderPillContent(status, iso);
    pill.textContent = text;
    pill.classList.add(cls);
  }

  // Run now + auto-refresh every 30 s
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPill);
  } else renderPill();
  setInterval(renderPill, 30000);
})();
