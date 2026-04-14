const GAME_STATE = {
    MENU: 'MENU',
    COIN_TOSS: 'COIN_TOSS',
    KICKOFF: 'KICKOFF',
    PLAY_CALLING: 'PLAY_CALLING',
    PRE_SNAP: 'PRE_SNAP',
    PLAY_RUNNING: 'PLAY_RUNNING',
    POST_PLAY: 'POST_PLAY', // Tackle, incomplete pass, etc.
    CONVERSION: 'CONVERSION', // Selection screen for 1pt or 2pt
    GAME_OVER: 'GAME_OVER'
};

const TEAMS = [
    { name: 'Cardinals', color: '#97233F', secondary: '#000000', rating: 78, roster: { QB: 'Kyler Murray', RB: 'James Conner', WR: 'Marvin Harrison Jr.', LB: 'Kyzir White', S: 'Budda Baker' } },
    { name: 'Falcons', color: '#A71930', secondary: '#000000', rating: 80, roster: { QB: 'Kirk Cousins', RB: 'Bijan Robinson', WR: 'Drake London', LB: 'Kaden Elliss', S: 'Jessie Bates III' } },
    { name: 'Ravens', color: '#241773', secondary: '#000000', rating: 94, roster: { QB: 'Lamar Jackson', RB: 'Derrick Henry', WR: 'Zay Flowers', LB: 'Roquan Smith', S: 'Kyle Hamilton' } },
    { name: 'Bills', color: '#00338D', secondary: '#C60C30', rating: 92, roster: { QB: 'Josh Allen', RB: 'James Cook', WR: 'Amari Cooper', LB: 'Matt Milano', S: 'Taylor Rapp' } },
    { name: 'Panthers', color: '#0085CA', secondary: '#101820', rating: 72, roster: { QB: 'Bryce Young', RB: 'Chuba Hubbard', WR: 'Adam Thielen', LB: 'Shaq Thompson', S: 'Xavier Woods' } },
    { name: 'Bears', color: '#0B162A', secondary: '#C83803', rating: 76, roster: { QB: 'Caleb Williams', RB: "D'Andre Swift", WR: 'DJ Moore', LB: 'Tremaine Edmunds', S: 'Kevin Byard' } },
    { name: 'Bengals', color: '#FB4F14', secondary: '#000000', rating: 89, roster: { QB: 'Joe Burrow', RB: 'Zack Moss', WR: "Ja'Marr Chase", LB: 'Logan Wilson', S: 'Vonn Bell' } },
    { name: 'Browns', color: '#311D00', secondary: '#FF3C00', rating: 82, roster: { QB: 'Deshaun Watson', RB: 'Nick Chubb', WR: 'Jerry Jeudy', LB: 'Jeremiah Owusu-Koramoah', S: 'Grant Delpit' } },
    { name: 'Cowboys', color: '#003594', secondary: '#869397', rating: 88, roster: { QB: 'Dak Prescott', RB: 'Ezekiel Elliott', WR: 'CeeDee Lamb', LB: 'Micah Parsons', S: 'Malik Hooker' } },
    { name: 'Broncos', color: '#FB4F14', secondary: '#002244', rating: 77, roster: { QB: 'Bo Nix', RB: 'Javonte Williams', WR: 'Courtland Sutton', LB: 'Alex Singleton', S: 'Brandon Jones' } },
    { name: 'Lions', color: '#0076B6', secondary: '#B0B7BC', rating: 85, roster: { QB: 'Jared Goff', RB: 'Jahmyr Gibbs', WR: 'Amon-Ra St. Brown', LB: 'Alex Anzalone', S: 'Brian Branch' } },
    { name: 'Packers', color: '#203731', secondary: '#FFB612', rating: 84, roster: { QB: 'Jordan Love', RB: 'Josh Jacobs', WR: 'Jayden Reed', LB: 'Quay Walker', S: 'Xavier McKinney' } },
    { name: 'Texans', color: '#03202F', secondary: '#A71930', rating: 90, roster: { QB: 'C.J. Stroud', RB: 'Joe Mixon', WR: 'Nico Collins', LB: 'Azeez Al-Shaair', S: 'Jalen Pitre' } },
    { name: 'Colts', color: '#002C5F', secondary: '#A2AAAD', rating: 81, roster: { QB: 'Anthony Richardson', RB: 'Jonathan Taylor', WR: 'Michael Pittman Jr.', LB: 'Zaire Franklin', S: 'Julian Blackmon' } },
    { name: 'Jaguars', color: '#006778', secondary: '#9F792C', rating: 83, roster: { QB: 'Trevor Lawrence', RB: 'Travis Etienne Jr.', WR: 'Christian Kirk', LB: 'Foyesade Oluokun', S: 'Andre Cisco' } },
    { name: 'Chiefs', color: '#E31837', secondary: '#FFB81C', rating: 96, roster: { QB: 'Patrick Mahomes', RB: 'Isiah Pacheco', WR: 'Xavier Worthy', LB: 'Nick Bolton', S: 'Justin Reid' } },
    { name: 'Raiders', color: '#000000', secondary: '#A5ACAF', rating: 79, roster: { QB: 'Gardner Minshew', RB: 'Zamir White', WR: 'Davante Adams', LB: 'Robert Spillane', S: 'Tre’von Moehrig' } },
    { name: 'Chargers', color: '#0080C6', secondary: '#FFC20E', rating: 84, roster: { QB: 'Justin Herbert', RB: 'J.K. Dobbins', WR: 'Ladd McConkey', LB: 'Khalil Mack', S: 'Derwin James Jr.' } },
    { name: 'Rams', color: '#003594', secondary: '#FFA300', rating: 86, roster: { QB: 'Matthew Stafford', RB: 'Kyren Williams', WR: 'Cooper Kupp', LB: 'Ernest Jones', S: 'Kamren Curl' } },
    { name: 'Dolphins', color: '#008E97', secondary: '#FC4C02', rating: 88, roster: { QB: 'Tua Tagovailoa', RB: 'Raheem Mostert', WR: 'Tyreek Hill', LB: 'David Long Jr.', S: 'Jevon Holland' } },
    { name: 'Vikings', color: '#4F2683', secondary: '#FFC62F', rating: 85, roster: { QB: 'Sam Darnold', RB: 'Aaron Jones', WR: 'Justin Jefferson', LB: 'Ivan Pace Jr.', S: 'Harrison Smith' } },
    { name: 'Patriots', color: '#002244', secondary: '#C60C30', rating: 74, roster: { QB: 'Drake Maye', RB: 'Rhamondre Stevenson', WR: 'DeMario Douglas', LB: 'Ja\'Whaun Bentley', S: 'Kyle Dugger' } },
    { name: 'Saints', color: '#D3BC8D', secondary: '#101820', rating: 79, roster: { QB: 'Derek Carr', RB: 'Alvin Kamara', WR: 'Chris Olave', LB: 'Demario Davis', S: 'Tyrann Mathieu' } },
    { name: 'Giants', color: '#002244', secondary: '#A71930', rating: 75, roster: { QB: 'Daniel Jones', RB: 'Devin Singletary', WR: 'Malik Nabers', LB: 'Bobby Okereke', S: 'Jason Pinnock' } },
    { name: 'Jets', color: '#125740', secondary: '#000000', rating: 80, roster: { QB: 'Aaron Rodgers', RB: 'Breece Hall', WR: 'Garrett Wilson', LB: 'C.J. Mosley', S: 'Sauce Gardner' } },
    { name: 'Eagles', color: '#004C54', secondary: '#A5ACAF', rating: 91, roster: { QB: 'Jalen Hurts', RB: 'Saquon Barkley', WR: 'A.J. Brown', LB: 'Zack Baun', S: 'C.J. Gardner-Johnson' } },
    { name: 'Steelers', color: '#FFB612', secondary: '#101820', rating: 87, roster: { QB: 'Russell Wilson', RB: 'Najee Harris', WR: 'George Pickens', LB: 'T.J. Watt', S: 'Minkah Fitzpatrick' } },
    { name: '49ers', color: '#AA0000', secondary: '#B3995D', rating: 95, roster: { QB: 'Brock Purdy', RB: 'Christian McCaffrey', WR: 'Deebo Samuel', LB: 'Fred Warner', S: 'Talanoa Hufunga', DL: 'Nick Bosa' } },
    { name: 'Seahawks', color: '#002244', secondary: '#69BE28', rating: 83, roster: { QB: 'Geno Smith', RB: 'Kenneth Walker III', WR: 'DK Metcalf', LB: 'Tyrel Dodson', S: 'Julian Love' } },
    { name: 'Buccaneers', color: '#D50A0A', secondary: '#FF7900', rating: 86, roster: { QB: 'Baker Mayfield', RB: 'Rachaad White', WR: 'Mike Evans', LB: 'Lavonte David', S: 'Antoine Winfield Jr.' } },
    { name: 'Titans', color: '#0C2340', secondary: '#4B92DB', rating: 78, roster: { QB: 'Will Levis', RB: 'Tony Pollard', WR: 'Calvin Ridley', LB: 'Kenneth Murray', S: 'Amani Hooker' } },
    { name: 'Commanders', color: '#5A1414', secondary: '#FFB612', rating: 76, roster: { QB: 'Jayden Daniels', RB: 'Brian Robinson Jr.', WR: 'Terry McLaurin', LB: 'Bobby Wagner', S: 'Jeremy Chinn' } }
];

const FIELD = {
    WIDTH: 1024,
    HEIGHT: 600, // Playable area height
    YARD_PIXELS: 10,
};

const KEYS = {
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    P: 'p',
    T: 't',
    DIGIT_1: '1',
    DIGIT_2: '2',
    DIGIT_3: '3'
};
