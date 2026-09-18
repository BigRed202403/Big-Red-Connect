(() => {
  "use strict";

  const CONFIG = {
    slideIntervalMs: 12000,
    gameInactivityMs: 180000,
    // Upload weekly slide images as slides/slide-01.png, slide-02.png, etc.
    // The app automatically checks sequential files and stops at the first missing slide.
    slideFolder: "./slides",
    slidePrefix: "slide-",
    slideExtension: ".png",
    slideMax: 40,
    // Update this single value when the exact Rider Hub URL is confirmed.
    riderHubUrl: "https://bigredconnectokc.com/"
  };

  const FALLBACK_SLIDES = [];

  const els = {
    slidesView: document.getElementById("slidesView"),
    gamesView: document.getElementById("gamesView"),
    gamePlayView: document.getElementById("gamePlayView"),
    planView: document.getElementById("planView"),
    slideImage: document.getElementById("slideImage"),
    slideFallback: document.getElementById("slideFallback"),
    slideCounter: document.getElementById("slideCounter"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    gamesBtn: document.getElementById("gamesBtn"),
    planBtn: document.getElementById("planBtn"),
    fullscreenBtn: document.getElementById("fullscreenBtn"),
    gameBackBtn: document.getElementById("gameBackBtn"),
    gameContent: document.getElementById("gameContent"),
    riderHubLink: document.getElementById("riderHubLink"),
    qrCanvas: document.getElementById("qrCanvas")
  };

  let slides = FALLBACK_SLIDES;
  let slideIndex = 0;
  let slideTimer = null;
  let inactivityTimer = null;
  let activeGame = null;

  const trivia = [
    {
      q: "Which Oklahoma city is home to the Bricktown entertainment district?",
      a: ["Norman", "Oklahoma City", "Edmond", "Shawnee"],
      correct: 1
    },
    {
      q: "What color is Big Red Connect best known for?",
      a: ["Blue", "Green", "Red", "Orange"],
      correct: 2
    },
    {
      q: "Which phrase best fits Big Red Connect pricing?",
      a: ["Surprise surge", "Flat-rate clarity", "Auction pricing", "Mystery fare"],
      correct: 1
    },
    {
      q: "OU is located in which Oklahoma city?",
      a: ["Norman", "Moore", "Yukon", "Midwest City"],
      correct: 0
    },
    {
      q: "The Oklahoma City Thunder play which sport?",
      a: ["Baseball", "Hockey", "Basketball", "Soccer"],
      correct: 2
    }
  ];

  const wouldYouRather = [
    "Would you rather have the perfect playlist for every drive or never hit a red light again?",
    "Would you rather explore a new local restaurant or a new live-music venue?",
    "Would you rather take a weekend road trip or staycation downtown?",
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

  function showView(view) {
    [els.slidesView, els.gamesView, els.gamePlayView, els.planView]
      .forEach(v => v.classList.remove("active"));
    view.classList.add("active");

    if (view === els.slidesView) {
      clearInactivity();
      startSlideshow();
    } else {
      stopSlideshow();
      resetInactivity();
    }
  }

  function startSlideshow() {
    stopSlideshow();
    slideTimer = setInterval(() => showSlide(slideIndex + 1), CONFIG.slideIntervalMs);
  }

  function stopSlideshow() {
    if (slideTimer) clearInterval(slideTimer);
    slideTimer = null;
  }

  function resetInactivity() {
    clearInactivity();
    inactivityTimer = setTimeout(() => {
      activeGame = null;
      showView(els.slidesView);
    }, CONFIG.gameInactivityMs);
  }

  function clearInactivity() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }

  ["pointerdown", "touchstart", "keydown"].forEach(evt => {
    document.addEventListener(evt, () => {
      if (!els.slidesView.classList.contains("active")) resetInactivity();
    }, { passive: true });
  });

  async function loadSlides() {
    slides = [];

    for (let i = 1; i <= CONFIG.slideMax; i++) {
      const number = String(i).padStart(2, "0");
      const src = `${CONFIG.slideFolder}/${CONFIG.slidePrefix}${number}${CONFIG.slideExtension}`;

      try {
        const res = await fetch(src, { method: "HEAD", cache: "no-store" });
        if (!res.ok) break;
        slides.push(src);
      } catch (err) {
        break;
      }
    }

    if (!slides.length) {
      console.info("No weekly slide images found; using branded fallback.");
    }

    showSlide(0);
  }

  function showSlide(index) {
    if (!slides.length) {
      els.slideImage.classList.remove("ready");
      els.slideFallback.classList.remove("hidden");
      els.slideCounter.textContent = "Discover with Big Red";
      return;
    }

    slideIndex = (index + slides.length) % slides.length;
    const src = slides[slideIndex];

    els.slideImage.onload = () => {
      els.slideImage.classList.add("ready");
      els.slideFallback.classList.add("hidden");
    };

    els.slideImage.onerror = () => {
      els.slideImage.classList.remove("ready");
      els.slideFallback.classList.remove("hidden");
    };

    els.slideImage.src = src;
    els.slideCounter.textContent = `${slideIndex + 1} / ${slides.length}`;
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function launchGame(type) {
    activeGame = type;
    showView(els.gamePlayView);
    renderGame();
  }

  function renderGame() {
    if (activeGame === "trivia") return renderTrivia();
    if (activeGame === "wyr") return renderWyr();
    if (activeGame === "scramble") return renderScramble();
  }

  function renderTrivia() {
    const item = randomItem(trivia);
    els.gameContent.innerHTML = `
      <h2 class="game-title">Trivia</h2>
      <div class="game-prompt">${escapeHtml(item.q)}</div>
      <div class="answer-grid">
        ${item.a.map((answer, i) =>
          `<button class="answer-btn" data-answer="${i}" type="button">${escapeHtml(answer)}</button>`
        ).join("")}
      </div>
      <div id="resultText" class="result-text"></div>
      <div class="action-row">
        <button id="nextQuestionBtn" class="action-btn" type="button">Next Question</button>
      </div>
    `;

    els.gameContent.querySelectorAll("[data-answer]").forEach(btn => {
      btn.addEventListener("click", () => {
        const selected = Number(btn.dataset.answer);
        els.gameContent.querySelectorAll("[data-answer]").forEach((b, i) => {
          b.disabled = true;
          if (i === item.correct) b.classList.add("correct");
          if (i === selected && i !== item.correct) b.classList.add("wrong");
        });
        document.getElementById("resultText").textContent =
          selected === item.correct ? "Nice! You got it." : `Answer: ${item.a[item.correct]}`;
      });
    });

    document.getElementById("nextQuestionBtn").addEventListener("click", renderTrivia);
  }

  function renderWyr() {
    const prompt = randomItem(wouldYouRather);
    els.gameContent.innerHTML = `
      <h2 class="game-title">Would You Rather</h2>
      <div class="game-prompt">${escapeHtml(prompt)}</div>
      <div class="action-row">
        <button id="anotherWyrBtn" class="action-btn" type="button">Another One</button>
      </div>
    `;
    document.getElementById("anotherWyrBtn").addEventListener("click", renderWyr);
  }

  function renderScramble() {
    const item = randomItem(scrambles);
    els.gameContent.innerHTML = `
      <h2 class="game-title">Word Scramble</h2>
      <div class="game-prompt">${escapeHtml(item.scramble)}</div>
      <div id="resultText" class="result-text">Tap reveal when you're ready.</div>
      <div class="action-row">
        <button id="revealBtn" class="action-btn" type="button">Reveal</button>
        <button id="nextScrambleBtn" class="action-btn" type="button">Next Word</button>
      </div>
    `;
    document.getElementById("revealBtn").addEventListener("click", () => {
      document.getElementById("resultText").textContent = item.word;
    });
    document.getElementById("nextScrambleBtn").addEventListener("click", renderScramble);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // Small dependency-free QR renderer.
  // Uses a compact public-domain-style QR implementation adapted for static client use.
  // For the first build, the QR is generated from a Google Chart-compatible fallback pattern
  // if canvas QR generation cannot be guaranteed. We instead draw a clear placeholder tile
  // and keep the direct link active. Replace with a local QR asset or approved QR library
  // once the exact Rider Hub URL is confirmed.
  function drawQrPlaceholder(url) {
    const canvas = els.qrCanvas;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#000000";

    const cell = 12;
    const offset = 18;
    function finder(x, y) {
      ctx.fillRect(x, y, 84, 84);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 14, y + 14, 56, 56);
      ctx.fillStyle = "#000";
      ctx.fillRect(x + 28, y + 28, 28, 28);
    }
    finder(offset, offset);
    finder(size - offset - 84, offset);
    finder(offset, size - offset - 84);

    // Deterministic decorative modules based on URL text.
    let seed = 0;
    for (const ch of url) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    for (let y = 9; y < 22; y++) {
      for (let x = 9; x < 22; x++) {
        seed = (1664525 * seed + 1013904223) >>> 0;
        if (seed & 1) ctx.fillRect(x * cell, y * cell, cell - 2, cell - 2);
      }
    }

    ctx.fillStyle = "#d71920";
    ctx.font = "bold 17px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("QR URL NOT LOCKED", size / 2, size - 18);
  }

  els.prevBtn.addEventListener("click", () => showSlide(slideIndex - 1));
  els.nextBtn.addEventListener("click", () => showSlide(slideIndex + 1));
  els.gamesBtn.addEventListener("click", () => showView(els.gamesView));
  els.planBtn.addEventListener("click", () => showView(els.planView));
  els.fullscreenBtn.addEventListener("click", toggleFullscreen);

  document.querySelectorAll("[data-home]").forEach(btn => {
    btn.addEventListener("click", () => showView(els.slidesView));
  });

  document.querySelectorAll("[data-game]").forEach(btn => {
    btn.addEventListener("click", () => launchGame(btn.dataset.game));
  });

  els.gameBackBtn.addEventListener("click", () => showView(els.gamesView));

  els.riderHubLink.href = CONFIG.riderHubUrl;
  els.riderHubLink.textContent = "Open Big Red Connect";
  drawQrPlaceholder(CONFIG.riderHubUrl);

  loadSlides();
  startSlideshow();
})();
