// Utility per gestire il salvataggio persistente dei dati giocatori

const STORAGE_KEY = 'fantacalcio_player_status';

/**
 * Carica lo stato dei giocatori dal localStorage
 * @returns {Object} Oggetto con gli stati dei giocatori
 */
export const loadPlayerStatus = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
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
 * @returns {string} JSON string dei dati
 */
export const exportPlayerStatus = (playerStatus) => {
  const exportData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: playerStatus
  };
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
    if (importData.data && typeof importData.data === 'object') {
      return importData.data;
    }
    throw new Error('Formato dati non valido');
  } catch (error) {
    console.error('Errore nell\'importazione dei dati:', error);
    return null;
  }
};
