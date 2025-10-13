/* status.js – simplified unified logic (Oct 2025)
   Reads CURRENT_STATUS from live.html and updates UI on all pages
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

  // Set pill + visibility logic
  if (status === "online") {
    pill.textContent = "🟢 Online";
    pill.className = "status online";
    if (mapCard) mapCard.style.display = "block";
    if (offlineMsg) offlineMsg.style.display = "none";
    if (awayMsg) awayMsg.style.display = "none";
    if (mapTitle) mapTitle.textContent = "🟢 Currently Active";
  } 
  else if (status === "away") {
    pill.textContent = "🟡 Limited Availability";
    pill.className = "status away";
    if (mapCard) mapCard.style.display = "block";
    if (offlineMsg) offlineMsg.style.display = "none";
    if (awayMsg) awayMsg.style.display = "block";
    if (mapTitle) mapTitle.textContent = "🟡 Limited Availability";
  } 
  else {
    pill.textContent = "🔴 Big Red is currently offline — I’m off the road for now, but you can line up your next ride connection anytime. Text “RED” to 405-378-4024.";
    pill.className = "status offline";
    if (mapCard) mapCard.style.display = "none";
    if (offlineMsg) offlineMsg.style.display = "block";
    if (awayMsg) awayMsg.style.display = "none";
    if (mapTitle) mapTitle.textContent = "🔴 Offline";
  }
});
