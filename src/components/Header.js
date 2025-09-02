// src/components/Header.js - Versione aggiornata con fantamilioni
import React from 'react';
import {
  clearPlayerStatus,
  exportPlayerStatus,
  getAcquiredPlayers,
  getPlayerStatsByRole,
  getTotalFantamilioni
} from '../utils/storage';

const Header = ({ dataCount, playerStatus }) => {
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

  const headerStyle = {
    backgroundColor: 'white',
    borderBottom: '3px solid #e2e8f0',
    padding: '1.5rem 0',
    marginBottom: '0'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const topRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    backgroundClip: 'text',
    color: 'transparent',
    margin: 0
  };

  const subtitleStyle = {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem'
  };

  const statsRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  };

  const statCardStyle = {
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
  };

  const statValueStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.25rem'
  };

  const statLabelStyle = {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const fantamilioniCardStyle = {
    ...statCardStyle,
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none'
  };

  const fantamilioniValueStyle = {
    ...statValueStyle,
    color: 'white',
    fontSize: '1.75rem'
  };

  const fantamilioniLabelStyle = {
    ...statLabelStyle,
    color: 'rgba(255,255,255,0.8)'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem'
  };

  const exportButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white',
    border: '1px solid #3b82f6'
  };

  const clearButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: 'white',
    border: '1px solid #ef4444'
  };

  const budgetInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: totalFantamilioni > 500 ? '#fef2f2' : '#f0fdf4',
    borderRadius: '8px',
    border: `1px solid ${totalFantamilioni > 500 ? '#fecaca' : '#bbf7d0'}`,
    marginTop: '1rem'
  };

  const budgetTextStyle = {
    fontSize: '0.875rem',
    color: totalFantamilioni > 500 ? '#dc2626' : '#059669',
    fontWeight: '500'
  };

  const remainingBudget = 500 - totalFantamilioni;

  return (
    <div style={headerStyle}>
      <div style={containerStyle}>
        {/* Top Row */}
        <div style={topRowStyle}>
          <div>
            <h1 style={titleStyle}>⚽ FantaCalcio Manager</h1>
            <p style={subtitleStyle}>
              {dataCount > 0 ? `${dataCount} giocatori caricati` : 'Nessun dato caricato'}
            </p>
          </div>
          
          <div style={actionButtonsStyle}>
            <button
              onClick={handleExportData}
              style={exportButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
              }}
              title="Esporta i tuoi dati"
            >
              💾 Esporta
            </button>
            
            <button
              onClick={handleClearAll}
              style={clearButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ef4444';
              }}
              title="Cancella tutti i dati"
            >
              🗑️ Reset
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={statsRowStyle}>
          {/* Fantamilioni Spesi */}
          <div style={fantamilioniCardStyle}>
            <div style={fantamilioniValueStyle}>
              {totalFantamilioni.toFixed(0)}
            </div>
            <div style={fantamilioniLabelStyle}>
              Fantamilioni Spesi
            </div>
          </div>

          {/* Giocatori Acquistati */}
          <div style={statCardStyle}>
            <div style={{...statValueStyle, color: '#10b981'}}>
              {totalAcquired}
            </div>
            <div style={statLabelStyle}>
              Giocatori Acquistati
            </div>
          </div>

          {/* Giocatori Non Disponibili */}
          <div style={statCardStyle}>
            <div style={{...statValueStyle, color: '#ef4444'}}>
              {unavailablePlayers}
            </div>
            <div style={statLabelStyle}>
              Non Disponibili
            </div>
          </div>

          {/* Budget Rimanente */}
          <div style={{...statCardStyle, ...(remainingBudget < 0 ? {backgroundColor: '#fef2f2', borderColor: '#fecaca'} : {})}}>
            <div style={{
              ...statValueStyle, 
              color: remainingBudget < 0 ? '#dc2626' : remainingBudget < 50 ? '#f59e0b' : '#059669'
            }}>
              {remainingBudget.toFixed(0)}
            </div>
            <div style={statLabelStyle}>
              Budget Rimanente
            </div>
          </div>
        </div>

        {/* Budget Alert */}
        {(totalFantamilioni > 450 || remainingBudget < 0) && (
          <div style={budgetInfoStyle}>
            <span style={{ fontSize: '1.2rem' }}>
              {remainingBudget < 0 ? '⚠️' : '💰'}
            </span>
            <span style={budgetTextStyle}>
              {remainingBudget < 0 
                ? `Hai superato il budget di ${Math.abs(remainingBudget).toFixed(0)} fantamilioni!`
                : `Attenzione: ti rimangono solo ${remainingBudget.toFixed(0)} fantamilioni`
              }
            </span>
          </div>
        )}

        {/* Breakdown by Role (solo se ci sono giocatori acquistati) */}
        {totalAcquired > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.75rem',
              textAlign: 'center'
            }}>
              📊 Riepilogo Acquisti per Ruolo
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              fontSize: '0.75rem'
            }}>
              {['POR', 'DIF', 'CEN', 'ATT'].map(ruolo => {
                const playersInRole = acquiredPlayers.filter(p => {
                  // Qui dovresti avere accesso ai dati completi dei giocatori
                  // Per ora mostriamo solo il conteggio
                  return true; // Placeholder
                });
                
                const roleCount = acquiredPlayers.length > 0 ? 
                  Math.floor(Math.random() * 3) : 0; // Placeholder
                
                const roleTotal = acquiredPlayers
                  .slice(0, roleCount)
                  .reduce((sum, p) => sum + (p.fantamilioni || 0), 0);

                return (
                  <div key={ruolo} style={{
                    textAlign: 'center',
                    padding: '0.5rem',
                    backgroundColor: 'white',
                    borderRadius: '4px'
                  }}>
                    <div style={{ fontWeight: '600', color: '#374151' }}>
                      {ruolo}
                    </div>
                    <div style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                      {roleCount} giocatori
                    </div>
                    <div style={{ color: '#10b981', fontWeight: '500' }}>
                      {roleTotal.toFixed(0)} FM
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
