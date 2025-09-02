import { Filter } from 'lucide-react';
import React, { useMemo } from 'react';
import PlayerCard from './PlayerCard';

const RankingsTab = ({ data, selectedRole, onRoleChange, playerStatus, onStatusChange }) => {
  const roleNames = {
    'ATT': 'Attaccanti',
    'DIF': 'Difensori', 
    'CEN': 'Centrocampisti',
    'POR': 'Portieri'
  };

  // Top 20 giocatori per ruolo ordinati per Convenienza Potenziale
  const topPlayersByRole = useMemo(() => {
    if (!data.length) return [];
    
    return data
      .filter(player => player.Ruolo === selectedRole)
      .sort((a, b) => (b['Convenienza Potenziale'] || 0) - (a['Convenienza Potenziale'] || 0))
      .slice(0, 20);
  }, [data, selectedRole]);

  const containerStyle = {
    width: '100%'
  };

  const headerStyle = {
    marginBottom: '2rem'
  };

  const headerTitleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem'
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b'
  };

  const roleButtonsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem'
  };

  const roleButtonBaseStyle = {
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    fontWeight: '500',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const activeRoleButtonStyle = {
    ...roleButtonBaseStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  };

  const inactiveRoleButtonStyle = {
    ...roleButtonBaseStyle,
    backgroundColor: 'white',
    color: '#64748b',
    borderColor: '#e2e8f0'
  };

  const rankingTitleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1.5rem'
  };

  const rankingListStyle = {
    display: 'grid',
    gap: '1rem'
  };

  const rankedPlayerStyle = {
    position: 'relative'
  };

  const rankBadgeStyle = {
    position: 'absolute',
    left: '-0.5rem',
    top: '1rem',
    zIndex: 10,
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  };

  const playerCardContainerStyle = {
    marginLeft: '2rem'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerTitleStyle}>
          <Filter size={20} color="#64748b" />
          <h2 style={titleStyle}>Top 20 per Ruolo</h2>
        </div>
        
        <div style={roleButtonsStyle}>
          {Object.entries(roleNames).map(([role, name]) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              style={selectedRole === role ? activeRoleButtonStyle : inactiveRoleButtonStyle}
              onMouseEnter={(e) => {
                if (selectedRole !== role) {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedRole !== role) {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e2e8f0';
                }
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {topPlayersByRole.length > 0 && (
        <div>
          <h3 style={rankingTitleStyle}>
            🏆 Top 20 {roleNames[selectedRole]} - Ordinati per Convenienza Potenziale
          </h3>
          
          <div style={rankingListStyle}>
            {topPlayersByRole.map((player, index) => (
              <div key={player.id} style={rankedPlayerStyle}>
                <div style={rankBadgeStyle}>
                  {index + 1}
                </div>
                <div style={playerCardContainerStyle}>
                  <PlayerCard
                    player={player}
                    status={playerStatus[player.id] || 'none'}
                    onStatusChange={onStatusChange}
                    showRanking={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingsTab;
