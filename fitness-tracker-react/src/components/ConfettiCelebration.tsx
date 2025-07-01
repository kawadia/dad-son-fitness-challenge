import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface ConfettiCelebrationProps {
  isGoalMet: boolean;
  userName: string;
  totalReps?: number;
  dailyGoal: number;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  isGoalMet,
  userName,
  totalReps = 0,
  dailyGoal
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isGoalMet) {
      setShowConfetti(true);
      
      // Stop confetti after 3 seconds for regular workouts, 5 seconds for first goal achievement
      const duration = totalReps >= dailyGoal ? 5000 : 3000;
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isGoalMet, totalReps, dailyGoal]);

  if (!showConfetti) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}>
      <Confetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        numberOfPieces={totalReps >= dailyGoal ? 300 : 150}
        recycle={false}
        gravity={0.3}
        initialVelocityY={totalReps >= dailyGoal ? 20 : 15}
        colors={[
          '#10b981', // Dad's green
          '#3b82f6', // Son's blue
          '#f59e0b', // Gold
          '#ef4444', // Red
          '#8b5cf6', // Purple
          '#f97316'  // Orange
        ]}
        onConfettiComplete={() => setShowConfetti(false)}
      />
      
      {/* Celebration message overlay */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px 40px',
        borderRadius: '12px',
        textAlign: 'center',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        zIndex: 10000,
        animation: 'fadeInOut 5s ease-in-out',
        pointerEvents: 'none'
      }}>
        🎉 {userName} {totalReps >= dailyGoal ? 'reached the daily goal!' : 'keeping it going!'} 🎉
        <div style={{ fontSize: '1rem', marginTop: '8px', opacity: 0.9 }}>
          {totalReps} reps completed! 💪
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `}</style>
    </div>
  );
};