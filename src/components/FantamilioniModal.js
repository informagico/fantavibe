// src/components/FantamilioniModal.js
import { X } from 'lucide-react';
import React, { useState } from 'react';

const FantamilioniModal = ({ 
  isOpen, 
  onClose, 
  playerName, 
  onConfirm 
}) => {
  const [fantamilioni, setFantamilioni] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validazione
    const value = parseFloat(fantamilioni);
    if (!fantamilioni || isNaN(value) || value <= 0) {
      setError('Inserisci un valore valido maggiore di 0');
      return;
    }
    
    if (value > 999) {
      setError('Il valore non può superare i 999 fantamilioni');
      return;
    }
    
    // Conferma acquisto
    onConfirm(value);
    
    // Reset del form
    setFantamilioni('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setFantamilioni('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb'
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827'
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const playerNameStyle = {
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    textAlign: 'center'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  };

  const inputStyle = {
    width: '93%',
    padding: '0.75rem',
    border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '0.875rem',
    marginTop: '0.25rem'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem'
  };

  const buttonStyle = {
    flex: 1,
    padding: '0.75rem 1rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const confirmButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#22c55e',
    color: 'white'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151'
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>Acquista Giocatore</h3>
          <button
            onClick={handleClose}
            style={closeButtonStyle}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={playerNameStyle}>
          {playerName}
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label style={labelStyle}>
              A quanti fantamilioni lo hai acquistato?
            </label>
            <input
              type="number"
              step="1"
              min="1"
              max="999"
              value={fantamilioni}
              onChange={(e) => {
                setFantamilioni(e.target.value);
                setError('');
              }}
              placeholder="es. 25"
              style={inputStyle}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = '#e5e7eb';
              }}
              autoFocus
            />
            {error && <div style={errorStyle}>{error}</div>}
          </div>

          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={handleClose}
              style={cancelButtonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            >
              Annulla
            </button>
            <button
              type="submit"
              style={confirmButtonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#16a34a'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#22c55e'}
            >
              Conferma Acquisto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FantamilioniModal;
