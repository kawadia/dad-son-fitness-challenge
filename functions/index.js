const {onRequest} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");

// Initialize Firebase Admin SDK
const admin = require("firebase-admin");
admin.initializeApp();

// Claude API endpoint
exports.getMotivationalQuote = onRequest({
  cors: true,
  secrets: ["CLAUDE_API_KEY"]
}, async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    const {
      dadReps,
      sonReps,
      dadGoalMet,
      sonGoalMet,
      hoursLeft,
      minutesLeft,
      currentTime,
      currentDate
    } = req.body;

    // Validate required fields
    if (typeof dadReps !== "number" || typeof sonReps !== "number") {
      return res.status(400).json({error: "Invalid workout data"});
    }

    // Get Claude API key from Firebase secrets
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      logger.warn("Claude API key not configured, using fallback");
      return res.json({
        quote: getFallbackQuote({
          dadReps,
          sonReps,
          dadGoalMet,
          sonGoalMet,
          hoursLeft
        })
      });
    }

    // Create prompt for Claude
    const prompt = createPrompt({
      dadReps,
      sonReps,
      dadGoalMet,
      sonGoalMet,
      hoursLeft,
      minutesLeft
    });

    // Call Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 150,
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      logger.error(`Claude API error: ${response.status}`);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const quote = data.content[0].text || getFallbackQuote({
      dadReps,
      sonReps,
      dadGoalMet,
      sonGoalMet,
      hoursLeft
    });

    return res.json({quote});

  } catch (error) {
    logger.error("Error in getMotivationalQuote:", error);
    
    // Return fallback quote on error
    const fallbackQuote = getFallbackQuote({
      dadReps: req.body.dadReps || 0,
      sonReps: req.body.sonReps || 0,
      dadGoalMet: req.body.dadGoalMet || false,
      sonGoalMet: req.body.sonGoalMet || false,
      hoursLeft: req.body.hoursLeft || 12
    });
    
    return res.json({quote: fallbackQuote});
  }
});

function createPrompt({dadReps, sonReps, dadGoalMet, sonGoalMet, hoursLeft, minutesLeft}) {
  return `Generate a SHORT (1-2 sentences max), funny, and motivational quote for a dad and son fitness challenge app. Here's the current situation:

Dad (47 years old): ${dadReps}/141 reps today (Goal ${dadGoalMet ? 'COMPLETED ✅' : 'NOT YET reached'})
Son (12 years old): ${sonReps}/141 reps today (Goal ${sonGoalMet ? 'COMPLETED ✅' : 'NOT YET reached'})
Time left today: ${hoursLeft}h ${minutesLeft}m

Make it:
- Funny and light-hearted
- Motivating for both dad and son
- Reference their current progress
- Mention time left if relevant
- Keep it brief (under 25 words)
- Use emojis sparingly

Just return the quote, nothing else.`;
}

function getFallbackQuote({dadReps, sonReps, dadGoalMet, sonGoalMet, hoursLeft}) {
  const fallbackQuotes = [
    "💪 The family that squats together, stays together! Keep pushing!",
    "🏃‍♂️ Dad vs Son: The ultimate fitness showdown continues!",
    "🔥 Every rep counts in this epic father-son battle!",
    "⚡ Sweat now, high-five later! You've got this team!",
    "🎯 141 reps standing between you and victory!",
    "💥 Dad's muscles vs Son's energy - who will win today?",
    "🏆 Champions are made one workout at a time!",
    "⭐ The only bad workout is the one you didn't do!",
    "🚀 Blast off to fitness greatness, team family!",
    "🌟 Strong families finish strong together!"
  ];

  // Select based on progress and time
  if (dadGoalMet && sonGoalMet) {
    return "🎉 Both champions completed their goals! Time for a victory dance! 🕺💃";
  } else if (dadGoalMet) {
    return `👨 Dad's crushing it! Son, can you catch up with ${hoursLeft}h left? 🏃‍♂️`;
  } else if (sonGoalMet) {
    return `👦 Son's on fire! Dad, time to show those dad muscles! 💪`;
  } else if (hoursLeft < 3) {
    return "⏰ Crunch time! Every rep counts in the final hours! 🔥";
  } else {
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }
}