/* ==========================================================
   Big Red Connect – Shared Status Script (Hybrid Display)
   Version: October 2025 (Final)
   One-line control in index.html:
     const CURRENT_STATUS = "online" | "away" | "offline"
   Applies everywhere via sessionStorage
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const pill = document.getElementById("status-pill");
  if (!pill) return;

  // Load status from index.html or previous session
  let status = window.CURRENT_STATUS || "offline";
  const stored = sessionStorage.getItem("bigred_status");
  if (stored) status = stored;

  // Save current for use on other pages
  sessionStorage.setItem("bigred_status", status);

  // Update pill content + styling
  updateStatusDisplay(status);

  // Notify other scripts (e.g. live map)
  const evt = new CustomEvent("statusUpdated", { detail: status });
  document.dispatchEvent(evt);
});

function updateStatusDisplay(status) {
  const pill = document.getElementById("status-pill");
  if (!pill) return;

  pill.classList.remove("status--loading", "online", "away", "offline");

  let main = "";
  let sub = "";

  switch (status) {
    case "online":
      pill.classList.add("online");
      main = "🟢 Online";
      sub = "Active and available for local connections";
      break;

    case "away":
      pill.classList.add("away");
      main = "🟡 Away";
      sub = "Limited availability — may respond with delay";
      break;

    default:
      pill.classList.add("offline");
      main = "🔴 Offline";
      sub = "Plan your next ride ahead — text “RED” anytime";
      break;
  }

  pill.innerHTML = `
    <div style="font-weight:600;font-size:1.05em;margin-bottom:2px;">${main}</div>
    <div style="font-size:0.85em;color:#bbb;">${sub}</div>
  `;
}
