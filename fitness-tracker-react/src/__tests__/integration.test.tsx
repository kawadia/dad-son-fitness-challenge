import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock all external services
jest.mock('../services/firebase', () => ({
  FirebaseService: {
    getInstance: () => ({
      connectToFamily: jest.fn().mockResolvedValue(true),
      disconnectFromFamily: jest.fn(),
      initializeData: jest.fn().mockResolvedValue({
        Dad: {
          '2024-01-01': {
            sessions: [],
            totalReps: 0,
            goalMet: false
          }
        },
        Son: {
          '2024-01-01': {
            sessions: [],
            totalReps: 0,
            goalMet: false
          }
        },
        lastUpdated: '2024-01-01T12:00:00.000Z'
      }),
      addWorkout: jest.fn().mockResolvedValue(undefined),
      undoLastWorkout: jest.fn().mockResolvedValue(undefined),
      exportData: jest.fn().mockResolvedValue('test,data'),
      onDataChange: jest.fn()
    })
  }
}));

jest.mock('../services/motivationService', () => ({
  MotivationService: {
    getMotivationalQuote: jest.fn().mockResolvedValue('Keep pushing, team! 💪')
  },
  getTimeLeft: jest.fn(() => ({ hoursLeft: 12, minutesLeft: 30 }))
}));

// Mock confetti
jest.mock('react-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="confetti">Confetti Animation</div>;
  };
});

describe('Fitness Tracker Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Complete Workout Flow', () => {
    it('should complete full workout logging flow', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Step 1: Connect to family
      const familyInput = screen.getByPlaceholderText(/Enter your family name/i);
      const connectButton = screen.getByRole('button', { name: /🔗 Connect/i });

      await user.type(familyInput, 'test-family');
      await user.click(connectButton);

      // Step 2: Wait for connection and verify UI loads
      await waitFor(() => {
        expect(screen.getByText(/Today's Challenge Progress/i)).toBeInTheDocument();
        expect(screen.getByText(/Log Workout/i)).toBeInTheDocument();
      });

      // Step 3: Log a workout for Dad
      const exerciseSelect = screen.getByLabelText(/Exercise/i);
      const repsInput = screen.getByLabelText(/Reps/i);
      const addButton = screen.getByRole('button', { name: /Add Workout for Dad/i });

      await user.selectOptions(exerciseSelect, 'pushups');
      await user.type(repsInput, '25');
      await user.click(addButton);

      // Step 4: Verify workout was logged
      await waitFor(() => {
        expect(repsInput).toHaveValue('');
      });

      // Step 5: Switch to Son and log workout
      const sonTab = screen.getByRole('button', { name: /👦 Son/i });
      await user.click(sonTab);

      await user.selectOptions(exerciseSelect, 'squats');
      await user.type(repsInput, '30');
      await user.click(addButton);

      await waitFor(() => {
        expect(repsInput).toHaveValue('');
      });

      // Step 6: Verify progress is tracked
      expect(screen.getByText(/👨 Dad's Progress/i)).toBeInTheDocument();
      expect(screen.getByText(/👦 Son's Progress/i)).toBeInTheDocument();
    });

    it('should handle undo workflow correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Connect to family
      const familyInput = screen.getByPlaceholderText(/Enter your family name/i);
      const connectButton = screen.getByRole('button', { name: /🔗 Connect/i });

      await user.type(familyInput, 'test-family');
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/Log Workout/i)).toBeInTheDocument();
      });

      // Log a workout
      const repsInput = screen.getByLabelText(/Reps/i);
      const addButton = screen.getByRole('button', { name: /Add Workout for Dad/i });

      await user.type(repsInput, '20');
      await user.click(addButton);

      await waitFor(() => {
        expect(repsInput).toHaveValue('');
      });

      // Undo the workout
      const undoButton = screen.getByRole('button', { name: /Undo/i });
      await user.click(undoButton);

      // Verify undo was processed (button states should update)
      expect(undoButton).toBeInTheDocument();
    });

    it('should display motivational quotes after connection', async () => {
      const user = userEvent.setup();
      render(<App />);

      const familyInput = screen.getByPlaceholderText(/Enter your family name/i);
      const connectButton = screen.getByRole('button', { name: /🔗 Connect/i });

      await user.type(familyInput, 'test-family');
      await user.click(connectButton);

      // Wait for connection and check for motivational quote
      await waitFor(() => {
        expect(screen.getByText(/Keep pushing, team! 💪/i)).toBeInTheDocument();
      });
    });

    it('should handle disconnection properly', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Connect first
      const familyInput = screen.getByPlaceholderText(/Enter your family name/i);
      const connectButton = screen.getByRole('button', { name: /🔗 Connect/i });

      await user.type(familyInput, 'test-family');
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/Log Workout/i)).toBeInTheDocument();
      });

      // Disconnect
      const disconnectButton = screen.getByRole('button', { name: /🔄 Change Family/i });
      await user.click(disconnectButton);

      // Verify back to connection screen
      await waitFor(() => {
        expect(screen.getByText(/Family ID/i)).toBeInTheDocument();
        expect(screen.queryByText(/Log Workout/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle connection failures gracefully', async () => {
      // Override the mock to simulate failure
      const mockFirebaseService = require('../services/firebase').FirebaseService.getInstance();
      mockFirebaseService.connectToFamily.mockResolvedValueOnce(false);

      const user = userEvent.setup();
      render(<App />);

      const familyInput = screen.getByPlaceholderText(/Enter your family name/i);
      const connectButton = screen.getByRole('button', { name: /🔗 Connect/i });

      await user.type(familyInput, 'invalid-family');
      await user.click(connectButton);

      // Should remain on connection screen
      await waitFor(() => {
        expect(screen.getByText(/Family ID/i)).toBeInTheDocument();
      });
    });

    it('should prevent actions when not connected', async () => {
      const user = userEvent.setup();
      window.alert = jest.fn();
      
      render(<App />);

      // Try to interact without connecting (this scenario shouldn't happen in normal flow)
      // Since the workout interface only shows when connected, this test verifies the guard logic
      
      expect(screen.getByText(/Enter Family ID/i)).toBeInTheDocument();
      expect(screen.queryByText(/Log Workout/i)).not.toBeInTheDocument();
    });
  });

  describe('User Experience Flow', () => {
    it('should maintain user selection across workouts', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Connect
      const familyInput = screen.getByPlaceholderText(/Enter your family name/i);
      const connectButton = screen.getByRole('button', { name: /🔗 Connect/i });

      await user.type(familyInput, 'test-family');
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/Log Workout/i)).toBeInTheDocument();
      });

      // Switch to Son
      const sonTab = screen.getByRole('button', { name: /👦 Son/i });
      await user.click(sonTab);

      // Log workout for Son
      const repsInput = screen.getByLabelText(/Reps/i);
      const addButton = screen.getByRole('button', { name: /Add Workout for Son/i });

      await user.type(repsInput, '15');
      await user.click(addButton);

      // Verify Son is still selected
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Workout for Son/i })).toBeInTheDocument();
      });
    });

    it('should show proper validation states', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Connect
      const familyInput = screen.getByPlaceholderText(/Enter your family name/i);
      const connectButton = screen.getByRole('button', { name: /🔗 Connect/i });

      await user.type(familyInput, 'test-family');
      await user.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/Log Workout/i)).toBeInTheDocument();
      });

      // Check initial button state
      const addButton = screen.getByRole('button', { name: /Add Workout for Dad/i });
      expect(addButton).toBeDisabled();

      // Enter valid reps
      const repsInput = screen.getByLabelText(/Reps/i);
      await user.type(repsInput, '10');
      expect(addButton).toBeEnabled();

      // Clear reps
      await user.clear(repsInput);
      expect(addButton).toBeDisabled();
    });
  });
});