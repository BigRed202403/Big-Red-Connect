/* ============================================================
   Big Red Connect — Rider Session Guard (Option A)
   ------------------------------------------------------------
   Shared, page-agnostic session enforcement for ALL rider pages
   ============================================================ */

/* ------------------ CONFIG ------------------ */

const LS_LAST_ACTIVE_AT   = "brc_last_active_at_v1";
const LS_SESSION_CREATED  = "brc_session_created_at_v1";
const LS_SESSION_EXPIRES  = "brc_session_expires_at_v1";

const IDLE_LOGOUT_MS = 90 * 60 * 1000;          // 90 minutes idle
const HARD_CAP_MS    = 12 * 60 * 60 * 1000;     // 12 hours absolute
const RES_ACTIVE_WINDOW_MS = 6 * 60 * 60 * 1000; // reservation window

const ACTIVE_NOW_STATUSES  = ["ENROUTE","ARRIVED","PICKED_UP"];
const ACTIVE_SOON_STATUSES = ["REQUESTED","ACCEPTED"];

/* ------------------ HELPERS ------------------ */

function nowMs(){ return Date.now(); }

function endOfLocalDayMs(){
  const d = new Date();
  d.setHours(23,59,59,999);
  return d.getTime();
}

function parseIsoMs(iso){
  if(!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

function isLoggedIn(){
  const raw = localStorage.getItem("bigred_rider_profile_v1");
  if (!raw) return false;
  try {
    const p = JSON.parse(raw);
    return !!p?.riderId;
  } catch {
    return false;
  }
}

/* ------------------ SESSION LOGIC ------------------ */

function bookingCountsAsActiveForSession(b){
  const status = String(b?.status || "").toUpperCase();
  const type   = String(b?.type || "").toUpperCase();
  const now    = nowMs();

  if (ACTIVE_NOW_STATUSES.includes(status)) return true;

  if ((type === "INSTANT" || !type) && ACTIVE_SOON_STATUSES.includes(status)) {
    return true;
  }

  if (type === "RESERVATION" && ACTIVE_SOON_STATUSES.includes(status)) {
    const schedMs = parseIsoMs(b?.scheduledFor);
    if (!schedMs) return false;
    return (schedMs - now) <= RES_ACTIVE_WINDOW_MS;
  }

  return false;
}

function touchSession(){
  const now = nowMs();

  try { localStorage.setItem(LS_LAST_ACTIVE_AT, String(now)); } catch {}

  const created = Number(localStorage.getItem(LS_SESSION_CREATED) || "0");
  const expires = Number(localStorage.getItem(LS_SESSION_EXPIRES) || "0");

  if (!created || !expires) {
    const createdAt = now;
    const expiresAt = Math.min(
      createdAt + HARD_CAP_MS,
      endOfLocalDayMs()
    );

    try {
      localStorage.setItem(LS_SESSION_CREATED, String(createdAt));
      localStorage.setItem(LS_SESSION_EXPIRES, String(expiresAt));
    } catch {}
  }
}

function shouldLogout(hasActiveForSession){
  const now = nowMs();
  const lastActive = Number(localStorage.getItem(LS_LAST_ACTIVE_AT) || "0");
  const expiresAt  = Number(localStorage.getItem(LS_SESSION_EXPIRES) || "0");

  if (expiresAt && now > expiresAt) {
    return { yes:true, why:"hard_cap_or_eod" };
  }

  if (!hasActiveForSession && lastActive && (now - lastActive) > IDLE_LOGOUT_MS) {
    return { yes:true, why:"idle_timeout" };
  }

  return { yes:false };
}

/* ------------------ LOGOUT ------------------ */

async function onesignalLogoutSafe(){
  try {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    OneSignalDeferred.push(async function(OneSignal){
      try { await OneSignal.logout(); } catch {}
    });
  } catch {}
}

function clearRiderAuthStorage(){
  [
    "bigred_rider_profile_v1",
    "riderId",
    "riderName",
    "lastRideId",
    "brc_last_ride_id_v1",
    LS_LAST_ACTIVE_AT,
    LS_SESSION_CREATED,
    LS_SESSION_EXPIRES
  ].forEach(k => {
    try { localStorage.removeItem(k); } catch {}
  });
}

window.forceLogout = async function(reason){
  console.warn("🔒 Rider auto-logout:", reason);
  await onesignalLogoutSafe();
  clearRiderAuthStorage();
  try { sessionStorage.clear(); } catch {}
  location.replace("/index.html");
};

/* ------------------ ACTIVITY TRACKING ------------------ */

["click","keydown","scroll","touchstart"].forEach(evt => {
  window.addEventListener(evt, () => touchSession(), { passive:true });
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) touchSession();
});

/* ------------------ ACTIVE RIDE FEED ------------------ */
/* Pages that fetch bookings can set:
     window.__brc_has_active_for_session = true|false
   If not set, we assume false (safe default)
*/

window.__brc_has_active_for_session = false;

/* ------------------ ENFORCEMENT LOOP ------------------ */

async function enforceSession(){
  if (!isLoggedIn()) return;

  touchSession();

  const res = shouldLogout(!!window.__brc_has_active_for_session);
  if (res.yes) {
    await window.forceLogout(res.why);
  }
}

window.addEventListener("load", () => {
  if (!isLoggedIn()) return;

  touchSession();
  enforceSession();
  setInterval(enforceSession, 60 * 1000);
});