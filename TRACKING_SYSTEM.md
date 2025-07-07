# Sistema di Tracking per Flowgeist

## Panoramica

Il sistema di tracking implementato permette di monitorare l'interazione degli utenti con le canzoni del sito Flowgeist. Raccoglie dati dettagliati su click, download, visualizzazioni e informazioni sulla provenienza degli utenti.

## Funzionalità

### 1. Tracking degli Eventi

- **Click**: Quando un utente clicca su una canzone
- **Download**: Quando un utente scarica una canzone
- **View**: Quando una canzone entra nel viewport (viene visualizzata)

### 2. Informazioni Raccolte

Per ogni evento, il sistema raccoglie:

#### Informazioni Base

- ID e titolo della traccia
- Tipo di azione (click/download/view)
- Timestamp dell'evento
- Session ID univoco

#### Informazioni Utente

- User Agent (browser, sistema operativo, dispositivo)
- IP address (per geolocalizzazione)
- Referrer (da dove proviene l'utente)
- UTM parameters (per tracking marketing)

#### Informazioni Geografiche

- Paese
- Regione/Città
- Coordinate (lat/lon)
- ISP (Internet Service Provider)

## Architettura

### Frontend

- **Hook `useTracking`**: Gestisce l'invio degli eventi
- **Componente `AnalyticsWidget`**: Visualizza statistiche in tempo reale
- **Pagina Analytics**: Dashboard completa con filtri e grafici

### Backend

- **API `/api/tracking`**: Riceve e salva gli eventi
- **API `/api/analytics`**: Recupera e aggrega i dati per le statistiche

### Database

- **Firebase Firestore**: Collezione `tracking` per gli eventi
- Struttura dati ottimizzata per query e aggregazioni

## Implementazione

### 1. Hook di Tracking

```typescript
const { trackClick, trackDownload, trackView } = useTracking();

// Esempio di utilizzo
trackClick(track.id, track.title);
```

### 2. API Endpoint

```typescript
// POST /api/tracking
{
  trackId: number,
  trackTitle: string,
  action: 'click' | 'download' | 'view',
  userAgent: string,
  referrer: string,
  timestamp: number
}
```

### 3. Dashboard Analytics

- Statistiche in tempo reale
- Filtri per periodo e tipo di azione
- Top tracce, paesi, browser
- Tabella dettagliata degli eventi

## Configurazione

### Variabili d'Ambiente

Assicurati di avere configurato Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Regole Firestore

Configura le regole di sicurezza per la collezione `tracking`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tracking/{document} {
      allow read, write: if true; // Per sviluppo
      // In produzione, implementa autenticazione appropriata
    }
  }
}
```

## Utilizzo

### 1. Accesso alla Dashboard

- Vai su `/admin/analytics` per la dashboard completa
- Il widget analytics è disponibile nella pagina admin principale

### 2. Filtri Disponibili

- **Periodo**: 1 giorno, 7 giorni, 30 giorni, 90 giorni
- **Azione**: Tutte, Click, Download, Visualizzazioni

### 3. Metriche Visualizzate

- **Eventi Totali**: Somma di click, download e visualizzazioni
- **Top Tracce**: Le canzoni più interagite
- **Top Paesi**: Provenienza geografica degli utenti
- **Top Browser**: Browser più utilizzati
- **Top Referrer**: Fonti di traffico

## Privacy e GDPR

### Dati Raccolti

- Il sistema raccoglie solo dati necessari per l'analytics
- Gli IP vengono utilizzati solo per geolocalizzazione
- Non vengono raccolti dati personali identificabili

### Compliance

- Implementare cookie banner per il consenso
- Fornire opzione di opt-out
- Documentare la policy sulla privacy

## Estensioni Future

### Possibili Miglioramenti

1. **Real-time Updates**: WebSocket per aggiornamenti in tempo reale
2. **Advanced Analytics**: Funnel analysis, conversion tracking
3. **A/B Testing**: Test di diverse versioni delle tracce
4. **Export Data**: Funzionalità di export CSV/Excel
5. **Email Reports**: Report automatici via email
6. **Heatmaps**: Visualizzazione delle aree più cliccate

### Integrazioni

- Google Analytics 4
- Facebook Pixel
- Custom attribution models
- CRM integration

## Troubleshooting

### Problemi Comuni

1. **Eventi non salvati**: Verifica la configurazione Firebase
2. **Geolocalizzazione non funziona**: Controlla l'API IP geolocation
3. **Dashboard vuota**: Verifica le regole Firestore
4. **Performance lente**: Implementa paginazione per grandi dataset

### Debug

- Controlla i log del browser per errori di tracking
- Verifica le chiamate API nella Network tab
- Controlla i log di Firebase per errori di scrittura

## Supporto

Per problemi o domande sul sistema di tracking:

1. Controlla i log di errore
2. Verifica la configurazione Firebase
3. Testa le API endpoints manualmente
4. Controlla la documentazione Firebase
