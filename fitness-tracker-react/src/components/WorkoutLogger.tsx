import React, { useState } from 'react';
import { UserType } from '../types';

interface WorkoutLoggerProps {
  currentUser: UserType;
  isConnected: boolean;
  canUndo: boolean;
  onSelectUser: (user: UserType) => void;
  onAddWorkout: (exercise: string, reps: number) => Promise<void>;
  onUndoWorkout: () => Promise<void>;
}

const exercises = [
  { value: 'squats', label: '🏋️ Squats' },
  { value: 'sit-ups', label: '🤸 Sit-ups' },
  { value: 'pushups', label: '💪 Pushups' },
  { value: 'Bulgarian squats', label: '🦵 Bulgarian squats' },
  { value: 'lunges', label: '🏃 Lunges' }
];

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  currentUser,
  isConnected,
  canUndo,
  onSelectUser,
  onAddWorkout,
  onUndoWorkout
}) => {
  const [selectedExercise, setSelectedExercise] = useState('squats');
  const [reps, setReps] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddWorkout = async () => {
    if (!isConnected) {
      alert('Please connect to your family first!');
      return;
    }
    
    const repsNum = parseInt(reps);
    if (!repsNum || repsNum <= 0) return;

    setIsSubmitting(true);
    try {
      await onAddWorkout(selectedExercise, repsNum);
      setReps('');
    } catch (error) {
      console.error('Error adding workout:', error);
      alert('Error adding workout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndoWorkout = async () => {
    if (!isConnected) {
      alert('Please connect to your family first!');
      return;
    }
    
    try {
      await onUndoWorkout();
    } catch (error) {
      console.error('Error undoing workout:', error);
      alert('Error undoing workout. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddWorkout();
    }
  };

  const hasValidReps = reps && parseInt(reps) > 0;

  return (
    <div className="logger-section">
      <div className="logger-title">🎯 Log Workout 💪</div>
      
      <div className="user-tabs">
        <div className="user-tab-group">
          <button
            className={`user-tab ${currentUser === 'Dad' ? 'active' : ''}`}
            onClick={() => onSelectUser('Dad')}
          >
            👨 Dad
          </button>
          <button
            className={`user-tab ${currentUser === 'Son' ? 'active' : ''}`}
            onClick={() => onSelectUser('Son')}
          >
            👦 Son
          </button>
        </div>
      </div>

      <div className="logger-form">
        <div className="form-group">
          <label className="form-label">Exercise</label>
          <select
            className="form-select"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            {exercises.map(exercise => (
              <option key={exercise.value} value={exercise.value}>
                {exercise.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Reps</label>
          <input
            type="number"
            className="form-input"
            placeholder="Enter reps"
            min="1"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">&nbsp;</label>
          <div className="button-group">
            <button
              className="add-button"
              onClick={handleAddWorkout}
              disabled={!hasValidReps || isSubmitting}
            >
              {isSubmitting ? '⏳ Adding...' : `🚀 Add Workout for ${currentUser} 🚀`}
            </button>
            <button
              className="undo-button"
              onClick={handleUndoWorkout}
              disabled={!canUndo}
            >
              ↶ Undo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};