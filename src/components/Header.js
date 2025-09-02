import { Star, UserCheck, UserX } from 'lucide-react';
import React from 'react';

const Header = ({ dataCount, playerStatus }) => {
  const myPlayersCount = Object.values(playerStatus).filter(s => s === 'mine').length;
  const othersPlayersCount = Object.values(playerStatus).filter(s => s === 'others').length;

  const headerStyle = {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const contentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1.5rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const titleStyle = {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  const statsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    fontSize: '0.875rem',
    color: '#64748b'
  };

  const badgeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontWeight: '500'
  };

  const greenBadgeStyle = {
    ...badgeStyle,
    backgroundColor: '#dcfce7',
    color: '#166534'
  };

  const redBadgeStyle = {
    ...badgeStyle,
    backgroundColor: '#fee2e2',
    color: '#dc2626'
  };

  return (
    <div style={headerStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>
          <Star size={28} color="#f59e0b" />
          Fantapippo
        </h1>
        
        <div style={statsStyle}>
          <span>
            <strong>{dataCount}</strong> giocatori caricati
          </span>
          
          {myPlayersCount > 0 && (
            <span style={greenBadgeStyle}>
              <UserCheck size={16} />
              {myPlayersCount} miei
            </span>
          )}
          
          {othersPlayersCount > 0 && (
            <span style={redBadgeStyle}>
              <UserX size={16} />
              {othersPlayersCount} altri
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
