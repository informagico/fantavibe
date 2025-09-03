// src/components/RosaAcquistata.js
import React, { useMemo } from 'react';
import { getAcquiredPlayers, getPlayerStatsByRole, getTotalFantamilioni } from '../utils/storage';

const RosaAcquistata = ({ 
  players = [],
  playerStatus = {},
  onPlayerStatusChange 
}) => {
  // Ottieni giocatori acquistati
  const acquiredPlayerIds = useMemo(() => {
    return getAcquiredPlayers(playerStatus);
  }, [playerStatus]);

  // Combina dati giocatori acquistati con i loro dettagli
  const acquiredPlayersDetails = useMemo(() => {
    return acquiredPlayerIds.map(acquired => {
      const playerDetail = players.find(p => p.id === acquired.playerId);
      if (!playerDetail) return null;
      
      return {
        ...playerDetail,
        fantamilioni: acquired.fantamilioni,
        timestamp: acquired.timestamp
      };
    }).filter(Boolean);
  }, [acquiredPlayerIds, players]);

  // Raggruppa giocatori per ruolo
  const playersByRole = useMemo(() => {
    const grouped = {
      POR: { players: [], count: 0, total: 0 },
      DIF: { players: [], count: 0, total: 0 },
      CEN: { players: [], count: 0, total: 0 },
      ATT: { players: [], count: 0, total: 0 }
    };

    acquiredPlayersDetails.forEach(player => {
      const role = player.Ruolo;
      if (grouped[role]) {
        grouped[role].players.push(player);
        grouped[role].count++;
        grouped[role].total += player.fantamilioni || 0;
      }
    });

    // Ordina ogni gruppo per fantamilioni spesi (decrescente)
    Object.keys(grouped).forEach(role => {
      grouped[role].players.sort((a, b) => (b.fantamilioni || 0) - (a.fantamilioni || 0));
    });

    return grouped;
  }, [acquiredPlayersDetails]);

  // Statistiche totali
  const totalFantamilioni = getTotalFantamilioni(playerStatus);
  const totalPlayers = acquiredPlayersDetails.length;

  // Gestori eventi
  const handleRemovePlayer = (playerId) => {
    if (window.confirm('Sei sicuro di voler rimuovere questo giocatore dalla rosa?')) {
      onPlayerStatusChange(playerId, 'available');
    }
  };

  // Stili
  const containerStyle = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle = {
    marginBottom: '2rem',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem'
  };

  const summaryStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '3rem',
    marginBottom: '2rem',
    flexWrap: 'wrap'
  };

  const summaryItemStyle = {
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    minWidth: '120px'
  };

  const summaryValueStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: '0.25rem'
  };

  const summaryLabelStyle = {
    fontSize: '0.875rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.05em'
  };

  const rolesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  };

  const roleCardStyle = {
    backgroundColor: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s'
  };

  const roleHeaderStyle = {
    padding: '1rem 1.5rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const roleTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const roleStatsStyle = {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.875rem',
    color: '#64748b'
  };

  const playersListStyle = {
    padding: '0'
  };

  const playerItemStyle = {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.2s'
  };

  const playerInfoStyle = {
    flex: 1
  };

  const playerNameStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem'
  };

  const playerDetailsStyle = {
    fontSize: '0.875rem',
    color: '#64748b'
  };

  const playerPriceStyle = {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#dc2626',
    marginRight: '1rem'
  };

  const removeButtonStyle = {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b'
  };

  const emptyRoleStyle = {
    padding: '2rem',
    textAlign: 'center',
    color: '#9ca3af',
    fontStyle: 'italic'
  };

  // Mappatura ruoli con emoji e nomi
  const roleInfo = {
    POR: { emoji: '🥅', name: 'Portieri' },
    DIF: { emoji: '🛡️', name: 'Difensori' },
    CEN: { emoji: '🎯', name: 'Centrocampisti' },
    ATT: { emoji: '⚽', name: 'Attaccanti' }
  };

  if (totalPlayers === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            👥 Rosa Acquistata
          </h1>
        </div>
        
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😔</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '1rem' 
          }}>
            Nessun giocatore acquistato
          </h2>
          <p style={{ 
            color: '#6b7280', 
            lineHeight: '1.6' 
          }}>
            Inizia ad acquistare giocatori dalla sezione "Giocatori"<br />
            per vedere la tua rosa qui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          👥 Rosa Acquistata
        </h1>
        
        {/* Statistiche generali */}
        <div style={summaryStyle}>
          <div style={summaryItemStyle}>
            <div style={summaryValueStyle}>{totalPlayers}</div>
            <div style={summaryLabelStyle}>Giocatori</div>
          </div>
          
          <div style={summaryItemStyle}>
            <div style={{ ...summaryValueStyle, color: '#dc2626' }}>
              {totalFantamilioni}
            </div>
            <div style={summaryLabelStyle}>Fantamilioni</div>
          </div>
          
          <div style={summaryItemStyle}>
            <div style={{ ...summaryValueStyle, color: '#059669' }}>
              {totalPlayers > 0 ? Math.round(totalFantamilioni / totalPlayers) : 0}
            </div>
            <div style={summaryLabelStyle}>Media FM</div>
          </div>
        </div>
      </div>

      {/* Griglia ruoli */}
      <div style={rolesGridStyle}>
        {Object.entries(roleInfo).map(([roleKey, roleData]) => {
          const roleStats = playersByRole[roleKey];
          
          return (
            <div key={roleKey} style={roleCardStyle}>
              {/* Header ruolo */}
              <div style={roleHeaderStyle}>
                <div style={roleTitleStyle}>
                  <span>{roleData.emoji}</span>
                  {roleData.name}
                </div>
                <div style={roleStatsStyle}>
                  <span>{roleStats.count} giocatori</span>
                  {roleStats.total > 0 && (
                    <span>• {roleStats.total} FM</span>
                  )}
                </div>
              </div>

              {/* Lista giocatori */}
              <div style={playersListStyle}>
                {roleStats.players.length === 0 ? (
                  <div style={emptyRoleStyle}>
                    Nessun {roleData.name.toLowerCase()} acquistato
                  </div>
                ) : (
                  roleStats.players.map((player, index) => (
                    <div 
                      key={player.id} 
                      style={{
                        ...playerItemStyle,
                        ...(index === roleStats.players.length - 1 ? { borderBottom: 'none' } : {})
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={playerInfoStyle}>
                        <div style={playerNameStyle}>
                          {player.Nome}
                        </div>
                        <div style={playerDetailsStyle}>
                          {player.Squadra} 
                          {player.convenienza && (
                            <span> • Conv: {player.convenienza.toFixed(1)}</span>
                          )}
                          {player.Fanta_Voto && (
                            <span> • Voto: {player.Fanta_Voto}</span>
                          )}
                        </div>
                      </div>
                      
                      <div style={playerPriceStyle}>
                        {player.fantamilioni} FM
                      </div>
                      
                      <button
                        onClick={() => handleRemovePlayer(player.id)}
                        style={removeButtonStyle}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#ef4444';
                          e.target.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#ef4444';
                        }}
                        title="Rimuovi dalla rosa"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RosaAcquistata;
