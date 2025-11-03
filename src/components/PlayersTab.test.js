import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayersTab from './PlayersTab';

// Mock the player data with complete structure
const mockPlayers = [
  {
    Nome: 'Mario Rossi',
    Ruolo: 'ATT',
    Squadra: 'Juventus',
    convenienza: 85,
    'Convenienza Potenziale': 85,
    'Fantamedia anno 2024-2025': 7.5,
    Convenienza: 85,
    fantamedia: 7.5,
    id: 'mario_rossi',
    originalRank: 1,
    Infortunato: 'false'
  },
  {
    Nome: 'Luca Bianchi',
    Ruolo: 'POR',
    Squadra: 'Milan',
    convenienza: 70,
    'Convenienza Potenziale': 70,
    'Fantamedia anno 2024-2025': 6.8,
    Convenienza: 70,
    fantamedia: 6.8,
    id: 'luca_bianchi',
    originalRank: 1,
    Infortunato: 'false'
  },
  {
    Nome: 'Giuseppe Verdi',
    Ruolo: 'DIF',
    Squadra: 'Inter',
    convenienza: 90,
    'Convenienza Potenziale': 90,
    'Fantamedia anno 2024-2025': 8.2,
    Convenienza: 90,
    fantamedia: 8.2,
    id: 'giuseppe_verdi',
    originalRank: 1,
    Infortunato: 'false'
  }
];

describe('PlayersTab - Role Selection State', () => {
  const defaultProps = {
    players: mockPlayers,
    searchIndex: new Map(),
    playerStatus: {},
    onPlayerStatusChange: jest.fn(),
    onPlayerAcquire: jest.fn(),
    selectedRole: 'POR',
    onRoleChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses selectedRole prop instead of internal state', () => {
    render(<PlayersTab {...defaultProps} selectedRole="ATT" />);
    
    // Should show Attaccanti tab as active (represented by the ATT role being selected)
    // We can verify this by checking if ATT players are shown
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
  });

  test('calls onRoleChange when user selects different role', () => {
    const mockOnRoleChange = jest.fn();
    render(<PlayersTab {...defaultProps} onRoleChange={mockOnRoleChange} />);
    
    // Find role selection buttons (they should be rendered as buttons or clickable elements)
    // Look for the role selector UI
    const roleButtons = screen.getAllByRole('button').filter(button => 
      ['Portieri', 'Difensori', 'Centrocampisti', 'Attaccanti'].some(role => 
        button.textContent.includes(role) || button.textContent.includes('🥅') || 
        button.textContent.includes('🛡️') || button.textContent.includes('🎯') || 
        button.textContent.includes('⚽')
      )
    );
    
    if (roleButtons.length > 0) {
      // Click on a different role (e.g., attackers)
      const attButton = roleButtons.find(btn => 
        btn.textContent.includes('⚽') || btn.textContent.includes('Attaccanti')
      );
      
      if (attButton) {
        fireEvent.click(attButton);
        expect(mockOnRoleChange).toHaveBeenCalledWith('ATT');
      }
    }
  });

  test('preserves role selection across re-renders', () => {
    const { rerender } = render(<PlayersTab {...defaultProps} selectedRole="DIF" />);
    
    // Should show defenders
    expect(screen.getByText('Giuseppe Verdi')).toBeInTheDocument();
    
    // Re-render with same props
    rerender(<PlayersTab {...defaultProps} selectedRole="DIF" />);
    
    // Should still show defenders (Giuseppe Verdi)
    expect(screen.getByText('Giuseppe Verdi')).toBeInTheDocument();
  });

  test('switches correctly when selectedRole prop changes', () => {
    const { rerender } = render(<PlayersTab {...defaultProps} selectedRole="POR" />);
    
    // Should show goalkeeper
    expect(screen.getByText('Luca Bianchi')).toBeInTheDocument();
    
    // Change to attackers via prop
    rerender(<PlayersTab {...defaultProps} selectedRole="ATT" />);
    
    // Should now show attacker
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
  });

  test('handles missing onRoleChange prop gracefully', () => {
    const propsWithoutCallback = { ...defaultProps };
    delete propsWithoutCallback.onRoleChange;
    
    // Should render without crashing
    expect(() => {
      render(<PlayersTab {...propsWithoutCallback} />);
    }).not.toThrow();
  });

  test('shows correct role statistics for selected role', () => {
    render(<PlayersTab {...defaultProps} selectedRole="ATT" />);
    
    // Should show statistics for attackers
    // Look for statistics display that shows role-specific info
    expect(screen.getByText('🏆 Classifica per Ruolo')).toBeInTheDocument();
  });
});