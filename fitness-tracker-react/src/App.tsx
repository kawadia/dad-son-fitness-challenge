import React from 'react';
import './App.css';
import { Header } from './components/Header';
import { ProgressSection } from './components/ProgressSection';
import { WorkoutLogger } from './components/WorkoutLogger';
import { SessionsList } from './components/SessionsList';
import { ProgressChart } from './components/ProgressChart';
import { ExportButton } from './components/ExportButton';
import { useFitnessData } from './hooks/useFitnessData';

function App() {
  const {
    workoutData,
    familyId,
    currentUser,
    isConnected,
    connectFamily,
    disconnectFamily,
    selectUser,
    addWorkout,
    undoLastWorkout,
    getTodaysProgress,
    getTodaysSessions,
    calculateStreak,
    canUndo
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
            <ProgressSection
              getTodaysProgress={getTodaysProgress}
              getTodaysSessions={getTodaysSessions}
              calculateStreak={calculateStreak}
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
    </div>
  );
}

export default App;
