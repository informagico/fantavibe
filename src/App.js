import { Search, Users } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import FileUpload from './components/FileUpload';
import Header from './components/Header';
import RankingsTab from './components/RankingsTab';
import SearchTab from './components/SearchTab';
import { normalizePlayerData } from './utils/dataUtils';
import { loadPlayerStatus, savePlayerStatus } from './utils/storage';

const App = () => {
  // Stati principali
  const [fpediaData, setFpediaData] = useState([]);
  const [fstatsData, setFstatsData] = useState([]);
  const [playerStatus, setPlayerStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [selectedRole, setSelectedRole] = useState('ATT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carica status giocatori all'avvio
  useEffect(() => {
    const status = loadPlayerStatus();
    setPlayerStatus(status);
    loadDataFromPublic();
  }, []);

  // Caricamento automatico files dalla cartella public
  const loadDataFromPublic = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carica FPEDIA
      const fpediaResponse = await fetch('/fpedia_analysis.xlsx');
      if (fpediaResponse.ok) {
        const fpediaBuffer = await fpediaResponse.arrayBuffer();
        const fpediaWorkbook = XLSX.read(fpediaBuffer);
        const fpediaSheet = fpediaWorkbook.Sheets[fpediaWorkbook.SheetNames[0]];
        const fpediaJson = XLSX.utils.sheet_to_json(fpediaSheet);
        setFpediaData(fpediaJson);
      }

      // Carica FSTATS
      const fstatsResponse = await fetch('/FSTATS_analysis.xlsx');
      if (fstatsResponse.ok) {
        const fstatsBuffer = await fstatsResponse.arrayBuffer();
        const fstatsWorkbook = XLSX.read(fstatsBuffer);
        const fstatsSheet = fstatsWorkbook.Sheets[fstatsWorkbook.SheetNames[0]];
        const fstatsJson = XLSX.utils.sheet_to_json(fstatsSheet);
        setFstatsData(fstatsJson);
      }
    } catch (err) {
      setError('File non trovati nella cartella public. Usa il caricamento manuale.');
    }
    
    setLoading(false);
  };

  // Caricamento manuale files
  const handleFileUpload = (file, fileType) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        if (fileType === 'fpedia') {
          setFpediaData(jsonData);
        } else {
          setFstatsData(jsonData);
        }
        
        setError(null);
      } catch (err) {
        setError(`Errore nel caricamento del file ${fileType}: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Gestione status giocatori
  const handlePlayerStatusChange = (playerId, status) => {
    const newStatus = { ...playerStatus };
    if (status === 'none') {
      delete newStatus[playerId];
    } else {
      newStatus[playerId] = status;
    }
    setPlayerStatus(newStatus);
    savePlayerStatus(newStatus);
  };

  // 🚀 OTTIMIZZAZIONE: Memorizza i dati normalizzati e l'indice di ricerca
  const normalizedDataWithIndex = useMemo(() => {
    console.log('🔄 Ricalcolo dati normalizzati...');
    return normalizePlayerData(fpediaData, fstatsData);
  }, [fpediaData, fstatsData]);

  // Per compatibilità con i componenti esistenti
  const normalizedData = normalizedDataWithIndex.players;
  const searchIndex = normalizedDataWithIndex.searchIndex;

  // Stili
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const navigationStyle = {
    backgroundColor: 'white',
    borderBottom: '2px solid #e2e8f0',
    padding: '1rem 0'
  };

  const navButtonStyle = {
    padding: '0.75rem 1.5rem',
    marginRight: '1rem',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  };

  const activeNavStyle = {
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const inactiveNavStyle = {
    backgroundColor: '#f1f5f9',
    color: '#64748b'
  };

  return (
    <div style={containerStyle}>
      <Header 
        dataCount={fpediaData.length}
        playerStatus={playerStatus}
      />
      
      {(!fpediaData.length || !fstatsData.length) && (
        <FileUpload 
          onFileUpload={handleFileUpload}
          error={error}
        />
      )}

      <div style={navigationStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <button
            onClick={() => setActiveTab('search')}
            style={{
              ...navButtonStyle,
              ...(activeTab === 'search' ? activeNavStyle : inactiveNavStyle)
            }}
          >
            <Search size={18} />
            Ricerca Giocatori
          </button>
          
          <button
            onClick={() => setActiveTab('rankings')}
            style={{
              ...navButtonStyle,
              ...(activeTab === 'rankings' ? activeNavStyle : inactiveNavStyle)
            }}
          >
            <Users size={18} />
            Top 20 per Ruolo
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#64748b' }}>Caricamento dati...</p>
          </div>
        )}

        {activeTab === 'search' && (
          <SearchTab 
            data={normalizedData}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            playerStatus={playerStatus}
            onStatusChange={handlePlayerStatusChange}
            searchIndex={searchIndex} // 🚀 NUOVA PROP per ricerca veloce
          />
        )}

        {activeTab === 'rankings' && (
          <RankingsTab 
            data={normalizedData}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            playerStatus={playerStatus}
            onStatusChange={handlePlayerStatusChange}
          />
        )}
      </div>

      {/* Performance stats per debug */}
      {process.env.NODE_ENV === 'development' && normalizedData.length > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.8)', 
          color: 'white', 
          padding: '8px', 
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          📊 {normalizedData.length} players | 🔍 {searchIndex?.size || 0} terms indexed
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
