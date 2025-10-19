// status.js — v2025.10.20 • Adds timestamp to pill display
(function(){
  const pill = document.getElementById('status-pill');
  if(!pill) return;

  // 🟢 Default status if none stored
  const state = localStorage.getItem('bigred_status') || 'offline';
  const time  = localStorage.getItem('bigred_status_time');
  updatePill(state, time);

  // 🔄 Listen for manual changes between pages/tabs
  window.addEventListener('storage', e => {
    if (e.key === 'bigred_status' || e.key === 'bigred_status_time') {
      const newState = localStorage.getItem('bigred_status');
      const newTime  = localStorage.getItem('bigred_status_time');
      updatePill(newState, newTime);
    }
  });

  // ✳️ Manual control from console (e.g. setBigRedStatus('online'))
  window.setBigRedStatus = function(state) {
    const now = new Date();
    localStorage.setItem('bigred_status', state);
    localStorage.setItem('bigred_status_time', now.toISOString());
    sessionStorage.setItem('bigred_status', state);
    updatePill(state, now.toISOString());
    document.dispatchEvent(new CustomEvent("statusUpdated", { detail: state }));
  };

  // 🎨 Pill display logic
  function updatePill(state, timeIso){
    const map = {
      online:  ['🟢 On the road', 'status online'],
      away:    ['🟡 Away for now', 'status away'],
      offline: ['🔴 Offline', 'status offline']
    };
    const [label, cls] = map[state] || map.offline;

    // 🕒 Format timestamp if available
    let timeDisplay = '';
    if (timeIso) {
      const d = new Date(timeIso);
      timeDisplay = d.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    pill.textContent = timeDisplay
      ? `${label} — Updated ${timeDisplay}`
      : label;
    pill.className = cls;
  }

  // 🚀 Initialize baseline if none set
  if (!localStorage.getItem('bigred_status')) {
    localStorage.setItem('bigred_status', 'offline');
    localStorage.setItem('bigred_status_time', new Date().toISOString());
  }
})();
