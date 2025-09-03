// src/App.js - Versione corretta con inizializzazione fissata
import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import BudgetDisplay from './components/BudgetDisplay';
import FantamilioniModal from './components/FantamilioniModal';
import Header from './components/Header';
import PlayersTab from './components/PlayersTab';
import RosaAcquistata from './components/RosaAcquistata';
import { normalizePlayerData } from './utils/dataUtils';
import { canAffordPlayer, getTotalFantamilioni, loadBudget, loadPlayerStatus, saveBudget, savePlayerStatus, updatePlayerStatus } from './utils/storage';

const App = () => {
  // Stati principali
  const [fpediaData, setFpediaData] = useState([]);
  const [playerStatus, setPlayerStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('giocatori');

  // NUOVO: Stato del budget
  const [budget, setBudget] = useState(500);

  // AGGIUNTO: Flag per evitare salvataggi durante l'inizializzazione
  const [isInitialized, setIsInitialized] = useState(false);

  // Stati per la modal fantamilioni
  const [showFantamilioniModal, setShowFantamilioniModal] = useState(false);
  const [playerToAcquire, setPlayerToAcquire] = useState(null);

  // Carica status giocatori all'avvio - MODIFICATO
  useEffect(() => {
    const status = loadPlayerStatus();
    const savedBudget = loadBudget();
    
    console.log('Caricamento iniziale - Stato trovato:', Object.keys(status).length, 'giocatori');
    console.log('Caricamento iniziale - Budget trovato:', savedBudget);
    
    setPlayerStatus(status);
    setBudget(savedBudget);
    
    // Segna come inizializzato DOPO aver caricato i dati
    setIsInitialized(true);
    
    loadDataFromPublic();
  }, []);

  // Salva automaticamente lo status dei giocatori - MODIFICATO
  useEffect(() => {
    // Non salvare durante l'inizializzazione
    if (!isInitialized) {
      console.log('Salvataggio saltato - app non ancora inizializzata');
      return;
    }
    
    console.log('Salvando stato giocatori:', Object.keys(playerStatus).length, 'giocatori');
    savePlayerStatus(playerStatus);
  }, [playerStatus, isInitialized]);

  // Salva automaticamente il budget - MODIFICATO  
  useEffect(() => {
    // Non salvare durante l'inizializzazione
    if (!isInitialized) {
      console.log('Salvataggio budget saltato - app non ancora inizializzata');
      return;
    }
    
    console.log('Salvando budget:', budget);
    saveBudget(budget);
  }, [budget, isInitialized]);

  // Caricamento automatico del file dalla cartella public
  const loadDataFromPublic = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carica solo FPEDIA
      const fpediaResponse = await fetch('/fpedia_analysis.xlsx');
      if (fpediaResponse.ok) {
        const fpediaBuffer = await fpediaResponse.arrayBuffer();
        const fpediaWorkbook = XLSX.read(fpediaBuffer);
        const fpediaSheet = fpediaWorkbook.Sheets[fpediaWorkbook.SheetNames[0]];
        const fpediaJson = XLSX.utils.sheet_to_json(fpediaSheet);
        setFpediaData(fpediaJson);
      } else {
        setError('File fpedia_analysis.xlsx non trovato nella cartella public. Usa il caricamento manuale.');
      }
    } catch (err) {
      setError('Errore nel caricamento del file. Usa il caricamento manuale.');
      console.error('Errore caricamento automatico:', err);
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

  // Resto del componente rimane uguale...
  // (tutti gli stili e il JSX di render)
  
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

  // Stili (mantieni quelli esistenti)
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
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
    <div style={containerStyle}>
      {/* Header */}
      <Header 
        dataCount={normalizedData.length}
        playerStatus={playerStatus}
      />

      {/* Budget Display */}
      {normalizedData.length > 0 && (
        <BudgetDisplay 
          budget={budget} 
          onBudgetChange={setBudget}
          playerStatus={playerStatus}
        />
      )}

      {/* Navigation Tabs */}
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
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.color = '#64748b';
                }
              }}
              title={tab.description}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div style={tabContentStyle}>
        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: '#6b7280', fontWeight: '500' }}>
                Caricamento dati in corso...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            margin: '2rem',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <p style={{ color: '#dc2626', fontWeight: '500', marginBottom: '1rem' }}>
              {error}
            </p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && normalizedData.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '1rem' 
            }}>
              Carica i dati per iniziare
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '2rem', 
              lineHeight: '1.6' 
            }}>
              Carica il file Excel con i dati dei giocatori per iniziare<br />
              ad esplorare statistiche, classifiche e gestire la tua rosa.
            </p>
          </div>
        )}

        {/* Tab Content - Solo se ci sono dati */}
        {normalizedData.length > 0 && (
          <>
            {/* Tab Giocatori */}
            {activeTab === 'giocatori' && (
              <PlayersTab
                players={normalizedData}
                searchIndex={searchIndex}
                playerStatus={playerStatus}
                onPlayerStatusChange={handlePlayerStatusChange}
                onPlayerAcquire={handlePlayerAcquire}
                budget={budget}
                remainingBudget={budget - getTotalFantamilioni(playerStatus)}
              />
            )}

            {/* Tab Rosa Acquistata */}
            {activeTab === 'rosa' && (
              <RosaAcquistata
                players={normalizedData}
                playerStatus={playerStatus}
                onPlayerStatusChange={handlePlayerStatusChange}
                budget={budget}
                remainingBudget={budget - getTotalFantamilioni(playerStatus)}
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

      {/* CSS per l'animazione di loading */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default App;
