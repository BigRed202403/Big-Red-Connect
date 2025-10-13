/*
  status.js — Big Red Connect
  Updated: Oct 2025

  ✅ Shared across all pages
  ✅ Auto updates color/message
  ✅ Triggers event for other scripts (e.g. hides map)
*/

async function loadStatus() {
  const pill = document.getElementById("status-pill");
  if (!pill) return;

  try {
    const res = await fetch("status.json", { cache: "no-store" });
    const data = await res.json();

    let status = (data.status || "offline").toLowerCase();
    let message = "";
    let emoji = "🚗";

    // --- Determine text based on status ---
    if (status === "online") {
      pill.className = "status status--online";
      message = "Big Red is live and accepting ride connections. Text “RED” to (405) 378-4024.";
      emoji = "🟢";
    } 
    else if (status === "away") {
      pill.className = "status status--away";
      message = "Big Red is currently away — limited availability. You can still text “RED” to plan your next connection.";
      emoji = "🟡";
    } 
    else {
      pill.className = "status status--offline";
      message = "Big Red is currently offline — I’m off the road for now, but you can line up your next ride connection anytime. Text “RED” to (405) 378-4024.";
      emoji = "🔴";
    }

    pill.innerHTML = `${emoji} ${message}`;

    // ✅ Dispatch status change event (for other pages)
    const evt = new CustomEvent("statusUpdated", { detail: status });
    document.dispatchEvent(evt);

  } catch (e) {
    console.error("Status fetch failed:", e);
    const pill = document.getElementById("status-pill");
    if (pill) {
      pill.className = "status status--offline";
      pill.textContent = "Unable to load live status.";
    }
    // still dispatch event so dependent pages can hide map
    const evt = new CustomEvent("statusUpdated", { detail: "offline" });
    document.dispatchEvent(evt);
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", loadStatus);
