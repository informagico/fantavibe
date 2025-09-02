// Utility per la gestione e normalizzazione dei dati giocatori

/**
 * Normalizza un nome per il matching tra dataset
 * @param {string} name - Nome da normalizzare
 * @returns {string} Nome normalizzato
 */
export const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/[àáâä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[çć]/g, 'c')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z\s]/g, '')
    .trim();
};

/**
 * Combina i dati da FPEDIA e FSTATS
 * @param {Array} fpediaData - Dati dal file FPEDIA
 * @param {Array} fstatsData - Dati dal file FSTATS
 * @returns {Array} Array di giocatori con dati combinati
 */
export const normalizePlayerData = (fpediaData, fstatsData) => {
  if (!fpediaData.length) return [];
  
  return fpediaData.map(fpediaPlayer => {
    // Cerca il giocatore corrispondente in FSTATS
    const normalizedName = normalizeName(fpediaPlayer.Nome);
    const fstatsPlayer = fstatsData.find(p => 
      normalizeName(p.Nome) === normalizedName
    );

    // Crea un ID unico per il giocatore
    const playerId = fpediaPlayer.Nome 
      ? fpediaPlayer.Nome.replace(/\s+/g, '_').toLowerCase()
      : `player_${Math.random().toString(36).substr(2, 9)}`;

    return {
      ...fpediaPlayer,
      fstatsData: fstatsPlayer || null,
      id: playerId,
      // Campi normalizzati per consistenza
      convenienza: fpediaPlayer['Convenienza Potenziale'] || 0,
      fantamedia: fpediaPlayer['Fantamedia anno 2024-2025'] || 0,
      presenze: fpediaPlayer['Presenze campionato corrente'] || 0,
      punteggio: fpediaPlayer.Punteggio || 0
    };
  });
};

/**
 * Filtra giocatori per ruolo
 * @param {Array} players - Array di giocatori
 * @param {string} role - Ruolo da filtrare
 * @returns {Array} Giocatori filtrati per ruolo
 */
export const filterPlayersByRole = (players, role) => {
  return players.filter(player => player.Ruolo === role);
};

/**
 * Ordina giocatori per convenienza potenziale (decrescente)
 * @param {Array} players - Array di giocatori
 * @returns {Array} Giocatori ordinati
 */
export const sortPlayersByConvenienza = (players) => {
  return [...players].sort((a, b) => (b.convenienza || 0) - (a.convenienza || 0));
};

/**
 * Cerca giocatori per nome
 * @param {Array} players - Array di giocatori
 * @param {string} searchTerm - Termine di ricerca
 * @returns {Array} Giocatori che corrispondono alla ricerca
 */
export const searchPlayers = (players, searchTerm) => {
  if (!searchTerm) return [];
  
  const normalizedSearch = normalizeName(searchTerm);
  
  return players.filter(player => {
    const normalizedPlayerName = normalizeName(player.Nome);
    return normalizedPlayerName.includes(normalizedSearch);
  });
};

/**
 * Ottiene statistiche riassuntive per un ruolo
 * @param {Array} players - Array di giocatori
 * @param {string} role - Ruolo da analizzare
 * @returns {Object} Statistiche del ruolo
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
 * Verifica se un giocatore ha statistiche FStats
 * @param {Object} player - Giocatore da verificare
 * @returns {boolean} True se ha dati FStats
 */
export const hasFStatsData = (player) => {
  return player.fstatsData !== null && player.fstatsData !== undefined;
};

/**
 * Ottiene la percentuale di matching tra FPEDIA e FSTATS
 * @param {Array} players - Array di giocatori normalizzati
 * @returns {number} Percentuale di matching (0-100)
 */
export const getMatchingPercentage = (players) => {
  if (!players.length) return 0;
  
  const playersWithFStats = players.filter(hasFStatsData);
  return Math.round((playersWithFStats.length / players.length) * 100);
};

/**
 * Valida i dati di un giocatore
 * @param {Object} player - Giocatore da validare
 * @returns {Object} Oggetto con risultato validazione e errori
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
