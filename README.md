# 🚀 Fantavibe - Fantacalcio Assistant

[![Netlify Status](https://api.netlify.com/api/v1/badges/d9c9ea9a-5574-4489-a836-e3476e571d62/deploy-status)](https://app.netlify.com/projects/fantavibe/deploys)

Allora, intanto ciao, qua sono io che scrivo ed é giusto fare le dovute premesse. Sta roba qua é frutto di un paio di sere di vibe coding tra me e Claude :wink: quindi prendete tutto per come sta senza troppe aspettative.

I dati per far vedere le magie li prendo qui: <https://github.com/piopy/fantacalcio-py> (bravi ragazzi, salutano sempre).
Al momento sono dati belli scolpiti dentro ad un file in `public/` ma se mai dovesse girarmi metto su un servizio per recuperare i dati in qualche altro modo, chi lo sa.

Se volete l'ho tirata su in Netlify qui: https://fantavibe.netlify.app/

Adesso vi lascio ai trip mentali dello zio Claude che chissá cosa si sará fumato prima di scrivere sto README.

## ✨ Cosa fa Fantavibe

Fantavibe è il tuo assistente personale per il fantacalcio che ti permette di:

### 🎯 **Gestione Rosa Intelligente**

- **Ricerca avanzata** dei giocatori con filtri per ruolo e nome
- **Visualizzazione classifiche** complete con statistiche dettagliate
- **Gestione stati** giocatori (disponibile, acquistato, non disponibile)
- **Tracking automatico** degli acquisti con timestamp

### 💰 **Budget Manager**

- **Controllo budget** in tempo reale con fantamilioni disponibili
- **Validazione acquisti** automatica per evitare sforamenti
- **Statistiche spesa** per ruolo e giocatore
- **Calcolo budget rimanente** dinamico

### 📊 **Analytics & Insights**

- **Dashboard rosa** con giocatori acquistati organizzati per ruolo
- **Statistiche complete** su spesa, giocatori per ruolo, media acquisti
- **Indicatori visivi** per budget e disponibilità
- **Esportazione dati** per backup e condivisione

### 🎨 **UI/UX Moderna**

- **Design responsive** ottimizzato per desktop e mobile
- **Interfaccia intuitiva** con navigazione a tab
- **Feedback visivi** per tutte le azioni utente
- **Persistenza dati** automatica con localStorage

### Stack Tecnologico

```text
Frontend Framework: React 19.1.1
Styling: Inline Styles
Data Processing: XLSX per parsing file Excel
Storage: LocalStorage per persistenza client-side
State Management: React Hooks (useState, useEffect, useMemo)
Search: Algoritmo di ricerca fuzzy custom
Build Tool: Create React App
```

## 🚀 Quick Start

### Installazione

```bash
# Clona il repository
git clone [repository-url]

# Installa le dipendenze
npm install

# Avvia l'ambiente di sviluppo
npm start
```

### Testing

```bash
# Esegui tutti i test
npm test

# Test in modalità watch per sviluppo
npm test:watch

# Verifica build
npm run build
```

### Netlify functions

Per eseguire il debug utilizzando le netlify function

```bash
npm run netlify-dev
```

### Utilizzo

1. **Carica i dati**: L'app cerca automaticamente `fpedia_analysis.xlsx` nella cartella `public/`
2. **Imposta budget**: Modifica il budget iniziale (default 500 FM)
3. **Esplora giocatori**: Usa la ricerca per trovare i giocatori desiderati
4. **Costruisci la rosa**: Acquista giocatori specificando i fantamilioni
5. **Monitora budget**: Tieni traccia delle spese in tempo reale

## 🔧 Configurazione

### File Dati

Posiziona il file Excel con i dati dei giocatori in:

```
public/fpedia_analysis.xlsx
```

Il file deve contenere colonne:

- `Nome` - Nome del giocatore
- `Ruolo` - Ruolo (POR, DIF, CEN, ATT)
- `Squadra` - Squadra di appartenenza
- Altre statistiche opzionali

### Personalizzazione Budget

Il budget iniziale è 500 FM, modificabile dall'interfaccia e salvato automaticamente.

## 🎮 Funzionalità Avanzate

### Ricerca Intelligente

- **Ricerca fuzzy** per trovare giocatori anche con errori di digitazione
- **Filtri ruolo** per navigazione rapida
- **Indicatori rank** per posizionamento in classifica
- **Modalità dettagli** per statistiche complete

### Gestione Rosa

- **Organizzazione per ruolo** automatica
- **Ordinamento per spesa** decrescente
- **Rimozione giocatori** con conferma
- **Calcolo automatico** totali e medie

### Persistenza Dati

- **Salvataggio automatico** di tutti gli acquisti
- **Migrazione dati** automatica tra versioni
- **Esportazione JSON** per backup
- **Reset completo** con conferma

## 🤝 Contribuire

Fantavibe è un progetto in continua evoluzione. I contributi sono benvenuti, purché rispettino la filosofia di semplicità e intuizione.

### Come Contribuire

1. Studia il flusso utente esistente
2. Proponi miglioramenti che seguano l'intuizione naturale
3. Mantieni il codice semplice e leggibile
4. Testa l'impatto sull'esperienza utente

---

**Sviluppato con ❤️ e Claude**

*"Il miglior codice è quello che non si nota, che fluisce naturalmente come il pensiero dell'utente"*
