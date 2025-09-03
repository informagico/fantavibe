// src/components/RosaAcquistata.js - Versione pulita senza dati duplicati
import React, { useMemo } from 'react';
import { getAcquiredPlayers } from '../utils/storage';

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
  const totalPlayers = acquiredPlayersDetails.length;

  // Gestori eventi
  const handleRemovePlayer = (playerId) => {
    if (window.confirm('Sei sicuro di voler rimuovere questo giocatore dalla rosa?')) {
      onPlayerStatusChange(playerId, null);
    }
  };

  // Stili
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem'
  };

  const headerStyle = {
    maxWidth: '1200px',
    margin: '0 auto 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  const rolesGridStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem'
  };

  const roleCardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  };

  const roleHeaderStyle = {
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #f1f5f9'
  };

  const roleTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const roleStatsStyle = {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500'
  };

  const playersListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  };

  const playerItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  };

  const playerInfoStyle = {
    flex: 1
  };

  const playerNameStyle = {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '1rem',
    margin: '0 0 0.25rem 0'
  };

  const playerDetailsStyle = {
    fontSize: '0.875rem',
    color: '#64748b',
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  };

  const playerActionsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  };

  const fantamilioniStyle = {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: '#dc2626',
    minWidth: '60px',
    textAlign: 'right'
  };

  const removeButtonStyle = {
    padding: '0.25rem 0.5rem',
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
            👥 La Tua Rosa
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
      {/* Header semplificato */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          👥 La Tua Rosa
        </h1>
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
                  {roleStats.count} giocator{roleStats.count === 1 ? 'e' : 'i'}
                  {roleStats.total > 0 && (
                    <span> • {roleStats.total}FM spesi</span>
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
                  roleStats.players.map((player) => (
                    <div key={player.id} style={playerItemStyle}>
                      <div style={playerInfoStyle}>
                        <div style={playerNameStyle}>{player.Nome}</div>
                        <div style={playerDetailsStyle}>
                          <span>📍 {player.Squadra}</span>
                          <span>🏆 {player.Convenienza || 'N/A'}</span>
                          {player.Quotazione && (
                            <span>💰 {player.Quotazione}FM</span>
                          )}
                        </div>
                      </div>
                      
                      <div style={playerActionsStyle}>
                        <div style={fantamilioniStyle}>
                          {player.fantamilioni || 0}FM
                        </div>
                        <button
                          onClick={() => handleRemovePlayer(player.id)}
                          style={removeButtonStyle}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#fef2f2';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          Rimuovi
                        </button>
                      </div>
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
