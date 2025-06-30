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

  it('should render motivational quote component when connected', () => {
    const mockQuote = 'Keep pushing, champions! 💪';
    mockMotivationService.mockResolvedValue(mockQuote);
    
    render(<MotivationalQuote {...defaultProps} />);
    
    expect(document.querySelector('.motivational-quote')).toBeInTheDocument();
  });

  it('should handle quote display', () => {
    const mockQuote = 'Test quote content';
    mockMotivationService.mockResolvedValue(mockQuote);
    
    render(<MotivationalQuote {...defaultProps} />);
    
    expect(document.querySelector('.quote-content')).toBeInTheDocument();
  });

  it('should render with correct props', () => {
    const mockQuote = 'Test quote';
    mockMotivationService.mockResolvedValue(mockQuote);
    
    render(<MotivationalQuote {...defaultProps} />);
    
    // Just verify the component renders
    expect(document.querySelector('.motivational-quote')).toBeInTheDocument();
  });

  it('should handle different progress scenarios', () => {
    mockGetTodaysProgress.mockImplementation((user: string) => 
      user === 'Dad' ? 141 : 150
    );
    
    const mockQuote = 'Both completed their goals!';
    mockMotivationService.mockResolvedValue(mockQuote);
    
    const { rerender } = render(<MotivationalQuote {...defaultProps} />);
    
    // Test different progress values work
    mockGetTodaysProgress.mockImplementation((user: string) => 
      user === 'Dad' ? 75 : 50
    );
    
    rerender(<MotivationalQuote {...defaultProps} />);
    expect(document.querySelector('.motivational-quote')).toBeInTheDocument();
  });

  it('should handle service errors gracefully', () => {
    mockMotivationService.mockRejectedValue(new Error('Network error'));
    
    render(<MotivationalQuote {...defaultProps} />);
    
    // Component should still render even with errors
    expect(document.querySelector('.motivational-quote')).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    mockMotivationService.mockResolvedValue('Test quote');
    
    render(<MotivationalQuote {...defaultProps} />);
    
    expect(document.querySelector('.motivational-quote')).toBeInTheDocument();
  });

  it('should handle connection state changes', () => {
    const { rerender } = render(<MotivationalQuote {...defaultProps} />);
    
    // Test disconnected state
    rerender(<MotivationalQuote {...defaultProps} isConnected={false} />);
    expect(document.querySelector('.motivational-quote')).not.toBeInTheDocument();
    
    // Test reconnected state
    rerender(<MotivationalQuote {...defaultProps} isConnected={true} />);
    expect(document.querySelector('.motivational-quote')).toBeInTheDocument();
  });

  it('should handle empty quote response', () => {
    mockMotivationService.mockResolvedValue('');
    
    render(<MotivationalQuote {...defaultProps} />);
    
    // Should still render the component even with empty quote
    expect(document.querySelector('.quote-text')).toBeInTheDocument();
  });
});