import React, { useEffect, useState } from 'react';
import { UserType } from '../types';

interface ProgressSectionProps {
  getTodaysProgress: (user: UserType) => number;
  getTodaysSessions: (user: UserType) => any[];
  calculateStreak: (user: UserType) => number;
  dailyGoal: number;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  getTodaysProgress,
  getTodaysSessions,
  calculateStreak,
  dailyGoal
}) => {
  const [dateTimeInfo, setDateTimeInfo] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      try {
        const now = new Date();
        
        const dateOptions: Intl.DateTimeFormatOptions = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        };
        const formattedDate = now.toLocaleDateString('en-US', dateOptions);
        
        const timeOptions: Intl.DateTimeFormatOptions = { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        };
        const currentTime = now.toLocaleTimeString('en-US', timeOptions);
        
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const timeLeft = endOfDay.getTime() - now.getTime();
        
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        const timeLeftString = `${hoursLeft}h ${minutesLeft}m`;
        
        setDateTimeInfo(`📅 ${formattedDate} | ⏰ ${currentTime} | ⏳ ${timeLeftString} left today`);
      } catch (error) {
        console.error('Error updating date/time:', error);
        setDateTimeInfo('📅 Error loading date/time');
      }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const renderProgressCard = (user: UserType) => {
    const progress = getTodaysProgress(user);
    const percentage = Math.min((progress / dailyGoal) * 100, 100);
    const userLower = user.toLowerCase();
    const emoji = user === 'Dad' ? '👨' : '👦';

    return (
      <div key={user} className={`progress-card ${userLower}`}>
        <div className="progress-header">
          <div className="progress-label">{emoji} {user}'s Progress</div>
          <div className="progress-value">{progress}/{dailyGoal} 💪</div>
        </div>
        <div className={`progress-bar ${userLower}`}>
          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
        </div>
        {progress >= dailyGoal && (
          <div className="goal-completed">🎉 GOAL COMPLETED! 🎉</div>
        )}
      </div>
    );
  };

  const renderStatCard = (user: UserType, type: 'streak' | 'sessions') => {
    const userLower = user.toLowerCase();
    const emoji = user === 'Dad' ? '👨' : '👦';
    const streak = calculateStreak(user);
    const sessions = getTodaysSessions(user);
    
    const value = type === 'streak' ? `${streak} days 🏆` : `${sessions.length} 💯`;
    const label = type === 'streak' ? `${emoji} ${user}'s Streak` : `${emoji} ${user}'s Sessions`;

    return (
      <div key={`${user}-${type}`} className={`stat-card ${userLower}-${type}`}>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    );
  };

  return (
    <div className="progress-section">
      <div className="progress-title">🏆 Today's Challenge Progress 🏆</div>
      <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.9rem', color: '#6b7280' }}>
        <div>{dateTimeInfo}</div>
      </div>
      
      <div className="progress-grid">
        {renderProgressCard('Dad')}
        {renderProgressCard('Son')}
      </div>

      <div className="stats-grid">
        {renderStatCard('Dad', 'streak')}
        {renderStatCard('Dad', 'sessions')}
        {renderStatCard('Son', 'streak')}
        {renderStatCard('Son', 'sessions')}
      </div>
    </div>
  );
};