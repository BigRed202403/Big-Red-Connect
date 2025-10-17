// status.js — v2025.10.17
(function(){
  const pill = document.getElementById('status-pill');
  if(!pill) return;

  // 🕒 Format current local time nicely (12-hour AM/PM)
  function formatTime(d = new Date()){
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // 🟢 Load last known status + timestamp
  const current = localStorage.getItem('bigred_status') || 'offline';
  const lastUpdate = localStorage.getItem('bigred_status_time');
  updatePill(current, lastUpdate);

  // 🔄 Listen for status changes between tabs/pages
  document.addEventListener('statusUpdated', e => updatePill(e.detail));
  window.addEventListener('storage', e => {
    if (e.key === 'bigred_status') updatePill(e.newValue, localStorage.getItem('bigred_status_time'));
  });

  // ✳️ Allow manual update from console or other scripts
  window.setBigRedStatus = function(state) {
    const now = new Date();
    localStorage.setItem('bigred_status', state);
    localStorage.setItem('bigred_status_time', now.toISOString());
    sessionStorage.setItem('bigred_status', state);
    updatePill(state, now.toISOString());
    document.dispatchEvent(new CustomEvent("statusUpdated", { detail: state }));
  };

  // 🎨 Update the pill’s UI
  function updatePill(state, isoTime){
    const map = {
      online:  ['🟢 On the road', 'status online'],
      away:    ['🟡 Away for now', 'status away'],
      offline: ['🔴 Offline', 'status offline']
    };

    const [label, cls] = map[state] || map.offline;

    let displayTime = '';
    if(isoTime){
      const t = new Date(isoTime);
      displayTime = ` — updated ${formatTime(t)}`;
    }

    pill.textContent = `${label}${displayTime}`;
    pill.className = cls;
  }

  // 🚀 Initialize if no status stored yet
  if (!localStorage.getItem('bigred_status')) {
    localStorage.setItem('bigred_status', 'offline');
    localStorage.setItem('bigred_status_time', new Date().toISOString());
    updatePill('offline', new Date().toISOString());
  }
})();