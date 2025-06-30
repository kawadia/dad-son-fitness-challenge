import React from 'react';
import { UserType, WorkoutSession } from '../types';

interface SessionsListProps {
  getTodaysSessions: (user: UserType) => WorkoutSession[];
}

const exercises = {
  'squats': '🏋️',
  'sit-ups': '🤸',
  'pushups': '💪',
  'Bulgarian squats': '🦵',
  'lunges': '🏃'
};

export const SessionsList: React.FC<SessionsListProps> = ({ getTodaysSessions }) => {
  const renderSessionCard = (user: UserType) => {
    const sessions = getTodaysSessions(user);
    const emoji = user === 'Dad' ? '👨' : '👦';

    return (
      <div key={user} className="sessions-card">
        <div className="sessions-title">🔥 {emoji} {user}'s Today's Sessions 💯</div>
        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="empty-sessions">😴 No workouts logged today</div>
          ) : (
            sessions.map((session, index) => (
              <div key={index} className="session-item">
                <div className="session-info">
                  <span className="session-emoji">
                    {exercises[session.exercise as keyof typeof exercises] || '💪'}
                  </span>
                  <span className="session-exercise">{session.exercise}</span>
                  <span className="session-reps">{session.reps} reps</span>
                </div>
                <span className="session-time">⏰ {session.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="sessions-grid">
      {renderSessionCard('Dad')}
      {renderSessionCard('Son')}
    </div>
  );
};