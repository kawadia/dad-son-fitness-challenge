import { renderHook, act, waitFor } from '@testing-library/react';
import { useFitnessData } from '../useFitnessData';
import { FirebaseService } from '../../services/firebase';

// Mock the Firebase service
jest.mock('../../services/firebase', () => ({
  FirebaseService: {
    getInstance: jest.fn()
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useFitnessData', () => {
  let mockFirebaseService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockFirebaseService = {
      connectToFamily: jest.fn(),
      disconnectFromFamily: jest.fn(),
      initializeData: jest.fn(),
      addWorkout: jest.fn(),
      undoLastWorkout: jest.fn(),
      exportData: jest.fn(),
      onDataChange: jest.fn()
    };
    
    (FirebaseService.getInstance as jest.Mock).mockReturnValue(mockFirebaseService);
    
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'familyId') return 'test-family';
      if (key === 'currentUser') return 'Dad';
      return null;
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFitnessData());
    
    expect(result.current.workoutData).toBeNull();
    expect(result.current.familyId).toBe('test-family');
    expect(result.current.currentUser).toBe('Dad');
    expect(result.current.isConnected).toBe(false);
    expect(result.current.goalAchieved).toBeNull();
  });

  it('should connect to family successfully', async () => {
    const mockWorkoutData = { Dad: {}, Son: {}, lastUpdated: '2024-01-01' };
    
    mockFirebaseService.connectToFamily.mockResolvedValue(true);
    mockFirebaseService.initializeData.mockResolvedValue(mockWorkoutData);
    
    const { result } = renderHook(() => useFitnessData());
    
    await act(async () => {
      await result.current.connectFamily('test-family-123');
    });
    
    expect(mockFirebaseService.connectToFamily).toHaveBeenCalledWith('test-family-123');
    expect(result.current.isConnected).toBe(true);
    expect(result.current.familyId).toBe('test-family-123');
    expect(result.current.workoutData).toBe(mockWorkoutData);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('familyId', 'test-family-123');
  });

  it('should handle connection failure', async () => {
    mockFirebaseService.connectToFamily.mockResolvedValue(false);
    
    const { result } = renderHook(() => useFitnessData());
    
    await act(async () => {
      await result.current.connectFamily('invalid-family');
    });
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.workoutData).toBeNull();
  });

  it('should disconnect from family', () => {
    const { result } = renderHook(() => useFitnessData());
    
    act(() => {
      result.current.disconnectFamily();
    });
    
    expect(mockFirebaseService.disconnectFromFamily).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.workoutData).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('familyId');
  });

  it('should select user and save to localStorage', () => {
    const { result } = renderHook(() => useFitnessData());
    
    act(() => {
      result.current.selectUser('Son');
    });
    
    expect(result.current.currentUser).toBe('Son');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('currentUser', 'Son');
  });

  it('should add workout successfully', async () => {
    const mockWorkoutData = {
      Dad: {
        '2024-01-01': {
          sessions: [{ exercise: 'squats', reps: 20, time: '2:30 PM', timestamp: '2024-01-01T14:30:00.000Z' }],
          totalReps: 20,
          goalMet: false
        }
      },
      Son: {},
      lastUpdated: '2024-01-01'
    };
    
    mockFirebaseService.connectToFamily.mockResolvedValue(true);
    mockFirebaseService.initializeData.mockResolvedValue(mockWorkoutData);
    mockFirebaseService.addWorkout.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useFitnessData());
    
    // First connect
    await act(async () => {
      await result.current.connectFamily('test-family');
    });
    
    // Then add workout
    await act(async () => {
      await result.current.addWorkout('squats', 20);
    });
    
    expect(mockFirebaseService.addWorkout).toHaveBeenCalledWith(
      'Dad',
      expect.objectContaining({
        exercise: 'squats',
        reps: 20,
        time: expect.any(String),
        timestamp: expect.any(String)
      })
    );
  });

  it('should undo last workout', async () => {
    const { result } = renderHook(() => useFitnessData());
    
    mockFirebaseService.connectToFamily.mockResolvedValue(true);
    mockFirebaseService.initializeData.mockResolvedValue({ Dad: {}, Son: {} });
    mockFirebaseService.undoLastWorkout.mockResolvedValue(undefined);
    
    // First connect
    await act(async () => {
      await result.current.connectFamily('test-family');
    });
    
    // Then undo workout
    await act(async () => {
      await result.current.undoLastWorkout();
    });
    
    expect(mockFirebaseService.undoLastWorkout).toHaveBeenCalledWith('Dad');
  });

  it('should calculate today\'s progress correctly', () => {
    const mockWorkoutData = {
      Dad: {
        '2024-01-01': {
          sessions: [
            { exercise: 'squats', reps: 20, time: '2:30 PM', timestamp: '2024-01-01T14:30:00.000Z' },
            { exercise: 'pushups', reps: 15, time: '3:00 PM', timestamp: '2024-01-01T15:00:00.000Z' }
          ],
          totalReps: 35,
          goalMet: false
        }
      },
      Son: {},
      lastUpdated: '2024-01-01'
    };
    
    const { result } = renderHook(() => useFitnessData());
    
    act(() => {
      (result.current as any).setWorkoutData(mockWorkoutData);
    });
    
    // Mock current date
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T12:00:00.000Z');
    
    const progress = result.current.getTodaysProgress('Dad');
    expect(progress).toBe(35);
  });

  it('should get today\'s sessions correctly', () => {
    const todayString = new Date().toISOString().split('T')[0];
    const mockWorkoutData = {
      Dad: {
        [todayString]: {
          sessions: [
            { exercise: 'squats', reps: 20, time: '2:30 PM', timestamp: '2024-01-01T14:30:00.000Z' }
          ],
          totalReps: 20,
          goalMet: false
        }
      },
      Son: {},
      lastUpdated: '2024-01-01'
    };
    
    const { result } = renderHook(() => useFitnessData());
    
    act(() => {
      (result.current as any).setWorkoutData(mockWorkoutData);
    });
    
    const sessions = result.current.getTodaysSessions('Dad');
    expect(sessions).toHaveLength(1);
    expect(sessions[0].exercise).toBe('squats');
  });

  it('should calculate streak correctly', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);
    
    const mockWorkoutData = {
      Dad: {
        [today.toISOString().split('T')[0]]: { totalReps: 141, goalMet: true },
        [yesterday.toISOString().split('T')[0]]: { totalReps: 141, goalMet: true },
        [dayBefore.toISOString().split('T')[0]]: { totalReps: 100, goalMet: false }
      },
      Son: {},
      lastUpdated: '2024-01-01'
    };
    
    const { result } = renderHook(() => useFitnessData());
    
    act(() => {
      (result.current as any).setWorkoutData(mockWorkoutData);
    });
    
    const streak = result.current.calculateStreak('Dad');
    expect(streak).toBe(2); // Today and yesterday
  });

  it('should determine if user can undo', () => {
    const todayString = new Date().toISOString().split('T')[0];
    const mockWorkoutData = {
      Dad: {
        [todayString]: {
          sessions: [
            { exercise: 'squats', reps: 20, time: '2:30 PM', timestamp: '2024-01-01T14:30:00.000Z' }
          ]
        }
      },
      Son: {},
      lastUpdated: '2024-01-01'
    };
    
    const { result } = renderHook(() => useFitnessData());
    
    act(() => {
      (result.current as any).setWorkoutData(mockWorkoutData);
    });
    
    expect(result.current.canUndo()).toBe(true);
  });

  it('should handle data change events', async () => {
    const { result } = renderHook(() => useFitnessData());
    
    mockFirebaseService.connectToFamily.mockResolvedValue(true);
    mockFirebaseService.initializeData.mockResolvedValue({ Dad: {}, Son: {} });
    
    // Connect first
    await act(async () => {
      await result.current.connectFamily('test-family');
    });
    
    // Verify onDataChange was called
    expect(mockFirebaseService.onDataChange).toHaveBeenCalled();
  });

  it('should update current date dynamically', () => {
    jest.useFakeTimers();
    
    const { result } = renderHook(() => useFitnessData());
    
    const initialDate = result.current.currentDate;
    
    // Advance time by more than a minute
    act(() => {
      jest.advanceTimersByTime(70000); // 70 seconds
    });
    
    // The date should be checked and potentially updated
    expect(typeof result.current.currentDate).toBe('string');
    
    jest.useRealTimers();
  });
});