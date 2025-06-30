
interface WorkoutStats {
  dadReps: number;
  sonReps: number;
  dadGoalMet: boolean;
  sonGoalMet: boolean;
  hoursLeft: number;
  minutesLeft: number;
  currentTime: string;
  currentDate: string;
}

export class MotivationService {
  private static readonly API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;
  private static readonly API_URL = 'https://api.anthropic.com/v1/messages';

  static async getMotivationalQuote(stats: WorkoutStats): Promise<string> {
    if (!this.API_KEY) {
      console.warn('Claude API key not found, using fallback quotes');
      return this.getFallbackQuote(stats);
    }

    try {
      const prompt = this.createPrompt(stats);
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text || this.getFallbackQuote(stats);
      
    } catch (error) {
      console.error('Error fetching motivational quote:', error);
      return this.getFallbackQuote(stats);
    }
  }

  private static createPrompt(stats: WorkoutStats): string {
    const { dadReps, sonReps, dadGoalMet, sonGoalMet, hoursLeft, minutesLeft } = stats;
    
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

  private static getFallbackQuote(stats: WorkoutStats): string {
    const { dadReps, sonReps, dadGoalMet, sonGoalMet, hoursLeft } = stats;
    
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
}

// Helper function to calculate time left in day
export const getTimeLeft = () => {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const timeLeft = endOfDay.getTime() - now.getTime();
  
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hoursLeft, minutesLeft };
};