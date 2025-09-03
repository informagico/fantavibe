// src/components/BudgetDisplay.js
import React, { useState } from 'react';
import { getBudgetStats } from '../utils/storage';

const BudgetDisplay = ({ 
  budget, 
  playerStatus, 
  onBudgetChange 
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  
  const stats = getBudgetStats(budget, playerStatus);
  
  return (
    <>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💰 Budget Fantacalcio
          </h2>
          <button
            onClick={() => setShowEditModal(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ⚙️ Modifica
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '12px' 
        }}>
          {/* Budget Totale */}
          <div style={{ 
            textAlign: 'center', 
            padding: '16px 12px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#3b82f6',
              marginBottom: '4px'
            }}>
              {stats.totalBudget}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Budget Totale
            </div>
          </div>
          
          {/* Spesi */}
          <div style={{ 
            textAlign: 'center', 
            padding: '16px 12px', 
            backgroundColor: '#fef2f2', 
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#dc2626',
              marginBottom: '4px'
            }}>
              {stats.totalSpent}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Spesi
            </div>
          </div>
          
          {/* Disponibili */}
          <div style={{ 
            textAlign: 'center', 
            padding: '16px 12px', 
            backgroundColor: stats.remainingBudget >= 0 ? '#f0fdf4' : '#fef2f2', 
            borderRadius: '8px',
            border: `1px solid ${stats.remainingBudget >= 0 ? '#bbf7d0' : '#fecaca'}`
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: stats.remainingBudget >= 0 ? '#059669' : '#dc2626',
              marginBottom: '4px'
            }}>
              {stats.remainingBudget}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Disponibili
            </div>
          </div>
          
          {/* Giocatori */}
          <div style={{ 
            textAlign: 'center', 
            padding: '16px 12px', 
            backgroundColor: '#fffbeb', 
            borderRadius: '8px',
            border: '1px solid #fed7aa'
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#d97706',
              marginBottom: '4px'
            }}>
              {stats.playersCount}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Giocatori
            </div>
          </div>
          
          {/* Utilizzo Budget */}
          <div style={{ 
            textAlign: 'center', 
            padding: '16px 12px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '8px',
            border: '1px solid #d1d5db'
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#374151',
              marginBottom: '4px'
            }}>
              {stats.budgetUtilization}%
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Utilizzo
            </div>
          </div>
          
          {/* Media per Giocatore */}
          {stats.playersCount > 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '16px 12px', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '8px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#0284c7',
                marginBottom: '4px'
              }}>
                {stats.averageSpentPerPlayer}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                Media/Gioc.
              </div>
            </div>
          )}
        </div>
        
        {/* Barra di progresso budget */}
        {stats.totalBudget > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                Utilizzo Budget
              </span>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                {stats.budgetUtilization}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(stats.budgetUtilization, 100)}%`,
                backgroundColor: stats.budgetUtilization > 90 ? '#dc2626' : 
                               stats.budgetUtilization > 70 ? '#f59e0b' : '#10b981',
                transition: 'all 0.3s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Modal per modificare il budget */}
      {showEditModal && (
        <BudgetEditModal
          currentBudget={budget}
          minBudget={stats.totalSpent}
          onConfirm={(newBudget) => {
            onBudgetChange(newBudget);
            setShowEditModal(false);
          }}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

// Modal per modificare il budget
const BudgetEditModal = ({ currentBudget, minBudget, onConfirm, onCancel }) => {
  const [value, setValue] = useState(currentBudget.toString());
  
  const handleConfirm = () => {
    const newBudget = parseInt(value);
    if (newBudget >= minBudget && newBudget > 0) {
      onConfirm(newBudget);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const isValid = value && parseInt(value) >= minBudget && parseInt(value) > 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '20px', 
          fontWeight: '600',
          color: '#1f2937'
        }}>
          🔧 Modifica Budget
        </h3>
        
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #fbbf24'
        }}>
          <p style={{ 
            margin: '0', 
            fontSize: '14px', 
            color: '#92400e',
            lineHeight: '1.4'
          }}>
            <strong>💡 Spesa attuale:</strong> {minBudget} fantamilioni<br/>
            Il nuovo budget deve essere almeno <strong>{minBudget} FM</strong>
          </p>
        </div>
        
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Nuovo budget"
          min={minBudget}
          style={{
            width: '100%',
            padding: '12px',
            border: `2px solid ${isValid ? '#d1d5db' : '#fca5a5'}`,
            borderRadius: '8px',
            fontSize: '16px',
            marginBottom: '16px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          autoFocus
        />
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            ❌ Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: isValid ? '#3b82f6' : '#e5e7eb',
              color: isValid ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              cursor: isValid ? 'pointer' : 'not-allowed',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            ✅ Salva
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetDisplay;
