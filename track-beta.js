// ===============================
// Big Red Connect – Track My Ride Beta (Phase 1)
// ===============================

const MAP_KEY_URL = "https://bigred-status-updater.bigredtransportation.workers.dev/location";
const STATUS_URL  = "https://raw.githubusercontent.com/bigred202403/Big-Red-Connect/main/status.json";
const HQ = { lat: 35.3207, lng: -97.4929 };
let map, marker;

// Initialize map
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: HQ,
    zoom: 11,
    styles: [{ elementType: "labels.icon", stylers: [{ visibility: "off" }] }],
  });
  marker = new google.maps.Marker({
    map,
    title: "Big Red Connect Driver",
    icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#ff0000", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2 }
  });
  refreshData();
  setInterval(refreshData, 15000);
}

async function refreshData() {
  try {
    const [locRes, statusRes] = await Promise.all([
      fetch(MAP_KEY_URL + "?t=" + Date.now(), { cache: "no-store" }),
      fetch(STATUS_URL + "?t=" + Date.now(),  { cache: "no-store" })
    ]);
    const location = await locRes.json().catch(() => null);
    const status   = await statusRes.json().catch(() => ({ status: "offline" }));
    updateDisplay(location, status);
  } catch (e) {
    console.error("Update error:", e);
    showBanner("⚠️ Network error – retrying…", "offline");
  }
}

function updateDisplay(location, statusData) {
  const state = (statusData.status || "offline").toLowerCase();
  const pill  = document.getElementById("status-pill");
  pill.classList.remove("online", "away", "offline", "status--loading");

  const stamp = new Date(statusData.updated || Date.now()).toLocaleString("en-US", {
    timeZone: "America/Chicago", hour: "numeric", minute: "2-digit", timeZoneName: "short"
  });

  if (state === "online") {
    pill.classList.add("online");
    pill.textContent = `🟢 Online — as of ${stamp}`;
    showBanner("Big Red is on the move 🚗", "online");
    drawMarker(location);
  } else if (state === "away") {
    pill.classList.add("away");
    pill.textContent = `🟡 Limited Availability — as of ${stamp}`;
    showBanner("Big Red is nearby but finishing another connection.", "away");
    drawMarker(location);
  } else {
    pill.classList.add("offline");
    pill.textContent = `🔴 Offline — as of ${stamp}`;
    showBanner("Big Red is currently offline / unavailable.", "offline");
    marker.setMap(null);
    map.setCenter(HQ);
  }
}

function drawMarker(location) {
  if (!location || !location.latitude || !location.longitude) {
    showBanner("Location data not available.", "offline");
    marker.setMap(null);
    return;
  }
  const pos = { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) };
  marker.setPosition(pos);
  marker.setMap(map);
  map.setCenter(pos);
}

function showBanner(text, mode) {
  const banner = document.getElementById("banner");
  banner.textContent = text;
  banner.style.color = mode === "offline" ? "#999" : "#fff";
}

// Start
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMap);
} else initMap();