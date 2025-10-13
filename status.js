/* ===============================
   Big Red Connect — Unified Status Logic
   Updated: Oct 2025
   One source of truth = index.html
=============================== */

document.addEventListener("DOMContentLoaded", async () => {
  let currentState = "offline";

  try {
    // 🔍 Fetch CURRENT_STATUS from index.html directly
    const response = await fetch("index.html", { cache: "no-store" });
    const text = await response.text();

    // Regex match to grab CURRENT_STATUS from the script tag
    const match = text.match(/CURRENT_STATUS\s*=\s*["'](online|away|offline)["']/i);
    if (match && match[1]) {
      currentState = match[1].toLowerCase();
    }
  } catch (err) {
    console.warn("Could not read status from index.html. Defaulting to offline.", err);
  }

  // ✅ Fire statusUpdated event for all pages (like live.html)
  const statusEvent = new CustomEvent("statusUpdated", { detail: currentState });
  document.dispatchEvent(statusEvent);

  // ✅ Update the pill (if it exists)
  const pill = document.getElementById("status-pill");
  if (!pill) return;

  pill.classList.remove("status--loading", "online", "away", "offline");

  if (currentState === "online") {
    pill.textContent = "🟢 Online";
    pill.classList.add("online");
  } else if (currentState === "away") {
    pill.textContent = "🟡 Away";
    pill.classList.add("away");
  } else {
    pill.textContent = "🔴 Offline";
    pill.classList.add("offline");
  }
});
