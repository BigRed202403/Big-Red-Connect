// Big Red Connect — Internal Automatic Holiday Mode
// Version: 2026.10.25
// Rider-facing controls: NONE.
// Safe architecture: this module does not modify the Discover media/audio engine.
(() => {
  "use strict";

  // INTERNAL CONTROL ONLY:
  // "auto" = date-driven; "off" = no holiday mode;
  // or force one key for testing: newyear, valentines, stpatrick, easter,
  // memorial, independence, labor, halloween, veterans, thanksgiving, christmas.
  const HOLIDAY_MODE = "auto";
  const VERSION = "20261025-holiday-auto1";

  const HOLIDAYS = {"newyear":{"label":"New Year's","eyebrow":"✨ NEW YEAR'S CELEBRATION","emoji":"✨","class":"newyear"},"valentines":{"label":"Valentine's Day","eyebrow":"❤️ VALENTINE'S DAY","emoji":"❤️","class":"valentines"},"stpatrick":{"label":"St. Patrick's Day","eyebrow":"☘️ ST. PATRICK'S DAY","emoji":"☘️","class":"stpatrick"},"easter":{"label":"Easter","eyebrow":"🌷 EASTER","emoji":"🌷","class":"easter"},"memorial":{"label":"Memorial Day","eyebrow":"🇺🇸 MEMORIAL DAY","emoji":"🇺🇸","class":"memorial"},"independence":{"label":"Independence Day","eyebrow":"🇺🇸 INDEPENDENCE DAY","emoji":"🇺🇸","class":"independence"},"labor":{"label":"Labor Day","eyebrow":"🇺🇸 LABOR DAY","emoji":"🇺🇸","class":"labor"},"halloween":{"label":"Halloween","eyebrow":"🎃 HALLOWEEN WEEK 🦇","emoji":"🎃","class":"halloween"},"veterans":{"label":"Veterans Day","eyebrow":"🇺🇸 VETERANS DAY","emoji":"🇺🇸","class":"veterans"},"thanksgiving":{"label":"Thanksgiving","eyebrow":"🦃 THANKSGIVING","emoji":"🦃","class":"thanksgiving"},"christmas":{"label":"Christmas","eyebrow":"🎄 CHRISTMAS SEASON","emoji":"🎄","class":"christmas"}};
  const HOLIDAY_TRIVIA = {"newyear":[["When is New Year's Day celebrated?",["January 1","December 25","January 31","February 1"],0],["What happens at midnight on New Year's Eve?",["The new year begins","Summer begins","Clocks stop","Thanksgiving begins"],0],["What famous object drops in Times Square on New Year's Eve?",["A ball","A star","A bell","A flag"],0],["Which city hosts the famous Times Square New Year's celebration?",["New York City","Chicago","Boston","Los Angeles"],0],["What do many people make for the new year?",["Resolutions","Costumes","Easter baskets","Jack-o'-lanterns"],0],["What is a common New Year's toast?",["Cheers","Trick or treat","Happy Halloween","Bon voyage"],0],["What month begins the calendar year?",["January","March","June","December"],0],["The Times Square ball drop tradition began in which decade?",["1900s","1850s","1950s","1980s"],0],["What song is traditionally sung around midnight on New Year's Eve?",["Auld Lang Syne","Jingle Bells","America the Beautiful","Take Me Out to the Ball Game"],0],["Auld Lang Syne is strongly associated with which country?",["Scotland","Italy","Mexico","Japan"],0],["Who wrote the poem that became the basis for Auld Lang Syne?",["Robert Burns","William Shakespeare","Edgar Allan Poe","Walt Whitman"],0],["What food is traditionally eaten for luck in parts of the American South on New Year's Day?",["Black-eyed peas","Pumpkin pie","Corn dogs","Candy corn"],0],["What leafy green is also traditionally eaten for prosperity in the South?",["Collard greens","Iceberg lettuce","Basil","Mint"],0],["January is named after which Roman god?",["Janus","Mars","Neptune","Apollo"],0],["What does the word 'resolution' usually mean at New Year?",["A personal goal or promise","A type of fireworks","A calendar page","A party invitation"],0],["Which calendar is used for most civil purposes in the United States today?",["Gregorian calendar","Mayan calendar","Julian calendar only","Lunar calendar only"],0],["The first Times Square New Year's Eve celebration was held in what year?",["1904","1776","1929","1969"],0],["What year did the first Times Square ball drop occur?",["1907","1904","1914","1920"],0],["Which U.S. city is known for a New Year's Eve 'Peach Drop' tradition?",["Atlanta","Denver","Seattle","Boston"],0],["What does 'Auld Lang Syne' roughly refer to?",["Times long past","A new beginning","Good fortune","Midnight bells"],0]],"valentines":[["Valentine's Day is celebrated on what date?",["February 14","February 1","March 14","January 14"],0],["What shape is most associated with Valentine's Day?",["Heart","Triangle","Star","Crescent"],0],["Which color is strongly associated with Valentine's Day?",["Red","Green","Brown","Gray"],0],["What flower is commonly given on Valentine's Day?",["Rose","Sunflower","Daisy only","Tulip only"],0],["What sweet treat is commonly given on Valentine's Day?",["Chocolate","Candy corn","Fruitcake","Popcorn"],0],["Who is often shown with a bow and arrow on Valentine's cards?",["Cupid","Santa Claus","Uncle Sam","The Easter Bunny"],0],["What emotion is Valentine's Day most associated with?",["Love","Fear","Surprise","Sleep"],0],["Cupid comes from which mythology?",["Roman","Norse","Aztec","Japanese"],0],["Cupid's Greek counterpart is called what?",["Eros","Hermes","Ares","Apollo"],0],["Saint Valentine is traditionally associated with which ancient city?",["Rome","Athens","Paris","Dublin"],0],["Conversation hearts are what type of candy?",["Small message candies","Chocolate bars","Gum only","Lollipops only"],0],["Which company is historically associated with popularizing boxed Valentine's chocolates?",["Cadbury","Ford","Kodak","Levi's"],0],["In the U.S., schoolchildren often exchange what on Valentine's Day?",["Cards","Pumpkins","Fireworks","Flags"],0],["What bird is sometimes used as a symbol of love?",["Dove","Crow","Eagle","Ostrich"],0],["The phrase 'Be Mine' is commonly found on what Valentine's item?",["Candy heart","Pumpkin","Firework","Ornament"],0],["Which English writer mentioned Valentine's Day in works from the late 1300s?",["Geoffrey Chaucer","Charles Dickens","J.R.R. Tolkien","George Orwell"],0],["The Roman festival Lupercalia was held in which month?",["February","June","September","December"],0],["In medieval tradition, February 14 was sometimes linked with what natural event?",["Birds choosing mates","First snowfall","Harvest season","Longest day"],0],["Which U.S. state produces a large share of domestic cut roses?",["California","Maine","Alaska","Kansas"],0],["Valentine's Day greeting cards became especially popular in the U.S. during which century?",["19th century","15th century","17th century","21st century"],0]],"stpatrick":[["St. Patrick's Day is celebrated on what date?",["March 17","March 1","April 17","February 17"],0],["Which color is most associated with St. Patrick's Day?",["Green","Purple","Orange only","Black"],0],["St. Patrick is associated with which country?",["Ireland","Scotland","France","Spain"],0],["What three-leaf plant is a symbol of St. Patrick's Day?",["Shamrock","Rose","Clover with five leaves","Ivy"],0],["What mythical creature is commonly associated with the holiday?",["Leprechaun","Dragon","Centaur","Phoenix"],0],["What treasure is a leprechaun said to hide?",["Pot of gold","Silver sword","Magic lamp","Crystal ball"],0],["What city dyes its river green for St. Patrick's Day?",["Chicago","Dallas","Phoenix","Portland"],0],["St. Patrick is traditionally credited with bringing what religion to Ireland?",["Christianity","Buddhism","Hinduism","Shinto"],0],["What instrument is a national symbol of Ireland?",["Harp","Trumpet","Banjo","Saxophone"],0],["What is the capital of Ireland?",["Dublin","Cork","Belfast","Galway"],0],["Which Irish symbol has three leaves?",["Shamrock","Thistle","Maple leaf","Olive branch"],0],["What color was historically associated with St. Patrick before green became dominant?",["Blue","Red","Yellow","Purple"],0],["St. Patrick was born in what general region?",["Roman Britain","Ireland itself","North America","Australia"],0],["What does 'Erin go Bragh' roughly mean?",["Ireland forever","Good luck","Happy spring","Green forever"],0],["Which U.S. city hosts one of the country's oldest St. Patrick's Day parades?",["New York City","Las Vegas","Anchorage","San Diego"],0],["According to tradition, St. Patrick used the shamrock to explain what concept?",["The Trinity","The seasons","The tides","The monarchy"],0],["The first recorded St. Patrick's Day parade is often traced to what location in 1601?",["St. Augustine, Florida","Boston, Massachusetts","Dublin, Ireland","Chicago, Illinois"],0],["What year did Chicago first dye its river green for the holiday?",["1962","1945","1976","1988"],0],["Which province contains Dublin?",["Leinster","Ulster","Munster","Connacht"],0],["St. Patrick's Day is the feast day of St. Patrick, who died in approximately which century?",["5th century","10th century","15th century","18th century"],0]],"easter":[["What day of the week is Easter Sunday always celebrated on?",["Sunday","Friday","Monday","Saturday"],0],["What animal is commonly associated with Easter in the U.S.?",["Rabbit","Wolf","Turkey","Bat"],0],["What item do children often hunt for at Easter?",["Eggs","Pumpkins","Fireworks","Stockings"],0],["What candy shape is especially common at Easter?",["Egg","Star only","Candy cane","Pumpkin"],0],["What season does Easter occur in the Northern Hemisphere?",["Spring","Summer","Fall","Winter"],0],["What flower is strongly associated with Easter?",["Lily","Poinsettia","Marigold","Sunflower"],0],["What do people often decorate for Easter?",["Eggs","Pumpkins","Trees only","Fireworks"],0],["Easter celebrates what event in Christianity?",["The resurrection of Jesus","The birth of Jesus","The Last Supper only","The Exodus"],0],["Good Friday occurs how many days before Easter Sunday?",["Two days","One day","Three days","Seven days"],0],["Palm Sunday is observed how long before Easter?",["One week","One day","One month","Two weeks"],0],["The date of Easter is related to what astronomical cycle?",["The full moon","A solar eclipse","Meteor showers","The winter solstice"],0],["What is the 40-day Christian season before Easter called?",["Lent","Advent","Epiphany","Pentecost"],0],["Ash Wednesday marks the beginning of what season?",["Lent","Advent","Christmas","Ordinary Time only"],0],["What bread is traditionally marked with a cross around Easter in some cultures?",["Hot cross bun","Bagel","Cornbread","Baguette"],0],["What famous event is held annually on the White House lawn around Easter?",["Easter Egg Roll","Turkey pardon","Tree lighting","Fireworks show"],0],["The Council of Nicaea helped establish rules for determining Easter in which century?",["4th century","1st century","10th century","18th century"],0],["In Western Christianity, Easter can fall as early as what date?",["March 22","March 1","February 14","April 1"],0],["In Western Christianity, Easter can fall as late as what date?",["April 25","May 1","April 30","March 31"],0],["Which Germanic figure is often cited in discussions of the English word 'Easter'?",["Eostre","Freya","Athena","Juno"],0],["The White House Easter Egg Roll dates back officially to which president's administration?",["Rutherford B. Hayes","George Washington","Abraham Lincoln","Theodore Roosevelt"],0]],"memorial":[["Memorial Day honors U.S. military members who did what?",["Died while serving","Retired from service","Joined the military that year","Won a sports event"],0],["Memorial Day is observed on which day of the week?",["Monday","Friday","Sunday","Wednesday"],0],["Memorial Day is observed in which month?",["May","July","September","November"],0],["What U.S. symbol is often placed on graves for Memorial Day?",["American flag","Pumpkin","Shamrock","Heart"],0],["What national cemetery is especially associated with Memorial Day ceremonies?",["Arlington National Cemetery","Hollywood Forever","Forest Lawn only","Green-Wood only"],0],["Memorial Day is a federal holiday in which country?",["United States","Canada","Mexico","Ireland"],0],["What flower became an international symbol of remembrance after World War I?",["Poppy","Rose","Tulip","Lily"],0],["Memorial Day was formerly widely known by what name?",["Decoration Day","Liberty Day","Service Day","Union Day"],0],["The holiday grew out of remembrance practices after which U.S. conflict?",["Civil War","War of 1812","Spanish-American War","Revolutionary War"],0],["Since 1971, Memorial Day has been observed on which Monday?",["Last Monday in May","First Monday in May","Second Monday in May","Third Monday in May"],0],["At what time is the National Moment of Remembrance observed on Memorial Day?",["3:00 p.m. local time","Noon","9:00 a.m.","Midnight"],0],["Which poem helped popularize the red poppy as a remembrance symbol?",["In Flanders Fields","The Raven","O Captain! My Captain!","Paul Revere's Ride"],0],["Who wrote 'In Flanders Fields'?",["John McCrae","Walt Whitman","Robert Frost","Henry Wadsworth Longfellow"],0],["What action is traditionally taken with the U.S. flag until noon on Memorial Day?",["Flown at half-staff","Removed entirely","Flown upside down","Replaced with a state flag"],0],["Memorial Day became an official federal holiday under the Uniform Monday Holiday Act beginning in what year?",["1971","1945","1918","1985"],0],["Waterloo, New York, was federally recognized as what in relation to Memorial Day?",["The birthplace of Memorial Day","The largest military base","The first national cemetery","The home of the poppy"],0],["General John A. Logan issued an 1868 order calling for a national Decoration Day on what date?",["May 30","July 4","November 11","June 14"],0],["Memorial Day differs from Veterans Day because Memorial Day primarily honors whom?",["Those who died in military service","All living veterans","Only active-duty members","Military families only"],0],["Which organization historically promoted red poppies for remembrance in the U.S.?",["American Legion Auxiliary","NASA","USPS","National Park Service"],0],["Arlington National Cemetery is located in which state?",["Virginia","Maryland","Pennsylvania","New York"],0]],"independence":[["Independence Day is celebrated on what date?",["July 4","June 14","July 14","August 4"],0],["What document is celebrated on Independence Day?",["Declaration of Independence","Constitution only","Bill of Rights only","Emancipation Proclamation"],0],["In what year was the Declaration of Independence adopted?",["1776","1787","1812","1865"],0],["What colors are commonly displayed on Independence Day?",["Red, white, and blue","Orange and black","Green and gold","Purple and silver"],0],["What nighttime display is strongly associated with July 4?",["Fireworks","Jack-o'-lanterns","Christmas lights","Lantern parade only"],0],["Which city is home to the Liberty Bell?",["Philadelphia","Boston","New York City","Washington, D.C."],0],["How many original colonies declared independence?",["13","10","15","50"],0],["Who is credited with drafting the main text of the Declaration of Independence?",["Thomas Jefferson","George Washington","Benjamin Franklin only","James Madison"],0],["The Declaration was adopted by which body?",["Second Continental Congress","U.S. Senate","Supreme Court","Constitutional Convention"],0],["What country did the American colonies declare independence from?",["Great Britain","France","Spain","Portugal"],0],["Which founding father famously signed the Declaration with a large signature?",["John Hancock","Alexander Hamilton","James Monroe","John Jay"],0],["Independence Hall is located in which city?",["Philadelphia","Richmond","Boston","Baltimore"],0],["Which two future presidents died on July 4, 1826?",["John Adams and Thomas Jefferson","Washington and Madison","Monroe and Jackson","Lincoln and Grant"],0],["The first public reading of the Declaration in Philadelphia took place in what month?",["July","June","August","September"],0],["What is the opening phrase of the Declaration's second paragraph?",["We hold these truths to be self-evident","We the People","Four score and seven years ago","Give me liberty"],0],["Who served as president of the Continental Congress when the Declaration was adopted?",["John Hancock","Thomas Jefferson","George Washington","John Adams"],0],["Which printer produced an early broadside of the Declaration?",["John Dunlap","Benjamin Day","William Randolph Hearst","Horace Greeley"],0],["What anniversary did the U.S. celebrate in 1976?",["Bicentennial","Centennial","Semicentennial","Tricentennial"],0],["The 50-star U.S. flag first flew officially on July 4 of what year?",["1960","1959","1965","1976"],0],["Which composer wrote the patriotic march 'The Stars and Stripes Forever'?",["John Philip Sousa","George Gershwin","Aaron Copland","Leonard Bernstein"],0]],"labor":[["Labor Day is observed on which day of the week in the U.S.?",["Monday","Friday","Sunday","Wednesday"],0],["Labor Day is observed in which month?",["September","June","July","November"],0],["Labor Day honors the contributions of whom?",["Workers","Only politicians","Only soldiers","Only teachers"],0],["Which Monday in September is Labor Day?",["First Monday","Second Monday","Last Monday","Third Monday"],0],["Labor Day is a federal holiday in which country?",["United States","Ireland","Mexico only","Japan only"],0],["What season is approaching when Labor Day occurs?",["Fall","Spring","Winter","Summer begins"],0],["Labor Day weekend is often considered the unofficial end of what season?",["Summer","Winter","Spring","Fall"],0],["The first Labor Day parade in the U.S. was held in what city?",["New York City","Chicago","Boston","Philadelphia"],0],["The first U.S. Labor Day parade was held in what year?",["1882","1776","1914","1935"],0],["Which organization proposed an early Labor Day celebration in New York?",["Central Labor Union","Congress","Supreme Court","National Park Service"],0],["Labor Day became a federal holiday in what year?",["1894","1865","1918","1945"],0],["Who was U.S. president when Labor Day became a federal holiday?",["Grover Cleveland","Abraham Lincoln","William McKinley","Theodore Roosevelt"],0],["The Pullman Strike occurred in the same year Labor Day became a federal holiday. What year was that?",["1894","1882","1901","1912"],0],["Which broader movement helped establish Labor Day?",["Labor movement","Temperance movement only","Conservation movement only","Suffrage movement only"],0],["What does organized labor generally refer to?",["Workers joining together in unions","Government agencies","Only factory owners","Sports leagues"],0],["Which holiday is celebrated on May 1 in many countries as International Workers' Day?",["May Day","Flag Day","Arbor Day","Presidents Day"],0],["The U.S. Labor Day date differs from International Workers' Day because U.S. Labor Day falls in what month?",["September","May","March","December"],0],["Which U.S. department focuses on labor and workforce issues?",["Department of Labor","Department of State","Department of Energy","Department of Interior"],0],["What federal law established a national minimum wage and overtime rules in 1938?",["Fair Labor Standards Act","Sherman Act","GI Bill","Taft-Hartley Act"],0],["Frances Perkins, the first woman in a U.S. Cabinet, led which department?",["Department of Labor","Department of Treasury","Department of Defense","Department of Agriculture"],0]],"veterans":[["Veterans Day is observed on what date?",["November 11","May 30","July 4","November 1"],0],["Veterans Day honors whom?",["All U.S. military veterans","Only active-duty members","Only presidents","Only Medal of Honor recipients"],0],["Veterans Day was originally called what?",["Armistice Day","Decoration Day","Liberty Day","Service Day"],0],["The date November 11 is linked to the end of which war's fighting?",["World War I","World War II","Korean War","Vietnam War"],0],["At what hour did the World War I armistice take effect?",["11 a.m.","Midnight","Noon","6 a.m."],0],["What color is often used in remembrance poppies?",["Red","Blue","Green","Orange"],0],["Veterans Day is a federal holiday in which country?",["United States","Ireland only","Mexico only","Australia only"],0],["World War I fighting ended on the 11th hour of the 11th day of which month?",["November","October","December","September"],0],["Who signed legislation changing Armistice Day to Veterans Day in 1954?",["Dwight D. Eisenhower","Franklin D. Roosevelt","Harry Truman","John F. Kennedy"],0],["Veterans Day differs from Memorial Day because Veterans Day honors whom?",["All veterans","Only those who died in service","Only active-duty troops","Only military families"],0],["Which cemetery hosts a major national Veterans Day ceremony?",["Arlington National Cemetery","Gettysburg only","Forest Lawn","Hollywood Forever"],0],["The Tomb of the Unknown Soldier is located at which cemetery?",["Arlington National Cemetery","Gettysburg National Cemetery","Calverton National Cemetery","Fort Rosecrans only"],0],["What U.S. department administers many benefits for veterans?",["Department of Veterans Affairs","Department of Commerce","Department of Education","Department of Energy"],0],["The U.S. Department of Veterans Affairs is commonly abbreviated as what?",["VA","VET","USV","DVA only"],0],["Which symbol is used to represent military service branches collectively on many Veterans Day displays?",["U.S. flag","Shamrock","Pumpkin","Heart"],0],["Armistice Day became a U.S. legal holiday in what year?",["1938","1918","1945","1954"],0],["The holiday briefly moved to October under what federal law?",["Uniform Monday Holiday Act","GI Bill","Selective Service Act","War Powers Act"],0],["Veterans Day returned permanently to November 11 beginning in what year?",["1978","1968","1984","1991"],0],["Which president issued the first Veterans Day proclamation after the 1954 name change?",["Dwight D. Eisenhower","Harry Truman","Lyndon Johnson","Richard Nixon"],0],["The Tomb of the Unknown Soldier was dedicated in what year?",["1921","1918","1945","1954"],0]],"thanksgiving":[["Thanksgiving in the U.S. is celebrated on which day of the week?",["Thursday","Monday","Friday","Sunday"],0],["Thanksgiving is celebrated in which month in the U.S.?",["November","October","December","September"],0],["Which bird is strongly associated with Thanksgiving dinner?",["Turkey","Chicken only","Duck only","Goose only"],0],["What orange pie is commonly served at Thanksgiving?",["Pumpkin pie","Key lime pie","Cherry pie only","Lemon pie"],0],["What side dish is commonly made from potatoes?",["Mashed potatoes","Candy corn","Coleslaw only","Fruitcake"],0],["What berry sauce is commonly served at Thanksgiving?",["Cranberry sauce","Blueberry sauce","Strawberry sauce","Raspberry sauce"],0],["What big parade is held in New York City on Thanksgiving morning?",["Macy's Thanksgiving Day Parade","Rose Parade","St. Patrick's Parade","Tournament of Champions"],0],["Thanksgiving is observed on which Thursday in November?",["Fourth Thursday","First Thursday","Second Thursday","Last Thursday no matter what"],0],["Which U.S. president proclaimed a national Thanksgiving observance in 1863?",["Abraham Lincoln","George Washington","Thomas Jefferson","Theodore Roosevelt"],0],["Who wrote the editorials that helped persuade Lincoln to establish a national Thanksgiving observance?",["Sarah Josepha Hale","Harriet Beecher Stowe","Louisa May Alcott","Emily Dickinson"],0],["The 1621 harvest feast commonly linked with Thanksgiving took place in which colony?",["Plymouth Colony","Jamestown only","Roanoke","Georgia Colony"],0],["Which Indigenous people joined the Plymouth colonists at the 1621 harvest feast?",["Wampanoag","Cherokee","Navajo","Sioux"],0],["Which Native leader is commonly associated with the 1621 feast?",["Massasoit","Tecumseh","Geronimo","Sitting Bull"],0],["What ship brought the Pilgrims to New England in 1620?",["Mayflower","Santa Maria","Endeavour","Constitution"],0],["Which president moved Thanksgiving to an earlier Thursday in 1939?",["Franklin D. Roosevelt","Harry Truman","Herbert Hoover","Calvin Coolidge"],0],["Congress fixed Thanksgiving as the fourth Thursday of November in what year?",["1941","1863","1929","1954"],0],["The Macy's Thanksgiving Day Parade began in what year?",["1924","1901","1945","1960"],0],["Which department store sponsors the famous Thanksgiving parade in New York?",["Macy's","Target","Sears only","Nordstrom"],0],["The annual presidential turkey pardon tradition became a regular White House event under which president?",["George H. W. Bush","Abraham Lincoln","Franklin Roosevelt","John F. Kennedy"],0],["What football league traditionally schedules games on Thanksgiving?",["NFL","MLB","NHL only","MLS only"],0]],"christmas":[["Christmas Day is celebrated on what date?",["December 25","December 24","January 1","November 25"],0],["What decorated evergreen is strongly associated with Christmas?",["Christmas tree","Palm tree","Cactus only","Bonsai only"],0],["Who is traditionally said to deliver gifts on Christmas Eve?",["Santa Claus","Cupid","The Easter Bunny","Uncle Sam"],0],["What color is Santa's suit commonly shown as?",["Red","Purple","Orange","Blue only"],0],["What do people often hang by a fireplace for Santa to fill?",["Stockings","Umbrellas","Backpacks","Flags"],0],["What plant is associated with kissing at Christmas?",["Mistletoe","Shamrock","Clover","Marigold"],0],["What red-and-white striped candy is popular at Christmas?",["Candy cane","Candy corn","Gumdrop only","Chocolate egg"],0],["Christmas celebrates what event in Christianity?",["The birth of Jesus","The resurrection of Jesus","The Exodus","Pentecost"],0],["What town is named in the New Testament as the birthplace of Jesus?",["Bethlehem","Nazareth only","Jerusalem only","Rome"],0],["What reindeer is famous for having a red nose?",["Rudolph","Dasher","Comet","Blitzen"],0],["Which poem begins with the line about the night before Christmas?",["A Visit from St. Nicholas","The Raven","Stopping by Woods","Paul Revere's Ride"],0],["Who is traditionally credited with writing A Visit from St. Nicholas?",["Clement Clarke Moore","Charles Dickens","Robert Frost","Mark Twain"],0],["Who wrote A Christmas Carol?",["Charles Dickens","Mark Twain","Jane Austen","Bram Stoker"],0],["What is Ebenezer Scrooge's first name?",["Ebenezer","Edward","Elias","Edwin"],0],["What ballet features the Sugar Plum Fairy?",["The Nutcracker","Swan Lake","Giselle","Sleeping Beauty"],0],["Who composed The Nutcracker?",["Pyotr Ilyich Tchaikovsky","Mozart","Beethoven","Bach"],0],["What country is widely credited with popularizing the modern Christmas tree tradition?",["Germany","Spain","Greece","Brazil"],0],["The song White Christmas was made famous by which singer?",["Bing Crosby","Elvis Presley","Frank Sinatra only","Nat King Cole only"],0],["What 1965 TV special features Charlie Brown searching for the meaning of Christmas?",["A Charlie Brown Christmas","It's the Great Pumpkin","Frosty the Snowman","Rudolph"],0],["Which U.S. president signed legislation making Christmas a federal holiday in 1870?",["Ulysses S. Grant","Abraham Lincoln","Grover Cleveland","Theodore Roosevelt"],0]]};

  function dateOnly(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function nthWeekdayOfMonth(year, month, weekday, nth) {
    const first = new Date(year, month, 1);
    const offset = (weekday - first.getDay() + 7) % 7;
    return new Date(year, month, 1 + offset + 7 * (nth - 1));
  }

  function lastWeekdayOfMonth(year, month, weekday) {
    const last = new Date(year, month + 1, 0);
    const offset = (last.getDay() - weekday + 7) % 7;
    return new Date(year, month, last.getDate() - offset);
  }

  function easterDate(year) {
    // Anonymous Gregorian computus.
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  }

  function inRange(now, start, end) {
    const n = dateOnly(now).getTime();
    return n >= dateOnly(start).getTime() && n <= dateOnly(end).getTime();
  }

  function daysFrom(date, amount) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + amount);
    return copy;
  }

  function detectHoliday(now = new Date()) {
    if (HOLIDAY_MODE === "off") return null;
    if (HOLIDAY_MODE !== "auto" && HOLIDAYS[HOLIDAY_MODE]) return HOLIDAY_MODE;

    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    // New Year's: Dec 31 through Jan 2.
    if ((m === 11 && d === 31) || (m === 0 && d <= 2)) return "newyear";

    // Valentine's lead-in.
    if (m === 1 && d >= 10 && d <= 14) return "valentines";

    // St. Patrick's lead-in.
    if (m === 2 && d >= 14 && d <= 17) return "stpatrick";

    // Easter: Good Friday through Easter Sunday.
    const easter = easterDate(y);
    if (inRange(now, daysFrom(easter,-2), easter)) return "easter";

    // Memorial Day weekend through Memorial Day.
    const memorial = lastWeekdayOfMonth(y,4,1);
    if (inRange(now, daysFrom(memorial,-3), memorial)) return "memorial";

    // Independence Day lead-in.
    if (m === 6 && d >= 1 && d <= 4) return "independence";

    // Labor Day weekend through Labor Day.
    const labor = nthWeekdayOfMonth(y,8,1,1);
    if (inRange(now, daysFrom(labor,-3), labor)) return "labor";

    // Halloween week.
    if (m === 9 && d >= 24 && d <= 31) return "halloween";

    // Veterans Day.
    if (m === 10 && d >= 10 && d <= 11) return "veterans";

    // Thanksgiving: Monday before fourth Thursday through Sunday after.
    const thanksgiving = nthWeekdayOfMonth(y,10,4,4);
    if (inRange(now, daysFrom(thanksgiving,-3), daysFrom(thanksgiving,3))) return "thanksgiving";

    // Christmas season. New Year's takes over Dec 31.
    if (m === 11 && d >= 12 && d <= 30) return "christmas";

    return null;
  }

  const activeHoliday = detectHoliday();

  // Keep the existing Halloween engine internal and date-driven.
  // This runs BEFORE discover-v21-staged.js in the HTML.
  try {
    localStorage.setItem("discoverHalloweenMode", String(activeHoliday === "halloween"));
  } catch {}

  window.BigRedHolidayMode = Object.freeze({
    version: VERSION,
    mode: HOLIDAY_MODE,
    active: activeHoliday,
    detectHoliday
  });

  function addThemeClass(doc) {
    if (!doc || !doc.body) return;
    [...doc.body.classList]
      .filter(name => name === "holiday-mode" || name.startsWith("holiday-"))
      .forEach(name => doc.body.classList.remove(name));

    if (!activeHoliday) return;
    doc.body.classList.add("holiday-mode", `holiday-${HOLIDAYS[activeHoliday].class}`);
    doc.documentElement.dataset.bigRedHoliday = activeHoliday;
  }

  addThemeClass(document);

  // Theme the outer Discover wrapper too. Same-origin iframe allows this safely.
  try {
    if (window.parent && window.parent !== window) {
      const parentDoc = window.parent.document;
      let link = parentDoc.getElementById("bigRedHolidayCss");
      if (!link) {
        link = parentDoc.createElement("link");
        link.id = "bigRedHolidayCss";
        link.rel = "stylesheet";
        link.href = `holiday-mode.css?v=${VERSION}`;
        parentDoc.head.appendChild(link);
      }
      addThemeClass(parentDoc);
    }
  } catch (error) {
    console.info("Holiday wrapper theme unavailable.", error);
  }

  // No holiday means no game override. The normal Discover engine owns everything.
  if (!activeHoliday) return;

  // Halloween already has its dedicated full three-game banks in the core engine.
  // Holiday Mode only adds the site-wide theme and forces the internal flag ON.
  if (activeHoliday === "halloween") return;

  const meta = HOLIDAYS[activeHoliday];
  const sourceQuestions = HOLIDAY_TRIVIA[activeHoliday] || [];
  if (!sourceQuestions.length) return;

  const gamesPanel = document.getElementById("gamesPanel");
  const gamePanel = document.getElementById("gamePanel");
  const gameContent = document.getElementById("gameContent");
  const backToGamesBtn = document.getElementById("backToGamesBtn");
  if (!gamesPanel || !gamePanel || !gameContent) return;

  let timer = null;

  function shuffledCopy(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    })[char]);
  }

  function tieredQuestions() {
    return {
      easy: sourceQuestions.slice(0,7),
      medium: sourceQuestions.slice(7,14),
      hard: sourceQuestions.slice(14,20)
    };
  }

  function buildRounds() {
    const tiers = tieredQuestions();
    return [
      ...shuffledCopy(tiers.easy).slice(0,5).map(item => ({item, level:"EASY", points:1})),
      ...shuffledCopy(tiers.medium).slice(0,5).map(item => ({item, level:"MEDIUM", points:2})),
      ...shuffledCopy(tiers.hard).slice(0,5).map(item => ({item, level:"HARD", points:3}))
    ];
  }

  function showGamePanel() {
    gamesPanel.hidden = true;
    gamePanel.hidden = false;
  }

  function showGamesPanel() {
    gamePanel.hidden = true;
    gamesPanel.hidden = false;
  }

  function renderResults(state) {
    clearInterval(timer);
    gameContent.innerHTML = `
      <div class="holiday-game-label">${meta.emoji} ${escapeHtml(meta.label.toUpperCase())} TRIVIA</div>
      <div class="score-screen">
        <h2 class="score-title">${escapeHtml(meta.label)} Trivia Results</h2>
        <p class="score-subtitle">15 questions complete</p>
        <div class="score-hero">${state.correct}/15</div>
        <div class="score-grid">
          <div class="score-card"><span>Correct</span><strong>${state.correct}/15</strong></div>
          <div class="score-card"><span>Points</span><strong>${state.points}</strong></div>
          <div class="score-card"><span>Best Streak</span><strong>${state.bestStreak}</strong></div>
        </div>
        <div class="score-actions">
          <button id="holidayPlayAgain" class="score-primary" type="button">Play Again</button>
          <button id="holidayBackGames" class="score-secondary" type="button">Back to Games</button>
        </div>
      </div>
    `;
    document.getElementById("holidayPlayAgain").addEventListener("click", startHolidayTrivia);
    document.getElementById("holidayBackGames").addEventListener("click", showGamesPanel);
  }

  function startHolidayTrivia() {
    clearInterval(timer);
    const state = {
      rounds: buildRounds(),
      round: 0,
      correct: 0,
      points: 0,
      streak: 0,
      bestStreak: 0
    };

    function renderRound() {
      clearInterval(timer);
      if (state.round >= 15) {
        renderResults(state);
        return;
      }

      const current = state.rounds[state.round];
      const [question, answers, correct] = current.item;
      let finished = false;
      let remaining = 15;
      const deadline = Date.now() + 15000;

      gameContent.innerHTML = `
        <div class="holiday-game-label">${meta.emoji} ${escapeHtml(meta.label.toUpperCase())} TRIVIA</div>
        <div class="game-statusbar">
          <div class="game-status-pill">Question <strong>${state.round + 1}/15</strong></div>
          <div class="game-status-pill">Score <strong>${state.points}</strong></div>
          <div class="game-status-pill">Streak <strong>${state.streak}</strong></div>
          <div class="difficulty-pill">${current.level}</div>
          <div class="game-status-pill">Time <strong id="holidayTriviaTime">${remaining}s</strong></div>
        </div>
        <h2 class="game-title">${escapeHtml(meta.label)} Trivia</h2>
        <div class="game-prompt">${escapeHtml(question)}</div>
        <div class="answer-grid">
          ${answers.map((answer,index) => `
            <button class="answer-btn" data-holiday-answer="${index}" type="button">${escapeHtml(answer)}</button>
          `).join("")}
        </div>
        <div id="holidayTriviaResult" class="result-text" aria-live="polite"></div>
        <div class="next-row">
          <button id="holidayTriviaNext" class="next-btn" type="button" hidden>
            ${state.round === 14 ? "See Results" : "Next Question"}
          </button>
        </div>
      `;

      const buttons = [...gameContent.querySelectorAll("[data-holiday-answer]")];
      const result = document.getElementById("holidayTriviaResult");
      const next = document.getElementById("holidayTriviaNext");

      function finish(choice) {
        if (finished) return;
        finished = true;
        clearInterval(timer);
        buttons.forEach(button => button.disabled = true);

        if (choice === correct) {
          state.correct += 1;
          state.points += current.points;
          state.streak += 1;
          state.bestStreak = Math.max(state.bestStreak, state.streak);
          result.textContent = `Correct! +${current.points}`;
        } else {
          state.streak = 0;
          result.textContent = `Answer: ${answers[correct]}`;
        }

        next.hidden = false;
      }

      buttons.forEach(button => {
        button.addEventListener("click", () => finish(Number(button.dataset.holidayAnswer)));
      });

      next.addEventListener("click", () => {
        state.round += 1;
        renderRound();
      });

      timer = setInterval(() => {
        const msLeft = Math.max(0, deadline - Date.now());
        remaining = Math.ceil(msLeft / 1000);
        const clock = document.getElementById("holidayTriviaTime");
        if (clock) clock.textContent = `${remaining}s`;
        if (msLeft <= 0) finish(-1);
      }, 100);
    }

    showGamePanel();
    renderRound();
  }

  function applyHolidayGameUI() {
    addThemeClass(document);

    const eyebrow = gamesPanel.querySelector(".eyebrow");
    if (eyebrow) eyebrow.textContent = meta.eyebrow;

    const triviaCard = gamesPanel.querySelector('[data-game="trivia"]');
    if (triviaCard) {
      const title = triviaCard.querySelector("strong");
      const subtitle = triviaCard.querySelector("span");
      if (title) title.textContent = `${meta.label} Trivia`;
      if (subtitle) subtitle.textContent = "15 holiday questions • gets harder as you go";
    }
  }

  // Capture Trivia before the core game-card handler.
  gamesPanel.addEventListener("click", event => {
    const card = event.target.closest('.game-card[data-game="trivia"]');
    if (!card) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    startHolidayTrivia();
  }, true);

  if (backToGamesBtn) {
    backToGamesBtn.addEventListener("click", () => clearInterval(timer), true);
  }

  // The core Discover script loads after this module and may rewrite labels.
  // Re-apply our holiday labels after the current synchronous turn.
  setTimeout(applyHolidayGameUI, 0);
  window.addEventListener("load", applyHolidayGameUI, {once:true});
})();
