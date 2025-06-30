import React, { useState, useEffect } from 'react';
import { UserType } from '../types';
import { MotivationService, getTimeLeft } from '../services/motivationService';

interface MotivationalQuoteProps {
  getTodaysProgress: (user: UserType) => number;
  isConnected: boolean;
}

export const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({
  getTodaysProgress,
  isConnected
}) => {
  const [quote, setQuote] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadMotivationalQuote();
    }
  }, [isConnected, getTodaysProgress]);

  const loadMotivationalQuote = async () => {
    setIsLoading(true);
    try {
      const dadReps = getTodaysProgress('Dad');
      const sonReps = getTodaysProgress('Son');
      const { hoursLeft, minutesLeft } = getTimeLeft();
      
      const stats = {
        dadReps,
        sonReps,
        dadGoalMet: dadReps >= 141,
        sonGoalMet: sonReps >= 141,
        hoursLeft,
        minutesLeft,
        currentTime: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        currentDate: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      const motivationalQuote = await MotivationService.getMotivationalQuote(stats);
      setQuote(motivationalQuote);
    } catch (error) {
      console.error('Error loading motivational quote:', error);
      setQuote('💪 The family that works out together, stays strong together!');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="motivational-quote">
      <div className="quote-content">
        {isLoading ? (
          <div className="quote-loading">
            <span className="loading-spinner">⏳</span>
            <span>Getting your daily motivation...</span>
          </div>
        ) : (
          <div className="quote-text">
            {quote}
          </div>
        )}
      </div>
    </div>
  );
};