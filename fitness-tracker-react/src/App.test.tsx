import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the Firebase service
jest.mock('./services/firebase', () => ({
  FirebaseService: {
    getInstance: () => ({
      connectToFamily: jest.fn().mockResolvedValue(true),
      disconnectFromFamily: jest.fn(),
      initializeData: jest.fn().mockResolvedValue({}),
      addWorkout: jest.fn().mockResolvedValue(undefined),
      undoLastWorkout: jest.fn().mockResolvedValue(undefined),
      exportData: jest.fn().mockResolvedValue('test,data'),
      onDataChange: jest.fn()
    })
  }
}));

// Mock the motivation service
jest.mock('./services/motivationService', () => ({
  MotivationService: {
    getMotivationalQuote: jest.fn().mockResolvedValue('Keep pushing! 💪')
  },
  getTimeLeft: jest.fn(() => ({ hoursLeft: 12, minutesLeft: 30 }))
}));

describe('App Component', () => {
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
    expect(screen.getByText(/Daily Goal: 141 Reps/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay Strong Together/i)).toBeInTheDocument();
  });
});
