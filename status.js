/* status.js — shared across all pages */

document.addEventListener("DOMContentLoaded", () => {
  const pill = document.getElementById("status-pill");
  if (!pill) return;

  // read CURRENT_STATUS from the page or fallback
  const state = window.CURRENT_STATUS || "offline";

  let text = "";
  pill.classList.remove("online", "away", "offline");

  if (state === "online") {
    text = "🟢 Online";
    pill.classList.add("online");
  } else if (state === "away") {
    text = "🟡 Away";
    pill.classList.add("away");
  } else {
    text = "🔴 Offline";
    pill.classList.add("offline");
  }

  pill.textContent = text;

  // Broadcast status event so Live Map & others can react
  const event = new CustomEvent("statusUpdated", { detail: state });
  document.dispatchEvent(event);
});
