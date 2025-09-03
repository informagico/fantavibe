// src/utils/dataUtils.js - Versione aggiornata con original ranking

/**
 * Cache per la normalizzazione dei nomi
 */
const nameNormalizationCache = new Map();

/**
 * Normalizza un nome per il matching e la ricerca (con cache)
 */
export const normalizeName = (name) => {
  if (!name) return '';
  
  // Controlla la cache prima
  if (nameNormalizationCache.has(name)) {
    return nameNormalizationCache.get(name);
  }
  
  const normalized = name.toLowerCase()
    .replace(/[àáâä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[çć]/g, 'c')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Salva nella cache
  nameNormalizationCache.set(name, normalized);
  return normalized;
};

/**
 * Crea un indice di ricerca per performance ottimali
 */
const createSearchIndex = (players) => {
  const index = new Map();
  
  players.forEach((player, idx) => {
    const normalizedName = normalizeName(player.Nome);
    const words = normalizedName.split(' ');
    
    // Indicizza nome completo
    if (!index.has(normalizedName)) {
      index.set(normalizedName, []);
    }
    index.get(normalizedName).push(idx);
    
    // Indicizza ogni parola singolarmente
    words.forEach(word => {
      if (word.length > 2) { // Solo parole significative
        if (!index.has(word)) {
          index.set(word, []);
        }
        index.get(word).push(idx);
      }
    });
    
    // Indicizza prefissi per ricerca tipo-ahead
    for (let i = 3; i <= Math.min(normalizedName.length, 15); i++) {
      const prefix = normalizedName.substring(0, i);
      if (!index.has(prefix)) {
        index.set(prefix, []);
      }
      index.get(prefix).push(idx);
    }
  });
  
  return index;
};

/**
 * Calcola il ranking originale per ruolo
 */
const calculateOriginalRankings = (players) => {
  const roles = ['POR', 'DIF', 'CEN', 'ATT'];
  const rankings = {};
  
  // Calcola ranking per ogni ruolo
  roles.forEach(role => {
    const rolePlayers = players.filter(p => p.Ruolo === role);
    const sortedByConvenienza = sortPlayersByConvenienza(rolePlayers);
    
    // Assegna posizioni di ranking
    sortedByConvenienza.forEach((player, index) => {
      rankings[player.id] = {
        role: role,
        rank: index + 1,
        totalInRole: rolePlayers.length
      };
    });
  });
  
  return rankings;
};

/**
 * Normalizza i dati da FPEDIA con ottimizzazioni e ranking originale
 */
export const normalizePlayerData = (fpediaData) => {
  if (!fpediaData.length) return { players: [], searchIndex: new Map() };
  
  console.time('🚀 Data normalization with rankings');
  
  // Prima normalizzazione base
  const players = fpediaData.map(fpediaPlayer => {
    const normalizedName = normalizeName(fpediaPlayer.Nome);
    const playerId = fpediaPlayer.Nome 
      ? fpediaPlayer.Nome.replace(/\s+/g, '_').toLowerCase()
      : `player_${Math.random().toString(36).substr(2, 9)}`;

    return {
      ...fpediaPlayer,
      id: playerId,
      normalizedName, // Pre-calcolato per performance
      // Campi normalizzati per consistenza
      convenienza: fpediaPlayer['Convenienza Potenziale'] || 0,
      fantamedia: fpediaPlayer['Fantamedia anno 2024-2025'] || 0,
      presenze: fpediaPlayer['Presenze campionato corrente'] || 0,
      punteggio: fpediaPlayer.Punteggio || 0
    };
  });
  
  // Calcola ranking originali per ruolo
  const originalRankings = calculateOriginalRankings(players);
  
  // Aggiunge ranking originale ai giocatori
  const playersWithRanking = players.map(player => ({
    ...player,
    originalRank: originalRankings[player.id]?.rank || null,
    totalInRole: originalRankings[player.id]?.totalInRole || 0
  }));
  
  // Crea indice di ricerca
  const searchIndex = createSearchIndex(playersWithRanking);
  
  console.timeEnd('🚀 Data normalization with rankings');
  console.log(`✅ Created index for ${playersWithRanking.length} players with ${searchIndex.size} search terms`);
  console.log('📊 Original rankings calculated for all roles');
  
  return { players: playersWithRanking, searchIndex };
};

/**
 * Filtra giocatori per ruolo
 */
export const filterPlayersByRole = (players, role) => {
  return players.filter(player => player.Ruolo === role);
};

/**
 * Ricerca ottimizzata usando l'indice pre-calcolato
 */
export const searchPlayers = (players, searchTerm, searchIndex = null) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  // Se abbiamo l'indice, usa la ricerca ottimizzata
  if (searchIndex) {
    return searchPlayersOptimized(players, searchIndex, searchTerm);
  }
  
  // Fallback alla ricerca tradizionale (più lenta)
  const normalizedSearch = normalizeName(searchTerm);
  return players.filter(player => {
    const normalizedPlayerName = normalizeName(player.Nome);
    return normalizedPlayerName.includes(normalizedSearch);
  }).slice(0, 50); // Limita i risultati
};

/**
 * Ricerca ultra-veloce con indice
 */
const searchPlayersOptimized = (players, searchIndex, searchTerm) => {
  const startTime = performance.now();
  const normalizedSearch = normalizeName(searchTerm);
  const resultIndices = new Set();
  
  // Ricerca nell'indice
  for (let [key, indices] of searchIndex.entries()) {
    if (key.includes(normalizedSearch)) {
      indices.forEach(idx => resultIndices.add(idx));
    }
  }
  
  // Converti indici in giocatori e ordina
  const results = Array.from(resultIndices)
    .slice(0, 50) // Limita risultati
    .map(idx => players[idx])
    .sort((a, b) => {
      const aName = a.normalizedName;
      const bName = b.normalizedName;
      
      // Priorità: match esatto > prefisso > parziale
      const aExact = aName === normalizedSearch ? 3 : 0;
      const bExact = bName === normalizedSearch ? 3 : 0;
      const aStarts = aName.startsWith(normalizedSearch) ? 2 : 0;
      const bStarts = bName.startsWith(normalizedSearch) ? 2 : 0;
      const aContains = aName.includes(normalizedSearch) ? 1 : 0;
      const bContains = bName.includes(normalizedSearch) ? 1 : 0;
      
      const aScore = aExact + aStarts + aContains;
      const bScore = bExact + bStarts + bContains;
      
      if (aScore !== bScore) return bScore - aScore;
      
      // Come criterio secondario, ordina per convenienza
      return (b.convenienza || 0) - (a.convenienza || 0);
    });
  
  const endTime = performance.now();
  console.log(`🔍 Search "${searchTerm}" took ${Math.round(endTime - startTime)}ms - found ${results.length} results`);
  
  return results;
};

/**
 * Ordina giocatori per convenienza potenziale (decrescente)
 */
export const sortPlayersByConvenienza = (players) => {
  return [...players].sort((a, b) => (b.convenienza || 0) - (a.convenienza || 0));
};

/**
 * Ottiene statistiche riassuntive per un ruolo
 */
export const getRoleStats = (players, role) => {
  const rolePlayers = filterPlayersByRole(players, role);
  
  if (!rolePlayers.length) {
    return { count: 0, avgConvenienza: 0, avgFantamedia: 0 };
  }

  const totalConvenienza = rolePlayers.reduce((sum, p) => sum + (p.convenienza || 0), 0);
  const totalFantamedia = rolePlayers.reduce((sum, p) => sum + (p.fantamedia || 0), 0);
  
  return {
    count: rolePlayers.length,
    avgConvenienza: (totalConvenienza / rolePlayers.length).toFixed(2),
    avgFantamedia: (totalFantamedia / rolePlayers.length).toFixed(2)
  };
};

/**
 * Valida i dati di un giocatore
 */
export const validatePlayer = (player) => {
  const errors = [];
  
  if (!player.Nome || typeof player.Nome !== 'string') {
    errors.push('Nome mancante o non valido');
  }
  
  if (!player.Ruolo || !['ATT', 'DIF', 'CEN', 'POR'].includes(player.Ruolo)) {
    errors.push('Ruolo mancante o non valido');
  }
  
  if (!player.Squadra || typeof player.Squadra !== 'string') {
    errors.push('Squadra mancante o non valida');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Utility per debouncing
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
