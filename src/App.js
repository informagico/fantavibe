import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import FantamilioniModal from './components/FantamilioniModal';
import Header from './components/Header';
import PlayersTab from './components/PlayersTab';
import RosaAcquistata from './components/RosaAcquistata';
import { normalizePlayerData } from './utils/dataUtils';
import { checkAndUpdateDataset, clearAllCache, forceRefresh, getCacheInfo } from './utils/githubReleaseManager';
import { canAffordPlayer, getTotalFantamilioni, loadBudget, loadPlayerStatus, saveBudget, savePlayerStatus, updatePlayerStatus } from './utils/storage';

const App = () => {
  // Stati principali
  const [fpediaData, setFpediaData] = useState([]);
  const [playerStatus, setPlayerStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('giocatori');

  // Stato del budget
  const [budget, setBudget] = useState(500);

  // Flag per evitare salvataggi durante l'inizializzazione
  const [isInitialized, setIsInitialized] = useState(false);

  // Stati per la modal fantamilioni
  const [showFantamilioniModal, setShowFantamilioniModal] = useState(false);
  const [playerToAcquire, setPlayerToAcquire] = useState(null);

  // Stati per gestione cache
  const [cacheInfo, setCacheInfo] = useState(null);
  const [downloadInfo, setDownloadInfo] = useState(null);

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
    
    loadDataFromPublic();
  }, []);

  useEffect(() => {
    const cacheDetails = getCacheInfo();
    setCacheInfo(cacheDetails);
    console.log('📊 Cache info caricata:', cacheDetails);
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

  // Caricamento automatico del file con sistema di cache intelligente
  const loadDataFromPublic = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TENTATIVO 1: Prova a scaricare da GitHub con cache intelligente
      try {
        console.log('🚀 Tentando download da GitHub con cache...');

        const downloadResult = await checkAndUpdateDataset();
        setDownloadInfo(downloadResult); // ← AGGIUNTA PER CACHE
        
        const arrayBuffer = downloadResult.datasetBuffer;
        const workbook = XLSX.read(arrayBuffer, {type:"binary"});
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        // Log informativo sulla fonte dei dati
        const source = downloadResult.fromCache ? 
          (downloadResult.expired ? 'cache scaduta' : 'cache') : 
          'download';
        
        console.log(`✅ Dati caricati da ${source}, giocatori trovati:`, data?.length || 0);
        
        if (downloadResult.fromCache) {
          const ageHours = downloadResult.cacheAge ? 
            ((new Date() - new Date(downloadResult.cacheAge)) / (1000 * 60 * 60)).toFixed(1) : 'N/A';
          console.log(`📦 Cache utilizzata, età: ${ageHours} ore`);
        }
        
        setFpediaData(data);
        
        // Aggiorna info cache alla fine del caricamento ← AGGIUNTA PER CACHE
        setCacheInfo(getCacheInfo());
        return;
        
      } catch (error) {
        console.warn('⚠️ Download da GitHub fallito, provo file locale:', error.message);
        setDownloadInfo({ error: error.message }); // ← AGGIUNTA PER CACHE
      }

      // TENTATIVO 2: Fallback al file locale
      console.log('📁 Caricando file locale...');
      const fpediaResponse = await fetch('/fpedia_analysis.xlsx');
      if (fpediaResponse.ok) {
        const fpediaBuffer = await fpediaResponse.arrayBuffer();
        const fpediaWorkbook = XLSX.read(fpediaBuffer);
        const fpediaSheet = fpediaWorkbook.Sheets[fpediaWorkbook.SheetNames[0]];
        const fpediaJson = XLSX.utils.sheet_to_json(fpediaSheet);
        
        console.log('✅ Dati caricati da file locale, giocatori:', fpediaJson?.length || 0);
        setFpediaData(fpediaJson);
        setDownloadInfo({ fromLocal: true }); // ← AGGIUNTA PER CACHE
      } else {
        setError('File fpedia_analysis.xlsx non trovato nella cartella public. Verifica che il file sia presente.');
      }
    } catch (err) {
      setError('Errore nel caricamento del file. Controlla la console per maggiori dettagli.');
      console.error('Errore caricamento automatico:', err);
    } finally {
      setLoading(false);
      // Aggiorna info cache alla fine del caricamento ← AGGIUNTA PER CACHE
      setCacheInfo(getCacheInfo());
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

  // Funzioni per gestione cache
  const handleForceRefresh = async () => {
    if (window.confirm('Vuoi forzare il download dei dati più recenti? Questo cancellerà la cache.')) {
      setLoading(true);
      try {
        const result = await forceRefresh();
        setDownloadInfo(result);
        
        const arrayBuffer = result.datasetBuffer;
        const workbook = XLSX.read(arrayBuffer, {type:"binary"});
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        setFpediaData(data);
        setCacheInfo(getCacheInfo());
        setError(null);
        
        console.log('✅ Refresh forzato completato');
      } catch (error) {
        setError('Errore durante il refresh forzato: ' + error.message);
        console.error('❌ Errore refresh:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Vuoi cancellare tutta la cache? Al prossimo caricamento i dati verranno scaricati nuovamente.')) {
      clearAllCache();
      setCacheInfo(getCacheInfo());
      console.log('🧹 Cache cancellata');
    }
  };

  const renderCacheInfo = () => {
    if (!cacheInfo && !downloadInfo) return null;
    
    return (
      <div style={{ 
        margin: '10px 0', 
        padding: '8px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Info fonte dati */}
          {downloadInfo && (
            <span>
              <strong>Fonte:</strong> {
                downloadInfo.fromCache ? (
                  downloadInfo.expired ? '📦 Cache (scaduta)' : '📦 Cache'
                ) : downloadInfo.error ? '❌ Errore' : '⬇️ Download'
              }
            </span>
          )}
          
          {/* Info cache */}
          {cacheInfo?.hasCache && (
            <span>
              <strong>Cache:</strong> {cacheInfo.ageHours.toFixed(1)}h fa 
              ({cacheInfo.isValid ? '✅' : '⚠️'}),
              {(cacheInfo.size / 1024).toFixed(1)} KB
            </span>
          )}
          
          {/* Pulsanti azioni */}
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={handleForceRefresh}
              style={{ 
                padding: '2px 6px', 
                fontSize: '11px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
            {cacheInfo?.hasCache && (
              <button 
                onClick={handleClearCache}
                style={{ 
                  padding: '2px 6px', 
                  fontSize: '11px', 
                  backgroundColor: '#dc3545', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                🧹 Clear
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div style={containerStyle}>
      {/* Header con Budget integrato */}
      <Header 
        dataCount={normalizedData.length}
        playerStatus={playerStatus}
        budget={budget}
        onBudgetChange={setBudget}
      />

      {renderCacheInfo()}

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
            padding: '2rem',
            margin: '2rem auto',
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
