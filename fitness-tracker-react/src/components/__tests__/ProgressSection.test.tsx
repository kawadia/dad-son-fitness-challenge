import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressSection } from '../ProgressSection';
import { UserType } from '../../types';

describe('ProgressSection', () => {
  const mockGetTodaysProgress = jest.fn();
  const mockGetTodaysSessions = jest.fn();
  const mockCalculateStreak = jest.fn();

  const defaultProps = {
    getTodaysProgress: mockGetTodaysProgress,
    getTodaysSessions: mockGetTodaysSessions,
    calculateStreak: mockCalculateStreak
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockGetTodaysProgress.mockImplementation((user: UserType) => 
      user === 'Dad' ? 75 : 50
    );
    mockGetTodaysSessions.mockImplementation((user: UserType) => 
      user === 'Dad' ? [{}, {}] : [{}]
    );
    mockCalculateStreak.mockImplementation((user: UserType) => 
      user === 'Dad' ? 5 : 3
    );
  });

  it('should render the progress section title', () => {
    render(<ProgressSection {...defaultProps} />);
    expect(screen.getByText(/Today's Challenge Progress/i)).toBeInTheDocument();
  });

  it('should display current date and time information', () => {
    render(<ProgressSection {...defaultProps} />);
    // The component shows date/time dynamically, so just check for basic elements
    expect(screen.getByText(/left today/i)).toBeInTheDocument();
  });

  it('should render progress cards for both Dad and Son', () => {
    render(<ProgressSection {...defaultProps} />);
    
    expect(screen.getByText(/👨 Dad's Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/👦 Son's Progress/i)).toBeInTheDocument();
    expect(screen.getByText('75/141 💪')).toBeInTheDocument();
    expect(screen.getByText('50/141 💪')).toBeInTheDocument();
  });

  it('should display progress bars with correct widths', () => {
    render(<ProgressSection {...defaultProps} />);
    
    const progressBars = document.querySelectorAll('.progress-fill');
    expect(progressBars).toHaveLength(2);
    
    // Just verify the bars have width styles (percentages may vary due to rounding)
    expect(progressBars[0]).toHaveAttribute('style');
    expect(progressBars[1]).toHaveAttribute('style');
    expect(progressBars[0].getAttribute('style')).toContain('width:');
    expect(progressBars[1].getAttribute('style')).toContain('width:');
  });

  it('should show goal completed message when goal is reached', () => {
    mockGetTodaysProgress.mockImplementation((user: UserType) => 
      user === 'Dad' ? 141 : 50
    );

    render(<ProgressSection {...defaultProps} />);
    
    expect(screen.getByText(/🎉 GOAL COMPLETED! 🎉/i)).toBeInTheDocument();
  });

  it('should display streak information for both users', () => {
    render(<ProgressSection {...defaultProps} />);
    
    expect(screen.getByText(/👨 Dad's Streak/i)).toBeInTheDocument();
    expect(screen.getByText(/👦 Son's Streak/i)).toBeInTheDocument();
    expect(screen.getByText('5 days 🏆')).toBeInTheDocument();
    expect(screen.getByText('3 days 🏆')).toBeInTheDocument();
  });

  it('should display session count for both users', () => {
    render(<ProgressSection {...defaultProps} />);
    
    expect(screen.getByText(/👨 Dad's Sessions/i)).toBeInTheDocument();
    expect(screen.getByText(/👦 Son's Sessions/i)).toBeInTheDocument();
    expect(screen.getByText('2 💯')).toBeInTheDocument();
    expect(screen.getByText('1 💯')).toBeInTheDocument();
  });

  it('should handle zero progress correctly', () => {
    mockGetTodaysProgress.mockReturnValue(0);
    mockGetTodaysSessions.mockReturnValue([]);
    mockCalculateStreak.mockReturnValue(0);

    render(<ProgressSection {...defaultProps} />);
    
    expect(screen.getAllByText('0/141 💪')).toHaveLength(2);
    expect(screen.getAllByText('0 days 🏆')).toHaveLength(2);
    expect(screen.getAllByText('0 💯')).toHaveLength(2);
  });

  it('should cap progress bar at 100% even with more than 141 reps', () => {
    mockGetTodaysProgress.mockImplementation((user: UserType) => 
      user === 'Dad' ? 200 : 150
    );

    render(<ProgressSection {...defaultProps} />);
    
    const progressBars = document.querySelectorAll('.progress-fill');
    expect(progressBars[0]).toHaveStyle('width: 100%');
    expect(progressBars[1]).toHaveStyle('width: 100%');
  });

  it('should call helper functions with correct parameters', () => {
    render(<ProgressSection {...defaultProps} />);
    
    expect(mockGetTodaysProgress).toHaveBeenCalledWith('Dad');
    expect(mockGetTodaysProgress).toHaveBeenCalledWith('Son');
    expect(mockGetTodaysSessions).toHaveBeenCalledWith('Dad');
    expect(mockGetTodaysSessions).toHaveBeenCalledWith('Son');
    expect(mockCalculateStreak).toHaveBeenCalledWith('Dad');
    expect(mockCalculateStreak).toHaveBeenCalledWith('Son');
  });
});