// src/utils/storage.js - Versione aggiornata con fantamilioni

const STORAGE_KEY = 'fantacalcio_player_status';

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playerStatus));
    console.log('Stati giocatori salvati:', Object.keys(playerStatus).length, 'giocatori tracciati');
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
  const newStatus = { ...currentStatus };
  
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
  return playerStatus[playerId] || null;
};

/**
 * Ottiene tutti i giocatori acquistati con i relativi fantamilioni
 * @param {Object} playerStatus - Stato di tutti i giocatori
 * @returns {Array} Array di oggetti con playerId, status e fantamilioni
 */
export const getAcquiredPlayers = (playerStatus) => {
  return Object.entries(playerStatus)
    .filter(([_, data]) => data.status === 'acquired')
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
  return acquired.reduce((total, player) => total + (player.fantamilioni || 0), 0);
};

/**
 * Ottiene statistiche sui giocatori per ruolo
 * @param {Object} playerStatus - Stato di tutti i giocatori
 * @param {Array} playersData - Dati completi dei giocatori
 * @returns {Object} Statistiche per ruolo
 */
export const getPlayerStatsByRole = (playerStatus, playersData) => {
  const acquired = getAcquiredPlayers(playerStatus);
  const stats = {
    POR: { count: 0, total: 0 },
    DIF: { count: 0, total: 0 },
    CEN: { count: 0, total: 0 },
    ATT: { count: 0, total: 0 }
  };
  
  acquired.forEach(acquiredPlayer => {
    const playerData = playersData.find(p => p.id === acquiredPlayer.playerId);
    if (playerData && stats[playerData.Ruolo]) {
      stats[playerData.Ruolo].count++;
      stats[playerData.Ruolo].total += acquiredPlayer.fantamilioni || 0;
    }
  });
  
  return stats;
};

/**
 * Cancella tutti i dati salvati
 */
export const clearPlayerStatus = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Tutti i dati sono stati cancellati');
  } catch (error) {
    console.error('Errore nella cancellazione dei dati:', error);
  }
};

/**
 * Esporta i dati in formato JSON per backup
 * @param {Object} playerStatus - Oggetto con gli stati dei giocatori
 * @param {Array} playersData - Dati completi dei giocatori (opzionale per nomi leggibili)
 * @returns {string} JSON string dei dati
 */
export const exportPlayerStatus = (playerStatus, playersData = []) => {
  const exportData = {
    version: '2.0', // Aggiornato per nuova struttura con fantamilioni
    timestamp: new Date().toISOString(),
    data: playerStatus,
    summary: {
      totalPlayers: Object.keys(playerStatus).length,
      acquiredPlayers: getAcquiredPlayers(playerStatus).length,
      totalFantamilioni: getTotalFantamilioni(playerStatus)
    }
  };
  
  // Aggiunge nomi leggibili se disponibili
  if (playersData.length > 0) {
    exportData.readableData = Object.entries(playerStatus).map(([playerId, data]) => {
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
    
    console.log(`Importazione completata: ${Object.keys(importData.data).length} giocatori`);
    return importData.data;
  } catch (error) {
    console.error('Errore nell\'importazione dei dati:', error);
    return null;
  }
};
