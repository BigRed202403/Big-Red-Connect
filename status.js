// status.js — v2025.10.17 • Simplified Stable Build
(function(){
  const pill = document.getElementById('status-pill');
  if(!pill) return;

  // 🟢 Default status if none stored
  const state = localStorage.getItem('bigred_status') || 'offline';
  updatePill(state);

  // 🔄 Listen for manual changes between pages/tabs
  window.addEventListener('storage', e => {
    if (e.key === 'bigred_status') updatePill(e.newValue);
  });

  // ✳️ Manual control from console (e.g. setBigRedStatus('online'))
  window.setBigRedStatus = function(state) {
    localStorage.setItem('bigred_status', state);
    sessionStorage.setItem('bigred_status', state);
    updatePill(state);
    document.dispatchEvent(new CustomEvent("statusUpdated", { detail: state }));
  };

  // 🎨 Pill display logic
  function updatePill(state){
    const map = {
      online:  ['🟢 On the road', 'status online'],
      away:    ['🟡 Away for now', 'status away'],
      offline: ['🔴 Offline', 'status offline']
    };
    const [label, cls] = map[state] || map.offline;
    pill.textContent = label;
    pill.className = cls;
  }

  // 🚀 Initialize baseline
  if (!localStorage.getItem('bigred_status')) {
    localStorage.setItem('bigred_status', 'offline');
  }
})();