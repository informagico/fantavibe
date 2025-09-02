import { Clock, Search } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce, searchPlayers } from '../utils/dataUtils';
import PlayerCard from './PlayerCard';

const SearchTab = ({ data, searchTerm, onSearchChange, playerStatus, onStatusChange, searchIndex }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const searchTimeoutRef = useRef(null);

  // 🚀 Ricerca ottimizzata con debouncing
  const debouncedSearch = useCallback(
    debounce((term) => {
      const startTime = performance.now();
      setIsSearching(false);
      const endTime = performance.now();
      setSearchTime(Math.round(endTime - startTime));
    }, 200), // 200ms di delay
    []
  );

  // Gestione del cambio di input con debouncing visivo
  const handleSearchChange = useCallback((value) => {
    onSearchChange(value);
    
    // Cancella il timeout precedente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        debouncedSearch(value);
      }, 200);
    } else {
      setIsSearching(false);
      setSearchTime(0);
    }
  }, [onSearchChange, debouncedSearch]);

  // 🚀 Filtra giocatori usando la ricerca ottimizzata
  const filteredPlayers = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const startTime = performance.now();
    
    // Usa la ricerca ottimizzata se disponibile
    const results = searchPlayers(data, searchTerm, searchIndex);
    
    const endTime = performance.now();
    setSearchTime(Math.round(endTime - startTime));
    
    return results.slice(0, 50); // Massimo 50 risultati
  }, [data, searchTerm, searchIndex]);

  // Cleanup del timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Stili
  const containerStyle = {
    width: '100%'
  };

  const searchContainerStyle = {
    position: 'relative',
    marginBottom: '2rem'
  };

  const searchInputStyle = {
    width: '100%',
    paddingLeft: '3rem',
    paddingRight: '4rem', // Spazio per loader
    paddingTop: '0.875rem',
    paddingBottom: '0.875rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const searchIconStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8'
  };

  const loadingSpinnerStyle = {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    border: '2px solid #e2e8f0',
    borderTop: '2px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const statsBarStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#64748b'
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1.5rem'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#64748b'
  };

  const emptyIconStyle = {
    margin: '0 auto 1rem',
    color: '#cbd5e1'
  };

  const resultsGridStyle = {
    display: 'grid',
    gap: '1rem'
  };

  const performanceIndicatorStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: searchTime < 10 ? '#dcfce7' : searchTime < 50 ? '#fef3c7' : '#fee2e2',
    color: searchTime < 10 ? '#166534' : searchTime < 50 ? '#92400e' : '#991b1b',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500'
  };

  return (
    <div style={containerStyle}>
      <div style={searchContainerStyle}>
        <Search size={20} style={searchIconStyle} />
        <input
          type="text"
          placeholder="Cerca giocatore per nome... (minimo 2 caratteri)"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={searchInputStyle}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
        {isSearching && (
          <div style={loadingSpinnerStyle}></div>
        )}
      </div>

      {/* Informazioni di ricerca e performance */}
      {searchTerm.length >= 2 && (
        <div style={statsBarStyle}>
          <span>📊 {filteredPlayers.length} risultati</span>
          {searchTime > 0 && (
            <span style={performanceIndicatorStyle}>
              <Clock size={12} />
              {searchTime}ms
            </span>
          )}
          {searchIndex && (
            <span>🚀 Ricerca ottimizzata attiva</span>
          )}
          {searchTerm.length >= 2 && searchTerm.length < 3 && (
            <span style={{ color: '#f59e0b' }}>💡 Digita almeno 3 caratteri per risultati migliori</span>
          )}
        </div>
      )}

      {searchTerm.length >= 2 && (
        <div>
          <h2 style={titleStyle}>
            Risultati ricerca per "{searchTerm}"
          </h2>
          
          {filteredPlayers.length > 0 ? (
            <div style={resultsGridStyle}>
              {filteredPlayers.map((player, index) => (
                <div key={player.id} style={{ position: 'relative' }}>
                  {index < 5 && (
                    <div style={{
                      position: 'absolute',
                      left: '-0.5rem',
                      top: '0.5rem',
                      zIndex: 10,
                      width: '1.5rem',
                      height: '1.5rem',
                      backgroundColor: index === 0 ? '#f59e0b' : '#64748b',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                  )}
                  <div style={{ marginLeft: index < 5 ? '1rem' : '0' }}>
                    <PlayerCard
                      player={player}
                      status={playerStatus[player.id] || 'none'}
                      onStatusChange={onStatusChange}
                    />
                  </div>
                </div>
              ))}
              
              {filteredPlayers.length === 50 && (
                <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  color: '#64748b',
                  fontSize: '0.875rem'
                }}>
                  📢 Mostrati i primi 50 risultati. Affina la ricerca per vedere risultati più specifici.
                </div>
              )}
            </div>
          ) : !isSearching ? (
            <div style={emptyStateStyle}>
              <Search size={48} style={emptyIconStyle} />
              <h3 style={{ marginBottom: '0.5rem' }}>Nessun giocatore trovato</h3>
              <p>Prova con un nome diverso o verifica l'ortografia</p>
              <div style={{ 
                marginTop: '1rem', 
                fontSize: '0.875rem',
                color: '#94a3b8'
              }}>
                💡 Suggerimenti: "Lookman", "Kean", "Lautaro"
              </div>
            </div>
          ) : (
            <div style={{
              ...emptyStateStyle,
              padding: '2rem'
            }}>
              <div style={loadingSpinnerStyle}></div>
              <p style={{ marginTop: '1rem' }}>Ricerca in corso...</p>
            </div>
          )}
        </div>
      )}

      {/* Stato iniziale quando non c'è ricerca */}
      {!searchTerm && (
        <div style={emptyStateStyle}>
          <Search size={64} style={emptyIconStyle} />
          <h3 style={{ marginBottom: '0.5rem' }}>Inizia a cercare un giocatore</h3>
          <p>Digita il nome di un giocatore per visualizzare i suoi dati e statistiche</p>
          
          {/* Suggerimenti di ricerca */}
          <div style={{
            marginTop: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            maxWidth: '600px',
            margin: '2rem auto 0'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                🎯 Suggerimenti:
              </h4>
              <ul style={{ 
                fontSize: '0.75rem', 
                color: '#64748b',
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li>• Cerca per nome: "Lookman"</li>
                <li>• Anche parziale: "Lauta" per Lautaro</li>
                <li>• Funziona con accenti: "José"</li>
              </ul>
            </div>
            
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                ⚡ Performance:
              </h4>
              <ul style={{ 
                fontSize: '0.75rem', 
                color: '#64748b',
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                <li>• Ricerca ultra-veloce</li>
                <li>• Risultati in tempo reale</li>
                <li>• Max 50 risultati per performance</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Indicatore quando la ricerca è troppo corta */}
      {searchTerm.length === 1 && (
        <div style={{
          padding: '1rem',
          textAlign: 'center',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          color: '#92400e',
          fontSize: '0.875rem'
        }}>
          ⚠️ Inserisci almeno 2 caratteri per iniziare la ricerca
        </div>
      )}

      {/* Stili per l'animazione dello spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SearchTab;
