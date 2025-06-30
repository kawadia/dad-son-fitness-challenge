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

  test('shows workout interface after connecting', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const familyInput = screen.getByPlaceholderText(/Enter your family name/i);
    const connectButton = screen.getByRole('button', { name: /🔗 Connect/i });

    await user.type(familyInput, 'test-family');
    await user.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText(/Today's Challenge Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Log Workout/i)).toBeInTheDocument();
    });
  });

  test('displays dad and son progress cards when connected', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const familyInput = screen.getByPlaceholderText(/Enter your family name/i);
    const connectButton = screen.getByRole('button', { name: /🔗 Connect/i });

    await user.type(familyInput, 'test-family');
    await user.click(connectButton);

    await waitFor(() => {
      expect(screen.getByText(/👨 Dad's Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/👦 Son's Progress/i)).toBeInTheDocument();
    });
  });
});
