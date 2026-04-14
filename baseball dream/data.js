const TEAMS = [
  {
    name: "Los Angeles Dodgers",
    location: "Los Angeles",
    colors: ["#005A9C", "#FFFFFF", "#EF3E42"],
    lineup: [
      { name: "Shohei Ohtani", pos: "DH", contact: 95, power: 99, speed: 90 },
      { name: "Kyle Tucker", pos: "RF", contact: 88, power: 85, speed: 82 },
      { name: "Mookie Betts", pos: "SS", contact: 92, power: 80, speed: 88 },
      { name: "Freddie Freeman", pos: "1B", contact: 94, power: 82, speed: 65 },
      { name: "Will Smith", pos: "C", contact: 85, power: 78, speed: 60 },
      { name: "Max Muncy", pos: "3B", contact: 78, power: 88, speed: 50 },
      { name: "Teoscar Hernández", pos: "LF", contact: 80, power: 84, speed: 75 },
      { name: "Tommy Edman", pos: "2B", contact: 82, power: 65, speed: 92 },
      { name: "Andy Pages", pos: "CF", contact: 75, power: 72, speed: 80 }
    ],
    pitchers: [
      { name: "Yoshinobu Yamamoto", ovr: 92, types: ["F", "S", "C", "CH"] },
      { name: "Tyler Glasnow", ovr: 90, types: ["F", "S", "C"] }
    ]
  },
  {
    name: "New York Yankees",
    location: "New York",
    colors: ["#003087", "#E31837", "#FFFFFF"],
    lineup: [
      { name: "Trent Grisham", pos: "CF", contact: 76, power: 68, speed: 85 },
      { name: "Aaron Judge", pos: "RF", contact: 90, power: 99, speed: 75 },
      { name: "Cody Bellinger", pos: "LF", contact: 82, power: 85, speed: 88 },
      { name: "Ben Rice", pos: "1B", contact: 78, power: 80, speed: 60 },
      { name: "Giancarlo Stanton", pos: "DH", contact: 72, power: 95, speed: 40 },
      { name: "Jazz Chisholm Jr.", pos: "2B", contact: 84, power: 82, speed: 94 },
      { name: "Ryan McMahon", pos: "3B", contact: 80, power: 78, speed: 65 },
      { name: "José Caballero", pos: "SS", contact: 75, power: 62, speed: 90 },
      { name: "Austin Wells", pos: "C", contact: 80, power: 75, speed: 55 }
    ],
    pitchers: [
      { name: "Gerrit Cole", ovr: 94, types: ["F", "S", "C", "CH"] },
      { name: "Carlos Rodón", ovr: 88, types: ["F", "S", "C"] }
    ]
  },
  {
    name: "Toronto Blue Jays",
    location: "Toronto",
    colors: ["#134A8E", "#1D2D5C", "#E8291C"],
    lineup: [
      { name: "George Springer", pos: "DH", contact: 80, power: 78, speed: 82 },
      { name: "Daulton Varsho", pos: "CF", contact: 78, power: 75, speed: 88 },
      { name: "Vladimir Guerrero Jr.", pos: "1B", contact: 92, power: 95, speed: 55 },
      { name: "Addison Barger", pos: "RF", contact: 75, power: 78, speed: 72 },
      { name: "Alejandro Kirk", pos: "C", contact: 85, power: 70, speed: 30 },
      { name: "Jesús Sánchez", pos: "LF", contact: 78, power: 82, speed: 75 },
      { name: "Kazuma Okamoto", pos: "3B", contact: 82, power: 88, speed: 50 },
      { name: "Ernie Clement", pos: "2B", contact: 84, power: 60, speed: 78 },
      { name: "Andrés Gímenez", pos: "SS", contact: 82, power: 68, speed: 90 }
    ],
    pitchers: [
      { name: "Kevin Gausman", ovr: 90, types: ["F", "S", "CH"] },
      { name: "José Berríos", ovr: 88, types: ["F", "S", "C", "CH"] }
    ]
  },
  {
    name: "Philadelphia Phillies",
    location: "Philadelphia",
    colors: ["#E81828", "#29468E", "#FFFFFF"],
    lineup: [
      { name: "Trea Turner", pos: "SS", contact: 88, power: 75, speed: 98 },
      { name: "Kyle Schwarber", pos: "DH", contact: 75, power: 98, speed: 45 },
      { name: "Bryce Harper", pos: "1B", contact: 92, power: 94, speed: 80 },
      { name: "Alec Bohm", pos: "3B", contact: 86, power: 78, speed: 55 },
      { name: "Adolis García", pos: "RF", contact: 80, power: 90, speed: 85 },
      { name: "Brandon Marsh", pos: "LF", contact: 82, power: 72, speed: 84 },
      { name: "Bryson Stott", pos: "2B", contact: 84, power: 65, speed: 88 },
      { name: "J.T. Realmuto", pos: "C", contact: 82, power: 75, speed: 82 },
      { name: "Justin Crawford", pos: "CF", contact: 78, power: 60, speed: 96 }
    ],
    pitchers: [
      { name: "Zack Wheeler", ovr: 93, types: ["F", "S", "C", "CH"] },
      { name: "Aaron Nola", ovr: 90, types: ["F", "S", "C", "CH"] }
    ]
  }
];

// Generate generic data for other 26 teams to reach 30
const OTHER_TEAMS = [
  "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox", "Chicago Cubs", "Chicago White Sox",
  "Cincinnati Reds", "Cleveland Guardians", "Colorado Rockies", "Detroit Tigers", "Houston Astros",
  "Kansas City Royals", "Los Angeles Angels", "Miami Marlins", "Milwaukee Brewers", "Minnesota Twins",
  "New York Mets", "Oakland Athletics", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants",
  "Seattle Mariners", "St. Louis Cardinals", "Tampa Bay Rays", "Texas Rangers", "Washington Nationals", "Arizona Diamondbacks"
];

OTHER_TEAMS.forEach(name => {
  TEAMS.push({
    name: name,
    location: name.split(' ').slice(0, -1).join(' '),
    colors: ["#333333", "#CCCCCC"],
    lineup: Array.from({ length: 9 }, (_, i) => ({
      name: `Player ${i + 1}`,
      pos: ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"][i],
      contact: 70 + Math.random() * 20,
      power: 60 + Math.random() * 30,
      speed: 50 + Math.random() * 40
    })),
    pitchers: [
      { name: `Ace Pitcher`, ovr: 85 + Math.random() * 10, types: ["F", "S", "C", "CH"] }
    ]
  });
});

// End of data.js - Exporting to global scope instead of ES modules for local compatibility
window.TEAMS_DATA = TEAMS;
