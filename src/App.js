import { Search, Users } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import FantamilioniModal from './components/FantamilioniModal';
import FileUpload from './components/FileUpload';
import Header from './components/Header';
import RankingsTab from './components/RankingsTab';
import SearchTab from './components/SearchTab';
import { normalizePlayerData } from './utils/dataUtils';
import { loadPlayerStatus, savePlayerStatus, updatePlayerStatus } from './utils/storage';

const App = () => {
  // Stati principali
  const [fpediaData, setFpediaData] = useState([]);
  const [playerStatus, setPlayerStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [selectedRole, setSelectedRole] = useState('POR');
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
    }
    
    setLoading(false);
  };

  // Caricamento manuale del file
  const handleFileUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        setFpediaData(jsonData);
        setError(null);
      } catch (err) {
        setError(`Errore nel caricamento del file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Gestione status giocatori normale (senza fantamilioni)
  const handlePlayerStatusChange = (playerId, status) => {
    const newStatus = updatePlayerStatus(playerStatus, playerId, status);
    setPlayerStatus(newStatus);
    savePlayerStatus(newStatus);
  };

  // Gestione acquisto giocatore (con modal fantamilioni)
  const handlePlayerAcquire = (player) => {
    setPlayerToAcquire(player);
    setShowFantamilioniModal(true);
  };

  // Conferma acquisto con fantamilioni
  const handleConfirmAcquire = (fantamilioni) => {
    if (playerToAcquire) {
      const newStatus = updatePlayerStatus(
        playerStatus, 
        playerToAcquire.id, 
        'acquired', 
        fantamilioni
      );
      setPlayerStatus(newStatus);
      savePlayerStatus(newStatus);
      
      console.log(`${playerToAcquire.Nome} acquistato per ${fantamilioni} fantamilioni`);
    }
    
    // Reset modal
    setPlayerToAcquire(null);
    setShowFantamilioniModal(false);
  };

  // Chiusura modal
  const handleCloseFantamilioniModal = () => {
    setPlayerToAcquire(null);
    setShowFantamilioniModal(false);
  };

  // Memorizza i dati normalizzati e l'indice di ricerca
  const normalizedDataWithIndex = useMemo(() => {
    console.log('🔄 Ricalcolo dati normalizzati...');
    return normalizePlayerData(fpediaData);
  }, [fpediaData]);

  // Per compatibilità con i componenti esistenti
  const normalizedData = normalizedDataWithIndex.players;
  const searchIndex = normalizedDataWithIndex.searchIndex;

  // Stili
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const contentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  };

  const tabsStyle = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    padding: '0.25rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  };

  const tabStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'none',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <Header 
        dataCount={normalizedData.length}
        playerStatus={playerStatus}
      />

      {/* Main Content */}
      <div style={contentStyle}>
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
            }}>⚽</div>
            <p>Caricamento dati in corso...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* File Upload - SOLO se non ci sono dati caricati */}
        {normalizedData.length === 0 && !loading && (
          <FileUpload onFileUpload={handleFileUpload} />
        )}

        {/* Navigation Tabs - SOLO se ci sono dati */}
        {normalizedData.length > 0 && (
          <div style={tabsStyle}>
            <button
              style={activeTab === 'search' ? activeTabStyle : tabStyle}
              onClick={() => setActiveTab('search')}
            >
              <Search size={18} />
              Cerca Giocatori
            </button>
            <button
              style={activeTab === 'rankings' ? activeTabStyle : tabStyle}
              onClick={() => setActiveTab('rankings')}
            >
              <Users size={18} />
              Classifiche
            </button>
          </div>
        )}

        {/* Data Display - SOLO se ci sono dati */}
        {normalizedData.length > 0 && (
          <>
            {activeTab === 'search' && (
              <SearchTab
                data={normalizedData}
                searchIndex={searchIndex}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                playerStatus={playerStatus}
                onStatusChange={handlePlayerStatusChange}
                onPlayerAcquire={handlePlayerAcquire}
              />
            )}

            {activeTab === 'rankings' && (
              <RankingsTab
                players={normalizedData}
                playerStatus={playerStatus}
                onPlayerStatusChange={handlePlayerStatusChange}
                onPlayerAcquire={handlePlayerAcquire}
              />
            )}
          </>
        )}

        {/* Pulsante per ricaricare i dati - SOLO se ci sono dati */}
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
  );
};

export default App;
