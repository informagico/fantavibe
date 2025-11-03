import {
  normalizeName,
  normalizePlayerData,
  filterPlayersByRole,
  searchPlayers,
  sortPlayersByConvenienza,
  getRoleStats,
  validatePlayer,
  debounce
} from './dataUtils';

describe('DataUtils - Core Functions', () => {
  const mockPlayers = [
    {
      Nome: 'Mario Rossi',
      Ruolo: 'ATT',
      Squadra: 'Juventus',
      'Convenienza Potenziale': 85,
      'Fantamedia anno 2024-2025': 7.5,
      Infortunato: 'false'
    },
    {
      Nome: 'Luca Bianchi',
      Ruolo: 'CEN',
      Squadra: 'Milan',
      'Convenienza Potenziale': 70,
      'Fantamedia anno 2024-2025': 6.8,
      Infortunato: 'true'
    },
    {
      Nome: 'Giuseppe Verdi',
      Ruolo: 'ATT',
      Squadra: 'Inter',
      'Convenienza Potenziale': 90,
      'Fantamedia anno 2024-2025': 8.2,
      Infortunato: 'false'
    },
    {
      Nome: 'Andrea Neri',
      Ruolo: 'DIF',
      Squadra: 'Napoli',
      'Convenienza Potenziale': 65,
      'Fantamedia anno 2024-2025': 6.2,
      Infortunato: 'false'
    }
  ];

  describe('normalizeName', () => {
    test('normalizes accented characters', () => {
      expect(normalizeName('José María')).toBe('jose maria');
      expect(normalizeName('Müller')).toBe('muller');
      expect(normalizeName('François')).toBe('francois');
    });

    test('handles empty or null input', () => {
      expect(normalizeName('')).toBe('');
      expect(normalizeName(null)).toBe('');
      expect(normalizeName(undefined)).toBe('');
    });

    test('removes special characters and normalizes spacing', () => {
      expect(normalizeName('Mario-Giuseppe   D\'Ambrosio')).toBe('mariogiuseppe dambrosio');
    });

    test('uses cache for performance', () => {
      const name = 'Test Player';
      const first = normalizeName(name);
      const second = normalizeName(name);
      expect(first).toBe(second);
      expect(first).toBe('test player');
    });
  });

  describe('filterPlayersByRole', () => {
    let normalizedPlayers;

    beforeEach(() => {
      const { players } = normalizePlayerData(mockPlayers);
      normalizedPlayers = players;
    });

    test('filters attackers correctly', () => {
      const attackers = filterPlayersByRole(normalizedPlayers, 'ATT');
      expect(attackers).toHaveLength(2);
      expect(attackers.every(p => p.Ruolo === 'ATT')).toBe(true);
    });

    test('filters midfielders correctly', () => {
      const midfielders = filterPlayersByRole(normalizedPlayers, 'CEN');
      expect(midfielders).toHaveLength(1);
      expect(midfielders[0].Nome).toBe('Luca Bianchi');
    });

    test('handles non-existent role', () => {
      const goalkeepers = filterPlayersByRole(normalizedPlayers, 'POR');
      expect(goalkeepers).toHaveLength(0);
    });
  });

  describe('sortPlayersByConvenienza', () => {
    let normalizedPlayers;

    beforeEach(() => {
      const { players } = normalizePlayerData(mockPlayers);
      normalizedPlayers = players;
    });

    test('sorts by convenienza descending', () => {
      const sorted = sortPlayersByConvenienza(normalizedPlayers);
      expect(sorted[0].convenienza).toBe(90); // Giuseppe Verdi
      expect(sorted[1].convenienza).toBe(85); // Mario Rossi
      expect(sorted[2].convenienza).toBe(70); // Luca Bianchi
      expect(sorted[3].convenienza).toBe(65); // Andrea Neri
    });

    test('does not mutate original array', () => {
      const originalOrder = [...normalizedPlayers];
      sortPlayersByConvenienza(normalizedPlayers);
      expect(normalizedPlayers).toEqual(originalOrder);
    });

    test('handles players without convenienza', () => {
      const playersWithoutConvenienza = [
        { Nome: 'Player 1' },
        { Nome: 'Player 2', convenienza: 50 }
      ];
      const sorted = sortPlayersByConvenienza(playersWithoutConvenienza);
      expect(sorted[0].convenienza).toBe(50);
      expect(sorted[1].convenienza || 0).toBe(0);
    });
  });

  describe('searchPlayers', () => {
    let normalizedPlayers, searchIndex;

    beforeEach(() => {
      const result = normalizePlayerData(mockPlayers);
      normalizedPlayers = result.players;
      searchIndex = result.searchIndex;
    });

    test('finds players by name', () => {
      const results = searchPlayers(normalizedPlayers, 'mario', searchIndex);
      expect(results).toHaveLength(1);
      expect(results[0].Nome).toBe('Mario Rossi');
    });

    test('finds players by partial name', () => {
      const results = searchPlayers(normalizedPlayers, 'luc', searchIndex);
      expect(results).toHaveLength(1);
      expect(results[0].Nome).toBe('Luca Bianchi');
    });

    test('finds players by team', () => {
      const results = searchPlayers(normalizedPlayers, 'milan', searchIndex);
      expect(results).toHaveLength(1);
      expect(results[0].Squadra).toBe('Milan');
    });

    test('finds injured players', () => {
      const results = searchPlayers(normalizedPlayers, 'infortunato', searchIndex);
      expect(results).toHaveLength(1);
      expect(results[0].Nome).toBe('Luca Bianchi');
    });

    test('returns empty array for short search terms', () => {
      expect(searchPlayers(normalizedPlayers, 'a', searchIndex)).toHaveLength(0);
      expect(searchPlayers(normalizedPlayers, '', searchIndex)).toHaveLength(0);
    });

    test('falls back to basic search without index', () => {
      const results = searchPlayers(normalizedPlayers, 'mario', null);
      expect(results).toHaveLength(1);
      expect(results[0].Nome).toBe('Mario Rossi');
    });
  });

  describe('getRoleStats', () => {
    let normalizedPlayers;

    beforeEach(() => {
      const { players } = normalizePlayerData(mockPlayers);
      normalizedPlayers = players;
    });

    test('calculates stats for attackers', () => {
      const stats = getRoleStats(normalizedPlayers, 'ATT');
      expect(stats.count).toBe(2);
      expect(parseFloat(stats.avgConvenienza)).toBe(87.5);
      expect(parseFloat(stats.avgFantamedia)).toBe(7.85);
    });

    test('handles role with no players', () => {
      const stats = getRoleStats(normalizedPlayers, 'POR');
      expect(stats.count).toBe(0);
      expect(stats.avgConvenienza).toBe(0);
      expect(stats.avgFantamedia).toBe(0);
    });

    test('calculates stats for single player role', () => {
      const stats = getRoleStats(normalizedPlayers, 'CEN');
      expect(stats.count).toBe(1);
      expect(parseFloat(stats.avgConvenienza)).toBe(70);
    });
  });

  describe('validatePlayer', () => {
    test('validates correct player data', () => {
      const player = {
        Nome: 'Test Player',
        Ruolo: 'ATT',
        Squadra: 'Test Team'
      };
      const result = validatePlayer(player);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('catches missing name', () => {
      const player = { Ruolo: 'ATT', Squadra: 'Test Team' };
      const result = validatePlayer(player);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nome mancante o non valido');
    });

    test('catches invalid role', () => {
      const player = { Nome: 'Test', Ruolo: 'INVALID', Squadra: 'Test Team' };
      const result = validatePlayer(player);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ruolo mancante o non valido');
    });

    test('catches missing squadra', () => {
      const player = { Nome: 'Test', Ruolo: 'ATT' };
      const result = validatePlayer(player);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Squadra mancante o non valida');
    });
  });

  describe('normalizePlayerData', () => {
    test('normalizes player data with rankings', () => {
      const { players, searchIndex } = normalizePlayerData(mockPlayers);
      
      expect(players).toHaveLength(4);
      expect(players[0]).toHaveProperty('id');
      expect(players[0]).toHaveProperty('convenienza');
      expect(players[0]).toHaveProperty('originalRank');
      expect(searchIndex).toBeInstanceOf(Map);
      expect(searchIndex.size).toBeGreaterThan(0);
    });

    test('handles empty data', () => {
      const { players, searchIndex } = normalizePlayerData([]);
      expect(players).toHaveLength(0);
      expect(searchIndex).toBeInstanceOf(Map);
    });

    test('assigns correct rankings by role', () => {
      const { players } = normalizePlayerData(mockPlayers);
      const attackers = players.filter(p => p.Ruolo === 'ATT');
      
      // Giuseppe Verdi (convenienza 90) should be rank 1
      // Mario Rossi (convenienza 85) should be rank 2
      const giuseppe = attackers.find(p => p.Nome === 'Giuseppe Verdi');
      const mario = attackers.find(p => p.Nome === 'Mario Rossi');
      
      expect(giuseppe.originalRank).toBe(1);
      expect(mario.originalRank).toBe(2);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    test('delays function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);
      
      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    test('cancels previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 300);
      
      debouncedFn('first');
      debouncedFn('second');
      
      jest.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });
  });
});