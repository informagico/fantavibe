// src/components/FantamilioniModal.js - Versione aggiornata con budget
import React, { useEffect, useState } from 'react';

const FantamilioniModal = ({ 
  player, 
  onConfirm, 
  onCancel,
  maxFantamilioni = 500  // NUOVO: fantamilioni massimi disponibili nel budget
}) => {
  const [fantamilioni, setFantamilioni] = useState('');
  const [error, setError] = useState('');

  // Reset quando cambia il giocatore
  useEffect(() => {
    setFantamilioni('');
    setError('');
  }, [player]);

  const handleConfirm = () => {
    const value = parseInt(fantamilioni);
    
    if (!value || value <= 0) {
      setError('Inserisci un valore valido');
      return;
    }
    
    if (value > maxFantamilioni) {
      setError(`Budget insufficiente! Disponibili: ${maxFantamilioni} FM`);
      return;
    }
    
    onConfirm(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setFantamilioni(value);
    
    // Clear error quando l'utente inizia a digitare
    if (error) {
      setError('');
    }
  };

  // Suggerimenti rapidi per i fantamilioni
  const quickAmounts = [1, 5, 10, 20, 50].filter(amount => amount <= maxFantamilioni);

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '420px',
    width: '90%',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
  };

  const headerStyle = {
    marginBottom: '20px'
  };

  const titleStyle = {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937'
  };

  const subtitleStyle = {
    margin: '0 0 4px 0',
    fontSize: '14px',
    color: '#6b7280'
  };

  const budgetInfoStyle = {
    padding: '12px',
    backgroundColor: maxFantamilioni > 0 ? '#f0fdf4' : '#fef2f2',
    borderRadius: '8px',
    border: `1px solid ${maxFantamilioni > 0 ? '#bbf7d0' : '#fecaca'}`,
    marginBottom: '16px'
  };

  const budgetTextStyle = {
    margin: 0,
    fontSize: '14px',
    color: maxFantamilioni > 0 ? '#059669' : '#dc2626',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const inputContainerStyle = {
    marginBottom: '16px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: `2px solid ${error ? '#f87171' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontWeight: '500'
  };

  const errorStyle = {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '6px',
    fontWeight: '500'
  };

  const quickButtonsStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  };

  const quickButtonStyle = {
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '12px'
  };

  const buttonStyle = {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  const confirmButtonStyle = {
    ...buttonStyle,
    backgroundColor: fantamilioni && parseInt(fantamilioni) > 0 && parseInt(fantamilioni) <= maxFantamilioni 
      ? '#10b981' 
      : '#e5e7eb',
    color: fantamilioni && parseInt(fantamilioni) > 0 && parseInt(fantamilioni) <= maxFantamilioni 
      ? 'white' 
      : '#9ca3af'
  };

  if (!player) return null;

  return (
    <div style={modalOverlayStyle} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            💰 Acquista {player.Nome}
          </h3>
          <p style={subtitleStyle}>
            {player.Squadra} • {player.Ruolo}
          </p>
        </div>

        {/* Informazioni Budget */}
        <div style={budgetInfoStyle}>
          <p style={budgetTextStyle}>
            {maxFantamilioni > 0 ? '💚' : '❌'} 
            Budget disponibile: <strong>{maxFantamilioni} fantamilioni</strong>
          </p>
        </div>

        {/* Quick Amount Buttons */}
        {quickAmounts.length > 0 && (
          <div style={quickButtonsStyle}>
            <span style={{ fontSize: '14px', color: '#6b7280', alignSelf: 'center', marginRight: '4px' }}>
              Rapido:
            </span>
            {quickAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => setFantamilioni(amount.toString())}
                style={{
                  ...quickButtonStyle,
                  backgroundColor: fantamilioni === amount.toString() ? '#3b82f6' : '#f3f4f6',
                  color: fantamilioni === amount.toString() ? 'white' : '#374151',
                  borderColor: fantamilioni === amount.toString() ? '#3b82f6' : '#d1d5db'
                }}
              >
                {amount}
              </button>
            ))}
            {maxFantamilioni >= 100 && (
              <button
                onClick={() => setFantamilioni(maxFantamilioni.toString())}
                style={{
                  ...quickButtonStyle,
                  backgroundColor: fantamilioni === maxFantamilioni.toString() ? '#3b82f6' : '#f3f4f6',
                  color: fantamilioni === maxFantamilioni.toString() ? 'white' : '#374151',
                  borderColor: fantamilioni === maxFantamilioni.toString() ? '#3b82f6' : '#d1d5db'
                }}
              >
                Max
              </button>
            )}
          </div>
        )}

        {/* Input Field */}
        <div style={inputContainerStyle}>
          <input
            type="number"
            value={fantamilioni}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Inserisci fantamilioni"
            min="1"
            max={maxFantamilioni}
            style={inputStyle}
            autoFocus
            disabled={maxFantamilioni <= 0}
          />
          {error && <div style={errorStyle}>{error}</div>}
        </div>

        {/* Action Buttons */}
        <div style={actionButtonsStyle}>
          <button
            onClick={onCancel}
            style={cancelButtonStyle}
          >
            ❌ Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={!fantamilioni || parseInt(fantamilioni) <= 0 || parseInt(fantamilioni) > maxFantamilioni || maxFantamilioni <= 0}
            style={confirmButtonStyle}
          >
            ✅ Conferma
          </button>
        </div>

        {/* Warning per budget basso */}
        {maxFantamilioni <= 0 && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#dc2626',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ⚠️ Budget esaurito! Non puoi acquistare altri giocatori.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FantamilioniModal;
