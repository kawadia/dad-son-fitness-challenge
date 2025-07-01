import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { WorkoutData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProgressChartProps {
  workoutData: WorkoutData;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ workoutData }) => {
  const getLast14DaysData = () => {
    const dates: string[] = [];
    const dadData: number[] = [];
    const sonData: number[] = [];
    
    // Generate last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Use local timezone for consistency with data storage
      const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      const shortDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      dates.push(shortDate);
      
      // Get data for each user
      const dadProgress = (workoutData.Dad && workoutData.Dad[dateString]) ? workoutData.Dad[dateString].totalReps : 0;
      const sonProgress = (workoutData.Son && workoutData.Son[dateString]) ? workoutData.Son[dateString].totalReps : 0;
      
      dadData.push(dadProgress);
      sonData.push(sonProgress);
    }
    
    return { dates, dadData, sonData };
  };

  const { dates, dadData, sonData } = getLast14DaysData();

  const data = {
    labels: dates,
    datasets: [
      {
        label: '👨 Dad',
        data: dadData,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(5, 150, 105, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false as any,
      },
      {
        label: '👦 Son',
        data: sonData,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false as any,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'rect' as const,
          font: {
            size: 14,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} reps`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(200, Math.max(...dadData), Math.max(...sonData)),
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          }
        },
        title: {
          display: true,
          text: 'Daily Reps',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 4
      }
    }
  };

  return (
    <div className="chart-section">
      <div className="chart-title">📊 Last 2 Weeks Progress 📈</div>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};