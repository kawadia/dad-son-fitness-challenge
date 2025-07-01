import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { useFitnessData } from './hooks/useFitnessData';

// Mock the useFitnessData hook
jest.mock('./hooks/useFitnessData');

const mockedUseFitnessData = useFitnessData as jest.Mock;

describe('App Component', () => {
  beforeEach(() => {
    mockedUseFitnessData.mockReturnValue({
      workoutData: { Dad: {}, Son: {} },
      familyId: null,
      currentUser: 'Dad',
      isConnected: false,
      goalAchieved: null,
      dailyGoal: 150, // Mocked daily goal
      connectFamily: jest.fn(),
      disconnectFamily: jest.fn(),
      selectUser: jest.fn(),
      addWorkout: jest.fn(),
      undoLastWorkout: jest.fn(),
      getTodaysProgress: jest.fn(() => 0),
      getTodaysSessions: jest.fn(() => []),
      calculateStreak: jest.fn(() => 0),
      canUndo: jest.fn(() => false),
    });
  });

  test('renders fitness tracker header', () => {
    render(<App />);
    expect(screen.getByText(/Dad & Son Fitness Challenge/i)).toBeInTheDocument();
  });

  test('shows connection interface initially', () => {
    render(<App />);
    expect(screen.getByText(/Family ID/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🔗 Connect/i })).toBeInTheDocument();
  });

  test('has family input field with correct placeholder', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Enter your family name/i)).toBeInTheDocument();
  });

  test('shows daily goal information', () => {
    render(<App />);
    expect(screen.getByText(/Daily Goal: 150 Reps/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay Strong Together/i)).toBeInTheDocument();
  });
});
