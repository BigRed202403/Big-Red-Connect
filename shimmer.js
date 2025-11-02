/* ==========================================================
   Big Red Connect — Shimmer / Splash Screen Logic
   Auto-selects message per page and runs once per session
========================================================== */

(function() {
  if (sessionStorage.getItem("brc_splash_shown")) return;

  let msg = "Loading Big Red Connect…";
  const title = document.title.toLowerCase();

  if (title.includes("fare")) msg = "Loading Fare Calculator…";
  else if (title.includes("live")) msg = "Loading Live Map…";
  else if (title.includes("faq")) msg = "Loading FAQs…";
  else if (title.includes("review")) msg = "Loading Reviews…";

  const w = document.createElement("div");
  w.id = "shimmer";
  w.innerHTML = `
    <img class="logo" src="official_logo_Nov.png" alt="Big Red Connect Logo">
    <div class="msg">${msg}</div>
  `;

  document.addEventListener("DOMContentLoaded", () => document.body.appendChild(w));
  window.addEventListener("load", () => {
    setTimeout(() => {
      w.style.transition = "opacity .35s";
      w.style.opacity = "0";
      setTimeout(() => {
        w.remove();
        sessionStorage.setItem("brc_splash_shown", "1");
      }, 350);
    }, 350);
  });
})();
