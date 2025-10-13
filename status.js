/* status.js – unified simplified version (Oct 2025)
   Drives all page states from CURRENT_STATUS
*/

document.addEventListener("DOMContentLoaded", () => {
  const status = typeof CURRENT_STATUS !== "undefined" ? CURRENT_STATUS : "offline";
  document.dispatchEvent(new CustomEvent("statusUpdated", { detail: status }));

  const pill = document.getElementById("status-pill");
  const offlineMsg = document.getElementById("offline-message");
  const awayMsg = document.getElementById("away-message");
  const mapCard = document.getElementById("map-card");
  const mapTitle = document.getElementById("map-status-heading");

  if (!pill) return;

  // Reset all visibility first
  if (offlineMsg) offlineMsg.style.display = "none";
  if (awayMsg) awayMsg.style.display = "none";
  if (mapCard) mapCard.style.display = "none";

  // Apply per-status rules
  if (status === "online") {
    pill.textContent = "🟢 Online";
    pill.className = "status online";
    if (mapCard) mapCard.style.display = "block";
    if (mapTitle) {
      mapTitle.textContent = "🟢 Currently Active";
      mapTitle.style.color = "#4CAF50";
    }
  } 
  else if (status === "away") {
    pill.textContent = "🟡 Limited Availability — Short trips or quick connects may be possible.";
    pill.className = "status away";
    if (awayMsg) awayMsg.style.display = "block";
    if (mapTitle) {
      mapTitle.textContent = "🟡 Limited Availability";
      mapTitle.style.color = "#ffcc00";
    }
  } 
  else {
    pill.textContent = "🔴 Big Red is currently offline — I’m off the road for now, but you can line up your next ride connection anytime. Text “RED” to 405-378-4024.";
    pill.className = "status offline";
    if (offlineMsg) offlineMsg.style.display = "block";
    if (mapTitle) {
      mapTitle.textContent = "🔴 Offline";
      mapTitle.style.color = "#ff4444";
    }
  }
});
