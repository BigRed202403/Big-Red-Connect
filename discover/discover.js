// Discover v20 — driver + active games use full tablet height
(() => {
  "use strict";

  const CONFIG = {
    videoUrl: "https://media.bigredconnectokc.com/discover-current.mov",
    inactivityMs: 180000,

    triviaRounds: 15,
    wyrRounds: 10,
    scrambleRounds: 10,

    scrambleSeconds: 12,
    scrambleRevealMs: 1600,

    soundStateStorageKey: "discoverSoundOn",
    loadingPromptDelayMs: 1600,

    reviewUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeq6WCnkrG417rWCGwN56i7FplWpNTHlg1lpGuC-IETDEkEHw/viewform",
    weatherCacheMs: 600000,
    weatherFallbackLat: 35.4676,
    weatherFallbackLon: -97.5164
  };

  const video = document.getElementById("presentationVideo");
  const videoFallback = document.getElementById("videoFallback");
  const localProgramFile = document.getElementById("localProgramFile");
  const loadLocalProgramBtn = document.getElementById("loadLocalProgramBtn");
  const localProgramStatus = document.getElementById("localProgramStatus");
  const videoLoading = document.getElementById("videoLoading");
  const videoLoadingTitle = document.getElementById("videoLoadingTitle");
  const videoLoadingMessage = document.getElementById("videoLoadingMessage");
  const loadingGamesBtn = document.getElementById("loadingGamesBtn");
  const loadingReviewBtn = document.getElementById("loadingReviewBtn");
  const loadingTipBtn = document.getElementById("loadingTipBtn");
  const loadingPlanBtn = document.getElementById("loadingPlanBtn");
  const retryVideoBtn = document.getElementById("retryVideoBtn");

  // Sound control is global and remains visible above every overlay.
  const volumeBtn = document.getElementById("volumeBtn");
  const volumeIcon = document.getElementById("volumeIcon");
  const volumeLabel = document.getElementById("volumeLabel");

  const gamesBtn = document.getElementById("gamesBtn");
  const weatherBtn = document.getElementById("weatherBtn");
  const driverBtn = document.getElementById("driverBtn");
  const planBtn = document.getElementById("planBtn");
  const tipBtn = document.getElementById("tipBtn");
  const reviewBtn = document.getElementById("reviewBtn");

  const driverPanel = document.getElementById("driverPanel");
  const weatherPanel = document.getElementById("weatherPanel");
  const gamesPanel = document.getElementById("gamesPanel");
  const gamePanel = document.getElementById("gamePanel");
  const planPanel = document.getElementById("planPanel");
  const tipPanel = document.getElementById("tipPanel");
  const reviewPanel = document.getElementById("reviewPanel");

  const reviewOpenBtn = document.getElementById("reviewOpenBtn");
  const weatherLocationLabel = document.getElementById("weatherLocationLabel");
  const weatherLoading = document.getElementById("weatherLoading");
  const weatherContent = document.getElementById("weatherContent");
  const weatherIcon = document.getElementById("weatherIcon");
  const weatherTemp = document.getElementById("weatherTemp");
  const weatherCondition = document.getElementById("weatherCondition");
  const weatherHighLow = document.getElementById("weatherHighLow");
  const weatherWind = document.getElementById("weatherWind");
  const weatherRain = document.getElementById("weatherRain");
  const weatherHourly = document.getElementById("weatherHourly");
  const refreshWeatherBtn = document.getElementById("refreshWeatherBtn");

  const backToGamesBtn = document.getElementById("backToGamesBtn");
  const gameContent = document.getElementById("gameContent");

  let inactivityTimer = null;
  let activeGame = null;
  let scrambleTimer = null;
  let scrambleDeadline = 0;

  let audioUnlocked = false;
  let localProgramUrl = null;
  let localProgramLoaded = false;
  let loadingPromptTimer = null;
  let localProgramStatusTimer = null;
  let weatherCache = null;

  function getInitialSoundState() {
    try {
      const stored = sessionStorage.getItem(CONFIG.soundStateStorageKey);
      if (stored === "false") return false;
      if (stored === "true") return true;
    } catch (error) {
      console.info("Sound state storage is unavailable.", error);
    }
    return true;
  }

  let soundOn = getInitialSoundState();

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


  // --------------------------------------------------
  // EXPANDED GAME BANKS — V14
  // Long-ride variety: 150 trivia questions, 100 WYR prompts,
  // and 150 word scrambles total.
  // --------------------------------------------------
  triviaBank.easy.push(
    {"q": "What color do you get by mixing blue and yellow?", "a": ["Purple", "Green", "Orange", "Red"], "correct": 1},
    {"q": "How many sides does a hexagon have?", "a": ["5", "6", "7", "8"], "correct": 1},
    {"q": "Which animal is known for carrying its home on its back?", "a": ["Rabbit", "Turtle", "Horse", "Eagle"], "correct": 1},
    {"q": "What is frozen water called?", "a": ["Steam", "Ice", "Mist", "Dew"], "correct": 1},
    {"q": "Which month comes after September?", "a": ["August", "October", "November", "December"], "correct": 1},
    {"q": "Which fruit is traditionally used to make guacamole?", "a": ["Apple", "Avocado", "Pear", "Peach"], "correct": 1},
    {"q": "How many minutes are in one hour?", "a": ["30", "45", "60", "90"], "correct": 2},
    {"q": "Which planet is closest to the Sun?", "a": ["Mercury", "Venus", "Earth", "Mars"], "correct": 0},
    {"q": "Which state is directly north of Oklahoma?", "a": ["Texas", "Kansas", "Arkansas", "New Mexico"], "correct": 1},
    {"q": "What is the capital of Oklahoma?", "a": ["Tulsa", "Norman", "Oklahoma City", "Stillwater"], "correct": 2},
    {"q": "Which animal is the largest land mammal?", "a": ["Giraffe", "Elephant", "Rhino", "Hippo"], "correct": 1},
    {"q": "What do bees make?", "a": ["Milk", "Honey", "Bread", "Silk"], "correct": 1},
    {"q": "Which holiday is celebrated on July 4 in the United States?", "a": ["Memorial Day", "Independence Day", "Labor Day", "Veterans Day"], "correct": 1},
    {"q": "What is the opposite of north?", "a": ["East", "West", "South", "Up"], "correct": 2},
    {"q": "Which shape has three sides?", "a": ["Square", "Circle", "Triangle", "Pentagon"], "correct": 2},
    {"q": "Which gas do humans breathe in to survive?", "a": ["Oxygen", "Helium", "Hydrogen", "Neon"], "correct": 0},
    {"q": "How many wheels does a standard passenger car usually have?", "a": ["2", "3", "4", "6"], "correct": 2},
    {"q": "What is the name of the toy cowboy in Toy Story?", "a": ["Buzz", "Woody", "Rex", "Andy"], "correct": 1},
    {"q": "Which food is made from milk?", "a": ["Cheese", "Rice", "Bread", "Pasta"], "correct": 0},
    {"q": "Which day comes after Friday?", "a": ["Thursday", "Saturday", "Sunday", "Monday"], "correct": 1},
    {"q": "What color is a typical stop sign?", "a": ["Blue", "Green", "Red", "Yellow"], "correct": 2},
    {"q": "Which animal says 'moo'?", "a": ["Pig", "Cow", "Duck", "Sheep"], "correct": 1},
    {"q": "Which number comes after 99?", "a": ["98", "100", "101", "109"], "correct": 1},
    {"q": "What is the largest planet in our solar system?", "a": ["Earth", "Saturn", "Jupiter", "Neptune"], "correct": 2},
    {"q": "Which U.S. coin is worth 25 cents?", "a": ["Dime", "Nickel", "Quarter", "Penny"], "correct": 2},
    {"q": "Which city is home to the University of Oklahoma?", "a": ["Norman", "Tulsa", "Lawton", "Enid"], "correct": 0},
    {"q": "Which sport uses a basketball hoop?", "a": ["Soccer", "Basketball", "Baseball", "Golf"], "correct": 1},
    {"q": "What do you call a baby dog?", "a": ["Cub", "Kitten", "Puppy", "Foal"], "correct": 2},
    {"q": "Which meal is usually eaten in the morning?", "a": ["Dinner", "Breakfast", "Supper", "Dessert"], "correct": 1},
    {"q": "How many months are in a year?", "a": ["10", "11", "12", "13"], "correct": 2},
    {"q": "Which Oklahoma NBA team plays at Paycom Center?", "a": ["Thunder", "Sooners", "Cowboys", "Dodgers"], "correct": 0},
    {"q": "What is the first letter of the English alphabet?", "a": ["A", "B", "C", "D"], "correct": 0},
    {"q": "Which device is commonly used to take a photo?", "a": ["Camera", "Toaster", "Lamp", "Fan"], "correct": 0},
    {"q": "What is 5 + 5?", "a": ["8", "9", "10", "11"], "correct": 2},
    {"q": "Which season is typically the coldest?", "a": ["Spring", "Summer", "Fall", "Winter"], "correct": 3}
  );

  triviaBank.medium.push(
    {"q": "Which U.S. state is known as the Sooner State?", "a": ["Kansas", "Oklahoma", "Texas", "Nebraska"], "correct": 1},
    {"q": "What is the largest organ in the human body?", "a": ["Heart", "Liver", "Skin", "Lungs"], "correct": 2},
    {"q": "Which city hosted the 2016 Summer Olympics?", "a": ["Tokyo", "Rio de Janeiro", "London", "Beijing"], "correct": 1},
    {"q": "Which planet is famous for the Great Red Spot?", "a": ["Mars", "Jupiter", "Saturn", "Neptune"], "correct": 1},
    {"q": "Which U.S. state has the nickname 'Lone Star State'?", "a": ["Arizona", "Texas", "Nevada", "Utah"], "correct": 1},
    {"q": "What is the square root of 144?", "a": ["10", "11", "12", "14"], "correct": 2},
    {"q": "Which author wrote 'Charlotte's Web'?", "a": ["E. B. White", "Dr. Seuss", "Roald Dahl", "Beverly Cleary"], "correct": 0},
    {"q": "Which country is home to the Great Barrier Reef?", "a": ["Mexico", "Australia", "South Africa", "India"], "correct": 1},
    {"q": "Which blood type is often called the universal red-cell donor?", "a": ["A positive", "B negative", "AB positive", "O negative"], "correct": 3},
    {"q": "What is the main ingredient in hummus?", "a": ["Lentils", "Chickpeas", "Black beans", "Peas"], "correct": 1},
    {"q": "Which city is the capital of Canada?", "a": ["Toronto", "Vancouver", "Ottawa", "Montreal"], "correct": 2},
    {"q": "How many players from one team are on the court at a time in basketball?", "a": ["4", "5", "6", "7"], "correct": 1},
    {"q": "Which ocean lies between the United States and Europe?", "a": ["Pacific", "Atlantic", "Indian", "Arctic"], "correct": 1},
    {"q": "Which artist is famous for the song 'Jolene'?", "a": ["Reba McEntire", "Dolly Parton", "Shania Twain", "Faith Hill"], "correct": 1},
    {"q": "What does GPS stand for?", "a": ["Global Positioning System", "General Path Service", "Geographic Planning Signal", "Global Pathway Setup"], "correct": 0},
    {"q": "Which metal is liquid at room temperature?", "a": ["Iron", "Mercury", "Copper", "Aluminum"], "correct": 1},
    {"q": "What is the capital of Colorado?", "a": ["Boulder", "Denver", "Aspen", "Colorado Springs"], "correct": 1},
    {"q": "Which film franchise features the character Indiana Jones?", "a": ["Star Wars", "Indiana Jones", "Jurassic Park", "Mission: Impossible"], "correct": 1},
    {"q": "Which U.S. city is famous for the French Quarter?", "a": ["Nashville", "New Orleans", "Memphis", "Savannah"], "correct": 1},
    {"q": "What is the process by which plants convert light into energy called?", "a": ["Respiration", "Photosynthesis", "Fermentation", "Digestion"], "correct": 1},
    {"q": "Which Oklahoma city is known for the Golden Driller statue?", "a": ["Tulsa", "Norman", "Stillwater", "Ada"], "correct": 0},
    {"q": "How many strings does a standard violin have?", "a": ["4", "5", "6", "8"], "correct": 0},
    {"q": "Which amendment to the U.S. Constitution abolished slavery?", "a": ["10th", "13th", "15th", "19th"], "correct": 1},
    {"q": "Which sport is played at Wimbledon?", "a": ["Golf", "Tennis", "Cricket", "Soccer"], "correct": 1},
    {"q": "Which country uses the yen as its currency?", "a": ["China", "Japan", "Thailand", "South Korea"], "correct": 1},
    {"q": "Which element is represented by the symbol Na?", "a": ["Nitrogen", "Sodium", "Neon", "Nickel"], "correct": 1},
    {"q": "What is the capital of Tennessee?", "a": ["Memphis", "Knoxville", "Nashville", "Chattanooga"], "correct": 2},
    {"q": "Which singer recorded 'Friends in Low Places'?", "a": ["George Strait", "Garth Brooks", "Alan Jackson", "Tim McGraw"], "correct": 1},
    {"q": "Which lake is the largest of the Great Lakes by surface area?", "a": ["Michigan", "Huron", "Erie", "Superior"], "correct": 3},
    {"q": "Which famous road is often called the Mother Road?", "a": ["Route 66", "Interstate 40", "Highway 1", "Route 20"], "correct": 0},
    {"q": "What is the Roman numeral for 50?", "a": ["X", "L", "C", "D"], "correct": 1},
    {"q": "Which country gave the Statue of Liberty to the United States?", "a": ["England", "France", "Spain", "Italy"], "correct": 1},
    {"q": "Which U.S. state is home to Mount Rushmore?", "a": ["Wyoming", "South Dakota", "Montana", "North Dakota"], "correct": 1},
    {"q": "How many ounces are in a pound?", "a": ["8", "12", "16", "20"], "correct": 2},
    {"q": "Which Oklahoma university's teams are called the Cowboys?", "a": ["OU", "OSU", "UCO", "Tulsa"], "correct": 1}
  );

  triviaBank.hard.push(
    {"q": "Which element has the chemical symbol Sb?", "a": ["Antimony", "Tin", "Silver", "Bismuth"], "correct": 0},
    {"q": "What is the capital of Slovenia?", "a": ["Bratislava", "Ljubljana", "Zagreb", "Sarajevo"], "correct": 1},
    {"q": "Who wrote 'One Hundred Years of Solitude'?", "a": ["Jorge Luis Borges", "Gabriel García Márquez", "Pablo Neruda", "Isabel Allende"], "correct": 1},
    {"q": "Which planet rotates on its side with an axial tilt of about 98 degrees?", "a": ["Mars", "Uranus", "Saturn", "Venus"], "correct": 1},
    {"q": "What is the smallest prime number greater than 100?", "a": ["101", "103", "107", "109"], "correct": 0},
    {"q": "Which treaty formally ended World War I between Germany and the Allied powers?", "a": ["Treaty of Paris", "Treaty of Versailles", "Treaty of Ghent", "Treaty of Utrecht"], "correct": 1},
    {"q": "What is the SI unit of electric resistance?", "a": ["Volt", "Ampere", "Ohm", "Watt"], "correct": 2},
    {"q": "Which country contains the ancient city of Petra?", "a": ["Jordan", "Egypt", "Lebanon", "Turkey"], "correct": 0},
    {"q": "Who composed the opera 'The Magic Flute'?", "a": ["Mozart", "Verdi", "Wagner", "Puccini"], "correct": 0},
    {"q": "What is the name of the deepest known point in Earth's oceans?", "a": ["Java Trench", "Tonga Trench", "Challenger Deep", "Puerto Rico Trench"], "correct": 2},
    {"q": "Which mathematician is associated with the theorem a² + b² = c²?", "a": ["Euclid", "Pythagoras", "Archimedes", "Fibonacci"], "correct": 1},
    {"q": "Which language has the most native speakers worldwide?", "a": ["English", "Spanish", "Mandarin Chinese", "Hindi"], "correct": 2},
    {"q": "What is the capital of Mongolia?", "a": ["Astana", "Ulaanbaatar", "Bishkek", "Tashkent"], "correct": 1},
    {"q": "Which scientist developed the three laws of planetary motion?", "a": ["Galileo", "Kepler", "Newton", "Copernicus"], "correct": 1},
    {"q": "What is the name for a word that reads the same forward and backward?", "a": ["Anagram", "Palindrome", "Homonym", "Acronym"], "correct": 1},
    {"q": "Which Oklahoma town hosts the National Cowboy & Western Heritage Museum?", "a": ["Oklahoma City", "Guthrie", "Pawhuska", "Duncan"], "correct": 0},
    {"q": "In computing, what does CPU stand for?", "a": ["Central Processing Unit", "Computer Power Utility", "Core Program Unit", "Central Program User"], "correct": 0},
    {"q": "Which U.S. state has the longest coastline?", "a": ["California", "Florida", "Alaska", "Hawaii"], "correct": 2},
    {"q": "What is the chemical formula for table salt?", "a": ["NaCl", "KCl", "CaCO3", "H2SO4"], "correct": 0},
    {"q": "Which novel begins with the character Ishmael narrating a whaling voyage?", "a": ["Moby-Dick", "Treasure Island", "The Odyssey", "Robinson Crusoe"], "correct": 0},
    {"q": "Which country is home to Mount Kilimanjaro?", "a": ["Kenya", "Tanzania", "Ethiopia", "Uganda"], "correct": 1},
    {"q": "What is the largest moon of Saturn?", "a": ["Europa", "Titan", "Io", "Triton"], "correct": 1},
    {"q": "Which branch of mathematics studies rates of change and accumulation?", "a": ["Geometry", "Calculus", "Number theory", "Topology"], "correct": 1},
    {"q": "What is the capital of Iceland?", "a": ["Oslo", "Reykjavík", "Helsinki", "Copenhagen"], "correct": 1},
    {"q": "Which U.S. president was in office when the Louisiana Purchase was completed?", "a": ["George Washington", "Thomas Jefferson", "James Madison", "John Adams"], "correct": 1},
    {"q": "What does the 'H' in HTTP stand for?", "a": ["Hyper", "Host", "Hybrid", "Header"], "correct": 0},
    {"q": "Which ancient civilization built Machu Picchu?", "a": ["Maya", "Aztec", "Inca", "Olmec"], "correct": 2},
    {"q": "Which composer became deaf later in life but continued composing?", "a": ["Bach", "Beethoven", "Haydn", "Schubert"], "correct": 1},
    {"q": "Which country has the most time zones when overseas territories are included?", "a": ["Russia", "United States", "France", "Australia"], "correct": 2},
    {"q": "What is the atomic number of carbon?", "a": ["4", "6", "8", "12"], "correct": 1},
    {"q": "Which Oklahoma river flows through Oklahoma City?", "a": ["Canadian River", "Red River", "Illinois River", "Verdigris River"], "correct": 0},
    {"q": "What is the term for animals that are active mainly at dawn and dusk?", "a": ["Nocturnal", "Diurnal", "Crepuscular", "Arboreal"], "correct": 2},
    {"q": "Which philosopher wrote 'The Republic'?", "a": ["Aristotle", "Plato", "Socrates", "Seneca"], "correct": 1},
    {"q": "What is the capital of Burkina Faso?", "a": ["Bamako", "Ouagadougou", "Niamey", "Lomé"], "correct": 1},
    {"q": "Which physicist formulated the uncertainty principle?", "a": ["Bohr", "Heisenberg", "Fermi", "Dirac"], "correct": 1}
  );

  wouldYouRather.push(
    ["Have front-row concert seats", "Have sideline seats at a championship game"],
    ["Always have a full phone battery", "Always have perfect cell signal"],
    ["Take a spontaneous road trip", "Plan every stop in advance"],
    ["Eat breakfast for dinner", "Eat dinner for breakfast"],
    ["Have unlimited airline miles", "Have unlimited hotel nights"],
    ["Live near the mountains", "Live near the ocean"],
    ["Give up desserts for a year", "Give up soda for a year"],
    ["Have your dream car", "Have free gas for life"],
    ["Be able to fly", "Be able to teleport"],
    ["Read minds", "See five minutes into the future"],
    ["Have a movie theater at home", "Have a game room at home"],
    ["Go camping for a weekend", "Stay at a luxury resort"],
    ["Always know the fastest route", "Always know where to find parking"],
    ["Have dinner with your favorite musician", "Have dinner with your favorite actor"],
    ["Never need sleep", "Never need to charge your phone"],
    ["Have a lake house", "Have a cabin in the mountains"],
    ["Watch only comedies", "Watch only action movies"],
    ["Have a dog that can talk", "Have a cat that can text"],
    ["Win free groceries for a year", "Win free restaurant meals for a year"],
    ["Have a personal trainer", "Have a personal chef"],
    ["Go to every home game", "Go to one championship game"],
    ["Have a giant backyard", "Have a giant kitchen"],
    ["Drive with the windows down", "Drive with the A/C blasting"],
    ["Listen to country all night", "Listen to classic rock all night"],
    ["Get one extra vacation week", "Work four-day weeks all year"],
    ["Know every language", "Play every instrument"],
    ["Have a rewind button for life", "Have a pause button for life"],
    ["Always get green lights", "Always avoid construction zones"],
    ["Spend a night in a haunted hotel", "Spend a night alone in the woods"],
    ["Have unlimited pizza", "Have unlimited ice cream"],
    ["Explore space", "Explore the deep ocean"],
    ["Meet your future self", "Meet your great-great-grandparents"],
    ["Have a private jet", "Have a private yacht"],
    ["Give up music for a month", "Give up TV for a month"],
    ["Always be 10 minutes early", "Never know the time but never be late"],
    ["Have perfect memory", "Learn anything twice as fast"],
    ["Go backstage at a concert", "Go behind the scenes on a movie set"],
    ["Live in a big city", "Live in a small town"],
    ["Have unlimited books", "Have unlimited movies"],
    ["Take a sunrise drive", "Take a midnight drive"],
    ["Only travel by train", "Only travel by plane"],
    ["Have the best seat in the house", "Skip every line"],
    ["Win $500 today", "Get $50 every month for a year"],
    ["Spend a day at a theme park", "Spend a day at a water park"],
    ["Be famous for music", "Be famous for sports"],
    ["Have perfect singing ability", "Have perfect dancing ability"],
    ["Never get stuck in traffic", "Never wait at an airport"],
    ["Own a classic truck", "Own a modern sports car"],
    ["Have free coffee forever", "Have free breakfast forever"],
    ["See the northern lights", "See a total solar eclipse"],
    ["Have an extra hour every day", "Have an extra day every month"],
    ["Be great at trivia", "Be unbeatable at word games"],
    ["Always know the weather", "Always know the traffic"],
    ["Have your favorite meal once a week", "Try a new restaurant every week"],
    ["Take photos of everything", "Never use your camera on vacation"],
    ["Spend the weekend in Nashville", "Spend the weekend in Las Vegas"],
    ["Be the DJ", "Be the karaoke star"],
    ["Have one amazing long vacation", "Have four short vacations"],
    ["Only eat sweet snacks", "Only eat salty snacks"],
    ["Always have exact change", "Never need cash"],
    ["Drive at sunrise", "Drive at sunset"],
    ["Have VIP concert access", "Have courtside basketball seats"],
    ["Stay up all night", "Wake up before sunrise"],
    ["Have a beach bonfire", "Have a mountain campfire"],
    ["Take the back roads", "Take the interstate"],
    ["Know the answer to every trivia question", "Never lose at any board game"],
    ["Have a robot assistant", "Have a self-driving car"],
    ["Visit every U.S. state", "Visit every continent"],
    ["Have your favorite song play whenever you enter a room", "Have a theme song nobody else can hear"],
    ["Only watch old movies", "Only watch brand-new movies"],
    ["Have a perfect sense of direction", "Never forget a name"],
    ["Be able to stop time for 10 seconds", "Be able to jump 10 years into the future once"],
    ["Always find the best local food", "Always find the best local music"],
    ["Ride in a limousine", "Ride in a vintage convertible"],
    ["Spend a day with no phone", "Spend a day with no TV"],
    ["Have free tickets to any concert", "Have free tickets to any sporting event"],
    ["Always get the aisle seat", "Always get the window seat"],
    ["Have breakfast at midnight", "Have dessert before dinner"],
    ["See your favorite team win a title", "See your favorite artist win a major award"],
    ["Have a road trip playlist picked for you", "Pick every song yourself"]
  );

  scrambles.push(
    {"word": "AIRPORT", "scramble": "PORTAIR", "hint": "Planes arrive and depart here."},
    {"word": "CONCERT", "scramble": "CERTCON", "hint": "Live music event."},
    {"word": "THUNDER", "scramble": "DERTHUN", "hint": "Oklahoma City's NBA team."},
    {"word": "SOONERS", "scramble": "NERSSOO", "hint": "OU's team nickname."},
    {"word": "COWBOYS", "scramble": "BOYSCOW", "hint": "OSU's team nickname."},
    {"word": "TURNPIKE", "scramble": "PIKETURN", "hint": "A toll highway."},
    {"word": "PARKING", "scramble": "KINGPAR", "hint": "Where the car waits."},
    {"word": "WEEKEND", "scramble": "ENDWEEK", "hint": "Saturday and Sunday."},
    {"word": "MUSIC", "scramble": "SICMU", "hint": "What you hear through speakers."},
    {"word": "SPEAKER", "scramble": "KERSPEA", "hint": "Plays sound."},
    {"word": "REVIEW", "scramble": "VIEWRE", "hint": "Feedback after a ride."},
    {"word": "RATING", "scramble": "TINGRA", "hint": "A score, often with stars."},
    {"word": "TIP", "scramble": "PIT", "hint": "Extra thanks for good service."},
    {"word": "RIDER", "scramble": "DERRI", "hint": "A passenger."},
    {"word": "TRIVIA", "scramble": "VIATRI", "hint": "Question-and-answer game."},
    {"word": "SCRAMBLE", "scramble": "BLESCRAM", "hint": "This word game."},
    {"word": "FUEL", "scramble": "ELFU", "hint": "What powers many vehicles."},
    {"word": "ENGINE", "scramble": "GINEEN", "hint": "Makes a vehicle go."},
    {"word": "ROADTRIP", "scramble": "TRIPROAD", "hint": "A long drive for fun."},
    {"word": "ADVENTURE", "scramble": "TUREADVEN", "hint": "An exciting experience."},
    {"word": "DOWNTOWN", "scramble": "TOWNDOWN", "hint": "The city center."},
    {"word": "MIDTOWN", "scramble": "TOWNMID", "hint": "A central neighborhood."},
    {"word": "UPTOWN", "scramble": "TOWNUP", "hint": "A neighborhood name in many cities."},
    {"word": "NORMAN", "scramble": "MANNOR", "hint": "Home of OU."},
    {"word": "YUKON", "scramble": "KONUY", "hint": "West-metro Oklahoma city."},
    {"word": "SHAWNEE", "scramble": "NEESHAW", "hint": "Oklahoma city east of the metro."},
    {"word": "EDMOND", "scramble": "MONDED", "hint": "North-metro Oklahoma city."},
    {"word": "MOORE", "scramble": "OREMO", "hint": "Oklahoma city south of OKC."},
    {"word": "TULSA", "scramble": "SATUL", "hint": "Oklahoma's second-largest city."},
    {"word": "STILLWATER", "scramble": "WATERSTILL", "hint": "Home of Oklahoma State University."},
    {"word": "WEATHERFORD", "scramble": "FORDWEATHER", "hint": "Oklahoma city on I-40 west of OKC."},
    {"word": "ELRENO", "scramble": "RENOEL", "hint": "Oklahoma city west of Yukon."},
    {"word": "HARRAH", "scramble": "RAHHAR", "hint": "Oklahoma city east of OKC."},
    {"word": "BRUNCH", "scramble": "CHBRUN", "hint": "Late breakfast or early lunch."},
    {"word": "PANCAKE", "scramble": "CAKEPAN", "hint": "Breakfast food cooked on a griddle."},
    {"word": "WAFFLE", "scramble": "FLEWAF", "hint": "Grid-pattern breakfast food."},
    {"word": "BURGER", "scramble": "GERBUR", "hint": "Popular sandwich with a patty."},
    {"word": "PIZZA", "scramble": "ZAPIZ", "hint": "Round food often topped with cheese."},
    {"word": "TACO", "scramble": "COTA", "hint": "Folded tortilla favorite."},
    {"word": "NACHOS", "scramble": "CHOSNA", "hint": "Chips with toppings."},
    {"word": "CHOCOLATE", "scramble": "LATECHOCO", "hint": "Sweet treat made from cocoa."},
    {"word": "VANILLA", "scramble": "LAVANIL", "hint": "Classic ice cream flavor."},
    {"word": "SUNSHINE", "scramble": "SHINESUN", "hint": "Bright daylight."},
    {"word": "RAINBOW", "scramble": "BOWRAIN", "hint": "Colors seen after rain."},
    {"word": "THUNDERSTORM", "scramble": "STORMTHUNDER", "hint": "Storm with lightning and thunder."},
    {"word": "LIGHTNING", "scramble": "NINGLIGHT", "hint": "Electrical flash in a storm."},
    {"word": "TORNADO", "scramble": "NADOTOR", "hint": "Severe rotating storm."},
    {"word": "FORECAST", "scramble": "CASTFORE", "hint": "Weather prediction."},
    {"word": "JACKET", "scramble": "KETJAC", "hint": "Outer layer of clothing."},
    {"word": "SNEAKERS", "scramble": "KERSSNEA", "hint": "Casual athletic shoes."},
    {"word": "SUNGLASSES", "scramble": "GLASSESSUN", "hint": "Eyewear for bright days."},
    {"word": "BACKPACK", "scramble": "PACKBACK", "hint": "Bag carried on your back."},
    {"word": "SUITCASE", "scramble": "CASESUIT", "hint": "Travel luggage."},
    {"word": "PASSPORT", "scramble": "PORTPASS", "hint": "International travel document."},
    {"word": "BOARDING", "scramble": "INGBOARD", "hint": "Getting onto a plane."},
    {"word": "TERMINAL", "scramble": "MINALTER", "hint": "Airport building area."},
    {"word": "RUNWAY", "scramble": "WAYRUN", "hint": "Where planes take off and land."},
    {"word": "SECURITY", "scramble": "RITYSECU", "hint": "Airport screening area."},
    {"word": "LUGGAGE", "scramble": "GAGELUG", "hint": "Bags you travel with."},
    {"word": "HEADPHONES", "scramble": "PHONESHEAD", "hint": "Personal audio gear."},
    {"word": "MICROPHONE", "scramble": "PHONEMICRO", "hint": "Used to amplify a voice."},
    {"word": "KARAOKE", "scramble": "OKEKARA", "hint": "Singing along to backing music."},
    {"word": "GUITAR", "scramble": "TARGUI", "hint": "Six-string instrument."},
    {"word": "DRUMS", "scramble": "MSDRU", "hint": "Percussion instruments."},
    {"word": "PIANO", "scramble": "ANOPI", "hint": "Keyboard instrument."},
    {"word": "COUNTRY", "scramble": "TRYCOUN", "hint": "Music genre popular in Oklahoma."},
    {"word": "ROCK", "scramble": "CKRO", "hint": "Music genre with guitars and drums."},
    {"word": "PLAYOFFS", "scramble": "OFFSPLAY", "hint": "Postseason competition."},
    {"word": "CHAMPION", "scramble": "PIONCHAM", "hint": "Winner of a title."},
    {"word": "TOUCHDOWN", "scramble": "DOWNTOUCH", "hint": "Football scoring play."},
    {"word": "HOMERUN", "scramble": "RUNHOME", "hint": "Baseball hit around all the bases."}
  );


  const gameDecks = {
    triviaEasy: [],
    triviaMedium: [],
    triviaHard: [],
    wyr: [],
    scramble: []
  };

  function shuffledCopy(arr) {
    const copy = [...arr];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  function drawFromDeck(deckName, source, count) {
    if (!gameDecks[deckName] || gameDecks[deckName].length < count) {
      gameDecks[deckName] = shuffledCopy(source);
    }

    return gameDecks[deckName].splice(0, count);
  }

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
    !driverPanel.hidden ||
    !weatherPanel.hidden ||
    !gamesPanel.hidden ||
    !gamePanel.hidden ||
    !planPanel.hidden ||
    !tipPanel.hidden ||
    !reviewPanel.hidden;

  function goHomeAndReset() {
    driverPanel.hidden = true;
    weatherPanel.hidden = true;
    gamesPanel.hidden = true;
    gamePanel.hidden = true;
    planPanel.hidden = true;
    tipPanel.hidden = true;
    reviewPanel.hidden = true;

    clearInactivityTimer();
    resetGameSession();
  }

  // Overlays never pause the weekly program.
  // Video and audio continue underneath Games / Plan / Tip.
  function openPanel(panel) {
    driverPanel.hidden = true;
    weatherPanel.hidden = true;
    gamesPanel.hidden = true;
    gamePanel.hidden = true;
    planPanel.hidden = true;
    tipPanel.hidden = true;
    reviewPanel.hidden = true;
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

  function updateSoundControl() {
    volumeBtn.classList.toggle("sound-on", soundOn);
    volumeBtn.classList.toggle("sound-off", !soundOn);
    volumeIcon.textContent = soundOn ? "🔊" : "🔇";
    volumeLabel.textContent = soundOn ? "Sound" : "Muted";
    const label = soundOn ? "Sound On" : "Sound Off";
    volumeBtn.setAttribute("aria-label", label);
    volumeBtn.title = label;
  }

  function saveSoundState() {
    try {
      sessionStorage.setItem(CONFIG.soundStateStorageKey, String(soundOn));
    } catch (error) {
      console.info("Sound state could not be saved for this session.", error);
    }
  }

  function applySoundState() {
    video.muted = !audioUnlocked || !soundOn;
    updateSoundControl();
  }

  async function unlockAudioIfNeeded() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    applySoundState();

    try {
      await video.play();
      videoFallback.hidden = true;
    } catch (error) {
      console.info("Sound will begin on the next rider interaction.", error);
    }
  }

  async function toggleSound() {
    if (!audioUnlocked) {
      soundOn = true;
      saveSoundState();
      await unlockAudioIfNeeded();
      return;
    }

    soundOn = !soundOn;
    saveSoundState();
    applySoundState();

    try {
      await video.play();
    } catch (error) {
      console.info("Playback will resume on the next rider interaction.", error);
    }
  }

  async function ensureVideoPlayback() {
    try {
      applySoundState();
      await video.play();
      videoFallback.hidden = true;
    } catch (error) {
      console.info("Autoplay was blocked. Waiting for rider interaction.", error);
    }
  }


  function showLocalProgramStatus(message, autoHideMs = 0) {
    if (localProgramStatusTimer) clearTimeout(localProgramStatusTimer);
    localProgramStatus.textContent = message;
    localProgramStatus.hidden = false;
    if (autoHideMs > 0) {
      localProgramStatusTimer = setTimeout(() => {
        localProgramStatus.hidden = true;
      }, autoHideMs);
    }
  }

  function hideLoadingPrompt() {
    if (loadingPromptTimer) {
      clearTimeout(loadingPromptTimer);
      loadingPromptTimer = null;
    }
    videoLoading.hidden = true;
  }

  function showLoadingPrompt(title, message) {
    videoLoadingTitle.textContent = title;
    videoLoadingMessage.textContent = message;
    videoLoading.hidden = false;
  }

  function scheduleLoadingPrompt() {
    if (loadingPromptTimer || !videoLoading.hidden) return;
    loadingPromptTimer = setTimeout(() => {
      loadingPromptTimer = null;
      if (video.paused || video.readyState < 3) {
        showLoadingPrompt(
          localProgramLoaded ? "Big Red is getting ready." : "Big Red is buffering.",
          "While it catches up, play a game, leave a review, tip Big Red, or plan your next ride."
        );
      }
    }, CONFIG.loadingPromptDelayMs);
  }

  function chooseLocalProgram() {
    localProgramFile.value = "";
    localProgramFile.click();
  }

  async function loadLocalProgram(file) {
    if (!file) return;

    if (!file.type.startsWith("video/") && !/\.(mov|mp4)$/i.test(file.name)) {
      showLocalProgramStatus("Please choose a MOV or MP4 video file.", 5000);
      return;
    }

    try {
      if (localProgramUrl) URL.revokeObjectURL(localProgramUrl);

      localProgramUrl = URL.createObjectURL(file);
      localProgramLoaded = true;

      video.pause();
      const source = video.querySelector("source");
      if (source) source.removeAttribute("src");
      video.src = localProgramUrl;
      video.loop = true;
      video.load();

      showLocalProgramStatus(`Local program loaded: ${file.name}`, 5000);

      try {
        await video.play();
        videoFallback.hidden = true;
        hideLoadingPrompt();
      } catch (error) {
        console.info("Local program ready; waiting for rider interaction.", error);
        showLocalProgramStatus("Local program ready — tap the screen once to start.", 5000);
      }
    } catch (error) {
      console.info("Could not load local program.", error);
      showLocalProgramStatus("Could not load that local program file.", 5000);
    }
  }

  function retryVideo() {
    videoFallback.hidden = true;
    video.load();
    ensureVideoPlayback();
  }


  function weatherDescription(code) {
    const map = {
      0: ["Clear", "☀️"],
      1: ["Mostly clear", "🌤️"],
      2: ["Partly cloudy", "⛅"],
      3: ["Cloudy", "☁️"],
      45: ["Fog", "🌫️"],
      48: ["Fog", "🌫️"],
      51: ["Light drizzle", "🌦️"],
      53: ["Drizzle", "🌦️"],
      55: ["Heavy drizzle", "🌧️"],
      61: ["Light rain", "🌦️"],
      63: ["Rain", "🌧️"],
      65: ["Heavy rain", "🌧️"],
      71: ["Light snow", "🌨️"],
      73: ["Snow", "🌨️"],
      75: ["Heavy snow", "❄️"],
      80: ["Rain showers", "🌦️"],
      81: ["Rain showers", "🌧️"],
      82: ["Heavy showers", "🌧️"],
      95: ["Thunderstorms", "⛈️"],
      96: ["Thunderstorms", "⛈️"],
      99: ["Thunderstorms", "⛈️"]
    };
    return map[code] || ["Current conditions", "🌤️"];
  }

  function getWeatherPosition() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({lat: CONFIG.weatherFallbackLat, lon: CONFIG.weatherFallbackLon, label: "Oklahoma City area"});
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          label: "Near your current location"
        }),
        () => resolve({lat: CONFIG.weatherFallbackLat, lon: CONFIG.weatherFallbackLon, label: "Oklahoma City area"}),
        {enableHighAccuracy: false, timeout: 5000, maximumAge: 600000}
      );
    });
  }

  function renderWeather(data, locationLabel) {
    const current = data.current || {};
    const daily = data.daily || {};
    const hourly = data.hourly || {};
    const [description, icon] = weatherDescription(current.weather_code);

    weatherLocationLabel.textContent = locationLabel;
    weatherIcon.textContent = icon;
    weatherTemp.textContent = Number.isFinite(current.temperature_2m) ? `${Math.round(current.temperature_2m)}°` : "--°";
    weatherCondition.textContent = description;

    const high = daily.temperature_2m_max?.[0];
    const low = daily.temperature_2m_min?.[0];
    weatherHighLow.textContent = Number.isFinite(high) && Number.isFinite(low) ? `${Math.round(high)}° / ${Math.round(low)}°` : "—";
    weatherWind.textContent = Number.isFinite(current.wind_speed_10m) ? `${Math.round(current.wind_speed_10m)} mph` : "—";
    const rain = daily.precipitation_probability_max?.[0];
    weatherRain.textContent = Number.isFinite(rain) ? `${Math.round(rain)}%` : "—";

    weatherHourly.innerHTML = "";
    const now = Date.now();
    const times = hourly.time || [];
    let startIndex = times.findIndex((value) => new Date(value).getTime() >= now - 30 * 60 * 1000);
    if (startIndex < 0) startIndex = 0;

    for (let i = startIndex; i < Math.min(startIndex + 6, times.length); i += 1) {
      const time = new Date(times[i]);
      const temp = hourly.temperature_2m?.[i];
      const chance = hourly.precipitation_probability?.[i];
      const item = document.createElement("div");
      item.className = "weather-hour-item";
      item.innerHTML = `
        <span>${time.toLocaleTimeString([], {hour: "numeric"})}</span>
        <strong>${Number.isFinite(temp) ? Math.round(temp) + "°" : "—"}</strong>
        <small>${Number.isFinite(chance) ? Math.round(chance) + "% rain" : ""}</small>
      `;
      weatherHourly.appendChild(item);
    }

    weatherLoading.hidden = true;
    weatherContent.hidden = false;
  }

  async function loadWeather(force = false) {
    const now = Date.now();
    if (!force && weatherCache && now - weatherCache.time < CONFIG.weatherCacheMs) {
      renderWeather(weatherCache.data, weatherCache.locationLabel);
      return;
    }

    weatherLoading.hidden = false;
    weatherLoading.textContent = "Checking the weather…";
    weatherContent.hidden = true;

    try {
      const position = await getWeatherPosition();
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", position.lat);
      url.searchParams.set("longitude", position.lon);
      url.searchParams.set("temperature_unit", "fahrenheit");
      url.searchParams.set("wind_speed_unit", "mph");
      url.searchParams.set("timezone", "auto");
      url.searchParams.set("forecast_days", "1");
      url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
      url.searchParams.set("hourly", "temperature_2m,precipitation_probability");
      url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max");

      const response = await fetch(url.toString(), {cache: "no-store"});
      if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
      const data = await response.json();

      weatherCache = {time: now, data, locationLabel: position.label};
      renderWeather(data, position.label);
    } catch (error) {
      console.info("Weather could not be loaded.", error);
      weatherLocationLabel.textContent = "Weather unavailable";
      weatherLoading.hidden = false;
      weatherLoading.textContent = "Weather could not load right now. Your Discover program is still available offline.";
      weatherContent.hidden = true;
    }
  }

  function openReviewForm() {
    const opened = window.open(CONFIG.reviewUrl, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = CONFIG.reviewUrl;
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

  function startTriviaSession() {
    session.trivia = {
      easy: drawFromDeck("triviaEasy", triviaBank.easy, 5),
      medium: drawFromDeck("triviaMedium", triviaBank.medium, 5),
      hard: drawFromDeck("triviaHard", triviaBank.hard, 5),

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

  function startWyrSession() {
    session.wyr = {
      rounds: drawFromDeck("wyr", wouldYouRather, CONFIG.wyrRounds),
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

  function startScrambleSession() {
    clearScrambleTimer();

    session.scramble = {
      rounds: drawFromDeck("scramble", scrambles, CONFIG.scrambleRounds),
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

      <div class="scramble-credit-note">
        Know it? Tap <strong>Solved!</strong> before time runs out to get credit.
      </div>

      <div id="scrambleHint" class="scramble-hint" hidden>
        Hint: ${escapeHtml(item.hint)}
      </div>

      <div id="scrambleResult" class="result-text scramble-result" aria-live="polite">
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
        result.innerHTML = `
          <span class="scramble-answer-label">Solved!</span>
          <strong class="scramble-answer-reveal">${escapeHtml(item.word)}</strong>
        `;
      } else {
        state.streak = 0;
        result.innerHTML = `
          <span class="scramble-answer-label">Answer</span>
          <strong class="scramble-answer-reveal">${escapeHtml(item.word)}</strong>
        `;
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

  gamesBtn.addEventListener("click", () => {
    openPanel(gamesPanel);
  });

  driverBtn.addEventListener("click", () => {
    openPanel(driverPanel);
  });

  weatherBtn.addEventListener("click", () => {
    openPanel(weatherPanel);
    loadWeather(false);
  });

  planBtn.addEventListener("click", () => {
    openPanel(planPanel);
  });

  tipBtn.addEventListener("click", () => {
    openPanel(tipPanel);
  });

  reviewBtn.addEventListener("click", () => {
    openPanel(reviewPanel);
  });

  reviewOpenBtn.addEventListener("click", openReviewForm);
  refreshWeatherBtn.addEventListener("click", () => loadWeather(true));

  // The Discover badge doubles as the unobtrusive weekly-program loader.
  loadLocalProgramBtn.addEventListener("click", chooseLocalProgram);

  localProgramFile.addEventListener("change", () => {
    const file = localProgramFile.files && localProgramFile.files[0];
    loadLocalProgram(file);
  });

  loadingGamesBtn.addEventListener("click", () => openPanel(gamesPanel));
  loadingReviewBtn.addEventListener("click", () => openPanel(reviewPanel));
  loadingTipBtn.addEventListener("click", () => openPanel(tipPanel));
  loadingPlanBtn.addEventListener("click", () => openPanel(planPanel));

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
  volumeBtn.addEventListener("click", toggleSound);

  video.addEventListener("canplay", () => {
    videoFallback.hidden = true;
    if (video.readyState >= 3) hideLoadingPrompt();
  });

  video.addEventListener("playing", () => {
    videoFallback.hidden = true;
    hideLoadingPrompt();
  });

  video.addEventListener("waiting", scheduleLoadingPrompt);
  video.addEventListener("stalled", scheduleLoadingPrompt);

  video.addEventListener("error", () => {
    hideLoadingPrompt();
    videoFallback.hidden = false;
  });

  ["pointerdown","touchstart","keydown"].forEach((eventName) => {
    document.addEventListener(
      eventName,
      (event) => {
        if (anyPanelOpen()) {
          resetInactivityTimer();
        }

        const tappedVolumeControl =
          event.target instanceof Element &&
          event.target.closest("#volumeBtn");

        if (!audioUnlocked && !tappedVolumeControl) {
          unlockAudioIfNeeded();
        } else {
          ensureVideoPlayback();
        }
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

  applySoundState();
  ensureVideoPlayback();
  window.addEventListener("beforeunload", () => {
    if (localProgramUrl) URL.revokeObjectURL(localProgramUrl);
  });
})();
