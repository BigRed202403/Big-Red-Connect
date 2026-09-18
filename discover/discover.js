(() => {
  "use strict";

  const CONFIG = {
    videoUrl: "https://media.bigredconnectokc.com/discover-current.mov",
    inactivityMs: 180000
  };

  const video = document.getElementById("presentationVideo");
  const videoFallback = document.getElementById("videoFallback");
  const retryVideoBtn = document.getElementById("retryVideoBtn");
  const gamesBtn = document.getElementById("gamesBtn");
  const planBtn = document.getElementById("planBtn");
  const gamesPanel = document.getElementById("gamesPanel");
  const gamePanel = document.getElementById("gamePanel");
  const planPanel = document.getElementById("planPanel");
  const backToGamesBtn = document.getElementById("backToGamesBtn");
  const gameContent = document.getElementById("gameContent");

  let inactivityTimer = null;
  let activeGame = null;

  const trivia = [
    { q: "Which Oklahoma city is home to the Bricktown entertainment district?", a: ["Norman","Oklahoma City","Edmond","Shawnee"], correct: 1 },
    { q: "What color is Big Red Connect best known for?", a: ["Blue","Green","Red","Orange"], correct: 2 },
    { q: "OU is located in which Oklahoma city?", a: ["Norman","Moore","Yukon","Midwest City"], correct: 0 },
    { q: "The Oklahoma City Thunder play which sport?", a: ["Baseball","Hockey","Basketball","Soccer"], correct: 2 },
    { q: "Which Oklahoma city is directly south of Oklahoma City along I-35?", a: ["Moore","Yukon","Edmond","Shawnee"], correct: 0 }
  ];

  const wouldYouRather = [
    "Would you rather have the perfect playlist for every drive or never hit a red light again?",
    "Would you rather explore a new local restaurant or a new live-music venue?",
    "Would you rather take a weekend road trip or a staycation downtown?",
    "Would you rather always get the window seat or always control the music?",
    "Would you rather arrive 20 minutes early or exactly on time every time?"
  ];

  const scrambles = [
    { word: "OKLAHOMA", scramble: "HOMAOKLA" },
    { word: "BRICKTOWN", scramble: "TOWNBRICK" },
    { word: "CONNECT", scramble: "TCONNEC" },
    { word: "THUNDER", scramble: "DERTHUN" },
    { word: "NORMAN", scramble: "MANRON" }
  ];

  const randomItem = (items) => items[Math.floor(Math.random() * items.length)];
  const anyPanelOpen = () => !gamesPanel.hidden || !gamePanel.hidden || !planPanel.hidden;

  function hideAllPanels() {
    gamesPanel.hidden = true;
    gamePanel.hidden = true;
    planPanel.hidden = true;
    activeGame = null;
    clearInactivityTimer();
  }

  function openPanel(panel) {
    gamesPanel.hidden = true;
    gamePanel.hidden = true;
    planPanel.hidden = true;
    panel.hidden = false;
    resetInactivityTimer();
  }

  function resetInactivityTimer() {
    clearInactivityTimer();
    if (!anyPanelOpen()) return;
    inactivityTimer = window.setTimeout(hideAllPanels, CONFIG.inactivityMs);
  }

  function clearInactivityTimer() {
    if (inactivityTimer) {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  }

  async function ensureVideoPlayback() {
    try {
      video.muted = true;
      await video.play();
      videoFallback.hidden = true;
    } catch (error) {
      console.info("Autoplay was blocked. Waiting for interaction.", error);
    }
  }

  function retryVideo() {
    videoFallback.hidden = true;
    video.load();
    ensureVideoPlayback();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  function launchGame(type) {
    activeGame = type;
    openPanel(gamePanel);
    renderActiveGame();
  }

  function renderActiveGame() {
    if (activeGame === "trivia") return renderTrivia();
    if (activeGame === "wyr") return renderWouldYouRather();
    if (activeGame === "scramble") return renderScramble();
  }

  function renderTrivia() {
    const item = randomItem(trivia);
    gameContent.innerHTML = `
      <h2 class="game-title">Trivia</h2>
      <div class="game-prompt">${escapeHtml(item.q)}</div>
      <div class="answer-grid">
        ${item.a.map((answer,index)=>`<button class="answer-btn" data-answer="${index}" type="button">${escapeHtml(answer)}</button>`).join("")}
      </div>
      <div id="resultText" class="result-text"></div>
      <div class="next-row"><button id="nextTriviaBtn" class="next-btn" type="button">Next Question</button></div>
    `;

    gameContent.querySelectorAll("[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        const selected = Number(button.dataset.answer);
        gameContent.querySelectorAll("[data-answer]").forEach((candidate,index) => {
          candidate.disabled = true;
          if (index === item.correct) candidate.classList.add("correct");
          if (index === selected && index !== item.correct) candidate.classList.add("wrong");
        });
        document.getElementById("resultText").textContent =
          selected === item.correct ? "Nice! You got it." : `Answer: ${item.a[item.correct]}`;
      });
    });

    document.getElementById("nextTriviaBtn").addEventListener("click", renderTrivia);
  }

  function renderWouldYouRather() {
    const prompt = randomItem(wouldYouRather);
    gameContent.innerHTML = `
      <h2 class="game-title">Would You Rather</h2>
      <div class="game-prompt">${escapeHtml(prompt)}</div>
      <div class="next-row"><button id="nextWyrBtn" class="next-btn" type="button">Another One</button></div>
    `;
    document.getElementById("nextWyrBtn").addEventListener("click", renderWouldYouRather);
  }

  function renderScramble() {
    const item = randomItem(scrambles);
    gameContent.innerHTML = `
      <h2 class="game-title">Word Scramble</h2>
      <div class="game-prompt">${escapeHtml(item.scramble)}</div>
      <div id="resultText" class="result-text">Tap reveal when you're ready.</div>
      <div class="next-row">
        <button id="revealBtn" class="next-btn" type="button">Reveal</button>
        <button id="nextScrambleBtn" class="next-btn" type="button">Next Word</button>
      </div>
    `;
    document.getElementById("revealBtn").addEventListener("click", () => {
      document.getElementById("resultText").textContent = item.word;
    });
    document.getElementById("nextScrambleBtn").addEventListener("click", renderScramble);
  }

  gamesBtn.addEventListener("click", () => { openPanel(gamesPanel); ensureVideoPlayback(); });
  planBtn.addEventListener("click", () => { openPanel(planPanel); ensureVideoPlayback(); });

  document.querySelectorAll("[data-close-panel]").forEach((button) => {
    button.addEventListener("click", hideAllPanels);
  });

  document.querySelectorAll("[data-game]").forEach((button) => {
    button.addEventListener("click", () => launchGame(button.dataset.game));
  });

  backToGamesBtn.addEventListener("click", () => { activeGame = null; openPanel(gamesPanel); });
  retryVideoBtn.addEventListener("click", retryVideo);

  video.addEventListener("canplay", () => { videoFallback.hidden = true; });
  video.addEventListener("error", () => { videoFallback.hidden = false; });

  ["pointerdown","touchstart","keydown"].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      if (anyPanelOpen()) resetInactivityTimer();
      ensureVideoPlayback();
    }, { passive: true });
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) ensureVideoPlayback();
  });

  const source = video.querySelector("source");
  if (source && source.src !== CONFIG.videoUrl) {
    source.src = CONFIG.videoUrl;
    video.load();
  }

  ensureVideoPlayback();
})();