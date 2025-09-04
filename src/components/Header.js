// src/components/Header.js - Versione con gestione budget integrata
import React from 'react';
import {
  clearPlayerStatus,
  exportPlayerStatus,
  getAcquiredPlayers,
  getTotalFantamilioni
} from '../utils/storage';

const Header = ({ dataCount = 0, playerStatus = {}, budget = 500, onBudgetChange }) => {
  const totalFantamilioni = getTotalFantamilioni(playerStatus);
  const acquiredPlayers = getAcquiredPlayers(playerStatus);
  const totalAcquired = acquiredPlayers.length;
  const budgetRimanente = budget - totalFantamilioni;

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
      a.download = `fantavibe_${new Date().toISOString().split('T')[0]}.json`;
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

  const handleBudgetChange = (e) => {
    const newBudget = Math.max(0, parseInt(e.target.value) || 0);
    onBudgetChange(newBudget);
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

  const budgetSectionStyle = {
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.875rem'
  };

  const budgetInputStyle = {
    width: '80px',
    padding: '0.25rem 0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    textAlign: 'center'
  };

  const budgetDisplayStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.25rem 0.75rem',
    backgroundColor: budgetRimanente >= 0 ? '#f0fdf4' : '#fef2f2',
    borderRadius: '0.375rem',
    border: `1px solid ${budgetRimanente >= 0 ? '#bbf7d0' : '#fecaca'}`
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
            {dataCount > 0 && (
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: 'normal', 
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                padding: '0.125rem 0.5rem',
                borderRadius: '0.75rem'
              }}>
                {dataCount} giocatori
              </span>
            )}
          </h1>
          
          {/* Gestione Budget integrata */}
          {dataCount > 0 && (
            <div style={budgetSectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ color: '#64748b', fontWeight: '500' }}>Budget:</label>
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={handleBudgetChange}
                  style={budgetInputStyle}
                />
                <span style={{ color: '#9ca3af' }}>FM</span>
              </div>
              
              <div style={budgetDisplayStyle}>
                <span style={budgetTextStyle}>
                  {budgetRimanente}FM disponibili
                </span>
                <span style={{ color: '#9ca3af' }}>
                  ({totalFantamilioni}/{budget} FM)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Statistiche centrali - solo se ci sono acquisti */}
        {totalAcquired > 0 && (
          <div style={statsContainerStyle}>
            <div style={statStyle}>
              <div style={statValueStyle}>{totalAcquired}</div>
              <div style={statLabelStyle}>Acquisiti</div>
            </div>
            
            <div style={statStyle}>
              <div style={statValueStyle}>{unavailablePlayers}</div>
              <div style={statLabelStyle}>Non Disp.</div>
            </div>

            <div style={statStyle}>
              <div style={statValueStyle}>{(totalFantamilioni / totalAcquired).toFixed(1)}</div>
              <div style={statLabelStyle}>Media FM</div>
            </div>
          </div>
        )}

        {/* Azioni */}
        <div style={actionsStyle}>
          {Object.keys(playerStatus).length > 0 && (
            <>
              <button 
                onClick={handleExportData}
                style={buttonStyle}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                📥 Esporta
              </button>
              
              <button 
                onClick={handleClearAll}
                style={clearButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                }}
              >
                🗑️ Reset
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
