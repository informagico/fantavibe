// src/App.js - Versione aggiornata con PlayersTab unificato
import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import FantamilioniModal from './components/FantamilioniModal';
import FileUpload from './components/FileUpload';
import Header from './components/Header';
import PlayersTab from './components/PlayersTab'; // Componente unificato
import { normalizePlayerData } from './utils/dataUtils';
import { loadPlayerStatus, savePlayerStatus, updatePlayerStatus } from './utils/storage';

const App = () => {
  // Stati principali
  const [fpediaData, setFpediaData] = useState([]);
  const [playerStatus, setPlayerStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stati per la modal fantamilioni
  const [showFantamilioniModal, setShowFantamilioniModal] = useState(false);
  const [playerToAcquire, setPlayerToAcquire] = useState(null);

  // Carica status giocatori all'avvio
  useEffect(() => {
    const status = loadPlayerStatus();
    setPlayerStatus(status);
    loadDataFromPublic();
  }, []);

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

  // Caricamento manuale del file
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setFpediaData(jsonData);
      } catch (err) {
        setError('Errore nella lettura del file. Assicurati che sia un file Excel valido.');
        console.error('Errore parsing Excel:', err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Normalizza i dati e crea indice di ricerca
  const normalizedDataWithIndex = useMemo(() => {
    if (!fpediaData.length) return { players: [], searchIndex: null };
    return normalizePlayerData(fpediaData);
  }, [fpediaData]);

  const normalizedData = normalizedDataWithIndex.players;
  const searchIndex = normalizedDataWithIndex.searchIndex;

  // Salva lo status quando cambia
  useEffect(() => {
    if (Object.keys(playerStatus).length > 0) {
      savePlayerStatus(playerStatus);
    }
  }, [playerStatus]);

  // Gestione cambio status giocatore
  const handlePlayerStatusChange = (playerId, newStatus) => {
    setPlayerStatus(prev => updatePlayerStatus(prev, playerId, newStatus));
  };

  // Gestione acquisizione giocatore
  const handlePlayerAcquire = (player) => {
    setPlayerToAcquire(player);
    setShowFantamilioniModal(true);
  };

  // Conferma acquisizione con fantamilioni
  const handleConfirmAcquire = (fantamilioni) => {
    if (playerToAcquire) {
      setPlayerStatus(prev => updatePlayerStatus(prev, playerToAcquire.id, 'acquired', fantamilioni));
      setShowFantamilioniModal(false);
      setPlayerToAcquire(null);
    }
  };

  // Chiudi modal fantamilioni
  const handleCloseFantamilioniModal = () => {
    setShowFantamilioniModal(false);
    setPlayerToAcquire(null);
  };

  // Stili
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '1rem'
  };

  const contentStyle = {
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const mainContentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginTop: '1rem'
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Header */}
        <Header playerStatus={playerStatus} playersData={normalizedData} />

        {/* Main Content */}
        <div style={mainContentStyle}>
          {/* Loading State */}
          {loading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#6b7280' 
            }}>
              <div style={{ 
                fontSize: '2rem', 
                marginBottom: '1rem' 
              }}>
                ⏳
              </div>
              <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                Caricamento dati in corso...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              marginBottom: '2rem'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
              <p style={{ color: '#dc2626', fontWeight: '500', marginBottom: '1rem' }}>
                {error}
              </p>
              <FileUpload onFileUpload={handleFileUpload} />
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
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          )}

          {/* Data Display - Componente Unificato */}
          {normalizedData.length > 0 && (
            <PlayersTab
              players={normalizedData}
              searchIndex={searchIndex}
              playerStatus={playerStatus}
              onPlayerStatusChange={handlePlayerStatusChange}
              onPlayerAcquire={handlePlayerAcquire}
            />
          )}

          {/* Pulsante per ricaricare i dati */}
          {normalizedData.length > 0 && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #e5e7eb'
            }}>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Vuoi caricare un nuovo file?
              </p>
              <button
                onClick={() => {
                  setFpediaData([]);
                  setError(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                📊 Carica Nuovo File
              </button>
            </div>
          )}
        </div>

        {/* Modal Fantamilioni */}
        {showFantamilioniModal && (
          <FantamilioniModal
            isOpen={showFantamilioniModal}
            player={playerToAcquire}
            playerName={playerToAcquire?.Nome}
            onConfirm={handleConfirmAcquire}
            onClose={handleCloseFantamilioniModal}
          />
        )}
      </div>
    </div>
  );
};

export default App;
