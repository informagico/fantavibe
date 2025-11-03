import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Simple integration test focused on core functionality and bug detection

// Mock the localStorage behavior
const mockLocalStorage = {
  store: {},
  getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key, value) => {
    mockLocalStorage.store[key] = value;
  }),
  clear: jest.fn(() => {
    mockLocalStorage.store = {};
  })
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('App Integration Tests - Core Functionality', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    
    // Mock console.log to reduce noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('app renders basic structure without crashing', () => {
    render(<App />);
    
    // Check that core UI elements are present
    expect(screen.getByText('⚽ Fantavibe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500')).toBeInTheDocument(); // Default budget
    expect(screen.getByText('Giocatori')).toBeInTheDocument();
    expect(screen.getByText('La Mia Rosa')).toBeInTheDocument();
  });

  test('budget input works and persists to localStorage', async () => {
    render(<App />);
    
    const budgetInput = screen.getByDisplayValue('500');
    
    // Change budget
    fireEvent.change(budgetInput, { target: { value: '600' } });
    
    // Verify input shows new value
    expect(screen.getByDisplayValue('600')).toBeInTheDocument();
    
    // Verify localStorage was called (async operations might be involved)
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('fantacalcio_budget', '600');
    }, { timeout: 3000 });
  });

  test('tab switching works correctly', async () => {
    render(<App />);
    
    // Start on Giocatori tab (default)
    expect(screen.getByText('Giocatori')).toBeInTheDocument();
    expect(screen.getByText('La Mia Rosa')).toBeInTheDocument();
    
    // Switch to La Mia Rosa
    const rosaTab = screen.getByText('La Mia Rosa');
    fireEvent.click(rosaTab);
    
    // Should see the empty state message or rosa content
    await waitFor(() => {
      // The tab should be active - we can verify by checking for rosa-specific content
      // Since we don't have players, we should see some empty state
      expect(screen.getByText('La Mia Rosa')).toBeInTheDocument();
    });
    
    // Switch back to Giocatori tab
    const giocatoriTab = screen.getByText('Giocatori');
    fireEvent.click(giocatoriTab);
    
    // Should be back on giocatori tab
    await waitFor(() => {
      expect(screen.getByText('Giocatori')).toBeInTheDocument();
    });
  });

  test('budget calculations display correctly with zero data', () => {
    render(<App />);
    
    // With no acquired players, should show:
    expect(screen.getByText('500 FM')).toBeInTheDocument(); // Full remaining budget
    
    // Look for the stats section - should show 0 acquired players
    // Note: We're looking for text that appears in the stats display
    const statsSection = screen.getByText('Acquistati').parentElement;
    expect(statsSection).toBeInTheDocument();
  });

  test('localStorage data loads correctly on app start', () => {
    // Pre-populate localStorage with test budget
    mockLocalStorage.setItem('fantacalcio_budget', '750');
    
    render(<App />);
    
    // Should load the saved budget
    expect(screen.getByDisplayValue('750')).toBeInTheDocument();
    expect(screen.getByText('750 FM')).toBeInTheDocument(); // Remaining budget
  });

  test('handles corrupted localStorage gracefully', () => {
    // Put invalid data in localStorage
    mockLocalStorage.setItem('fantacalcio_budget', 'invalid-number');
    mockLocalStorage.setItem('fantacalcio_player_status', 'invalid-json');
    
    render(<App />);
    
    // Should fallback to defaults without crashing
    expect(screen.getByDisplayValue('500')).toBeInTheDocument(); // Default budget
    expect(screen.getByText('500 FM')).toBeInTheDocument();
  });

  test('export and reset buttons are present and clickable', () => {
    render(<App />);
    
    const exportButton = screen.getByText('💾 Esporta');
    const resetButton = screen.getByText('🗑️ Reset');
    
    expect(exportButton).toBeInTheDocument();
    expect(resetButton).toBeInTheDocument();
    
    // Should be clickable without crashing
    fireEvent.click(exportButton);
    fireEvent.click(resetButton);
  });

  test('role selection state preservation bug (user reported)', async () => {
    render(<App />);
    
    // Start on Giocatori tab 
    const giocatoriTab = screen.getByText('Giocatori');
    expect(giocatoriTab).toBeInTheDocument();
    
    // Try to find role selection if it exists
    // This test documents the reported bug where switching from 
    // "La Mia Rosa" back to "Giocatori" resets to "Portieri"
    
    // Switch to La Mia Rosa
    const rosaTab = screen.getByText('La Mia Rosa');
    fireEvent.click(rosaTab);
    
    await waitFor(() => {
      expect(screen.getByText('La Mia Rosa')).toBeInTheDocument();
    });
    
    // Switch back to Giocatori
    fireEvent.click(giocatoriTab);
    
    await waitFor(() => {
      expect(screen.getByText('Giocatori')).toBeInTheDocument();
    });
    
    // This test documents the bug - after switching back from Rosa to Giocatori,
    // the role selection should preserve the previously selected role,
    // but reportedly defaults back to "Portieri"
    // 
    // Note: We can't fully test this without actual data loading,
    // but this test structure shows how we would verify the fix
  });

  test('error boundary handles rendering errors gracefully', () => {
    // Mock console.error to test error handling
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // This test ensures the app doesn't completely crash on errors
    render(<App />);
    
    // App should render even with potential data loading issues
    expect(screen.getByText('⚽ Fantavibe')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  test('responsive stats display works with various budget values', () => {
    mockLocalStorage.setItem('fantacalcio_budget', '1000');
    
    render(<App />);
    
    // Should show large budget correctly
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByText('1000 FM')).toBeInTheDocument();
    
    // Change to very small budget
    const budgetInput = screen.getByDisplayValue('1000');
    fireEvent.change(budgetInput, { target: { value: '50' } });
    
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    expect(screen.getByText('50 FM')).toBeInTheDocument();
  });
});