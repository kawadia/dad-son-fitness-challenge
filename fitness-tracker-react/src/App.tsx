import React from 'react';
import './App.css';
import { Header } from './components/Header';
import { ProgressSection } from './components/ProgressSection';
import { WorkoutLogger } from './components/WorkoutLogger';
import { SessionsList } from './components/SessionsList';
import { ProgressChart } from './components/ProgressChart';
import { ExportButton } from './components/ExportButton';
import { ConfettiCelebration } from './components/ConfettiCelebration';
import { MotivationalQuote } from './components/MotivationalQuote';
import { useFitnessData } from './hooks/useFitnessData';

function App() {
  const {
    workoutData,
    familyId,
    currentUser,
    isConnected,
    goalAchieved,
    connectFamily,
    disconnectFamily,
    selectUser,
    addWorkout,
    undoLastWorkout,
    getTodaysProgress,
    getTodaysSessions,
    calculateStreak,
    canUndo,
    dailyGoal
  } = useFitnessData();

  return (
    <div className="container">
      <div className="card">
        <Header
          familyId={familyId}
          isConnected={isConnected}
          onConnect={connectFamily}
          onDisconnect={disconnectFamily}
        />

        {isConnected && (
          <>
            <MotivationalQuote
              getTodaysProgress={getTodaysProgress}
              isConnected={isConnected}
            />

            <ProgressSection
              getTodaysProgress={getTodaysProgress}
              getTodaysSessions={getTodaysSessions}
              calculateStreak={calculateStreak}
              dailyGoal={dailyGoal}
            />

            <WorkoutLogger
              currentUser={currentUser}
              isConnected={isConnected}
              canUndo={canUndo()}
              onSelectUser={selectUser}
              onAddWorkout={addWorkout}
              onUndoWorkout={undoLastWorkout}
            />

            <SessionsList
              getTodaysSessions={getTodaysSessions}
            />

            <ProgressChart
              workoutData={workoutData}
            />

            <ExportButton
              workoutData={workoutData}
            />
          </>
        )}
      </div>
      
      {/* Confetti celebration overlay */}
      {goalAchieved && (
        <ConfettiCelebration
          isGoalMet={true}
          userName={goalAchieved.user}
          totalReps={getTodaysProgress(goalAchieved.user)}
        />
      )}
    </div>
  );
}

export default App;
