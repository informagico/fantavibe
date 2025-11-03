import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import FantamilioniModal from './components/FantamilioniModal';
import Header from './components/Header';
import PlayersTab from './components/PlayersTab';
import RosaAcquistata from './components/RosaAcquistata';
import { normalizePlayerData } from './utils/dataUtils';
import { checkAndUpdateDataset } from './utils/githubReleaseManager';
import { canAffordPlayer, getTotalFantamilioni, loadBudget, loadPlayerStatus, saveBudget, savePlayerStatus, updatePlayerStatus } from './utils/storage';

const App = () => {
  // Stati principali
  const [fpediaData, setFpediaData] = useState([]);
  const [playerStatus, setPlayerStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('giocatori');
  const [dataUpdateInfo, setDataUpdateInfo] = useState(null);

  // Stato del budget
  const [budget, setBudget] = useState(500);

  // Flag per evitare salvataggi durante l'inizializzazione
  const [isInitialized, setIsInitialized] = useState(false);

  // Stati per la modal fantamilioni
  const [showFantamilioniModal, setShowFantamilioniModal] = useState(false);
  const [playerToAcquire, setPlayerToAcquire] = useState(null);

  // Stato per preservare la selezione del ruolo tra i cambi di tab
  const [selectedRole, setSelectedRole] = useState('ALL');

  // Carica status giocatori all'avvio
  useEffect(() => {
    const status = loadPlayerStatus();
    const savedBudget = loadBudget();
    
    console.log('Caricamento iniziale - Stato trovato:', Object.keys(status).length, 'giocatori');
    console.log('Caricamento iniziale - Budget trovato:', savedBudget);
    
    setPlayerStatus(status);
    setBudget(savedBudget);
    
    // Segna come inizializzato DOPO aver caricato i dati
    setIsInitialized(true);
    
    loadData();
  }, []);

  // Salva automaticamente lo status dei giocatori
  useEffect(() => {
    // Non salvare durante l'inizializzazione
    if (!isInitialized) {
      console.log('Salvataggio saltato - app non ancora inizializzata');
      return;
    }
    
    console.log('Salvando stato giocatori:', Object.keys(playerStatus).length, 'giocatori');
    savePlayerStatus(playerStatus);
  }, [playerStatus, isInitialized]);

  // Salva automaticamente il budget
  useEffect(() => {
    // Non salvare durante l'inizializzazione
    if (!isInitialized) {
      console.log('Salvataggio budget saltato - app non ancora inizializzata');
      return;
    }
    
    console.log('Salvando budget:', budget);
    saveBudget(budget);
  }, [budget, isInitialized]);

  // Caricamento automatico del file
  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🚀 Avvio caricamento dati con sistema cache avanzato...');

      const result = await checkAndUpdateDataset();
      const { datasetBuffer, wasUpdated, source, fileInfo } = result;
      setDataUpdateInfo({ source, fileInfo, wasUpdated, loadedAt: new Date().toISOString() });

      // Processa il file Excel
      const workbook = XLSX.read(datasetBuffer, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      
      // Log del risultato
      const sourceMessages = {
        'github': '✅ Dati scaricati da GitHub',
        'cache': '📦 Dati caricati dalla cache locale',
        'cache_fallback': '🔄 Dati caricati dalla cache (fallback)',
        'public_fallback': '📁 Dati caricati dal file locale di fallback'
      };
      
      const message = sourceMessages[source] || '✅ Dati caricati';
      console.log(`${message}, giocatori trovati: ${data?.length || 0}`);
      
      if (wasUpdated) {
        console.log('🆕 Dataset aggiornato con nuova versione');
      }
      
      // Mostra notifica all'utente se ha usato fallback
      if (source === 'cache_fallback') {
        console.warn('⚠️ Usando dati dalla cache locale (GitHub non raggiungibile)');
        // Potresti aggiungere una notifica nell'UI qui
      } else if (source === 'public_fallback') {
        console.warn('🚨 Usando file di fallback locale (cache e GitHub non disponibili)');
        setError('Attenzione: usando dati di fallback. Alcuni dati potrebbero non essere aggiornati.');
      }
      
      setFpediaData(data);
      
    } catch (err) {
      const errorMessage = 'Errore nel caricamento del file. Tutti i metodi di caricamento hanno fallito.';
      setError(errorMessage);
      console.error('❌ Errore caricamento completo:', err);
    } finally {
      setLoading(false);
    }
  };

  // Normalizza i dati e crea indice di ricerca
  const normalizedDataWithIndex = useMemo(() => {
    if (!fpediaData.length) return { players: [], searchIndex: null };
    return normalizePlayerData(fpediaData);
  }, [fpediaData]);

  const normalizedData = normalizedDataWithIndex.players;
  const searchIndex = normalizedDataWithIndex.searchIndex;

  // Gestione status giocatori
  const handlePlayerStatusChange = (playerId, status, fantamilioni = null) => {
    console.log('Cambiamento stato giocatore:', playerId, status, fantamilioni);
    const newStatus = updatePlayerStatus(playerStatus, playerId, status, fantamilioni);
    setPlayerStatus(newStatus);
  };

  // Gestione acquisto giocatore con fantamilioni
  const handlePlayerAcquire = (player) => {
    setPlayerToAcquire(player);
    setShowFantamilioniModal(true);
  };

  const handleFantamilioniConfirm = (fantamilioni) => {
    if (playerToAcquire) {
      // Controllo budget
      if (!canAffordPlayer(fantamilioni, budget, playerStatus)) {
        alert(`Non hai abbastanza fantamilioni! Budget rimanente: ${budget - getTotalFantamilioni(playerStatus)} FM`);
        return;
      }
      
      handlePlayerStatusChange(playerToAcquire.id, 'acquired', fantamilioni);
      setShowFantamilioniModal(false);
      setPlayerToAcquire(null);
    }
  };

  const handleFantamilioniCancel = () => {
    setShowFantamilioniModal(false);
    setPlayerToAcquire(null);
  };

  // Tab configuration
  const tabs = [
    { 
      id: 'giocatori', 
      label: 'Giocatori', 
      emoji: '👤',
      description: 'Cerca e visualizza tutti i giocatori con statistiche e classifiche'
    },
    { 
      id: 'rosa', 
      label: 'La Mia Rosa', 
      emoji: '⭐',
      description: 'Visualizza i giocatori che hai acquistato e gestisci il budget'
    }
  ];

  // Stili
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  };

  const stickyHeaderWrapperStyle = {
    position: 'sticky',
    top: '0',
    zIndex: 1000,
    backgroundColor: 'white'
  };

  const tabsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '0 1rem',
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0'
  };

  const tabButtonStyle = {
    padding: '1rem 2rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s ease',
    position: 'relative'
  };

  const activeTabStyle = {
    ...tabButtonStyle,
    color: '#1e293b',
    borderBottomColor: '#3b82f6',
    fontWeight: '600'
  };

  const tabContentStyle = {
    flex: 1
  };

  return (
    <div style={containerStyle} dataUpdateInfo={dataUpdateInfo}>
      {/* Sticky wrapper containing both header and tabs */}
      <div style={stickyHeaderWrapperStyle}>
        {/* Header con Budget integrato */}
        <Header 
          dataCount={normalizedData.length}
          playerStatus={playerStatus}
          budget={budget}
          onBudgetChange={setBudget}
          dataUpdateInfo={dataUpdateInfo}
        />

        {/* Navigation Tabs - solo se ci sono dati */}
        {normalizedData.length > 0 && (
          <div style={tabsContainerStyle}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={activeTab === tab.id ? activeTabStyle : tabButtonStyle}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = '#374151';
                    e.target.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = '#64748b';
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.125rem' }}>{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div style={tabContentStyle}>
        {loading && (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            fontSize: '1.125rem',
            color: '#64748b'
          }}>
            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>⏳</div>
            Caricamento dati in corso...
          </div>
        )}

        {error && (
          <div style={{
            padding: '1rem',
            margin: '1rem auto',
            maxWidth: '600px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#dc2626',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Errore di caricamento
            </div>
            <div>{error}</div>
          </div>
        )}

        {!loading && !error && normalizedData.length === 0 && (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            fontSize: '1.125rem',
            color: '#64748b'
          }}>
            <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>📊</div>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
              Benvenuto in Fantavibe!
            </div>
            <div>I dati dei giocatori verranno caricati automaticamente.</div>
          </div>
        )}

        {normalizedData.length > 0 && (
          <>
            {activeTab === 'giocatori' && (
              <PlayersTab
                players={normalizedData}
                playerStatus={playerStatus}
                onPlayerStatusChange={handlePlayerStatusChange}
                onPlayerAcquire={handlePlayerAcquire}
                searchIndex={searchIndex}
                selectedRole={selectedRole}
                onRoleChange={setSelectedRole}
              />
            )}
            
            {activeTab === 'rosa' && (
              <RosaAcquistata
                players={normalizedData}
                playerStatus={playerStatus}
                onPlayerStatusChange={handlePlayerStatusChange}
                budget={budget}
              />
            )}
          </>
        )}
      </div>

      {/* Modal Fantamilioni */}
      {showFantamilioniModal && (
        <FantamilioniModal
          player={playerToAcquire}
          onConfirm={handleFantamilioniConfirm}
          onCancel={handleFantamilioniCancel}
          maxFantamilioni={budget - getTotalFantamilioni(playerStatus)}
        />
      )}
    </div>
  );
};

export default App;
