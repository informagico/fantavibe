import React from 'react';
import { getPlayerDetails } from '../utils/storage';
import { getExpectedGoals, getGoalsLabel, getPlayerSkills, SKILLS_MAPPING } from '../utils/dataUtils';

const PlayerCard = ({ 
  player, 
  playerStatus, 
  onStatusChange,
  onAcquire,
  showAllStats = false
}) => {
  const playerDetails = getPlayerDetails(playerStatus, player.id);
  const currentStatus = playerDetails?.status || 'available';
  const fantamilioni = playerDetails?.fantamilioni || null;

  // Controlla se il giocatore è infortunato
  const isInjured = player.Infortunato === true;

  // Skills del giocatore
  const playerSkills = getPlayerSkills(player);

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
    
    // *** Previene doppio click per acquisto ***
    if (action === 'acquired' && currentStatus === 'acquired') {
      console.log('Giocatore già acquistato, azione bloccata');
      return; // Blocca completamente l'azione
    }

    if (action === 'unavailable' && currentStatus === 'unavailable') {
      console.log('Giocatore già non disponibile, azione bloccata');
      return; // Blocca completamente l'azione
    }
    
    // Messaggio di conferma per il reset
    if (action === 'available' && (currentStatus === 'acquired' || currentStatus === 'unavailable')) {
      const statusText = currentStatus === 'acquired' ? 'acquistato' : 'non disponibile';
      if (window.confirm(`Sei sicuro di voler resettare lo stato di ${player.Nome}? Il giocatore è attualmente ${statusText}.`)) {
        handleStatusChange(action);
      }
    } else if (action === 'unavailable' && (currentStatus === 'acquired' || currentStatus === 'unavailable')) {
      const statusText = currentStatus === 'acquired' ? 'acquistato' : 'non disponibile';
      if (window.confirm(`Sei sicuro di voler rendere non disponibile lo stato di ${player.Nome}? Il giocatore è attualmente ${statusText}.`)) {
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

  // Processa il campo skills
  const processSkills = (skillsField) => {
    if (!skillsField) return [];
    
    // Se è già un array, restituiscilo così com'è
    if (Array.isArray(skillsField)) {
      return skillsField.filter(skill => skill && skill.trim() !== '');
    }
    
    if (typeof skillsField === 'string') {
      // Se la stringa sembra un array JavaScript (inizia con [ e finisce con ])
      if (skillsField.trim().startsWith('[') && skillsField.trim().endsWith(']')) {
        try {
          // Prova prima a parsare come JSON standard
          const parsed = JSON.parse(skillsField);
          if (Array.isArray(parsed)) {
            return parsed.filter(skill => skill && typeof skill === 'string' && skill.trim() !== '');
          }
        } catch (error) {
          // Se il JSON parsing fallisce, prova a convertire apici singoli in doppi
          try {
            const jsonCompatible = skillsField.replace(/'/g, '"');
            const parsed = JSON.parse(jsonCompatible);
            if (Array.isArray(parsed)) {
              return parsed
                .filter(skill => skill && typeof skill === 'string' && skill.trim() !== '')
                .map(skill => skill.trim().toUpperCase());
            }
          } catch (secondError) {
            // Se anche questo fallisce, parsing manuale sicuro
            const content = skillsField.trim().slice(1, -1); // Rimuove [ e ]
            if (content.trim()) {
              return content
                .split(',')
                .map(item => {
                  // Rimuove apici/virgolette e spazi
                  return item.trim().replace(/^['"]|['"]$/g, '');
                })
                .filter(skill => skill && skill.trim() !== '')                
                .map(skill => skill.trim().toUpperCase());
            }
          }
        }
      }
      
      // Se non è un array in formato stringa, dividi per virgola o punto e virgola
      return skillsField
        .split(/[,;]/)
        .map(skill => skill.trim().toUpperCase())
        .filter(skill => skill !== '');
    }
    
    return [];
  };

  // Estrae le skills dal player object
  const playerSkills = processSkills(player.Skills);

  // Statistiche base (sempre visibili)
  const baseStats = [
    { key: 'convenienza_pot', label: 'Convenienza Potenziale', value: player.convenienza?.toFixed(0) || 'N/A' },
    { key: 'fantamedia', label: 'Fantamedia', value: player.fantamedia?.toFixed(2) || 'N/A' }
  ];

  // Statistiche complete (visibili quando showAllStats è true)
  const expectedGoals = getExpectedGoals(player);
  const goalsLabel = getGoalsLabel(player.Ruolo);
  
  const allStats = [
    ...baseStats,
    { key: 'convenienza', label: 'Convenienza', value: player['Convenienza']?.toFixed(2) || 'N/A' },
    { key: 'punteggio', label: 'Punteggio', value: player.punteggio || player.Punteggio || 'N/A' },
    { key: 'presenze_previste', label: 'Presenze Previste', value: player['Presenze previste'] || 'N/A' },
    { key: 'presenze', label: 'Presenze AP', value: player.presenze || player['Presenze campionato corrente'] || 'N/A' },
    { key: 'gol', label: goalsLabel, value: expectedGoals !== null ? expectedGoals : 'N/A' },
    { key: 'assist', label: 'Assist Previsti', value: player['Assist previsti'] || 'N/A' },
    { key: 'buon_investimento', label: 'Buon Investimento', value: player['Buon investimento'] || 'N/A' },
    { key: 'resistenza', label: 'Resistenza Infortuni', value: player['Resistenza infortuni'] || 'N/A' },
    { key: 'nuovo_acquisto', label: 'Nuovo Acquisto', value: player['Nuovo acquisto'] === true ? 'SI' : 'NO' || 'N/A' },
    { key: 'consigliato_prox', label: 'Consigliato Prossima Giornata', value: player['Consigliato prossima giornata'] === true  ? 'SI' : 'NO' || 'N/A' },
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
    marginBottom: '0.75rem',
    height: '4.5rem',
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

  // Stili per le skills
  const skillsContainerStyle = {
    marginBottom: '1rem'
  };

  const skillsLabelStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
  };

  const skillsListStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem'
  };

  const skillBadgeStyle = {
    fontSize: '0.625rem',
    fontWeight: '500',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    backgroundColor: '#ddd6fe',
    color: '#5b21b6',
    border: '1px solid #c4b5fd',
    whiteSpace: 'nowrap'
  };

  const noSkillsStyle = {
    fontSize: '0.7rem',
    color: '#9ca3af',
    fontStyle: 'italic'
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

  // Stili per le skills
  const skillsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    marginBottom: '0.75rem'
  };

  const skillItemStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '1rem',
    cursor: 'help',
    transition: 'transform 0.2s',
    filter: 'grayscale(0.2)',
  };

  const trend = player.Trend === 'UP' ? '📈 ' : player.Trend === 'DOWN' ? '📉 ' : player.Trend === 'STABLE' ? '🟰 ' : '';

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
          <h3 style={nameStyle}>{trend}{player.Nome}</h3>
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

      {/* Skills del giocatore */}
      {playerSkills.length > 0 && (
        <div style={skillsContainerStyle}>
          {playerSkills.map((skill, index) => {
            const skillData = SKILLS_MAPPING[skill] || { emoji: '❓', description: skill };
            return (
              <span
                key={index}
                style={skillItemStyle}
                title={skillData.description}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.2)';
                  e.target.style.filter = 'grayscale(0)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.filter = 'grayscale(0.2)';
                }}
              >
                {skillData.emoji}
              </span>
            );
          })}
        </div>
      )}

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

      {/* Sezione Skills - NUOVA AGGIUNTA */}
      {playerSkills.length > 0 && (
        <div style={skillsContainerStyle}>
          <div style={skillsLabelStyle}>Skills</div>
          <div style={skillsListStyle}>
            {playerSkills.map((skill, index) => (
              <span key={index} style={skillBadgeStyle}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder per quando non ci sono skills (solo se showAllStats è true) */}
      {showAllStats && playerSkills.length === 0 && (
        <div style={skillsContainerStyle}>
          <div style={skillsLabelStyle}>Skills</div>
          <div style={noSkillsStyle}>Nopn disponibili</div>
        </div>
      )}

      {/* Action buttons - STILE IDENTICO ALL'ORIGINALE */}
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
