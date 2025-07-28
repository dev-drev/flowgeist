# Multi-Deploy Setup - Flowgeist

Questo documento spiega come configurare deploy multipli di Flowgeist con brand diversi.

## Configurazione Brand

Il sito ora supporta la personalizzazione del brand name tramite la variabile d'ambiente `NEXT_PUBLIC_BRAND_NAME`.

### Brand Attuali Supportati:

- **AD 93** (default)
- **PAN** (per il nuovo deploy)

## Setup per Deploy Multipli

### 1. Deploy Originale (AD 93)

- URL: `https://flowgeist.vercel.app` (o il tuo URL attuale)
- Configurazione: `NEXT_PUBLIC_BRAND_NAME=AD 93`

### 2. Deploy PAN

- URL: `https://pan-flowgeist.vercel.app` (o il nuovo URL)
- Configurazione: `NEXT_PUBLIC_BRAND_NAME=PAN`

## Configurazione Vercel

### Per il Deploy PAN:

1. **Crea un nuovo progetto su Vercel:**

   - Vai su [Vercel Dashboard](https://vercel.com/dashboard)
   - Clicca "New Project"
   - Importa il repository Flowgeist

2. **Configura le Environment Variables:**

   - Vai su Settings > Environment Variables
   - Aggiungi:
     ```
     NEXT_PUBLIC_BRAND_NAME=PAN
     ```
   - Aggiungi anche tutte le altre variabili d'ambiente necessarie (Firebase, Cloudinary, etc.)

3. **Deploy:**
   - Il progetto verrà deployato automaticamente
   - Il nuovo URL mostrerà "PAN | DEMOS" invece di "AD 93 | DEMOS"

### Variabili d'Ambiente Necessarie:

```bash
# Brand configuration
NEXT_PUBLIC_BRAND_NAME=PAN

# Firebase configuration (usa le stesse del progetto originale)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Cloudinary configuration (usa le stesse del progetto originale)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Test Locale

Per testare localmente il brand PAN:

1. Crea un file `.env.local` nella root del progetto:

   ```bash
   NEXT_PUBLIC_BRAND_NAME=PAN
   ```

2. Riavvia il server di sviluppo:

   ```bash
   npm run dev
   ```

3. Verifica che il sito mostri "PAN | DEMOS" invece di "AD 93 | DEMOS"

## Note Importanti

- Entrambi i deploy useranno lo stesso database Firebase e Cloudinary
- I file audio e le analytics saranno condivisi tra i due deploy
- Solo il brand name cambierà tra i due siti
- Assicurati di configurare correttamente tutte le variabili d'ambiente su Vercel
