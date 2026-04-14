const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatBox = document.getElementById('chatBox');

// Advanced mock knowledge base - Expanded to "know everything"
const sharkKnowledge = [
    // --- FAMOUS SPECIES ---
    {
        keywords: ['great white', 'white pointer', 'carcharodon carcharias', 'jaws'],
        response: "The Great White Shark (Carcharodon carcharias) is the world's largest known predatory fish. They can grow up to 20 feet (6 meters) long and weigh over 4,000 pounds. They are known for their highly developed senses and can detect one drop of blood in 100 liters of water!"
    },
    {
        keywords: ['megalodon', 'extinct', 'biggest shark ever'],
        response: "Megalodon was the largest shark that ever lived, roaming the oceans approximately 23 to 3.6 million years ago. It could reach terrifying lengths of up to 60 feet (18 meters) and its teeth were the size of a human hand. Don't worry, they are definitely extinct!"
    },
    {
        keywords: ['whale shark', 'largest shark', 'biggest shark', 'biggest'],
        response: "The Whale Shark is the largest living shark species! Despite their massive size (up to 40 feet or 12 meters), they are gentle giants known as filter feeders. They swim with their large mouths open, filtering plankton, small fish, and krill from the water."
    },
    {
        keywords: ['bull shark', 'freshwater', 'river', 'amazon', 'lake'],
        response: "Bull Sharks are unique because they can survive in both saltwater and freshwater! They have special kidneys and glands that help them retain salt, allowing them to swim far up rivers like the Amazon and even into lakes like Lake Nicaragua."
    },
    {
        keywords: ['tiger shark', 'garbage can', 'stripes'],
        response: "Tiger sharks are sometimes called the 'garbage cans of the sea' because they'll eat almost anything! They are the second largest predatory shark and have beautiful dark stripes that fade as they age."
    },
    {
        keywords: ['hammerhead', 'weird head', 'cephalofoil'],
        response: "Hammerhead sharks are famous for their uniquely shaped heads, called a cephalofoil. This 'hammer' shape improves their vision, giving them 360-degree sight, and helps them pin down their favorite food: stingrays."
    },

    // --- DEEP SEA & RARE SPECIES ---
    {
        keywords: ['goblin shark', 'pink', 'long nose', 'deep sea', 'alien'],
        response: "The Goblin Shark is a pink, deep-sea shark with a long, flattened snout and telescopic jaws that snap forward to catch prey! Often called a 'living fossil', it looks like something from another planet."
    },
    {
        keywords: ['cookiecutter shark', 'hole', 'bite', 'glow', 'small'],
        response: "The Cookiecutter Shark is small but terrifying! They use a suction-cup mouth and saw-like teeth to bite perfectly circular 'cookie' chunks out of much larger animals, including whales, dolphins, and even submarines."
    },
    {
        keywords: ['frilled shark', 'eel', 'prehistoric', 'many teeth'],
        response: "The Frilled Shark looks more like an eel than a shark. It has 300 needle-sharp teeth arranged in 25 rows and is one of the most primitive shark species still alive today."
    },
    {
        keywords: ['greenland shark', 'oldest', 'arctic', 'cold'],
        response: "The Greenland Shark is the longest-living vertebrate on Earth! They can live for over 400 years in the freezing Arctic waters. They grow only about 1cm per year and don't reach maturity until they are about 150 years old."
    },
    {
        keywords: ['thresher shark', 'long tail', 'whip'],
        response: "Thresher sharks are famous for their incredibly long, whip-like tails. The tail can be as long as the shark's body and is used as a weapon to stun schools of fish with high-speed strikes!"
    },
    {
        keywords: ['basking shark', 'mouth open', 'second largest'],
        response: "The Basking Shark is the second-largest shark in the world. Like the Whale Shark, it is a filter feeder and is often seen 'basking' near the surface with its massive mouth wide open to filter plankton."
    },
    {
        keywords: ['mako', 'fastest', 'speed', 'jump'],
        response: "The Shortfin Mako is the fastest shark in the ocean. They can burst swim at speeds of up to 45 mph (74 km/h) and can leap over 20 feet out of the water!"
    },

    // --- BIOLOGY & ANATOMY ---
    {
        keywords: ['teeth', 'bite', 'rows', 'how many'],
        response: "Sharks are the ultimate tooth factories! A shark can grow and lose tens of thousands of teeth in its lifetime. They are arranged in multiple rows like a conveyor belt, so when a front tooth is lost, another rolls forward within days."
    },
    {
        keywords: ['bones', 'skeleton', 'cartilage'],
        response: "Sharks don't have true bones! Their entire skeleton is made of cartilage, the same lightweight, flexible material found in human ears and noses. This makes them much more agile in the water."
    },
    {
        keywords: ['skin', 'sandpaper', 'denticles'],
        response: "Shark skin feels like sandpaper because it is covered in tiny tooth-like scales called 'dermal denticles'. These help the shark swim silently and protect it from parasites."
    },
    {
        keywords: ['sixth sense', 'electric', 'electroreception', 'ampullae'],
        response: "Sharks have a 'sixth sense' called electroreception. Using tiny pores on their snouts called 'Ampullae of Lorenzini', they can detect the weak electrical fields emitted by the heartbeats of prey hiding in the sand."
    },
    {
        keywords: ['smell', 'blood'],
        response: "A shark's sense of smell is legendary. Some species can detect a single drop of blood in an Olympic-sized swimming pool from over a mile away!"
    },
    {
        keywords: ['sleep', 'moving', 'ram ventilation'],
        response: "It's a myth that all sharks must constantly swim! While 'obligate ram ventilators' like Great Whites must keep moving to breathe, many sharks like nurse sharks can stay still and pump water over their gills manually (buccal pumping)."
    },

    // --- BEHAVIOR & CONSERVATION ---
    {
        keywords: ['diet', 'eat', 'prey', 'food'],
        response: "A shark's diet is incredibly diverse! Great Whites love seals, Whale Sharks eat microscopic plankton, Bull Sharks eat other sharks, and Bonnethead sharks actually eat seagrass, making them the only known omnivorous sharks!"
    },
    {
        keywords: ['attack', 'bite human', 'dangerous', 'aggressive'],
        response: "Shark attacks are extremely rare. You are statistically more likely to be killed by a falling coconut or a vending machine than by a shark. Most bites are 'test bites' where the shark mistakes a human for a seal."
    },
    {
        keywords: ['fins', 'finning', 'soup', 'extinction'],
        response: "Sharks are in trouble. Over 100 million sharks are killed every year, largely for the shark fin soup trade. This practice, called finning, is causing many shark populations to decline by over 90%."
    },
    {
        keywords: ['evolution', 'oldest', 'primitive', 'trees', 'dinosaurs'],
        response: "Sharks are masters of survival. They have been on Earth for over 400 million years—they are older than dinosaurs and even older than trees!"
    },
    {
        keywords: ['nursery', 'babies', 'eggs', 'pups', 'birth'],
        response: "Sharks have three ways of giving birth: some lay eggs (like Port Jackson sharks), some hatch eggs inside the body, and some give live birth (like Great Whites). Young sharks are called 'pups'."
    }
];

const fallbackResponses = [
    "That's a deep-sea mystery! While I don't have that specific detail, did you know that sharks have been swimming in our oceans for over 400 million years?",
    "My shark senses are tingling, but I'm not sure about that one. Try asking about specific species like Great Whites, Goblins, or Whale Sharks!",
    "I'm still diving into that part of shark lore. However, did you know some sharks, like the Bonnethead, actually eat seagrass?",
    "Fascinating query! I don't know the exact answer, but I do know that sharks don't have vocal cords—they are completely silent hunters."
];

/**
 * Advanced matching logic with keyword weighting and scoring
 */
function generateResponse(input) {
    const lowerInput = input.toLowerCase().trim();

    // 1. Check greetings
    if (lowerInput.match(/^(hi|hello|hey|greetings|yo|sup|hola)\b/)) {
        return "Hello there, ocean explorer! I am Sharkpedia AI, the world's most complete shark database. What would you like to know?";
    }

    if (lowerInput.match(/^(thanks|thank you|thx)\b/)) {
        return "You're very welcome! I'm always happy to share the wonders of the deep. What else is on your mind?";
    }

    // 2. Score knowledge entries
    let bestMatch = null;
    let highestScore = 0;

    for (let entry of sharkKnowledge) {
        let currentScore = 0;
        for (let keyword of entry.keywords) {
            // Check for exact word match or substring
            if (lowerInput.includes(keyword)) {
                currentScore += 10;
                // Bonus for exact word matches (to avoid 'eat' matching 'great')
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                if (regex.test(lowerInput)) {
                    currentScore += 20;
                }
            }
        }

        if (currentScore > highestScore) {
            highestScore = currentScore;
            bestMatch = entry;
        }
    }

    // 3. Return best match if score is significant
    if (bestMatch && highestScore >= 10) {
        return bestMatch.response;
    }

    // 4. Randomized fallback for unknown queries
    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return randomFallback;
}


function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    const avatar = type === 'ai'
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="#00D2FF"><path d="M12 2C8.5 7 6 12 4 15C3 16.5 4 18 6 18C7 18 8 17 9 16C10 17.5 11.5 19 13.5 19C15.5 19 17 17.5 18 16C19 17 20 18 21 18C23 18 24 16.5 23 15C21 12 18.5 7 15 2L12 2Z"/></svg>`
        : 'U';

    messageDiv.innerHTML = `
        <div class="avatar">${avatar}</div>
        <div class="message-content">${content}</div>
    `;

    chatBox.appendChild(messageDiv);
    scrollToBottom();
}

function addTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'message ai-message typing-indicator-container';
    indicatorDiv.id = 'typingIndicator';

    indicatorDiv.innerHTML = `
        <div class="avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#00D2FF"><path d="M12 2C8.5 7 6 12 4 15C3 16.5 4 18 6 18C7 18 8 17 9 16C10 17.5 11.5 19 13.5 19C15.5 19 17 17.5 18 16C19 17 20 18 21 18C23 18 24 16.5 23 15C21 12 18.5 7 15 2L12 2Z"/></svg>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;

    chatBox.appendChild(indicatorDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    userInput.value = '';

    // Add typing indicator
    addTypingIndicator();

    // Simulate AI thinking delay (800ms to 1800ms)
    const delay = Math.floor(Math.random() * 1000) + 800;

    setTimeout(() => {
        removeTypingIndicator();
        const response = generateResponse(message);
        addMessage(response, 'ai');
    }, delay);
});
