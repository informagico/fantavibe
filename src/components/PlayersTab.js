import { Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { filterPlayersByRole, searchPlayers, sortPlayersByField, applyAllFilters, SORT_OPTIONS } from '../utils/dataUtils';
import FilterPanel from './FilterPanel';
import PlayerCard from './PlayerCard';

const PlayersTab = ({ 
  players = [],
  searchIndex = null,
  playerStatus, 
  onPlayerStatusChange,
  onPlayerAcquire,
  selectedRole = 'ALL',
  onRoleChange
}) => {
  // Stati principali - SEMPRE dichiarati per rispettare rules of hooks
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailedMode, setShowDetailedMode] = useState(false);
  
  // Nuovi stati per filtri e ordinamento
  const [sortField, setSortField] = useState('convenienza');
  const [sortDirection, setSortDirection] = useState('desc');
  const [numericFilters, setNumericFilters] = useState({});
  const [booleanFilters, setBooleanFilters] = useState({});
  const [categoricalFilters, setCategoricalFilters] = useState({});
  const [skillsFilters, setSkillsFilters] = useState({});

  // Ruoli disponibili
  const roles = [
    { key: 'ALL', label: 'Tutti i Giocatori', emoji: '👥' },
    { key: 'POR', label: 'Portieri', emoji: '🥅' },
    { key: 'DIF', label: 'Difensori', emoji: '🛡️' },
    { key: 'CEN', label: 'Centrocampisti', emoji: '🎯' },
    { key: 'TRQ', label: 'Trequartisti', emoji: '🎨'},
    { key: 'CEN_TRQ', label: 'Centro + Trequartisti', emoji: '🎭' },
    { key: 'ATT', label: 'Attaccanti', emoji: '⚽' }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailedMode, setShowDetailedMode] = useState(false);

  const rolesDescription = (roleKey) => {
    const role = roles.find(r => r.key === roleKey);
    if (!role) return '';
    return role.label;
  }

  // Risultati in base al contesto (ricerca vs classifiche) con filtri avanzati
  const displayedPlayers = useMemo(() => {
    // Protezione per dati non ancora caricati
    if (!players || players.length === 0) return [];
    
    let filteredPlayers;
    
    if (searchTerm && searchTerm.length >= 2) {
      // Modalità ricerca: cerca tra tutti i giocatori poi filtra per ruolo
      const searchResults = searchPlayers(players, searchTerm, searchIndex);
      filteredPlayers = filterPlayersByRole(searchResults, selectedRole);
    } else {
      // Modalità classifiche: mostra tutti i giocatori del ruolo
      filteredPlayers = filterPlayersByRole(players, selectedRole);
    }
    
    // Applica filtri avanzati
    filteredPlayers = applyAllFilters(filteredPlayers, numericFilters, booleanFilters, skillsFilters, categoricalFilters);
    
    // Ordina per il campo selezionato
    return sortPlayersByField(filteredPlayers, sortField, sortDirection);
  }, [players, searchTerm, selectedRole, searchIndex, numericFilters, booleanFilters, categoricalFilters, skillsFilters, sortField, sortDirection]);

  // Statistiche per il ruolo selezionato
  const roleStats = useMemo(() => {
    // Protezione per dati non ancora caricati
    if (!players || players.length === 0) return { total: 0, avgConvenienza: '0' };
    
    const allRolePlayers = filterPlayersByRole(players, selectedRole);
    const avgConvenienza = allRolePlayers.length > 0 
      ? (allRolePlayers.reduce((sum, p) => sum + (p.convenienza || 0), 0) / allRolePlayers.length).toFixed(1)
      : '0';
    
    return {
      total: allRolePlayers.length,
      avgConvenienza
    };
  }, [players, selectedRole]);

  // Handlers
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleRoleChange = (roleKey) => {
    if (onRoleChange) {
      onRoleChange(roleKey);
    }
  };

  const handleToggleDetailedMode = () => {
    setShowDetailedMode(prev => !prev);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Nuovi handlers per filtri e ordinamento
  const handleSortChange = (field) => {
    if (field === sortField) {
      // Se è lo stesso campo, inverti la direzione
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      // Se è un campo diverso, imposta il nuovo campo con direzione decrescente
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleNumericFiltersChange = (filters) => {
    setNumericFilters(filters);
  };

  const handleBooleanFiltersChange = (filters) => {
    setBooleanFilters(filters);
  };

  const handleCategoricalFiltersChange = (filters) => {
    setCategoricalFilters(filters);
  };

  const handleSkillsFiltersChange = (filters) => {
    setSkillsFilters(filters);
  };

  // Determina se siamo in modalità ricerca
  const isSearchMode = searchTerm && searchTerm.length >= 2;

  // Funzioni helper
  function getRankColor(rank) {
    // rank è già decrementato di 1 quando viene passato (originalRank - 1)
    // quindi rank 0 = 1° posto, rank 1 = 2° posto, ecc.
    if (rank === 0) return '#ffd700'; // Oro - 1° posto
    if (rank === 1) return '#c0c0c0'; // Argento - 2° posto  
    if (rank === 2) return '#cd7f32'; // Bronzo - 3° posto
    if (rank < 10) return '#3b82f6'; // Blu per top 10
    if (rank < 20) return '#10b981'; // Verde per top 20
    return '#6b7280'; // Grigio per gli altri
  }

  const handleSearchInputFocus = (e) => {
    e.target.style.borderColor = '#3b82f6';
  };

  const handleSearchInputBlur = (e) => {
    e.target.style.borderColor = '#e5e7eb';
  };

  // Protezione per dati non ancora pronti - DOPO tutti gli hooks
  if (!players) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳</div>
        <p>Caricamento dati in corso...</p>
      </div>
    );
  }

  // Stili
  const containerStyle = {
    width: '80%',
	  margin: '0 auto'
  };

  const headerStyle = {
    marginBottom: '2rem'
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem',
    textAlign: 'center'
  };

  const searchContainerStyle = {
    position: 'relative',
    marginBottom: '1.5rem',
    maxWidth: '500px',
    margin: '0 auto 1.5rem auto'
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

  const roleButtonsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem'
  };

  const roleButtonStyle = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '140px',
    justifyContent: 'center'
  };

  const activeRoleButtonStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  };

  const inactiveRoleButtonStyle = {
    backgroundColor: 'white',
    color: '#6b7280',
    border: '2px solid #e5e7eb'
  };

  const controlsHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const infoStyle = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const statStyle = {
    textAlign: 'center'
  };

  const statValueStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#3b82f6'
  };

  const statLabelStyle = {
    fontSize: '0.875rem',
    color: '#6b7280'
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
    transition: 'all 0.2s',
    marginLeft: '0.5rem'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '0.5rem 0.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
	marginBottom: '1rem',
    border: '2px dashed #e5e7eb'
  };

  const rankBadgeStyle = (rank) => ({
    position: 'absolute',
    top: '-8px',
    left: '-8px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: getRankColor(rank),
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 100
  });

  const instructionStyle = {
    textAlign: 'center',
    padding: '2rem 1rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    border: '2px dashed #e5e7eb',
    maxWidth: '600px',
    margin: '0 auto 2rem auto'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          {isSearchMode ? '🔍 Ricerca Giocatori' : '🏆 Classifica per Ruolo'}
        </h2>
        
        {/* Search Input */}
        <div style={searchContainerStyle}>
          <input
            type="text"
            placeholder="Cerca giocatore per nome, squadra, infortunato..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={searchInputStyle}
            onFocus={handleSearchInputFocus}
            onBlur={handleSearchInputBlur}
          />
          <Search size={18} style={searchIconStyle} />
        </div>

        {/* Istruzioni quando non c'è ricerca */}
        {!searchTerm && (
          <div style={instructionStyle}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>💡</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Cerca o naviga per ruolo
            </div>
            <div style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '0.9rem' }}>
              Digita almeno 2 caratteri per cercare un giocatore specifico,<br />
              oppure usa i pulsanti per navigare tra i ruoli.
            </div>
          </div>
        )}
        
        {/* Role Selection */}
        <div style={roleButtonsStyle}>
          {roles.map(role => (
            <button
              key={role.key}
              onClick={() => handleRoleChange(role.key)}
              style={{
                ...roleButtonStyle,
                ...(selectedRole === role.key ? activeRoleButtonStyle : inactiveRoleButtonStyle)
              }}
              onMouseEnter={(e) => {
                if (selectedRole !== role.key) {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedRole !== role.key) {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e5e7eb';
                }
              }}
            >
              <span>{role.emoji}</span>
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controlli e statistiche */}
      {(searchTerm?.length >= 2 || !searchTerm) && (
        <div style={controlsHeaderStyle}>
          <div style={infoStyle}>
            {/* Statistiche ruolo */}
            <div style={statStyle}>
              <div style={statValueStyle}>
                {isSearchMode ? displayedPlayers.length : roleStats.total}
              </div>
              <div style={statLabelStyle}>
                {isSearchMode 
                  ? `Risultat${displayedPlayers.length === 1 ? 'o' : 'i'}`
                  : `Totale ${roles.find(r => r.key === selectedRole)?.label}`
                }
              </div>
            </div>
            
            {displayedPlayers.length > 0 && (
              <div style={statStyle}>
                <div style={statValueStyle}>
                  {roleStats.avgConvenienza}
                </div>
                <div style={statLabelStyle}>
                  Convenienza Pot. Media
                </div>
              </div>
            )}

            {/* Indicatore modalità ricerca */}
            {isSearchMode && (
              <div style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dbeafe',
                borderRadius: '20px',
                fontSize: '0.875rem',
                color: '#1e40af',
                fontWeight: '500'
              }}>
                🔍 "{searchTerm}"
              </div>
            )}
          </div>
        
        {/* Controlli di Ordinamento */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          flexWrap: 'wrap'
        }}>
          <span style={{ 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            color: '#374151',
            minWidth: 'fit-content'
          }}>
            📊 Ordina per:
          </span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '0.9rem',
              backgroundColor: 'white',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              outline: 'none'
            }}
          >
            {sortDirection === 'desc' ? '↓' : '↑'}
            {sortDirection === 'desc' ? 'Decrescente' : 'Crescente'}
          </button>
        </div>
      </div>
      )}

      {/* Filtri Avanzati - Ora occupano tutta la larghezza */}
      <FilterPanel
        onNumericFiltersChange={handleNumericFiltersChange}
        onBooleanFiltersChange={handleBooleanFiltersChange}
        onCategoricalFiltersChange={handleCategoricalFiltersChange}
        onSkillsFiltersChange={handleSkillsFiltersChange}
        numericFilters={numericFilters}
        booleanFilters={booleanFilters}
        categoricalFilters={categoricalFilters}
        skillsFilters={skillsFilters}
        totalPlayers={players ? filterPlayersByRole(players, selectedRole).length : 0}
        filteredPlayers={displayedPlayers.length}
      />

      {/* Controlli sotto i filtri */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {/* Toggle dettagli */}
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

        {/* Pulsante pulisci ricerca */}
        {searchTerm && (
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
        )}
      </div>

      {/* Messaggio ricerca troppo corta */}
      {searchTerm && searchTerm.length < 2 && (
        <div style={emptyStateStyle}>
          <p style={{ fontSize: '1.1rem', color: '#374151' }}>
            ⌨️ Digita almeno 2 caratteri per cercare...
          </p>
        </div>
      )}

      {/* Risultati */}
      {displayedPlayers.length > 0 ? (
        <div style={gridStyle}>
          {displayedPlayers.map((player, index) => (
            <div key={player.id} style={{ position: 'relative' }}>
              {/* Badge ranking originale - SEMPRE VISIBILE se presente */}
              {player.originalRank && (
                <div style={rankBadgeStyle(player.originalRank - 1)}>
                  {player.originalRank}
                </div>
              )}
              
              <PlayerCard
                player={player}
                playerStatus={playerStatus}
                onStatusChange={onPlayerStatusChange}
                onAcquire={onPlayerAcquire}
                showAllStats={showDetailedMode}
              />
            </div>
          ))}
        </div>
      ) : (
        // Empty state
        (searchTerm?.length >= 2 || (!searchTerm && players.length > 0)) && (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              {isSearchMode ? '😔' : '🤷‍♂️'}
            </div>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#374151' }}>
              {isSearchMode 
                ? `Nessun giocatore trovato per "${searchTerm}"`
                : !players || !players.length 
                  ? 'Nessun dato caricato' 
                  : `Nessun giocatore trovato per il ruolo '${selectedRole}'`
              }
            </p>
            <p style={{ color: '#9ca3af' }}>
              {isSearchMode 
                ? 'Prova con un nome diverso o cambia ruolo'
                : !players || !players.length 
                  ? 'Carica il file Excel per visualizzare i giocatori'
                  : 'Verifica che i dati siano stati caricati correttamente'
              }
            </p>
          </div>
        )
      )}

      {/* Indicatore ruolo fisso */}
      {players && players.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          padding: '0.75rem 1rem',
          borderRadius: '25px',
          fontSize: '0.875rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 100
        }}>
          {roles.find(r => r.key === selectedRole)?.emoji} {rolesDescription(selectedRole)}
          {isSearchMode && ` • ${displayedPlayers.length} risultati`}
          {!isSearchMode && ` • ${roleStats.total} totali`}
          {displayedPlayers.length > 0 && displayedPlayers[0].originalRank && (
            ` • Rank ${displayedPlayers[0].originalRank}-${displayedPlayers[displayedPlayers.length - 1].originalRank || displayedPlayers[0].originalRank}`
          )}
        </div>
      )}

      {/* Indicatore modalità dettagli (solo in sviluppo) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '0.5rem 1rem',
          backgroundColor: showDetailedMode ? '#10b981' : '#6b7280',
          color: 'white',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '500',
          zIndex: 100
        }}>
          {showDetailedMode ? '📊 Dettagli ON' : '📈 Dettagli OFF'}
        </div>
      )}
    </div>
  )};

export default PlayersTab;
