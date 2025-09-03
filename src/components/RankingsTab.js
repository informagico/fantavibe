// src/components/RankingsTab.js - Versione corretta con state interno
import React, { useMemo, useState } from 'react';
import { filterPlayersByRole, sortPlayersByConvenienza } from '../utils/dataUtils';
import PlayerCard from './PlayerCard';

const RankingsTab = ({ 
  players = [], // Rinominato da 'data' per coerenza con App.js
  playerStatus, 
  onPlayerStatusChange, // Rinominato per coerenza con App.js
  onPlayerAcquire
}) => {
  // State interno per il ruolo selezionato
  const [selectedRole, setSelectedRole] = useState('POR');

  // TUTTI i giocatori per ruolo ordinati per convenienza
  const topPlayers = useMemo(() => {
    if (!players || !players.length) return [];
    const filtered = filterPlayersByRole(players, selectedRole);
    const sorted = sortPlayersByConvenienza(filtered);
    return sorted;
  }, [players, selectedRole]);

  const roles = [
    { key: 'POR', label: 'Portieri', emoji: '🥅' },
    { key: 'DIF', label: 'Difensori', emoji: '🛡️' },
    { key: 'CEN', label: 'Centrocampisti', emoji: '🎯' },    
    { key: 'ATT', label: 'Attaccanti', emoji: '⚽' }
  ];

  // Handler per il cambio di ruolo
  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
  };

  function getRoleStats() {
    if (!players || !players.length) return { total: 0, showing: 0, avgConvenienza: '0' };
    
    const totalPlayers = filterPlayersByRole(players, selectedRole).length;
    const avgConvenienza = topPlayers.length > 0 
      ? (topPlayers.reduce((sum, p) => sum + (p.convenienza || 0), 0) / topPlayers.length).toFixed(1)
      : '0';
    
    return {
      total: totalPlayers,
      showing: totalPlayers,
      avgConvenienza
    };
  }

  const stats = getRoleStats();

  const containerStyle = {
    width: '100%'
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

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb'
  };

  const rankBadgeStyle = (index) => ({
    position: 'absolute',
    top: '-8px',
    left: '-8px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: getRankColor(index),
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 100
  });

  function getRankColor(index) {
    if (index === 0) return '#ffd700'; // Oro
    if (index === 1) return '#c0c0c0'; // Argento  
    if (index === 2) return '#cd7f32'; // Bronzo
    return '#6b7280'; // Grigio per gli altri
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          🏆 Classifica Completa per Ruolo
        </h2>
        
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

        {/* Stats Summary - SENZA TOGGLE DUPLICATO */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '1rem',
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Totale {roles.find(r => r.key === selectedRole)?.label}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
              {stats.avgConvenienza}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Convenienza Media
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {topPlayers.length > 0 ? (
        <div style={gridStyle}>
          {topPlayers.map((player, index) => (
            <div key={player.id} style={{ position: 'relative' }}>
              {/* Rank badge - mostra per i primi 3 */}
              {index < 3 && (
                <div style={rankBadgeStyle(index)}>
                  {index + 1}
                </div>
              )}
              
              <PlayerCard
                player={player}
                playerStatus={playerStatus}
                onStatusChange={onPlayerStatusChange}
                onAcquire={onPlayerAcquire}
              />
            </div>
          ))}
        </div>
      ) : (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤷‍♂️</div>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#374151' }}>
            {!players || !players.length 
              ? 'Nessun dato caricato' 
              : `Nessun giocatore trovato per il ruolo ${selectedRole}`
            }
          </p>
          <p style={{ color: '#9ca3af' }}>
            {!players || !players.length 
              ? 'Carica il file Excel per visualizzare i giocatori'
              : 'Verifica che i dati siano stati caricati correttamente'
            }
          </p>
        </div>
      )}

      {/* Role indicator with player count */}
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
          {roles.find(r => r.key === selectedRole)?.emoji} {selectedRole} • {stats.total} giocatori
        </div>
      )}
    </div>
  );
};

export default RankingsTab;
