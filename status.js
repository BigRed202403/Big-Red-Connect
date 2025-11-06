// ===============================
// Big Red Connect — status.js (Worker + Zapier + Auto-Image Hybrid)
// ===============================
(function () {
  const TZ = "America/Chicago";
  const CLOUD_URL = "https://bigred-status-updater.bigredtransportation.workers.dev/status";
  const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/25268921/us8gc3n/";

  let lastKnownStatus = localStorage.getItem("bigred_status") || "offline";
  let lastWebhookTime = parseInt(localStorage.getItem("last_webhook_time") || "0", 10);

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

  // ---------- Auto Image Picker ----------
  function getSeasonalImage() {
    const month = new Date().getMonth(); // 0 = Jan
    const base = "https://raw.githubusercontent.com/BigRed202403/BigRed202403/main/";

    if (month === 9 || month === 10) {
      return base + "Big%20Red%20Live%20Thanksgiving.png"; // Oct–Nov
    } else if (month === 11) {
      return base + "Big%20Red%20Live%20Christmas.png";    // December
    } else if (month === 0) {
      return base + "Big%20Red%20Live%20Holiday%201.png";  // January
    } else {
      return base + "Big%20Red%20Live%202.png";            // Default
    }
  }

  // ---------- Zapier Webhook ----------
  async function sendZapierWebhook(status) {
    const now = Date.now();
    if (status !== "online" || now - lastWebhookTime < 10 * 60 * 1000) return; // 10-min cooldown

    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const caption = `🚗 Big Red Connect is now LIVE — happy ${day}, OKC!
Plan your flat-rate connection now.
Text "RED" to (405) 378-4024 or visit bigred202403.github.io/Big-Red-Connect.

🕓 ${timestamp}`;

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
          source: "status.js (Worker Hybrid)"
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

  // ---------- Render + Sync ----------
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

  // ---------- Initialize ----------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPill);
  } else {
    renderPill();
  }
  setInterval(renderPill, 30000);
})();