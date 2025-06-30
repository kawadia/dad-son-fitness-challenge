import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkoutLogger } from '../WorkoutLogger';

describe('WorkoutLogger', () => {
  const mockOnSelectUser = jest.fn();
  const mockOnAddWorkout = jest.fn();
  const mockOnUndoWorkout = jest.fn();

  const defaultProps = {
    currentUser: 'Dad' as const,
    isConnected: true,
    canUndo: true,
    onSelectUser: mockOnSelectUser,
    onAddWorkout: mockOnAddWorkout,
    onUndoWorkout: mockOnUndoWorkout
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAddWorkout.mockResolvedValue(undefined);
    mockOnUndoWorkout.mockResolvedValue(undefined);
  });

  it('should render workout logger with all elements', () => {
    render(<WorkoutLogger {...defaultProps} />);
    
    expect(screen.getByText(/Log Workout/i)).toBeInTheDocument();
    expect(screen.getByText('👨 Dad')).toBeInTheDocument();
    expect(screen.getByText('👦 Son')).toBeInTheDocument();
    expect(screen.getByLabelText(/Exercise/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reps/i)).toBeInTheDocument();
  });

  it('should display all exercise options', () => {
    render(<WorkoutLogger {...defaultProps} />);
    
    const exerciseSelect = screen.getByLabelText(/Exercise/i);
    expect(exerciseSelect).toBeInTheDocument();
    
    // Check if select contains expected options
    expect(screen.getByDisplayValue(/🏋️ Squats/i)).toBeInTheDocument();
  });

  it('should highlight current user tab', () => {
    render(<WorkoutLogger {...defaultProps} />);
    
    const dadTab = screen.getByRole('button', { name: /👨 Dad/i });
    const sonTab = screen.getByRole('button', { name: /👦 Son/i });
    
    expect(dadTab).toHaveClass('active');
    expect(sonTab).not.toHaveClass('active');
  });

  it('should switch users when tab is clicked', async () => {
    const user = userEvent.setup();
    render(<WorkoutLogger {...defaultProps} />);
    
    const sonTab = screen.getByRole('button', { name: /👦 Son/i });
    await user.click(sonTab);
    
    expect(mockOnSelectUser).toHaveBeenCalledWith('Son');
  });

  it('should enable add button only when reps are valid', async () => {
    const user = userEvent.setup();
    render(<WorkoutLogger {...defaultProps} />);
    
    const addButton = screen.getByRole('button', { name: /Add Workout for Dad/i });
    const repsInput = screen.getByLabelText(/Reps/i);
    
    // Initially disabled (no reps)
    expect(addButton).toBeDisabled();
    
    // Enter valid reps
    await user.type(repsInput, '10');
    expect(addButton).toBeEnabled();
    
    // Clear reps
    await user.clear(repsInput);
    expect(addButton).toBeDisabled();
  });

  it('should call onAddWorkout when form is submitted with valid data', async () => {
    const user = userEvent.setup();
    render(<WorkoutLogger {...defaultProps} />);
    
    const exerciseSelect = screen.getByLabelText(/Exercise/i);
    const repsInput = screen.getByLabelText(/Reps/i);
    const addButton = screen.getByRole('button', { name: /Add Workout for Dad/i });
    
    await user.selectOptions(exerciseSelect, 'pushups');
    await user.type(repsInput, '15');
    await user.click(addButton);
    
    expect(mockOnAddWorkout).toHaveBeenCalledWith('pushups', 15);
  });

  it('should clear reps input after successful submission', async () => {
    const user = userEvent.setup();
    render(<WorkoutLogger {...defaultProps} />);
    
    const repsInput = screen.getByLabelText(/Reps/i);
    const addButton = screen.getByRole('button', { name: /Add Workout for Dad/i });
    
    await user.type(repsInput, '20');
    await user.click(addButton);
    
    await waitFor(() => {
      expect(repsInput).toHaveValue('');
    });
  });

  it('should handle Enter key press to submit form', async () => {
    const user = userEvent.setup();
    render(<WorkoutLogger {...defaultProps} />);
    
    const repsInput = screen.getByLabelText(/Reps/i);
    
    await user.type(repsInput, '25');
    await user.keyboard('{Enter}');
    
    expect(mockOnAddWorkout).toHaveBeenCalledWith('squats', 25);
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    // Make the promise not resolve immediately
    mockOnAddWorkout.mockImplementation(() => new Promise(() => {}));
    
    render(<WorkoutLogger {...defaultProps} />);
    
    const repsInput = screen.getByLabelText(/Reps/i);
    const addButton = screen.getByRole('button', { name: /Add Workout for Dad/i });
    
    await user.type(repsInput, '10');
    await user.click(addButton);
    
    expect(screen.getByText(/⏳ Adding.../i)).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  });

  it('should disable undo button when canUndo is false', () => {
    render(<WorkoutLogger {...defaultProps} canUndo={false} />);
    
    const undoButton = screen.getByRole('button', { name: /Undo/i });
    expect(undoButton).toBeDisabled();
  });

  it('should call onUndoWorkout when undo button is clicked', async () => {
    const user = userEvent.setup();
    render(<WorkoutLogger {...defaultProps} />);
    
    const undoButton = screen.getByRole('button', { name: /Undo/i });
    await user.click(undoButton);
    
    expect(mockOnUndoWorkout).toHaveBeenCalled();
  });

  it('should show alert when trying to add workout while disconnected', async () => {
    const user = userEvent.setup();
    window.alert = jest.fn();
    
    render(<WorkoutLogger {...defaultProps} isConnected={false} />);
    
    const repsInput = screen.getByLabelText(/Reps/i);
    const addButton = screen.getByRole('button', { name: /Add Workout for Dad/i });
    
    await user.type(repsInput, '10');
    await user.click(addButton);
    
    expect(window.alert).toHaveBeenCalledWith('Please connect to your family first!');
    expect(mockOnAddWorkout).not.toHaveBeenCalled();
  });

  it('should show alert when trying to undo while disconnected', async () => {
    const user = userEvent.setup();
    window.alert = jest.fn();
    
    render(<WorkoutLogger {...defaultProps} isConnected={false} />);
    
    const undoButton = screen.getByRole('button', { name: /Undo/i });
    await user.click(undoButton);
    
    expect(window.alert).toHaveBeenCalledWith('Please connect to your family first!');
    expect(mockOnUndoWorkout).not.toHaveBeenCalled();
  });

  it('should handle add workout errors gracefully', async () => {
    const user = userEvent.setup();
    window.alert = jest.fn();
    mockOnAddWorkout.mockRejectedValue(new Error('Network error'));
    
    render(<WorkoutLogger {...defaultProps} />);
    
    const repsInput = screen.getByLabelText(/Reps/i);
    const addButton = screen.getByRole('button', { name: /Add Workout for Dad/i });
    
    await user.type(repsInput, '10');
    await user.click(addButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error adding workout. Please try again.');
    });
  });

  it('should handle undo workout errors gracefully', async () => {
    const user = userEvent.setup();
    window.alert = jest.fn();
    mockOnUndoWorkout.mockRejectedValue(new Error('Network error'));
    
    render(<WorkoutLogger {...defaultProps} />);
    
    const undoButton = screen.getByRole('button', { name: /Undo/i });
    await user.click(undoButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error undoing workout. Please try again.');
    });
  });

  it('should not submit with zero or negative reps', async () => {
    const user = userEvent.setup();
    render(<WorkoutLogger {...defaultProps} />);
    
    const repsInput = screen.getByLabelText(/Reps/i);
    const addButton = screen.getByRole('button', { name: /Add Workout for Dad/i });
    
    await user.type(repsInput, '0');
    expect(addButton).toBeDisabled();
    
    await user.clear(repsInput);
    await user.type(repsInput, '-5');
    expect(addButton).toBeDisabled();
  });
});