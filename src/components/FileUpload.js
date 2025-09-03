import React from 'react';

const FileUpload = ({ onFileUpload }) => {
  // Stili
  const containerStyle = {
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
    textAlign: 'center'
  };

  const descriptionStyle = {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  };

  const uploadContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const uploadItemStyle = {
    textAlign: 'center',
    padding: '1rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.75rem'
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    backgroundColor: '#f9fafb',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📊 Carica File Dati</h2>
      
      <p style={descriptionStyle}>
        Carica il file Excel con i dati dei giocatori per iniziare l'analisi.
      </p>
      
      <div style={uploadContainerStyle}>
        <div style={uploadItemStyle}>
          <label style={labelStyle}>
            📊 File FPEDIA
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => onFileUpload(e.target.files[0])}
            style={inputStyle}
          />
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Dati completi dei giocatori (fpedia_analysis.xlsx)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
