import {
  updatePlayerStatus,
  getAcquiredPlayers,
  getTotalFantamilioni,
  canAffordPlayer,
  calculateRemainingBudget,
  getBudgetStats,
  loadBudget,
  saveBudget,
  exportPlayerStatus,
  importPlayerStatus,
  clearPlayerStatus
} from './storage';

describe('Storage - Budget Logic', () => {
  const baseMockPlayerStatus = {
    'player1': { status: 'acquired', fantamilioni: 100, timestamp: '2023-01-01' },
    'player2': { status: 'acquired', fantamilioni: 50, timestamp: '2023-01-02' },
    'player3': { status: 'unavailable', timestamp: '2023-01-03' }
  };

  let mockPlayerStatus;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    // Create fresh copy of mock data for each test
    mockPlayerStatus = JSON.parse(JSON.stringify(baseMockPlayerStatus));
  });

  describe('getTotalFantamilioni', () => {
    test('calculates total spent correctly', () => {
      expect(getTotalFantamilioni(mockPlayerStatus)).toBe(150);
    });

    test('handles empty playerStatus', () => {
      expect(getTotalFantamilioni({})).toBe(0);
    });

    test('handles undefined playerStatus', () => {
      expect(getTotalFantamilioni()).toBe(0);
    });

    test('ignores non-acquired players', () => {
      const statusWithUnavailable = {
        'player1': { status: 'acquired', fantamilioni: 100 },
        'player2': { status: 'unavailable' }
      };
      expect(getTotalFantamilioni(statusWithUnavailable)).toBe(100);
    });

    // NEW: Test edge cases
    test('handles null fantamilioni values', () => {
      const statusWithNulls = {
        'player1': { status: 'acquired', fantamilioni: null },
        'player2': { status: 'acquired', fantamilioni: 50 }
      };
      expect(getTotalFantamilioni(statusWithNulls)).toBe(50);
    });

    test('handles non-numeric fantamilioni values', () => {
      const statusWithInvalid = {
        'player1': { status: 'acquired', fantamilioni: 'invalid' },
        'player2': { status: 'acquired', fantamilioni: 50 }
      };
      expect(getTotalFantamilioni(statusWithInvalid)).toBe(50);
    });

    test('handles very large numbers', () => {
      const statusWithLarge = {
        'player1': { status: 'acquired', fantamilioni: 999999 }
      };
      expect(getTotalFantamilioni(statusWithLarge)).toBe(999999);
    });
  });

  describe('canAffordPlayer', () => {
    test('allows purchase within budget', () => {
      expect(canAffordPlayer(50, 500, mockPlayerStatus)).toBe(true);
    });

    test('prevents overspending', () => {
      expect(canAffordPlayer(400, 500, mockPlayerStatus)).toBe(false);
    });

    test('allows exact remaining budget', () => {
      expect(canAffordPlayer(350, 500, mockPlayerStatus)).toBe(true);
    });

    test('handles empty player status', () => {
      expect(canAffordPlayer(100, 500, {})).toBe(true);
    });

    // NEW: Critical edge cases
    test('handles zero fantamilioni purchase', () => {
      expect(canAffordPlayer(0, 500, mockPlayerStatus)).toBe(true);
    });

    test('handles negative fantamilioni (should not happen but defensive)', () => {
      expect(canAffordPlayer(-10, 500, mockPlayerStatus)).toBe(true);
    });

    test('handles zero budget', () => {
      expect(canAffordPlayer(1, 0, {})).toBe(false);
    });

    test('handles floating point precision', () => {
      const precisionStatus = {
        'player1': { status: 'acquired', fantamilioni: 33.33 }
      };
      expect(canAffordPlayer(66.67, 100, precisionStatus)).toBe(true);
    });
  });

  describe('calculateRemainingBudget', () => {
    test('calculates remaining budget correctly', () => {
      expect(calculateRemainingBudget(500, mockPlayerStatus)).toBe(350);
    });

    test('handles budget smaller than spent', () => {
      expect(calculateRemainingBudget(100, mockPlayerStatus)).toBe(-50);
    });

    test('handles zero budget', () => {
      expect(calculateRemainingBudget(0, mockPlayerStatus)).toBe(-150);
    });
  });

  describe('updatePlayerStatus', () => {
    test('adds new acquired player', () => {
      const result = updatePlayerStatus({}, 'newPlayer', 'acquired', 75);
      expect(result.newPlayer.status).toBe('acquired');
      expect(result.newPlayer.fantamilioni).toBe(75);
      expect(result.newPlayer.timestamp).toBeDefined();
    });

    test('removes player when status is available', () => {
      const result = updatePlayerStatus(mockPlayerStatus, 'player1', 'available');
      expect(result.player1).toBeUndefined();
    });

    test('updates existing player', () => {
      const result = updatePlayerStatus(mockPlayerStatus, 'player1', 'unavailable');
      expect(result.player1.status).toBe('unavailable');
      expect(result.player1.fantamilioni).toBeUndefined();
    });

    test('handles undefined currentStatus', () => {
      const result = updatePlayerStatus(undefined, 'player1', 'acquired', 100);
      expect(result.player1.status).toBe('acquired');
      expect(result.player1.fantamilioni).toBe(100);
    });

    // NEW: More robust edge cases
    test('handles zero fantamilioni acquisition', () => {
      const result = updatePlayerStatus({}, 'player1', 'acquired', 0);
      expect(result.player1.status).toBe('acquired');
      expect(result.player1.fantamilioni).toBeUndefined(); // Zero is falsy, should not be set
    });

    test('handles null fantamilioni', () => {
      const result = updatePlayerStatus({}, 'player1', 'acquired', null);
      expect(result.player1.status).toBe('acquired');
      expect(result.player1.fantamilioni).toBeUndefined();
    });

    test('preserves existing data when updating', () => {
      const currentStatus = { 'player1': { status: 'acquired', fantamilioni: 100, customField: 'test' }};
      const result = updatePlayerStatus(currentStatus, 'player1', 'unavailable');
      // Should create new object, not preserve custom fields
      expect(result.player1.customField).toBeUndefined();
    });
  });

  describe('getAcquiredPlayers', () => {
    test('returns only acquired players', () => {
      const acquired = getAcquiredPlayers(mockPlayerStatus);
      expect(acquired).toHaveLength(2);
      expect(acquired[0].playerId).toBe('player1');
      expect(acquired[1].playerId).toBe('player2');
    });

    test('handles empty status', () => {
      expect(getAcquiredPlayers({})).toHaveLength(0);
    });

    test('handles undefined status', () => {
      expect(getAcquiredPlayers()).toHaveLength(0);
    });
  });

  describe('getBudgetStats', () => {
    test('calculates complete budget statistics', () => {
      const stats = getBudgetStats(500, mockPlayerStatus);
      
      expect(stats.totalBudget).toBe(500);
      expect(stats.totalSpent).toBe(150);
      expect(stats.remainingBudget).toBe(350);
      expect(stats.playersCount).toBe(2);
      expect(stats.averageSpentPerPlayer).toBe(75); // (100 + 50) / 2 = 75
      expect(stats.budgetUtilization).toBe(30); // 150/500 * 100 = 30%
    });

    test('handles zero budget', () => {
      const stats = getBudgetStats(0, mockPlayerStatus);
      expect(stats.budgetUtilization).toBe(0);
    });

    test('handles no acquired players', () => {
      const stats = getBudgetStats(500, {});
      expect(stats.averageSpentPerPlayer).toBe(0);
      expect(stats.playersCount).toBe(0);
    });
  });

  // NEW: localStorage integration tests
  describe('Budget Persistence', () => {
    test('saves and loads budget correctly', () => {
      saveBudget(750);
      expect(loadBudget()).toBe(750);
    });

    test('loads default budget when none saved', () => {
      expect(loadBudget()).toBe(500);
    });

    test('handles corrupted budget in localStorage', () => {
      localStorage.setItem('fantacalcio_budget', 'invalid');
      expect(loadBudget()).toBe(500);
    });

    test('clears all data correctly', () => {
      saveBudget(600);
      localStorage.setItem('fantacalcio_player_status', JSON.stringify(mockPlayerStatus));
      
      clearPlayerStatus();
      
      expect(loadBudget()).toBe(500);
      expect(localStorage.getItem('fantacalcio_player_status')).toBeNull();
    });
  });

  // NEW: Export/Import robustness tests
  describe('Data Export/Import', () => {
    test('exports data with correct structure', () => {
      const exported = exportPlayerStatus(mockPlayerStatus, [], 600);
      const parsed = JSON.parse(exported);
      
      expect(parsed.version).toBe('2.1');
      expect(parsed.data).toEqual(mockPlayerStatus);
      expect(parsed.budget).toBe(600);
      expect(parsed.summary.totalFantamilioni).toBe(150);
      expect(parsed.timestamp).toBeDefined();
    });

    test('imports valid data correctly', () => {
      const exportedData = {
        version: '2.1',
        data: mockPlayerStatus,
        budget: 600
      };
      
      const result = importPlayerStatus(JSON.stringify(exportedData));
      
      expect(result.playerStatus).toEqual(mockPlayerStatus);
      expect(result.budget).toBe(600);
    });

    test('rejects invalid import data', () => {
      const invalidData = { version: '1.0' }; // Missing data field
      const result = importPlayerStatus(JSON.stringify(invalidData));
      
      expect(result).toBeNull();
    });

    test('handles malformed JSON import', () => {
      const result = importPlayerStatus('invalid json');
      expect(result).toBeNull();
    });
  });

  // NEW: Performance and memory tests
  describe('Performance Edge Cases', () => {
    test('handles large number of players efficiently', () => {
      const largePlayerStatus = {};
      for (let i = 0; i < 10000; i++) {
        largePlayerStatus[`player${i}`] = { status: 'acquired', fantamilioni: i % 100 };
      }
      
      const start = performance.now();
      const total = getTotalFantamilioni(largePlayerStatus);
      const end = performance.now();
      
      expect(total).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });
  });
});