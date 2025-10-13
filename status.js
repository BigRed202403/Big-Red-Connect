// Point this to your Cloudflare Worker (existing toggle endpoint)
const STATUS_URL = "https://falling-night-3e4d.bigredtransportation.workers.dev/status";
// Expected JSON examples:
// { status: "online", updatedAt: "2025-10-12T21:03:00Z" }
// or { online: true, updatedAt: "..." }

const el = document.getElementById("status");
const text = el.querySelector(".status__text");

function setMode(mode, whenText){
  el.classList.remove("status--online","status--away","status--offline");
  el.classList.add(`status--${mode}`);
  const base =
    mode === "online" ? "Online — text to book now" :
    mode === "away"   ? "Briefly away — text and I’ll reply" :
                        "Offline — try again later";
  text.textContent = whenText ? `${base} • ${whenText}` : base;
}

async function refreshStatus(){
  try{
    const r = await fetch(STATUS_URL, { cache: "no-store" });
    const j = await r.json();

    // Normalize
    const mode = (j.status || (j.online ? "online" : "offline")).toLowerCase();
    const updated = j.updatedAt ? new Date(j.updatedAt) : null;
    const whenText = updated ? `updated ${updated.toLocaleTimeString()}` : "";

    if (["online","away","offline"].includes(mode)){
      setMode(mode, whenText);
    } else {
      setMode(j.online ? "online" : "offline", whenText);
    }
  }catch(e){
    setMode("offline", "status unavailable");
  }
}

refreshStatus();
setInterval(refreshStatus, 60_000);
