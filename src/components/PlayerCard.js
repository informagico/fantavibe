// src/components/PlayerCard.js - Fix per il problema di sovrapposizione badge
import React from 'react';
import { getPlayerDetails } from '../utils/storage';

const PlayerCard = ({ 
  player, 
  playerStatus, 
  onStatusChange,
  onAcquire
}) => {
  const playerDetails = getPlayerDetails(playerStatus, player.id);
  const currentStatus = playerDetails?.status || 'available';
  const fantamilioni = playerDetails?.fantamilioni || null;

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'acquired' && onAcquire) {
      onAcquire(player);
    } else {
      onStatusChange(player.id, newStatus);
    }
  };

  // Stili base
  const cardStyle = {
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1rem',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden'
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

  // SOLUZIONE: Sposta il badge ruolo più a destra per fare spazio ai fantamilioni
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

  const statsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem'
  };

  const statItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '6px'
  };

  const statValueStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937'
  };

  const statLabelStyle = {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.25rem'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem'
  };

  const buttonStyle = {
    flex: 1,
    padding: '0.5rem',
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

  // SOLUZIONE: Posiziona i fantamilioni sopra il badge ruolo
  const fantamilioniStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    backgroundColor: '#10b981',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    whiteSpace: 'nowrap'
  };

  // Status indicator
  const statusIndicatorStyle = {
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    height: '4px',
    backgroundColor: getStatusColor(currentStatus),
    borderRadius: '12px 12px 0 0'
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

  // Modifica lo stile della card basato sullo status
  const enhancedCardStyle = {
    ...cardStyle,
    borderColor: currentStatus === 'acquired' ? '#10b981' : 
                currentStatus === 'unavailable' ? '#ef4444' : '#e5e7eb',
    backgroundColor: currentStatus === 'acquired' ? '#f0fdf4' : 
                    currentStatus === 'unavailable' ? '#fef2f2' : 'white'
  };

  return (
    <div style={enhancedCardStyle}>
      {/* Status indicator */}
      <div style={statusIndicatorStyle} />
      
      {/* Header con nome, team e badge*/}
      <div style={headerStyle}>
        <div>
          <h3 style={nameStyle}>{player.Nome}</h3>
          <div style={teamStyle}>{player.Squadra}</div>
        </div>
        
        {/* SOLUZIONE: Container per fantamilioni e ruolo in colonna */}
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

      {/* Stats */}
      <div style={statsStyle}>
        <div style={statItemStyle}>
          <div style={statValueStyle}>
            {player.convenienza ? player.convenienza.toFixed(1) : 'N/A'}
          </div>
          <div style={statLabelStyle}>Convenienza</div>
        </div>
        
        <div style={statItemStyle}>
          <div style={statValueStyle}>
            {player.fantamedia ? player.fantamedia.toFixed(1) : 'N/A'}
          </div>
          <div style={statLabelStyle}>Fantamedia</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={buttonContainerStyle}>
        <button
          onClick={() => handleStatusChange('acquired')}
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
          {currentStatus === 'acquired' ? '✓ Acquistato' : '+ Acquista'}
        </button>
        
        <button
          onClick={() => handleStatusChange('unavailable')}
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
          {currentStatus === 'unavailable' ? '✗ Non Disp.' : '✗ Non Disp.'}
        </button>
        
        {(currentStatus === 'acquired' || currentStatus === 'unavailable') && (
          <button
            onClick={() => handleStatusChange('available')}
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
    </div>
  );
};

export default PlayerCard;
