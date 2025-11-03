import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';

describe('Header Component', () => {
  const defaultProps = {
    dataCount: 500,
    playerStatus: {},
    budget: 500,
    onBudgetChange: jest.fn(),
    dataUpdateInfo: null
  };

  const mockPlayerStatusWithAcquisitions = {
    'player1': { status: 'acquired', fantamilioni: 100, timestamp: '2023-01-01' },
    'player2': { status: 'acquired', fantamilioni: 75, timestamp: '2023-01-02' },
    'player3': { status: 'unavailable', timestamp: '2023-01-03' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders title correctly', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('⚽ Fantavibe')).toBeInTheDocument();
  });

  test('displays correct data count', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('500 giocatori caricati')).toBeInTheDocument();
  });

  test('displays budget input with correct value', () => {
    render(<Header {...defaultProps} />);
    const budgetInput = screen.getByDisplayValue('500');
    expect(budgetInput).toBeInTheDocument();
    expect(budgetInput).toHaveAttribute('type', 'number');
  });

  test('calls onBudgetChange when budget input changes', () => {
    const mockOnBudgetChange = jest.fn();
    render(<Header {...defaultProps} onBudgetChange={mockOnBudgetChange} />);
    
    const budgetInput = screen.getByDisplayValue('500');
    fireEvent.change(budgetInput, { target: { value: '600' } });
    
    expect(mockOnBudgetChange).toHaveBeenCalledWith(600);
  });

  test('handles non-numeric budget input', () => {
    const mockOnBudgetChange = jest.fn();
    render(<Header {...defaultProps} onBudgetChange={mockOnBudgetChange} />);
    
    const budgetInput = screen.getByDisplayValue('500');
    fireEvent.change(budgetInput, { target: { value: 'abc' } });
    
    expect(mockOnBudgetChange).toHaveBeenCalledWith(0);
  });

  test('displays correct budget statistics', () => {
    render(<Header {...defaultProps} playerStatus={mockPlayerStatusWithAcquisitions} />);
    
    // Check acquired players count
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 acquired players
    
    // Check total spent
    expect(screen.getByText('175')).toBeInTheDocument(); // 100 + 75 fantamilioni
    
    // Check unavailable players count
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 unavailable player
    
    // Check average spent per player (175/2 = 87.5 rounded to 88)
    expect(screen.getByText('88')).toBeInTheDocument();
  });

  test('displays remaining budget correctly', () => {
    render(<Header {...defaultProps} playerStatus={mockPlayerStatusWithAcquisitions} />);
    
    // Budget 500 - spent 175 = remaining 325
    expect(screen.getByText('325 FM')).toBeInTheDocument();
  });

  test('shows negative remaining budget in red when overspent', () => {
    const overspentProps = {
      ...defaultProps,
      budget: 100, // Budget less than spent (175)
      playerStatus: mockPlayerStatusWithAcquisitions
    };
    
    render(<Header {...overspentProps} />);
    
    // Should show -75 FM (100 - 175)
    expect(screen.getByText('-75 FM')).toBeInTheDocument();
  });

  test('handles zero acquired players', () => {
    const emptyPlayerStatus = {
      'player1': { status: 'unavailable', timestamp: '2023-01-01' }
    };
    
    render(<Header {...defaultProps} playerStatus={emptyPlayerStatus} />);
    
    // Check that acquired players count is 0 (multiple 0s exist, so use more specific check)
    const acquiredLabel = screen.getByText('Acquistati');
    const acquiredStat = acquiredLabel.parentElement.querySelector('[style*="1.25rem"]');
    expect(acquiredStat).toHaveTextContent('0');
    
    // Check that average is 0 when no players acquired
    const averageLabel = screen.getByText('Media Acquisto');
    const averageStat = averageLabel.parentElement.querySelector('[style*="1.25rem"]');
    expect(averageStat).toHaveTextContent('0');
  });

  test('renders export and reset buttons', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('💾 Esporta')).toBeInTheDocument();
    expect(screen.getByText('🗑️ Reset')).toBeInTheDocument();
  });

  test('displays data update info when provided', () => {
    const dataUpdateInfo = {
      source: 'github',
      fileInfo: {
        lastModified: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    };
    
    render(<Header {...defaultProps} dataUpdateInfo={dataUpdateInfo} />);
    
    // Should show update time info
    expect(screen.getByText(/🔄 1h fa/)).toBeInTheDocument();
  });

  test('handles missing data update info gracefully', () => {
    render(<Header {...defaultProps} dataUpdateInfo={null} />);
    
    // Should not crash and still render other elements
    expect(screen.getByText('⚽ Fantavibe')).toBeInTheDocument();
  });

  test('plural form for single player', () => {
    const singlePlayerProps = {
      ...defaultProps,
      dataCount: 1
    };
    
    render(<Header {...singlePlayerProps} />);
    expect(screen.getByText('1 giocatore caricato')).toBeInTheDocument();
  });

  test('export button is clickable', () => {
    render(<Header {...defaultProps} playerStatus={mockPlayerStatusWithAcquisitions} />);
    
    const exportButton = screen.getByText('💾 Esporta');
    expect(exportButton).toBeInTheDocument();
    expect(exportButton.tagName).toBe('BUTTON');
    
    // Simple click test without complex DOM mocking
    fireEvent.click(exportButton);
    // Button clicked successfully without errors
  });
});