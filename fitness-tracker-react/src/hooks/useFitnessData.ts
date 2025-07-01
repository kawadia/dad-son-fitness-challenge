import { useState, useCallback, useEffect } from 'react';
import { WorkoutData, UserType, WorkoutSession } from '../types';
import { firebaseService } from '../services/firebase';
import { formatISO, isToday } from 'date-fns';

export const useFitnessData = () => {
  const [workoutData, setWorkoutData] = useState<WorkoutData>({ Dad: {}, Son: {} });
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType>('Dad');
  const [isConnected, setIsConnected] = useState(false);
  const [goalAchieved, setGoalAchieved] = useState<{user: UserType, timestamp: number} | null>(null);
  const [currentDate, setCurrentDate] = useState(() => formatISO(new Date(), { representation: 'date' }));

  const today = currentDate;

  // Check for date changes every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = formatISO(new Date(), { representation: 'date' });
      if (newDate !== currentDate) {
        console.log('Date changed from', currentDate, 'to', newDate);
        setCurrentDate(newDate);
        // Clear any goal achievements since it's a new day
        setGoalAchieved(null);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [currentDate]);

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedFamilyId = localStorage.getItem('familyId');
      const savedUser = localStorage.getItem('selectedUser') as UserType;
      
      if (savedFamilyId) {
        connectFamily(savedFamilyId);
      }
      if (savedUser && (savedUser === 'Dad' || savedUser === 'Son')) {
        setCurrentUser(savedUser);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Ensure today's data exists for both users
  const ensureTodaysData = useCallback((data: WorkoutData): WorkoutData => {
    const updatedData = { ...data };
    ['Dad', 'Son'].forEach(user => {
      if (!updatedData[user as UserType]) updatedData[user as UserType] = {};
      if (!updatedData[user as UserType][today]) {
        updatedData[user as UserType][today] = {
          sessions: [],
          totalReps: 0,
          goalMet: false
        };
      }
    });
    return updatedData;
  }, [today]);

  // Connect to family
  const connectFamily = useCallback(async (inputFamilyId: string) => {
    if (!inputFamilyId.trim()) {
      throw new Error('Please enter a family ID');
    }
    
    const cleanFamilyId = inputFamilyId.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    try {
      localStorage.setItem('familyId', cleanFamilyId);
      firebaseService.setFamilyId(cleanFamilyId);
      
      const loadedData = await firebaseService.initializeData();
      if (loadedData) {
        const dataWithToday = ensureTodaysData(loadedData);
        setWorkoutData(dataWithToday);
      }
      
      // Set up real-time listener
      firebaseService.setupRealtimeListener((data) => {
        const dataWithToday = ensureTodaysData(data);
        setWorkoutData(dataWithToday);
      });
      
      setFamilyId(cleanFamilyId);
      setIsConnected(true);
      
    } catch (error) {
      console.error('Error connecting to family:', error);
      throw error;
    }
  }, [ensureTodaysData]);

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedFamilyId = localStorage.getItem('familyId');
      const savedUser = localStorage.getItem('selectedUser') as UserType;
      
      if (savedFamilyId) {
        connectFamily(savedFamilyId);
      }
      if (savedUser && (savedUser === 'Dad' || savedUser === 'Son')) {
        setCurrentUser(savedUser);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Update data when date changes
  useEffect(() => {
    if (isConnected && workoutData) {
      const updatedData = ensureTodaysData(workoutData);
      if (JSON.stringify(updatedData) !== JSON.stringify(workoutData)) {
        setWorkoutData(updatedData);
      }
    }
  }, [today, isConnected, workoutData, ensureTodaysData]);

  // Disconnect from family
  const disconnectFamily = useCallback(() => {
    setFamilyId(null);
    setWorkoutData({ Dad: {}, Son: {} });
    setIsConnected(false);
    localStorage.removeItem('familyId');
  }, []);

  // Select user
  const selectUser = useCallback((user: UserType) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('selectedUser', user);
    } catch (error) {
      console.error('Error saving user selection:', error);
    }
  }, []);

  // Add workout
  const addWorkout = useCallback(async (exercise: string, reps: number) => {
    if (!familyId || !reps || reps <= 0) return;

    const session: WorkoutSession = {
      exercise,
      reps,
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString()
    };

    const updatedData = { ...workoutData };
    if (!updatedData[currentUser][today]) {
      updatedData[currentUser][today] = { sessions: [], totalReps: 0, goalMet: false };
    }
    
    const userToday = updatedData[currentUser][today];
    
    userToday.sessions.push(session);
    userToday.totalReps += reps;
    userToday.goalMet = userToday.totalReps >= 141;

    if (userToday.goalMet) {
      setGoalAchieved({ user: currentUser, timestamp: Date.now() });
    }

    setWorkoutData(updatedData);
    await firebaseService.saveData(updatedData);
  }, [workoutData, currentUser, today, familyId]);

  // Undo last workout
  const undoLastWorkout = useCallback(async () => {
    if (!familyId) return;
    
    const userToday = workoutData[currentUser][today];
    if (!userToday || userToday.sessions.length === 0) return;
    
    const updatedData = { ...workoutData };
    const lastSession = updatedData[currentUser][today].sessions.pop()!;
    updatedData[currentUser][today].totalReps -= lastSession.reps;
    updatedData[currentUser][today].goalMet = updatedData[currentUser][today].totalReps >= 141;
    
    setGoalAchieved(null);
    
    setWorkoutData(updatedData);
    await firebaseService.saveData(updatedData);
  }, [workoutData, currentUser, today, familyId]);

  // Get today's progress for user
  const getTodaysProgress = useCallback((user: UserType): number => {
    const todayData = workoutData[user]?.[today];
    return todayData ? todayData.totalReps : 0;
  }, [workoutData, today]);

  // Get today's sessions for user
  const getTodaysSessions = useCallback((user: UserType): WorkoutSession[] => {
    const todayData = workoutData[user]?.[today];
    return todayData ? todayData.sessions : [];
  }, [workoutData, today]);

  // Calculate streak for user
  const calculateStreak = useCallback((user: UserType): number => {
    const userData = workoutData[user] || {};
    const dates = Object.keys(userData).sort().reverse();
    let streak = 0;
    
    for (const date of dates) {
      if (userData[date]?.goalMet) {
        streak++;
      } else {
        // Don't break the streak if today's goal isn't met yet (day in progress)
        if (isToday(new Date(date))) {
          continue;
        }
        break;
      }
    }
    return streak;
  }, [workoutData]);

  // Check if user can undo
  const canUndo = useCallback((): boolean => {
    const userToday = workoutData[currentUser]?.[today];
    return !!(userToday?.sessions?.length > 0);
  }, [workoutData, currentUser, today]);

  // Check if user has achieved goal today
  const hasAchievedGoal = useCallback((user: UserType): boolean => {
    const todayData = workoutData[user]?.[today];
    return todayData ? todayData.goalMet : false;
  }, [workoutData, today]);

  return {
    workoutData,
    familyId,
    currentUser,
    isConnected,
    today,
    goalAchieved,
    connectFamily,
    disconnectFamily,
    selectUser,
    addWorkout,
    undoLastWorkout,
    getTodaysProgress,
    getTodaysSessions,
    calculateStreak,
    canUndo,
    hasAchievedGoal
  };
};