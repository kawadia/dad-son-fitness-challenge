import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MotivationalQuote } from '../MotivationalQuote';
import { MotivationService } from '../../services/motivationService';

// Mock the MotivationService
jest.mock('../../services/motivationService', () => ({
  MotivationService: {
    getMotivationalQuote: jest.fn()
  },
  getTimeLeft: jest.fn(() => ({ hoursLeft: 8, minutesLeft: 30 }))
}));

describe('MotivationalQuote', () => {
  const mockGetTodaysProgress = jest.fn();
  const mockMotivationService = MotivationService.getMotivationalQuote as jest.Mock;

  const defaultProps = {
    getTodaysProgress: mockGetTodaysProgress,
    isConnected: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodaysProgress.mockImplementation((user: string) => 
      user === 'Dad' ? 75 : 50
    );
  });

  it('should not render when not connected', () => {
    const { container } = render(
      <MotivationalQuote {...defaultProps} isConnected={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should show loading state initially when connected', () => {
    mockMotivationService.mockImplementation(() => new Promise(() => {}));
    
    render(<MotivationalQuote {...defaultProps} />);
    
    expect(screen.getByText(/Getting your daily motivation.../i)).toBeInTheDocument();
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });

  it('should display motivational quote after loading', async () => {
    const mockQuote = 'Keep pushing, champions! 💪';
    mockMotivationService.mockResolvedValue(mockQuote);
    
    render(<MotivationalQuote {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(mockQuote)).toBeInTheDocument();
    });
    
    expect(screen.queryByText(/Getting your daily motivation.../i)).not.toBeInTheDocument();
  });

  it('should call MotivationService with correct stats', async () => {
    const mockQuote = 'Test quote';
    mockMotivationService.mockResolvedValue(mockQuote);
    
    render(<MotivationalQuote {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockMotivationService).toHaveBeenCalled();
    });
    
    const callArgs = mockMotivationService.mock.calls[0][0];
    expect(callArgs.dadReps).toBe(75);
    expect(callArgs.sonReps).toBe(50);
    expect(callArgs.dadGoalMet).toBe(false);
    expect(callArgs.sonGoalMet).toBe(false);
  });

  it('should handle goal completion correctly', async () => {
    mockGetTodaysProgress.mockImplementation((user: string) => 
      user === 'Dad' ? 141 : 150
    );
    
    const mockQuote = 'Both completed their goals!';
    mockMotivationService.mockResolvedValue(mockQuote);
    
    render(<MotivationalQuote {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockMotivationService).toHaveBeenCalled();
    });
    
    const callArgs = mockMotivationService.mock.calls[0][0];
    expect(callArgs.dadGoalMet).toBe(true);
    expect(callArgs.sonGoalMet).toBe(true);
  });

  it('should handle partial goal completion', async () => {
    mockGetTodaysProgress.mockImplementation((user: string) => 
      user === 'Dad' ? 141 : 50
    );
    
    const mockQuote = 'Dad completed, Son keep going!';
    mockMotivationService.mockResolvedValue(mockQuote);
    
    render(<MotivationalQuote {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockMotivationService).toHaveBeenCalled();
    });
    
    const callArgs = mockMotivationService.mock.calls[0][0];
    expect(callArgs.dadGoalMet).toBe(true);
    expect(callArgs.sonGoalMet).toBe(false);
  });

  it('should show fallback quote on service error', async () => {
    mockMotivationService.mockRejectedValue(new Error('Network error'));
    
    render(<MotivationalQuote {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/The family that works out together, stays strong together!/i))
        .toBeInTheDocument();
    });
  });

  it('should include current time and date in the request', async () => {
    const mockQuote = 'Time-aware quote';
    mockMotivationService.mockResolvedValue(mockQuote);
    
    render(<MotivationalQuote {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockMotivationService).toHaveBeenCalled();
    });
    
    const callArgs = mockMotivationService.mock.calls[0][0];
    expect(callArgs.currentTime).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    expect(callArgs.currentDate).toMatch(/\w+day, \w+ \d{1,2}, \d{4}/);
  });

  it('should have proper styling classes', () => {
    mockMotivationService.mockResolvedValue('Test quote');
    
    render(<MotivationalQuote {...defaultProps} />);
    
    expect(document.querySelector('.motivational-quote')).toBeInTheDocument();
  });

  it('should reload quote when connection status changes', async () => {
    const mockQuote = 'First quote';
    mockMotivationService.mockResolvedValue(mockQuote);
    
    const { rerender } = render(<MotivationalQuote {...defaultProps} />);
    
    await waitFor(() => {
      expect(mockMotivationService).toHaveBeenCalled();
    });
    
    // Reset the mock to track new calls
    mockMotivationService.mockClear();
    
    // Disconnect and reconnect
    rerender(<MotivationalQuote {...defaultProps} isConnected={false} />);
    rerender(<MotivationalQuote {...defaultProps} isConnected={true} />);
    
    await waitFor(() => {
      expect(mockMotivationService).toHaveBeenCalled();
    });
  });

  it('should handle empty quote response', async () => {
    mockMotivationService.mockResolvedValue('');
    
    render(<MotivationalQuote {...defaultProps} />);
    
    await waitFor(() => {
      // Should still render the component even with empty quote
      expect(document.querySelector('.quote-text')).toBeInTheDocument();
    });
  });
});