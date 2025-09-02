import { Award, Minus, TrendingDown, TrendingUp, UserCheck, UserX } from 'lucide-react';
import React from 'react';

const PlayerCard = ({ player, status, onStatusChange }) => {
  const fstats = player.fstatsData;

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const playerInfoStyle = {
    flex: 1,
    minWidth: '200px'
  };

  const nameStyle = {
    fontSize: '1.375rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '0.5rem'
  };

  const detailsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  };

  const roleBadgeStyle = {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontSize: '0.875rem',
    borderRadius: '6px',
    fontWeight: '500'
  };

  const teamStyle = {
    color: '#64748b',
    fontWeight: '500'
  };

  const trendIconStyle = {
    display: 'flex',
    alignItems: 'center'
  };

  const statusButtonsStyle = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const statusButtonStyle = {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'transparent'
  };

  const mineButtonStyle = {
    ...statusButtonStyle,
    backgroundColor: status === 'mine' ? '#dcfce7' : '#f8fafc',
    color: status === 'mine' ? '#166534' : '#64748b',
    borderColor: status === 'mine' ? '#16a34a' : '#e2e8f0'
  };

  const othersButtonStyle = {
    ...statusButtonStyle,
    backgroundColor: status === 'others' ? '#fee2e2' : '#f8fafc',
    color: status === 'others' ? '#dc2626' : '#64748b',
    borderColor: status === 'others' ? '#ef4444' : '#e2e8f0'
  };

  const statusBadgeStyle = {
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600'
  };

  const mineStatusStyle = {
    ...statusBadgeStyle,
    backgroundColor: '#dcfce7',
    color: '#166534'
  };

  const othersStatusStyle = {
    ...statusBadgeStyle,
    backgroundColor: '#fee2e2',
    color: '#dc2626'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    marginBottom: '1.25rem'
  };

  const statCardStyle = {
    textAlign: 'center',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid'
  };

  const statCards = {
    purple: { ...statCardStyle, backgroundColor: '#faf5ff', borderColor: '#e9d5ff' },
    blue: { ...statCardStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
    green: { ...statCardStyle, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    yellow: { ...statCardStyle, backgroundColor: '#fefce8', borderColor: '#fde047' }
  };

  const statValueStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem'
  };

  const statValues = {
    purple: { ...statValueStyle, color: '#7c3aed' },
    blue: { ...statValueStyle, color: '#2563eb' },
    green: { ...statValueStyle, color: '#16a34a' },
    yellow: { ...statValueStyle, color: '#ca8a04' }
  };

  const statLabelStyle = {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500'
  };

  const advancedStatsStyle = {
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginTop: '1rem'
  };

  const advancedTitleStyle = {
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const advancedGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '0.75rem'
  };

  const skillsStyle = {
    marginTop: '1rem'
  };

  const skillsTitleStyle = {
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem'
  };

  const skillsGridStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  };

  const skillBadgeStyle = {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    fontSize: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #c7d2fe'
  };

  const getTrendIcon = () => {
    if (player.Trend === 'UP') return <TrendingUp size={16} color="#16a34a" />;
    if (player.Trend === 'DOWN') return <TrendingDown size={16} color="#dc2626" />;
    return <Minus size={16} color="#ca8a04" />;
  };

  const parseSkills = () => {
    try {
      if (!player.Skills) return [];
      return JSON.parse(player.Skills.replace(/'/g, '"'));
    } catch {
      return [];
    }
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      <div style={headerStyle}>
        <div style={playerInfoStyle}>
          <h3 style={nameStyle}>{player.Nome || 'Nome non disponibile'}</h3>
          <div style={detailsStyle}>
            <span style={roleBadgeStyle}>{player.Ruolo}</span>
            <span style={teamStyle}>{player.Squadra}</span>
            <div style={trendIconStyle}>{getTrendIcon()}</div>
          </div>
        </div>
        
        <div style={statusButtonsStyle}>
          <button
            onClick={() => onStatusChange(player.id, status === 'mine' ? 'none' : 'mine')}
            style={mineButtonStyle}
            title="Acquistato da me"
          >
            <UserCheck size={16} />
          </button>
          
          <button
            onClick={() => onStatusChange(player.id, status === 'others' ? 'none' : 'others')}
            style={othersButtonStyle}
            title="Acquistato da altri"
          >
            <UserX size={16} />
          </button>
          
          {status !== 'none' && (
            <span style={status === 'mine' ? mineStatusStyle : othersStatusStyle}>
              {status === 'mine' ? 'Mio' : 'Altri'}
            </span>
          )}
        </div>
      </div>

      <div style={statsGridStyle}>
        <div style={statCards.purple}>
          <div style={statValues.purple}>
            {player['Convenienza Potenziale'] || 'N/A'}
          </div>
          <div style={statLabelStyle}>Conv. Potenziale</div>
        </div>
        
        <div style={statCards.blue}>
          <div style={statValues.blue}>
            {player['Fantamedia anno 2024-2025'] || 'N/A'}
          </div>
          <div style={statLabelStyle}>Fantamedia 2024-25</div>
        </div>
        
        <div style={statCards.green}>
          <div style={statValues.green}>
            {player['Presenze campionato corrente'] || 'N/A'}
          </div>
          <div style={statLabelStyle}>Presenze</div>
        </div>
        
        <div style={statCards.yellow}>
          <div style={statValues.yellow}>
            {player.Punteggio || 'N/A'}
          </div>
          <div style={statLabelStyle}>Punteggio</div>
        </div>
      </div>

      {fstats && (
        <div style={advancedStatsStyle}>
          <h4 style={advancedTitleStyle}>
            <Award size={16} />
            Statistiche Avanzate (FStats)
          </h4>
          <div style={advancedGridStyle}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                {fstats.goals || 0}
              </div>
              <div style={statLabelStyle}>Gol</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                {fstats.assists || 0}
              </div>
              <div style={statLabelStyle}>Assist</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                {fstats.fanta_avg?.toFixed(2) || 'N/A'}
              </div>
              <div style={statLabelStyle}>Fanta Media</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
                {fstats.mins_played || 0}
              </div>
              <div style={statLabelStyle}>Min. Giocati</div>
            </div>
          </div>
        </div>
      )}

      {parseSkills().length > 0 && (
        <div style={skillsStyle}>
          <h4 style={skillsTitleStyle}>🎯 Caratteristiche</h4>
          <div style={skillsGridStyle}>
            {parseSkills().map((skill, idx) => (
              <span key={idx} style={skillBadgeStyle}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
