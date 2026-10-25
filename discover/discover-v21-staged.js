// Discover v21 STAGED — music requests + larger game banks + Rider Hub reinforcement
(() => {
  "use strict";

  // Set false to disable Halloween site-wide; the Games switch stores a local preference.
  const HALLOWEEN_MODE = true;
  const HALLOWEEN_STORAGE_KEY = "discoverHalloweenMode";
  let halloweenEnabled = HALLOWEEN_MODE;
  try { halloweenEnabled = HALLOWEEN_MODE && localStorage.getItem(HALLOWEEN_STORAGE_KEY) !== "false"; } catch {}

  const CONFIG = {
    videoUrl: "https://media.bigredconnectokc.com/discover-current.mov",
    inactivityMs: 180000,

    triviaRounds: 15,
    triviaSeconds: 15,
    wyrRounds: 10,
    scrambleRounds: 10,

    scrambleSeconds: 12,
    scrambleRevealMs: 1600,

    soundStateStorageKey: "discoverSoundOn",
    loadingPromptDelayMs: 1600,

    reviewUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeq6WCnkrG417rWCGwN56i7FplWpNTHlg1lpGuC-IETDEkEHw/viewform",
    weatherCacheMs: 600000,
    weatherFallbackLat: 35.4676,
    weatherFallbackLon: -97.5164,
    musicRequestApi: "https://bigred-music-requests.bigredtransportation.workers.dev/api/music/request"
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
  const musicBtn = document.getElementById("musicBtn");
  const weatherBtn = document.getElementById("weatherBtn");
  const driverBtn = document.getElementById("driverBtn");
  const planBtn = document.getElementById("planBtn");
  const tipBtn = document.getElementById("tipBtn");
  const reviewBtn = document.getElementById("reviewBtn");

  const musicPanel = document.getElementById("musicPanel");
  const driverPanel = document.getElementById("driverPanel");
  const weatherPanel = document.getElementById("weatherPanel");
  const gamesPanel = document.getElementById("gamesPanel");
  const gamePanel = document.getElementById("gamePanel");
  const planPanel = document.getElementById("planPanel");
  const tipPanel = document.getElementById("tipPanel");
  const reviewPanel = document.getElementById("reviewPanel");

  const musicRequestStatus = document.getElementById("musicRequestStatus");
  const musicSpecificInput = document.getElementById("musicSpecificInput");
  const musicSpecificSendBtn = document.getElementById("musicSpecificSendBtn");
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
  let triviaTimer = null;
  let triviaDeadline = 0;
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
,
      { q: "What color is on Oklahoma's state flag background?", a: ["Blue", "Red", "Green", "Gold"], correct: 0 },
      { q: "Which city is the capital of Oklahoma?", a: ["Tulsa", "Norman", "Oklahoma City", "Lawton"], correct: 2 },
      { q: "Which NBA team plays in Oklahoma City?", a: ["Mavericks", "Thunder", "Spurs", "Nuggets"], correct: 1 },
      { q: "OU's main campus is in which city?", a: ["Stillwater", "Norman", "Edmond", "Tulsa"], correct: 1 },
      { q: "OSU's main campus is in which city?", a: ["Stillwater", "Moore", "Yukon", "Shawnee"], correct: 0 },
      { q: "Which road vehicle usually carries passengers for hire?", a: ["Tow truck", "Taxi", "Bulldozer", "Tractor"], correct: 1 },
      { q: "Which device commonly gives turn-by-turn directions?", a: ["GPS", "Toaster", "Printer", "Microwave"], correct: 0 },
      { q: "Which drink is made from roasted coffee beans?", a: ["Tea", "Coffee", "Soda", "Milk"], correct: 1 },
      { q: "How many minutes are in one hour?", a: ["30", "45", "60", "90"], correct: 2 },
      { q: "How many states are in the United States?", a: ["48", "49", "50", "52"], correct: 2 },
      { q: "Which month comes after September?", a: ["August", "October", "November", "December"], correct: 1 },
      { q: "Which animal is known for saying 'moo'?", a: ["Horse", "Cow", "Dog", "Goat"], correct: 1 },
      { q: "What do you call frozen water?", a: ["Steam", "Ice", "Rain", "Snow"], correct: 1 },
      { q: "Which meal is usually eaten in the morning?", a: ["Dinner", "Lunch", "Breakfast", "Supper"], correct: 2 },
      { q: "Which color do red and blue make when mixed as paint?", a: ["Green", "Purple", "Orange", "Brown"], correct: 1 },
      { q: "Which sport is played with a basketball hoop?", a: ["Baseball", "Basketball", "Soccer", "Golf"], correct: 1 },
      { q: "Which Oklahoma city is south of Oklahoma City along I-35?", a: ["Moore", "Edmond", "Enid", "Woodward"], correct: 0 },
      { q: "Which city is west of Oklahoma City and known for its Czech heritage?", a: ["Yukon", "Ada", "Durant", "Miami"], correct: 0 },
      { q: "Which airport serves Oklahoma City as its main commercial airport?", a: ["Will Rogers World Airport", "Tulsa Riverside Airport", "Tinker AFB", "Max Westheimer Airport"], correct: 0 },
      { q: "Bricktown is best known as part of which city?", a: ["Tulsa", "Oklahoma City", "Norman", "Stillwater"], correct: 1 },
      { q: "Which highway direction would normally take you from Moore toward Norman on I-35?", a: ["North", "South", "East", "West"], correct: 1 },
      { q: "What is the opposite of 'arrive'?", a: ["Leave", "Stop", "Wait", "Park"], correct: 0 },
      { q: "A playlist is a collection of what?", a: ["Roads", "Songs", "Maps", "Receipts"], correct: 1 },
      { q: "What does a red traffic light mean?", a: ["Go", "Speed up", "Stop", "Turn around"], correct: 2 },
      { q: "Which season usually includes Christmas in Oklahoma?", a: ["Spring", "Summer", "Fall", "Winter"], correct: 3 },
      { q: "What does 'OKC' commonly stand for?", a: ["Oklahoma County", "Oklahoma City", "Oklahoma Central", "Oklahoma Corridor"], correct: 1 },
      { q: "Which venue type usually hosts live bands?", a: ["Concert venue", "Library shelf", "Gas pump", "Car wash"], correct: 0 },
      { q: "Which of these is a common ride destination?", a: ["Airport", "Attic", "Mailbox", "Driveway cone"], correct: 0 },
      { q: "Which word means a planned path between two places?", a: ["Route", "Recipe", "Roster", "Riddle"], correct: 0 },
      { q: "Which app feature can scan a square code with a phone camera?", a: ["QR code", "Compass", "Calculator", "Alarm"], correct: 0 },
      { q: "Which direction is opposite east?", a: ["North", "South", "West", "Up"], correct: 2 },
      { q: "Which number comes after 99?", a: ["98", "100", "101", "109"], correct: 1 },
      { q: "Which holiday is on July 4 in the United States?", a: ["Thanksgiving", "Independence Day", "Memorial Day", "Labor Day"], correct: 1 },
      { q: "Which Oklahoma college team is nicknamed the Sooners?", a: ["OU", "OSU", "UCO", "OBU"], correct: 0 },
      { q: "Which city is home to Oklahoma Baptist University?", a: ["Shawnee", "Moore", "Mustang", "Edmond"], correct: 0 },
      { q: "Which Oklahoma city is home to the University of Central Oklahoma?", a: ["Edmond", "Norman", "Lawton", "Tulsa"], correct: 0 },
      { q: "Which city lies directly south of Moore?", a: ["Norman", "Edmond", "Yukon", "Shawnee"], correct: 0 },
      { q: "What does a green traffic light mean?", a: ["Stop", "Go when clear", "Back up", "Park"], correct: 1 },
      { q: "Which device is used to call or text someone?", a: ["Phone", "Toaster", "Thermostat", "Printer"], correct: 0 },
      { q: "Which day comes after Friday?", a: ["Thursday", "Saturday", "Sunday", "Monday"], correct: 1 },
      { q: "How many days are in a week?", a: ["5", "6", "7", "8"], correct: 2 },
      { q: "Which season comes after summer?", a: ["Winter", "Spring", "Fall", "Monsoon"], correct: 2 },
      { q: "Which month contains Halloween?", a: ["September", "October", "November", "December"], correct: 1 },
      { q: "Which holiday is celebrated on December 25?", a: ["Thanksgiving", "Christmas", "Labor Day", "Memorial Day"], correct: 1 },
      { q: "Which sport uses touchdowns?", a: ["Football", "Baseball", "Golf", "Tennis"], correct: 0 },
      { q: "Which sport uses home runs?", a: ["Basketball", "Baseball", "Hockey", "Soccer"], correct: 1 },
      { q: "Which sport uses goals and a net?", a: ["Soccer", "Golf", "Bowling", "Baseball"], correct: 0 },
      { q: "Which drink is typically served hot in a mug?", a: ["Coffee", "Ice water", "Lemonade", "Soda"], correct: 0 },
      { q: "Which meal is commonly eaten around noon?", a: ["Breakfast", "Lunch", "Dessert", "Brunch only"], correct: 1 },
      { q: "Which is a common late-night food?", a: ["Pizza", "Cereal box", "Raw flour", "Ice cubes"], correct: 0 },
      { q: "What color are most stop signs in the U.S.?", a: ["Blue", "Green", "Red", "Purple"], correct: 2 },
      { q: "Which direction is opposite north?", a: ["East", "West", "South", "Up"], correct: 2 },
      { q: "Which direction is opposite south?", a: ["East", "North", "West", "Down"], correct: 1 },
      { q: "How many wheels does a typical car have?", a: ["2", "3", "4", "6"], correct: 2 },
      { q: "What is fuel used for in a gasoline vehicle?", a: ["Power the engine", "Cool the tires", "Charge a phone only", "Wash the windshield"], correct: 0 },
      { q: "Which part of a car helps you see behind you?", a: ["Rearview mirror", "Cup holder", "Seat belt", "Floor mat"], correct: 0 },
      { q: "Which part of a car helps keep passengers restrained?", a: ["Seat belt", "Door handle", "Sun visor", "Radio"], correct: 0 },
      { q: "Which Oklahoma city is east of Oklahoma City on I-40?", a: ["Shawnee", "Yukon", "El Reno", "Weatherford"], correct: 0 },
      { q: "Which Oklahoma city is west of Oklahoma City on I-40?", a: ["Yukon", "Shawnee", "Seminole", "Prague"], correct: 0 },
      { q: "Which city is home to the Oklahoma City Thunder?", a: ["Oklahoma City", "Tulsa", "Norman", "Stillwater"], correct: 0 },
      { q: "Which university is commonly called OU?", a: ["University of Oklahoma", "Oklahoma State University", "UCO", "OBU"], correct: 0 },
      { q: "Which university is commonly called OSU?", a: ["Oklahoma State University", "University of Oklahoma", "UCO", "TU"], correct: 0 },
      { q: "Which Oklahoma team is nicknamed the Cowboys?", a: ["OSU", "OU", "Thunder", "UCO"], correct: 0 },
      { q: "Which Oklahoma team is nicknamed the Sooners?", a: ["OU", "OSU", "Thunder", "Tulsa"], correct: 0 },
      { q: "Which word means to reserve something ahead of time?", a: ["Book", "Forget", "Cancel", "Hide"], correct: 0 },
      { q: "What does 'pickup' mean in a ride?", a: ["Where the rider gets in", "Where the ride ends", "A type of music", "A weather alert"], correct: 0 },
      { q: "What does 'drop-off' mean in a ride?", a: ["Where the rider exits", "Where the driver starts the day", "A playlist", "A fuel stop"], correct: 0 },
      { q: "What does 'route' mean?", a: ["Path between places", "Type of snack", "Weather condition", "Music genre"], correct: 0 },
      { q: "What is a playlist?", a: ["A collection of songs", "A list of roads", "A list of riders", "A weather map"], correct: 0 },
      { q: "Which button usually starts media playback?", a: ["Play", "Delete", "Print", "Close"], correct: 0 },
      { q: "Which symbol often represents music?", a: ["🎵", "⚽", "☂️", "✈️"], correct: 0 },
      { q: "Which symbol often represents weather?", a: ["☀️", "🎵", "☎️", "🚗"], correct: 0 },
      { q: "Which symbol often represents an airport?", a: ["✈️", "🎸", "🏈", "🎯"], correct: 0 },
      { q: "Which symbol often represents a phone?", a: ["📱", "🏀", "🚦", "🌧️"], correct: 0 },
      { q: "Which Oklahoma city is known for Bricktown?", a: ["Oklahoma City", "Edmond", "Tulsa", "Lawton"], correct: 0 },
      { q: "Which Oklahoma district is known for Campus Corner?", a: ["Norman", "Yukon", "Moore", "Shawnee"], correct: 0 },
      { q: "Which state borders Oklahoma to the south?", a: ["Texas", "Nebraska", "Iowa", "Colorado only"], correct: 0 },
      { q: "Which state borders Oklahoma to the north?", a: ["Kansas", "Louisiana", "Arizona", "Mississippi"], correct: 0 },
      { q: "Which city is farther north: Edmond or Norman?", a: ["Edmond", "Norman", "Same latitude", "Neither"], correct: 0 },
      { q: "Which city is farther south: Norman or Edmond?", a: ["Norman", "Edmond", "Same latitude", "Neither"], correct: 0 },
      { q: "What is the common abbreviation for miles per hour?", a: ["mph", "mpg", "rpm", "gps"], correct: 0 },
      { q: "Which unit is commonly used for temperature in Oklahoma weather reports?", a: ["Fahrenheit", "Kelvin only", "Meters", "Liters"], correct: 0 },
      { q: "Which app feature can send an alert to your phone?", a: ["Push notification", "Wallpaper", "Calculator", "Keyboard"], correct: 0 },
      { q: "What is the Big Red Rider Hub designed to help riders access?", a: ["Ride information", "Video games only", "Bank accounts", "Medical records"], correct: 0 },
      { q: "What should a rider do before leaving the vehicle?", a: ["Check belongings", "Leave the door open", "Forget their phone", "Ignore the destination"], correct: 0 }
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
,
      { q: "Which interstate runs north-south through Oklahoma City, Moore, and Norman?", a: ["I-40", "I-35", "I-44", "I-240"], correct: 1 },
      { q: "Which interstate is the major east-west route through central Oklahoma City?", a: ["I-35", "I-40", "I-49", "I-70"], correct: 1 },
      { q: "Which Oklahoma City district is known for its canal and entertainment venues?", a: ["Bricktown", "Paseo", "Stockyards City", "Automobile Alley"], correct: 0 },
      { q: "Which Oklahoma City district is historically associated with cattle and western culture?", a: ["Stockyards City", "Bricktown", "Plaza District", "Deep Deuce"], correct: 0 },
      { q: "Which Oklahoma City park sits just south of downtown and includes a large urban green space?", a: ["Scissortail Park", "Hafer Park", "Lake Thunderbird", "Myriad Gardens Zoo"], correct: 0 },
      { q: "Which city is directly north of Oklahoma City along I-35?", a: ["Edmond", "Norman", "Mustang", "Shawnee"], correct: 0 },
      { q: "Which city is southwest of Oklahoma City near I-44 and SH-37?", a: ["Tuttle", "Mustang", "Choctaw", "Harrah"], correct: 0 },
      { q: "Which Oklahoma city is home to the University of Oklahoma?", a: ["Norman", "Stillwater", "Lawton", "Enid"], correct: 0 },
      { q: "Which Oklahoma city is home to Oklahoma State University?", a: ["Stillwater", "Edmond", "Shawnee", "Norman"], correct: 0 },
      { q: "What does ETA usually mean in transportation?", a: ["Estimated Time of Arrival", "Emergency Traffic Alert", "Exact Travel Address", "Express Transit Area"], correct: 0 },
      { q: "What is a round trip?", a: ["A ride with a return portion", "A circular parking lot", "A one-way flight", "A road construction detour"], correct: 0 },
      { q: "Which instrument measures air temperature?", a: ["Barometer", "Thermometer", "Speedometer", "Odometer"], correct: 1 },
      { q: "Which instrument in a vehicle measures speed?", a: ["Odometer", "Tachometer", "Speedometer", "Altimeter"], correct: 2 },
      { q: "Which vehicle gauge tracks total distance traveled?", a: ["Odometer", "Fuel gauge", "Compass", "Voltmeter"], correct: 0 },
      { q: "Which road sign shape is normally used for STOP signs in the U.S.?", a: ["Triangle", "Octagon", "Circle", "Pentagon"], correct: 1 },
      { q: "Which side of the road do vehicles drive on in the United States?", a: ["Left", "Right", "Either", "Center"], correct: 1 },
      { q: "Which month begins meteorological fall in the Northern Hemisphere?", a: ["August", "September", "October", "November"], correct: 1 },
      { q: "What is the common abbreviation for Oklahoma?", a: ["OK", "OA", "OM", "OKL"], correct: 0 },
      { q: "Which time zone is Oklahoma in?", a: ["Eastern", "Central", "Mountain", "Pacific"], correct: 1 },
      { q: "Which river runs through the Oklahoma City area and is associated with the Boathouse District?", a: ["Oklahoma River", "Arkansas River", "Red River", "Canadian River"], correct: 0 },
      { q: "What is the name of Oklahoma City's NBA arena currently known as?", a: ["Paycom Center", "BOK Center", "Ford Center Tulsa", "Gallagher-Iba Arena"], correct: 0 },
      { q: "Which city is home to the BOK Center?", a: ["Tulsa", "Oklahoma City", "Norman", "Stillwater"], correct: 0 },
      { q: "Which Oklahoma highway is famous nationally for historic road-trip culture?", a: ["Route 66", "Route 1", "Route 95", "Route 101"], correct: 0 },
      { q: "What does 'PWA' stand for in web technology?", a: ["Progressive Web App", "Private Wireless Access", "Public Web Account", "Portable Window App"], correct: 0 },
      { q: "What does GPS use to determine location?", a: ["Satellites", "AM radio", "Streetlights", "Wi-Fi only"], correct: 0 },
      { q: "Which weather term describes the percentage likelihood of precipitation?", a: ["Humidity", "Chance of rain", "Wind chill", "Visibility"], correct: 1 },
      { q: "Which unit is commonly used for road distance in the U.S.?", a: ["Kilometers only", "Miles", "Meters", "Nautical miles"], correct: 1 },
      { q: "Which is usually the safest action when a driver needs to interact with a complex control?", a: ["Do it while turning", "Wait until safely stopped", "Look down for a long time", "Hand off steering"], correct: 1 },
      { q: "Which Oklahoma City district is known for NW 23rd Street restaurants and nightlife?", a: ["Uptown 23rd", "Stockyards City", "Adventure District", "Boathouse District"], correct: 0 },
      { q: "Campus Corner is closely associated with which university?", a: ["University of Oklahoma", "Oklahoma State University", "UCO", "OBU"], correct: 0 },
      { q: "Which city is Grand Casino located near?", a: ["Shawnee", "Norman", "Yukon", "Moore"], correct: 0 },
      { q: "FireLake is strongly associated with which Oklahoma community?", a: ["Shawnee", "Edmond", "Mustang", "Piedmont"], correct: 0 },
      { q: "Which city is west of Oklahoma City along I-40 and named after a Canadian territory?", a: ["Yukon", "Moore", "Choctaw", "Harrah"], correct: 0 },
      { q: "Which city is just west of Oklahoma City and has a well-known high school called the Broncos?", a: ["Mustang", "Edmond", "Shawnee", "Del City"], correct: 0 },
      { q: "Which Oklahoma City airport code is used for Will Rogers World Airport?", a: ["OKC", "TUL", "OUN", "LAW"], correct: 0 },
      { q: "Which interstate connects Oklahoma City and Norman?", a: ["I-35", "I-40", "I-44", "I-70"], correct: 0 },
      { q: "Which interstate connects Oklahoma City and Shawnee?", a: ["I-40", "I-35", "I-44", "I-240"], correct: 0 },
      { q: "Which Oklahoma City highway loops across the south side of the metro?", a: ["I-240", "I-235", "I-244", "I-70"], correct: 0 },
      { q: "Which highway runs north through central Oklahoma City toward Edmond?", a: ["I-235", "I-40", "I-240", "US-412 only"], correct: 0 },
      { q: "Which Oklahoma turnpike links Oklahoma City and Tulsa?", a: ["Turner Turnpike", "Kilpatrick Turnpike", "Cimarron Turnpike", "Indian Nation Turnpike"], correct: 0 },
      { q: "Which turnpike serves the northwest side of the Oklahoma City metro?", a: ["Kilpatrick Turnpike", "Turner Turnpike", "Cherokee Turnpike", "Muskogee Turnpike"], correct: 0 },
      { q: "What does GPS stand for?", a: ["Global Positioning System", "General Parking Service", "Ground Path Signal", "Geo Passenger System"], correct: 0 },
      { q: "What does ETA stand for?", a: ["Estimated Time of Arrival", "Exact Travel Address", "Emergency Turn Alert", "Expected Traffic Area"], correct: 0 },
      { q: "What does PWA stand for?", a: ["Progressive Web App", "Private Web Account", "Portable Wireless Access", "Public Web Archive"], correct: 0 },
      { q: "What does QR stand for in QR code?", a: ["Quick Response", "Quality Route", "Queued Request", "Quick Ride"], correct: 0 },
      { q: "Which Oklahoma City district is centered around NW 23rd Street nightlife and dining?", a: ["Uptown 23rd", "Bricktown", "Stockyards City", "Boathouse District"], correct: 0 },
      { q: "Which district is just west of downtown OKC and known for murals and local businesses?", a: ["Plaza District", "Adventure District", "Deep Deuce", "Stockyards City"], correct: 0 },
      { q: "Which district north of downtown OKC is known for restaurants and nightlife?", a: ["Midtown", "Bricktown", "Stockyards City", "Adventure District"], correct: 0 },
      { q: "Which OKC district is associated with western heritage and cattle history?", a: ["Stockyards City", "Paseo", "Plaza", "Automobile Alley"], correct: 0 },
      { q: "Which district is known for galleries and arts events in OKC?", a: ["Paseo Arts District", "Boathouse District", "Stockyards City", "Airport District"], correct: 0 },
      { q: "Which Oklahoma attraction is located near NE 50th and Martin Luther King Ave?", a: ["Oklahoma City Zoo", "Scissortail Park", "Lake Hefner", "Will Rogers World Airport"], correct: 0 },
      { q: "Which lake is on the northwest side of Oklahoma City?", a: ["Lake Hefner", "Lake Thunderbird", "Lake Texoma", "Grand Lake"], correct: 0 },
      { q: "Which lake is east of Norman?", a: ["Lake Thunderbird", "Lake Hefner", "Arcadia Lake", "Lake Overholser"], correct: 0 },
      { q: "Which city is home to Tinker Air Force Base?", a: ["Oklahoma City area", "Tulsa", "Lawton", "Enid"], correct: 0 },
      { q: "Which Oklahoma city is home to Fort Sill?", a: ["Lawton", "Enid", "Norman", "Shawnee"], correct: 0 },
      { q: "Which Oklahoma city is home to Vance Air Force Base?", a: ["Enid", "Altus", "Lawton", "Ardmore"], correct: 0 },
      { q: "Which Oklahoma city is home to Altus Air Force Base?", a: ["Altus", "Stillwater", "Shawnee", "Tulsa"], correct: 0 },
      { q: "Which airport code belongs to Will Rogers World Airport?", a: ["OKC", "TUL", "DFW", "OUN"], correct: 0 },
      { q: "Which airport code belongs to Tulsa International Airport?", a: ["TUL", "OKC", "LAW", "ADM"], correct: 0 },
      { q: "Which weather condition is measured with a percentage?", a: ["Humidity", "Temperature in degrees only", "Road speed", "Mileage"], correct: 0 },
      { q: "Which weather term refers to moving air?", a: ["Wind", "Humidity", "Pressure only", "Visibility only"], correct: 0 },
      { q: "Which instrument measures atmospheric pressure?", a: ["Barometer", "Thermometer", "Odometer", "Speedometer"], correct: 0 },
      { q: "Which instrument measures vehicle engine speed in RPM?", a: ["Tachometer", "Odometer", "Altimeter", "Compass"], correct: 0 },
      { q: "Which term means the distance a vehicle travels per unit of fuel?", a: ["Fuel economy", "Humidity", "Altitude", "Payload"], correct: 0 },
      { q: "Which common U.S. road sign is triangular?", a: ["Yield", "Stop", "Speed Limit", "Railroad crossing"], correct: 0 },
      { q: "Which common U.S. road sign is octagonal?", a: ["Stop", "Yield", "School zone", "No parking"], correct: 0 },
      { q: "Which lane is normally used to pass on a multilane highway in Oklahoma?", a: ["Left lane", "Right shoulder", "Median", "Exit lane only"], correct: 0 },
      { q: "Which month does the Oklahoma State Fair usually occur?", a: ["September", "January", "April", "December"], correct: 0 },
      { q: "Which city hosts the Oklahoma State Fair?", a: ["Oklahoma City", "Tulsa", "Norman", "Stillwater"], correct: 0 },
      { q: "Which city hosts the Tulsa State Fair?", a: ["Tulsa", "Oklahoma City", "Norman", "Shawnee"], correct: 0 },
      { q: "Which Oklahoma City arena is home to the Thunder?", a: ["Paycom Center", "BOK Center", "Lloyd Noble Center", "Gallagher-Iba Arena"], correct: 0 },
      { q: "Which arena is home to many major concerts in Tulsa?", a: ["BOK Center", "Paycom Center", "Lloyd Noble Center", "Chesapeake Energy Arena Norman"], correct: 0 },
      { q: "Which arena is on the University of Oklahoma campus?", a: ["Lloyd Noble Center", "Paycom Center", "BOK Center", "Gallagher-Iba Arena"], correct: 0 },
      { q: "Which arena is on the Oklahoma State University campus?", a: ["Gallagher-Iba Arena", "Paycom Center", "BOK Center", "Lloyd Noble Center"], correct: 0 },
      { q: "Which historic highway runs through Oklahoma City and Tulsa?", a: ["Route 66", "Route 1", "US-101", "Pacific Coast Highway"], correct: 0 },
      { q: "Which river is associated with the Boathouse District in Oklahoma City?", a: ["Oklahoma River", "Red River", "Arkansas River", "Illinois River"], correct: 0 },
      { q: "Which river runs through Tulsa?", a: ["Arkansas River", "Red River", "Washita River", "Canadian River"], correct: 0 },
      { q: "Which city is home to the National Weather Center?", a: ["Norman", "Tulsa", "Enid", "Stillwater"], correct: 0 },
      { q: "Which university partners heavily with the National Weather Center?", a: ["University of Oklahoma", "Oklahoma State University", "UCO", "OBU"], correct: 0 },
      { q: "What is a designated driver?", a: ["A sober driver responsible for transportation", "A rideshare app account", "A traffic officer", "A valet only"], correct: 0 },
      { q: "What does 'surge pricing' refer to?", a: ["Higher prices during high demand", "Lower prices after midnight", "Fuel discounts", "Parking fees"], correct: 0 },
      { q: "What does 'flat rate' usually mean?", a: ["A set price rather than a meter changing constantly", "A road with no hills", "A parking deck", "A type of tire"], correct: 0 },
      { q: "What does 'deadhead' mean in transportation?", a: ["Driving without a passenger", "Driving too fast", "Missing an exit", "Stopping for fuel"], correct: 0 },
      { q: "What does 'round trip' mean?", a: ["Travel to a destination and back", "One-way travel", "A circular road", "A short detour"], correct: 0 },
      { q: "What is the purpose of a fare estimate?", a: ["Give a rider an expected price before the ride", "Track weather", "Play music", "Change traffic lights"], correct: 0 }
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
,
      { q: "Oklahoma entered the Union in which year?", a: ["1899", "1907", "1912", "1921"], correct: 1 },
      { q: "Oklahoma was the ___ state admitted to the Union.", a: ["44th", "45th", "46th", "47th"], correct: 2 },
      { q: "What is Oklahoma's official state bird?", a: ["Scissor-tailed flycatcher", "Cardinal", "Meadowlark", "Blue jay"], correct: 0 },
      { q: "What is Oklahoma's official state tree?", a: ["Redbud", "Pecan", "Cottonwood", "Oak"], correct: 0 },
      { q: "Which famous trail historically ended in Abilene, Kansas after passing north from Texas through Indian Territory?", a: ["Chisholm Trail", "Oregon Trail", "Santa Fe Trail", "Natchez Trace"], correct: 0 },
      { q: "Which Oklahoma City museum focuses on the American West?", a: ["National Cowboy & Western Heritage Museum", "Gilcrease Museum", "Philbrook Museum", "Sam Noble Museum"], correct: 0 },
      { q: "Which university operates the Sam Noble Oklahoma Museum of Natural History?", a: ["University of Oklahoma", "Oklahoma State University", "UCO", "OBU"], correct: 0 },
      { q: "Which Oklahoma city hosts the National Cowboy & Western Heritage Museum?", a: ["Oklahoma City", "Tulsa", "Lawton", "Stillwater"], correct: 0 },
      { q: "Which Oklahoma city is home to the Philbrook Museum of Art?", a: ["Tulsa", "Norman", "Edmond", "Shawnee"], correct: 0 },
      { q: "Which large lake lies east of Norman?", a: ["Lake Thunderbird", "Lake Hefner", "Lake Overholser", "Arcadia Lake"], correct: 0 },
      { q: "Which lake is located in northwest Oklahoma City?", a: ["Lake Hefner", "Lake Thunderbird", "Lake Texoma", "Grand Lake"], correct: 0 },
      { q: "Which Oklahoma City district grew around historic automobile dealerships north of downtown?", a: ["Automobile Alley", "Paseo", "Stockyards City", "Bricktown"], correct: 0 },
      { q: "Which historic Oklahoma City neighborhood became a center of Black culture and jazz?", a: ["Deep Deuce", "Mesta Park", "Crown Heights", "Heritage Hills"], correct: 0 },
      { q: "Which Oklahoma City district is known for galleries and Spanish Revival architecture?", a: ["Paseo Arts District", "Bricktown", "Boathouse District", "Stockyards City"], correct: 0 },
      { q: "Which river forms much of Oklahoma's southern border with Texas?", a: ["Red River", "Arkansas River", "Cimarron River", "Canadian River"], correct: 0 },
      { q: "Which major river flows through Tulsa?", a: ["Arkansas River", "Red River", "Washita River", "North Canadian River"], correct: 0 },
      { q: "Which Oklahoma town is closely associated with the National Weather Center?", a: ["Norman", "Enid", "Ada", "Altus"], correct: 0 },
      { q: "The National Weather Center is on the campus of which university?", a: ["University of Oklahoma", "Oklahoma State University", "UCO", "TU"], correct: 0 },
      { q: "Which military installation is adjacent to southeast Oklahoma City?", a: ["Tinker Air Force Base", "Fort Sill", "Altus AFB", "Vance AFB"], correct: 0 },
      { q: "Which Oklahoma city is home to Fort Sill?", a: ["Lawton", "Enid", "Tulsa", "McAlester"], correct: 0 },
      { q: "Which Oklahoma city is home to Vance Air Force Base?", a: ["Enid", "Altus", "Lawton", "Norman"], correct: 0 },
      { q: "Which Oklahoma city is home to Altus Air Force Base?", a: ["Altus", "Shawnee", "Ponca City", "Ardmore"], correct: 0 },
      { q: "Which interstate connects Oklahoma City westward toward Amarillo?", a: ["I-40", "I-35", "I-44", "I-240"], correct: 0 },
      { q: "Which interstate connects Oklahoma City northeast toward Tulsa?", a: ["I-44", "I-35", "I-40", "I-27"], correct: 0 },
      { q: "Which turnpike connects the Oklahoma City area toward Tulsa?", a: ["Turner Turnpike", "Kilpatrick Turnpike", "H.E. Bailey Turnpike", "Muskogee Turnpike"], correct: 0 },
      { q: "Which turnpike loops around the north and west sides of the Oklahoma City metro?", a: ["Kilpatrick Turnpike", "Turner Turnpike", "Indian Nation Turnpike", "Cimarron Turnpike"], correct: 0 },
      { q: "Which interstate bypass runs along south Oklahoma City?", a: ["I-240", "I-235", "I-244", "I-444"], correct: 0 },
      { q: "Which north-south highway is also called the Broadway Extension north of downtown OKC?", a: ["US-77", "US-62", "US-270", "US-81"], correct: 0 },
      { q: "Which Oklahoma City attraction is located in the Adventure District and features extensive animal exhibits?", a: ["Oklahoma City Zoo", "Frontier City Museum", "Science Museum Tulsa", "Sam Noble Museum"], correct: 0 },
      { q: "Which botanical attraction is in downtown Oklahoma City?", a: ["Myriad Botanical Gardens", "Tulsa Botanic Garden", "Honor Heights Park", "Martin Park Nature Center"], correct: 0 },
      { q: "Which Oklahoma City sports complex hosts rowing and paddlesports along the Oklahoma River?", a: ["Boathouse District", "Fairgrounds Arena", "Taft Stadium", "Remington Park"], correct: 0 },
      { q: "Which horse-racing venue is in northeast Oklahoma City?", a: ["Remington Park", "Fair Meadows", "Will Rogers Downs", "Thunderbird Downs"], correct: 0 },
      { q: "Which city hosts Will Rogers World Airport?", a: ["Oklahoma City", "Tulsa", "Norman", "Edmond"], correct: 0 },
      { q: "Which city is home to the University of Central Oklahoma?", a: ["Edmond", "Norman", "Shawnee", "Stillwater"], correct: 0 },
      { q: "Which city is home to Oklahoma Baptist University?", a: ["Shawnee", "Edmond", "Lawton", "Durant"], correct: 0 },
      { q: "Oklahoma became a state on which date?", a: ["November 16, 1907", "July 4, 1907", "January 1, 1908", "April 22, 1889"], correct: 0 },
      { q: "What is Oklahoma's state motto?", a: ["Labor Omnia Vincit", "E Pluribus Unum", "Live Free or Die", "Excelsior"], correct: 0 },
      { q: "What is Oklahoma's official state flower?", a: ["Oklahoma rose", "Indian blanket", "Rose rock", "Redbud blossom"], correct: 0 },
      { q: "What is Oklahoma's official state rock?", a: ["Rose rock", "Granite", "Limestone", "Quartz"], correct: 0 },
      { q: "Which event opened large portions of Oklahoma Territory to settlement in 1889?", a: ["Land Run of 1889", "Louisiana Purchase", "Trail of Tears", "Homestead Strike"], correct: 0 },
      { q: "Which city was the first territorial capital of Oklahoma Territory?", a: ["Guthrie", "Oklahoma City", "Tulsa", "Norman"], correct: 0 },
      { q: "Which city served as Oklahoma's state capital before it moved to Oklahoma City?", a: ["Guthrie", "Tulsa", "Stillwater", "Lawton"], correct: 0 },
      { q: "In what year did Oklahoma City become the state capital?", a: ["1910", "1907", "1920", "1899"], correct: 0 },
      { q: "Which Oklahoma museum preserves the history of the 1995 bombing?", a: ["Oklahoma City National Memorial & Museum", "National Cowboy Museum", "Sam Noble Museum", "Philbrook Museum"], correct: 0 },
      { q: "Which Oklahoma City landmark features empty chairs representing bombing victims?", a: ["Oklahoma City National Memorial", "Scissortail Park", "Paycom Center", "Myriad Gardens"], correct: 0 },
      { q: "Which tribal nation is headquartered in Ada, Oklahoma?", a: ["Chickasaw Nation", "Cherokee Nation", "Osage Nation", "Muscogee Nation"], correct: 0 },
      { q: "Which tribal nation is headquartered in Tahlequah, Oklahoma?", a: ["Cherokee Nation", "Chickasaw Nation", "Choctaw Nation", "Comanche Nation"], correct: 0 },
      { q: "Which tribal nation is headquartered in Durant, Oklahoma?", a: ["Choctaw Nation", "Cherokee Nation", "Osage Nation", "Pawnee Nation"], correct: 0 },
      { q: "Which tribal nation is headquartered in Okmulgee, Oklahoma?", a: ["Muscogee Nation", "Chickasaw Nation", "Choctaw Nation", "Seminole Nation"], correct: 0 },
      { q: "Which tribal nation is headquartered in Pawhuska, Oklahoma?", a: ["Osage Nation", "Cherokee Nation", "Chickasaw Nation", "Kiowa Tribe"], correct: 0 },
      { q: "Which Oklahoma city is home to the University of Tulsa?", a: ["Tulsa", "Norman", "Edmond", "Stillwater"], correct: 0 },
      { q: "Which Oklahoma city is home to Cameron University?", a: ["Lawton", "Ada", "Enid", "Durant"], correct: 0 },
      { q: "Which Oklahoma city is home to East Central University?", a: ["Ada", "Durant", "Alva", "Tahlequah"], correct: 0 },
      { q: "Which Oklahoma city is home to Southeastern Oklahoma State University?", a: ["Durant", "Ada", "Weatherford", "Stillwater"], correct: 0 },
      { q: "Which Oklahoma city is home to Southwestern Oklahoma State University?", a: ["Weatherford", "Durant", "Tahlequah", "Edmond"], correct: 0 },
      { q: "Which Oklahoma city is home to Northwestern Oklahoma State University?", a: ["Alva", "Ada", "Lawton", "Shawnee"], correct: 0 },
      { q: "Which Oklahoma city is home to Northeastern State University?", a: ["Tahlequah", "Alva", "Weatherford", "Durant"], correct: 0 },
      { q: "Which major reservoir straddles the Oklahoma-Texas border?", a: ["Lake Texoma", "Lake Hefner", "Lake Thunderbird", "Keystone Lake"], correct: 0 },
      { q: "Which lake near Tulsa was formed by Keystone Dam on the Arkansas River?", a: ["Keystone Lake", "Lake Eufaula", "Grand Lake", "Lake Murray"], correct: 0 },
      { q: "Which Oklahoma lake is one of the largest wholly within the state?", a: ["Lake Eufaula", "Lake Hefner", "Lake Thunderbird", "Lake Overholser"], correct: 0 },
      { q: "Which scenic waterfall attraction is near Davis, Oklahoma?", a: ["Turner Falls", "Natural Falls", "Little Niagara", "Blue Hole"], correct: 0 },
      { q: "Which Oklahoma state park is known for Broken Bow Lake and forested hills?", a: ["Beavers Bend State Park", "Lake Thunderbird State Park", "Roman Nose State Park", "Alabaster Caverns State Park"], correct: 0 },
      { q: "Which Oklahoma state park is known for gypsum caves?", a: ["Alabaster Caverns State Park", "Beavers Bend State Park", "Robbers Cave State Park", "Lake Murray State Park"], correct: 0 },
      { q: "Which Oklahoma state park is associated with outlaw hideouts in the Sans Bois Mountains?", a: ["Robbers Cave State Park", "Roman Nose State Park", "Sequoyah State Park", "Lake Murray State Park"], correct: 0 },
      { q: "Which major interstate follows much of the east-west corridor through Oklahoma City toward Amarillo?", a: ["I-40", "I-35", "I-44", "I-70"], correct: 0 },
      { q: "Which interstate connects Oklahoma City to Wichita and Dallas?", a: ["I-35", "I-40", "I-44", "I-70"], correct: 0 },
      { q: "Which interstate connects Oklahoma City toward Tulsa and Lawton in different directions?", a: ["I-44", "I-35", "I-40", "I-27"], correct: 0 },
      { q: "Which interstate does NOT directly pass through Oklahoma City?", a: ["I-70", "I-35", "I-40", "I-44"], correct: 0 },
      { q: "Which U.S. highway follows Broadway Extension north of downtown Oklahoma City?", a: ["US-77", "US-81", "US-62", "US-270"], correct: 0 },
      { q: "Which Oklahoma turnpike connects Tulsa toward Joplin, Missouri?", a: ["Will Rogers Turnpike", "Turner Turnpike", "Kilpatrick Turnpike", "H.E. Bailey Turnpike"], correct: 0 },
      { q: "Which Oklahoma turnpike runs toward Lawton from the Oklahoma City area?", a: ["H.E. Bailey Turnpike", "Turner Turnpike", "Will Rogers Turnpike", "Cherokee Turnpike"], correct: 0 },
      { q: "Which Oklahoma City lake is west of downtown and south of Lake Hefner?", a: ["Lake Overholser", "Lake Thunderbird", "Arcadia Lake", "Lake Eufaula"], correct: 0 },
      { q: "Which city is home to Arcadia Lake?", a: ["Edmond", "Norman", "Tulsa", "Lawton"], correct: 0 },
      { q: "Which city is home to Frontier City amusement park?", a: ["Oklahoma City", "Tulsa", "Norman", "Stillwater"], correct: 0 },
      { q: "Which Oklahoma City museum is located next to the zoo in the Adventure District?", a: ["Science Museum Oklahoma", "Sam Noble Museum", "Philbrook Museum", "Museum of Osteology"], correct: 0 },
      { q: "Which museum in Norman is known for dinosaur exhibits and natural history?", a: ["Sam Noble Oklahoma Museum of Natural History", "Science Museum Oklahoma", "Gilcrease Museum", "National Cowboy Museum"], correct: 0 },
      { q: "Which Tulsa museum is famous for American West art and Indigenous collections?", a: ["Gilcrease Museum", "Philbrook Museum", "Sam Noble Museum", "National Cowboy Museum"], correct: 0 },
      { q: "Which Tulsa museum is housed in a historic villa and gardens?", a: ["Philbrook Museum of Art", "Gilcrease Museum", "BOK Center", "Discovery Lab"], correct: 0 },
      { q: "Which city is home to the Woody Guthrie Center?", a: ["Tulsa", "Norman", "Stillwater", "Lawton"], correct: 0 },
      { q: "Which Oklahoma-born country star is from Yukon?", a: ["Garth Brooks", "Blake Shelton", "Toby Keith", "Carrie Underwood"], correct: 0 },
      { q: "Which Oklahoma-born singer is from Checotah?", a: ["Carrie Underwood", "Reba McEntire", "Vince Gill", "Garth Brooks"], correct: 0 },
      { q: "Which Oklahoma country star was born in Clinton and raised in Moore?", a: ["Toby Keith", "Garth Brooks", "Blake Shelton", "Vince Gill"], correct: 0 },
      { q: "Which city is home to the American Banjo Museum?", a: ["Oklahoma City", "Tulsa", "Shawnee", "Stillwater"], correct: 0 },
      { q: "Which Oklahoma town is associated with the birthplace of Will Rogers?", a: ["Oologah", "Yukon", "Ada", "Durant"], correct: 0 },
      { q: "Which historic Oklahoma fort is near Lawton?", a: ["Fort Sill", "Fort Gibson", "Fort Reno", "Fort Washita"], correct: 0 }
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
    ["Have sunrise views every morning","Have sunset views every evening"],
    ["Spend a night in Bricktown", "Spend a night in Midtown"],
    ["Catch an OU game", "Catch a Thunder game"],
    ["See live country music", "See live rock music"],
    ["Go to Campus Corner", "Go to the Plaza District"],
    ["Have perfect parking everywhere", "Have every light turn green"],
    ["Ride with the windows down", "Ride with the A/C ice cold"],
    ["Pick every song", "Pick every snack"],
    ["Always know the fastest route", "Always know the prettiest route"],
    ["Have free airport rides", "Have free concert rides"],
    ["Explore Route 66", "Explore downtown OKC"],
    ["Go to a small local venue", "Go to a huge arena show"],
    ["Have front-row concert seats", "Have courtside basketball seats"],
    ["Spend Saturday in Norman", "Spend Saturday in Shawnee"],
    ["Go to a food festival", "Go to a music festival"],
    ["Have unlimited breakfast tacos", "Have unlimited late-night pizza"],
    ["Listen to country all night", "Listen to throwbacks all night"],
    ["Sing every song out loud", "Know every trivia answer"],
    ["Never need a phone charger", "Never need to stop for gas"],
    ["Have a personal DJ", "Have a personal chef"],
    ["Take a sunrise drive", "Take a midnight drive"],
    ["Visit every Oklahoma small town", "Visit every Oklahoma state park"],
    ["See a thunderstorm from a safe porch", "See a snowfall from a warm cabin"],
    ["Have tickets to every home game", "Have tickets to every concert"],
    ["Always get the best playlist", "Always get the best parking spot"],
    ["Drive Route 66 coast to coast", "Take a cross-country train trip"],
    ["Spend a day at the lake", "Spend a day downtown"],
    ["Go bowling with friends", "Go to karaoke with friends"],
    ["Eat at a new local restaurant", "Return to your favorite spot"],
    ["See fireworks", "See Christmas lights"],
    ["Go to the State Fair", "Go to a county fair"],
    ["Have one extra hour every day", "Have one extra day every month"],
    ["Always remember names", "Always remember song lyrics"],
    ["Never have a low phone battery", "Never have weak cell service"],
    ["Have perfect weather on every ride", "Have empty roads on every ride"],
    ["Take the turnpike", "Take the scenic back roads"],
    ["Watch a comedy", "Watch an action movie"],
    ["Go dancing", "Go to live trivia"],
    ["Have breakfast for dinner", "Have dinner for breakfast"],
    ["Spend a night in Tulsa", "Spend a night in Oklahoma City"],
    ["Go to a rodeo", "Go to a basketball game"],
    ["Have a truck", "Have a sports car"],
    ["Ride in Big Red", "Ride in a luxury limo"],
    ["Listen to 2000s hits", "Listen to 2010s hits"],
    ["Always have the aux cord", "Always control the temperature"],
    ["Know the weather a week ahead", "Know traffic an hour ahead"],
    ["Take a group road trip", "Take a solo road trip"],
    ["Visit the mountains in fall", "Visit the beach in summer"],
    ["Have a reserved table everywhere", "Have reserved parking everywhere"],
    ["Go to a comedy show", "Go to a concert"],
    ["Spend the evening at a casino", "Spend the evening at a live-music venue"],
    ["Watch college football", "Watch pro basketball"],
    ["Go to an outdoor concert", "Go to an indoor arena show"],
    ["Have a favorite local diner", "Have a favorite local coffee shop"],
    ["Try a new playlist every ride", "Keep the same favorite playlist"],
    ["Hear the original song", "Hear a great live cover"],
    ["Sit by the stage", "Sit where the sound is best"],
    ["Have a quiet ride", "Have a sing-along ride"],
    ["Plan every weekend early", "Decide everything last minute"],
    ["Get everywhere 10 minutes early", "Never have to look for parking"],
    ["Have unlimited road-trip snacks", "Have unlimited coffee"],
    ["Take a night drive in the city", "Take a night drive in the country"],
    ["Visit an Oklahoma lake", "Visit an Oklahoma mountain"],
    ["Go to a Thunder playoff game", "Go to an OU rivalry game"],
    ["Have a convertible on a perfect day", "Have a heated SUV in winter"],
    ["Always know where you parked", "Always find your keys instantly"],
    ["Never hit construction", "Never hit rush-hour traffic"],
    ["Have free movie tickets", "Have free concert tickets"],
    ["Go to a street festival", "Go to a county fair"],
    ["Spend a weekend on Route 66", "Spend a weekend at the lake"],
    ["Have a playlist named after you", "Have a menu item named after you"],
    ["Pick the destination", "Pick the music"],
    ["Get a surprise upgrade", "Get a surprise discount"],
    ["Watch the sunrise", "Watch the sunset"],
    ["Have a perfect singing voice", "Have perfect dance moves"],
    ["Take photos everywhere", "Leave the phone in your pocket"],
    ["Go to a game with friends", "Go to a concert with friends"],
    ["Always have a designated driver", "Always have a reserved ride"],
    ["Discover a hidden local restaurant", "Discover a hidden local music venue"],
    ["Have one favorite song forever", "Find a new favorite song every week"],
    ["Ride through a quiet downtown", "Ride through a lively downtown"]
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
  const seasonalTrivia = {
    easy: [
    { q: "Which school does Harry Potter attend?", a: ["Beauxbatons", "Hogwarts", "Durmstrang", "Ilvermorny"], correct: 1 },
    { q: "What is the name of Harry Potter's owl?", a: ["Crookshanks", "Fawkes", "Hedwig", "Scabbers"], correct: 2 },
    { q: "Which sport is played on flying broomsticks in Harry Potter?", a: ["Quidditch", "Gobstones", "Wizard chess", "Dueling"], correct: 0 },
    { q: "How many Hogwarts houses are there?", a: ["3", "4", "5", "6"], correct: 1 },
    { q: "Which Hogwarts house is Harry Potter sorted into?", a: ["Hufflepuff", "Ravenclaw", "Slytherin", "Gryffindor"], correct: 3 },
    { q: "What month contains Halloween?", a: ["September", "October", "November", "December"], correct: 1 },
    { q: "What color do many tree leaves turn in fall?", a: ["Orange", "Blue", "Purple only", "Silver"], correct: 0 },
    { q: "Which fruit is commonly carved into a jack-o'-lantern?", a: ["Apple", "Pumpkin", "Pear", "Peach"], correct: 1 },
    { q: "Which season comes between summer and winter?", a: ["Spring", "Fall", "Monsoon", "Dry season"], correct: 1 },
    { q: "Which drink is often served warm during fall?", a: ["Apple cider", "Lemonade", "Iced tea only", "Sports drink"], correct: 0 },
    { q: "What do people often rake into piles during fall?", a: ["Leaves", "Snowballs", "Sand", "Flower petals"], correct: 0 },
    { q: "Which holiday is celebrated on October 31?", a: ["Halloween", "Thanksgiving", "Labor Day", "New Year's Eve"], correct: 0 },
    { q: "Which color is strongly associated with pumpkins?", a: ["Orange", "Blue", "Pink", "Silver"], correct: 0 },
    { q: "What is a common fall activity at a farm?", a: ["Hayride", "Surfing", "Ice fishing", "Snowboarding"], correct: 0 },
    { q: "Which treat is commonly made by coating an apple in a sweet topping?", a: ["Caramel apple", "Fruit pizza", "Cornbread", "Shortbread"], correct: 0 },
    { q: "Which clothing item becomes more common as fall gets cooler?", a: ["Sweater", "Swimsuit", "Flip-flops only", "Snorkel"], correct: 0 },
    { q: "What kind of maze is especially popular in fall?", a: ["Corn maze", "Ice maze", "Sand maze", "Water maze"], correct: 0 },
    { q: "What does a scarecrow traditionally stand in?", a: ["A field", "A swimming pool", "A garage", "A theater"], correct: 0 },
    { q: "Which Harry Potter item can make the wearer invisible?", a: ["Invisibility Cloak", "Sorting Hat", "Marauder's Map", "Time-Turner"], correct: 0 },
    { q: "What does the Sorting Hat do at Hogwarts?", a: ["Assigns students to houses", "Teaches Potions", "Delivers mail", "Starts Quidditch games"], correct: 0 },
    { q: "In Hocus Pocus, what is the last name of Winifred, Sarah, and Mary?", a: ["Sanderson", "Spellman", "Blackwood", "Grimm"], correct: 0 },
    { q: "Who is known as the Pumpkin King in The Nightmare Before Christmas?", a: ["Jack Skellington", "Oogie Boogie", "Zero", "Dr. Finkelstein"], correct: 0 },
    { q: "Which friendly ghost is famous for wanting to make friends?", a: ["Casper", "Slimer", "Beetlejuice", "Zero"], correct: 0 },
    { q: "Which Peanuts character waits for the Great Pumpkin?", a: ["Linus", "Charlie Brown", "Snoopy", "Schroeder"], correct: 0 },
    { q: "Which Disney villain can transform into a dragon in Sleeping Beauty?", a: ["Maleficent", "Ursula", "Cruella de Vil", "The Evil Queen"], correct: 0 },
    { q: "Which Disney villain is the sea witch in The Little Mermaid?", a: ["Ursula", "Maleficent", "Mother Gothel", "Madam Mim"], correct: 0 },
    { q: "What is the name of Jack Skellington's ghost dog?", a: ["Zero", "Bolt", "Pluto", "Max"], correct: 0 },
    { q: "Which movie features a ghost-hunting team with a famous crossed-out ghost logo?", a: ["Ghostbusters", "Hocus Pocus", "Casper", "Beetlejuice"], correct: 0 },
    { q: "Which Michael Jackson song is famous for its horror-themed music video?", a: ["Thriller", "Beat It", "Bad", "Black or White"], correct: 0 },
    { q: "Which novelty song begins with a scientist describing a dance craze among monsters?", a: ["Monster Mash", "Thriller", "Ghostbusters", "Time Warp"], correct: 0 },
    { q: "Which classic story features Ichabod Crane and the Headless Horseman?", a: ["The Legend of Sleepy Hollow", "Rip Van Winkle", "A Christmas Carol", "The Haunted Mansion"], correct: 0 },
    { q: "Which Disney attraction is known for 999 happy haunts?", a: ["The Haunted Mansion", "Pirates of the Caribbean", "Space Mountain", "Jungle Cruise"], correct: 0 },
    { q: "Which spooky family includes Wednesday and Morticia?", a: ["The Addams Family", "The Munsters", "The Sandersons", "The Spellmans"], correct: 0 },
    { q: "Which animated movie features Count Dracula running a hotel for monsters?", a: ["Hotel Transylvania", "Corpse Bride", "ParaNorman", "Monster House"], correct: 0 },
    { q: "Which Scooby-Doo character is the talking Great Dane?", a: ["Scooby-Doo", "Shaggy", "Fred", "Scrappy-Doo"], correct: 0 }
    ],
    medium: [
    { q: "From which platform does the Hogwarts Express depart at King's Cross?", a: ["7½", "8¾", "9¾", "10½"], correct: 2 },
    { q: "What kind of creature is Dobby?", a: ["Goblin", "House-elf", "Centaur", "Ghost"], correct: 1 },
    { q: "Which professor teaches Potions during Harry's early years at Hogwarts?", a: ["McGonagall", "Snape", "Flitwick", "Sprout"], correct: 1 },
    { q: "What form does Harry Potter's Patronus take?", a: ["Wolf", "Stag", "Otter", "Phoenix"], correct: 1 },
    { q: "What is the wizarding village near Hogwarts called?", a: ["Godric's Hollow", "Hogsmeade", "Little Whinging", "Ottery St Catchpole"], correct: 1 },
    { q: "What pigment disappears from many leaves as days shorten in fall?", a: ["Chlorophyll", "Melanin", "Keratin", "Hemoglobin"], correct: 0 },
    { q: "The autumnal equinox happens when day and night are approximately what?", a: ["Equal in length", "Six hours each", "All daylight", "All darkness"], correct: 0 },
    { q: "Which crop is most strongly associated with traditional fall corn mazes?", a: ["Corn", "Rice", "Cotton", "Soybeans only"], correct: 0 },
    { q: "What is another common name for the fall season?", a: ["Autumn", "Solstice", "Monsoon", "Thaw"], correct: 0 },
    { q: "Which spice is commonly paired with pumpkin flavor in fall drinks and desserts?", a: ["Cinnamon", "Dill", "Paprika", "Cumin"], correct: 0 },
    { q: "Which Hogwarts house has a lion as its symbol?", a: ["Gryffindor", "Ravenclaw", "Hufflepuff", "Slytherin"], correct: 0 },
    { q: "Who is the Hogwarts gamekeeper who becomes one of Harry's closest friends?", a: ["Hagrid", "Filch", "Lupin", "Moody"], correct: 0 },
    { q: "What magical object shows secret passages and people moving around Hogwarts?", a: ["Marauder's Map", "Pensieve", "Mirror of Erised", "Remembrall"], correct: 0 },
    { q: "Which fall weather change is caused mainly by Earth's tilt and orbit around the Sun?", a: ["Shorter daylight hours", "More ocean tides", "A stronger moon", "A faster rotation"], correct: 0 },
    { q: "Which warm fall drink is made from apples?", a: ["Apple cider", "Eggnog", "Lemon tea", "Root beer"], correct: 0 },
    { q: "What is the traditional purpose of a scarecrow?", a: ["Discourage birds from crops", "Measure rainfall", "Mark property lines", "Dry harvested corn"], correct: 0 },
    { q: "Which Hogwarts house has a badger as its symbol?", a: ["Hufflepuff", "Gryffindor", "Slytherin", "Ravenclaw"], correct: 0 },
    { q: "Which Hogwarts house has an eagle as its symbol?", a: ["Ravenclaw", "Hufflepuff", "Gryffindor", "Slytherin"], correct: 0 },
    { q: "Which Hogwarts house has a serpent as its symbol?", a: ["Slytherin", "Ravenclaw", "Gryffindor", "Hufflepuff"], correct: 0 },
    { q: "What is the name of the train that carries students to Hogwarts?", a: ["Hogwarts Express", "Knight Bus", "Durmstrang Flyer", "Wizard Rail"], correct: 0 },
    { q: "Which song do the Sanderson sisters perform at the Halloween party in Hocus Pocus?", a: ["I Put a Spell on You", "Monster Mash", "Thriller", "Season of the Witch"], correct: 0 },
    { q: "Who wrote and recorded the hit theme song for the 1984 movie Ghostbusters?", a: ["Ray Parker Jr.", "Bobby Pickett", "Warren Zevon", "Alice Cooper"], correct: 0 },
    { q: "Who recorded the Halloween favorite Monster Mash?", a: ["Bobby 'Boris' Pickett", "Elvis Presley", "Donovan", "Andrew Gold"], correct: 0 },
    { q: "Which artist recorded Werewolves of London?", a: ["Warren Zevon", "David Bowie", "Billy Joel", "Meat Loaf"], correct: 0 },
    { q: "Which song from The Nightmare Before Christmas introduces Halloween Town?", a: ["This Is Halloween", "What's This?", "Kidnap the Sandy Claws", "Oogie Boogie's Song"], correct: 0 },
    { q: "What is the name of the villain in The Nightmare Before Christmas who is made from a burlap sack?", a: ["Oogie Boogie", "Lock", "Shock", "Barrel"], correct: 0 },
    { q: "In Disney's The Adventures of Ichabod and Mr. Toad, which character is pursued by the Headless Horseman?", a: ["Ichabod Crane", "Brom Bones", "Mr. Toad", "Cyril Proudbottom"], correct: 0 },
    { q: "Which actor plays the title character in Beetlejuice?", a: ["Michael Keaton", "Bill Murray", "Jim Carrey", "Robin Williams"], correct: 0 },
    { q: "Which 1993 Disney Channel movie follows a girl who discovers her grandmother is a witch?", a: ["Halloweentown", "Twitches", "Under Wraps", "Don't Look Under the Bed"], correct: 0 },
    { q: "Which Disney villain wants a coat made from Dalmatian puppies?", a: ["Cruella de Vil", "Maleficent", "Ursula", "Lady Tremaine"], correct: 0 },
    { q: "Which song by Rockwell became a Halloween staple with the line about feeling watched?", a: ["Somebody's Watching Me", "Dead Man's Party", "Psycho Killer", "Bad Moon Rising"], correct: 0 },
    { q: "Which dance song is featured in The Rocky Horror Picture Show?", a: ["Time Warp", "Monster Mash", "Thriller", "Ghostbusters"], correct: 0 },
    { q: "Which spooky song was recorded by Andrew Gold and later became an internet Halloween favorite?", a: ["Spooky Scary Skeletons", "Monster Mash", "Season of the Witch", "Witchy Woman"], correct: 0 },
    { q: "Which Disney villain rules Halloween Town in the first Halloweentown movie?", a: ["Kalabar", "Oogie Boogie", "Jafar", "Dr. Facilier"], correct: 0 },
    { q: "Which animated Tim Burton film centers on Victor and a bride from the land of the dead?", a: ["Corpse Bride", "Frankenweenie", "ParaNorman", "Monster House"], correct: 0 }
    ],
    hard: [
    { q: "What are the nicknames of the four creators of the Marauder's Map?", a: ["Moony, Wormtail, Padfoot, Prongs", "Fang, Fluffy, Norbert, Buckbeak", "Fred, George, Lee, Percy", "Albus, Aberforth, Ariana, Elphias"], correct: 0 },
    { q: "Which core is inside Harry Potter's wand?", a: ["Dragon heartstring", "Unicorn hair", "Phoenix feather", "Thestral hair"], correct: 2 },
    { q: "What is the name of the spell used to summon an object?", a: ["Alohomora", "Accio", "Lumos", "Expelliarmus"], correct: 1 },
    { q: "Which two schools visit Hogwarts for the Triwizard Tournament?", a: ["Beauxbatons and Durmstrang", "Ilvermorny and Mahoutokoro", "Durmstrang and Ilvermorny", "Beauxbatons and Castelobruxo"], correct: 0 },
    { q: "What is Sirius Black's Animagus form?", a: ["Black dog", "Stag", "Rat", "Cat"], correct: 0 },
    { q: "Which pigments help produce yellow and orange colors in autumn leaves?", a: ["Carotenoids", "Hemoglobin", "Melanin", "Keratin"], correct: 0 },
    { q: "In the Northern Hemisphere, astronomical fall begins around which event?", a: ["Autumnal equinox", "Winter solstice", "Summer solstice", "Vernal equinox"], correct: 0 },
    { q: "What botanical type of fruit is a pumpkin?", a: ["Pepo", "Drupe", "Pome", "Legume"], correct: 0 },
    { q: "Halloween is immediately followed by which date?", a: ["November 1", "October 30", "November 2 only", "December 1"], correct: 0 },
    { q: "Which compound group contributes many red and purple colors to fall leaves?", a: ["Anthocyanins", "Proteins", "Starches", "Silicates"], correct: 0 },
    { q: "Which spell produces light at the tip of a wand?", a: ["Lumos", "Nox", "Accio", "Stupefy"], correct: 0 },
    { q: "What position does Harry Potter usually play on the Gryffindor Quidditch team?", a: ["Seeker", "Keeper", "Beater", "Chaser"], correct: 0 },
    { q: "What is the name of the prison guarded by Dementors?", a: ["Azkaban", "Nurmengard", "Gringotts", "Malfoy Manor"], correct: 0 },
    { q: "Which ghost is associated with Gryffindor House?", a: ["Nearly Headless Nick", "The Grey Lady", "The Fat Friar", "The Bloody Baron"], correct: 0 },
    { q: "Which atmospheric condition often helps produce crisp fall mornings?", a: ["Cooler overnight temperatures", "Stronger summer heat", "Longer daylight", "Warmer ocean currents only"], correct: 0 },
    { q: "Why do deciduous trees drop leaves in fall?", a: ["To conserve resources during colder, darker months", "To absorb more sunlight", "To increase flowering", "To grow taller faster"], correct: 0 },
    { q: "Which sugar-rich process contributes to red fall leaf coloration in some species?", a: ["Anthocyanin production", "Chlorophyll production", "Nitrogen fixation", "Photosynthesis increasing"], correct: 0 },
    { q: "What is the name of the magical bank in the Harry Potter series?", a: ["Gringotts", "Ollivanders", "Borgin and Burkes", "Flourish and Blotts"], correct: 0 },
    { q: "Which spell is commonly used to unlock doors in Harry Potter?", a: ["Alohomora", "Riddikulus", "Incendio", "Protego"], correct: 0 },
    { q: "Which creature pulls the Hogwarts carriages for people who can see them?", a: ["Thestrals", "Hippogriffs", "Centaurs", "Acromantulas"], correct: 0 },
    { q: "What is the name of the theme song heard in Disney's Haunted Mansion attraction?", a: ["Grim Grinning Ghosts", "This Is Halloween", "Poor Unfortunate Souls", "The Headless Horseman"], correct: 0 },
    { q: "Who sings The Headless Horseman in Disney's 1949 The Legend of Sleepy Hollow segment?", a: ["Bing Crosby", "Frank Sinatra", "Louis Armstrong", "Danny Kaye"], correct: 0 },
    { q: "Which 1929 Disney Silly Symphony features dancing skeletons in a graveyard?", a: ["The Skeleton Dance", "Trick or Treat", "The Old Mill", "Night on Bald Mountain"], correct: 0 },
    { q: "Which actor voices Jack Skellington's speaking voice in The Nightmare Before Christmas?", a: ["Chris Sarandon", "Danny Elfman", "Tim Burton", "Paul Reubens"], correct: 0 },
    { q: "Who provides Jack Skellington's singing voice in The Nightmare Before Christmas?", a: ["Danny Elfman", "Chris Sarandon", "Ken Page", "Patrick Stewart"], correct: 0 },
    { q: "Which 1988 comedy-horror film features the bio-exorcist Beetlejuice?", a: ["Beetlejuice", "Ghostbusters II", "The Lost Boys", "Little Shop of Horrors"], correct: 0 },
    { q: "Which song by Donovan is often included on Halloween playlists?", a: ["Season of the Witch", "Witchy Woman", "Black Magic Woman", "People Are Strange"], correct: 0 },
    { q: "Who recorded the 1958 novelty hit The Purple People Eater?", a: ["Sheb Wooley", "Bobby Pickett", "Screamin' Jay Hawkins", "Gene Vincent"], correct: 0 },
    { q: "Which composer wrote Night on Bald Mountain, used in Disney's Fantasia?", a: ["Modest Mussorgsky", "Pyotr Tchaikovsky", "Camille Saint-Saëns", "Igor Stravinsky"], correct: 0 },
    { q: "Which piece by Camille Saint-Saëns is frequently associated with skeletons and Halloween?", a: ["Danse macabre", "The Sorcerer's Apprentice", "In the Hall of the Mountain King", "Funeral March"], correct: 0 },
    { q: "Which actor played Winifred Sanderson in the original Hocus Pocus?", a: ["Bette Midler", "Sarah Jessica Parker", "Kathy Najimy", "Geena Davis"], correct: 0 },
    { q: "Which actress played Sarah Sanderson in the original Hocus Pocus?", a: ["Sarah Jessica Parker", "Bette Midler", "Kathy Najimy", "Christina Ricci"], correct: 0 },
    { q: "Which actress played Mary Sanderson in the original Hocus Pocus?", a: ["Kathy Najimy", "Bette Midler", "Sarah Jessica Parker", "Anjelica Huston"], correct: 0 },
    { q: "What is the name of the black cat in Hocus Pocus?", a: ["Thackery Binx", "Salem", "Church", "Lucifer"], correct: 0 },
    { q: "Which 1940 Disney film includes the Night on Bald Mountain sequence?", a: ["Fantasia", "Pinocchio", "Dumbo", "The Adventures of Ichabod and Mr. Toad"], correct: 0 }
    ]
  };

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
    {"word": "HOMERUN", "scramble": "RUNHOME", "hint": "Baseball hit around all the bases."},
    {"word":"MOONEYS","scramble":"NEYSMOO","hint":"Hollywood Corners live-music stop."},
    {"word":"BRICKHOUSE","scramble":"HOUSEBRICK","hint":"A Shawnee venue name."},
    {"word":"FIRELAKE","scramble":"LAKEFIRE","hint":"Shawnee-area entertainment name."},
    {"word":"GRANDCASINO","scramble":"CASINOGRAND","hint":"Large Shawnee-area casino destination."},
    {"word":"ROADHOUSE","scramble":"HOUSEROAD","hint":"A west-OKC venue name."},
    {"word":"RITZ","scramble":"TZRI","hint":"Classic venue name in Shawnee."},
    {"word":"CAMPUSCORNER","scramble":"CORNERCAMPUS","hint":"Norman nightlife area near OU."},
    {"word":"HOLLYWOOD","scramble":"YWOODHOLL","hint":"Part of Hollywood Corners."},
    {"word":"MIDTOWN","scramble":"TOWNMID","hint":"OKC district north of downtown."},
    {"word":"UPTOWN","scramble":"OWNUPT","hint":"OKC district around NW 23rd."},
    {"word":"PLAZA","scramble":"AZAPL","hint":"OKC arts and entertainment district."},
    {"word":"STOCKYARDS","scramble":"YARDSSTOCK","hint":"Historic western district in OKC."},
    {"word":"SCISSORTAIL","scramble":"ORTAILSCISS","hint":"Large downtown OKC park."},
    {"word":"PAYCOM","scramble":"COMPAY","hint":"Downtown arena name."},
    {"word":"FAIRGROUNDS","scramble":"ROUNDSFAIRG","hint":"Home of major fairs and events."},
    {"word":"WILLROGERS","scramble":"OGERSWILLR","hint":"Name tied to OKC's main airport."},
    {"word":"TINKER","scramble":"KERTIN","hint":"Air Force base in southeast OKC."},
    {"word":"MOORE","scramble":"OREMO","hint":"City south of Oklahoma City."},
    {"word":"EDMOND","scramble":"ONDEDM","hint":"City north of Oklahoma City."},
    {"word":"MUSTANG","scramble":"TANGMUS","hint":"City west of Oklahoma City."},
    {"word":"BLANCHARD","scramble":"CHARDBLAN","hint":"Community southwest of the metro."},
    {"word":"WEATHERFORD","scramble":"ERFORDWEATH","hint":"Western Oklahoma city."},
    {"word":"LEXINGTON","scramble":"NGTONLEXI","hint":"Oklahoma community south of Norman."},
    {"word":"KINGFISHER","scramble":"ISHERKINGF","hint":"City northwest of the metro."},
    {"word":"TURNPIKE","scramble":"PIKETURN","hint":"Toll highway."},
    {"word":"INTERSTATE","scramble":"STATEINTER","hint":"Major controlled-access highway."},
    {"word":"EXPRESSWAY","scramble":"SSWAYEXPRE","hint":"Fast multi-lane roadway."},
    {"word":"PICKUP","scramble":"KUPPIC","hint":"Where the rider gets in."},
    {"word":"DROPOFF","scramble":"POFFDRO","hint":"Where the rider gets out."},
    {"word":"PASSENGER","scramble":"ENGERPASS","hint":"Person riding in the vehicle."},
    {"word":"DRIVER","scramble":"VERDRI","hint":"Person behind the wheel."},
    {"word":"REQUEST","scramble":"UESTREQ","hint":"What a rider sends for a ride or song."},
    {"word":"CONFIRMED","scramble":"IRMEDCONF","hint":"A ride that has been accepted."},
    {"word":"TRACKING","scramble":"KINGTRAC","hint":"Following ride or location progress."},
    {"word":"RIDERHUB","scramble":"RHUBRIDE","hint":"Big Red rider information center."},
    {"word":"HOMESCREEN","scramble":"CREENHOMES","hint":"Where a rider can save the Rider Hub."},
    {"word":"NOTIFICATION","scramble":"CATIONNOTIFI","hint":"An alert sent to a device."},
    {"word":"SHORTCUT","scramble":"TCUTSHOR","hint":"Apple automation used for music playback."},
    {"word":"PLAYBACK","scramble":"BACKPLAY","hint":"Music being played."},
    {"word":"THROWBACKS","scramble":"BACKSTHROW","hint":"Older favorite songs."},
    {"word":"CHRISTIAN","scramble":"STIANCHRI","hint":"One approved music category."},
    {"word":"CAMPUS","scramble":"PUSCAM","hint":"College-area theme."},
    {"word":"CHILL","scramble":"ILLCH","hint":"Relaxed music vibe."},
    {"word":"PLAYLISTS","scramble":"LISTSPLAY","hint":"Collections of songs."},
    {"word":"REQUESTS","scramble":"ESTSREQU","hint":"Things riders ask for."},
    {"word":"VENUE","scramble":"NUEVE","hint":"Place where an event happens."},
    {"word":"NIGHTLIFE","scramble":"TLIFENIGH","hint":"Evening entertainment."},
    {"word":"CONNECTION","scramble":"CTIONCONNE","hint":"Link between people or systems."},
    {"word":"RELIABLE","scramble":"ABLERELI","hint":"Something you can count on."},
    {"word":"TRUSTED","scramble":"STEDTRU","hint":"Dependable and known."},
    {"word":"LOCAL","scramble":"CALLO","hint":"Close to home."},
    {"word":"VETERAN","scramble":"ERANVET","hint":"Someone who served in the military."},
    {"word":"AFFORDABLE","scramble":"DABLEAFFOR","hint":"Reasonably priced."},
    {"word":"FLATRATE","scramble":"RATEFLAT","hint":"One clear ride price."},
    {"word":"NOSURGE","scramble":"URGENOS","hint":"Big Red pricing idea: no surge pricing."},
    {"word":"TERMINAL","scramble":"INALTERM","hint":"Airport passenger building."},
    {"word":"DEPARTURE","scramble":"RTUREDEPA","hint":"Leaving for a destination."},
    {"word":"ARRIVAL","scramble":"IVALARR","hint":"Reaching a destination."},
    {"word":"SATURDAY","scramble":"RDAYSATU","hint":"Popular weekend night."},
    {"word":"SUNDAY","scramble":"DAYSUN","hint":"Day after Saturday."},
    {"word":"MIDNIGHT","scramble":"IGHTMIDN","hint":"12:00 at night."},
    {"word":"MORNING","scramble":"NINGMOR","hint":"Early part of the day."},
    {"word":"SUNSET","scramble":"SETSUN","hint":"When the sun goes down."},
    {"word":"SUNRISE","scramble":"RISESUN","hint":"When the sun comes up."},
    {"word":"FORECAST","scramble":"CASTFORE","hint":"Prediction of upcoming weather."},
    {"word":"HUMIDITY","scramble":"DITYHUMI","hint":"Amount of moisture in the air."},
    {"word":"PRECIPITATION","scramble":"ITATIONPRECIP","hint":"Rain, snow or other water falling."},
    {"word":"TEMPERATURE","scramble":"RATURETEMPE","hint":"Measure of how hot or cold it is."},
    {"word":"THUNDERSTORM","scramble":"RSTORMTHUNDE","hint":"Storm with thunder and lightning."},
    {"word":"LIGHTNING","scramble":"TNINGLIGH","hint":"Electrical flash in a storm."},
    {"word":"TAILGATE","scramble":"GATETAIL","hint":"Pre-game gathering."},
    {"word":"SOONERS","scramble":"NERSSOO","hint":"OU team nickname."},
    {"word":"COWBOYS","scramble":"BOYSCOW","hint":"OSU team nickname."},
    {"word":"BOOMER","scramble":"MERBOO","hint":"Part of a famous OU chant."},
    {"word":"BEDLAM","scramble":"LAMBED","hint":"Historic Oklahoma rivalry name."},
    {"word":"BOATHOUSE","scramble":"HOUSEBOAT","hint":"Part of OKC's river recreation district."},
    {"word":"PASEO","scramble":"SEOPA","hint":"OKC arts district."},
    {"word":"AUTOMOBILE","scramble":"OBILEAUTOM","hint":"Part of Automobile Alley."},
    {"word":"DEEPDEUCE","scramble":"DEUCEDEEP","hint":"Historic OKC district."},
    {"word":"ROUTE66","scramble":"TE66ROU","hint":"Historic highway through Oklahoma."},
    {"word":"OKLAHOMACITY","scramble":"MACITYOKLAHO","hint":"State capital."},
    {"word":"SOONERSTATE","scramble":"RSTATESOONE","hint":"Oklahoma's nickname."},
    {"word":"REDRIVER","scramble":"IVERREDR","hint":"River forming much of the Texas border."},
    {"word":"ARKANSAS","scramble":"NSASARKA","hint":"River flowing through Tulsa."},
    {"word":"CANADIAN","scramble":"DIANCANA","hint":"River name found in Oklahoma."},
    {"word":"REDBUD","scramble":"BUDRED","hint":"Oklahoma's state tree."},
    {"word":"TURNER","scramble":"NERTUR","hint":"Turnpike toward Tulsa."},
    {"word":"KILPATRICK","scramble":"TRICKKILPA","hint":"Turnpike around north/west OKC."},
    {"word":"ADVENTURE","scramble":"NTUREADVE","hint":"Part of OKC's Adventure District."},
    {"word":"DESIGNATED","scramble":"NATEDDESIG","hint":"As in designated driver."},
    {"word":"RESERVATION","scramble":"VATIONRESER","hint":"A ride or table arranged ahead."},
    {"word":"DESTINATION","scramble":"NATIONDESTI","hint":"Where the ride is going."},
    {"word":"DIRECTIONS","scramble":"TIONSDIREC","hint":"Instructions for getting somewhere."},
    {"word":"NAVIGATION","scramble":"ATIONNAVIG","hint":"Guidance along a route."},
    {"word":"MILEAGE","scramble":"EAGEMIL","hint":"Distance measured in miles."},
    {"word":"FAIRNESS","scramble":"NESSFAIR","hint":"Part of Big Red's remote-trip pricing logic."},
    {"word":"SCHEDULED","scramble":"DULEDSCHE","hint":"Planned for a specific time."},
    {"word":"WEEKLY","scramble":"KLYWEE","hint":"Happening each week."},
    {"word":"DISCOVER","scramble":"OVERDISC","hint":"Name of the rear-seat Big Red experience."},
    {"word":"BIGRED","scramble":"REDBIG","hint":"The ride you're in."},
    {"word":"OKC","scramble":"CKO","hint":"Common shorthand for Oklahoma City."},
    {"word":"RIDER","scramble":"DERRI","hint":"Person taking the ride."},
    {"word":"AIRPORT","scramble":"PORTAIR","hint":"A common Big Red trip destination."},
    {"word":"LUGGAGE","scramble":"GAGELUG","hint":"Bags taken on a trip."},
    {"word":"WEATHER","scramble":"THERWEA","hint":"Conditions outside."},
    {"word":"THUNDER","scramble":"NDERTHU","hint":"Sound that follows lightning."},
    {"word":"RAIN","scramble":"INRA","hint":"Water falling from clouds."},
    {"word":"WIND","scramble":"NDWI","hint":"Moving air."},
    {"word":"SUNSHINE","scramble":"HINESUNS","hint":"Bright daylight from the sun."},
    {"word":"TRIVIA","scramble":"VIATRI","hint":"Question-and-answer game."},
    {"word":"SCRAMBLE","scramble":"MBLESCRA","hint":"A mixed-up word game."},
    {"word":"MUSIC","scramble":"SICMU","hint":"Sound organized into songs."},
    {"word":"GENRE","scramble":"NREGE","hint":"A category of music."},
    {"word":"SONG","scramble":"NGSO","hint":"A single piece of music."},
    {"word":"ARTIST","scramble":"ISTART","hint":"Person or group performing music."},
    {"word":"ALBUM","scramble":"BUMAL","hint":"Collection of recorded songs."},
    {"word":"RIDERREQUESTS","scramble":"EQUESTSRIDERR","hint":"Playlist for rider-requested music."},
    {"word":"PLAY","scramble":"AYPL","hint":"Start media."},
    {"word":"PAUSE","scramble":"USEPA","hint":"Temporarily stop media."},
    {"word":"VOLUME","scramble":"UMEVOL","hint":"How loud the sound is."},
    {"word":"BLUETOOTH","scramble":"TOOTHBLUE","hint":"Wireless audio connection."},
    {"word":"CARPLAY","scramble":"PLAYCAR","hint":"Apple in-car phone interface."},
    {"word":"TABLET","scramble":"LETTAB","hint":"Portable touchscreen device."},
    {"word":"IPAD","scramble":"ADIP","hint":"Apple tablet."},
    {"word":"SHORTCUTS","scramble":"TCUTSSHOR","hint":"Apple automation app."},
    {"word":"CLOUDFLARE","scramble":"FLARECLOUD","hint":"Big Red edge and Worker platform."},
    {"word":"WORKER","scramble":"KERWOR","hint":"Cloudflare serverless code."},
    {"word":"GITHUB","scramble":"HUBGIT","hint":"Code repository service."},
    {"word":"DISPATCH","scramble":"ATCHDISP","hint":"Ride management function."},
    {"word":"ADMIN","scramble":"MINAD","hint":"Internal control role."},
    {"word":"STATUS","scramble":"TUSSTA","hint":"Current operating condition."},
    {"word":"ONLINE","scramble":"INEONL","hint":"Available or connected."},
    {"word":"OFFLINE","scramble":"LINEOFF","hint":"Not currently connected or available."},
    {"word":"TRACKER","scramble":"CKERTRA","hint":"Something that follows status or location."},
    {"word":"MAP","scramble":"PAM","hint":"Visual representation of places."},
    {"word":"DESTINATION","scramble":"NATIONDESTI","hint":"Where the ride is headed."},
    {"word":"ROUTE","scramble":"UTERO","hint":"Path between locations."},
    {"word":"MILES","scramble":"LESMI","hint":"Common U.S. road distance unit."},
    {"word":"FARE","scramble":"REFA","hint":"Price of a ride."},
    {"word":"ESTIMATE","scramble":"MATEESTI","hint":"Expected price or amount."},
    {"word":"WAITING","scramble":"TINGWAI","hint":"Time spent before departure."},
    {"word":"STOP","scramble":"OPST","hint":"A brief added location on a ride."},
    {"word":"BOOKING","scramble":"KINGBOO","hint":"A requested or reserved ride."},
    {"word":"CONFIRMATION","scramble":"MATIONCONFIR","hint":"Message showing a ride is accepted."},
    {"word":"PICKUPTIME","scramble":"PTIMEPICKU","hint":"Scheduled time to get the rider."},
    {"word":"RETURNRIDE","scramble":"NRIDERETUR","hint":"A ride back from a destination."},
    {"word":"PLANAHEAD","scramble":"AHEADPLAN","hint":"Big Red habit: arrange rides before the rush."},
    {"word":"RIDERNIGHT","scramble":"NIGHTRIDER","hint":"A night out from the rider's point of view."},
    {"word":"LOCALRIDE","scramble":"LRIDELOCA","hint":"A ride around the local area."},
    {"word":"NIGHTDRIVE","scramble":"DRIVENIGHT","hint":"A drive after dark."}
  );


// --------------------------------------------------
  // FALL MIX-IN — 2026
  // Seasonal content is mixed into the normal banks.
  // The core game logic, round counts, scoring, and UI
  // remain unchanged. A 100% seasonal takeover can be
  // done separately for the actual holiday week.
  // --------------------------------------------------

  triviaBank.easy.push(
    { q: "Which school does Harry Potter attend?", a: ["Beauxbatons", "Hogwarts", "Durmstrang", "Ilvermorny"], correct: 1 },
    { q: "What is the name of Harry Potter's owl?", a: ["Crookshanks", "Fawkes", "Hedwig", "Scabbers"], correct: 2 },
    { q: "Which sport is played on flying broomsticks in Harry Potter?", a: ["Quidditch", "Gobstones", "Wizard chess", "Dueling"], correct: 0 },
    { q: "How many Hogwarts houses are there?", a: ["3", "4", "5", "6"], correct: 1 },
    { q: "Which Hogwarts house is Harry Potter sorted into?", a: ["Hufflepuff", "Ravenclaw", "Slytherin", "Gryffindor"], correct: 3 },
    { q: "What month contains Halloween?", a: ["September", "October", "November", "December"], correct: 1 },
    { q: "What color do many tree leaves turn in fall?", a: ["Orange", "Blue", "Purple only", "Silver"], correct: 0 },
    { q: "Which fruit is commonly carved into a jack-o'-lantern?", a: ["Apple", "Pumpkin", "Pear", "Peach"], correct: 1 },
    { q: "Which season comes between summer and winter?", a: ["Spring", "Fall", "Monsoon", "Dry season"], correct: 1 },
    { q: "Which drink is often served warm during fall?", a: ["Apple cider", "Lemonade", "Iced tea only", "Sports drink"], correct: 0 }
  );

  triviaBank.medium.push(
    { q: "From which platform does the Hogwarts Express depart at King's Cross?", a: ["7½", "8¾", "9¾", "10½"], correct: 2 },
    { q: "What kind of creature is Dobby?", a: ["Goblin", "House-elf", "Centaur", "Ghost"], correct: 1 },
    { q: "Which professor teaches Potions during Harry's early years at Hogwarts?", a: ["McGonagall", "Snape", "Flitwick", "Sprout"], correct: 1 },
    { q: "What form does Harry Potter's Patronus take?", a: ["Wolf", "Stag", "Otter", "Phoenix"], correct: 1 },
    { q: "What is the wizarding village near Hogwarts called?", a: ["Godric's Hollow", "Hogsmeade", "Little Whinging", "Ottery St Catchpole"], correct: 1 },
    { q: "What pigment disappears from many leaves as days shorten in fall?", a: ["Chlorophyll", "Melanin", "Keratin", "Hemoglobin"], correct: 0 },
    { q: "The autumnal equinox happens when day and night are approximately what?", a: ["Equal in length", "Six hours each", "All daylight", "All darkness"], correct: 0 },
    { q: "Which crop is most strongly associated with traditional fall corn mazes?", a: ["Corn", "Rice", "Cotton", "Soybeans only"], correct: 0 },
    { q: "What is another common name for the fall season?", a: ["Autumn", "Solstice", "Monsoon", "Thaw"], correct: 0 },
    { q: "Which spice is commonly paired with pumpkin flavor in fall drinks and desserts?", a: ["Cinnamon", "Dill", "Paprika", "Cumin"], correct: 0 }
  );

  triviaBank.hard.push(
    { q: "What are the nicknames of the four creators of the Marauder's Map?", a: ["Moony, Wormtail, Padfoot, Prongs", "Fang, Fluffy, Norbert, Buckbeak", "Fred, George, Lee, Percy", "Albus, Aberforth, Ariana, Elphias"], correct: 0 },
    { q: "Which core is inside Harry Potter's wand?", a: ["Dragon heartstring", "Unicorn hair", "Phoenix feather", "Thestral hair"], correct: 2 },
    { q: "What is the name of the spell used to summon an object?", a: ["Alohomora", "Accio", "Lumos", "Expelliarmus"], correct: 1 },
    { q: "Which two schools visit Hogwarts for the Triwizard Tournament?", a: ["Beauxbatons and Durmstrang", "Ilvermorny and Mahoutokoro", "Durmstrang and Ilvermorny", "Beauxbatons and Castelobruxo"], correct: 0 },
    { q: "What is Sirius Black's Animagus form?", a: ["Black dog", "Stag", "Rat", "Cat"], correct: 0 },
    { q: "Which pigments help produce yellow and orange colors in autumn leaves?", a: ["Carotenoids", "Hemoglobin", "Melanin", "Keratin"], correct: 0 },
    { q: "In the Northern Hemisphere, astronomical fall begins around which event?", a: ["Autumnal equinox", "Winter solstice", "Summer solstice", "Vernal equinox"], correct: 0 },
    { q: "What botanical type of fruit is a pumpkin?", a: ["Pepo", "Drupe", "Pome", "Legume"], correct: 0 },
    { q: "Halloween is immediately followed by which date?", a: ["November 1", "October 30", "November 2 only", "December 1"], correct: 0 },
    { q: "Which compound group contributes many red and purple colors to fall leaves?", a: ["Anthocyanins", "Proteins", "Starches", "Silicates"], correct: 0 }
  );

  wouldYouRather.push(
    ["Spend an evening in Hogsmeade", "Spend an evening in Diagon Alley"],
    ["Take a Hogwarts class", "Play in a Quidditch match"],
    ["Have an invisibility cloak", "Have a flying broomstick"],
    ["Explore Hogwarts after dark", "Explore a giant enchanted library"],
    ["Be sorted into your favorite Hogwarts house", "Choose your house yourself"],
    ["Visit a pumpkin patch", "Visit a corn maze"],
    ["Take a fall hayride", "Sit around a bonfire"],
    ["Spend a cool fall night at a football game", "Spend it at an outdoor concert"],
    ["Drink hot apple cider", "Drink hot chocolate"],
    ["Carve a pumpkin", "Decorate fall cookies"],
    ["See brilliant fall leaves in the mountains", "Spend a crisp fall weekend in the city"],
    ["Watch a spooky movie", "Watch a Harry Potter marathon"],
    ["Go to a haunted house", "Go on a nighttime hayride"],
    ["Wear a hoodie all day", "Wear a flannel all day"],
    ["Have perfect sweater weather", "Have perfect patio weather"],
    ["Spend Halloween at a costume party", "Spend Halloween watching movies at home"],
    ["Have unlimited caramel apples", "Have unlimited pumpkin pie"],
    ["Go to a fall festival", "Go to a football tailgate"],
    ["Walk through crunchy leaves", "Sit beside a warm fireplace"],
    ["Have one magical fall weekend", "Have perfect fall weather for an entire month"]
  );

  scrambles.push(
    { word: "HOGWARTS", scramble: "WARTSHOG", hint: "Harry Potter's school." },
    { word: "QUIDDITCH", scramble: "DITCHQUID", hint: "Wizarding sport played on broomsticks." },
    { word: "HEDWIG", scramble: "WIGHED", hint: "Harry Potter's owl." },
    { word: "HAGRID", scramble: "GRIDHA", hint: "Hogwarts gamekeeper and Harry's friend." },
    { word: "PATRONUS", scramble: "NUSPATRO", hint: "Protective magical charm." },
    { word: "HOGSMEADE", scramble: "MEADEHOGS", hint: "Wizarding village near Hogwarts." },
    { word: "DIAGONALLEY", scramble: "ALLE YDIAGON".replace(" ", ""), hint: "Wizard shopping street in London." },
    { word: "GRYFFINDOR", scramble: "DORGRYFFIN", hint: "Harry Potter's Hogwarts house." },
    { word: "SLYTHERIN", scramble: "THERINSLY", hint: "One of the four Hogwarts houses." },
    { word: "BROOMSTICK", scramble: "STICKBROOM", hint: "Wizarding transportation." },
    { word: "PUMPKIN", scramble: "KINPUMP", hint: "Classic fall gourd." },
    { word: "AUTUMN", scramble: "TUMNAU", hint: "Another word for fall." },
    { word: "HARVEST", scramble: "VESTHAR", hint: "Gathering crops at the end of the growing season." },
    { word: "HAYRIDE", scramble: "RIDEHAY", hint: "Classic fall wagon ride." },
    { word: "CORNMAZE", scramble: "MAZECORN", hint: "Fall attraction with winding paths." },
    { word: "BONFIRE", scramble: "FIREBON", hint: "Large outdoor fire." },
    { word: "SWEATER", scramble: "TERSWEA", hint: "Cool-weather clothing." },
    { word: "CIDER", scramble: "DERCI", hint: "Popular fall apple drink." },
    { word: "ACORN", scramble: "ORNAC", hint: "Oak tree seed." },
    { word: "LEAVES", scramble: "VESLEA", hint: "They change color in fall." },
    { word: "HALLOWEEN", scramble: "WEENHALLO", hint: "October 31 holiday." },
    { word: "COSTUME", scramble: "TUMECOS", hint: "Something worn for Halloween." },
    { word: "HAUNTED", scramble: "TEDHAUN", hint: "A spooky description." },
    { word: "FOOTBALL", scramble: "BALLFOOT", hint: "A major fall sport." },
    { word: "TAILGATE", scramble: "GATETAIL", hint: "Pre-game fall gathering." },
    { word: "FLANNEL", scramble: "NELFLAN", hint: "Popular cool-weather fabric." },
    { word: "CINNAMON", scramble: "MONCINNA", hint: "Warm spice common in fall treats." },
    { word: "CARAMEL", scramble: "MELCARA", hint: "Sweet coating often paired with apples." },
    { word: "FIREPLACE", scramble: "PLACEFIRE", hint: "Warm indoor spot on a cool night." },
    { word: "OCTOBER", scramble: "BEROCTO", hint: "Peak fall month with Halloween." }
  );

  // Halloween banks are separate: all existing normal and early-season banks remain intact.
  const halloweenTrivia = {
  "easy": [
    {
      "q": "What date is Halloween?",
      "a": [
        "October 31",
        "November 1",
        "October 13",
        "October 30"
      ],
      "correct": 0,
      "fact": "october31"
    },
    {
      "q": "What do trick-or-treaters traditionally say at the door?",
      "a": [
        "Remus Lupin",
        "Seeds and pulp",
        "Trick or treat",
        "Thriller"
      ],
      "correct": 2,
      "fact": "trickortreat"
    },
    {
      "q": "What orange fruit is commonly carved for Halloween?",
      "a": [
        "Remus Lupin",
        "Corn maze",
        "Pumpkin",
        "Zombie"
      ],
      "correct": 2,
      "fact": "pumpkin"
    },
    {
      "q": "What is a carved, illuminated pumpkin called?",
      "a": [
        "Spider",
        "Jack-o'-lantern",
        "Group costume",
        "Monster House"
      ],
      "correct": 1,
      "fact": "jackolantern"
    },
    {
      "q": "What do people wear to dress as Halloween characters?",
      "a": [
        "Costumes",
        "Eyes and nose",
        "Witches",
        "Ghostbusters"
      ],
      "correct": 0,
      "fact": "costume"
    },
    {
      "q": "What sweet treats are often handed out on Halloween?",
      "a": [
        "Candy",
        "Paper bat",
        "October 31",
        "Frankenstein's monster"
      ],
      "correct": 0,
      "fact": "candy"
    },
    {
      "q": "Which monster traditionally drinks blood in stories?",
      "a": [
        "Vampire",
        "Witch",
        "Thestrals",
        "Mummy"
      ],
      "correct": 0,
      "fact": "vampire"
    },
    {
      "q": "Which monster turns from a person into a wolf?",
      "a": [
        "Zombie",
        "Werewolf",
        "Banshee",
        "Bat"
      ],
      "correct": 1,
      "fact": "werewolf"
    },
    {
      "q": "Which wrapped monster comes from an ancient tomb?",
      "a": [
        "House-elf",
        "Poltergeist",
        "Mummy",
        "Skeleton"
      ],
      "correct": 2,
      "fact": "mummy"
    },
    {
      "q": "Which spooky figure is made of bones?",
      "a": [
        "Zombie",
        "Skeleton",
        "Acromantula",
        "Centaur"
      ],
      "correct": 1,
      "fact": "skeleton"
    },
    {
      "q": "What is a traditional ghost costume made from?",
      "a": [
        "Ghostbusters",
        "Silver",
        "A white sheet",
        "Candy corn"
      ],
      "correct": 2,
      "fact": "awhitesheet"
    },
    {
      "q": "Which animal is often shown flying beside a haunted castle?",
      "a": [
        "Werewolf",
        "Troll",
        "Bat",
        "Acromantula"
      ],
      "correct": 2,
      "fact": "bat"
    },
    {
      "q": "Which eight-legged creature makes webs?",
      "a": [
        "Raven",
        "Owl",
        "Spider",
        "House-elf"
      ],
      "correct": 2,
      "fact": "spider"
    },
    {
      "q": "What do witches traditionally fly on in stories?",
      "a": [
        "Broomsticks",
        "Wednesday",
        "Fluffy",
        "Candy"
      ],
      "correct": 0,
      "fact": "broomstick"
    },
    {
      "q": "What bubbling pot appears in witch decorations?",
      "a": [
        "Costumes",
        "Wednesday",
        "Eyes and nose",
        "Cauldron"
      ],
      "correct": 3,
      "fact": "cauldron"
    },
    {
      "q": "Which animal is a witch's familiar in many Halloween pictures?",
      "a": [
        "Black cat",
        "Griffin",
        "Bat",
        "Boggart"
      ],
      "correct": 0,
      "fact": "blackcat"
    },
    {
      "q": "Which creature is often shown rising from a grave in scary stories?",
      "a": [
        "Witch",
        "Spider",
        "Zombie",
        "Basilisk"
      ],
      "correct": 2,
      "fact": "zombie"
    },
    {
      "q": "What sharp teeth are part of a vampire costume?",
      "a": [
        "Castle",
        "Skull",
        "Fangs",
        "Costume contest"
      ],
      "correct": 2,
      "fact": "fang"
    },
    {
      "q": "What pointed headwear is part of a classic witch costume?",
      "a": [
        "Paper bat",
        "Costumes",
        "Owl",
        "Witch hat"
      ],
      "correct": 3,
      "fact": "witchhat"
    },
    {
      "q": "What do you call a house said to have ghosts?",
      "a": [
        "Rocks",
        "Eyepatch",
        "Corn maze",
        "Haunted house"
      ],
      "correct": 3,
      "fact": "hauntedhouse"
    },
    {
      "q": "What does a ghost traditionally say to surprise someone?",
      "a": [
        "Candy apple",
        "Group costume",
        "A white sheet",
        "Boo"
      ],
      "correct": 3,
      "fact": "boo"
    },
    {
      "q": "Which Halloween treat has yellow, orange, and white layers?",
      "a": [
        "Hotel Transylvania",
        "Slimer",
        "Candy corn",
        "Flashlight"
      ],
      "correct": 2,
      "fact": "candycorn"
    },
    {
      "q": "What sweet coating commonly covers a Halloween apple?",
      "a": [
        "Monster Mash",
        "Paper bat",
        "Caramel",
        "The Mystery Machine"
      ],
      "correct": 2,
      "fact": "caramel"
    },
    {
      "q": "What harvest attraction has winding paths through tall crops?",
      "a": [
        "Corn maze",
        "Hotel Transylvania",
        "Snowy owl",
        "Bat"
      ],
      "correct": 0,
      "fact": "cornmaze"
    },
    {
      "q": "What stuffed figure stands in a field to frighten birds?",
      "a": [
        "The Munsters",
        "Rag doll",
        "Scarecrow",
        "Popcorn"
      ],
      "correct": 2,
      "fact": "scarecrow"
    },
    {
      "q": "What farm activity takes guests on a wagon ride over straw?",
      "a": [
        "Hayride",
        "A pumpkin face",
        "Scarecrow",
        "Linus"
      ],
      "correct": 0,
      "fact": "hayride"
    },
    {
      "q": "Where might you go to choose your own Halloween pumpkin?",
      "a": [
        "Cape",
        "Norman",
        "A spooky thrill",
        "Pumpkin patch"
      ],
      "correct": 3,
      "fact": "pumpkinpatch"
    },
    {
      "q": "What do you scoop out before carving a pumpkin?",
      "a": [
        "Costumes",
        "Seeds and pulp",
        "Corn maze",
        "Frankenstein's monster"
      ],
      "correct": 1,
      "fact": "seedsandpulp"
    },
    {
      "q": "Which small electric light safely lights a jack-o'-lantern?",
      "a": [
        "Skull",
        "LED candle",
        "Tombstone",
        "M&M's"
      ],
      "correct": 1,
      "fact": "ledcandle"
    },
    {
      "q": "What do trick-or-treaters carry to collect treats?",
      "a": [
        "Wednesday",
        "Treat bags",
        "Black cat",
        "Tombstone"
      ],
      "correct": 1,
      "fact": "treatbag"
    },
    {
      "q": "Which fruit is used in the party game of bobbing?",
      "a": [
        "Plastic skeleton",
        "Eight legs",
        "Apples",
        "The Legend of Sleepy Hollow"
      ],
      "correct": 2,
      "fact": "apple"
    },
    {
      "q": "What is the spooky name for a spider's old web?",
      "a": [
        "Castle",
        "Bat",
        "Remus Lupin",
        "Cobweb"
      ],
      "correct": 3,
      "fact": "cobweb"
    },
    {
      "q": "What decorative marker might say RIP in a Halloween yard?",
      "a": [
        "Spider",
        "Full moon",
        "Bunting",
        "Tombstone"
      ],
      "correct": 3,
      "fact": "tombstone"
    },
    {
      "q": "Which nighttime bird is often heard hooting in spooky stories?",
      "a": [
        "Owl",
        "Bat",
        "Spider",
        "Ghost"
      ],
      "correct": 0,
      "fact": "owl"
    },
    {
      "q": "What bright round shape is associated with werewolf stories?",
      "a": [
        "Eyes and nose",
        "Skeleton",
        "Monster Mash",
        "Full moon"
      ],
      "correct": 3,
      "fact": "fullmoon"
    },
    {
      "q": "What flowing garment is part of a classic Dracula costume?",
      "a": [
        "Ghostbusters",
        "Eight legs",
        "Wednesday",
        "Cape"
      ],
      "correct": 3,
      "fact": "cape"
    },
    {
      "q": "What face covering can complete a monster costume?",
      "a": [
        "Frankenstein's monster",
        "The Legend of Sleepy Hollow",
        "Lollipop",
        "Mask"
      ],
      "correct": 3,
      "fact": "mask"
    },
    {
      "q": "What do magicians and witches wave to cast spells in stories?",
      "a": [
        "A spooky thrill",
        "Wand",
        "Haunted attraction",
        "Mist"
      ],
      "correct": 1,
      "fact": "wand"
    },
    {
      "q": "Which creature often has bolts in its neck in Halloween decorations?",
      "a": [
        "Eyepatch",
        "Frankenstein's monster",
        "A pumpkin face",
        "Hotel Transylvania"
      ],
      "correct": 1,
      "fact": "frankensteinsmonster"
    },
    {
      "q": "Which friendly cartoon ghost wants to make friends?",
      "a": [
        "Casper",
        "The Mummy",
        "ParaNorman",
        "Hotel Transylvania"
      ],
      "correct": 0,
      "fact": "casper"
    },
    {
      "q": "Who is the Pumpkin King in The Nightmare Before Christmas?",
      "a": [
        "Sorting Hat",
        "Ghostbusters theme",
        "Jack Skellington",
        "Invisibility Cloak"
      ],
      "correct": 2,
      "fact": "jackskellington"
    },
    {
      "q": "What is the name of Jack Skellington's ghost dog?",
      "a": [
        "Zero",
        "Maleficent",
        "Fangs",
        "The Munsters"
      ],
      "correct": 0,
      "fact": "zero"
    },
    {
      "q": "What holiday town is Jack Skellington from?",
      "a": [
        "Halloween Town",
        "Scarecrow",
        "Fluffy",
        "Shaggy"
      ],
      "correct": 0,
      "fact": "halloweentown"
    },
    {
      "q": "What type of doll is Sally in The Nightmare Before Christmas?",
      "a": [
        "Bunting",
        "Costume contest",
        "Fangs",
        "Rag doll"
      ],
      "correct": 3,
      "fact": "ragdoll"
    },
    {
      "q": "Which movie features the Sanderson sisters?",
      "a": [
        "Halloween",
        "Frankenweenie",
        "Coraline",
        "Hocus Pocus"
      ],
      "correct": 3,
      "fact": "hocuspocu"
    },
    {
      "q": "What is the Sanderson sisters' shared profession?",
      "a": [
        "Seeds and pulp",
        "Witches",
        "Lollipop",
        "Skull"
      ],
      "correct": 1,
      "fact": "witche"
    },
    {
      "q": "Which spooky family includes Morticia and Gomez?",
      "a": [
        "The Addams Family",
        "ParaNorman",
        "Coraline",
        "Scream"
      ],
      "correct": 0,
      "fact": "theaddamsfamily"
    },
    {
      "q": "Which Addams child is famous for her braids and dark clothes?",
      "a": [
        "Jack-o'-lantern",
        "Hotel Transylvania",
        "M&M's",
        "Wednesday"
      ],
      "correct": 3,
      "fact": "wednesday"
    },
    {
      "q": "Which Addams character is a disembodied hand?",
      "a": [
        "Thing",
        "Cobweb",
        "Tombstone",
        "Broomsticks"
      ],
      "correct": 0,
      "fact": "thing"
    },
    {
      "q": "Which Addams character serves as the family butler?",
      "a": [
        "Lurch",
        "Boggart",
        "Wednesday",
        "Plastic skeleton"
      ],
      "correct": 0,
      "fact": "lurch"
    },
    {
      "q": "Which cartoon dog investigates supposedly haunted places?",
      "a": [
        "Scooby-Doo",
        "Fangs",
        "Candy corn",
        "Mist"
      ],
      "correct": 0,
      "fact": "scoobydoo"
    },
    {
      "q": "Who is Scooby-Doo's best human friend?",
      "a": [
        "Silver",
        "Caramel",
        "Headless Horseman",
        "Shaggy"
      ],
      "correct": 3,
      "fact": "shaggy"
    },
    {
      "q": "What is the name of the Mystery Inc. van?",
      "a": [
        "Cape",
        "Eyepatch",
        "The Mystery Machine",
        "Thing"
      ],
      "correct": 2,
      "fact": "themysterymachine"
    },
    {
      "q": "Which team uses proton packs to catch ghosts?",
      "a": [
        "Ghostbusters",
        "The Mummy",
        "Halloween",
        "Frankenstein"
      ],
      "correct": 0,
      "fact": "ghostbuster"
    },
    {
      "q": "Which green ghost is famous for leaving slime?",
      "a": [
        "Wednesday",
        "Slimer",
        "Headless Horseman",
        "Reflective tape"
      ],
      "correct": 1,
      "fact": "slimer"
    },
    {
      "q": "Which movie features a hotel run by Dracula for monsters?",
      "a": [
        "The Nightmare Before Christmas",
        "The Shining",
        "Hotel Transylvania",
        "Friday the 13th"
      ],
      "correct": 2,
      "fact": "hoteltransylvania"
    },
    {
      "q": "Which Peanuts child waits for the Great Pumpkin?",
      "a": [
        "Candy",
        "Haunted house",
        "Linus",
        "Jack-o'-lantern"
      ],
      "correct": 2,
      "fact": "linu"
    },
    {
      "q": "What does Charlie Brown keep receiving while trick-or-treating?",
      "a": [
        "Rocks",
        "Apples",
        "Popcorn",
        "Skull"
      ],
      "correct": 0,
      "fact": "rock"
    },
    {
      "q": "Which Disney villain turns into a dragon in Sleeping Beauty?",
      "a": [
        "Maleficent",
        "Bunting",
        "Cauldron",
        "Wand"
      ],
      "correct": 0,
      "fact": "maleficent"
    },
    {
      "q": "Which Disney villain is a sea witch?",
      "a": [
        "Ursula",
        "Corn maze",
        "Monster Mash",
        "Skeleton"
      ],
      "correct": 0,
      "fact": "ursula"
    },
    {
      "q": "Which Harry Potter school has moving staircases and ghosts?",
      "a": [
        "Broomstick",
        "The Munsters",
        "Candy corn",
        "Hogwarts"
      ],
      "correct": 3,
      "fact": "hogwart"
    },
    {
      "q": "Which magical object assigns new Hogwarts students to houses?",
      "a": [
        "Black cat",
        "Remus Lupin",
        "Dementors",
        "Sorting Hat"
      ],
      "correct": 3,
      "fact": "sortinghat"
    },
    {
      "q": "What type of creature is Dobby?",
      "a": [
        "Banshee",
        "Mummy",
        "Skeleton",
        "House-elf"
      ],
      "correct": 3,
      "fact": "houseelf"
    },
    {
      "q": "What animal is Harry Potter's pet Hedwig?",
      "a": [
        "Cobweb",
        "Snowy owl",
        "Norman",
        "Thing"
      ],
      "correct": 1,
      "fact": "snowyowl"
    },
    {
      "q": "What flying object carries witches and Quidditch players?",
      "a": [
        "Caramel",
        "Casper",
        "Broomstick",
        "Owl"
      ],
      "correct": 2,
      "fact": "broomstick"
    },
    {
      "q": "What magical garment helps Harry hide from view?",
      "a": [
        "Skittles",
        "Scarecrow",
        "Mist",
        "Invisibility Cloak"
      ],
      "correct": 3,
      "fact": "invisibilitycloak"
    },
    {
      "q": "Which three-headed dog guards a trapdoor at Hogwarts?",
      "a": [
        "Vampire",
        "Fluffy",
        "Cauldron",
        "Cobweb"
      ],
      "correct": 1,
      "fact": "fluffy"
    },
    {
      "q": "What magical creature can turn into a person's worst fear?",
      "a": [
        "Skeleton",
        "Bat",
        "Zombie",
        "Boggart"
      ],
      "correct": 3,
      "fact": "boggart"
    },
    {
      "q": "Which Hogwarts teacher is secretly a werewolf?",
      "a": [
        "Remus Lupin",
        "Costumes",
        "Halloween Town",
        "Eyes and nose"
      ],
      "correct": 0,
      "fact": "remuslupin"
    },
    {
      "q": "Which magical creatures drain happiness in Harry Potter?",
      "a": [
        "Werewolf",
        "Acromantula",
        "Basilisk",
        "Dementors"
      ],
      "correct": 3,
      "fact": "dementor"
    },
    {
      "q": "Which story features a rider with no head?",
      "a": [
        "Haunted attraction",
        "Trick or treat",
        "The Legend of Sleepy Hollow",
        "Bunting"
      ],
      "correct": 2,
      "fact": "thelegendofsleepyhollow"
    },
    {
      "q": "What is the headless rider in Sleepy Hollow called?",
      "a": [
        "Caramel",
        "Headless Horseman",
        "Zero",
        "Boggart"
      ],
      "correct": 1,
      "fact": "headlesshorseman"
    },
    {
      "q": "Which Michael Jackson song has a famous monster dance video?",
      "a": [
        "Seeds and pulp",
        "Black cat",
        "Thriller",
        "Slimer"
      ],
      "correct": 2,
      "fact": "thriller"
    },
    {
      "q": "Which Halloween song describes a monster dance craze?",
      "a": [
        "Haunted attraction",
        "Haunted house",
        "Monster Mash",
        "Dementors"
      ],
      "correct": 2,
      "fact": "monstermash"
    },
    {
      "q": "Which holiday song asks who you are going to call?",
      "a": [
        "Popcorn",
        "Ghostbusters theme",
        "A pumpkin face",
        "Witch hat"
      ],
      "correct": 1,
      "fact": "ghostbusterstheme"
    },
    {
      "q": "What sort of building is often pictured with vampires?",
      "a": [
        "Mummy",
        "Halloween Town",
        "Garlic",
        "Castle"
      ],
      "correct": 3,
      "fact": "castle"
    },
    {
      "q": "What coffin-shaped object is traditionally a vampire's bed?",
      "a": [
        "Thriller",
        "Pumpkin patch",
        "Coffin",
        "Halloween Town"
      ],
      "correct": 2,
      "fact": "coffin"
    },
    {
      "q": "Which strong-smelling bulb repels vampires in many stories?",
      "a": [
        "Garlic",
        "Jack Skellington",
        "Wand",
        "Cotton candy"
      ],
      "correct": 0,
      "fact": "garlic"
    },
    {
      "q": "What metal is traditionally used against werewolves in folklore?",
      "a": [
        "Silver",
        "Dementors",
        "Owl",
        "Pumpkin patch"
      ],
      "correct": 0,
      "fact": "silver"
    },
    {
      "q": "What would a pirate Halloween costume often cover one eye with?",
      "a": [
        "Group costume",
        "Eyepatch",
        "Tombstone",
        "Frankenstein's monster"
      ],
      "correct": 1,
      "fact": "eyepatch"
    },
    {
      "q": "Which bone structure protects the brain in a skeleton decoration?",
      "a": [
        "Zombie",
        "Spider",
        "Dementors",
        "Skull"
      ],
      "correct": 3,
      "fact": "skull"
    },
    {
      "q": "What do you call a Halloween group dressed around one idea?",
      "a": [
        "Mist",
        "Group costume",
        "Rag doll",
        "Shaggy"
      ],
      "correct": 1,
      "fact": "groupcostume"
    },
    {
      "q": "What party contest judges people's Halloween outfits?",
      "a": [
        "Costume contest",
        "A white sheet",
        "Casper",
        "Reflective tape"
      ],
      "correct": 0,
      "fact": "costumecontest"
    },
    {
      "q": "What decoration hangs as a string of small Halloween flags?",
      "a": [
        "LED candle",
        "House-elf",
        "Mask",
        "Bunting"
      ],
      "correct": 3,
      "fact": "bunting"
    },
    {
      "q": "What sticky sweet treat is spun into fluffy strands at a fall fair?",
      "a": [
        "Paper bat",
        "Norman",
        "Silver",
        "Cotton candy"
      ],
      "correct": 3,
      "fact": "cottoncandy"
    },
    {
      "q": "Which snack pops into white puffs at Halloween movie night?",
      "a": [
        "Cotton candy",
        "Popcorn",
        "Frankenstein's monster",
        "Pumpkin"
      ],
      "correct": 1,
      "fact": "popcorn"
    },
    {
      "q": "What red fruit can have a hard candy shell at Halloween?",
      "a": [
        "Boggart",
        "Slimer",
        "Wednesday",
        "Candy apple"
      ],
      "correct": 3,
      "fact": "candyapple"
    },
    {
      "q": "What candy often comes wrapped on a stick?",
      "a": [
        "Zero",
        "Cobweb",
        "Lollipop",
        "Tombstone"
      ],
      "correct": 2,
      "fact": "lollipop"
    },
    {
      "q": "What is a Halloween story meant to give you?",
      "a": [
        "Flashlight",
        "Zero",
        "Fangs",
        "A spooky thrill"
      ],
      "correct": 3,
      "fact": "aspookythrill"
    },
    {
      "q": "What do you call a guided walk telling local ghost stories?",
      "a": [
        "Flashlight",
        "Skull",
        "Ghost tour",
        "Reese's"
      ],
      "correct": 2,
      "fact": "ghosttour"
    },
    {
      "q": "Which attraction uses actors to give guests safe Halloween scares?",
      "a": [
        "Haunted attraction",
        "Skull",
        "Ghostbusters theme",
        "Eight legs"
      ],
      "correct": 0,
      "fact": "hauntedattraction"
    },
    {
      "q": "What is a simple Halloween craft cut from black paper with wings?",
      "a": [
        "Invisibility Cloak",
        "Vampire",
        "Paper bat",
        "The Munsters"
      ],
      "correct": 2,
      "fact": "paperbat"
    },
    {
      "q": "What can reflect light on a trick-or-treat costume for visibility?",
      "a": [
        "House-elf",
        "Reflective tape",
        "Fangs",
        "Skittles"
      ],
      "correct": 1,
      "fact": "reflectivetape"
    },
    {
      "q": "What handheld light helps trick-or-treaters see a dark path?",
      "a": [
        "Flashlight",
        "Lurch",
        "Lollipop",
        "Coffin"
      ],
      "correct": 0,
      "fact": "flashlight"
    },
    {
      "q": "Which part of a pumpkin is attached to its vine?",
      "a": [
        "Halloween Town",
        "Thriller",
        "Stem",
        "Treat bags"
      ],
      "correct": 2,
      "fact": "stem"
    },
    {
      "q": "What do carved triangle shapes often form on a jack-o'-lantern?",
      "a": [
        "House-elf",
        "Zombie",
        "Eyes and nose",
        "Eight legs"
      ],
      "correct": 2,
      "fact": "eyesandnose"
    },
    {
      "q": "What can you paint instead of carving for a Halloween decoration?",
      "a": [
        "Thriller",
        "A pumpkin face",
        "Edward Scissorhands",
        "Eight legs"
      ],
      "correct": 1,
      "fact": "apumpkinface"
    },
    {
      "q": "What does an artificial fog machine add to a Halloween display?",
      "a": [
        "Mist",
        "Popcorn",
        "The Addams Family",
        "Edward Scissorhands"
      ],
      "correct": 0,
      "fact": "mist"
    },
    {
      "q": "Which Halloween decoration resembles a human framework?",
      "a": [
        "Remus Lupin",
        "Hayride",
        "Plastic skeleton",
        "Thing"
      ],
      "correct": 2,
      "fact": "plasticskeleton"
    },
    {
      "q": "What big insect-like legs are used on a giant spider decoration?",
      "a": [
        "Jack Skellington",
        "Witches",
        "Eight legs",
        "Cotton candy"
      ],
      "correct": 2,
      "fact": "eightleg"
    },
    {
      "q": "Which movie character has scissors instead of ordinary hands?",
      "a": [
        "Wednesday",
        "Haunted house",
        "Edward Scissorhands",
        "Werewolf"
      ],
      "correct": 2,
      "fact": "edwardscissorhand"
    },
    {
      "q": "Which ghostly bride is the title character of Corpse Bride?",
      "a": [
        "Costume contest",
        "Emily",
        "Monster House",
        "House-elf"
      ],
      "correct": 1,
      "fact": "emily"
    },
    {
      "q": "Which animated boy can speak with ghosts in ParaNorman?",
      "a": [
        "Scarecrow",
        "Rocks",
        "Norman",
        "Edward Scissorhands"
      ],
      "correct": 2,
      "fact": "norman"
    },
    {
      "q": "Which animated movie features a living, frightening house?",
      "a": [
        "Monster House",
        "The Addams Family",
        "Corpse Bride",
        "The Munsters"
      ],
      "correct": 0,
      "fact": "monsterhouse"
    },
    {
      "q": "Which Tim Burton film features a revived dog named Sparky?",
      "a": [
        "The Mummy",
        "Halloween",
        "Frankenweenie",
        "Coraline"
      ],
      "correct": 2,
      "fact": "frankenweenie"
    },
    {
      "q": "Which movie features an Other Mother with button eyes?",
      "a": [
        "The Invisible Man",
        "Coraline",
        "The Addams Family",
        "ParaNorman"
      ],
      "correct": 1,
      "fact": "coraline"
    },
    {
      "q": "Which spooky television family lives at 1313 Mockingbird Lane?",
      "a": [
        "The Munsters",
        "The Addams Family",
        "The Invisible Man",
        "Ghostbusters"
      ],
      "correct": 0,
      "fact": "themunster"
    },
    {
      "q": "Which candy brand is famous for peanut butter cups?",
      "a": [
        "Reese's",
        "Ghostbusters",
        "M&M's",
        "Candy"
      ],
      "correct": 0,
      "fact": "reese"
    },
    {
      "q": "Which candy brand says Taste the Rainbow?",
      "a": [
        "Coffin",
        "Skittles",
        "Frankenstein's monster",
        "Apples"
      ],
      "correct": 1,
      "fact": "skittle"
    },
    {
      "q": "Which candy is famous for chocolate that melts in your mouth, not your hand?",
      "a": [
        "Wednesday",
        "M&M's",
        "Hayride",
        "Vampire"
      ],
      "correct": 1,
      "fact": "mm"
    }
  ],
  "medium": [
    {
      "q": "Which ancient Celtic festival is linked with Halloween's roots?",
      "a": [
        "Samhain",
        "Mavis",
        "Banshee",
        "All Saints' Day"
      ],
      "correct": 0,
      "fact": "samhain"
    },
    {
      "q": "Halloween is a shortened form of which phrase?",
      "a": [
        "All Hallows' Eve",
        "Basilisk",
        "Larry Talbot",
        "Ecto-1"
      ],
      "correct": 0,
      "fact": "allhallowseve"
    },
    {
      "q": "What Christian observance falls on November 1?",
      "a": [
        "Henry Selick",
        "Mary Shelley",
        "All Saints' Day",
        "Black Flame Candle"
      ],
      "correct": 2,
      "fact": "allsaintsday"
    },
    {
      "q": "Which root vegetable was traditionally carved into lanterns in Ireland?",
      "a": [
        "Turnip",
        "Oogie Boogie",
        "Overlook Hotel",
        "Raul Julia"
      ],
      "correct": 0,
      "fact": "turnip"
    },
    {
      "q": "What is the Irish fruit bread associated with Halloween called?",
      "a": [
        "Barmbrack",
        "Woodsboro",
        "Fred",
        "Ray Parker Jr."
      ],
      "correct": 0,
      "fact": "barmbrack"
    },
    {
      "q": "What small object traditionally hidden in barmbrack suggests marriage?",
      "a": [
        "Tootsie Pop",
        "Ring",
        "What's This?",
        "Teal"
      ],
      "correct": 1,
      "fact": "ring"
    },
    {
      "q": "What is dressing in disguise and visiting homes for treats traditionally called in Scotland?",
      "a": [
        "Winston Zeddemore",
        "Friday the 13th",
        "Guising",
        "Salem"
      ],
      "correct": 2,
      "fact": "guising"
    },
    {
      "q": "What was visiting homes for small cakes in exchange for prayers called?",
      "a": [
        "Souling",
        "Fred",
        "It has two faces",
        "Poltergeist"
      ],
      "correct": 0,
      "fact": "souling"
    },
    {
      "q": "Which country is strongly associated with the Day of the Dead celebration?",
      "a": [
        "Familiar",
        "Sour Patch Kids",
        "Mexico",
        "Debbie Reynolds"
      ],
      "correct": 2,
      "fact": "mexico"
    },
    {
      "q": "Which orange flower is commonly used for Day of the Dead altars?",
      "a": [
        "Marigold",
        "Lock, Shock, and Barrel",
        "Basilisk",
        "Almond Joy"
      ],
      "correct": 0,
      "fact": "marigold"
    },
    {
      "q": "What is a Day of the Dead altar called?",
      "a": [
        "Mothman",
        "Ofrenda",
        "Christina Ricci",
        "Thestrals"
      ],
      "correct": 1,
      "fact": "ofrenda"
    },
    {
      "q": "What traditional sweet represents a skull for Day of the Dead?",
      "a": [
        "A person in disguise",
        "All Hallows' Eve",
        "Sugar skull",
        "Barmbrack"
      ],
      "correct": 2,
      "fact": "sugarskull"
    },
    {
      "q": "What trick-or-treat pumpkin color signals non-food treats for food allergies?",
      "a": [
        "Sandy Claws",
        "Teal",
        "Danny Elfman",
        "Mary Shelley"
      ],
      "correct": 1,
      "fact": "teal"
    },
    {
      "q": "Which charity is known for orange trick-or-treat collection boxes?",
      "a": [
        "Great Sphinx",
        "Poltergeist",
        "Starburst",
        "UNICEF"
      ],
      "correct": 3,
      "fact": "unicef"
    },
    {
      "q": "What was candy corn once marketed as because of its farm connection?",
      "a": [
        "Nearly Headless Nick",
        "Uncle Fester",
        "Henry Selick",
        "Chicken Feed"
      ],
      "correct": 3,
      "fact": "chickenfeed"
    },
    {
      "q": "What is a pumpkin botanically classified as?",
      "a": [
        "Daphne",
        "Romania",
        "Fruit",
        "Proton pack"
      ],
      "correct": 2,
      "fact": "fruit"
    },
    {
      "q": "What plant family includes pumpkins and cucumbers?",
      "a": [
        "Cucurbit family",
        "Samhain",
        "Freddy Krueger",
        "Griffin"
      ],
      "correct": 0,
      "fact": "cucurbitfamily"
    },
    {
      "q": "Which Halloween candy combines peanuts, caramel, nougat, and chocolate?",
      "a": [
        "A living eye",
        "Starburst",
        "Danny Elfman",
        "Snickers"
      ],
      "correct": 3,
      "fact": "snicker"
    },
    {
      "q": "Which candy bar is known for wafer layers and chocolate?",
      "a": [
        "Sandy Claws",
        "Kit Kat",
        "Teal",
        "Larry Talbot"
      ],
      "correct": 1,
      "fact": "kitkat"
    },
    {
      "q": "Which candy bar combines coconut and almonds?",
      "a": [
        "Almond Joy",
        "Snickers",
        "Larry Talbot",
        "Firehouse"
      ],
      "correct": 0,
      "fact": "almondjoy"
    },
    {
      "q": "Which candy bar has coconut but no almonds?",
      "a": [
        "Almond Joy",
        "Boris Karloff",
        "Mounds",
        "Max"
      ],
      "correct": 2,
      "fact": "mound"
    },
    {
      "q": "Which chewy candy has flavors including strawberry and lemon in small squares?",
      "a": [
        "Starburst",
        "Chicken Feed",
        "Friday the 13th",
        "Kit Kat"
      ],
      "correct": 0,
      "fact": "starburst"
    },
    {
      "q": "Which round candy has a chocolate center beneath hard candy?",
      "a": [
        "Tootsie Pop",
        "Larry Talbot",
        "Woodsboro",
        "Thackery Binx"
      ],
      "correct": 0,
      "fact": "tootsiepop"
    },
    {
      "q": "Which sour-then-sweet candies are shaped like little people?",
      "a": [
        "Fruit",
        "Kalabar",
        "Freddy Krueger",
        "Sour Patch Kids"
      ],
      "correct": 3,
      "fact": "sourpatchkid"
    },
    {
      "q": "Which British author wrote Dracula?",
      "a": [
        "Mary Shelley",
        "Ray Bradbury",
        "Bram Stoker",
        "Bobby 'Boris' Pickett"
      ],
      "correct": 2,
      "fact": "bramstoker"
    },
    {
      "q": "Who wrote the novel Frankenstein?",
      "a": [
        "Bill Murray",
        "Shirley Jackson",
        "Neil Gaiman",
        "Mary Shelley"
      ],
      "correct": 3,
      "fact": "maryshelley"
    },
    {
      "q": "What is the scientist's first name in the Frankenstein novel?",
      "a": [
        "Samhain",
        "Victor",
        "Starburst",
        "This Is Halloween"
      ],
      "correct": 1,
      "fact": "victor"
    },
    {
      "q": "Who wrote The Legend of Sleepy Hollow?",
      "a": [
        "Washington Irving",
        "Warren Zevon",
        "Bram Stoker",
        "Andrew Gold"
      ],
      "correct": 0,
      "fact": "washingtonirving"
    },
    {
      "q": "What is Ichabod Crane's job in the original Sleepy Hollow story?",
      "a": [
        "Barmbrack",
        "Schoolteacher",
        "Stay Puft Marshmallow Man",
        "Chicken Feed"
      ],
      "correct": 1,
      "fact": "schoolteacher"
    },
    {
      "q": "What region is Dracula traditionally associated with?",
      "a": [
        "Riddikulus",
        "Sandy Claws",
        "Thestrals",
        "Transylvania"
      ],
      "correct": 3,
      "fact": "transylvania"
    },
    {
      "q": "Which country contains Transylvania?",
      "a": [
        "Sarah Jessica Parker",
        "Sandy Claws",
        "Zoinks",
        "Romania"
      ],
      "correct": 3,
      "fact": "romania"
    },
    {
      "q": "What is a noisy spirit that moves objects called?",
      "a": [
        "Poltergeist",
        "Frankenweenie",
        "Hocus Pocus",
        "The Nightmare Before Christmas"
      ],
      "correct": 0,
      "fact": "poltergeist"
    },
    {
      "q": "Which Irish spirit's cry is traditionally an omen of death?",
      "a": [
        "Owl",
        "Basilisk",
        "Banshee",
        "Poltergeist"
      ],
      "correct": 2,
      "fact": "banshee"
    },
    {
      "q": "What is a witch's animal companion often called?",
      "a": [
        "Bette Midler",
        "Familiar",
        "Lon Chaney Jr.",
        "Kathy Najimy"
      ],
      "correct": 1,
      "fact": "familiar"
    },
    {
      "q": "Which cryptid is associated with Point Pleasant, West Virginia?",
      "a": [
        "Peter Venkman",
        "Firehouse",
        "Mothman",
        "It has two faces"
      ],
      "correct": 2,
      "fact": "mothman"
    },
    {
      "q": "Which mythical creature is part human and part horse?",
      "a": [
        "House-elf",
        "Ghost",
        "Black cat",
        "Centaur"
      ],
      "correct": 3,
      "fact": "centaur"
    },
    {
      "q": "What mythical creature has a lion body and an eagle head?",
      "a": [
        "Griffin",
        "Black cat",
        "Owl",
        "Boggart"
      ],
      "correct": 0,
      "fact": "griffin"
    },
    {
      "q": "Which mythical creature has snakes instead of hair?",
      "a": [
        "Velma",
        "Medusa",
        "UNICEF",
        "All Saints' Day"
      ],
      "correct": 1,
      "fact": "medusa"
    },
    {
      "q": "Which Egyptian monument has a lion body and a human head?",
      "a": [
        "Centaur",
        "Great Sphinx",
        "Thestrals",
        "Kalabar"
      ],
      "correct": 1,
      "fact": "greatsphinx"
    },
    {
      "q": "Which monster is the title character of The Wolf Man?",
      "a": [
        "Larry Talbot",
        "Mexico",
        "Johnny",
        "All Hallows' Eve"
      ],
      "correct": 0,
      "fact": "larrytalbot"
    },
    {
      "q": "Which actor starred as Dracula in the 1931 Universal film?",
      "a": [
        "Vincent Price",
        "Shirley Jackson",
        "John Carpenter",
        "Bela Lugosi"
      ],
      "correct": 3,
      "fact": "belalugosi"
    },
    {
      "q": "Which actor played Frankenstein's monster in Universal's 1931 film?",
      "a": [
        "Shirley Jackson",
        "Christopher Lee",
        "Neil Gaiman",
        "Boris Karloff"
      ],
      "correct": 3,
      "fact": "boriskarloff"
    },
    {
      "q": "Which actor played the Wolf Man in Universal's 1941 film?",
      "a": [
        "James Whale",
        "Lon Chaney Jr.",
        "Andrew Gold",
        "Bette Midler"
      ],
      "correct": 1,
      "fact": "lonchaneyjr"
    },
    {
      "q": "What is the swamp creature in Creature from the Black Lagoon commonly called?",
      "a": [
        "Ofrenda",
        "Gill-man",
        "Guising",
        "Romania"
      ],
      "correct": 1,
      "fact": "gillman"
    },
    {
      "q": "Who plays Winifred Sanderson in Hocus Pocus?",
      "a": [
        "Lon Chaney Jr.",
        "Danny Elfman",
        "Bette Midler",
        "Boris Karloff"
      ],
      "correct": 2,
      "fact": "bettemidler"
    },
    {
      "q": "Who plays Sarah Sanderson in Hocus Pocus?",
      "a": [
        "Lon Chaney Jr.",
        "Kathy Najimy",
        "Sarah Jessica Parker",
        "Vincent Price"
      ],
      "correct": 2,
      "fact": "sarahjessicaparker"
    },
    {
      "q": "Who plays Mary Sanderson in Hocus Pocus?",
      "a": [
        "Henry Selick",
        "Anjelica Huston",
        "Andrew Gold",
        "Kathy Najimy"
      ],
      "correct": 3,
      "fact": "kathynajimy"
    },
    {
      "q": "What Massachusetts town is the main setting of Hocus Pocus?",
      "a": [
        "Bram Stoker",
        "Moaning Myrtle",
        "Bette Midler",
        "Salem"
      ],
      "correct": 3,
      "fact": "salem"
    },
    {
      "q": "What is the first name of the boy who lights the candle in Hocus Pocus?",
      "a": [
        "What's This?",
        "Max",
        "Souling",
        "Fred"
      ],
      "correct": 1,
      "fact": "max"
    },
    {
      "q": "What is the name of Max's younger sister in Hocus Pocus?",
      "a": [
        "Transylvania",
        "Sarah Jessica Parker",
        "Mexico",
        "Dani"
      ],
      "correct": 3,
      "fact": "dani"
    },
    {
      "q": "What enchanted object brings back the Sanderson sisters?",
      "a": [
        "Black Flame Candle",
        "Nearly Headless Nick",
        "Johnny",
        "Marigold"
      ],
      "correct": 0,
      "fact": "blackflamecandle"
    },
    {
      "q": "What is the black cat's full name in Hocus Pocus?",
      "a": [
        "This Is Halloween",
        "Danny Elfman",
        "Great Sphinx",
        "Thackery Binx"
      ],
      "correct": 3,
      "fact": "thackerybinx"
    },
    {
      "q": "Which song do the sisters perform at the Hocus Pocus party?",
      "a": [
        "Mavis",
        "It",
        "I Put a Spell on You",
        "Firehouse"
      ],
      "correct": 2,
      "fact": "iputaspellonyou"
    },
    {
      "q": "What is the name of the Sanderson sisters' spell book's unusual feature?",
      "a": [
        "UNICEF",
        "Danny Elfman",
        "Banshee",
        "A living eye"
      ],
      "correct": 3,
      "fact": "alivingeye"
    },
    {
      "q": "Who directed The Nightmare Before Christmas?",
      "a": [
        "Dan Aykroyd",
        "Ray Parker Jr.",
        "Henry Selick",
        "Danny Elfman"
      ],
      "correct": 2,
      "fact": "henryselick"
    },
    {
      "q": "Who composed the songs for The Nightmare Before Christmas?",
      "a": [
        "Danny Elfman",
        "Tim Burton",
        "Edgar Allan Poe",
        "Vincent Price"
      ],
      "correct": 0,
      "fact": "dannyelfman"
    },
    {
      "q": "What villain is a sack filled with bugs in The Nightmare Before Christmas?",
      "a": [
        "Ring",
        "Johnny",
        "Stay Puft Marshmallow Man",
        "Oogie Boogie"
      ],
      "correct": 3,
      "fact": "oogieboogie"
    },
    {
      "q": "Who created Sally in The Nightmare Before Christmas?",
      "a": [
        "Dr. Finkelstein",
        "Andrew Gold",
        "Edgar Allan Poe",
        "Danny Elfman"
      ],
      "correct": 0,
      "fact": "drfinkelstein"
    },
    {
      "q": "What are the names of Halloween Town's three trick-or-treaters?",
      "a": [
        "Lock, Shock, and Barrel",
        "Familiar",
        "Kathy Najimy",
        "Peter Venkman"
      ],
      "correct": 0,
      "fact": "lockshockandbarrel"
    },
    {
      "q": "Which song introduces the residents of Halloween Town?",
      "a": [
        "Sandy Claws",
        "This Is Halloween",
        "Transylvania",
        "Teal"
      ],
      "correct": 1,
      "fact": "thisishalloween"
    },
    {
      "q": "What is unusual about Halloween Town's mayor's head?",
      "a": [
        "Sarah Jessica Parker",
        "Oogie Boogie",
        "Victor",
        "It has two faces"
      ],
      "correct": 3,
      "fact": "ithastwoface"
    },
    {
      "q": "What does Jack call Santa Claus?",
      "a": [
        "Tootsie Pop",
        "Bram Stoker",
        "Sandy Claws",
        "Cucurbit family"
      ],
      "correct": 2,
      "fact": "sandyclaw"
    },
    {
      "q": "Which song does Jack sing while exploring Christmas Town?",
      "a": [
        "Mary Shelley",
        "What's This?",
        "Sarah Jessica Parker",
        "Lon Chaney Jr."
      ],
      "correct": 1,
      "fact": "whatsthi"
    },
    {
      "q": "Who plays Morticia in the 1991 Addams Family film?",
      "a": [
        "Bobby 'Boris' Pickett",
        "Michael Keaton",
        "Anjelica Huston",
        "Henry James"
      ],
      "correct": 2,
      "fact": "anjelicahuston"
    },
    {
      "q": "Who plays Gomez in the 1991 Addams Family film?",
      "a": [
        "Lon Chaney Jr.",
        "Peter Cushing",
        "John Carpenter",
        "Raul Julia"
      ],
      "correct": 3,
      "fact": "rauljulia"
    },
    {
      "q": "Who plays Wednesday in the 1991 Addams Family film?",
      "a": [
        "Ray Bradbury",
        "Mary Shelley",
        "Christina Ricci",
        "Danny Elfman"
      ],
      "correct": 2,
      "fact": "christinaricci"
    },
    {
      "q": "What is Wednesday's brother's name?",
      "a": [
        "Bette Midler",
        "Pugsley",
        "Fred",
        "Washington Irving"
      ],
      "correct": 1,
      "fact": "pugsley"
    },
    {
      "q": "Which Addams relative is covered in long hair?",
      "a": [
        "Cousin Itt",
        "Poltergeist",
        "Thackery Binx",
        "Proton pack"
      ],
      "correct": 0,
      "fact": "cousinitt"
    },
    {
      "q": "Which Addams uncle can light a bulb in his mouth?",
      "a": [
        "Egon Spengler",
        "All Saints' Day",
        "Washington Irving",
        "Uncle Fester"
      ],
      "correct": 3,
      "fact": "unclefester"
    },
    {
      "q": "What is the name of the Addams family baby in Addams Family Values?",
      "a": [
        "Kathy Najimy",
        "Pubert",
        "Cucurbit family",
        "Max"
      ],
      "correct": 1,
      "fact": "pubert"
    },
    {
      "q": "Which Scooby-Doo character wears an orange sweater and glasses?",
      "a": [
        "Friday the 13th",
        "Kathy Najimy",
        "Ray Parker Jr.",
        "Velma"
      ],
      "correct": 3,
      "fact": "velma"
    },
    {
      "q": "Which Scooby-Doo character usually wears an ascot?",
      "a": [
        "Fred",
        "Salem",
        "Black Flame Candle",
        "Mary Shelley"
      ],
      "correct": 0,
      "fact": "fred"
    },
    {
      "q": "Which Scooby-Doo character is often dressed in purple?",
      "a": [
        "Haddonfield",
        "Max",
        "Daphne",
        "A living eye"
      ],
      "correct": 2,
      "fact": "daphne"
    },
    {
      "q": "What are the treats used to persuade Scooby and Shaggy called?",
      "a": [
        "Scooby Snacks",
        "Haddonfield",
        "Barmbrack",
        "Dr. Finkelstein"
      ],
      "correct": 0,
      "fact": "scoobysnack"
    },
    {
      "q": "What does Velma famously say when she finds a clue?",
      "a": [
        "Sarah Jessica Parker",
        "Jinkies",
        "Anjelica Huston",
        "Cucurbit family"
      ],
      "correct": 1,
      "fact": "jinkie"
    },
    {
      "q": "What exclamation is strongly associated with Shaggy?",
      "a": [
        "Proton pack",
        "Banshee",
        "Samhain",
        "Zoinks"
      ],
      "correct": 3,
      "fact": "zoink"
    },
    {
      "q": "What does Scooby-Doo typically reveal about a supposed monster?",
      "a": [
        "It",
        "Samhain",
        "A person in disguise",
        "Peter Venkman"
      ],
      "correct": 2,
      "fact": "apersonindisguise"
    },
    {
      "q": "What is the Ghostbusters' vehicle called?",
      "a": [
        "Ecto-1",
        "Anjelica Huston",
        "Cousin Itt",
        "Tootsie Pop"
      ],
      "correct": 0,
      "fact": "ecto1"
    },
    {
      "q": "What New York building is the Ghostbusters' headquarters?",
      "a": [
        "Dani",
        "Oogie Boogie",
        "Centaur",
        "Firehouse"
      ],
      "correct": 3,
      "fact": "firehouse"
    },
    {
      "q": "What device do Ghostbusters wear on their backs?",
      "a": [
        "Great Sphinx",
        "Egon Spengler",
        "Teal",
        "Proton pack"
      ],
      "correct": 3,
      "fact": "protonpack"
    },
    {
      "q": "What enormous mascot appears at the climax of Ghostbusters (1984)?",
      "a": [
        "Stay Puft Marshmallow Man",
        "Bette Midler",
        "Snickers",
        "Freddy Krueger"
      ],
      "correct": 0,
      "fact": "staypuftmarshmallowman"
    },
    {
      "q": "Who wrote and sang the hit Ghostbusters theme?",
      "a": [
        "Ray Parker Jr.",
        "Christopher Lloyd",
        "Michael Keaton",
        "Bette Midler"
      ],
      "correct": 0,
      "fact": "rayparkerjr"
    },
    {
      "q": "Which Ghostbuster is played by Bill Murray?",
      "a": [
        "Peter Venkman",
        "Haddonfield",
        "Overlook Hotel",
        "Daphne"
      ],
      "correct": 0,
      "fact": "petervenkman"
    },
    {
      "q": "Which Ghostbuster is played by Dan Aykroyd?",
      "a": [
        "Ray Stantz",
        "Gill-man",
        "This Is Halloween",
        "Poltergeist"
      ],
      "correct": 0,
      "fact": "raystantz"
    },
    {
      "q": "Which Ghostbuster is played by Harold Ramis?",
      "a": [
        "Samhain",
        "Egon Spengler",
        "Mothman",
        "A person in disguise"
      ],
      "correct": 1,
      "fact": "egonspengler"
    },
    {
      "q": "Which Ghostbuster is played by Ernie Hudson?",
      "a": [
        "This Is Halloween",
        "Winston Zeddemore",
        "Guising",
        "All Hallows' Eve"
      ],
      "correct": 1,
      "fact": "winstonzeddemore"
    },
    {
      "q": "What is Dracula's daughter's name in Hotel Transylvania?",
      "a": [
        "Mavis",
        "Bram Stoker",
        "Mexico",
        "Henry Selick"
      ],
      "correct": 0,
      "fact": "mavi"
    },
    {
      "q": "Who is the human visitor who falls for Mavis?",
      "a": [
        "Daphne",
        "Johnny",
        "Acromantula",
        "Snickers"
      ],
      "correct": 1,
      "fact": "johnny"
    },
    {
      "q": "What is the name of the young witch in Halloweentown?",
      "a": [
        "Woodsboro",
        "Marnie Piper",
        "Raul Julia",
        "Fruit"
      ],
      "correct": 1,
      "fact": "marniepiper"
    },
    {
      "q": "Which actress plays Aggie Cromwell in Halloweentown?",
      "a": [
        "Debbie Reynolds",
        "Michael Keaton",
        "Danny Elfman",
        "Henry James"
      ],
      "correct": 0,
      "fact": "debbiereynold"
    },
    {
      "q": "What is the name of the villain in the first Halloweentown?",
      "a": [
        "Mounds",
        "Kalabar",
        "A person in disguise",
        "Guising"
      ],
      "correct": 1,
      "fact": "kalabar"
    },
    {
      "q": "What Halloween creature does Harry face in the girls' bathroom in his first year?",
      "a": [
        "Mountain troll",
        "Boris Karloff",
        "Ray Parker Jr.",
        "Jinkies"
      ],
      "correct": 0,
      "fact": "mountaintroll"
    },
    {
      "q": "Whose Deathday party do Harry and friends attend on Halloween?",
      "a": [
        "Nearly Headless Nick",
        "Ecto-1",
        "Romania",
        "Mary Shelley"
      ],
      "correct": 0,
      "fact": "nearlyheadlessnick"
    },
    {
      "q": "Which spell is used against a boggart?",
      "a": [
        "All Hallows' Eve",
        "Expecto Patronum",
        "Riddikulus",
        "Salem"
      ],
      "correct": 2,
      "fact": "riddikulu"
    },
    {
      "q": "Which spell creates a Patronus to repel Dementors?",
      "a": [
        "Expecto Patronum",
        "A living eye",
        "Anjelica Huston",
        "Haddonfield"
      ],
      "correct": 0,
      "fact": "expectopatronum"
    },
    {
      "q": "What type of creature is Aragog in Harry Potter?",
      "a": [
        "Bat",
        "Werewolf",
        "Centaur",
        "Acromantula"
      ],
      "correct": 3,
      "fact": "acromantula"
    },
    {
      "q": "What enormous snake lives in the Chamber of Secrets?",
      "a": [
        "Bat",
        "Griffin",
        "Basilisk",
        "Poltergeist"
      ],
      "correct": 2,
      "fact": "basilisk"
    },
    {
      "q": "What magical creatures pull the Hogwarts carriages?",
      "a": [
        "Basilisk",
        "Banshee",
        "Thestrals",
        "Boggart"
      ],
      "correct": 2,
      "fact": "thestral"
    },
    {
      "q": "Which Hogwarts ghost haunts a girls' bathroom?",
      "a": [
        "Dr. Finkelstein",
        "Stay Puft Marshmallow Man",
        "Gill-man",
        "Moaning Myrtle"
      ],
      "correct": 3,
      "fact": "moaningmyrtle"
    },
    {
      "q": "Which character is pursued by Michael Myers in Halloween (1978)?",
      "a": [
        "Michael Keaton",
        "Laurie Strode",
        "Salem",
        "Mary Shelley"
      ],
      "correct": 1,
      "fact": "lauriestrode"
    },
    {
      "q": "Which fictional Illinois town is the setting of Halloween (1978)?",
      "a": [
        "Haddonfield",
        "Nearly Headless Nick",
        "Pubert",
        "Black Flame Candle"
      ],
      "correct": 0,
      "fact": "haddonfield"
    },
    {
      "q": "Which character haunts dreams in A Nightmare on Elm Street?",
      "a": [
        "Anjelica Huston",
        "Marnie Piper",
        "Freddy Krueger",
        "Woodsboro"
      ],
      "correct": 2,
      "fact": "freddykrueger"
    },
    {
      "q": "Which movie series features Ghostface?",
      "a": [
        "Scream",
        "Corpse Bride",
        "Monster House",
        "The Invisible Man"
      ],
      "correct": 0,
      "fact": "scream"
    },
    {
      "q": "What is the fictional town in the original Scream?",
      "a": [
        "Max",
        "Woodsboro",
        "It has two faces",
        "Bette Midler"
      ],
      "correct": 1,
      "fact": "woodsboro"
    },
    {
      "q": "Which horror franchise features Camp Crystal Lake?",
      "a": [
        "Ghostbusters",
        "Coraline",
        "Friday the 13th",
        "Monster House"
      ],
      "correct": 2,
      "fact": "fridaythe13th"
    },
    {
      "q": "Which Stephen King story features Pennywise?",
      "a": [
        "The Shining",
        "It",
        "Frankenstein",
        "Monster House"
      ],
      "correct": 1,
      "fact": "it"
    },
    {
      "q": "Which hotel is the setting of The Shining?",
      "a": [
        "Zoinks",
        "Bram Stoker",
        "Victor",
        "Overlook Hotel"
      ],
      "correct": 3,
      "fact": "overlookhotel"
    },
    {
      "q": "What movie features a haunted TV and the line They're here?",
      "a": [
        "Halloween",
        "Coraline",
        "Poltergeist",
        "Hocus Pocus"
      ],
      "correct": 2,
      "fact": "poltergeist"
    },
    {
      "q": "Which actor plays Beetlejuice in the 1988 film?",
      "a": [
        "Michael Keaton",
        "Warren Zevon",
        "Kenny Ortega",
        "Lon Chaney Jr."
      ],
      "correct": 0,
      "fact": "michaelkeaton"
    },
    {
      "q": "Who recorded Monster Mash in 1962?",
      "a": [
        "Wes Craven",
        "Bobby 'Boris' Pickett",
        "Anjelica Huston",
        "Warren Zevon"
      ],
      "correct": 1,
      "fact": "bobbyborispickett"
    }
  ],
  "hard": [
    {
      "q": "In what year was Bram Stoker's Dracula first published?",
      "a": [
        "1969",
        "1962",
        "1897",
        "2009"
      ],
      "correct": 2,
      "fact": "1897"
    },
    {
      "q": "In what year was Mary Shelley's Frankenstein first published?",
      "a": [
        "1969",
        "1818",
        "1941",
        "1935"
      ],
      "correct": 1,
      "fact": "1818"
    },
    {
      "q": "What subtitle accompanies Frankenstein?",
      "a": [
        "Nevermore",
        "Lon Chaney",
        "James Whale",
        "The Modern Prometheus"
      ],
      "correct": 3,
      "fact": "themodernprometheu"
    },
    {
      "q": "Which novel introduced the vampire Count Orlok to cinema by loose adaptation?",
      "a": [
        "Dracula",
        "Nosferatu",
        "Casper",
        "Hotel Transylvania"
      ],
      "correct": 0,
      "fact": "dracula"
    },
    {
      "q": "Who directed the 1922 silent film Nosferatu?",
      "a": [
        "Henry Selick",
        "Christopher Lee",
        "Shirley Jackson",
        "F. W. Murnau"
      ],
      "correct": 3,
      "fact": "fwmurnau"
    },
    {
      "q": "Who played Count Orlok in Nosferatu (1922)?",
      "a": [
        "Henry Selick",
        "Anjelica Huston",
        "Christopher Lloyd",
        "Max Schreck"
      ],
      "correct": 3,
      "fact": "maxschreck"
    },
    {
      "q": "Who directed the 1931 Universal Dracula?",
      "a": [
        "Tod Browning",
        "Kathy Najimy",
        "Bobby 'Boris' Pickett",
        "Stephen King"
      ],
      "correct": 0,
      "fact": "todbrowning"
    },
    {
      "q": "Who directed Universal's Frankenstein (1931)?",
      "a": [
        "James Whale",
        "Michael Keaton",
        "Vincent Price",
        "Peter Cushing"
      ],
      "correct": 0,
      "fact": "jameswhale"
    },
    {
      "q": "Who played the Bride in Bride of Frankenstein (1935)?",
      "a": [
        "Elsa Lanchester",
        "Henry James",
        "Shirley Jackson",
        "Tod Browning"
      ],
      "correct": 0,
      "fact": "elsalanchester"
    },
    {
      "q": "Who directed The Mummy (1932)?",
      "a": [
        "Karl Freund",
        "Boris Karloff",
        "Washington Irving",
        "Bobby 'Boris' Pickett"
      ],
      "correct": 0,
      "fact": "karlfreund"
    },
    {
      "q": "What is the ancient priest's name in The Mummy (1932)?",
      "a": [
        "Imhotep",
        "Ken Page",
        "Calaveras literarias",
        "Phasmophobia"
      ],
      "correct": 0,
      "fact": "imhotep"
    },
    {
      "q": "What modern alias does Imhotep use in The Mummy (1932)?",
      "a": [
        "Mood slime",
        "Ardath Bey",
        "Keene",
        "Samhainophobia"
      ],
      "correct": 1,
      "fact": "ardathbey"
    },
    {
      "q": "Who played the title character in The Invisible Man (1933)?",
      "a": [
        "Tod Browning",
        "Vincent Price",
        "Claude Rains",
        "Shirley Jackson"
      ],
      "correct": 2,
      "fact": "clauderain"
    },
    {
      "q": "What is the Invisible Man's surname in H. G. Wells's novel?",
      "a": [
        "Griffin",
        "Mummy",
        "Bat",
        "House-elf"
      ],
      "correct": 0,
      "fact": "griffin"
    },
    {
      "q": "Which author wrote The Invisible Man?",
      "a": [
        "Christina Ricci",
        "H. G. Wells",
        "Bill Murray",
        "Ray Bradbury"
      ],
      "correct": 1,
      "fact": "hgwell"
    },
    {
      "q": "Who directed Creature from the Black Lagoon (1954)?",
      "a": [
        "Sarah Jessica Parker",
        "Christina Ricci",
        "Jack Arnold",
        "Ray Parker Jr."
      ],
      "correct": 2,
      "fact": "jackarnold"
    },
    {
      "q": "Who played the Phantom in the famous 1925 silent film?",
      "a": [
        "Lon Chaney",
        "Shirley Jackson",
        "Anjelica Huston",
        "Peter Cushing"
      ],
      "correct": 0,
      "fact": "lonchaney"
    },
    {
      "q": "Which author wrote The Phantom of the Opera?",
      "a": [
        "Andrew Gold",
        "Gaston Leroux",
        "Washington Irving",
        "Bram Stoker"
      ],
      "correct": 1,
      "fact": "gastonleroux"
    },
    {
      "q": "Who wrote the novella Carmilla?",
      "a": [
        "Christina Ricci",
        "Bette Midler",
        "Michael Keaton",
        "Sheridan Le Fanu"
      ],
      "correct": 3,
      "fact": "sheridanlefanu"
    },
    {
      "q": "Who wrote The Vampyre, published in 1819?",
      "a": [
        "Shirley Jackson",
        "Mary Shelley",
        "John Polidori",
        "Wes Craven"
      ],
      "correct": 2,
      "fact": "johnpolidori"
    },
    {
      "q": "What is the name of the vampire in The Vampyre?",
      "a": [
        "Ken Page",
        "Dakota Fanning",
        "The New Yorker",
        "Lord Ruthven"
      ],
      "correct": 3,
      "fact": "lordruthven"
    },
    {
      "q": "Who wrote The Strange Case of Dr Jekyll and Mr Hyde?",
      "a": [
        "Kathy Najimy",
        "Ivan Reitman",
        "Robert Louis Stevenson",
        "John Carpenter"
      ],
      "correct": 2,
      "fact": "robertlouisstevenson"
    },
    {
      "q": "What is Dr. Jekyll's first name?",
      "a": [
        "Henry",
        "Charles Addams",
        "Oscar Wilde",
        "Carotenoids"
      ],
      "correct": 0,
      "fact": "henry"
    },
    {
      "q": "What is Mr. Hyde's first name?",
      "a": [
        "The New Yorker",
        "Dullahan",
        "Cooger & Dark's Pandemonium Shadow Show",
        "Edward"
      ],
      "correct": 3,
      "fact": "edward"
    },
    {
      "q": "Which author wrote The Turn of the Screw?",
      "a": [
        "Henry James",
        "Stephen King",
        "Dan Aykroyd",
        "Peter Cushing"
      ],
      "correct": 0,
      "fact": "henryjame"
    },
    {
      "q": "Which author wrote The Haunting of Hill House?",
      "a": [
        "Tim Burton",
        "Boris Karloff",
        "Stephen King",
        "Shirley Jackson"
      ],
      "correct": 3,
      "fact": "shirleyjackson"
    },
    {
      "q": "Which author wrote The Halloween Tree?",
      "a": [
        "James Whale",
        "Ray Bradbury",
        "John Carpenter",
        "Christina Ricci"
      ],
      "correct": 1,
      "fact": "raybradbury"
    },
    {
      "q": "Who wrote Something Wicked This Way Comes?",
      "a": [
        "Andrew Gold",
        "Ray Bradbury",
        "James Whale",
        "Bill Murray"
      ],
      "correct": 1,
      "fact": "raybradbury"
    },
    {
      "q": "What is the carnival's name in Something Wicked This Way Comes?",
      "a": [
        "James Whale",
        "Robert Louis Stevenson",
        "1897",
        "Cooger & Dark's Pandemonium Shadow Show"
      ],
      "correct": 3,
      "fact": "coogerdarkspandemoniumshadowshow"
    },
    {
      "q": "Which poet wrote The Raven?",
      "a": [
        "Wes Craven",
        "Edgar Allan Poe",
        "Bram Stoker",
        "Christopher Lloyd"
      ],
      "correct": 1,
      "fact": "edgarallanpoe"
    },
    {
      "q": "What is the raven's repeated word in Poe's poem?",
      "a": [
        "H. G. Wells",
        "Stanley Kubrick",
        "Nevermore",
        "James Whale"
      ],
      "correct": 2,
      "fact": "nevermore"
    },
    {
      "q": "Who wrote The Canterville Ghost?",
      "a": [
        "Andrew Gold",
        "Christopher Lloyd",
        "Oscar Wilde",
        "Winona Ryder"
      ],
      "correct": 2,
      "fact": "oscarwilde"
    },
    {
      "q": "What is the ghost's name in The Canterville Ghost?",
      "a": [
        "Beldam",
        "Kodi Smit-McPhee",
        "Norville Rogers",
        "Sir Simon"
      ],
      "correct": 3,
      "fact": "sirsimon"
    },
    {
      "q": "In what collection did The Legend of Sleepy Hollow first appear?",
      "a": [
        "Sam Fell and Chris Butler",
        "The Sketch Book of Geoffrey Crayon, Gent.",
        "Jones",
        "Wes Craven"
      ],
      "correct": 1,
      "fact": "thesketchbookofgeoffreycrayongent"
    },
    {
      "q": "What is Ichabod's rival's nickname in Sleepy Hollow?",
      "a": [
        "Gaston Leroux",
        "Edward",
        "Brom Bones",
        "Edgar Allan Poe"
      ],
      "correct": 2,
      "fact": "brombone"
    },
    {
      "q": "What is the surname of Ichabod's love interest Katrina?",
      "a": [
        "Van Tassel",
        "Imhotep",
        "Sheridan Le Fanu",
        "Pepo"
      ],
      "correct": 0,
      "fact": "vantassel"
    },
    {
      "q": "Who directed Sleepy Hollow (1999)?",
      "a": [
        "Edgar Allan Poe",
        "Ivan Reitman",
        "Christina Ricci",
        "Tim Burton"
      ],
      "correct": 3,
      "fact": "timburton"
    },
    {
      "q": "Who plays Ichabod Crane in Sleepy Hollow (1999)?",
      "a": [
        "Johnny Depp",
        "Kenny Ortega",
        "Stephen King",
        "Anjelica Huston"
      ],
      "correct": 0,
      "fact": "johnnydepp"
    },
    {
      "q": "Who narrates Disney's 1949 Sleepy Hollow segment?",
      "a": [
        "Carolyn Jones",
        "Keene",
        "Dracula",
        "Bing Crosby"
      ],
      "correct": 3,
      "fact": "bingcrosby"
    },
    {
      "q": "What historical soldier is the Horseman said to have been in Irving's story?",
      "a": [
        "Sir Simon",
        "Dracula",
        "Sir Nicholas de Mimsy-Porpington",
        "Hessian trooper"
      ],
      "correct": 3,
      "fact": "hessiantrooper"
    },
    {
      "q": "What is the Irish name for a headless rider in folklore?",
      "a": [
        "Camp Chippewa",
        "The Modern Prometheus",
        "Allison",
        "Dullahan"
      ],
      "correct": 3,
      "fact": "dullahan"
    },
    {
      "q": "What is fear of Halloween commonly called?",
      "a": [
        "Tim Burton",
        "Scooby-Doo, Where Are You!",
        "Shirley Jackson",
        "Samhainophobia"
      ],
      "correct": 3,
      "fact": "samhainophobia"
    },
    {
      "q": "What is fear of ghosts commonly called?",
      "a": [
        "John Astin",
        "Chris Sarandon",
        "Pan de muerto",
        "Phasmophobia"
      ],
      "correct": 3,
      "fact": "phasmophobia"
    },
    {
      "q": "What is fear of spiders called?",
      "a": [
        "Accountant",
        "Arachnophobia",
        "Stanley Kubrick",
        "Norville Rogers"
      ],
      "correct": 1,
      "fact": "arachnophobia"
    },
    {
      "q": "What Scottish word describes a mischievous household spirit?",
      "a": [
        "Henry",
        "Brownie",
        "The Sketch Book of Geoffrey Crayon, Gent.",
        "Pepita"
      ],
      "correct": 1,
      "fact": "brownie"
    },
    {
      "q": "What Japanese term refers to a shape-shifting fox spirit?",
      "a": [
        "Kitsune",
        "Casey Kasem",
        "Beldam",
        "H. G. Wells"
      ],
      "correct": 0,
      "fact": "kitsune"
    },
    {
      "q": "What Japanese creature is a long-nosed mountain spirit?",
      "a": [
        "Chris Sarandon",
        "Tengu",
        "Jack Arnold",
        "5/4"
      ],
      "correct": 1,
      "fact": "tengu"
    },
    {
      "q": "What is the name for a Japanese ghost often depicted in white funeral clothes?",
      "a": [
        "Yurei",
        "Pamela Voorhees",
        "Oscar Wilde",
        "Van Tassel"
      ],
      "correct": 0,
      "fact": "yurei"
    },
    {
      "q": "What Slavic witch lives in a hut on chicken legs?",
      "a": [
        "Baba Yaga",
        "Sheridan Le Fanu",
        "Scooby-Doo, Where Are You!",
        "Wes Craven"
      ],
      "correct": 0,
      "fact": "babayaga"
    },
    {
      "q": "What is the legendary Scottish water horse called?",
      "a": [
        "Kelpie",
        "Tengu",
        "Dracula",
        "Kenny Ortega"
      ],
      "correct": 0,
      "fact": "kelpie"
    },
    {
      "q": "What is the English folklore name for a spectral black dog of East Anglia?",
      "a": [
        "Black Shuck",
        "Jack Arnold",
        "Blithe Hollow",
        "Griffin"
      ],
      "correct": 0,
      "fact": "blackshuck"
    },
    {
      "q": "What kind of light is the folklore will-o'-the-wisp associated with?",
      "a": [
        "Norville Rogers",
        "Marsh light",
        "Gaston Leroux",
        "Edgar Allan Poe"
      ],
      "correct": 1,
      "fact": "marshlight"
    },
    {
      "q": "Which Mexican illustrator created the famous La Calavera Catrina etching?",
      "a": [
        "Corpse Bride",
        "5/4",
        "Henry James",
        "Jose Guadalupe Posada"
      ],
      "correct": 3,
      "fact": "joseguadalupeposada"
    },
    {
      "q": "What is the traditional Day of the Dead bread called?",
      "a": [
        "Pan de muerto",
        "Kitsune",
        "Jose Guadalupe Posada",
        "Pamela Voorhees"
      ],
      "correct": 0,
      "fact": "pandemuerto"
    },
    {
      "q": "What name is used for humorous Day of the Dead poems?",
      "a": [
        "Victoria",
        "Calaveras literarias",
        "Lon Chaney",
        "Elsa Lanchester"
      ],
      "correct": 1,
      "fact": "calaverasliteraria"
    },
    {
      "q": "Which city is associated with the annual Village Halloween Parade?",
      "a": [
        "Norville Rogers",
        "Vigo the Carpathian",
        "Catherine O'Hara",
        "New York City"
      ],
      "correct": 3,
      "fact": "newyorkcity"
    },
    {
      "q": "Which New Hampshire city became known for its Pumpkin Festival towers?",
      "a": [
        "Mood slime",
        "Baba Yaga",
        "John Polidori",
        "Keene"
      ],
      "correct": 3,
      "fact": "keene"
    },
    {
      "q": "What is the pumpkin's botanical fruit type?",
      "a": [
        "Pepita",
        "Pepo",
        "Jones",
        "New York City"
      ],
      "correct": 1,
      "fact": "pepo"
    },
    {
      "q": "What is the edible inner part of a pumpkin seed often called?",
      "a": [
        "Black Shuck",
        "Pepita",
        "Henry Selick",
        "Corpse Bride"
      ],
      "correct": 1,
      "fact": "pepita"
    },
    {
      "q": "Which pigment family gives pumpkins their orange coloration?",
      "a": [
        "Pepita",
        "Neil Gaiman",
        "Sheridan Le Fanu",
        "Carotenoids"
      ],
      "correct": 3,
      "fact": "carotenoid"
    },
    {
      "q": "Who directed Hocus Pocus (1993)?",
      "a": [
        "Kenny Ortega",
        "Bobby 'Boris' Pickett",
        "Tod Browning",
        "Christopher Lee"
      ],
      "correct": 0,
      "fact": "kennyortega"
    },
    {
      "q": "What year was the original Hocus Pocus released?",
      "a": [
        "1993",
        "1931",
        "1954",
        "1984"
      ],
      "correct": 0,
      "fact": "1993"
    },
    {
      "q": "Who plays Billy Butcherson in Hocus Pocus?",
      "a": [
        "Vincent Price",
        "Neil Gaiman",
        "Doug Jones",
        "Bobby 'Boris' Pickett"
      ],
      "correct": 2,
      "fact": "dougjone"
    },
    {
      "q": "What surname do Max and Dani share?",
      "a": [
        "Dennison",
        "Casey Kasem",
        "Charles Addams",
        "1818"
      ],
      "correct": 0,
      "fact": "dennison"
    },
    {
      "q": "What is Thackery Binx's sister's name?",
      "a": [
        "Imhotep",
        "Emily",
        "Kenny Ortega",
        "Elsa Lanchester"
      ],
      "correct": 1,
      "fact": "emily"
    },
    {
      "q": "What is the name of Max's school crush in Hocus Pocus?",
      "a": [
        "LAIKA",
        "Sam Fell and Chris Butler",
        "H. G. Wells",
        "Allison"
      ],
      "correct": 3,
      "fact": "allison"
    },
    {
      "q": "Which actor provides Jack Skellington's speaking voice?",
      "a": [
        "Lon Chaney Jr.",
        "Henry James",
        "Michael Keaton",
        "Chris Sarandon"
      ],
      "correct": 3,
      "fact": "chrissarandon"
    },
    {
      "q": "Who provides Oogie Boogie's voice in The Nightmare Before Christmas?",
      "a": [
        "Ken Page",
        "Kathy Najimy",
        "Tim Burton",
        "Boris Karloff"
      ],
      "correct": 0,
      "fact": "kenpage"
    },
    {
      "q": "Who voices Sally in The Nightmare Before Christmas?",
      "a": [
        "Warren Zevon",
        "Bram Stoker",
        "Tod Browning",
        "Catherine O'Hara"
      ],
      "correct": 3,
      "fact": "catherineohara"
    },
    {
      "q": "Which stop-motion film features Victor Van Dort?",
      "a": [
        "Beetlejuice",
        "The Addams Family",
        "Casper",
        "Corpse Bride"
      ],
      "correct": 3,
      "fact": "corpsebride"
    },
    {
      "q": "What is Victor's living fiancee's first name in Corpse Bride?",
      "a": [
        "Jose Guadalupe Posada",
        "James Whale",
        "Victoria",
        "Dracula"
      ],
      "correct": 2,
      "fact": "victoria"
    },
    {
      "q": "Who directed Coraline (2009)?",
      "a": [
        "Washington Irving",
        "Henry Selick",
        "Neil Gaiman",
        "James Whale"
      ],
      "correct": 1,
      "fact": "henryselick"
    },
    {
      "q": "Who wrote the novella Coraline?",
      "a": [
        "Boris Karloff",
        "Washington Irving",
        "Neil Gaiman",
        "Michael Keaton"
      ],
      "correct": 2,
      "fact": "neilgaiman"
    },
    {
      "q": "Who voices Coraline in the 2009 film?",
      "a": [
        "Tim Burton",
        "Warren Zevon",
        "Dakota Fanning",
        "Christopher Lee"
      ],
      "correct": 2,
      "fact": "dakotafanning"
    },
    {
      "q": "What is Coraline's surname?",
      "a": [
        "Brownie",
        "Jones",
        "1969",
        "Peeves"
      ],
      "correct": 1,
      "fact": "jone"
    },
    {
      "q": "What is the Other Mother's alternative name in Coraline?",
      "a": [
        "Claude Rains",
        "Beldam",
        "Arachnophobia",
        "John Astin"
      ],
      "correct": 1,
      "fact": "beldam"
    },
    {
      "q": "Which actor voices Norman in ParaNorman?",
      "a": [
        "Bela Lugosi",
        "Bram Stoker",
        "Anjelica Huston",
        "Kodi Smit-McPhee"
      ],
      "correct": 3,
      "fact": "kodismitmcphee"
    },
    {
      "q": "Which studio produced ParaNorman?",
      "a": [
        "Ivan Reitman",
        "Dana Barrett",
        "LAIKA",
        "Calaveras literarias"
      ],
      "correct": 2,
      "fact": "laika"
    },
    {
      "q": "Who directed ParaNorman?",
      "a": [
        "Sarah Jessica Parker",
        "Shirley Jackson",
        "Michael Keaton",
        "Sam Fell and Chris Butler"
      ],
      "correct": 3,
      "fact": "samfellandchrisbutler"
    },
    {
      "q": "What is the town in ParaNorman called?",
      "a": [
        "Blithe Hollow",
        "Beldam",
        "Catherine O'Hara",
        "Johnny Depp"
      ],
      "correct": 0,
      "fact": "blithehollow"
    },
    {
      "q": "Who created The Addams Family cartoons?",
      "a": [
        "Charles Addams",
        "Henry James",
        "Michael Keaton",
        "Washington Irving"
      ],
      "correct": 0,
      "fact": "charlesaddam"
    },
    {
      "q": "In which magazine did the Addams Family cartoons originally appear?",
      "a": [
        "New York City",
        "The New Yorker",
        "Griffin",
        "Vic Mizzy"
      ],
      "correct": 1,
      "fact": "thenewyorker"
    },
    {
      "q": "Who played Morticia in the 1960s Addams Family television series?",
      "a": [
        "Carolyn Jones",
        "Bette Midler",
        "Christopher Lloyd",
        "Bela Lugosi"
      ],
      "correct": 0,
      "fact": "carolynjone"
    },
    {
      "q": "Who played Gomez in the 1960s Addams Family television series?",
      "a": [
        "Christopher Lloyd",
        "John Astin",
        "Ray Bradbury",
        "Ivan Reitman"
      ],
      "correct": 1,
      "fact": "johnastin"
    },
    {
      "q": "Who composed the original Addams Family television theme?",
      "a": [
        "Neil Gaiman",
        "Vic Mizzy",
        "Shirley Jackson",
        "Stephen King"
      ],
      "correct": 1,
      "fact": "vicmizzy"
    },
    {
      "q": "Who plays Uncle Fester in the 1991 Addams Family film?",
      "a": [
        "James Whale",
        "Wes Craven",
        "Christopher Lloyd",
        "Shirley Jackson"
      ],
      "correct": 2,
      "fact": "christopherlloyd"
    },
    {
      "q": "What is the name of the camp in Addams Family Values?",
      "a": [
        "Pamela Voorhees",
        "Henry James",
        "F. W. Murnau",
        "Camp Chippewa"
      ],
      "correct": 3,
      "fact": "campchippewa"
    },
    {
      "q": "Who directed The Addams Family (1991)?",
      "a": [
        "John Carpenter",
        "Barry Sonnenfeld",
        "Boris Karloff",
        "Ray Bradbury"
      ],
      "correct": 1,
      "fact": "barrysonnenfeld"
    },
    {
      "q": "What is Shaggy's full first and last name?",
      "a": [
        "Stephen King",
        "Norville Rogers",
        "Baba Yaga",
        "LAIKA"
      ],
      "correct": 1,
      "fact": "norvilleroger"
    },
    {
      "q": "What is Velma's surname?",
      "a": [
        "Dinkley",
        "Tengu",
        "Robert Louis Stevenson",
        "Dakota Fanning"
      ],
      "correct": 0,
      "fact": "dinkley"
    },
    {
      "q": "What is Daphne's surname?",
      "a": [
        "Barry Sonnenfeld",
        "Sir Nicholas de Mimsy-Porpington",
        "1993",
        "Blake"
      ],
      "correct": 3,
      "fact": "blake"
    },
    {
      "q": "What was the first Scooby-Doo television series called?",
      "a": [
        "Pepita",
        "Ivan Reitman",
        "Nevermore",
        "Scooby-Doo, Where Are You!"
      ],
      "correct": 3,
      "fact": "scoobydoowhereareyou"
    },
    {
      "q": "What year did Scooby-Doo, Where Are You! premiere?",
      "a": [
        "1984",
        "1941",
        "1969",
        "1897"
      ],
      "correct": 2,
      "fact": "1969"
    },
    {
      "q": "Which original voice actor performed Scooby-Doo?",
      "a": [
        "Sir Simon",
        "Norville Rogers",
        "Don Messick",
        "Henry James"
      ],
      "correct": 2,
      "fact": "donmessick"
    },
    {
      "q": "Which radio host originally voiced Shaggy?",
      "a": [
        "Casey Kasem",
        "Kenny Ortega",
        "Kathy Najimy",
        "Washington Irving"
      ],
      "correct": 0,
      "fact": "caseykasem"
    },
    {
      "q": "Who directed Ghostbusters (1984)?",
      "a": [
        "Ivan Reitman",
        "Warren Zevon",
        "Henry Selick",
        "Christopher Lee"
      ],
      "correct": 0,
      "fact": "ivanreitman"
    },
    {
      "q": "What is the surname of Ghostbusters receptionist Janine?",
      "a": [
        "Allison",
        "Melnitz",
        "Samhainophobia",
        "Dana Barrett"
      ],
      "correct": 1,
      "fact": "melnitz"
    },
    {
      "q": "What is the name of the possessed cellist in Ghostbusters?",
      "a": [
        "Baba Yaga",
        "Scooby-Doo, Where Are You!",
        "Bing Crosby",
        "Dana Barrett"
      ],
      "correct": 3,
      "fact": "danabarrett"
    },
    {
      "q": "What is Louis Tully's profession in Ghostbusters?",
      "a": [
        "Accountant",
        "Max Schreck",
        "Karl Freund",
        "Sir Simon"
      ],
      "correct": 0,
      "fact": "accountant"
    },
    {
      "q": "What is the river of supernatural material beneath New York in Ghostbusters II?",
      "a": [
        "Black Shuck",
        "The New Yorker",
        "Wilhelm von Homburg",
        "Mood slime"
      ],
      "correct": 3,
      "fact": "moodslime"
    },
    {
      "q": "Who plays the painting's villain Vigo in Ghostbusters II on screen?",
      "a": [
        "Dan Aykroyd",
        "Anjelica Huston",
        "Christopher Lee",
        "Wilhelm von Homburg"
      ],
      "correct": 3,
      "fact": "wilhelmvonhomburg"
    },
    {
      "q": "What painting villain's full name is given in Ghostbusters II?",
      "a": [
        "Casey Kasem",
        "John Polidori",
        "Vigo the Carpathian",
        "Marsh light"
      ],
      "correct": 2,
      "fact": "vigothecarpathian"
    },
    {
      "q": "Which time signature drives the main Halloween film theme?",
      "a": [
        "3/4",
        "5/4",
        "4/4",
        "7/8"
      ],
      "correct": 1,
      "fact": "54"
    },
    {
      "q": "Who directed A Nightmare on Elm Street (1984)?",
      "a": [
        "Bobby 'Boris' Pickett",
        "Ray Parker Jr.",
        "Stephen King",
        "Wes Craven"
      ],
      "correct": 3,
      "fact": "wescraven"
    },
    {
      "q": "Who wrote the novel The Shining?",
      "a": [
        "Sarah Jessica Parker",
        "Stephen King",
        "Lon Chaney Jr.",
        "Tod Browning"
      ],
      "correct": 1,
      "fact": "stephenking"
    },
    {
      "q": "Who directed The Shining (1980)?",
      "a": [
        "Stanley Kubrick",
        "Vincent Price",
        "Kenny Ortega",
        "Henry Selick"
      ],
      "correct": 0,
      "fact": "stanleykubrick"
    },
    {
      "q": "What is the name of the mother in the original Friday the 13th?",
      "a": [
        "Pamela Voorhees",
        "Casey Kasem",
        "Ken Page",
        "Gaston Leroux"
      ],
      "correct": 0,
      "fact": "pamelavoorhee"
    },
    {
      "q": "What is the name of the Hogwarts poltergeist?",
      "a": [
        "Peeves",
        "Max Schreck",
        "Elsa Lanchester",
        "Kenny Ortega"
      ],
      "correct": 0,
      "fact": "peeve"
    },
    {
      "q": "What is Nearly Headless Nick's full name?",
      "a": [
        "500th",
        "Pan de muerto",
        "Sir Nicholas de Mimsy-Porpington",
        "Pepita"
      ],
      "correct": 2,
      "fact": "sirnicholasdemimsyporpington"
    },
    {
      "q": "Which Deathday anniversary does Nick celebrate in Chamber of Secrets?",
      "a": [
        "100th",
        "250th",
        "400th",
        "500th"
      ],
      "correct": 3,
      "fact": "500th"
    }
  ]
};
  const halloweenWouldYouRather = [
  [
    "Explore a haunted mansion",
    "Explore a moonlit corn maze"
  ],
  [
    "Wear a vampire costume",
    "Wear a werewolf costume"
  ],
  [
    "Watch Hocus Pocus",
    "Watch The Nightmare Before Christmas"
  ],
  [
    "Take a ghost tour",
    "Visit a haunted attraction"
  ],
  [
    "Carve pumpkins",
    "Decorate your house for Halloween"
  ],
  [
    "Be a friendly ghost",
    "Be a helpful witch"
  ],
  [
    "Eat candy corn",
    "Eat caramel popcorn"
  ],
  [
    "Make a haunted gingerbread house",
    "Make a pumpkin cake"
  ],
  [
    "Dress as Wednesday Addams",
    "Dress as Lydia Deetz"
  ],
  [
    "Ride in the Mystery Machine",
    "Ride in Ecto-1"
  ],
  [
    "Spend Halloween in Salem",
    "Spend Halloween in Sleepy Hollow"
  ],
  [
    "Have a talking black cat",
    "Have a friendly pet bat"
  ],
  [
    "Choose a funny costume",
    "Choose a mysterious costume"
  ],
  [
    "Visit a pumpkin patch at sunrise",
    "Visit a pumpkin patch at sunset"
  ],
  [
    "Paint a pumpkin galaxy",
    "Carve a pumpkin grin"
  ],
  [
    "Have a purple witch hat",
    "Have an orange wizard cloak"
  ],
  [
    "Make paper bats",
    "Make paper ghosts"
  ],
  [
    "Tell ghost stories by a campfire",
    "Watch spooky movies under blankets"
  ],
  [
    "Eat a candy apple",
    "Eat a caramel apple"
  ],
  [
    "Wear a homemade costume",
    "Wear a movie-quality costume"
  ],
  [
    "Host a monster dance party",
    "Host a Halloween trivia night"
  ],
  [
    "Visit Halloween Town",
    "Visit Halloweentown with Marnie"
  ],
  [
    "Be friends with Casper",
    "Be friends with Zero"
  ],
  [
    "Go on a daytime hayride",
    "Go on a lantern-lit hayride"
  ],
  [
    "Decorate with pumpkins",
    "Decorate with friendly ghosts"
  ],
  [
    "Win a costume contest",
    "Win a pumpkin-carving contest"
  ],
  [
    "Make a candy wreath",
    "Make a bat garland"
  ],
  [
    "Have a skeleton gardener",
    "Have a ghost librarian"
  ],
  [
    "Dress as a pirate",
    "Dress as a wizard"
  ],
  [
    "Choose a classic monster movie",
    "Choose a Halloween comedy"
  ],
  [
    "Wear glow-in-the-dark shoes",
    "Carry a glowing pumpkin bucket"
  ],
  [
    "Eat pumpkin cookies",
    "Eat spiderweb brownies"
  ],
  [
    "Help Sally sew a costume",
    "Help Jack decorate Halloween Town"
  ],
  [
    "Solve a mystery with Velma",
    "Find clues with Daphne"
  ],
  [
    "Have Shaggy choose the snacks",
    "Have Scooby choose the movie"
  ],
  [
    "Stay at Hotel Transylvania",
    "Visit the Addams mansion"
  ],
  [
    "Learn a dance from Wednesday",
    "Learn a dance from Frankenstein's monster"
  ],
  [
    "Play Halloween charades",
    "Play Halloween bingo"
  ],
  [
    "Drink warm apple cider",
    "Drink pumpkin hot chocolate"
  ],
  [
    "Decorate your porch orange",
    "Decorate your porch purple"
  ],
  [
    "Be a tiny dragon",
    "Be a giant friendly bat"
  ],
  [
    "Visit a spooky bookstore",
    "Visit a haunted toy shop"
  ],
  [
    "Make a scarecrow",
    "Make a giant paper spider"
  ],
  [
    "Wear a pumpkin hat",
    "Wear a bat cape"
  ],
  [
    "Hear a ghost story",
    "Read a ghost story"
  ],
  [
    "Have a candy treasure map",
    "Have a pumpkin maze map"
  ],
  [
    "Find a secret door in a castle",
    "Find a secret garden behind a graveyard"
  ],
  [
    "Bake witch-hat cupcakes",
    "Bake mummy-shaped pastries"
  ],
  [
    "Go to a costume parade",
    "Go to a lantern parade"
  ],
  [
    "Collect spooky stickers",
    "Collect miniature pumpkins"
  ],
  [
    "Be invisible for Halloween",
    "Fly on a broom for Halloween"
  ],
  [
    "Meet the Sanderson sisters in daylight",
    "Meet Oogie Boogie at a board game"
  ],
  [
    "Sing This Is Halloween",
    "Sing the Ghostbusters theme"
  ],
  [
    "Watch a Halloween musical",
    "Watch a monster mystery"
  ],
  [
    "Wear a group Ghostbusters costume",
    "Wear a group Addams Family costume"
  ],
  [
    "Give out chocolate treats",
    "Give out fruity treats"
  ],
  [
    "Give out Halloween pencils",
    "Give out Halloween stickers"
  ],
  [
    "Have a pumpkin coach",
    "Have a friendly ghost taxi"
  ],
  [
    "Spend a night in a pretend castle",
    "Spend a night in a Halloween treehouse"
  ],
  [
    "Decorate with cobwebs",
    "Decorate with floating candles"
  ],
  [
    "Make a stop-motion monster film",
    "Make a Halloween comic strip"
  ],
  [
    "Dress as a scarecrow",
    "Dress as a jack-o'-lantern"
  ],
  [
    "Have candy-flavored popcorn",
    "Have pumpkin-spice popcorn"
  ],
  [
    "Wear a mask you painted",
    "Wear face paint you designed"
  ],
  [
    "Have a raven deliver invitations",
    "Have an owl deliver invitations"
  ],
  [
    "Find a friendly ghost in your attic",
    "Find a tiny witch in your garden"
  ],
  [
    "Take a spooky train ride",
    "Take a haunted boat ride"
  ],
  [
    "Explore a maze of mirrors",
    "Explore a maze of pumpkins"
  ],
  [
    "Watch Casper",
    "Watch Hotel Transylvania"
  ],
  [
    "Watch Coraline",
    "Watch ParaNorman"
  ],
  [
    "Watch Corpse Bride",
    "Watch Frankenweenie"
  ],
  [
    "Read Dracula",
    "Read Frankenstein"
  ],
  [
    "Read a Scooby-Doo comic",
    "Read a Goosebumps book"
  ],
  [
    "Have a bookshelf that whispers stories",
    "Have a portrait that tells jokes"
  ],
  [
    "Build a LEGO haunted house",
    "Build a cardboard haunted castle"
  ],
  [
    "Take Halloween photos at a pumpkin patch",
    "Take Halloween photos at a foggy bridge"
  ],
  [
    "Eat a chocolate ghost",
    "Eat a marshmallow mummy"
  ],
  [
    "Try a Halloween escape room",
    "Try a Halloween scavenger hunt"
  ],
  [
    "Make orange slime",
    "Make purple slime"
  ],
  [
    "Wear a full skeleton costume",
    "Wear a glowing ghost costume"
  ],
  [
    "Have a silly Halloween ringtone",
    "Have a spooky Halloween wallpaper"
  ],
  [
    "Choose a cat-shaped pumpkin",
    "Choose a bat-shaped pumpkin"
  ],
  [
    "Make a witch's potion with juice",
    "Make a monster sundae"
  ],
  [
    "Wear a red vampire cape",
    "Wear a silver werewolf jacket"
  ],
  [
    "Decorate a Halloween window",
    "Decorate a Halloween doorway"
  ],
  [
    "Have a haunted jukebox",
    "Have a magical player piano"
  ],
  [
    "See the Great Pumpkin",
    "See a friendly dragon"
  ],
  [
    "Help Linus wait for the Great Pumpkin",
    "Help Snoopy plan a Halloween adventure"
  ],
  [
    "Have a broom that cleans itself",
    "Have a cauldron that cooks soup"
  ],
  [
    "Make pumpkin soup",
    "Make pumpkin bread"
  ],
  [
    "Celebrate at a fall fair",
    "Celebrate at a costume picnic"
  ],
  [
    "Be a detective in a monster town",
    "Be a tour guide in a haunted castle"
  ],
  [
    "Have a ghost help with chores",
    "Have a witch help with homework"
  ],
  [
    "Win a giant chocolate pumpkin",
    "Win a year of Halloween movie nights"
  ],
  [
    "Decorate one enormous pumpkin",
    "Decorate twenty tiny pumpkins"
  ],
  [
    "Wear a black-and-orange costume",
    "Wear a purple-and-green costume"
  ],
  [
    "Host a Halloween breakfast",
    "Host a Halloween midnight snack party"
  ],
  [
    "Play Monster Mash on repeat",
    "Play Thriller on repeat"
  ],
  [
    "Learn stage makeup for monsters",
    "Learn sound effects for ghost stories"
  ],
  [
    "See a Halloween puppet show",
    "See a Halloween magic show"
  ],
  [
    "Build a friendly haunted robot",
    "Build a glowing pumpkin robot"
  ],
  [
    "Visit a museum of movie monsters",
    "Visit a museum of Halloween costumes"
  ],
  [
    "Find a glowing crystal in a cave",
    "Find a spell book in a library"
  ],
  [
    "Have a pumpkin-shaped backpack",
    "Have a coffin-shaped pencil case"
  ],
  [
    "Make a bat mobile",
    "Make a ghost wind chime"
  ],
  [
    "Design Halloween wrapping paper",
    "Design Halloween postcards"
  ],
  [
    "Wear a costume with wings",
    "Wear a costume with a tail"
  ],
  [
    "Have orange hair for Halloween",
    "Have purple hair for Halloween"
  ],
  [
    "Tour a castle with a vampire guide",
    "Tour a forest with a werewolf guide"
  ],
  [
    "Be the hero in a ghost story",
    "Be the funny sidekick in a monster movie"
  ],
  [
    "Pick the Halloween playlist",
    "Pick the Halloween snacks"
  ],
  [
    "Create a spooky board game",
    "Create a spooky card game"
  ],
  [
    "Make a jack-o'-lantern snow globe",
    "Make a haunted-house diorama"
  ],
  [
    "Have an enchanted umbrella",
    "Have enchanted rain boots"
  ],
  [
    "Grow blue pumpkins",
    "Grow striped pumpkins"
  ],
  [
    "Eat candy from a treasure chest",
    "Eat candy from a witch's cauldron"
  ],
  [
    "Meet Frankenstein's monster at a bakery",
    "Meet Dracula at a library"
  ],
  [
    "Help the Mummy wrap gifts",
    "Help the Wolf Man brush his fur"
  ],
  [
    "Have a pet spider that knits",
    "Have a pet bat that sings"
  ],
  [
    "Go to a monster bowling night",
    "Go to a monster mini-golf night"
  ],
  [
    "Decorate with smiling skeletons",
    "Decorate with shy ghosts"
  ],
  [
    "Travel through a magic mirror",
    "Travel through a glowing pumpkin door"
  ],
  [
    "Have a vampire's fashion sense",
    "Have a witch's herb garden"
  ],
  [
    "Make a Halloween playlist for a road trip",
    "Make a Halloween playlist for a party"
  ],
  [
    "Dress as a vintage movie monster",
    "Dress as a futuristic space ghost"
  ],
  [
    "Try pumpkin ice cream",
    "Try candy-corn ice cream"
  ],
  [
    "Create a tiny cemetery scene",
    "Create a tiny witch village"
  ],
  [
    "Watch spooky cartoons in pajamas",
    "Watch monster movies in costume"
  ],
  [
    "Have a pumpkin lantern that changes colors",
    "Have a ghost lantern that floats"
  ],
  [
    "Decorate a bike for Halloween",
    "Decorate a wagon for Halloween"
  ],
  [
    "Wear a costume with a secret pocket",
    "Wear a costume with glowing buttons"
  ],
  [
    "Solve a riddle from a ghost",
    "Solve a puzzle from a witch"
  ],
  [
    "Have a friendly gargoyle guard your garden",
    "Have a scarecrow welcome your guests"
  ],
  [
    "Collect Halloween snow globes",
    "Collect Halloween mugs"
  ],
  [
    "Make spider-shaped sandwiches",
    "Make pumpkin-shaped pancakes"
  ],
  [
    "Spend Halloween at Hogwarts",
    "Spend Halloween at Nevermore Academy"
  ],
  [
    "Practice a Patronus charm",
    "Practice a levitating pumpkin charm"
  ],
  [
    "Meet Nearly Headless Nick",
    "Meet Moaning Myrtle"
  ],
  [
    "Have a Hogwarts feast",
    "Have a Sanderson-sisters tea party"
  ],
  [
    "Ride a thestral in a story",
    "Ride a hippogriff in a story"
  ],
  [
    "Choose a witch-themed escape room",
    "Choose a vampire-themed escape room"
  ],
  [
    "Wear a classic bedsheet ghost costume",
    "Wear an elaborate haunted portrait costume"
  ],
  [
    "Have a ghost teach you piano",
    "Have a skeleton teach you drums"
  ],
  [
    "Decorate cupcakes as eyeballs",
    "Decorate cookies as bats"
  ],
  [
    "Watch a spooky movie at a drive-in",
    "Watch a spooky movie in a cozy den"
  ],
  [
    "Build a Halloween blanket fort",
    "Build a Halloween pillow castle"
  ],
  [
    "Have a Halloween photo booth",
    "Have a Halloween karaoke booth"
  ],
  [
    "Learn to draw monsters",
    "Learn to sculpt pumpkins"
  ],
  [
    "Make pumpkin earrings",
    "Make a bat bow tie"
  ],
  [
    "Win the funniest costume award",
    "Win the most creative costume award"
  ],
  [
    "Host a pumpkin-painting afternoon",
    "Host a Halloween baking afternoon"
  ],
  [
    "Make a family-friendly haunted trail",
    "Make a Halloween obstacle course"
  ],
  [
    "Have a candy bowl that tells jokes",
    "Have a doorbell that says Boo"
  ],
  [
    "Choose a foggy graveyard movie setting",
    "Choose a stormy castle movie setting"
  ],
  [
    "Have a spooky cat companion",
    "Have a silly zombie companion"
  ],
  [
    "Dance with the Addams Family",
    "Sing with the Ghostbusters"
  ],
  [
    "Borrow Wednesday's umbrella",
    "Borrow Morticia's gardening tools"
  ],
  [
    "Plan a Halloween picnic with Gomez",
    "Plan a Halloween party with Fester"
  ],
  [
    "Have Thing help carve pumpkins",
    "Have Lurch help carry decorations"
  ],
  [
    "Solve a mystery with Fred",
    "Share snacks with Shaggy"
  ],
  [
    "Wear Scooby-Doo pajamas",
    "Wear Ghostbusters pajamas"
  ],
  [
    "Own a miniature Ecto-1",
    "Own a miniature Mystery Machine"
  ],
  [
    "Make a Stay Puft cake",
    "Make an Oogie Boogie cake"
  ],
  [
    "Have Slimer taste-test your snacks",
    "Have Casper greet your guests"
  ],
  [
    "Visit a Halloween market",
    "Visit a Halloween craft fair"
  ],
  [
    "Read spooky poetry aloud",
    "Act out a Halloween radio play"
  ],
  [
    "Make a Halloween shadow-puppet show",
    "Make a Halloween flipbook"
  ],
  [
    "Have magical candles that never melt",
    "Have magical pumpkins that never rot"
  ],
  [
    "Bake a haunted-castle cake",
    "Bake a pumpkin-patch pie"
  ],
  [
    "Choose an old-fashioned Halloween postcard",
    "Choose a hand-drawn Halloween poster"
  ],
  [
    "Wear a moon-themed costume",
    "Wear a starry witch costume"
  ],
  [
    "Go to a Halloween roller rink",
    "Go to a Halloween dance hall"
  ],
  [
    "Have a bat-shaped kite",
    "Have a pumpkin-shaped balloon"
  ],
  [
    "Learn about Halloween traditions",
    "Learn about monster-movie effects"
  ],
  [
    "Tour a real historic cemetery by day",
    "Tour a movie-set graveyard by night"
  ],
  [
    "Carve a cat silhouette",
    "Carve a castle silhouette"
  ],
  [
    "Make spooky origami",
    "Make spooky bead art"
  ],
  [
    "Have a glowing spiderweb ceiling",
    "Have a starry Halloween ceiling"
  ],
  [
    "Play Halloween word games",
    "Play Halloween picture puzzles"
  ],
  [
    "Create a monster trading card",
    "Create a witch character sheet"
  ],
  [
    "Host a spooky soup supper",
    "Host a Halloween dessert swap"
  ],
  [
    "Have a vampire pen pal",
    "Have a ghost pen pal"
  ],
  [
    "Explore a friendly haunted lighthouse",
    "Explore a friendly haunted train station"
  ],
  [
    "Find a witch's recipe box",
    "Find a vampire's travel diary"
  ],
  [
    "Have a houseplant that says Boo",
    "Have a pumpkin that tells riddles"
  ],
  [
    "Choose a monster-themed puzzle",
    "Choose a haunted-house puzzle"
  ],
  [
    "Decorate pumpkins with stickers",
    "Decorate pumpkins with paint pens"
  ],
  [
    "Make a Halloween comic about a bat",
    "Make a Halloween comic about a pumpkin"
  ],
  [
    "Walk a lantern trail",
    "Walk a decorated neighborhood"
  ],
  [
    "Wear a werewolf hoodie",
    "Wear a vampire velvet jacket"
  ],
  [
    "Make paper-chain skeletons",
    "Make tissue-paper ghosts"
  ],
  [
    "Find candy in a pirate chest",
    "Find candy in a wizard's drawer"
  ],
  [
    "Pick a pumpkin by its shape",
    "Pick a pumpkin by its color"
  ],
  [
    "Have a ghost dog like Zero",
    "Have a reanimated dog like Sparky"
  ],
  [
    "Bring a pumpkin pie to a party",
    "Bring monster cookies to a party"
  ],
  [
    "See a silent horror movie with live music",
    "See a Halloween cartoon with an orchestra"
  ],
  [
    "Have the best Halloween costume",
    "Have the best Halloween decorations"
  ],
  [
    "Finish a corn maze with friends",
    "Finish a Halloween puzzle with family"
  ],
  [
    "Celebrate Halloween with a big party",
    "Celebrate Halloween with a cozy movie night"
  ],
  [
    "Create a Halloween treasure hunt",
    "Create a Halloween mystery dinner"
  ]
];
  const halloweenScrambles = [
  {
    "word": "HALLOWEEN",
    "scramble": "NLAOELEWH",
    "hint": "October 31 celebration"
  },
  {
    "word": "PUMPKIN",
    "scramble": "PIMPUNK",
    "hint": "Orange fruit carved in October"
  },
  {
    "word": "VAMPIRE",
    "scramble": "PAIVREM",
    "hint": "Fanged monster of folklore"
  },
  {
    "word": "WEREWOLF",
    "scramble": "WOEFLREW",
    "hint": "Person who becomes a wolf"
  },
  {
    "word": "SKELETON",
    "scramble": "OEKELNST",
    "hint": "A framework of bones"
  },
  {
    "word": "ZOMBIE",
    "scramble": "MOIZEB",
    "hint": "Walking undead movie creature"
  },
  {
    "word": "WITCH",
    "scramble": "TCIWH",
    "hint": "A Halloween spell caster"
  },
  {
    "word": "GHOST",
    "scramble": "TGOHS",
    "hint": "A spooky spirit"
  },
  {
    "word": "SPIDER",
    "scramble": "PEDRSI",
    "hint": "Eight-legged web maker"
  },
  {
    "word": "COBWEB",
    "scramble": "EWCBOB",
    "hint": "An old spider web"
  },
  {
    "word": "CAULDRON",
    "scramble": "ARCNOUDL",
    "hint": "A witch's bubbling pot"
  },
  {
    "word": "BROOMSTICK",
    "scramble": "ITKMSCBROO",
    "hint": "A witch's flying transport"
  },
  {
    "word": "COSTUME",
    "scramble": "TCEUMSO",
    "hint": "An outfit for dressing up"
  },
  {
    "word": "CANDY",
    "scramble": "NYCDA",
    "hint": "Sweet trick-or-treat prize"
  },
  {
    "word": "MUMMY",
    "scramble": "YMMUM",
    "hint": "A wrapped tomb monster"
  },
  {
    "word": "BAT",
    "scramble": "ABT",
    "hint": "Winged mammal of Halloween imagery"
  },
  {
    "word": "TOMBSTONE",
    "scramble": "BTOOTESMN",
    "hint": "A grave marker"
  },
  {
    "word": "CEMETERY",
    "scramble": "RYMECETE",
    "hint": "A burial ground"
  },
  {
    "word": "HAUNTED",
    "scramble": "EDTNUAH",
    "hint": "Said to have ghosts"
  },
  {
    "word": "TRICKORTREAT",
    "scramble": "EOITRCTRKART",
    "hint": "The doorstep Halloween greeting"
  },
  {
    "word": "JACKOLANTERN",
    "scramble": "OEJALACNNKTR",
    "hint": "A glowing carved pumpkin"
  },
  {
    "word": "CANDYCORN",
    "scramble": "AYCDRCONN",
    "hint": "Triangular yellow-orange-white candy"
  },
  {
    "word": "SCARECROW",
    "scramble": "WRCASOCER",
    "hint": "A field guardian made of straw"
  },
  {
    "word": "CORNMAZE",
    "scramble": "CNEZORAM",
    "hint": "Twisting paths through a crop"
  },
  {
    "word": "HAYRIDE",
    "scramble": "EDRIAHY",
    "hint": "A harvest wagon outing"
  },
  {
    "word": "BLACKCAT",
    "scramble": "ACBKCTLA",
    "hint": "A witch's feline companion"
  },
  {
    "word": "FULLMOON",
    "scramble": "LFNLUOMO",
    "hint": "Round nighttime sky associated with werewolves"
  },
  {
    "word": "SANDERSON",
    "scramble": "ENRSSDNOA",
    "hint": "The Hocus Pocus sisters' surname"
  },
  {
    "word": "CASPER",
    "scramble": "CRPSEA",
    "hint": "The friendly ghost"
  },
  {
    "word": "WEDNESDAY",
    "scramble": "DDYWEESNA",
    "hint": "The Addams daughter"
  },
  {
    "word": "THING",
    "scramble": "NHITG",
    "hint": "The Addams family's helpful hand"
  },
  {
    "word": "LURCH",
    "scramble": "LRCUH",
    "hint": "The Addams family's butler"
  },
  {
    "word": "SCOOBYDOO",
    "scramble": "SDCYBOOOO",
    "hint": "Mystery-solving Great Dane"
  },
  {
    "word": "GHOSTFACE",
    "scramble": "TFESCHGAO",
    "hint": "Masked character in Scream"
  },
  {
    "word": "MICHAELMYERS",
    "scramble": "EIAELCHMYSMR",
    "hint": "Halloween's masked antagonist"
  },
  {
    "word": "FREDDYKRUEGER",
    "scramble": "ERDEGRRDKYEFU",
    "hint": "Elm Street's dream villain"
  },
  {
    "word": "JASONVOORHEES",
    "scramble": "SAOSNOERHOJVE",
    "hint": "A Friday the 13th character"
  },
  {
    "word": "PENNYWISE",
    "scramble": "YINSNEWPE",
    "hint": "The clown in It"
  },
  {
    "word": "BEETLEJUICE",
    "scramble": "JEEUETCLIBE",
    "hint": "A mischievous film bio-exorcist"
  },
  {
    "word": "SKELLINGTON",
    "scramble": "GLEKNSTINOL",
    "hint": "The Pumpkin King's surname"
  },
  {
    "word": "OOGIEBOOGIE",
    "scramble": "GOIOOOGEBEI",
    "hint": "Halloween Town's burlap villain"
  },
  {
    "word": "SAMHAIN",
    "scramble": "MINHASA",
    "hint": "Celtic festival linked to Halloween"
  },
  {
    "word": "TURNIP",
    "scramble": "RNIPUT",
    "hint": "Traditional Irish lantern vegetable"
  },
  {
    "word": "MARIGOLD",
    "scramble": "DMRGIAOL",
    "hint": "Orange Day of the Dead flower"
  },
  {
    "word": "GHOSTBUSTERS",
    "scramble": "HSSTGSOTURBE",
    "hint": "Proton-pack ghost-catching team"
  },
  {
    "word": "FRANKENSTEIN",
    "scramble": "NKFSAENETNRI",
    "hint": "Mary Shelley's scientist"
  },
  {
    "word": "DRACULA",
    "scramble": "AUCDLAR",
    "hint": "Bram Stoker's vampire count"
  },
  {
    "word": "SLEEPYHOLLOW",
    "scramble": "YEWLEPLOSLHO",
    "hint": "Home of the Headless Horseman legend"
  },
  {
    "word": "OVERLOOK",
    "scramble": "KVELOOOR",
    "hint": "The Shining's hotel"
  },
  {
    "word": "WOODSBORO",
    "scramble": "SOORWDOBO",
    "hint": "The original Scream's town"
  },
  {
    "word": "HADDONFIELD",
    "scramble": "DODLHADNIFE",
    "hint": "Halloween's fictional Illinois town"
  },
  {
    "word": "CRYSTALLAKE",
    "scramble": "TLYACELSKAR",
    "hint": "Friday the 13th camp location"
  },
  {
    "word": "ELMSTREET",
    "scramble": "RTTESELEM",
    "hint": "Freddy's nightmare address"
  },
  {
    "word": "THRILLER",
    "scramble": "ELRILTRH",
    "hint": "Michael Jackson's spooky dance hit"
  },
  {
    "word": "MONSTERMASH",
    "scramble": "NSEMSOTAHMR",
    "hint": "Bobby Pickett's monster dance song"
  },
  {
    "word": "TIMEWARP",
    "scramble": "ETMIAPWR",
    "hint": "Rocky Horror's famous dance"
  },
  {
    "word": "UPSIDEDOWN",
    "scramble": "WUDNPSODEI",
    "hint": "Stranger Things' eerie other dimension"
  },
  {
    "word": "BLACKFLAME",
    "scramble": "CFBLKELAAM",
    "hint": "The magical candle's unusual fire"
  },
  {
    "word": "WINIFRED",
    "scramble": "DNWRFIIE",
    "hint": "The eldest Sanderson sister"
  },
  {
    "word": "SARAH",
    "scramble": "HASRA",
    "hint": "The blonde Sanderson sister"
  },
  {
    "word": "MARY",
    "scramble": "YMRA",
    "hint": "The Sanderson sister played by Kathy Najimy"
  },
  {
    "word": "THACKERYBINX",
    "scramble": "BHYINXTRAEKC",
    "hint": "Hocus Pocus's enchanted black cat"
  },
  {
    "word": "BILLYBUTCHERSON",
    "scramble": "OINLYLRECBSTHUB",
    "hint": "Hocus Pocus's awakened cemetery resident"
  },
  {
    "word": "DENNISON",
    "scramble": "IONNSDNE",
    "hint": "Max and Dani's surname"
  },
  {
    "word": "ALLISON",
    "scramble": "AINLSOL",
    "hint": "Max's crush in Hocus Pocus"
  },
  {
    "word": "DANI",
    "scramble": "DINA",
    "hint": "Max's younger sister"
  },
  {
    "word": "SALEM",
    "scramble": "LMESA",
    "hint": "Massachusetts setting of Hocus Pocus"
  },
  {
    "word": "SPELLBOOK",
    "scramble": "KPSOLBELO",
    "hint": "A witch's written collection of magic"
  },
  {
    "word": "SALLY",
    "scramble": "SYLLA",
    "hint": "Halloween Town's rag-doll heroine"
  },
  {
    "word": "ZERO",
    "scramble": "ZROE",
    "hint": "Jack Skellington's ghost dog"
  },
  {
    "word": "FINKELSTEIN",
    "scramble": "IKLNIFEENST",
    "hint": "Sally's creator"
  },
  {
    "word": "LOCK",
    "scramble": "KCOL",
    "hint": "One of Oogie's three trick-or-treaters"
  },
  {
    "word": "SHOCK",
    "scramble": "HOKSC",
    "hint": "The witch-costumed trick-or-treater"
  },
  {
    "word": "BARREL",
    "scramble": "ERRLBA",
    "hint": "The skeleton-costumed trick-or-treater"
  },
  {
    "word": "SANDYCLAWS",
    "scramble": "SADACNYLSW",
    "hint": "Jack's name for Santa"
  },
  {
    "word": "PUMPKINKING",
    "scramble": "NNPKUGMKIIP",
    "hint": "Jack Skellington's royal title"
  },
  {
    "word": "RAGDOLL",
    "scramble": "ODGALLR",
    "hint": "Sally's kind of stitched toy"
  },
  {
    "word": "MORTICIA",
    "scramble": "ORICMTIA",
    "hint": "The Addams mother"
  },
  {
    "word": "GOMEZ",
    "scramble": "EZOGM",
    "hint": "The Addams father"
  },
  {
    "word": "PUGSLEY",
    "scramble": "GYEULSP",
    "hint": "Wednesday's brother"
  },
  {
    "word": "FESTER",
    "scramble": "FEETRS",
    "hint": "The bulb-lighting Addams uncle"
  },
  {
    "word": "COUSINITT",
    "scramble": "STIUONCTI",
    "hint": "The hairy Addams relative"
  },
  {
    "word": "PUBERT",
    "scramble": "REBUPT",
    "hint": "The Addams baby"
  },
  {
    "word": "GRANDMAMA",
    "scramble": "DMGANRAMA",
    "hint": "The Addams family elder"
  },
  {
    "word": "NEVERMORE",
    "scramble": "MEREENVOR",
    "hint": "Wednesday's academy"
  },
  {
    "word": "NIGHTSHADE",
    "scramble": "AGSIDETNHH",
    "hint": "A poisonous plant with a spooky name"
  },
  {
    "word": "SHAGGY",
    "scramble": "ASGYGH",
    "hint": "Scooby's hungry best friend"
  },
  {
    "word": "VELMA",
    "scramble": "ELMVA",
    "hint": "The orange-sweater detective"
  },
  {
    "word": "DAPHNE",
    "scramble": "NEPDAH",
    "hint": "The purple-clad detective"
  },
  {
    "word": "FRED",
    "scramble": "RFED",
    "hint": "The ascot-wearing detective"
  },
  {
    "word": "MYSTERYMACHINE",
    "scramble": "TAEYCERMSHIMYN",
    "hint": "Mystery Inc.'s van"
  },
  {
    "word": "SCOOBYSNACKS",
    "scramble": "NSCBSYSOAOCK",
    "hint": "Treats for a mystery-solving dog"
  },
  {
    "word": "JINKIES",
    "scramble": "SEJNIIK",
    "hint": "Velma's famous exclamation"
  },
  {
    "word": "ZOINKS",
    "scramble": "KSIOZN",
    "hint": "Shaggy's startled exclamation"
  },
  {
    "word": "NORVILLE",
    "scramble": "OELRLVNI",
    "hint": "Shaggy's first name"
  },
  {
    "word": "DINKLEY",
    "scramble": "EYDNIKL",
    "hint": "Velma's surname"
  },
  {
    "word": "SCRAPPYDOO",
    "scramble": "OSRAOPYPCD",
    "hint": "Scooby's small nephew"
  },
  {
    "word": "SLIMER",
    "scramble": "ELIRMS",
    "hint": "A green Ghostbusters ghost"
  },
  {
    "word": "STAYPUFT",
    "scramble": "APUYTFTS",
    "hint": "The marshmallow mascot"
  },
  {
    "word": "PROTONPACK",
    "scramble": "TPOPKCANRO",
    "hint": "A Ghostbuster's backpack equipment"
  },
  {
    "word": "ECTOONE",
    "scramble": "ONOEETC",
    "hint": "The Ghostbusters vehicle, spelled out"
  },
  {
    "word": "VENKMAN",
    "scramble": "MKNAEVN",
    "hint": "Bill Murray's Ghostbuster"
  },
  {
    "word": "STANTZ",
    "scramble": "NSAZTT",
    "hint": "Dan Aykroyd's Ghostbuster"
  },
  {
    "word": "SPENGLER",
    "scramble": "NSEGPLRE",
    "hint": "Harold Ramis's Ghostbuster"
  },
  {
    "word": "ZEDDEMORE",
    "scramble": "ZRDEMDOEE",
    "hint": "Ernie Hudson's Ghostbuster"
  },
  {
    "word": "JANINE",
    "scramble": "AJINNE",
    "hint": "Ghostbusters receptionist"
  },
  {
    "word": "GOZER",
    "scramble": "GZROE",
    "hint": "A supernatural Ghostbusters antagonist"
  },
  {
    "word": "VIGO",
    "scramble": "IVGO",
    "hint": "Ghostbusters II's painting villain"
  },
  {
    "word": "MOODSLIME",
    "scramble": "SEOOMIMDL",
    "hint": "Emotion-responsive Ghostbusters II substance"
  },
  {
    "word": "GHOSTTRAP",
    "scramble": "PTSAGORTH",
    "hint": "A device to contain a captured spirit"
  },
  {
    "word": "HOGWARTS",
    "scramble": "RGAHTOWS",
    "hint": "A school with ghosts and moving stairs"
  },
  {
    "word": "BOGGART",
    "scramble": "GOBGART",
    "hint": "A creature shaped by your fears"
  },
  {
    "word": "RIDDIKULUS",
    "scramble": "ULRISDDUKI",
    "hint": "The boggart-banishing charm"
  },
  {
    "word": "DEMENTOR",
    "scramble": "DOTNREEM",
    "hint": "A happiness-draining magical creature"
  },
  {
    "word": "PATRONUS",
    "scramble": "STUANOPR",
    "hint": "A magical guardian against Dementors"
  },
  {
    "word": "THESTRAL",
    "scramble": "RLESTATH",
    "hint": "A winged horse seen by some Hogwarts students"
  },
  {
    "word": "BASILISK",
    "scramble": "KIISALSB",
    "hint": "The Chamber of Secrets serpent"
  },
  {
    "word": "ARAGOG",
    "scramble": "OGRAAG",
    "hint": "Hagrid's enormous spider friend"
  },
  {
    "word": "ACROMANTULA",
    "scramble": "UNCOALTARMA",
    "hint": "A giant magical spider species"
  },
  {
    "word": "FLUFFY",
    "scramble": "FUFYLF",
    "hint": "A three-headed Hogwarts dog"
  },
  {
    "word": "PEEVES",
    "scramble": "VEEESP",
    "hint": "The Hogwarts poltergeist"
  },
  {
    "word": "MOANINGMYRTLE",
    "scramble": "IEYOATNMGLNMR",
    "hint": "A ghost in a Hogwarts bathroom"
  },
  {
    "word": "DEATHDAY",
    "scramble": "DHDEYATA",
    "hint": "A ghost's anniversary party"
  },
  {
    "word": "NICK",
    "scramble": "KICN",
    "hint": "The nearly headless Hogwarts ghost"
  },
  {
    "word": "LUPIN",
    "scramble": "INULP",
    "hint": "A Hogwarts professor who is a werewolf"
  },
  {
    "word": "LUMOS",
    "scramble": "MOLSU",
    "hint": "The wand-lighting charm"
  },
  {
    "word": "NOX",
    "scramble": "ONX",
    "hint": "The charm that extinguishes wand light"
  },
  {
    "word": "DOBBY",
    "scramble": "BDOYB",
    "hint": "A friendly house-elf"
  },
  {
    "word": "HEDWIG",
    "scramble": "EIDWHG",
    "hint": "Harry's snowy owl"
  },
  {
    "word": "AZKABAN",
    "scramble": "ANKAAZB",
    "hint": "A prison once guarded by Dementors"
  },
  {
    "word": "POTION",
    "scramble": "IOONPT",
    "hint": "A magical brewed mixture"
  },
  {
    "word": "MANDRAKE",
    "scramble": "AKANRDME",
    "hint": "A magical plant with a dangerous cry"
  },
  {
    "word": "FANG",
    "scramble": "GANF",
    "hint": "Hagrid's large dog"
  },
  {
    "word": "FORBIDDENFOREST",
    "scramble": "OROIFESDFTBRDNE",
    "hint": "The woods beside Hogwarts"
  },
  {
    "word": "DARKARTS",
    "scramble": "RATRKSDA",
    "hint": "Sinister magic studied defensively"
  },
  {
    "word": "TRANSYLVANIA",
    "scramble": "TIYNRNLAAASV",
    "hint": "Dracula's legendary region"
  },
  {
    "word": "NOSFERATU",
    "scramble": "NASOURETF",
    "hint": "A classic silent vampire film"
  },
  {
    "word": "ORLOK",
    "scramble": "KOLRO",
    "hint": "The vampire count in Nosferatu"
  },
  {
    "word": "IMHOTEP",
    "scramble": "EOIHTMP",
    "hint": "The Mummy's ancient priest"
  },
  {
    "word": "GILLMAN",
    "scramble": "MALINGL",
    "hint": "The Black Lagoon creature"
  },
  {
    "word": "WOLFMAN",
    "scramble": "FWNOALM",
    "hint": "Universal's lycanthrope monster"
  },
  {
    "word": "INVISIBLEMAN",
    "scramble": "SMIEBNIAVLIN",
    "hint": "H. G. Wells's unseen character"
  },
  {
    "word": "PHANTOM",
    "scramble": "TOAPNHM",
    "hint": "The opera's mysterious masked figure"
  },
  {
    "word": "JEKYLL",
    "scramble": "LYLJKE",
    "hint": "The doctor with a dangerous alter ego"
  },
  {
    "word": "HYDE",
    "scramble": "HDYE",
    "hint": "Dr. Jekyll's other identity"
  },
  {
    "word": "CARMILLA",
    "scramble": "LACAMIRL",
    "hint": "Sheridan Le Fanu's vampire novella"
  },
  {
    "word": "RUTHVEN",
    "scramble": "NRHETVU",
    "hint": "The vampire lord in The Vampyre"
  },
  {
    "word": "BANSHEE",
    "scramble": "ESHNBEA",
    "hint": "An Irish wailing spirit"
  },
  {
    "word": "DULLAHAN",
    "scramble": "LUHNALAD",
    "hint": "An Irish headless rider"
  },
  {
    "word": "POLTERGEIST",
    "scramble": "ESPOTLIRTEG",
    "hint": "A noisy, object-moving spirit"
  },
  {
    "word": "GARGOYLE",
    "scramble": "GLAEOYGR",
    "hint": "A carved stone creature on a building"
  },
  {
    "word": "GRIFFIN",
    "scramble": "NIFRFGI",
    "hint": "A lion-and-eagle creature"
  },
  {
    "word": "CENTAUR",
    "scramble": "URNACTE",
    "hint": "A human-and-horse creature"
  },
  {
    "word": "MEDUSA",
    "scramble": "UADSEM",
    "hint": "A figure with snakes for hair"
  },
  {
    "word": "KRAKEN",
    "scramble": "KANKER",
    "hint": "A legendary sea monster"
  },
  {
    "word": "KELPIE",
    "scramble": "KEILPE",
    "hint": "A Scottish water horse"
  },
  {
    "word": "BROWNIE",
    "scramble": "WENBORI",
    "hint": "A household spirit in Scottish folklore"
  },
  {
    "word": "KITSUNE",
    "scramble": "NKSEITU",
    "hint": "A Japanese fox spirit"
  },
  {
    "word": "TENGU",
    "scramble": "EUNTG",
    "hint": "A Japanese mountain spirit"
  },
  {
    "word": "YUREI",
    "scramble": "ERUYI",
    "hint": "A Japanese ghost"
  },
  {
    "word": "BABAYAGA",
    "scramble": "AAGABABY",
    "hint": "A witch with a chicken-legged hut"
  },
  {
    "word": "BLACKSHUCK",
    "scramble": "CKBUCSLKAH",
    "hint": "East Anglia's spectral black dog"
  },
  {
    "word": "WILLOWISP",
    "scramble": "OIILWLWSP",
    "hint": "A mysterious marsh light"
  },
  {
    "word": "MOTHMAN",
    "scramble": "AMHTMON",
    "hint": "Point Pleasant's winged cryptid"
  },
  {
    "word": "CHUPACABRA",
    "scramble": "CRAHAABCUP",
    "hint": "A legendary creature of the Americas"
  },
  {
    "word": "GOBLIN",
    "scramble": "ILGONB",
    "hint": "A mischievous folklore creature"
  },
  {
    "word": "TROLL",
    "scramble": "LLORT",
    "hint": "A lumbering creature of stories"
  },
  {
    "word": "OGRE",
    "scramble": "GEOR",
    "hint": "A giant fairy-tale monster"
  },
  {
    "word": "GREMLIN",
    "scramble": "ERGNIML",
    "hint": "A mischievous creature blamed for breakdowns"
  },
  {
    "word": "IMP",
    "scramble": "PIM",
    "hint": "A tiny mischievous spirit"
  },
  {
    "word": "SPRITE",
    "scramble": "SEITRP",
    "hint": "A small fairy-like spirit"
  },
  {
    "word": "SPECTER",
    "scramble": "PETSRCE",
    "hint": "Another word for a ghost"
  },
  {
    "word": "PHANTASM",
    "scramble": "TNAHAMPS",
    "hint": "A ghostly apparition"
  },
  {
    "word": "APPARITION",
    "scramble": "PIIATONPAR",
    "hint": "A supernatural appearance"
  },
  {
    "word": "WRAITH",
    "scramble": "TIHAWR",
    "hint": "A ghostlike figure"
  },
  {
    "word": "REVENANT",
    "scramble": "EENVNART",
    "hint": "One who returns from the dead in folklore"
  },
  {
    "word": "FAMILIAR",
    "scramble": "IALFAIMR",
    "hint": "A witch's animal companion"
  },
  {
    "word": "ENCHANTMENT",
    "scramble": "TNEAEMTCHNN",
    "hint": "A magical influence or spell"
  },
  {
    "word": "HEX",
    "scramble": "HXE",
    "hint": "A short word for a spell or curse"
  },
  {
    "word": "CHARM",
    "scramble": "MCARH",
    "hint": "A small spell or magical protection"
  },
  {
    "word": "INCANTATION",
    "scramble": "NATINNTAOCI",
    "hint": "Words spoken to cast magic"
  },
  {
    "word": "SORCERY",
    "scramble": "RRYESOC",
    "hint": "The practice of magic"
  },
  {
    "word": "WIZARD",
    "scramble": "WDIZRA",
    "hint": "A learned fictional magic user"
  },
  {
    "word": "WARLOCK",
    "scramble": "WARCLOK",
    "hint": "A male spell caster in fiction"
  },
  {
    "word": "ALCHEMY",
    "scramble": "LMAYEHC",
    "hint": "An old practice of magical transformation"
  },
  {
    "word": "AMULET",
    "scramble": "UTLAME",
    "hint": "An object worn for protection"
  },
  {
    "word": "TALISMAN",
    "scramble": "SNILAMTA",
    "hint": "An object believed to bring magical help"
  },
  {
    "word": "CRYSTALBALL",
    "scramble": "TSAYLLCBLRA",
    "hint": "A fortune-teller's sphere"
  },
  {
    "word": "TAROT",
    "scramble": "OTART",
    "hint": "A deck used in fortune-telling"
  },
  {
    "word": "RUNES",
    "scramble": "SUNRE",
    "hint": "Symbols on a fantasy spell tablet"
  },
  {
    "word": "MOONSTONE",
    "scramble": "NEOTSOONM",
    "hint": "A shimmering stone with a lunar name"
  },
  {
    "word": "RAVEN",
    "scramble": "VNERA",
    "hint": "A dark bird in Poe's poem"
  },
  {
    "word": "CROW",
    "scramble": "CRWO",
    "hint": "A black bird seen near scarecrows"
  },
  {
    "word": "OWL",
    "scramble": "LWO",
    "hint": "A hooting nighttime bird"
  },
  {
    "word": "TOAD",
    "scramble": "DTOA",
    "hint": "A witch's warty storybook companion"
  },
  {
    "word": "NEWT",
    "scramble": "TNEW",
    "hint": "A small amphibian named in witch lore"
  },
  {
    "word": "SNAKE",
    "scramble": "ENSKA",
    "hint": "A slithering spooky-season creature"
  },
  {
    "word": "RAT",
    "scramble": "ATR",
    "hint": "A small rodent in haunted-house imagery"
  },
  {
    "word": "WOLF",
    "scramble": "WLOF",
    "hint": "A howling animal"
  },
  {
    "word": "WEB",
    "scramble": "BWE",
    "hint": "A spider's silk net"
  },
  {
    "word": "FANGS",
    "scramble": "FASGN",
    "hint": "A vampire's pointed teeth"
  },
  {
    "word": "CLAWS",
    "scramble": "LCSAW",
    "hint": "A monster's sharp nails"
  },
  {
    "word": "SKULL",
    "scramble": "KSLUL",
    "hint": "Bones forming a head"
  },
  {
    "word": "BONES",
    "scramble": "BEONS",
    "hint": "Pieces of a skeleton"
  },
  {
    "word": "RIBCAGE",
    "scramble": "CIEBRAG",
    "hint": "The skeleton's chest framework"
  },
  {
    "word": "COFFIN",
    "scramble": "FINCOF",
    "hint": "A vampire's resting box in stories"
  },
  {
    "word": "CRYPT",
    "scramble": "PCTYR",
    "hint": "A burial chamber"
  },
  {
    "word": "MAUSOLEUM",
    "scramble": "USMAMELUO",
    "hint": "A building containing tombs"
  },
  {
    "word": "GRAVEYARD",
    "scramble": "RADVRAYGE",
    "hint": "Another word for a cemetery"
  },
  {
    "word": "EPITAPH",
    "scramble": "HPTIAEP",
    "hint": "Words on a tombstone"
  },
  {
    "word": "HEADSTONE",
    "scramble": "OTEEHASDN",
    "hint": "An upright grave marker"
  },
  {
    "word": "GATE",
    "scramble": "TAGE",
    "hint": "An entrance to a spooky cemetery"
  },
  {
    "word": "LANTERN",
    "scramble": "RLEANTN",
    "hint": "A portable enclosed light"
  },
  {
    "word": "CANDLE",
    "scramble": "CLNADE",
    "hint": "A wax light source"
  },
  {
    "word": "WICK",
    "scramble": "WKCI",
    "hint": "The string inside a candle"
  },
  {
    "word": "TORCH",
    "scramble": "OHRTC",
    "hint": "A flame light carried in old castle stories"
  },
  {
    "word": "SHADOW",
    "scramble": "HDOSWA",
    "hint": "A dark shape cast by light"
  },
  {
    "word": "SILHOUETTE",
    "scramble": "TEELUTOSIH",
    "hint": "A dark outline of a figure"
  },
  {
    "word": "FOG",
    "scramble": "GFO",
    "hint": "Low mist in a spooky scene"
  },
  {
    "word": "MIST",
    "scramble": "ITMS",
    "hint": "Fine suspended water droplets"
  },
  {
    "word": "MIDNIGHT",
    "scramble": "HMTNGDII",
    "hint": "Twelve at night"
  },
  {
    "word": "TWILIGHT",
    "scramble": "GHTTILIW",
    "hint": "The light between day and night"
  },
  {
    "word": "MOONLIGHT",
    "scramble": "HNLTOGIOM",
    "hint": "Light from the night sky's bright disk"
  },
  {
    "word": "ECLIPSE",
    "scramble": "CPEEISL",
    "hint": "A celestial shadow event"
  },
  {
    "word": "HOWL",
    "scramble": "OHWL",
    "hint": "A wolf's long cry"
  },
  {
    "word": "CACKLE",
    "scramble": "ACLEKC",
    "hint": "A witch's storybook laugh"
  },
  {
    "word": "SCREAM",
    "scramble": "CEMARS",
    "hint": "A startled cry"
  },
  {
    "word": "SHIVER",
    "scramble": "VRESHI",
    "hint": "A trembling response to a chill"
  },
  {
    "word": "GOOSEBUMPS",
    "scramble": "SUOPOMSBEG",
    "hint": "Tiny skin bumps from a scare"
  },
  {
    "word": "DREAD",
    "scramble": "EDDAR",
    "hint": "A feeling of apprehension"
  },
  {
    "word": "MYSTERY",
    "scramble": "SRTEYYM",
    "hint": "Something waiting to be solved"
  },
  {
    "word": "RIDDLE",
    "scramble": "IRLDED",
    "hint": "A puzzling question"
  },
  {
    "word": "CLUE",
    "scramble": "ELUC",
    "hint": "A hint in a spooky investigation"
  },
  {
    "word": "DISGUISE",
    "scramble": "ESIGUSID",
    "hint": "A look that hides who you are"
  },
  {
    "word": "MASQUERADE",
    "scramble": "RQMESAAEUD",
    "hint": "A masked costume gathering"
  },
  {
    "word": "EYEPATCH",
    "scramble": "AYHCTEPE",
    "hint": "A pirate costume accessory"
  },
  {
    "word": "CAPE",
    "scramble": "ACPE",
    "hint": "A vampire's flowing garment"
  },
  {
    "word": "MASK",
    "scramble": "KAMS",
    "hint": "A face-covering disguise"
  },
  {
    "word": "MAKEUP",
    "scramble": "PAEKMU",
    "hint": "Color used to create a monster face"
  },
  {
    "word": "WIG",
    "scramble": "GIW",
    "hint": "Artificial hair for a costume"
  },
  {
    "word": "FELT",
    "scramble": "FETL",
    "hint": "A soft fabric used for costume crafts"
  },
  {
    "word": "GLITTER",
    "scramble": "RGTLETI",
    "hint": "Sparkles on a magical costume"
  },
  {
    "word": "FACEPAINT",
    "scramble": "TFACNPEAI",
    "hint": "Color applied directly for a costume"
  },
  {
    "word": "COSTUMEPARADE",
    "scramble": "EETUMORCASADP",
    "hint": "A procession of dressed-up people"
  },
  {
    "word": "BOO",
    "scramble": "OBO",
    "hint": "A ghost's short greeting"
  },
  {
    "word": "TRICK",
    "scramble": "RTKCI",
    "hint": "The mischievous half of Halloween's greeting"
  },
  {
    "word": "TREAT",
    "scramble": "TEATR",
    "hint": "The sweet half of Halloween's greeting"
  },
  {
    "word": "LOLLIPOP",
    "scramble": "PLIPLLOO",
    "hint": "Hard candy on a stick"
  },
  {
    "word": "CHOCOLATE",
    "scramble": "CHOCOTLAE",
    "hint": "A common Halloween candy ingredient"
  },
  {
    "word": "CARAMEL",
    "scramble": "AACRMLE",
    "hint": "A golden sweet apple coating"
  },
  {
    "word": "TAFFY",
    "scramble": "FYAFT",
    "hint": "A chewy pulled candy"
  },
  {
    "word": "GUMMIES",
    "scramble": "UIEGMMS",
    "hint": "Chewy gelatin-style candies"
  },
  {
    "word": "LICORICE",
    "scramble": "OERCIICL",
    "hint": "A rope-shaped candy"
  },
  {
    "word": "MARSHMALLOW",
    "scramble": "WRLHASMOLAM",
    "hint": "A fluffy sweet treat"
  },
  {
    "word": "CANDYAPPLE",
    "scramble": "YDNAPLCAPE",
    "hint": "Fruit with a hard sweet shell"
  },
  {
    "word": "CARAMELAPPLE",
    "scramble": "EPLAPLCARMAE",
    "hint": "Fruit with a chewy golden coating"
  },
  {
    "word": "POPCORN",
    "scramble": "ORPONCP",
    "hint": "A favorite spooky-movie snack"
  },
  {
    "word": "PUMPKINPIE",
    "scramble": "PIMKEPNUIP",
    "hint": "A spiced autumn dessert"
  },
  {
    "word": "PUMPKINBREAD",
    "scramble": "NPDAIMRUPKEB",
    "hint": "A sweet autumn loaf"
  },
  {
    "word": "CIDER",
    "scramble": "ERCID",
    "hint": "A popular apple drink in fall"
  },
  {
    "word": "CINNAMON",
    "scramble": "OIACNNNM",
    "hint": "A warm spice used with pumpkin"
  },
  {
    "word": "NUTMEG",
    "scramble": "NTUMEG",
    "hint": "An aromatic pumpkin-pie spice"
  },
  {
    "word": "CLOVES",
    "scramble": "SOLCVE",
    "hint": "A pungent spice used in fall baking"
  },
  {
    "word": "GINGER",
    "scramble": "GRINGE",
    "hint": "A warming spice in autumn treats"
  },
  {
    "word": "ALLSPICE",
    "scramble": "ICLASEPL",
    "hint": "A berry spice used in pumpkin blends"
  },
  {
    "word": "SEEDS",
    "scramble": "DEESS",
    "hint": "A pumpkin's scoopable contents"
  },
  {
    "word": "PEPITA",
    "scramble": "ITPAEP",
    "hint": "An edible pumpkin seed kernel"
  },
  {
    "word": "STEM",
    "scramble": "TEMS",
    "hint": "The pumpkin's vine attachment"
  },
  {
    "word": "VINE",
    "scramble": "ENIV",
    "hint": "A pumpkin plant's trailing growth"
  },
  {
    "word": "GOURD",
    "scramble": "GRDOU",
    "hint": "A hard-skinned decorative fall fruit"
  },
  {
    "word": "HARVEST",
    "scramble": "VESTHAR",
    "hint": "Gathering crops in autumn"
  },
  {
    "word": "AUTUMN",
    "scramble": "UAMUNT",
    "hint": "The season of Halloween"
  },
  {
    "word": "OCTOBER",
    "scramble": "TCROBOE",
    "hint": "Halloween's month"
  },
  {
    "word": "LEAVES",
    "scramble": "AVEESL",
    "hint": "Colorful autumn tree coverings"
  },
  {
    "word": "STRAW",
    "scramble": "STWAR",
    "hint": "A scarecrow's stuffing"
  },
  {
    "word": "BARN",
    "scramble": "RNBA",
    "hint": "A building near a pumpkin patch"
  },
  {
    "word": "WAGON",
    "scramble": "NOAGW",
    "hint": "A vehicle used for hayrides"
  },
  {
    "word": "ORCHARD",
    "scramble": "RCORDHA",
    "hint": "A place to pick autumn apples"
  },
  {
    "word": "BUSHEL",
    "scramble": "HEULSB",
    "hint": "A basket measure at a harvest market"
  },
  {
    "word": "PATCH",
    "scramble": "CTAPH",
    "hint": "A place where pumpkins grow"
  },
  {
    "word": "BARMBRACK",
    "scramble": "ARRABMCKB",
    "hint": "Irish Halloween fruit bread"
  },
  {
    "word": "GUISING",
    "scramble": "GIGUSIN",
    "hint": "Traditional costumed house visiting"
  },
  {
    "word": "SOULING",
    "scramble": "OSGNIUL",
    "hint": "An old custom of exchanging prayers for cakes"
  },
  {
    "word": "OFRENDA",
    "scramble": "FENDOAR",
    "hint": "A Day of the Dead altar"
  },
  {
    "word": "CATRINA",
    "scramble": "CIAARNT",
    "hint": "An elegant skeletal Day of the Dead figure"
  },
  {
    "word": "CALAVERA",
    "scramble": "EAACRVAL",
    "hint": "Spanish word for skull"
  },
  {
    "word": "PAPELPICADO",
    "scramble": "OAEALCPPIPD",
    "hint": "Decorative cut-paper banners"
  },
  {
    "word": "PANDEMUERTO",
    "scramble": "AOPDUEMETNR",
    "hint": "Day of the Dead bread"
  },
  {
    "word": "SUGARSKULL",
    "scramble": "SLKRGUASUL",
    "hint": "A decorated sweet remembrance symbol"
  },
  {
    "word": "CORALINE",
    "scramble": "AREOILNC",
    "hint": "A girl who discovers an Other Mother"
  },
  {
    "word": "BELDAM",
    "scramble": "EDBMLA",
    "hint": "Another name for Coraline's Other Mother"
  },
  {
    "word": "BUTTONEYES",
    "scramble": "TOTNYSUEBE",
    "hint": "A disturbing feature in Coraline"
  },
  {
    "word": "PARANORMAN",
    "scramble": "ROAMNANPAR",
    "hint": "A film about a boy who sees ghosts"
  },
  {
    "word": "NORMAN",
    "scramble": "ANMNOR",
    "hint": "ParaNorman's young hero"
  },
  {
    "word": "BLITHEHOLLOW",
    "scramble": "EHHWLOIBLTOL",
    "hint": "ParaNorman's town"
  },
  {
    "word": "CORPSEBRIDE",
    "scramble": "OICRRBPEDES",
    "hint": "A stop-motion film with a ghostly wedding"
  },
  {
    "word": "EMILY",
    "scramble": "YLEMI",
    "hint": "The title bride of a Tim Burton film"
  },
  {
    "word": "VICTOR",
    "scramble": "ITROCV",
    "hint": "The young groom in Corpse Bride"
  },
  {
    "word": "FRANKENWEENIE",
    "scramble": "ENAWREIFKNNEE",
    "hint": "A film about a revived dog"
  },
  {
    "word": "SPARKY",
    "scramble": "KRSAPY",
    "hint": "The dog in Frankenweenie"
  },
  {
    "word": "MAVIS",
    "scramble": "SAVIM",
    "hint": "Dracula's daughter in Hotel Transylvania"
  },
  {
    "word": "JOHNNY",
    "scramble": "NHOYJN",
    "hint": "Mavis's human love interest"
  },
  {
    "word": "HALLOWEENTOWN",
    "scramble": "NLWTHENOEALWO",
    "hint": "Marnie Piper's magical destination"
  },
  {
    "word": "MARNIE",
    "scramble": "EMIRNA",
    "hint": "The young heroine of Halloweentown"
  },
  {
    "word": "AGGIE",
    "scramble": "GGEIA",
    "hint": "Marnie's witch grandmother"
  },
  {
    "word": "KALABAR",
    "scramble": "KBALARA",
    "hint": "Halloweentown's first villain"
  },
  {
    "word": "LINUS",
    "scramble": "LUSNI",
    "hint": "The Peanuts child waiting in a pumpkin patch"
  },
  {
    "word": "GREATPUMPKIN",
    "scramble": "IAUPKTNEGMRP",
    "hint": "Linus's hoped-for Halloween visitor"
  },
  {
    "word": "SNOOPY",
    "scramble": "NSOOPY",
    "hint": "Peanuts' imaginative beagle"
  },
  {
    "word": "MUNSTERS",
    "scramble": "SMNUERTS",
    "hint": "The family at Mockingbird Lane"
  },
  {
    "word": "HERMAN",
    "scramble": "MHRNEA",
    "hint": "The Munster family's father"
  },
  {
    "word": "LILY",
    "scramble": "ILLY",
    "hint": "The Munster family's mother"
  },
  {
    "word": "EDDIE",
    "scramble": "IEDDE",
    "hint": "The Munsters' young werewolf son"
  },
  {
    "word": "ELVIRA",
    "scramble": "IVARLE",
    "hint": "A famous horror hostess"
  },
  {
    "word": "LYDIA",
    "scramble": "LAYDI",
    "hint": "The goth girl in Beetlejuice"
  },
  {
    "word": "DEETZ",
    "scramble": "DEEZT",
    "hint": "Lydia's family surname"
  },
  {
    "word": "ICHABODCRANE",
    "scramble": "ROEACADCHBNI",
    "hint": "Sleepy Hollow's schoolteacher"
  },
  {
    "word": "BROMBONES",
    "scramble": "MBBRSEOON",
    "hint": "Ichabod's rival"
  },
  {
    "word": "KATRINA",
    "scramble": "RAKANTI",
    "hint": "Ichabod's love interest"
  },
  {
    "word": "HORSEMAN",
    "scramble": "ARSNMOHE",
    "hint": "Sleepy Hollow's headless rider"
  },
  {
    "word": "MONSTERHOUSE",
    "scramble": "MSEUTOENSRHO",
    "hint": "An animated film about a living house"
  },
  {
    "word": "GRIMGRINNING",
    "scramble": "GRNMGNGIIINR",
    "hint": "The Haunted Mansion ghosts are described this way"
  },
  {
    "word": "SKELETONDANCE",
    "scramble": "DEESCLNNOTAEK",
    "hint": "Disney's 1929 graveyard cartoon"
  },
  {
    "word": "DANSEMACABRE",
    "scramble": "DMEAASREBACN",
    "hint": "Saint-Saens's spooky musical piece"
  },
  {
    "word": "SPOOKY",
    "scramble": "YSPKOO",
    "hint": "Eerie in a playful way"
  },
  {
    "word": "EERIE",
    "scramble": "IEEER",
    "hint": "Strangely frightening"
  },
  {
    "word": "PUMPKINPATCH",
    "scramble": "NIPUTMCPAKPH",
    "hint": "A field for choosing a jack-o'-lantern fruit"
  },
  {
    "word": "GHOSTTOUR",
    "scramble": "TSUORGHTO",
    "hint": "A guided outing for local spooky stories"
  },
  {
    "word": "HAUNTEDHOUSE",
    "scramble": "EEUAHDOUSNHT",
    "hint": "A building said to contain spirits"
  },
  {
    "word": "HOCUSPOCUS",
    "scramble": "CCOSOPUHUS",
    "hint": "A film about three Salem witches"
  }
];

  const gameLabels = {
    trivia: ["Trivia", "15 questions • gets harder as you go", "15 Halloween questions • gets harder as you go"],
    wyr: ["Would You Rather", "10 quick choices", "10 spooky-season choices"],
    scramble: ["Word Scramble", "10 timed words", "10 timed Halloween words"]
  };
  function syncHalloweenUI() {
    document.body.classList.toggle("halloween-mode", halloweenEnabled);
    const toggle = document.getElementById("halloweenToggle");
    toggle.setAttribute("aria-checked", String(halloweenEnabled));
    toggle.textContent = `🎃 Halloween: ${halloweenEnabled ? "ON" : "OFF"}`;
    toggle.disabled = !HALLOWEEN_MODE;
    gamesPanel.querySelector(".eyebrow").textContent = halloweenEnabled ? "🎃 HALLOWEEN WEEK 🦇" : "DISCOVER WITH BIG RED";
    gamesPanel.querySelectorAll("[data-game]").forEach(card => {
      const [title, normal, seasonal] = gameLabels[card.dataset.game];
      card.querySelector("strong").textContent = `${halloweenEnabled ? "Halloween " : ""}${title}`;
      card.querySelector("span").textContent = halloweenEnabled ? seasonal : normal;
    });
  }
  document.getElementById("halloweenToggle").addEventListener("click", () => {
    halloweenEnabled = HALLOWEEN_MODE && !halloweenEnabled;
    try { localStorage.setItem(HALLOWEEN_STORAGE_KEY, String(halloweenEnabled)); } catch {}
    syncHalloweenUI();
  });
  syncHalloweenUI();

  // A game captures its mode at start. Changing preference never mixes banks mid-game.
  function seasonalGameTitle(kind, suffix = "") {
    return `${session[kind]?.halloween ? "Halloween " : ""}${gameLabels[kind][0]}${suffix}`;
  }
  function drawHalloweenTrivia(tier, usedFacts) {
    const key = `halloweenTrivia_${tier}`;
    let deck = gameDecks[key] || [];
    const selected = [];
    while (selected.length < 5) {
      if (!deck.some(item => !usedFacts.has(item.fact))) {
        deck = shuffledCopy(halloweenTrivia[tier].filter(item => !usedFacts.has(item.fact)));
      }
      const index = deck.findIndex(item => !usedFacts.has(item.fact));
      const item = deck.splice(index, 1)[0];
      usedFacts.add(item.fact);
      selected.push(item);
    }
    gameDecks[key] = deck;
    return selected;
  }

  const gameDecks = {
    triviaEasy: [],
    triviaMedium: [],
    triviaHard: [],
    seasonalEasy: [],
    seasonalMedium: [],
    seasonalHard: [],
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

  function clearTriviaTimer() {
    if (triviaTimer) {
      clearInterval(triviaTimer);
      triviaTimer = null;
    }
  }

  function clearScrambleTimer() {
    if (scrambleTimer) {
      clearInterval(scrambleTimer);
      scrambleTimer = null;
    }
  }

  function resetGameSession() {
    clearTriviaTimer();
    clearScrambleTimer();

    session.trivia = null;
    session.wyr = null;
    session.scramble = null;

    activeGame = null;
    gameContent.innerHTML = "";
  }

  const anyPanelOpen = () =>
    !musicPanel.hidden ||
    !driverPanel.hidden ||
    !weatherPanel.hidden ||
    !gamesPanel.hidden ||
    !gamePanel.hidden ||
    !planPanel.hidden ||
    !tipPanel.hidden ||
    !reviewPanel.hidden;

  function goHomeAndReset() {
    musicPanel.hidden = true;
    driverPanel.hidden = true;
    weatherPanel.hidden = true;
    gamesPanel.hidden = true;
    gamePanel.hidden = true;
    planPanel.hidden = true;
    tipPanel.hidden = true;
    reviewPanel.hidden = true;

    clearInactivityTimer();
    resetGameSession();
    ensureVideoPlayback();
  }

  // Overlays never pause the weekly program.
  // Video and audio continue underneath Games / Plan / Tip.
  function openPanel(panel) {
    musicPanel.hidden = true;
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
    const activeSound = audioUnlocked && soundOn;
    volumeBtn.classList.toggle("sound-on", activeSound);
    volumeBtn.classList.toggle("sound-off", !activeSound);
    volumeIcon.textContent = activeSound ? "🔊" : "🔇";
    volumeLabel.textContent = !audioUnlocked
      ? "Tap Sound"
      : soundOn
        ? "Sound"
        : "Muted";
    const label = !audioUnlocked
      ? "Tap to enable sound"
      : soundOn
        ? "Sound On"
        : "Sound Off";
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

  function unlockAndPlaySound() {
    audioUnlocked = true;
    soundOn = true;
    saveSoundState();
    video.volume = 1;
    applySoundState();

    const playback = video.play();
    Promise.resolve(playback)
      .then(() => {
        videoFallback.hidden = true;
      })
      .catch((error) => {
        console.info("Sound will begin on the next rider interaction.", error);
      });

    return Promise.resolve(playback);
  }

  async function unlockAudioIfNeeded() {
    if (audioUnlocked) return;
    await unlockAndPlaySound();
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

  async function loadLocalProgram(file, unlockForSelection = false) {
    if (!file) return;

    if (!file.type.startsWith("video/") && !/\.(mov|mp4)$/i.test(file.name)) {
      showLocalProgramStatus("Please choose a MOV or MP4 video file.", 5000);
      return;
    }

    try {
      /*
        Replacing src invalidates Safari's previous media activation. Always
        start the new local source muted; the visible Sound button then unlocks
        this exact source with a fresh, explicit rider tap. This keeps video
        playback reliable while preserving the October merged-program audio.
      */
      audioUnlocked = false;
      if (unlockForSelection) soundOn = true;
      saveSoundState();

      if (localProgramUrl) URL.revokeObjectURL(localProgramUrl);

      localProgramUrl = URL.createObjectURL(file);
      localProgramLoaded = true;

      video.pause();
      const source = video.querySelector("source");
      if (source) source.removeAttribute("src");
      video.src = localProgramUrl;
      video.loop = true;
      video.playsInline = true;
      video.load();
      applySoundState();

      showLocalProgramStatus(`Local program loaded: ${file.name} — tap Sound for audio.`, 6500);

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


  async function sendMusicRequest(payload, button, pendingLabel, successLabel) {
    if (!musicRequestStatus) return;

    const buttons = [...musicPanel.querySelectorAll("[data-music-choice]")];
    buttons.forEach(candidate => candidate.disabled = true);
    if (musicSpecificInput) musicSpecificInput.disabled = true;
    if (musicSpecificSendBtn) musicSpecificSendBtn.disabled = true;
    musicRequestStatus.textContent = pendingLabel;

    try {
      const response = await fetch(CONFIG.musicRequestApi, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
        cache: "no-store"
      });

      let result = {};
      try { result = await response.json(); } catch {}

      if (response.status === 409 && result?.request) {
        const waiting =
          result.request.kind === "specific" && result.request.detail
            ? `Specific request: ${result.request.detail}`
            : result.request.choice;

        musicRequestStatus.textContent =
          `Big Red already has a request waiting: ${waiting}.`;
        return false;
      }

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || `Request failed (${response.status})`);
      }

      if (button) {
        buttons.forEach(candidate => candidate.classList.remove("requested"));
        button.classList.add("requested");
        window.setTimeout(() => button.classList.remove("requested"), 1600);
      }
      musicRequestStatus.textContent = successLabel;
      return true;
    } catch (error) {
      console.info("Music request could not be sent.", error);
      musicRequestStatus.textContent =
        "Music request could not send right now. You can still ask Big Red directly.";
      return false;
    } finally {
      window.setTimeout(() => {
        buttons.forEach(candidate => candidate.disabled = false);
        if (musicSpecificInput) musicSpecificInput.disabled = false;
        if (musicSpecificSendBtn) musicSpecificSendBtn.disabled = false;
      }, 900);
    }
  }

  async function submitMusicRequest(choice, button) {
    if (!choice) return;

    await sendMusicRequest(
      {choice},
      button,
      `Sending ${choice} to Big Red…`,
      `${choice} requested. Big Red will handle playback from the front.`
    );
  }

  async function submitSpecificMusicRequest() {
    const detail = String(musicSpecificInput?.value || "").trim();

    if (!detail) {
      musicRequestStatus.textContent = "Type a song, artist, or both first.";
      musicSpecificInput?.focus();
      return;
    }

    const sent = await sendMusicRequest(
      {kind: "specific", detail},
      null,
      `Sending “${detail}” to Big Red…`,
      `“${detail}” requested. Big Red will choose the playback.`
    );

    if (sent && musicSpecificInput) musicSpecificInput.value = "";
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
    if (halloweenEnabled) {
      const usedFacts = new Set();
      session.trivia = {
        halloween: true,
        easy: drawHalloweenTrivia("easy", usedFacts),
        medium: drawHalloweenTrivia("medium", usedFacts),
        hard: drawHalloweenTrivia("hard", usedFacts),
        round: 0, correct: 0, points: 0, streak: 0, bestStreak: 0
      };
      return;
    }
    // Early-season mix: guarantee visible fall / Harry Potter content
    // without taking over the whole 15-question game.
    // 5 seasonal questions per session: 2 Easy, 2 Medium, 1 Hard.
    const easyMix = shuffledCopy([
      ...drawFromDeck("seasonalEasy", seasonalTrivia.easy, 2),
      ...drawFromDeck("triviaEasy", triviaBank.easy, 3)
    ]);

    const mediumMix = shuffledCopy([
      ...drawFromDeck("seasonalMedium", seasonalTrivia.medium, 2),
      ...drawFromDeck("triviaMedium", triviaBank.medium, 3)
    ]);

    const hardMix = shuffledCopy([
      ...drawFromDeck("seasonalHard", seasonalTrivia.hard, 1),
      ...drawFromDeck("triviaHard", triviaBank.hard, 4)
    ]);

    session.trivia = {
      easy: easyMix,
      medium: mediumMix,
      hard: hardMix,

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

  function ensureGameLayoutFixStyles() {
    if (document.getElementById("gameLayoutFix20260928")) return;

    const style = document.createElement("style");
    style.id = "gameLayoutFix20260928";
    style.textContent = `
      #gamePanel {
        padding-bottom: calc(108px + var(--safe-bottom, 0px)) !important;
      }

      #gamePanel .game-panel-card {
        height: calc(100dvh - 132px) !important;
        max-height: calc(100dvh - 132px) !important;
        overflow: hidden !important;
      }

      #gamePanel .game-content {
        min-height: 0 !important;
        overflow-y: auto !important;
        align-content: start !important;
        gap: 10px !important;
        padding: 10px 8px 4px !important;
      }

      #gamePanel .game-statusbar {
        margin-bottom: 0 !important;
      }

      #gamePanel .game-title {
        font-size: clamp(30px, 4.8vw, 50px) !important;
        line-height: 1 !important;
      }

      #gamePanel .game-prompt {
        margin: 2px auto 8px !important;
        font-size: clamp(22px, 3.5vw, 34px) !important;
      }

      #gamePanel .answer-grid {
        gap: 10px !important;
      }

      #gamePanel .answer-btn,
      #gamePanel .next-btn,
      #gamePanel .secondary-game-btn {
        min-height: 52px !important;
        padding: 11px 15px !important;
      }

      #gamePanel .result-text {
        min-height: 24px !important;
        margin: 0 !important;
      }

      #gamePanel .next-row {
        margin-top: 0 !important;
        padding-bottom: 2px !important;
      }

      #gamePanel .timer-pill-warning {
        border-color: rgba(255, 188, 63, .72) !important;
        color: #ffd27a !important;
      }

      #gamePanel .timer-pill-danger {
        border-color: rgba(255, 74, 80, .78) !important;
        color: #ff8b8f !important;
      }

      #gamePanel .scramble-word {
        margin: 4px auto 4px !important;
        font-size: clamp(38px, 6.4vw, 68px) !important;
      }

      #gamePanel .timer-wrap {
        margin: 0 auto 2px !important;
      }

      #gamePanel .scramble-credit-note,
      #gamePanel .scramble-hint {
        margin-top: 0 !important;
        margin-bottom: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }

  function renderTrivia() {
    clearTriviaTimer();
    ensureGameLayoutFixStyles();

    const state = session.trivia;

    if (state.round >= CONFIG.triviaRounds) {
      return renderTriviaResults();
    }

    const current = getTriviaRound();
    const item = current.item;
    let finished = false;
    let remaining = CONFIG.triviaSeconds;
    triviaDeadline = Date.now() + (CONFIG.triviaSeconds * 1000);

    gameContent.innerHTML = `
      <div class="game-statusbar">
        <div class="game-status-pill">Question <strong>${state.round + 1}/${CONFIG.triviaRounds}</strong></div>
        <div class="game-status-pill">Score <strong>${state.points}</strong></div>
        <div class="game-status-pill">Streak <strong>${state.streak}</strong></div>
        <div class="difficulty-pill difficulty-${current.difficulty}">${current.label}</div>
        <div id="triviaTimerPill" class="game-status-pill">Time <strong id="triviaTimerNumber">${remaining}s</strong></div>
      </div>

      <h2 class="game-title">${seasonalGameTitle("trivia")}</h2>
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
    const timerNumber = document.getElementById("triviaTimerNumber");
    const timerPill = document.getElementById("triviaTimerPill");

    function finishTriviaRound(selected = null) {
      if (finished) return;
      finished = true;
      clearTriviaTimer();

      const timedOut = selected === null;
      const correct = !timedOut && selected === item.correct;

      answerButtons.forEach((candidate,index) => {
        candidate.disabled = true;

        if (index === item.correct) {
          candidate.classList.add("correct");
        }

        if (!timedOut && index === selected && !correct) {
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
        resultText.textContent = timedOut
          ? `Time's up! Answer: ${item.a[item.correct]}`
          : `Answer: ${item.a[item.correct]}`;
      }

      timerPill?.classList.remove("timer-pill-warning", "timer-pill-danger");
      nextButton.hidden = false;
      nextButton.scrollIntoView({block:"nearest", behavior:"smooth"});
    }

    answerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        finishTriviaRound(Number(button.dataset.answer));
      }, {once:true});
    });

    nextButton.addEventListener("click", () => {
      clearTriviaTimer();
      state.round += 1;
      renderTrivia();
    });

    triviaTimer = setInterval(() => {
      const msLeft = Math.max(0, triviaDeadline - Date.now());
      remaining = Math.ceil(msLeft / 1000);
      timerNumber.textContent = `${remaining}s`;

      timerPill.classList.toggle("timer-pill-warning", remaining <= 7 && remaining > 3);
      timerPill.classList.toggle("timer-pill-danger", remaining <= 3);

      if (msLeft <= 0) {
        finishTriviaRound(null);
      }
    }, 100);
  }

  function renderTriviaResults() {
    const state = session.trivia;
    const pct = Math.round((state.correct / CONFIG.triviaRounds) * 100);

    renderScoreScreen({
      title: seasonalGameTitle("trivia", " Results"),
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
      halloween: halloweenEnabled,
      rounds: drawFromDeck(halloweenEnabled ? "halloweenWyr" : "wyr", halloweenEnabled ? halloweenWouldYouRather : wouldYouRather, CONFIG.wyrRounds),
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

      <h2 class="game-title">${seasonalGameTitle("wyr")}</h2>
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
      title: seasonalGameTitle("wyr", ""),
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
      halloween: halloweenEnabled,
      rounds: drawFromDeck(halloweenEnabled ? "halloweenScramble" : "scramble", halloweenEnabled ? halloweenScrambles : scrambles, CONFIG.scrambleRounds),
      round: 0,
      solved: 0,
      streak: 0,
      bestStreak: 0,
      totalTimeUsed: 0
    };
  }

  function renderScramble() {
    clearScrambleTimer();
    ensureGameLayoutFixStyles();

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

      <h2 class="game-title">${seasonalGameTitle("scramble")}</h2>

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
      title: seasonalGameTitle("scramble", " Results"),
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

  musicBtn.addEventListener("click", () => {
    musicRequestStatus.textContent = "Pick a playlist or send a specific request to Big Red.";
    musicPanel.querySelectorAll(".music-choice").forEach(button => button.classList.remove("requested"));
    if (musicSpecificInput) musicSpecificInput.value = "";
    openPanel(musicPanel);
  });

  musicPanel.querySelectorAll("[data-music-choice]").forEach((button) => {
    button.addEventListener("click", () => submitMusicRequest(button.dataset.musicChoice, button));
  });

  if (musicSpecificSendBtn) {
    musicSpecificSendBtn.addEventListener("click", submitSpecificMusicRequest);
  }

  if (musicSpecificInput) {
    musicSpecificInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitSpecificMusicRequest();
      }
    });
  }

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
    clearTriviaTimer();
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
        } else if (video.paused || video.ended || video.readyState < 2) {
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
  window.DiscoverAudioController = Object.freeze({
    unlockAndPlay: unlockAndPlaySound,
    ensurePlayback: ensureVideoPlayback,
    loadLocalProgram,
    apply: applySoundState,
    state: () => ({
      unlocked: audioUnlocked,
      soundOn,
      muted: video.muted,
      paused: video.paused
    })
  });
  ensureVideoPlayback();
  window.addEventListener("beforeunload", () => {
    if (localProgramUrl) URL.revokeObjectURL(localProgramUrl);
  });
})();

