// ===============================
// Big Red Connect – Track My Ride Beta (Phase 1)
// Unified with status.js feed for real-time status + location
// ===============================

const LOCATION_URL = "https://update-location.bigredtransportation.workers.dev/";
const HQ = { lat: 35.3207, lng: -97.4929 };
let map, marker;

// ===== Initialize Map =====
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: HQ,
    zoom: 11,
    styles: [{ elementType: "labels.icon", stylers: [{ visibility: "off" }] }],
  });
  marker = new google.maps.Marker({
    map,
    title: "Big Red Connect",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#ff0000",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 2,
    },
  });
  refreshLocation();
  setInterval(refreshLocation, 15000); // update every 15s
}

// ===== Fetch Live Location =====
async function refreshLocation() {
  try {
    const res = await fetch(LOCATION_URL + "?t=" + Date.now(), { cache: "no-store" });
    const loc = await res.json();
    drawMarker(loc);
  } catch (e) {
    console.error("Location fetch failed:", e);
  }
}

// ===== Draw Marker on Map =====
function drawMarker(loc) {
  if (!loc || !loc.latitude || !loc.longitude) return;
  const pos = { lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) };
  marker.setPosition(pos);
  map.setCenter(pos);
}

// ===== React to Live Status (from status.js) =====
document.addEventListener("statusUpdated", (e) => {
  const state = e.detail.toLowerCase();
  const banner = document.getElementById("banner");

  if (state === "online") {
    banner.textContent = "🟢 Big Red is on the move — live tracking active.";
    marker.setMap(map);
  } else if (state === "away") {
    banner.textContent = "🟡 Big Red is finishing another connection — location visible but limited availability.";
    marker.setMap(map);
  } else {
    banner.textContent = "🔴 Big Red is currently offline — live tracking paused.";
    marker.setMap(null);
    map.setCenter(HQ);
  }
});

// ===== Boot =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMap);
} else {
  initMap();
}