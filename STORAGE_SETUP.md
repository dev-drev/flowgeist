# Configurazione Supabase Storage per Upload File Audio

## 1. Crea il Bucket di Storage

Nel tuo progetto Supabase:

1. **Vai su "Storage"** nel menu laterale
2. **Clicca "Create a new bucket"**
3. **Nome bucket**: `audio-files`
4. **Pubblica**: ✅ Sì (per permettere accesso pubblico ai file)
5. **Clicca "Create bucket"**

## 2. Configura le Policy di Storage

Nel bucket `audio-files`, vai su **Policies** e aggiungi queste policy:

### Policy per Upload (INSERT)
```sql
-- Permette upload di file audio
CREATE POLICY "Allow audio uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'audio-files' AND 
  (storage.extension(name))::text IN ('mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a')
);
```

### Policy per Download (SELECT)
```sql
-- Permette download pubblico dei file
CREATE POLICY "Allow public audio downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'audio-files');
```

### Policy per Delete (DELETE)
```sql
-- Permette eliminazione dei file (opzionale)
CREATE POLICY "Allow audio deletion" ON storage.objects
FOR DELETE USING (bucket_id = 'audio-files');
```

## 3. Testa l'Upload

1. **Vai su**: `http://localhost:3001/admin`
2. **Usa il componente "Upload Nuovo File Audio"**
3. **Seleziona un file audio** dal tuo Mac
4. **Compila titolo e durata** (opzionale)
5. **Clicca per uploadare**

## 4. Verifica i File

Nel dashboard Supabase:
- **Storage** → **audio-files** → Dovresti vedere i file caricati
- **Table Editor** → **tracks** → Dovresti vedere i metadati salvati

## 5. Funzionalità Disponibili

- ✅ **Upload file audio** (MP3, WAV, FLAC, AAC, OGG, M4A)
- ✅ **Progress bar** durante l'upload
- ✅ **Validazione file** (solo audio)
- ✅ **Salvataggio automatico** nel database
- ✅ **URL pubblici** per la riproduzione
- ✅ **Gestione errori** completa

## 6. Struttura File

I file vengono salvati come:
```
audio-files/
├── audio/
│   ├── 1703123456789-abc123.mp3
│   ├── 1703123456790-def456.wav
│   └── ...
```

## 7. Limitazioni

- **Dimensione massima**: 50MB per file (configurabile)
- **Formati supportati**: MP3, WAV, FLAC, AAC, OGG, M4A
- **Storage gratuito**: 1GB (piano gratuito Supabase)

## 8. Prossimi Passi

1. **Waveform generation**: Generare automaticamente le waveform
2. **Compressione audio**: Ottimizzare i file per il web
3. **CDN**: Configurare CDN per migliori performance
4. **Autenticazione**: Proteggere l'upload con login 