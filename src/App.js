// src/App.js - Versione aggiornata con sistema di tab
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
  const [activeTab, setActiveTab] = useState('giocatori'); // Nuovo state per tab attiva

  // NUOVO: Stato del budget
  const [budget, setBudget] = useState(500);

  // Stati per la modal fantamilioni
  const [showFantamilioniModal, setShowFantamilioniModal] = useState(false);
  const [playerToAcquire, setPlayerToAcquire] = useState(null);

  // Carica status giocatori all'avvio
  useEffect(() => {
    const status = loadPlayerStatus();
    const savedBudget = loadBudget();
    setPlayerStatus(status);
    setBudget(savedBudget);
    loadDataFromPublic();
  }, []);

  // Salva automaticamente lo status dei giocatori
  useEffect(() => {
    savePlayerStatus(playerStatus);
  }, [playerStatus]);

  // NUOVO: Salva automaticamente il budget
  useEffect(() => {
    saveBudget(budget);
  }, [budget]);

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
      // NUOVO: Controllo budget
      if (!canAffordPlayer(fantamilioni, budget, playerStatus)) {
        alert(`Non hai abbastanza fantamilioni! Budget disponibile: ${budget - getTotalFantamilioni(playerStatus)}`);
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

  // NUOVO: Gestione cambio budget
  const handleBudgetChange = (newBudget) => {
    setBudget(newBudget);
  };

  // Definizione delle tab
  const tabs = [
    {
      id: 'giocatori',
      label: 'Giocatori',
      emoji: '🔍',
      description: 'Cerca e acquista giocatori'
    },
    {
      id: 'rosa',
      label: 'Rosa Acquistata',
      emoji: '👥',
      description: 'La tua rosa per ruolo'
    }
  ];

  // Stili
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  };

  const tabNavigationStyle = {
    backgroundColor: 'white',
    borderBottom: '2px solid #e2e8f0',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'center'
  };

  const tabButtonStyle = {
    padding: '1rem 2rem',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#64748b',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const activeTabStyle = {
    ...tabButtonStyle,
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
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

      {/* NUOVO: Display Budget - solo se ci sono dati */}
      {normalizedData.length > 0 && (
        <div style={{ padding: '0 2rem' }}>
          <BudgetDisplay
            budget={budget}
            playerStatus={playerStatus}
            onBudgetChange={handleBudgetChange}
          />
        </div>
      )}

      {/* Tab Navigation - Solo se ci sono dati */}
      {normalizedData.length > 0 && (
        <div style={tabNavigationStyle}>
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
