# Configurazione Supabase per Flowgeist

## 1. Crea un account Supabase

1. Vai su [supabase.com](https://supabase.com)
2. Clicca "Start your project"
3. Crea un account o accedi con GitHub
4. Crea un nuovo progetto

## 2. Configura il Database

### Crea la tabella `tracks`

Nel SQL Editor di Supabase, esegui questo codice:

```sql
-- Crea la tabella tracks
CREATE TABLE tracks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  duration VARCHAR(10) NOT NULL,
  audio_file TEXT NOT NULL,
  waveform TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Abilita Row Level Security (RLS)
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Crea policy per permettere tutte le operazioni (per ora)
CREATE POLICY "Allow all operations" ON tracks FOR ALL USING (true);

-- Crea trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 3. Ottieni le credenziali

1. Vai su **Settings** > **API**
2. Copia:
   - **Project URL** (es: `https://your-project.supabase.co`)
   - **anon public** key

## 4. Configura le variabili d'ambiente

Crea un file `.env.local` nella root del progetto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 5. Inserisci i dati di esempio

Nel SQL Editor, esegui:

```sql
INSERT INTO tracks (title, duration, audio_file, waveform) VALUES
('Void You Hide', '4:32', '/audio/track1.wav', '/waveforms/track1.png'),
('The Scarecrow', '3:45', '/audio/track2.wav', '/waveforms/track2.png'),
('Fatal Faith', '5:18', '/audio/track3.wav', '/waveforms/track3.png'),
('Like a Bug', '4:07', '/audio/track4.wav', '/waveforms/track4.png'),
('Veiled Strophes', '6:23', '/audio/track5.wav', '/waveforms/track5.png'),
('Amarcord', '3:58', '/audio/track6.wav', '/waveforms/track6.png'),
('Prophets of Lies', '4:51', '/audio/track7.wav', '/waveforms/track7.png'),
('Vanished Swan', '5:34', '/audio/track8.wav', '/waveforms/track8.png'),
('Meaningful Quest', '7:12', '/audio/track9.wav', '/waveforms/track9.png');
```

## 6. Testa l'applicazione

1. Riavvia il server di sviluppo: `npm run dev`
2. Vai su `http://localhost:3000`
3. Le tracce dovrebbero essere caricate dal database

## Funzionalità disponibili

- ✅ **GET /api/tracks** - Recupera tutte le tracce
- ✅ **POST /api/tracks** - Crea una nuova traccia
- ✅ **PUT /api/tracks** - Aggiorna una traccia
- ✅ **DELETE /api/tracks** - Elimina una traccia
- ✅ **Pagina admin** - Gestione completa delle tracce
- ✅ **Pagina principale** - Visualizzazione e riproduzione

## Prossimi passi

1. **Upload file**: Implementare l'upload dei file audio su Supabase Storage
2. **Autenticazione**: Aggiungere login per l'admin
3. **Waveform**: Generare automaticamente le waveform
4. **Caching**: Implementare caching per migliorare le performance 