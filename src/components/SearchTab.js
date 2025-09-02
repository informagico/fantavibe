import { Search } from 'lucide-react';
import React, { useMemo } from 'react';
import { normalizeName } from '../utils/dataUtils';
import PlayerCard from './PlayerCard';

const SearchTab = ({ data, searchTerm, onSearchChange, playerStatus, onStatusChange }) => {
  // Filtra giocatori in base alla ricerca
  const filteredPlayers = useMemo(() => {
    if (!searchTerm || !data.length) return [];
    
    return data
      .filter(player => 
        player.Nome && normalizeName(player.Nome).includes(normalizeName(searchTerm))
      )
      .slice(0, 20); // Limita a 20 risultati
  }, [data, searchTerm]);

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
    paddingRight: '1rem',
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

  return (
    <div style={containerStyle}>
      <div style={searchContainerStyle}>
        <Search size={20} style={searchIconStyle} />
        <input
          type="text"
          placeholder="Cerca giocatore per nome... (es. Lookman, Kean, etc.)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={searchInputStyle}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      {searchTerm && (
        <div>
          <h2 style={titleStyle}>
            Risultati ricerca per "{searchTerm}" ({filteredPlayers.length})
          </h2>
          
          {filteredPlayers.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredPlayers.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  status={playerStatus[player.id] || 'none'}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              <Search size={48} style={emptyIconStyle} />
              <h3 style={{ marginBottom: '0.5rem' }}>Nessun giocatore trovato</h3>
              <p>Prova con un nome diverso o verifica l'ortografia</p>
            </div>
          )}
        </div>
      )}

      {!searchTerm && (
        <div style={emptyStateStyle}>
          <Search size={64} style={emptyIconStyle} />
          <h3 style={{ marginBottom: '0.5rem' }}>Inizia a cercare un giocatore</h3>
          <p>Digita il nome di un giocatore per visualizzare i suoi dati e statistiche</p>
        </div>
      )}
    </div>
  );
};

export default SearchTab;
