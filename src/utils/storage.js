// src/utils/storage.js - Versione completa con tutte le funzioni

const STORAGE_KEY = 'fantacalcio_player_status';
const BUDGET_STORAGE_KEY = 'fantacalcio_budget'; // AGGIUNTO

/**
 * Struttura dei dati salvati:
 * {
 *   playerId: {
 *     status: 'acquired' | 'available' | 'unavailable',
 *     fantamilioni: number (solo se status === 'acquired'),
 *     timestamp: string (data di acquisto/modifica)
 *   }
 * }
 */

/**
 * Carica lo stato dei giocatori dal localStorage
 * @returns {Object} Oggetto con gli stati dei giocatori
 */
export const loadPlayerStatus = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    
    const parsed = JSON.parse(saved);
    
    // Migrazione dai vecchi dati (solo stringa status) ai nuovi (oggetto)
    const migrated = {};
    for (const [playerId, data] of Object.entries(parsed)) {
      if (typeof data === 'string') {
        // Vecchio formato: solo status come stringa
        migrated[playerId] = {
          status: data,
          timestamp: new Date().toISOString()
        };
      } else {
        // Nuovo formato: oggetto completo
        migrated[playerId] = data;
      }
    }
    
    console.log('Stati giocatori caricati:', Object.keys(migrated).length, 'giocatori tracciati');
    return migrated;
  } catch (error) {
    console.warn('Errore nel caricamento dei dati dal localStorage:', error);
    return {};
  }
};

/**
 * Salva lo stato dei giocatori nel localStorage
 * @param {Object} playerStatus - Oggetto con gli stati dei giocatori
 */
export const savePlayerStatus = (playerStatus) => {
  try {
    // Gestione sicura dell'oggetto undefined
    const statusToSave = playerStatus || {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statusToSave));
    console.log('Stati giocatori salvati:', Object.keys(statusToSave).length, 'giocatori tracciati');
  } catch (error) {
    console.error('Errore nel salvataggio dei dati:', error);
  }
};

/**
 * Aggiorna lo stato di un singolo giocatore
 * @param {Object} currentStatus - Stato attuale di tutti i giocatori
 * @param {string} playerId - ID del giocatore
 * @param {string} status - Nuovo status ('acquired', 'available', 'unavailable')
 * @param {number} fantamilioni - Fantamilioni (opzionale, solo per 'acquired')
 * @returns {Object} Nuovo stato aggiornato
 */
export const updatePlayerStatus = (currentStatus, playerId, status, fantamilioni = null) => {
  // Gestione sicura dell'oggetto undefined
  const safeCurrentStatus = currentStatus || {};
  const newStatus = { ...safeCurrentStatus };
  
  if (status === 'none' || status === 'available') {
    // Rimuove il giocatore o lo imposta come disponibile
    delete newStatus[playerId];
  } else {
    // Aggiorna/crea l'entry del giocatore
    newStatus[playerId] = {
      status: status,
      timestamp: new Date().toISOString()
    };
    
    // Aggiunge fantamilioni solo se il giocatore è stato acquistato
    if (status === 'acquired' && fantamilioni !== null && fantamilioni > 0) {
      newStatus[playerId].fantamilioni = fantamilioni;
    }
  }
  
  return newStatus;
};

/**
 * Ottiene i dettagli di un giocatore
 * @param {Object} playerStatus - Stato di tutti i giocatori
 * @param {string} playerId - ID del giocatore
 * @returns {Object|null} Dettagli del giocatore o null se non trovato
 */
export const getPlayerDetails = (playerStatus, playerId) => {
  // Gestione sicura dell'oggetto undefined
  const safePlayerStatus = playerStatus || {};
  return safePlayerStatus[playerId] || null;
};

/**
 * Ottiene tutti i giocatori acquistati con i relativi fantamilioni
 * @param {Object} playerStatus - Stato di tutti i giocatori
 * @returns {Array} Array di oggetti con playerId, status e fantamilioni
 */
export const getAcquiredPlayers = (playerStatus) => {
  // Gestione sicura dell'oggetto undefined
  const safePlayerStatus = playerStatus || {};
  
  return Object.entries(safePlayerStatus)
    .filter(([_, data]) => data && data.status === 'acquired')
    .map(([playerId, data]) => ({
      playerId,
      ...data
    }));
};

/**
 * Calcola il totale dei fantamilioni spesi
 * @param {Object} playerStatus - Stato di tutti i giocatori
 * @returns {number} Totale fantamilioni spesi
 */
export const getTotalFantamilioni = (playerStatus) => {
  const acquired = getAcquiredPlayers(playerStatus);
  return acquired.reduce((total, player) => {
    const fantamilioni = Number(player.fantamilioni);
    return total + (isNaN(fantamilioni) ? 0 : fantamilioni);
  }, 0);
};

// ============== NUOVE FUNZIONI BUDGET ==============

/**
 * Carica il budget dal localStorage
 * @returns {number} Budget salvato o 500 di default
 */
export const loadBudget = () => {
  try {
    const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!saved) return 500;
    
    const parsed = parseInt(saved);
    return isNaN(parsed) ? 500 : parsed;
  } catch (error) {
    console.warn('Errore nel caricamento del budget:', error);
    return 500;
  }
};

/**
 * Salva il budget nel localStorage
 * @param {number} budget - Budget da salvare
 */
export const saveBudget = (budget) => {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, budget.toString());
    console.log('Budget salvato:', budget);
  } catch (error) {
    console.error('Errore nel salvataggio del budget:', error);
  }
};

/**
 * Calcola il budget rimanente
 * @param {number} totalBudget - Budget totale
 * @param {Object} playerStatus - Stato dei giocatori
 * @returns {number} Budget rimanente
 */
export const calculateRemainingBudget = (totalBudget, playerStatus) => {
  const totalSpent = getTotalFantamilioni(playerStatus);
  return totalBudget - totalSpent;
};

/**
 * Verifica se un acquisto è possibile
 * @param {number} fantamilioniToSpend - Fantamilioni da spendere
 * @param {number} totalBudget - Budget totale
 * @param {Object} playerStatus - Stato dei giocatori
 * @returns {boolean} True se l'acquisto è possibile
 */
export const canAffordPlayer = (fantamilioniToSpend, totalBudget, playerStatus) => {
  const remainingBudget = calculateRemainingBudget(totalBudget, playerStatus);
  return fantamilioniToSpend <= remainingBudget;
};

/**
 * Ottiene statistiche complete del budget
 * @param {number} totalBudget - Budget totale
 * @param {Object} playerStatus - Stato dei giocatori
 * @returns {Object} Statistiche complete
 */
export const getBudgetStats = (totalBudget, playerStatus) => {
  const totalSpent = getTotalFantamilioni(playerStatus);
  const remainingBudget = totalBudget - totalSpent;
  const acquiredPlayers = getAcquiredPlayers(playerStatus);
  
  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    playersCount: acquiredPlayers.length,
    averageSpentPerPlayer: acquiredPlayers.length > 0 ? Math.round(totalSpent / acquiredPlayers.length) : 0,
    budgetUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
  };
};

// ============== FUNZIONI ESISTENTI ==============

/**
 * Cancella tutti i dati salvati
 */
export const clearPlayerStatus = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BUDGET_STORAGE_KEY); // AGGIUNTO
    console.log('Tutti i dati sono stati cancellati');
  } catch (error) {
    console.error('Errore nella cancellazione dei dati:', error);
  }
};

/**
 * Esporta i dati in formato JSON per backup
 * @param {Object} playerStatus - Oggetto con gli stati dei giocatori
 * @param {Array} playersData - Dati completi dei giocatori (opzionale per nomi leggibili)
 * @param {number} budget - Budget attuale (opzionale)
 * @returns {string} JSON string dei dati
 */
export const exportPlayerStatus = (playerStatus, playersData = [], budget = null) => {
  // Gestione sicura dell'oggetto undefined
  const safePlayerStatus = playerStatus || {};
  
  const exportData = {
    version: '2.1',
    timestamp: new Date().toISOString(),
    data: safePlayerStatus,
    budget: budget || loadBudget(), // AGGIUNTO
    summary: {
      totalPlayers: Object.keys(safePlayerStatus).length,
      acquiredPlayers: getAcquiredPlayers(safePlayerStatus).length,
      totalFantamilioni: getTotalFantamilioni(safePlayerStatus),
      budget: budget || loadBudget(),
      remainingBudget: (budget || loadBudget()) - getTotalFantamilioni(safePlayerStatus)
    }
  };
  
  // Aggiunge nomi leggibili se disponibili
  if (playersData.length > 0) {
    exportData.readableData = Object.entries(safePlayerStatus).map(([playerId, data]) => {
      const player = playersData.find(p => p.id === playerId);
      return {
        playerId,
        playerName: player ? player.Nome : 'Sconosciuto',
        ruolo: player ? player.Ruolo : 'N/A',
        squadra: player ? player.Squadra : 'N/A',
        ...data
      };
    });
  }
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Importa i dati da un backup JSON
 * @param {string} jsonString - JSON string dei dati da importare
 * @returns {Object|null} Dati importati o null se errore
 */
export const importPlayerStatus = (jsonString) => {
  try {
    const importData = JSON.parse(jsonString);
    
    if (!importData.data || typeof importData.data !== 'object') {
      throw new Error('Formato dati non valido: manca il campo "data"');
    }
    
    // Validazione della struttura dei dati
    for (const [playerId, playerData] of Object.entries(importData.data)) {
      if (typeof playerData !== 'object' || !playerData.status) {
        throw new Error(`Dati non validi per il giocatore ${playerId}`);
      }
    }
    
    // Importa anche il budget se presente
    const result = {
      playerStatus: importData.data
    };
    
    if (importData.budget && typeof importData.budget === 'number') {
      result.budget = importData.budget;
      saveBudget(importData.budget); // Salva automaticamente
    }
    
    console.log(`Importazione completata: ${Object.keys(importData.data).length} giocatori`);
    if (result.budget) {
      console.log(`Budget importato: ${result.budget} fantamilioni`);
    }
    
    return result;
  } catch (error) {
    console.error('Errore nell\'importazione dei dati:', error);
    return null;
  }
};
