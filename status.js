// status.js — v2025.10.15
(function(){
  const pill = document.getElementById('status-pill');
  if(!pill) return;

  // 🟢 Read last-known status or set default
  const current = sessionStorage.getItem('bigred_status') || 'offline';
  updatePill(current);

  // 🔄 Listen for status changes between tabs or pages
  document.addEventListener('statusUpdated', e => updatePill(e.detail));
  window.addEventListener('storage', e => {
    if (e.key === 'bigred_status') updatePill(e.newValue);
  });

  // ✳️ Allow manual update from console or other scripts
  window.setBigRedStatus = function(state) {
    sessionStorage.setItem('bigred_status', state);
    localStorage.setItem('bigred_status', state);
    updatePill(state);
    document.dispatchEvent(new CustomEvent("statusUpdated", { detail: state }));
  };

  // 🎨 Update the pill UI
  function updatePill(state){
    const map = {
      online: ['🟢 Big Red is Live', 'status online'],
      away: ['🟡 Limited Availability', 'status away'],
      offline: ['🔴 Offline', 'status offline']
    };
    const [text, cls] = map[state] || map.offline;
    pill.textContent = text;
    pill.className = cls;
  }
})();
