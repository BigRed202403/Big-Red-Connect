/**
 * Big Red Connect – Shared Status Handler
 * Version: 2025-10-13
 * Purpose: Reads /status.json and updates the #status-pill element on any page.
 */

const STATUS_URL = "/status.json";

async function loadStatus() {
  const pill = document.getElementById("status-pill");
  if (!pill) return; // Skip if page has no pill element

  pill.className = "status status--loading";
  pill.textContent = "Checking status…";

  try {
    const response = await fetch(STATUS_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load status");
    const data = await response.json();

    const online = Boolean(data.online);
    const away = Boolean(data.away);
    const updated = data.updated ? new Date(data.updated) : null;
    const updatedText = updated
      ? updated.toLocaleString([], {
          hour: "numeric",
          minute: "2-digit",
          month: "short",
          day: "numeric",
        })
      : "recently";

    if (online) {
      // 🟢 Online
      pill.className = "status status--online";
      pill.textContent = `Online now — updated ${updatedText}`;
    } else if (away) {
      // 🟡 Away
      pill.className = "status status--away";
      pill.textContent =
        `Temporarily unavailable — between connections, back shortly. (Updated ${updatedText})`;
    } else {
      // 🔴 Offline
      pill.className = "status status--offline";
      pill.innerHTML = `
        Big Red is currently offline<br>I’m off the road for now, but you can line up your next ride connection anytime.<br>
        Text <strong>“RED”</strong> to <a href="sms:+14053784024">405-378-4024</a>
      `;
    }
  } catch (err) {
    console.error("Status load error:", err);
    pill.className = "status status--offline";
    pill.textContent = "Status unavailable — please refresh later.";
  }
}

// Run once on page load
document.addEventListener("DOMContentLoaded", loadStatus);
