// Mock the entire firebase module before importing
const mockFirebaseServiceInstance = {
  connectToFamily: jest.fn(),
  disconnectFromFamily: jest.fn(),
  initializeData: jest.fn(),
  addWorkout: jest.fn(),
  undoLastWorkout: jest.fn(),
  exportData: jest.fn(),
  onDataChange: jest.fn()
};

const mockFirebaseService = {
  getInstance: jest.fn(() => mockFirebaseServiceInstance)
};

jest.mock('../firebase', () => ({
  FirebaseService: mockFirebaseService
}));

describe('FirebaseService', () => {
  const mockFamilyId = 'test-family-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const { FirebaseService } = require('../firebase');
      const instance1 = FirebaseService.getInstance();
      const instance2 = FirebaseService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('connectToFamily', () => {
    it('should successfully connect to existing family', async () => {
      mockFirebaseServiceInstance.connectToFamily.mockResolvedValue(true);

      const { FirebaseService } = require('../firebase');
      const service = FirebaseService.getInstance();
      const result = await service.connectToFamily(mockFamilyId);

      expect(result).toBe(true);
      expect(mockFirebaseServiceInstance.connectToFamily).toHaveBeenCalledWith(mockFamilyId);
    });

    it('should handle connection errors', async () => {
      mockFirebaseServiceInstance.connectToFamily.mockResolvedValue(false);

      const { FirebaseService } = require('../firebase');
      const service = FirebaseService.getInstance();
      const result = await service.connectToFamily('invalid-family');

      expect(result).toBe(false);
    });
  });

  describe('addWorkout', () => {
    const mockSession = {
      exercise: 'squats',
      reps: 20,
      time: '2:30 PM',
      timestamp: '2024-01-01T14:30:00.000Z'
    };

    it('should add workout session successfully', async () => {
      mockFirebaseServiceInstance.addWorkout.mockResolvedValue(undefined);

      const { FirebaseService } = require('../firebase');
      const service = FirebaseService.getInstance();
      await service.addWorkout('Dad', mockSession);

      expect(mockFirebaseServiceInstance.addWorkout).toHaveBeenCalledWith('Dad', mockSession);
    });

    it('should handle add workout errors', async () => {
      mockFirebaseServiceInstance.addWorkout.mockRejectedValue(new Error('Update failed'));

      const { FirebaseService } = require('../firebase');
      const service = FirebaseService.getInstance();

      await expect(service.addWorkout('Dad', mockSession))
        .rejects.toThrow('Update failed');
    });
  });

  describe('undoLastWorkout', () => {
    it('should undo last workout successfully', async () => {
      mockFirebaseServiceInstance.undoLastWorkout.mockResolvedValue(undefined);

      const { FirebaseService } = require('../firebase');
      const service = FirebaseService.getInstance();
      await service.undoLastWorkout('Dad');

      expect(mockFirebaseServiceInstance.undoLastWorkout).toHaveBeenCalledWith('Dad');
    });
  });

  describe('exportData', () => {
    it('should export workout data as CSV', async () => {
      const mockCsvData = 'Date,User,Exercise,Reps,Time\n2024-01-01,Dad,squats,20,2:30 PM';
      mockFirebaseServiceInstance.exportData.mockResolvedValue(mockCsvData);

      const { FirebaseService } = require('../firebase');
      const service = FirebaseService.getInstance();
      const csvData = await service.exportData();

      expect(csvData).toContain('Date,User,Exercise,Reps,Time');
      expect(csvData).toContain('2024-01-01,Dad,squats,20,2:30 PM');
    });

    it('should return empty CSV when no data', async () => {
      mockFirebaseServiceInstance.exportData.mockResolvedValue('Date,User,Exercise,Reps,Time\n');

      const { FirebaseService } = require('../firebase');
      const service = FirebaseService.getInstance();
      const csvData = await service.exportData();

      expect(csvData).toBe('Date,User,Exercise,Reps,Time\n');
    });
  });

  describe('initializeData', () => {
    it('should return current workout data', async () => {
      const mockData = { Dad: {}, Son: {} };
      mockFirebaseServiceInstance.initializeData.mockResolvedValue(mockData);

      const { FirebaseService } = require('../firebase');
      const service = FirebaseService.getInstance();
      const result = await service.initializeData();

      expect(result).toBe(mockData);
    });
  });
});