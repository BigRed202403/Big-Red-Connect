// status.js — v2025.10.17b
(function(){
  const pill = document.getElementById('status-pill');
  if(!pill) return;

  // 🕒 Format local date/time (fallback)
  function formatTime(d = new Date()){
    return d.toLocaleString([], {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  }

  // 🟢 Load last-known status & display time
  const current = localStorage.getItem('bigred_status') || 'offline';
  const displayTime = localStorage.getItem('bigred_status_displaytime');
  const isoTime = localStorage.getItem('bigred_status_time');
  updatePill(current, displayTime, isoTime);

  // 🔄 Sync between tabs/pages
  document.addEventListener('statusUpdated', e => updatePill(e.detail));
  window.addEventListener('storage', e => {
    if (e.key === 'bigred_status') {
      updatePill(
        e.newValue,
        localStorage.getItem('bigred_status_displaytime'),
        localStorage.getItem('bigred_status_time')
      );
    }
  });

  // ✳️ Allow manual update (for console or index control)
  window.setBigRedStatus = function(state) {
    const now = new Date();
    const formatted = formatTime(now);
    localStorage.setItem('bigred_status', state);
    localStorage.setItem('bigred_status_time', now.toISOString());
    localStorage.setItem('bigred_status_displaytime', formatted);
    sessionStorage.setItem('bigred_status', state);
    updatePill(state, formatted, now.toISOString());
    document.dispatchEvent(new CustomEvent("statusUpdated", { detail: state }));
  };

  // 🎨 Update pill UI
  function updatePill(state, formatted, iso){
    const map = {
      online:  ['🟢 On the road', 'status online'],
      away:    ['🟡 Away for now', 'status away'],
      offline: ['🔴 Offline', 'status offline']
    };
    const [label, cls] = map[state] || map.offline;

    let showTime = '';
    if (formatted) {
      showTime = ` — updated ${formatted}`;
    } else if (iso) {
      showTime = ` — updated ${formatTime(new Date(iso))}`;
    }

    pill.textContent = `${label}${showTime}`;
    pill.className = cls;
  }

  // 🚀 Initialize default if missing
  if (!localStorage.getItem('bigred_status')) {
    const now = new Date();
    localStorage.setItem('bigred_status', 'offline');
    localStorage.setItem('bigred_status_time', now.toISOString());
    localStorage.setItem('bigred_status_displaytime', formatTime(now));
    updatePill('offline', formatTime(now), now.toISOString());
  }
})();