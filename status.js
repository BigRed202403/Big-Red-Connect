/* ===============================
   Big Red Connect — Status Sync
   Updated: Oct 2025
   Works globally across all pages
=============================== */

document.addEventListener("DOMContentLoaded", () => {
  // Default to offline if not set
  let currentState = "offline";

  // ✅ If CURRENT_STATUS exists in the page (from index.html), use it
  if (typeof CURRENT_STATUS !== "undefined") {
    currentState = CURRENT_STATUS.trim().toLowerCase();
  }

  // ✅ Emit event so all pages (like live.html) can react
  const statusEvent = new CustomEvent("statusUpdated", { detail: currentState });
  document.dispatchEvent(statusEvent);

  // ✅ Update the pill on the current page
  const pill = document.getElementById("status-pill");
  if (!pill) return;

  pill.classList.remove("status--loading");
  pill.classList.remove("online", "away", "offline");

  if (currentState === "online") {
    pill.textContent = "🟢 Online";
    pill.classList.add("online");
  } 
  else if (currentState === "away") {
    pill.textContent = "🟡 Away";
    pill.classList.add("away");
  } 
  else {
    pill.textContent = "🔴 Offline";
    pill.classList.add("offline");
  }
});
