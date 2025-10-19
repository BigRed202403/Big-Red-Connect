// status.js — v2025.10.19 • persistent last-change timestamp
(function(){
  const pill = document.getElementById('status-pill');
  if(!pill) return;

  // 🟢 default fallback
  if (!localStorage.getItem('bigred_status')) {
    localStorage.setItem('bigred_status', 'offline');
    localStorage.setItem('bigred_status_time', new Date().toISOString());
  }

  updatePill(localStorage.getItem('bigred_status'));

  // 🔄 listen for cross-tab changes
  window.addEventListener('storage', e => {
    if (e.key === 'bigred_status') updatePill(e.newValue);
  });

  // ✳️ manual override (from console or index.html)
  window.setBigRedStatus = function(state){
    const current = localStorage.getItem('bigred_status');
    if (state !== current) {
      localStorage.setItem('bigred_status', state);
      localStorage.setItem('bigred_status_time', new Date().toISOString());
      sessionStorage.setItem('bigred_status', state);
      updatePill(state);
      document.dispatchEvent(new CustomEvent("statusUpdated", { detail: state }));
    }
  };

  // 🎨 build the pill text
  function updatePill(state){
    const map = {
      online:  ['🟢 On the road', 'status online'],
      away:    ['🟡 Away for now', 'status away'],
      offline: ['🔴 Offline', 'status offline']
    };
    const [label, cls] = map[state] || map.offline;

    // format last-change timestamp
    const iso = localStorage.getItem('bigred_status_time');
    let timeText = '';
    if (iso) {
      const d = new Date(iso);
      const options = { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' };
      timeText = `\n(Last updated: ${d.toLocaleString(undefined, options)})`;
    }

    pill.textContent = `${label}${timeText}`;
    pill.className = cls;
  }
})();
