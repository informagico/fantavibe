import { AlertCircle, Upload } from 'lucide-react';
import React from 'react';

const FileUpload = ({ onFileUpload, error }) => {
  const containerStyle = {
    backgroundColor: '#fef3c7',
    borderBottom: '2px solid #f59e0b',
    padding: '1.5rem'
  };

  const contentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem'
  };

  const textStyle = {
    flex: 1
  };

  const titleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#92400e',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const errorStyle = {
    fontSize: '0.875rem',
    color: '#dc2626',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const uploadGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  };

  const uploadItemStyle = {
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '8px',
    border: '2px dashed #d97706',
    textAlign: 'center'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#92400e',
    marginBottom: '0.5rem'
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    fontSize: '0.875rem',
    color: '#64748b',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '0.5rem',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <Upload size={24} color="#d97706" style={{ marginTop: '0.25rem', flexShrink: 0 }} />
        
        <div style={textStyle}>
          <h3 style={titleStyle}>
            Carica i file Excel per iniziare l'analisi
          </h3>
          
          {error && (
            <div style={errorStyle}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div style={uploadGridStyle}>
            <div style={uploadItemStyle}>
              <label style={labelStyle}>
                📊 File FPEDIA
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => onFileUpload(e.target.files[0], 'fpedia')}
                style={inputStyle}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Dati di base dei giocatori
              </p>
            </div>
            
            <div style={uploadItemStyle}>
              <label style={labelStyle}>
                ⚡ File FSTATS
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => onFileUpload(e.target.files[0], 'fstats')}
                style={inputStyle}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Statistiche avanzate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
