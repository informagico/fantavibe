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
    const normalizedSquadra = normalizeName(player.Squadra);

    const words = normalizedName.split(' ')
      .concat(normalizedSquadra.split(' '));

    if (player.Infortunato === true) {
      words.push('infortunato');
    }

    if (player['Consigliato prossima giornata'] === true) {
      words.push('consigliato');
    }

    if (player['Nuovo acquisto'] === true) {
      words.push('nuovo');
    }

    // Indicizza squadra normalizzata
    if (normalizedSquadra && normalizedSquadra.length > 2) {
      if (!index.has(normalizedSquadra)) {
      index.set(normalizedSquadra, []);
      }
      index.get(normalizedSquadra).push(idx);
    }

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
  const roles = ['POR', 'DIF', 'CEN', 'TRQ', 'ATT'];
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
  if (role === 'ALL') {
    return players; // Mostra tutti i giocatori
  }
  if (role === 'CEN_TRQ') {
    return players.filter(player => player.Ruolo === 'CEN' || player.Ruolo === 'TRQ');
  }
  return players.filter(player => player.Ruolo === role);
};

/**
 * Calcola i gol previsti con logica specifica per i portieri
 * I portieri hanno i gol come valori negativi (gol subiti)
 */
export const getExpectedGoals = (player) => {
  const golPrevisti = player['Gol previsti'];
  
  // Se non c'è il dato, restituisce null per mostrare 'N/A'
  if (golPrevisti === undefined || golPrevisti === null || golPrevisti === '' || isNaN(parseFloat(golPrevisti))) {
    return null;
  }
  
  const numericValue = parseFloat(golPrevisti);
  
  // Per i portieri, convertiamo i gol in valori negativi
  if (player.Ruolo === 'POR') {
    return -Math.abs(numericValue);
  }
  return numericValue;
};

/**
 * Ottiene la label appropriata per i gol previsti in base al ruolo
 */
export const getGoalsLabel = (role) => {
  return role === 'POR' ? 'Gol Subiti Previsti' : 'Gol Previsti';
};

/**
 * Mappatura delle skills con emoji e descrizioni
 */
export const SKILLS_MAPPING = {
  'Buona Media': { emoji: '👍', description: 'Buona Media: Giocatore con buona fantamedia' },
  'Piazzati': { emoji: '🦅', description: 'Piazzati: Specialista nei calci piazzati' },
  'Giovane talento': { emoji: '🌱', description: 'Giovane talento: Talento emergente con margini di crescita' },
  'Panchinaro': { emoji: '🪑', description: 'Panchinaro: Spesso in panchina, minuti limitati' },
  'Titolare': { emoji: '💎', description: 'Titolare: Giocatore titolare fisso nella sua squadra' },
  'Rigorista': { emoji: '🎯', description: 'Rigorista: Specialista nei calci di rigore' },
  'Outsider': { emoji: '🌟', description: 'Outsider: Giocatore fuori dai radar con grande potenziale' },
  'Assistman': { emoji: '🎨', description: 'Assistman: Creatore di gioco, fornisce assist decisivi' },
  'Falloso': { emoji: '🚫', description: 'Falloso: Giocatore soggetto a molti falli/cartellini' },
  'Fuoriclasse': { emoji: '👑', description: 'Fuoriclasse: Giocatore di livello superiore, sempre affidabile' },
  'Goleador': { emoji: '⚡', description: 'Goleador: Finalizzatore nato, specialista in zona gol' }
};

/**
 * Estrae e processa le skills di un giocatore
 */
export const getPlayerSkills = (player) => {
  // Prova diversi nomi di colonna possibili
  const skillsData = player.Skills || player.skills || player.Skill || player.skill || 
                     player.Attributi || player.attributi || player.Tags || player.tags;
  
  if (!skillsData) return [];
  
  // Se è una stringa, prova a parsare come JSON o dividere per separatori
  if (typeof skillsData === 'string') {
    // Prima pulisce la stringa da parentesi quadre e apici
    let cleanedString = skillsData.trim();
    
    // Rimuove parentesi quadre esterne se presenti
    if (cleanedString.startsWith('[') && cleanedString.endsWith(']')) {
      cleanedString = cleanedString.slice(1, -1);
    }
    
    try {
      // Prova parsing JSON (aggiungendo le parentesi quadre se necessario)
      const jsonString = cleanedString.startsWith('[') ? cleanedString : `[${cleanedString}]`;
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [skillsData];
    } catch {
      // Se non è JSON, dividi per virgole e pulisci apici/spazi
      return cleanedString
        .split(/[,|;]/)
        .map(s => s.trim().replace(/^['"]|['"]$/g, '')) // Rimuove apici all'inizio e fine
        .filter(s => s);
    }
  }
  
  // Se è già un array, restituiscilo
  if (Array.isArray(skillsData)) {
    return skillsData;
  }
  
  return [];
};

/**
 * Opzioni di ordinamento disponibili
 */
export const SORT_OPTIONS = [
  { key: 'convenienza', label: 'Convenienza Potenziale', field: 'convenienza' },
  { key: 'fantamedia', label: 'Fantamedia 2024-2025', field: 'fantamedia' },
  { key: 'presenze', label: 'Presenze', field: 'presenze' },
  { key: 'punteggio', label: 'Punteggio', field: 'punteggio' },
  { key: 'gol_previsti', label: 'Gol Previsti', field: 'Gol previsti', useExpectedGoals: true },
  { key: 'assist_previsti', label: 'Assist Previsti', field: 'Assist previsti' },
  { key: 'presenze_previste', label: 'Presenze Previste', field: 'Presenze previste' },
  { key: 'resistenza', label: 'Resistenza Infortuni', field: 'Resistenza infortuni' },
  { key: 'fm_tot_gare', label: 'Fantamedia 24-25/38 partite', field: 'FM su tot gare 2024-2025' }
];

/**
 * Campi numerici filtrabili con range
 */
export const NUMERIC_FILTER_FIELDS = [
  { key: 'convenienza', label: 'Convenienza Potenziale', field: 'convenienza', min: 0, max: 200 },
  { key: 'fantamedia', label: 'Fantamedia 2024-2025', field: 'fantamedia', min: 0, max: 10 },
  { key: 'presenze', label: 'Presenze', field: 'presenze', min: 0, max: 38 },
  { key: 'punteggio', label: 'Punteggio', field: 'punteggio', min: 0, max: 100 },
  { key: 'gol_previsti', label: 'Gol Previsti', field: 'Gol previsti', min: -30, max: 30, useExpectedGoals: true },
  { key: 'assist_previsti', label: 'Assist Previsti', field: 'Assist previsti', min: 0, max: 20 },
  { key: 'presenze_previste', label: 'Presenze Previste', field: 'Presenze previste', min: 0, max: 38 },
  { key: 'resistenza', label: 'Resistenza Infortuni', field: 'Resistenza infortuni', min: 0, max: 100 },
];

/**
 * Campi booleani filtrabili
 */
export const BOOLEAN_FILTER_FIELDS = [
  { key: 'nuovo_acquisto', label: 'Nuovo Acquisto', field: 'Nuovo acquisto' },
  { key: 'consigliato_prox', label: 'Consigliato Prossima Giornata', field: 'Consigliato prossima giornata' },
  { key: 'infortunato', label: 'Infortunato', field: 'Infortunato' }
];

/**
 * Campi categorici con valori numerici
 */
export const CATEGORICAL_FILTER_FIELDS = [
  { 
    key: 'buon_investimento', 
    label: 'Buon Investimento', 
    field: 'Buon investimento',
    categories: [
      { key: 'no', label: 'No', values: [20, 40] },
      { key: 'si', label: 'Sì', values: [60, 80, 100] }
    ]
  }
];

/**
 * Skills filtrabili disponibili
 */
export const SKILLS_FILTER_OPTIONS = [
  { key: 'buona_media', label: 'Buona Media', skillName: 'Buona Media' },
  { key: 'piazzati', label: 'Piazzati', skillName: 'Piazzati' },
  { key: 'giovane_talento', label: 'Giovane Talento', skillName: 'Giovane talento' },
  { key: 'panchinaro', label: 'Panchinaro', skillName: 'Panchinaro' },
  { key: 'titolare', label: 'Titolare', skillName: 'Titolare' },
  { key: 'rigorista', label: 'Rigorista', skillName: 'Rigorista' },
  { key: 'outsider', label: 'Outsider', skillName: 'Outsider' },
  { key: 'assistman', label: 'Assistman', skillName: 'Assistman' },
  { key: 'falloso', label: 'Falloso', skillName: 'Falloso' },
  { key: 'fuoriclasse', label: 'Fuoriclasse', skillName: 'Fuoriclasse' },
  { key: 'goleador', label: 'Goleador', skillName: 'Goleador' }
];

/**
 * Ordina giocatori in base al criterio specificato
 */
export const sortPlayersByField = (players, sortKey, sortDirection = 'desc') => {
  // Trova l'opzione di ordinamento corrispondente
  const sortOption = SORT_OPTIONS.find(option => option.key === sortKey);
  if (!sortOption) {
    console.warn(`Sort field ${sortKey} not found, using convenienza as fallback`);
    return sortPlayersByField(players, 'convenienza', sortDirection);
  }
  
  const sortField = sortOption.field;
  
  const sortedPlayers = [...players].sort((a, b) => {
    let valueA, valueB;
    
    // Gestione speciale per i gol previsti
    if (sortOption.useExpectedGoals) {
      valueA = getExpectedGoals(a);
      valueB = getExpectedGoals(b);
      // Se uno dei valori è null, mettilo alla fine
      if (valueA === null && valueB === null) return 0;
      if (valueA === null) return 1;
      if (valueB === null) return -1;
    } else if (sortKey === 'convenienza' || sortKey === 'fantamedia' || 
               sortKey === 'presenze' || sortKey === 'punteggio') {
      // Campi normalizzati 
      valueA = a[sortKey] || 0;
      valueB = b[sortKey] || 0;
    } else {
      // Campi originali dalla struttura dati
      valueA = a[sortField] || 0;
      valueB = b[sortField] || 0;
    }
    
    // Converti in numeri se necessario (solo se non stiamo già gestendo i gol previsti)
    if (!sortOption.useExpectedGoals) {
      if (typeof valueA === 'string') valueA = parseFloat(valueA) || 0;
      if (typeof valueB === 'string') valueB = parseFloat(valueB) || 0;
    }
    
    // Applica direzione di ordinamento
    const result = valueB - valueA; // Default decrescente
    return sortDirection === 'asc' ? -result : result;
  });
  
  return sortedPlayers;
};

/**
 * Applica filtri numerici (range) ai giocatori
 */
export const applyNumericFilters = (players, filters) => {
  return players.filter(player => {
    return NUMERIC_FILTER_FIELDS.every(field => {
      const filter = filters[field.key];
      if (!filter || filter.min === undefined || filter.max === undefined) return true;
      
      // IMPORTANTE: Ignora filtri che sono ancora ai valori di default
      if (filter.min === field.min && filter.max === field.max) {
        return true; // Filtro non modificato dall'utente, includi tutti
      }
      
      let value;
      // Gestione speciale per i gol previsti
      if (field.useExpectedGoals) {
        value = getExpectedGoals(player);
        // Se il valore è null (dati mancanti), includi il giocatore nel risultato
        if (value === null) return true;
      } else if (field.key === 'convenienza' || field.key === 'fantamedia' || 
                 field.key === 'presenze' || field.key === 'punteggio') {
        // Usa i campi normalizzati per convenienza, fantamedia, presenze, punteggio
        value = player[field.key] || 0;
      } else {
        // Per gli altri campi, usa il field name originale
        value = player[field.field] || 0;
      }
      
      // Converti in numeri se necessario (solo se non stiamo già gestendo i gol previsti)
      if (!field.useExpectedGoals && typeof value === 'string') {
        value = parseFloat(value) || 0;
      }
      
      // Debug log per ogni confronto (solo per filtri modificati)
      const isInRange = value >= filter.min && value <= filter.max;
      if (!isInRange && field.key === 'fantamedia') { // Logga solo fantamedia per non spammare
        console.log(`❌ Filtro ${field.label}:`, {
          player: player.Nome,
          rawValue: player[field.field],
          normalizedValue: player[field.key],
          processedValue: value,
          valueType: typeof value,
          filterMin: filter.min,
          filterMax: filter.max,
          isInRange
        });
      }
      
      return isInRange;
    });
  });
};

/**
 * Applica filtri booleani ai giocatori
 */
export const applyBooleanFilters = (players, filters) => {
  return players.filter(player => {
    return BOOLEAN_FILTER_FIELDS.every(field => {
      const filter = filters[field.key];
      if (filter === undefined || filter === null) return true;
      
      const playerValue = player[field.field];
      const normalizedValue = playerValue === 'true' || playerValue === true;
      
      return filter === normalizedValue;
    });
  });
};

/**
 * Applica filtri categorici ai giocatori
 */
export const applyCategoricalFilters = (players, filters) => {
  return players.filter(player => {
    return CATEGORICAL_FILTER_FIELDS.every(field => {
      const filter = filters[field.key];
      if (filter === undefined || filter === null) return true;
      
      const playerValue = parseFloat(player[field.field]) || 0;
      
      // Trova la categoria corrispondente al filtro selezionato
      const selectedCategory = field.categories.find(cat => cat.key === filter);
      if (!selectedCategory) return true;
      
      // Controlla se il valore del giocatore è incluso nei valori della categoria
      return selectedCategory.values.includes(playerValue);
    });
  });
};

/**
 * Applica filtri per skills ai giocatori
 */
export const applySkillsFilters = (players, skillsFilters) => {
  return players.filter(player => {
    // Se non ci sono filtri skills attivi, includi tutti i giocatori
    const activeSkillFilters = Object.entries(skillsFilters || {}).filter(([_, isActive]) => isActive);
    if (activeSkillFilters.length === 0) return true;
    
    // Ottieni le skills del giocatore
    const playerSkills = getPlayerSkills(player);
    
    // Il giocatore deve avere TUTTE le skills filtrate (AND logic)
    return activeSkillFilters.every(([skillKey, _]) => {
      const skillOption = SKILLS_FILTER_OPTIONS.find(option => option.key === skillKey);
      if (!skillOption) return false;
      
      return playerSkills.includes(skillOption.skillName);
    });
  });
};

/**
 * Applica tutti i filtri ai giocatori
 */
export const applyAllFilters = (players, numericFilters, booleanFilters, skillsFilters, categoricalFilters) => {
  let filteredPlayers = players;
  
  // Applica filtri numerici
  if (numericFilters && Object.keys(numericFilters).length > 0) {
    filteredPlayers = applyNumericFilters(filteredPlayers, numericFilters);
  }
  
  // Applica filtri booleani
  if (booleanFilters && Object.keys(booleanFilters).length > 0) {
    filteredPlayers = applyBooleanFilters(filteredPlayers, booleanFilters);
  }
  
  // Applica filtri categorici
  if (categoricalFilters && Object.keys(categoricalFilters).length > 0) {
    filteredPlayers = applyCategoricalFilters(filteredPlayers, categoricalFilters);
  }
  
  // Applica filtri skills
  if (skillsFilters && Object.keys(skillsFilters).length > 0) {
    filteredPlayers = applySkillsFilters(filteredPlayers, skillsFilters);
  }
  
  return filteredPlayers;
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
 * Ordina giocatori per convenienza potenziale (decrescente) - LEGACY FUNCTION
 * Usa sortPlayersByField per nuove implementazioni
 */
export const sortPlayersByConvenienza = (players) => {
  return sortPlayersByField(players, 'convenienza', 'desc');
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
  
  if (!player.Ruolo || !['ATT', 'DIF', 'CEN', 'TRQ', 'POR'].includes(player.Ruolo)) {
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
