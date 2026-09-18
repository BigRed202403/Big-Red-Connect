(() => {
  "use strict";

  const CONFIG = {
    videoUrl: "https://media.bigredconnectokc.com/discover-current.mov",
    inactivityMs: 180000,

    triviaRounds: 15,
    wyrRounds: 10,
    scrambleRounds: 10,

    scrambleSeconds: 12,
    scrambleRevealMs: 1600
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
  let scrambleTimer = null;
  let scrambleDeadline = 0;

  const session = {
    trivia: null,
    wyr: null,
    scramble: null
  };

  const triviaBank = {
    easy: [
      { q: "Which planet is known as the Red Planet?", a: ["Venus","Mars","Jupiter","Mercury"], correct: 1 },
      { q: "How many days are in a leap year?", a: ["364","365","366","367"], correct: 2 },
      { q: "Which instrument normally has 88 keys?", a: ["Guitar","Piano","Trumpet","Violin"], correct: 1 },
      { q: "Which ocean is the largest?", a: ["Atlantic","Indian","Arctic","Pacific"], correct: 3 },
      { q: "What is the capital of Texas?", a: ["Dallas","Houston","Austin","San Antonio"], correct: 2 },
      { q: "Which sport uses a touchdown?", a: ["Baseball","Basketball","Football","Hockey"], correct: 2 },
      { q: "Which direction does the sun rise from?", a: ["North","South","East","West"], correct: 2 },
      { q: "Which season follows summer?", a: ["Spring","Winter","Fall","Monsoon"], correct: 2 },
      { q: "Which fictional superhero is Bruce Wayne?", a: ["Superman","Batman","Iron Man","Thor"], correct: 1 },
      { q: "How many points is a free throw worth?", a: ["1","2","3","4"], correct: 0 },
      { q: "Which Oklahoma city is home to Bricktown?", a: ["Norman","Oklahoma City","Edmond","Shawnee"], correct: 1 },
      { q: "OU is located in which Oklahoma city?", a: ["Norman","Moore","Yukon","Midwest City"], correct: 0 },
      { q: "The Oklahoma City Thunder play which sport?", a: ["Baseball","Hockey","Basketball","Soccer"], correct: 2 },
      { q: "Which state borders Oklahoma to the south?", a: ["Kansas","Texas","Colorado","Missouri"], correct: 1 },
      { q: "Which famous highway runs through Oklahoma?", a: ["Route 66","Route 1","Pacific Coast Highway","Blue Ridge Parkway"], correct: 0 }
    ],
    medium: [
      { q: "Which band recorded 'Hotel California'?", a: ["Journey","Eagles","Foreigner","Boston"], correct: 1 },
      { q: "Which movie features a DeLorean time machine?", a: ["Top Gun","Back to the Future","Ghostbusters","Ferris Bueller's Day Off"], correct: 1 },
      { q: "Which country is credited with inventing pizza in its modern form?", a: ["Spain","Italy","France","Greece"], correct: 1 },
      { q: "Which gas makes up most of Earth's atmosphere?", a: ["Oxygen","Nitrogen","Carbon dioxide","Hydrogen"], correct: 1 },
      { q: "How many bones are in the adult human body?", a: ["186","206","226","246"], correct: 1 },
      { q: "Which planet has the most visible ring system?", a: ["Mars","Saturn","Venus","Mercury"], correct: 1 },
      { q: "Which U.S. state is nicknamed the Sunshine State?", a: ["California","Florida","Arizona","Hawaii"], correct: 1 },
      { q: "Which decade saw the first U.S. release of the Nintendo Entertainment System?", a: ["1970s","1980s","1990s","2000s"], correct: 1 },
      { q: "What does NBA stand for?", a: ["National Baseball Association","National Basketball Association","North Basketball Alliance","National Ball Association"], correct: 1 },
      { q: "Which singer is known as the 'King of Rock and Roll'?", a: ["Elvis Presley","Johnny Cash","Prince","Billy Joel"], correct: 0 },
      { q: "Oklahoma became a state in which year?", a: ["1889","1907","1912","1921"], correct: 1 },
      { q: "Which city is home to Oklahoma State University?", a: ["Norman","Stillwater","Edmond","Lawton"], correct: 1 },
      { q: "Which river forms much of Oklahoma's southern border?", a: ["Arkansas River","Red River","Canadian River","Cimarron River"], correct: 1 },
      { q: "Which classic board game uses railroads and properties?", a: ["Clue","Monopoly","Risk","Sorry!"], correct: 1 },
      { q: "Which car brand makes the Acadia?", a: ["GMC","Honda","Jeep","Nissan"], correct: 0 }
    ],
    hard: [
      { q: "What is the chemical symbol for tungsten?", a: ["T","Tu","W","Tg"], correct: 2 },
      { q: "Which artist painted 'The Persistence of Memory'?", a: ["Picasso","Dalí","Monet","Van Gogh"], correct: 1 },
      { q: "Which element has atomic number 79?", a: ["Silver","Gold","Platinum","Mercury"], correct: 1 },
      { q: "Which country has the city of Dubrovnik?", a: ["Croatia","Slovenia","Greece","Montenegro"], correct: 0 },
      { q: "Who wrote 'The Old Man and the Sea'?", a: ["F. Scott Fitzgerald","Ernest Hemingway","John Steinbeck","Mark Twain"], correct: 1 },
      { q: "Which moon is the largest in our solar system?", a: ["Titan","Ganymede","Europa","Callisto"], correct: 1 },
      { q: "Which year did Apollo 11 land on the Moon?", a: ["1965","1967","1969","1971"], correct: 2 },
      { q: "What is the capital of New Zealand?", a: ["Auckland","Wellington","Christchurch","Hamilton"], correct: 1 },
      { q: "Which composer wrote 'The Four Seasons'?", a: ["Mozart","Bach","Vivaldi","Beethoven"], correct: 2 },
      { q: "What is the longest river entirely within the United States?", a: ["Missouri River","Mississippi River","Colorado River","Rio Grande"], correct: 0 },
      { q: "Which Oklahoma-born astronaut commanded Apollo 10?", a: ["Gordon Cooper","Thomas Stafford","John Herrington","Shannon Lucid"], correct: 1 },
      { q: "Which Oklahoma city was historically called the 'Oil Capital of the World'?", a: ["Tulsa","Norman","Lawton","Enid"], correct: 0 },
      { q: "Which U.S. president signed Oklahoma statehood into law?", a: ["Theodore Roosevelt","William Howard Taft","Woodrow Wilson","Grover Cleveland"], correct: 0 },
      { q: "Which mathematical constant begins 2.71828?", a: ["Pi","Euler's number","Golden ratio","Tau"], correct: 1 },
      { q: "Which Shakespeare play contains the character Prospero?", a: ["Hamlet","Macbeth","The Tempest","Othello"], correct: 2 }
    ]
  };

  const wouldYouRather = [
    ["Control the music for every ride","Never hit a red light again"],
    ["Take a weekend road trip","Spend a weekend downtown"],
    ["Always get the window seat","Always get extra legroom"],
    ["Have perfect weather every weekend","Have zero traffic every weekend"],
    ["Explore a new restaurant","Explore a new live-music venue"],
    ["Drive a classic muscle car","Drive a brand-new luxury SUV"],
    ["Have free concert tickets","Have free movie tickets"],
    ["Visit the mountains","Visit the beach"],
    ["Be 20 minutes early everywhere","Arrive exactly on time every time"],
    ["Have unlimited coffee","Have unlimited tacos"],
    ["Know every song lyric","Know every movie quote"],
    ["Never wait in line","Never sit in traffic"],
    ["See your favorite band live","Meet your favorite actor"],
    ["Take the scenic route","Take the fastest route"],
    ["Have a personal chef","Have a personal driver"],
    ["Always find perfect parking","Always get the best table"],
    ["Have a week off work","Get free travel for a weekend"],
    ["Go to a huge concert","Go to a championship game"],
    ["Only listen to 80s music","Only listen to 90s music"],
    ["Have sunrise views every morning","Have sunset views every evening"]
  ];

  const scrambles = [
    {word:"OKLAHOMA",scramble:"HOMAOKLA",hint:"The state you're riding in."},
    {word:"BRICKTOWN",scramble:"TOWNBRICK",hint:"Downtown OKC entertainment district."},
    {word:"CONNECT",scramble:"TCONNEC",hint:"It's in the Big Red name."},
    {word:"THUNDER",scramble:"DERTHUN",hint:"OKC's NBA team."},
    {word:"NORMAN",scramble:"MANRON",hint:"Home of OU."},
    {word:"YUKON",scramble:"KUNYO",hint:"West of OKC."},
    {word:"SHAWNEE",scramble:"NEESHAW",hint:"East of OKC."},
    {word:"AIRPORT",scramble:"PORTAIR",hint:"Where flights begin and end."},
    {word:"MUSIC",scramble:"CUSIM",hint:"What riders hear in the car."},
    {word:"TRIVIA",scramble:"VIATRI",hint:"One of the games you're playing."},
    {word:"WEEKEND",scramble:"ENDWEEK",hint:"Friday through Sunday."},
    {word:"ROADTRIP",scramble:"TRIPROAD",hint:"A longer drive for fun."},
    {word:"CONCERT",scramble:"CERTCON",hint:"Live music event."},
    {word:"DOWNTOWN",scramble:"TOWNDOWN",hint:"City-center area."},
    {word:"PLAYLIST",scramble:"LISTPLAY",hint:"A group of songs."},
    {word:"HIGHWAY",scramble:"WAYHIGH",hint:"A major road."},
    {word:"TRAFFIC",scramble:"FICTRAF",hint:"Something drivers try to avoid."},
    {word:"DRIVER",scramble:"VERDRI",hint:"The person behind the wheel."},
    {word:"PASSENGER",scramble:"SENGERSPA",hint:"A person riding along."},
    {word:"DESTINATION",scramble:"NATIONDESTI",hint:"Where you're going."},
    {word:"MILEAGE",scramble:"AGEMILE",hint:"Distance driven."},
    {word:"SUNSET",scramble:"SETSUN",hint:"End-of-day sky."},
    {word:"COFFEE",scramble:"FEECFO",hint:"Popular caffeinated drink."},
    {word:"DINNER",scramble:"NERDIN",hint:"Evening meal."},
    {word:"MOVIE",scramble:"VIEMO",hint:"Cinema entertainment."},
    {word:"BASKETBALL",scramble:"BALLBASKET",hint:"Thunder sport."},
    {word:"FOOTBALL",scramble:"BALLFOOT",hint:"Touchdowns."},
    {word:"BASEBALL",scramble:"BALLBASE",hint:"Runs and innings."},
    {word:"MOUNTAIN",scramble:"TAINMOUN",hint:"High natural landform."},
    {word:"BEACH",scramble:"ACHBE",hint:"Sand and waves."},
    {word:"TRAVEL",scramble:"VELTRA",hint:"Going somewhere."},
    {word:"HOTEL",scramble:"TELHO",hint:"A place to stay."},
    {word:"VACATION",scramble:"TIONVACA",hint:"Time away from work."},
    {word:"FRIDAY",scramble:"DAYFRI",hint:"Start of the weekend."},
    {word:"SATURDAY",scramble:"DAYSATUR",hint:"Weekend day."},
    {word:"SUNDAY",scramble:"DAYSUN",hint:"Weekend day."},
    {word:"MIDNIGHT",scramble:"NIGHTMID",hint:"12:00 AM."},
    {word:"SUNRISE",scramble:"RISESUN",hint:"Start-of-day sky."},
    {word:"CITY",scramble:"TYCI",hint:"Urban area."},
    {word:"LOCAL",scramble:"CALLO",hint:"Close to home."},
    {word:"TRUSTED",scramble:"TEDTRUS",hint:"Reliable."},
    {word:"AFFORDABLE",scramble:"ABLEAFFORD",hint:"Reasonably priced."},
    {word:"VETERAN",scramble:"RANVETE",hint:"Someone who served."},
    {word:"PAYMENT",scramble:"MENTPAY",hint:"How a fare is settled."},
    {word:"VENMO",scramble:"MOVEN",hint:"Payment app."},
    {word:"CASHAPP",scramble:"APPCASH",hint:"Payment app."},
    {word:"RESERVATION",scramble:"TIONRESERVA",hint:"Something planned ahead."},
    {word:"PICKUP",scramble:"UPPICK",hint:"Where the ride begins."},
    {word:"DROPOFF",scramble:"OFFDROP",hint:"Where the ride ends."},
    {word:"SEATBELT",scramble:"BELTSEAT",hint:"Safety first."},
    {word:"CHARGER",scramble:"GERCHAR",hint:"Keeps your phone powered."},
    {word:"TABLET",scramble:"LETTAB",hint:"The screen you're using."},
    {word:"GAMES",scramble:"MESGA",hint:"What you're playing."},
    {word:"QUESTIONS",scramble:"TIONSQUES",hint:"Trivia has these."},
    {word:"ANSWER",scramble:"SWERAN",hint:"What follows a question."},
    {word:"STREAK",scramble:"REAKST",hint:"Several wins in a row."},
    {word:"SCORE",scramble:"ORESC",hint:"Your game result."},
    {word:"TIMER",scramble:"MERTI",hint:"Counts down."},
    {word:"ROUTE",scramble:"TEROU",hint:"The path to a destination."},
    {word:"MOBILE",scramble:"BILEMO",hint:"Your phone is this."},
    {word:"WEATHER",scramble:"THERWEA",hint:"Rain, sun, wind and more."},
    {word:"STADIUM",scramble:"DIUMSTA",hint:"Sports venue."},
    {word:"CASINO",scramble:"SINCAO",hint:"Gaming venue."},
    {word:"KARAOKE",scramble:"OKEKARA",hint:"Singing along."},
    {word:"COUNTRY",scramble:"TRYCOUN",hint:"Music genre."},
    {word:"ROCK",scramble:"CKRO",hint:"Music genre."},
    {word:"HIPHOP",scramble:"HOPHIP",hint:"Music genre."},
    {word:"PLAYOFF",scramble:"OFFPLAY",hint:"Postseason competition."},
    {word:"TICKET",scramble:"KETTIC",hint:"Gets you into an event."},
    {word:"FESTIVAL",scramble:"VALFESTI",hint:"Large event."},
    {word:"FAIR",scramble:"IRFA",hint:"Rides, food and exhibits."},
    {word:"LIGHTS",scramble:"HTSLIG",hint:"They brighten the night."},
    {word:"DANCE",scramble:"CEDAN",hint:"Move to music."},
    {word:"STAGE",scramble:"GESTA",hint:"Performers stand here."},
    {word:"ARENA",scramble:"NAARE",hint:"Large indoor venue."},
    {word:"CAMERA",scramble:"RACAME",hint:"Takes pictures."},
    {word:"PHOTO",scramble:"TOPHO",hint:"A picture."},
    {word:"FRIENDS",scramble:"ENDSFIR",hint:"People you like hanging with."},
    {word:"NIGHTLIFE",scramble:"LIFENIGHT",hint:"Evening entertainment."}
  ];

  function sampleWithoutReplacement(arr, count) {
    const copy = [...arr];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy.slice(0, count);
  }

  function clearScrambleTimer() {
    if (scrambleTimer) {
      clearInterval(scrambleTimer);
      scrambleTimer = null;
    }
  }

  function resetGameSession() {
    clearScrambleTimer();

    session.trivia = null;
    session.wyr = null;
    session.scramble = null;

    activeGame = null;
    gameContent.innerHTML = "";
  }

  const anyPanelOpen = () =>
    !gamesPanel.hidden || !gamePanel.hidden || !planPanel.hidden;

  function goHomeAndReset() {
    gamesPanel.hidden = true;
    gamePanel.hidden = true;
    planPanel.hidden = true;

    clearInactivityTimer();
    resetGameSession();
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

    inactivityTimer = window.setTimeout(goHomeAndReset, CONFIG.inactivityMs);
  }

  function clearInactivityTimer() {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
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
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function launchGame(type) {
    activeGame = type;

    if (type === "trivia") startTriviaSession();
    if (type === "wyr") startWyrSession();
    if (type === "scramble") startScrambleSession();

    openPanel(gamePanel);
    renderActiveGame();
  }

  function renderActiveGame() {
    if (activeGame === "trivia") return renderTrivia();
    if (activeGame === "wyr") return renderWouldYouRather();
    if (activeGame === "scramble") return renderScramble();
  }

  /* ---------------- TRIVIA ---------------- */

  function startTriviaSession() {
    session.trivia = {
      easy: sampleWithoutReplacement(triviaBank.easy, 5),
      medium: sampleWithoutReplacement(triviaBank.medium, 5),
      hard: sampleWithoutReplacement(triviaBank.hard, 5),

      round: 0,
      correct: 0,
      points: 0,
      streak: 0,
      bestStreak: 0
    };
  }

  function getTriviaRound() {
    const state = session.trivia;
    const round = state.round;

    if (round < 5) {
      return {
        difficulty: "easy",
        label: "EASY",
        points: 1,
        item: state.easy[round]
      };
    }

    if (round < 10) {
      return {
        difficulty: "medium",
        label: "MEDIUM",
        points: 2,
        item: state.medium[round - 5]
      };
    }

    return {
      difficulty: "hard",
      label: "HARD",
      points: 3,
      item: state.hard[round - 10]
    };
  }

  function renderTrivia() {
    const state = session.trivia;

    if (state.round >= CONFIG.triviaRounds) {
      return renderTriviaResults();
    }

    const current = getTriviaRound();
    const item = current.item;

    gameContent.innerHTML = `
      <div class="game-statusbar">
        <div class="game-status-pill">Question <strong>${state.round + 1}/${CONFIG.triviaRounds}</strong></div>
        <div class="game-status-pill">Score <strong>${state.points}</strong></div>
        <div class="game-status-pill">Streak <strong>${state.streak}</strong></div>
        <div class="difficulty-pill difficulty-${current.difficulty}">${current.label}</div>
      </div>

      <h2 class="game-title">Trivia</h2>
      <div class="game-prompt">${escapeHtml(item.q)}</div>

      <div class="answer-grid">
        ${item.a.map((answer,index)=>`
          <button class="answer-btn" data-answer="${index}" type="button">
            ${escapeHtml(answer)}
          </button>
        `).join("")}
      </div>

      <div id="resultText" class="result-text" aria-live="polite"></div>

      <div class="next-row">
        <button id="nextTriviaBtn" class="next-btn" type="button" hidden>
          ${state.round === CONFIG.triviaRounds - 1 ? "See Results" : "Next Question"}
        </button>
      </div>
    `;

    const answerButtons = gameContent.querySelectorAll("[data-answer]");
    const resultText = document.getElementById("resultText");
    const nextButton = document.getElementById("nextTriviaBtn");

    answerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selected = Number(button.dataset.answer);
        const correct = selected === item.correct;

        answerButtons.forEach((candidate,index) => {
          candidate.disabled = true;

          if (index === item.correct) {
            candidate.classList.add("correct");
          }

          if (index === selected && !correct) {
            candidate.classList.add("wrong");
          }
        });

        if (correct) {
          state.correct += 1;
          state.points += current.points;
          state.streak += 1;
          state.bestStreak = Math.max(state.bestStreak, state.streak);

          resultText.textContent =
            current.points === 1
              ? "Correct! +1"
              : `Correct! +${current.points}`;
        } else {
          state.streak = 0;
          resultText.textContent = `Answer: ${item.a[item.correct]}`;
        }

        nextButton.hidden = false;
      }, {once:true});
    });

    nextButton.addEventListener("click", () => {
      state.round += 1;
      renderTrivia();
    });
  }

  function renderTriviaResults() {
    const state = session.trivia;
    const pct = Math.round((state.correct / CONFIG.triviaRounds) * 100);

    renderScoreScreen({
      title: "Trivia Results",
      subtitle: "15 questions complete",
      hero: `${state.points}/30`,
      cards: [
        ["Correct", `${state.correct}/15`],
        ["Accuracy", `${pct}%`],
        ["Best Streak", state.bestStreak]
      ],
      replay: () => {
        startTriviaSession();
        renderTrivia();
      }
    });
  }

  /* ---------------- WOULD YOU RATHER ---------------- */

  function startWyrSession() {
    session.wyr = {
      rounds: sampleWithoutReplacement(wouldYouRather, CONFIG.wyrRounds),
      round: 0,
      choices: []
    };
  }

  function renderWouldYouRather() {
    const state = session.wyr;

    if (state.round >= CONFIG.wyrRounds) {
      return renderWyrResults();
    }

    const [leftChoice,rightChoice] = state.rounds[state.round];

    gameContent.innerHTML = `
      <div class="wyr-progress">Round ${state.round + 1} of ${CONFIG.wyrRounds}</div>

      <h2 class="game-title">Would You Rather</h2>
      <div class="game-prompt">Pick one.</div>

      <div class="wyr-grid">
        <button class="wyr-choice" data-choice="left" type="button">
          ${escapeHtml(leftChoice)}
        </button>

        <div class="wyr-or">OR</div>

        <button class="wyr-choice" data-choice="right" type="button">
          ${escapeHtml(rightChoice)}
        </button>
      </div>

      <div id="wyrResult" class="result-text" aria-live="polite"></div>
    `;

    const result = document.getElementById("wyrResult");

    gameContent.querySelectorAll("[data-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const choiceSide = button.dataset.choice;
        const selectedText = choiceSide === "left" ? leftChoice : rightChoice;

        state.choices.push(selectedText);

        gameContent.querySelectorAll("[data-choice]").forEach((candidate) => {
          candidate.disabled = true;
          candidate.classList.remove("selected");
        });

        button.classList.add("selected");
        result.textContent = `You picked: ${selectedText}`;

        setTimeout(() => {
          state.round += 1;
          renderWouldYouRather();
        }, 900);
      }, {once:true});
    });
  }

  function renderWyrResults() {
    const state = session.wyr;
    const samplePicks = state.choices.slice(-3);

    renderScoreScreen({
      title: "Would You Rather",
      subtitle: "10 choices complete",
      hero: "10/10",
      cards: [
        ["Rounds", "10"],
        ["Choices Made", "10"],
        ["Last Pick", samplePicks[samplePicks.length - 1] || "—"]
      ],
      replay: () => {
        startWyrSession();
        renderWouldYouRather();
      }
    });
  }

  /* ---------------- WORD SCRAMBLE ---------------- */

  function startScrambleSession() {
    clearScrambleTimer();

    session.scramble = {
      rounds: sampleWithoutReplacement(scrambles, CONFIG.scrambleRounds),
      round: 0,
      solved: 0,
      streak: 0,
      bestStreak: 0,
      totalTimeUsed: 0
    };
  }

  function renderScramble() {
    clearScrambleTimer();

    const state = session.scramble;

    if (state.round >= CONFIG.scrambleRounds) {
      return renderScrambleResults();
    }

    const item = state.rounds[state.round];
    let remaining = CONFIG.scrambleSeconds;
    let finished = false;
    scrambleDeadline = Date.now() + (CONFIG.scrambleSeconds * 1000);

    gameContent.innerHTML = `
      <div class="game-statusbar">
        <div class="game-status-pill">Word <strong>${state.round + 1}/${CONFIG.scrambleRounds}</strong></div>
        <div class="game-status-pill">Solved <strong>${state.solved}</strong></div>
        <div class="game-status-pill">Streak <strong>${state.streak}</strong></div>
      </div>

      <h2 class="game-title">Word Scramble</h2>

      <div class="timer-wrap">
        <div class="timer-row">
          <span>Time remaining</span>
          <span id="timerNumber" class="timer-number">${remaining}</span>
        </div>
        <div class="timer-track">
          <div id="timerFill" class="timer-fill"></div>
        </div>
      </div>

      <div class="scramble-word">${escapeHtml(item.scramble)}</div>

      <div id="scrambleHint" class="scramble-hint" hidden>
        Hint: ${escapeHtml(item.hint)}
      </div>

      <div id="scrambleResult" class="result-text" aria-live="polite">
        Beat the clock.
      </div>

      <div class="next-row">
        <button id="hintBtn" class="secondary-game-btn" type="button">Hint</button>
        <button id="solvedBtn" class="next-btn" type="button">Solved!</button>
        <button id="revealBtn" class="secondary-game-btn" type="button">Reveal</button>
      </div>
    `;

    const timerNumber = document.getElementById("timerNumber");
    const timerFill = document.getElementById("timerFill");
    const result = document.getElementById("scrambleResult");
    const solvedBtn = document.getElementById("solvedBtn");
    const revealBtn = document.getElementById("revealBtn");
    const hintBtn = document.getElementById("hintBtn");

    function finishRound(outcome) {
      if (finished) return;
      finished = true;

      clearScrambleTimer();

      const elapsed = Math.min(
        CONFIG.scrambleSeconds,
        Math.max(0, CONFIG.scrambleSeconds - Math.ceil((scrambleDeadline - Date.now()) / 1000))
      );

      state.totalTimeUsed += elapsed;

      solvedBtn.disabled = true;
      revealBtn.disabled = true;
      hintBtn.disabled = true;

      if (outcome === "solved") {
        state.solved += 1;
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        result.textContent = `Solved! ${item.word}`;
      } else {
        state.streak = 0;
        result.textContent = `Answer: ${item.word}`;
      }

      setTimeout(() => {
        state.round += 1;
        renderScramble();
      }, CONFIG.scrambleRevealMs);
    }

    hintBtn.addEventListener("click", () => {
      document.getElementById("scrambleHint").hidden = false;
    });

    solvedBtn.addEventListener("click", () => finishRound("solved"));
    revealBtn.addEventListener("click", () => finishRound("revealed"));

    scrambleTimer = setInterval(() => {
      const msLeft = Math.max(0, scrambleDeadline - Date.now());
      remaining = Math.ceil(msLeft / 1000);

      timerNumber.textContent = remaining;

      const ratio = msLeft / (CONFIG.scrambleSeconds * 1000);
      timerFill.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;

      if (msLeft <= 0) {
        finishRound("timeout");
      }
    }, 100);
  }

  function renderScrambleResults() {
    clearScrambleTimer();

    const state = session.scramble;
    const avgTime = state.solved
      ? Math.max(1, Math.round(state.totalTimeUsed / CONFIG.scrambleRounds))
      : CONFIG.scrambleSeconds;

    renderScoreScreen({
      title: "Word Scramble Results",
      subtitle: "10 timed words complete",
      hero: `${state.solved}/10`,
      cards: [
        ["Solved", `${state.solved}/10`],
        ["Best Streak", state.bestStreak],
        ["Avg. Time", `${avgTime}s`]
      ],
      replay: () => {
        startScrambleSession();
        renderScramble();
      }
    });
  }

  /* ---------------- SCORE SCREEN ---------------- */

  function renderScoreScreen({title,subtitle,hero,cards,replay}) {
    gameContent.innerHTML = `
      <div class="score-screen">
        <h2 class="score-title">${escapeHtml(title)}</h2>
        <p class="score-subtitle">${escapeHtml(subtitle)}</p>

        <div class="score-hero">${escapeHtml(hero)}</div>

        <div class="score-grid">
          ${cards.map(([label,value]) => `
            <div class="score-card">
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(value)}</strong>
            </div>
          `).join("")}
        </div>

        <div class="score-actions">
          <button id="playAgainBtn" class="score-primary" type="button">Play Again</button>
          <button id="scoreGamesBtn" class="score-secondary" type="button">Back to Games</button>
          <button id="scoreHomeBtn" class="score-secondary" type="button">Back to Big Red</button>
        </div>
      </div>
    `;

    document.getElementById("playAgainBtn").addEventListener("click", replay);

    document.getElementById("scoreGamesBtn").addEventListener("click", () => {
      activeGame = null;
      openPanel(gamesPanel);
    });

    document.getElementById("scoreHomeBtn").addEventListener("click", goHomeAndReset);
  }

  /* ---------------- NAVIGATION ---------------- */

  gamesBtn.addEventListener("click", () => {
    openPanel(gamesPanel);
    ensureVideoPlayback();
  });

  planBtn.addEventListener("click", () => {
    openPanel(planPanel);
    ensureVideoPlayback();
  });

  document.querySelectorAll("[data-home-reset]").forEach((button) => {
    button.addEventListener("click", goHomeAndReset);
  });

  document.querySelectorAll("[data-game]").forEach((button) => {
    button.addEventListener("click", () => launchGame(button.dataset.game));
  });

  backToGamesBtn.addEventListener("click", () => {
    clearScrambleTimer();
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

  ["pointerdown","touchstart","keydown"].forEach((eventName) => {
    document.addEventListener(
      eventName,
      () => {
        if (anyPanelOpen()) {
          resetInactivityTimer();
        }

        ensureVideoPlayback();
      },
      {passive:true}
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