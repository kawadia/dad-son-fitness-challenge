import React from 'react';
import { WorkoutData } from '../types';

interface ExportButtonProps {
  workoutData: WorkoutData;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ workoutData }) => {
  const exportToCSV = () => {
    const csvData: string[][] = [];
    csvData.push(['Date', 'User', 'Exercise', 'Reps', 'Time', 'Daily Total', 'Goal Met']);

    (['Dad', 'Son'] as const).forEach(user => {
      const userData = workoutData[user] || {};
      const sortedDates = Object.keys(userData).sort();
      
      sortedDates.forEach(date => {
        const dayData = userData[date];
        if (dayData.sessions.length === 0) {
          csvData.push([date, user, 'No workouts', '0', '', dayData.totalReps.toString(), dayData.goalMet ? 'Yes' : 'No']);
        } else {
          dayData.sessions.forEach((session, index) => {
            csvData.push([
              date,
              user,
              session.exercise,
              session.reps.toString(),
              session.time,
              index === 0 ? dayData.totalReps.toString() : '',
              index === 0 ? (dayData.goalMet ? 'Yes' : 'No') : ''
            ]);
          });
        }
      });
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `fitness-data-${today}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-section">
      <button className="export-button" onClick={exportToCSV}>
        📊 Export All Data to CSV 📁
      </button>
      <div className="export-description">
        💾 Downloads complete workout history for both Dad & Son
      </div>
    </div>
  );
};