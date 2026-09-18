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

  let triviaScore = 0;
  let triviaStreak = 0;
  let triviaAsked = 0;
  let lastTriviaIndex = -1;

  let scrambleStreak = 0;
  let lastScrambleIndex = -1;
  let lastWyrIndex = -1;

  const trivia = [
    { q: "Which Oklahoma city is home to the Bricktown entertainment district?", a: ["Norman","Oklahoma City","Edmond","Shawnee"], correct: 1 },
    { q: "OU is located in which Oklahoma city?", a: ["Norman","Moore","Yukon","Midwest City"], correct: 0 },
    { q: "The Oklahoma City Thunder play which sport?", a: ["Baseball","Hockey","Basketball","Soccer"], correct: 2 },
    { q: "Which Oklahoma city is directly south of Oklahoma City along I-35?", a: ["Moore","Yukon","Edmond","Shawnee"], correct: 0 },
    { q: "What is Oklahoma's state nickname?", a: ["The Sooner State","The Prairie State","The Lone Star State","The Volunteer State"], correct: 0 },
    { q: "Which famous highway runs through Oklahoma?", a: ["Route 66","Pacific Coast Highway","Blue Ridge Parkway","Route 1"], correct: 0 },
    { q: "What color is Big Red Connect best known for?", a: ["Blue","Green","Red","Orange"], correct: 2 },
    { q: "Which payment app uses a green square with a white dollar sign?", a: ["Venmo","Cash App","PayPal","Zelle"], correct: 1 },
    { q: "Which city is west of Oklahoma City?", a: ["Yukon","Shawnee","Norman","Stillwater"], correct: 0 },
    { q: "Which city is east of Oklahoma City?", a: ["Mustang","Yukon","Shawnee","Moore"], correct: 2 },
    { q: "Which instrument normally has 88 keys?", a: ["Guitar","Piano","Trumpet","Violin"], correct: 1 },
    { q: "Which planet is known as the Red Planet?", a: ["Venus","Mars","Jupiter","Mercury"], correct: 1 },
    { q: "Which ocean is the largest?", a: ["Atlantic","Indian","Arctic","Pacific"], correct: 3 },
    { q: "What is the capital of Texas?", a: ["Dallas","Houston","Austin","San Antonio"], correct: 2 },
    { q: "Which animal is the largest land mammal?", a: ["Giraffe","Elephant","Hippo","Rhino"], correct: 1 },
    { q: "Which band recorded 'Hotel California'?", a: ["Journey","Eagles","Foreigner","Boston"], correct: 1 },
    { q: "Which singer is known as the 'King of Rock and Roll'?", a: ["Elvis Presley","Johnny Cash","Prince","Billy Joel"], correct: 0 },
    { q: "Which movie features a DeLorean time machine?", a: ["Top Gun","Back to the Future","Ghostbusters","Ferris Bueller's Day Off"], correct: 1 },
    { q: "Which movie features the line 'Wax on, wax off'?", a: ["Rocky","The Karate Kid","Footloose","Dirty Dancing"], correct: 1 },
    { q: "Which sport uses a touchdown?", a: ["Baseball","Basketball","Football","Hockey"], correct: 2 },
    { q: "How many points is a free throw worth in basketball?", a: ["1","2","3","4"], correct: 0 },
    { q: "How many bases are on a baseball field?", a: ["3","4","5","6"], correct: 1 },
    { q: "Which U.S. holiday is celebrated on July 4?", a: ["Memorial Day","Labor Day","Independence Day","Veterans Day"], correct: 2 },
    { q: "Which season follows summer?", a: ["Spring","Winter","Fall","Monsoon"], correct: 2 },
    { q: "How many days are in a leap year?", a: ["364","365","366","367"], correct: 2 },
    { q: "Which drink is made from coffee and steamed milk?", a: ["Latte","Tea","Lemonade","Soda"], correct: 0 },
    { q: "Which country is famous for pizza and pasta?", a: ["Spain","Italy","France","Greece"], correct: 1 },
    { q: "Which gas do plants absorb from the air?", a: ["Oxygen","Helium","Carbon dioxide","Hydrogen"], correct: 2 },
    { q: "Which device measures temperature?", a: ["Barometer","Thermometer","Speedometer","Compass"], correct: 1 },
    { q: "Which direction does the sun rise from?", a: ["North","South","East","West"], correct: 2 },
    { q: "Which state borders Oklahoma to the south?", a: ["Kansas","Texas","Colorado","Missouri"], correct: 1 },
    { q: "Which city is home to Oklahoma State University?", a: ["Norman","Stillwater","Edmond","Lawton"], correct: 1 },
    { q: "Which city is home to the University of Central Oklahoma?", a: ["Edmond","Moore","Yukon","Shawnee"], correct: 0 },
    { q: "Which classic game uses hotels and railroads?", a: ["Clue","Monopoly","Risk","Sorry!"], correct: 1 },
    { q: "Which game uses kings, queens and jacks?", a: ["Chess","Playing cards","Dominoes","Checkers"], correct: 1 },
    { q: "Which decade gave us the original Nintendo Entertainment System in the U.S.?", a: ["1960s","1970s","1980s","1990s"], correct: 2 },
    { q: "Which fictional superhero is also known as Bruce Wayne?", a: ["Superman","Batman","Iron Man","Thor"], correct: 1 },
    { q: "Which fictional superhero is also known as Clark Kent?", a: ["Batman","Spider-Man","Superman","Flash"], correct: 2 },
    { q: "Which car brand makes the Silverado?", a: ["Ford","Toyota","Chevrolet","GMC"], correct: 2 },
    { q: "Which car brand makes the Acadia?", a: ["GMC","Honda","Jeep","Nissan"], correct: 0 }
  ];

  const wouldYouRather = [
    ["Control the music for every ride", "Never hit a red light again"],
    ["Take a weekend road trip", "Spend a weekend downtown"],
    ["Always get the window seat", "Always get extra legroom"],
    ["Have perfect weather every weekend", "Have zero traffic every weekend"],
    ["Explore a new restaurant", "Explore a new live-music venue"],
    ["Drive a classic muscle car", "Drive a brand-new luxury SUV"],
    ["Have free concert tickets", "Have free movie tickets"],
    ["Visit the mountains", "Visit the beach"],
    ["Be 20 minutes early everywhere", "Arrive exactly on time every time"],
    ["Have unlimited coffee", "Have unlimited tacos"],
    ["Know every song lyric", "Know every movie quote"],
    ["Never wait in line", "Never sit in traffic"],
    ["See your favorite band live", "Meet your favorite actor"],
    ["Take the scenic route", "Take the fastest route"],
    ["Have a personal chef", "Have a personal driver"]
  ];

  const scrambles = [
    { word: "OKLAHOMA", scramble: "HOMAOKLA", hint: "The state you're riding in." },
    { word: "BRICKTOWN", scramble: "TOWNBRICK", hint: "Downtown OKC entertainment district." },
    { word: "CONNECT", scramble: "TCONNEC", hint: "It's in the Big Red name." },
    { word: "THUNDER", scramble: "DERTHUN", hint: "OKC's NBA team." },
    { word: "NORMAN", scramble: "MANRON", hint: "Home of OU." },
    { word: "YUKON", scramble: "KUNYO", hint: "West of OKC." },
    { word: "SHAWNEE", scramble: "NEESHAW", hint: "East of OKC." },
    { word: "AIRPORT", scramble: "PORTAIR", hint: "Where flights begin and end." },
    { word: "MUSIC", scramble: "CUSIM", hint: "What riders hear in the car." },
    { word: "TRIVIA", scramble: "VIATRI", hint: "One of the games you're playing." },
    { word: "WEEKEND", scramble: "ENDWEEK", hint: "Friday through Sunday." },
    { word: "ROADTRIP", scramble: "TRIPROAD", hint: "A longer drive for fun." },
    { word: "CONCERT", scramble: "CERTCON", hint: "Live music event." },
    { word: "DOWNTOWN", scramble: "TOWNDOWN", hint: "City-center area." },
    { word: "PLAYLIST", scramble: "LISTPLAY", hint: "A group of songs." }
  ];

  function randomIndex(length, previousIndex) {
    if (length <= 1) return 0;

    let next = previousIndex;

    while (next === previousIndex) {
      next = Math.floor(Math.random() * length);
    }

    return next;
  }

  const anyPanelOpen = () =>
    !gamesPanel.hidden || !gamePanel.hidden || !planPanel.hidden;

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
      console.info("Autoplay was blocked. Waiting for rider interaction.", error);
    }
  }

  function retryVideo() {
    videoFallback.hidden = true;
    video.load();
    ensureVideoPlayback();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function launchGame(type) {
    activeGame = type;

    if (type === "trivia") {
      triviaScore = 0;
      triviaStreak = 0;
      triviaAsked = 0;
    }

    if (type === "scramble") {
      scrambleStreak = 0;
    }

    openPanel(gamePanel);
    renderActiveGame();
  }

  function renderActiveGame() {
    if (activeGame === "trivia") return renderTrivia();
    if (activeGame === "wyr") return renderWouldYouRather();
    if (activeGame === "scramble") return renderScramble();
  }

  function renderTrivia() {
    const index = randomIndex(trivia.length, lastTriviaIndex);
    lastTriviaIndex = index;

    const item = trivia[index];
    triviaAsked += 1;

    gameContent.innerHTML = `
      <div class="game-topline">
        <span>Score: <strong>${triviaScore}</strong></span>
        <span>Streak: <strong>${triviaStreak}</strong></span>
        <span>Question: <strong>${triviaAsked}</strong></span>
      </div>

      <h2 class="game-title">Trivia</h2>
      <div class="game-prompt">${escapeHtml(item.q)}</div>

      <div class="answer-grid">
        ${item.a.map((answer, answerIndex) => `
          <button
            class="answer-btn"
            data-answer="${answerIndex}"
            type="button"
          >
            ${escapeHtml(answer)}
          </button>
        `).join("")}
      </div>

      <div id="resultText" class="result-text" aria-live="polite"></div>

      <div class="next-row">
        <button id="nextTriviaBtn" class="next-btn" type="button" hidden>
          Next Question
        </button>
        <button id="resetTriviaBtn" class="secondary-game-btn" type="button">
          New Game
        </button>
      </div>
    `;

    const answerButtons = gameContent.querySelectorAll("[data-answer]");
    const resultText = document.getElementById("resultText");
    const nextButton = document.getElementById("nextTriviaBtn");

    answerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selected = Number(button.dataset.answer);
        const isCorrect = selected === item.correct;

        answerButtons.forEach((candidate, answerIndex) => {
          candidate.disabled = true;

          if (answerIndex === item.correct) {
            candidate.classList.add("correct");
          }

          if (answerIndex === selected && !isCorrect) {
            candidate.classList.add("wrong");
          }
        });

        if (isCorrect) {
          triviaScore += 1;
          triviaStreak += 1;
          resultText.textContent = triviaStreak >= 3
            ? `Correct! 🔥 ${triviaStreak} in a row.`
            : "Correct!";
        } else {
          triviaStreak = 0;
          resultText.textContent = `Answer: ${item.a[item.correct]}`;
        }

        nextButton.hidden = false;
      }, { once: true });
    });

    nextButton.addEventListener("click", renderTrivia);

    document.getElementById("resetTriviaBtn").addEventListener("click", () => {
      triviaScore = 0;
      triviaStreak = 0;
      triviaAsked = 0;
      renderTrivia();
    });
  }

  function renderWouldYouRather() {
    const index = randomIndex(wouldYouRather.length, lastWyrIndex);
    lastWyrIndex = index;

    const [leftChoice, rightChoice] = wouldYouRather[index];

    gameContent.innerHTML = `
      <h2 class="game-title">Would You Rather</h2>
      <div class="game-prompt">Pick one.</div>

      <div class="wyr-grid">
        <button class="wyr-choice" data-wyr-choice="${escapeHtml(leftChoice)}" type="button">
          ${escapeHtml(leftChoice)}
        </button>

        <div class="wyr-or">OR</div>

        <button class="wyr-choice" data-wyr-choice="${escapeHtml(rightChoice)}" type="button">
          ${escapeHtml(rightChoice)}
        </button>
      </div>

      <div id="wyrResult" class="result-text" aria-live="polite"></div>

      <div class="next-row">
        <button id="nextWyrBtn" class="next-btn" type="button">
          Another One
        </button>
      </div>
    `;

    const result = document.getElementById("wyrResult");

    gameContent.querySelectorAll("[data-wyr-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        gameContent.querySelectorAll("[data-wyr-choice]").forEach((candidate) => {
          candidate.classList.remove("selected");
        });

        button.classList.add("selected");
        result.textContent = `You picked: ${button.dataset.wyrChoice}`;
      });
    });

    document.getElementById("nextWyrBtn").addEventListener("click", renderWouldYouRather);
  }

  function renderScramble() {
    const index = randomIndex(scrambles.length, lastScrambleIndex);
    lastScrambleIndex = index;

    const item = scrambles[index];

    gameContent.innerHTML = `
      <div class="game-topline">
        <span>Streak: <strong>${scrambleStreak}</strong></span>
      </div>

      <h2 class="game-title">Word Scramble</h2>

      <div class="scramble-word">${escapeHtml(item.scramble)}</div>

      <div id="scrambleHint" class="scramble-hint" hidden>
        Hint: ${escapeHtml(item.hint)}
      </div>

      <div id="scrambleResult" class="result-text" aria-live="polite">
        Unscramble the word.
      </div>

      <div class="next-row">
        <button id="hintBtn" class="secondary-game-btn" type="button">
          Hint
        </button>

        <button id="revealBtn" class="next-btn" type="button">
          Reveal
        </button>

        <button id="nextScrambleBtn" class="secondary-game-btn" type="button">
          Next Word
        </button>
      </div>
    `;

    let revealed = false;

    document.getElementById("hintBtn").addEventListener("click", () => {
      document.getElementById("scrambleHint").hidden = false;
    });

    document.getElementById("revealBtn").addEventListener("click", () => {
      if (revealed) return;

      revealed = true;
      scrambleStreak += 1;

      document.getElementById("scrambleResult").textContent =
        `Answer: ${item.word} — streak ${scrambleStreak}`;
    });

    document.getElementById("nextScrambleBtn").addEventListener("click", renderScramble);
  }

  gamesBtn.addEventListener("click", () => {
    openPanel(gamesPanel);
    ensureVideoPlayback();
  });

  planBtn.addEventListener("click", () => {
    openPanel(planPanel);
    ensureVideoPlayback();
  });

  document.querySelectorAll("[data-close-panel]").forEach((button) => {
    button.addEventListener("click", hideAllPanels);
  });

  document.querySelectorAll("[data-game]").forEach((button) => {
    button.addEventListener("click", () => launchGame(button.dataset.game));
  });

  backToGamesBtn.addEventListener("click", () => {
    activeGame = null;
    openPanel(gamesPanel);
  });

  retryVideoBtn.addEventListener("click", retryVideo);

  video.addEventListener("canplay", () => {
    videoFallback.hidden = true;
  });

  video.addEventListener("error", () => {
    videoFallback.hidden = false;
  });

  ["pointerdown", "touchstart", "keydown"].forEach((eventName) => {
    document.addEventListener(
      eventName,
      () => {
        if (anyPanelOpen()) {
          resetInactivityTimer();
        }

        ensureVideoPlayback();
      },
      { passive: true }
    );
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      ensureVideoPlayback();
    }
  });

  const source = video.querySelector("source");

  if (source && source.src !== CONFIG.videoUrl) {
    source.src = CONFIG.videoUrl;
    video.load();
  }

  ensureVideoPlayback();
})();