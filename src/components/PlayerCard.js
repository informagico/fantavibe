// src/components/PlayerCard.js - Versione con conferma per reset
import React from 'react';
import { getPlayerDetails } from '../utils/storage';

const PlayerCard = ({ 
  player, 
  playerStatus, 
  onStatusChange,
  onAcquire,
  showAllStats = false // PROP CONTROLLATO ESTERNAMENTE
}) => {
  const playerDetails = getPlayerDetails(playerStatus, player.id);
  const currentStatus = playerDetails?.status || 'available';
  const fantamilioni = playerDetails?.fantamilioni || null;

  // Controlla se il giocatore è infortunato
  const isInjured = player.Infortunato === 'true';

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'acquired' && onAcquire) {
      onAcquire(player);
    } else {
      onStatusChange(player.id, newStatus);
    }
  };

  // GESTIONE BOTTONI - previene eventi indesiderati
  const handleButtonClick = (e, action) => {
    e.stopPropagation();
    e.preventDefault();
    
    // AGGIUNTO: Messaggio di conferma per il reset
    if (action === 'available' && (currentStatus === 'acquired' || currentStatus === 'unavailable')) {
      const statusText = currentStatus === 'acquired' ? 'acquistato' : 'non disponibile';
      if (window.confirm(`Sei sicuro di voler resettare lo stato di ${player.Nome}? Il giocatore è attualmente ${statusText}.`)) {
        handleStatusChange(action);
      }
    } else {
      handleStatusChange(action);
    }
  };

  function getRoleColor(ruolo) {
    switch (ruolo) {
      case 'POR': return '#8b5cf6';
      case 'DIF': return '#06b6d4';
      case 'CEN': return '#10b981';
      case 'ATT': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'acquired': return '#10b981';
      case 'unavailable': return '#ef4444';
      default: return 'transparent';
    }
  }

  // Statistiche base (sempre visibili)
  const baseStats = [
    { key: 'convenienza', label: 'Convenienza', value: player.convenienza?.toFixed(1) || 'N/A' },
    { key: 'fantamedia', label: 'Fantamedia', value: player.fantamedia?.toFixed(2) || 'N/A' }
  ];

  // Statistiche complete (visibili quando showAllStats è true)
  const allStats = [
    ...baseStats,
    { key: 'presenze', label: 'Presenze', value: player.presenze || player['Presenze campionato corrente'] || 'N/A' },
    { key: 'punteggio', label: 'Punteggio', value: player.punteggio || player.Punteggio || 'N/A' },
    { key: 'gol', label: 'Gol', value: player.Gol || 'N/A' },
    { key: 'assist', label: 'Assist', value: player.Assist || 'N/A' },
    { key: 'ammonizioni', label: 'Ammoniz.', value: player.Ammonizioni || 'N/A' },
    { key: 'espulsioni', label: 'Espuls.', value: player.Espulsioni || 'N/A' },
    { key: 'quotazione', label: 'Quotazione', value: player.Quotazione || 'N/A' },
    { key: 'differenza', label: 'Diff. Quot.', value: player['Differenza quotazione'] || 'N/A' }
  ];

  const statsToShow = showAllStats ? allStats : baseStats;

  // Stili base
  const cardStyle = {
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1rem',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
    // Rimuoviamo il cursor pointer dato che non è più clickabile
    ...(isInjured && {
      backgroundColor: '#fef2f2',
      borderColor: '#ef4444',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
    })
  };

  // Modifica lo stile della card basato sullo status
  const enhancedCardStyle = {
    ...cardStyle,
    borderColor: currentStatus === 'acquired' ? '#10b981' : 
                currentStatus === 'unavailable' ? '#ef4444' : 
                isInjured ? '#ef4444' : '#e5e7eb',
    backgroundColor: currentStatus === 'acquired' ? '#f0fdf4' : 
                    currentStatus === 'unavailable' ? '#fef2f2' :
                    isInjured ? '#fef2f2' : 'white'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem'
  };

  const nameStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    lineHeight: '1.3'
  };

  const roleContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
    position: 'relative'
  };

  const roleStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    color: 'white',
    backgroundColor: getRoleColor(player.Ruolo),
    textAlign: 'center',
    minWidth: '40px'
  };

  const teamStyle = {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: '0.75rem'
  };

  // Badge infortunio con alta visibilità
  const injuryBadgeStyle = {
    position: 'absolute',
    top: '0.5rem',
    left: '1.5rem',
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
    animation: 'pulse 2s infinite'
  };

  const statsStyle = {
    display: 'grid',
    gridTemplateColumns: showAllStats ? 'repeat(auto-fit, minmax(80px, 1fr))' : 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  };

  const statItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  };

  const statValueStyle = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.125rem'
  };

  const statLabelStyle = {
    fontSize: '0.625rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '500',
    lineHeight: '1'
  };

  const fantamilioniStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#dcfce7',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid #bbf7d0'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '0.5rem'
  };

  const buttonStyle = {
    flex: 1,
    padding: '0.5rem 0.75rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem'
  };

  return (
    <div style={enhancedCardStyle}>
      {/* Badge infortunio - Solo se il giocatore è infortunato */}
      {isInjured && (
        <div style={injuryBadgeStyle}>
          🩹 INFORTUNATO
        </div>
      )}
      
      {/* Header con nome, squadra e ruolo */}
      <div style={headerStyle}>
        <div style={{ flex: 1, paddingTop: isInjured ? '1.2rem' : '0' }}>
          <h3 style={nameStyle}>{player.Nome}</h3>
          <div style={teamStyle}>{player.Squadra}</div>
        </div>
        
        {/* Container per fantamilioni e ruolo in colonna */}
        <div style={roleContainerStyle}>
          {/* Fantamilioni badge (se presente) */}
          {currentStatus === 'acquired' && fantamilioni && (
            <div style={fantamilioniStyle}>
              {fantamilioni} FM
            </div>
          )}
          
          {/* Badge ruolo */}
          <div style={roleStyle}>{player.Ruolo}</div>
        </div>
      </div>

      {/* Stats dinamiche - CONTROLLATE ESTERNAMENTE */}
      <div style={statsStyle}>
        {statsToShow.map((stat, index) => (
          <div key={stat.key} style={statItemStyle}>
            <div style={statValueStyle}>
              {stat.value}
            </div>
            <div style={statLabelStyle}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={buttonContainerStyle}>
        <button
          onClick={(e) => handleButtonClick(e, 'acquired')}
          style={{
            ...buttonStyle,
            backgroundColor: currentStatus === 'acquired' ? '#10b981' : '#f0fdf4',
            color: currentStatus === 'acquired' ? 'white' : '#15803d',
            border: currentStatus === 'acquired' ? 'none' : '1px solid #bbf7d0'
          }}
          onMouseEnter={(e) => {
            if (currentStatus !== 'acquired') {
              e.target.style.backgroundColor = '#dcfce7';
            }
          }}
          onMouseLeave={(e) => {
            if (currentStatus !== 'acquired') {
              e.target.style.backgroundColor = '#f0fdf4';
            }
          }}
        >
          {currentStatus === 'acquired' ? '✓ Tuo' : '+ Compra'}
        </button>
        
        <button
          onClick={(e) => handleButtonClick(e, 'unavailable')}
          style={{
            ...buttonStyle,
            backgroundColor: currentStatus === 'unavailable' ? '#ef4444' : '#fef2f2',
            color: currentStatus === 'unavailable' ? 'white' : '#dc2626',
            border: currentStatus === 'unavailable' ? 'none' : '1px solid #fecaca'
          }}
          onMouseEnter={(e) => {
            if (currentStatus !== 'unavailable') {
              e.target.style.backgroundColor = '#fee2e2';
            }
          }}
          onMouseLeave={(e) => {
            if (currentStatus !== 'unavailable') {
              e.target.style.backgroundColor = '#fef2f2';
            }
          }}
        >
          {currentStatus === 'unavailable' ? '✗ N/D' : '✗ N/D'}
        </button>
        
        {(currentStatus === 'acquired' || currentStatus === 'unavailable') && (
          <button
            onClick={(e) => handleButtonClick(e, 'available')}
            style={{
              ...buttonStyle,
              backgroundColor: '#f8fafc',
              color: '#64748b',
              border: '1px solid #e2e8f0'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
            }}
          >
            ↺ Reset
          </button>
        )}
      </div>

      {/* Stile CSS per l'animazione pulse */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default PlayerCard;
