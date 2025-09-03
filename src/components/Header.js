// src/components/Header.js - Versione aggiornata con gestione props corretta
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
    padding: '1.5rem 0',
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

  const titleStyle = {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  const statsContainerStyle = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  };

  const statStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '80px'
  };

  const statValueStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#3b82f6',
    margin: 0
  };

  const statLabelStyle = {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    margin: 0,
    marginTop: '0.25rem',
    textAlign: 'center'
  };

  const actionsStyle = {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
        {/* Titolo */}
        <div>
          <h1 style={titleStyle}>
            ⚽ Fantacalcio Analyzer
          </h1>
          {dataCount > 0 && (
            <p style={{ 
              margin: 0, 
              color: '#64748b', 
              fontSize: '0.875rem',
              marginTop: '0.25rem'
            }}>
              {dataCount} giocatori caricati
            </p>
          )}
        </div>

        {/* Statistiche */}
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
              {totalFantamilioni}
            </div>
            <div style={statLabelStyle}>Fantamilioni</div>
          </div>
        </div>

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
