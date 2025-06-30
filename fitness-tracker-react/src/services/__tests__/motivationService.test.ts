import { MotivationService, getTimeLeft } from '../motivationService';

// Mock fetch globally
global.fetch = jest.fn();

describe('MotivationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStats = {
    dadReps: 50,
    sonReps: 30,
    dadGoalMet: false,
    sonGoalMet: false,
    hoursLeft: 8,
    minutesLeft: 30,
    currentTime: '2:30 PM',
    currentDate: 'Monday, January 1, 2024'
  };

  describe('getMotivationalQuote', () => {
    it('should return quote from Firebase Function when successful', async () => {
      const mockResponse = { quote: 'Keep pushing, team! 💪' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await MotivationService.getMotivationalQuote(mockStats);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('getMotivationalQuote'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockStats)
        }
      );
      expect(result).toBe('Keep pushing, team! 💪');
    });

    it('should return fallback quote when Firebase Function fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await MotivationService.getMotivationalQuote(mockStats);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return fallback quote when Firebase Function returns error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const result = await MotivationService.getMotivationalQuote(mockStats);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return contextual quote when both goals are met', async () => {
      const completedStats = {
        ...mockStats,
        dadGoalMet: true,
        sonGoalMet: true
      };

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Force fallback'));

      const result = await MotivationService.getMotivationalQuote(completedStats);

      expect(result).toContain('Both champions completed');
      expect(result).toContain('🎉');
    });

    it('should return dad-specific quote when only dad completed', async () => {
      const dadCompletedStats = {
        ...mockStats,
        dadGoalMet: true,
        sonGoalMet: false
      };

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Force fallback'));

      const result = await MotivationService.getMotivationalQuote(dadCompletedStats);

      expect(result).toContain('Dad\'s crushing it');
      expect(result).toContain('Son');
    });

    it('should return son-specific quote when only son completed', async () => {
      const sonCompletedStats = {
        ...mockStats,
        dadGoalMet: false,
        sonGoalMet: true
      };

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Force fallback'));

      const result = await MotivationService.getMotivationalQuote(sonCompletedStats);

      expect(result).toContain('Son\'s on fire');
      expect(result).toContain('Dad');
    });

    it('should return time-sensitive quote when less than 3 hours left', async () => {
      const urgentStats = {
        ...mockStats,
        hoursLeft: 2
      };

      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Force fallback'));

      const result = await MotivationService.getMotivationalQuote(urgentStats);

      expect(result).toContain('Crunch time');
      expect(result).toContain('final hours');
    });
  });
});

describe('getTimeLeft', () => {
  it('should return hours and minutes left in the day', () => {
    // Mock a fixed time: 2:30 PM on Jan 1, 2024
    const mockTime = new Date('2024-01-01T14:30:00').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(mockTime);
    
    // Mock Date constructor for new Date() calls
    const OriginalDate = Date;
    global.Date = jest.fn((dateString?: any) => {
      if (dateString === undefined) {
        return new OriginalDate(mockTime);
      }
      return new OriginalDate(dateString);
    }) as any;
    global.Date.now = jest.fn(() => mockTime);

    const result = getTimeLeft();

    // At 2:30 PM, there should be 9 hours 29 minutes left until midnight
    expect(result.hoursLeft).toBe(9);
    expect(result.minutesLeft).toBe(29);
    
    // Restore mocks
    global.Date = OriginalDate;
    jest.restoreAllMocks();
  });

  it('should return minimal time at end of day', () => {
    // Mock a time very close to midnight: 11:59 PM
    const mockTime = new Date('2024-01-01T23:59:00').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(mockTime);
    
    const OriginalDate = Date;
    global.Date = jest.fn((dateString?: any) => {
      if (dateString === undefined) {
        return new OriginalDate(mockTime);
      }
      return new OriginalDate(dateString);
    }) as any;
    global.Date.now = jest.fn(() => mockTime);

    const result = getTimeLeft();

    // At 11:59 PM, there should be 0 hours and 0 minutes left
    expect(result.hoursLeft).toBe(0);
    expect(result.minutesLeft).toBe(0);
    
    global.Date = OriginalDate;
    jest.restoreAllMocks();
  });
});