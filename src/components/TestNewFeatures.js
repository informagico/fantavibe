// Test delle nuove funzionalità - per verifica manuale
import { 
  filterPlayersByRole, 
  sortPlayersByField, 
  applyAllFilters,
  getExpectedGoals,
  getGoalsLabel,
  SORT_OPTIONS,
  NUMERIC_FILTER_FIELDS,
  BOOLEAN_FILTER_FIELDS
} from '../utils/dataUtils';

// Dati di test
const testPlayers = [
  {
    id: 'player1',
    Nome: 'Test Player 1',
    Ruolo: 'CEN',
    convenienza: 8.5,
    fantamedia: 6.2,
    presenze: 20,
    punteggio: 85,
    'Gol previsti': 5,
    'Assist previsti': 8,
    'Buon investimento': 'true',
    'Nuovo acquisto': 'false',
    'Consigliato prossima giornata': 'true',
    Infortunato: 'false',
    Skills: ['Titolare', 'Assist-man', 'Nazionale']
  },
  {
    id: 'player2',
    Nome: 'Test Player 2',
    Ruolo: 'TRQ',
    convenienza: 7.2,
    fantamedia: 7.1,
    presenze: 18,
    punteggio: 78,
    'Gol previsti': 8,
    'Assist previsti': 6,
    'Buon investimento': 'false',
    'Nuovo acquisto': 'true',
    'Consigliato prossima giornata': 'false',
    Infortunato: 'false',
    Skills: ['Giovane', 'Outsider', 'Forma_Crescente']
  },
  {
    id: 'player3',
    Nome: 'Test Player 3',
    Ruolo: 'ATT',
    convenienza: 9.1,
    fantamedia: 5.8,
    presenze: 25,
    punteggio: 92,
    'Gol previsti': 12,
    'Assist previsti': 3,
    'Buon investimento': 'true',
    'Nuovo acquisto': 'false',
    'Consigliato prossima giornata': 'true',
    Infortunato: 'true',
    Skills: ['Fuoriclasse', 'Bomber', 'Rigorista']
  },
  {
    id: 'player4',
    Nome: 'Test Goalkeeper',
    Ruolo: 'POR',
    convenienza: 6.8,
    fantamedia: 6.5,
    presenze: 30,
    punteggio: 75,
    'Gol previsti': 15, // Questo sarà convertito in -15 per i portieri
    'Assist previsti': 0,
    'Buon investimento': 'true',
    'Nuovo acquisto': 'false',
    'Consigliato prossima giornata': 'false',
    Infortunato: 'false',
    Skills: ['Titolare', 'Veterano', 'Capitano']
  }
];

// Test delle funzioni
console.log('=== TEST FILTRI PER RUOLO ===');
console.log('Tutti i giocatori:', filterPlayersByRole(testPlayers, 'ALL').length);
console.log('Solo CEN:', filterPlayersByRole(testPlayers, 'CEN').length);
console.log('CEN + TRQ:', filterPlayersByRole(testPlayers, 'CEN_TRQ').length);
console.log('ATT:', filterPlayersByRole(testPlayers, 'ATT').length);

console.log('\n=== TEST ORDINAMENTO ===');
const sortedByConvenienza = sortPlayersByField(testPlayers, 'convenienza', 'desc');
console.log('Ordinati per convenienza (desc):', sortedByConvenienza.map(p => `${p.Nome}: ${p.convenienza}`));

const sortedByFantamedia = sortPlayersByField(testPlayers, 'fantamedia', 'asc');
console.log('Ordinati per fantamedia (asc):', sortedByFantamedia.map(p => `${p.Nome}: ${p.fantamedia}`));

console.log('\n=== TEST FILTRI NUMERICI ===');
const numericFilters = {
  convenienza: { min: 7.5, max: 10 },
  presenze: { min: 20, max: 30 }
};
const filteredNumeric = applyAllFilters(testPlayers, numericFilters, {});
console.log('Filtrati (convenienza 7.5-10, presenze 20-30):', filteredNumeric.map(p => p.Nome));

console.log('\n=== TEST FILTRI BOOLEANI ===');
const booleanFilters = {
  buon_investimento: true,
  infortunato: false
};
const filteredBoolean = applyAllFilters(testPlayers, {}, booleanFilters);
console.log('Filtrati (buon investimento=true, infortunato=false):', filteredBoolean.map(p => p.Nome));

console.log('\n=== CONFIGURAZIONI DISPONIBILI ===');
console.log('Opzioni di ordinamento:', SORT_OPTIONS.map(o => o.label));
console.log('Campi numerici:', NUMERIC_FILTER_FIELDS.map(f => f.label));
console.log('Campi booleani:', BOOLEAN_FILTER_FIELDS.map(f => f.label));

export default {
  testPlayers,
  filterPlayersByRole,
  sortPlayersByField,
  applyAllFilters
};