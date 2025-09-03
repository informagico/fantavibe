import { Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { searchPlayers } from '../utils/dataUtils';
import PlayerCard from './PlayerCard';

const SearchTab = ({ 
  data, 
  searchTerm, 
  onSearchChange, 
  playerStatus, 
  onStatusChange,
  onPlayerAcquire,
  searchIndex 
}) => {
  // STATE GLOBALE per la modalità dettagliata
  const [showDetailedMode, setShowDetailedMode] = useState(false);

  // Risultati di ricerca ottimizzati
  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return searchPlayers(data, searchTerm, searchIndex);
  }, [data, searchTerm, searchIndex]);

  const containerStyle = {
    width: '100%'
  };

  const searchContainerStyle = {
    position: 'relative',
    marginBottom: '2rem',
    maxWidth: '500px',
    margin: '0 auto 2rem auto'
  };

  const searchInputStyle = {
    width: '100%',
    padding: '0.75rem 2.5rem 0.75rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: 'white',
    boxSizing: 'border-box'
  };

  const searchIconStyle = {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none'
  };

  const resultsHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    padding: '0 0.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const resultsCountStyle = {
    fontSize: '1rem',
    color: '#374151',
    fontWeight: '500'
  };

  const controlsStyle = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  };

  const toggleButtonStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: showDetailedMode ? '#3b82f6' : '#f3f4f6',
    color: showDetailedMode ? 'white' : '#374151',
    border: showDetailedMode ? 'none' : '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const clearButtonStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#374151',
    transition: 'all 0.2s'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginTop: '1rem'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#6b7280'
  };

  const instructionStyle = {
    textAlign: 'center',
    padding: '2rem 1rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    border: '2px dashed #e5e7eb',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const instructionIconStyle = {
    fontSize: '2rem',
    marginBottom: '0.75rem'
  };

  const instructionTitleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  };

  const instructionTextStyle = {
    color: '#6b7280',
    lineHeight: '1.6',
    fontSize: '0.9rem'
  };

  const handleSearchInputFocus = (e) => {
    e.target.style.borderColor = '#3b82f6';
  };

  const handleSearchInputBlur = (e) => {
    e.target.style.borderColor = '#e5e7eb';
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleToggleDetailedMode = () => {
    setShowDetailedMode(prev => !prev);
  };

  return (
    <div style={containerStyle}>
      {/* Search Input */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="Cerca giocatore per nome..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={searchInputStyle}
          onFocus={handleSearchInputFocus}
          onBlur={handleSearchInputBlur}
        />
        <Search size={18} style={searchIconStyle} />
      </div>

      {/* Istruzioni quando non c'è ricerca */}
      {!searchTerm && (
        <div style={instructionStyle}>
          <div style={instructionIconStyle}>🔍</div>
          <div style={instructionTitleStyle}>
            Cerca un giocatore
          </div>
          <div style={instructionTextStyle}>
            Digita almeno 2 caratteri per iniziare la ricerca.<br />
            Puoi cercare per nome o parte del nome del giocatore.
          </div>
        </div>
      )}

      {/* Ricerca troppo corta */}
      {searchTerm && searchTerm.length < 2 && (
        <div style={emptyStateStyle}>
          <p>Digita almeno 2 caratteri per cercare...</p>
        </div>
      )}

      {/* Risultati */}
      {searchTerm && searchTerm.length >= 2 && (
        <>
          {/* Header risultati CON TOGGLE GLOBALE */}
          <div style={resultsHeaderStyle}>
            <div style={resultsCountStyle}>
              {searchResults.length > 0 
                ? `${searchResults.length} risultat${searchResults.length === 1 ? 'o' : 'i'} per "${searchTerm}"`
                : `Nessun risultato per "${searchTerm}"`
              }
            </div>
            
            {searchResults.length > 0 && (
              <div style={controlsStyle}>
                {/* TOGGLE MODALITÀ DETTAGLIATA */}
                <button
                  onClick={handleToggleDetailedMode}
                  style={toggleButtonStyle}
                  onMouseEnter={(e) => {
                    if (!showDetailedMode) {
                      e.target.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showDetailedMode) {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                >
                  {showDetailedMode ? '📊' : '📈'}
                  {showDetailedMode ? 'Nascondi Dettagli' : 'Mostra Dettagli'}
                </button>
                
                {/* PULSANTE PULISCI RICERCA */}
                <button
                  onClick={handleClearSearch}
                  style={clearButtonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  Pulisci ricerca
                </button>
              </div>
            )}
          </div>

          {/* Griglia risultati */}
          {searchResults.length > 0 ? (
            <div style={gridStyle}>
              {searchResults.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  playerStatus={playerStatus}
                  onStatusChange={onStatusChange}
                  onAcquire={onPlayerAcquire}
                  showAllStats={showDetailedMode} // PASSIAMO IL STATE GLOBALE
                />
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>😔</div>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                Nessun giocatore trovato
              </p>
              <p style={{ color: '#9ca3af' }}>
                Prova con un nome diverso o controlla l'ortografia
              </p>
            </div>
          )}
        </>
      )}

      {/* Performance indicator per sviluppo */}
      {process.env.NODE_ENV === 'development' && searchTerm && searchResults.length > 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '0.75rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: '#0369a1',
          textAlign: 'center'
        }}>
          🚀 Ricerca ottimizzata • Modalità: {showDetailedMode ? 'Dettagliata' : 'Compatta'}
        </div>
      )}

      {/* Indicatore modalità sempre visibile in sviluppo */}
      {process.env.NODE_ENV === 'development' && !searchTerm && (
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          Modalità visualizzazione: {showDetailedMode ? 'Dettagliata' : 'Compatta'}
        </div>
      )}
    </div>
  );
};

export default SearchTab;
