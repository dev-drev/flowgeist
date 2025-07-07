# Configurazione Firestore per Flowgeist

## Problema Attuale

L'errore `NOT_FOUND: 5` indica che Firestore non è configurato correttamente nel progetto Firebase.

## Soluzione

### 1. Abilita Firestore nel Progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/project/flowgeist-9b443)
2. Seleziona il progetto `flowgeist-9b443`
3. Nel menu laterale, clicca su **"Firestore Database"**
4. Se non è ancora abilitato, clicca su **"Create database"**
5. Scegli la modalità:
   - **Test mode** (per sviluppo) - permette lettura/scrittura senza autenticazione
   - **Production mode** (per produzione) - richiede regole di sicurezza

### 2. Configurazione Test Mode (Sviluppo)

Se scegli test mode, le regole saranno automaticamente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. Configurazione Production Mode (Produzione)

Se scegli production mode, dovrai configurare le regole di sicurezza:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permetti accesso alla collezione tracking
    match /tracking/{document} {
      allow read, write: if true; // Per ora, in futuro implementa autenticazione
    }
    
    // Permetti accesso alla collezione test
    match /test/{document} {
      allow read, write: if true;
    }
  }
}
```

### 4. Test della Connessione

1. Vai su `/admin`
2. Clicca su **"Test Firestore"**
3. Verifica che il test sia riuscito

### 5. Struttura del Database

Il sistema creerà automaticamente queste collezioni:

#### Collezione `tracking`
Documenti con struttura:
```javascript
{
  trackId: number,
  trackTitle: string,
  action: 'click' | 'download' | 'play' | 'view',
  userAgent: {
    browser: string,
    os: string,
    device: string
  },
  referrer: string,
  ip: string,
  geoInfo: {
    country: string,
    city: string,
    region: string,
    lat: number,
    lon: number,
    isp: string
  },
  timestamp: Timestamp,
  sessionId: string,
  pageUrl: string,
  utmSource: string,
  utmMedium: string,
  utmCampaign: string
}
```

#### Collezione `test`
Documenti temporanei per i test di connessione.

## Troubleshooting

### Errore "NOT_FOUND: 5"
- **Causa**: Firestore non abilitato o regole di sicurezza troppo restrittive
- **Soluzione**: Abilita Firestore e configura le regole in test mode

### Errore "Permission denied"
- **Causa**: Regole di sicurezza non permettono l'accesso
- **Soluzione**: Aggiorna le regole per permettere read/write

### Errore "Database not found"
- **Causa**: Progetto Firebase non configurato correttamente
- **Soluzione**: Verifica la configurazione del progetto

## Variabili d'Ambiente

Assicurati di avere queste variabili nel file `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=flowgeist-9b443.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=flowgeist-9b443
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=flowgeist-9b443.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=257769831802
NEXT_PUBLIC_FIREBASE_APP_ID=1:257769831802:web:466d66201eb2ee43e02ac3
```

## Prossimi Passi

1. **Abilita Firestore** nel progetto Firebase
2. **Testa la connessione** usando il pulsante "Test Firestore"
3. **Verifica il tracking** cliccando su alcune tracce
4. **Controlla i dati** nella dashboard analytics

Una volta configurato correttamente, il sistema di tracking funzionerà perfettamente! 🚀 