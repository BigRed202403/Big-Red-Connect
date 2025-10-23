document.addEventListener("DOMContentLoaded", () => {
  const pill = document.getElementById("status-pill");
  const mapFrame = document.getElementById("glympse-frame");
  const msgBox = document.getElementById("status-message");

  // Get status and timestamp
  const state = localStorage.getItem("bigred_status_v4") || "offline";
  const time = localStorage.getItem("bigred_status_time") || "";

  // Update pill display
  pill.className = "status " + state;
  let text =
    state === "online"
      ? "🟢 Online"
      : state === "away"
      ? "🟡 Limited Availability"
      : "🔴 Offline";
  pill.textContent = time ? `${text} — as of ${time}` : text;

  // Optional: handle Live Map display (if present)
  if (mapFrame && msgBox) {
    if (state === "online") {
      mapFrame.style.display = "block";
      msgBox.style.display = "none";
    } else {
      mapFrame.style.display = "none";
      msgBox.style.display = "block";
      msgBox.innerHTML =
        state === "away"
          ? `<strong>🟡 Limited Availability</strong><br>I’m between runs or outside my usual area right now.<br>You can still text <strong>“RED”</strong> to (405) 378-4024 to plan ahead.`
          : `<strong>🔴 Currently Offline</strong><br>I’m off the road for now, but I’ll be back soon.<br>You can still line up your next connection anytime.`;
    }
  }
});