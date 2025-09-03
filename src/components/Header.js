// src/components/Header.js - Versione con budget integrato e meno invadente
import React from 'react';
import {
  clearPlayerStatus,
  exportPlayerStatus,
  getAcquiredPlayers,
  getTotalFantamilioni
} from '../utils/storage';

const Header = ({ dataCount = 0, playerStatus = {} }) => {
  const totalFantamilioni = getTotalFantamilioni(playerStatus);
  const acquiredPlayers = getAcquiredPlayers(playerStatus);
  const totalAcquired = acquiredPlayers.length;
  
  // Budget predefinito (500 FM)
  const budgetTotale = 500;
  const budgetRimanente = budgetTotale - totalFantamilioni;

  // Calcola giocatori per status
  const unavailablePlayers = Object.values(playerStatus).filter(
    status => status.status === 'unavailable'
  ).length;

  const handleExportData = () => {
    try {
      const exportData = exportPlayerStatus(playerStatus);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fantacalcio_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Errore durante l\'esportazione dei dati');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Sei sicuro di voler cancellare tutti i dati? Questa operazione non può essere annullata.')) {
      clearPlayerStatus();
      window.location.reload();
    }
  };

  // Stili
  const headerStyle = {
    backgroundColor: 'white',
    borderBottom: '2px solid #e2e8f0',
    padding: '1rem 0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  };

  const leftSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  };

  const titleStyle = {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  const budgetBarStyle = {
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.875rem',
    color: '#64748b'
  };

  const progressBarStyle = {
    width: '120px',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden'
  };

  const progressFillStyle = {
    height: '100%',
    backgroundColor: budgetRimanente >= 0 ? '#10b981' : '#ef4444',
    width: `${Math.min(100, Math.max(0, (totalFantamilioni / budgetTotale) * 100))}%`,
    transition: 'all 0.3s ease'
  };

  const budgetTextStyle = {
    fontWeight: '600',
    color: budgetRimanente >= 0 ? '#059669' : '#dc2626'
  };

  const statsContainerStyle = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const statStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px'
  };

  const statValueStyle = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#3b82f6',
    margin: 0
  };

  const statLabelStyle = {
    fontSize: '0.7rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    margin: 0,
    marginTop: '0.125rem',
    textAlign: 'center'
  };

  const actionsStyle = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  };

  const buttonStyle = {
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  };

  const clearButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc2626',
    color: 'white',
    borderColor: '#dc2626'
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        {/* Sezione sinistra - Titolo e Budget */}
        <div style={leftSectionStyle}>
          <h1 style={titleStyle}>
            ⚽ Fantavibe
          </h1>
          
          {/* Budget integrato - solo se ci sono dati */}
          {dataCount > 0 && (
            <div style={budgetBarStyle}>
              <span>Budget:</span>
              <div style={progressBarStyle}>
                <div style={progressFillStyle}></div>
              </div>
              <span style={budgetTextStyle}>
                {budgetRimanente}FM / {budgetTotale}FM
              </span>
              {dataCount > 0 && (
                <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                  • {dataCount} giocatori
                </span>
              )}
            </div>
          )}
        </div>

        {/* Statistiche centrali - solo se ci sono acquisti */}
        {totalAcquired > 0 && (
          <div style={statsContainerStyle}>
            <div style={statStyle}>
              <div style={statValueStyle}>{totalAcquired}</div>
              <div style={statLabelStyle}>Acquistati</div>
            </div>
            
            <div style={statStyle}>
              <div style={statValueStyle}>{unavailablePlayers}</div>
              <div style={statLabelStyle}>Non Disp.</div>
            </div>
            
            <div style={statStyle}>
              <div style={{ ...statValueStyle, color: '#dc2626' }}>
                {totalFantamilioni}FM
              </div>
              <div style={statLabelStyle}>Spesi</div>
            </div>
          </div>
        )}

        {/* Azioni */}
        <div style={actionsStyle}>
          <button 
            onClick={handleExportData}
            style={buttonStyle}
            title="Esporta i dati per backup"
          >
            💾 Esporta
          </button>
          
          <button 
            onClick={handleClearAll}
            style={clearButtonStyle}
            title="Cancella tutti i dati salvati"
          >
            🗑️ Reset
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
