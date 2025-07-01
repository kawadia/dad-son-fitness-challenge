
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
  // Use Firebase Function endpoint
  private static readonly FUNCTION_URL = process.env.NODE_ENV === 'development' 
    ? 'http://127.0.0.1:5001/dad-v-son-fitness-challenge/us-central1/getMotivationalQuote'
    : 'https://us-central1-dad-v-son-fitness-challenge.cloudfunctions.net/getMotivationalQuote';

  static async getMotivationalQuote(stats: WorkoutStats): Promise<string> {
    try {
      const response = await fetch(this.FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stats)
      });

      if (!response.ok) {
        throw new Error(`Function request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.quote || this.getFallbackQuote(stats);
      
    } catch (error) {
      console.error('Error fetching motivational quote:', error);
      return this.getFallbackQuote(stats);
    }
  }


  private static getFallbackQuote(stats: WorkoutStats): string {
    const { dadGoalMet, sonGoalMet, hoursLeft } = stats;
    
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