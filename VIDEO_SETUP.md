# 🎬 Configurazione Video Locale - Flowgeist

## Perché usare video locali?

I video caricati da Vercel/Firebase possono essere lenti. Usando video locali ottieni:
- ⚡ **Caricamento istantaneo**
- 📱 **Migliore performance mobile**
- 💾 **Nessun costo di banda**
- 🔄 **Fallback intelligente**

## 📁 Struttura delle cartelle

```
public/
├── videos/
│   ├── output1.mp4
│   ├── output2.mp4
│   ├── output3.mp4
│   ├── output4.mp4
│   └── output5.mp4 (video principale)
```

## 🚀 Come configurare

### 1. Crea la cartella videos
```bash
mkdir -p public/videos
```

### 2. Sposta i tuoi video
Copia i tuoi file video nella cartella `public/videos/`:
- `output1.mp4`
- `output2.mp4`
- `output3.mp4`
- `output4.mp4`
- `output5.mp4` (video principale)

### 3. Ottimizza i video
Per performance ottimali:
- **Formato**: MP4 con codec H.264
- **Risoluzione**: 1920x1080 o inferiore
- **Bitrate**: 2-5 Mbps
- **Durata**: 10-30 secondi (loop)

### 4. Verifica il caricamento
Il sistema ora:
1. ✅ Prova prima il video locale (veloce)
2. ⚠️ Se non trova il locale, usa Firebase
3. 🔄 Fallback automatico se entrambi falliscono

## 🎯 Configurazione avanzata

### Cambiare video principale
Modifica `src/lib/videoConfig.ts`:
```typescript
mainVideo: {
  localPath: "/videos/tuo-video.mp4",
  firebasePath: "tuo-video.mp4"
}
```

### Aggiungere nuovi video
```typescript
videos: {
  tuoVideo: {
    localPath: "/videos/tuo-video.mp4",
    firebasePath: "tuo-video.mp4"
  }
}
```

## 📊 Performance

| Fonte | Tempo di caricamento | Affidabilità |
|-------|---------------------|--------------|
| **Locale** | ⚡ < 1 secondo | 🟢 Alta |
| **Firebase** | 🐌 3-10 secondi | 🟡 Media |
| **Vercel** | 🐌 5-15 secondi | 🟡 Media |

## 🔧 Troubleshooting

### Video non si carica
1. Verifica che il file esista in `public/videos/`
2. Controlla la console del browser per errori
3. Verifica il formato del file (deve essere MP4)

### Video troppo grande
1. Comprimi il video con HandBrake o FFmpeg
2. Riduci la risoluzione
3. Usa un bitrate più basso

### Fallback a Firebase
Se vedi "⚠️ Local video not found", il sistema userà automaticamente Firebase come backup.

## 🎵 Note aggiuntive

- I video sono configurati per essere riprodotti al 10% della velocità normale
- Il video è capovolto verticalmente (`scaleY(-1)`)
- Preload è impostato su "auto" per caricamento più veloce 