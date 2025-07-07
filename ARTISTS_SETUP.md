# 🎵 Configurazione Artisti Featured - Flowgeist

## Panoramica

La sezione "Featured Artists" è stata aggiunta sotto il paragrafo principale del sito. Mostra due artisti con foto profilo e link ai loro profili.

## 📁 Struttura delle cartelle

```
public/
├── artists/
│   ├── artist1.jpg
│   └── artist2.jpg
```

## 🎯 Come personalizzare

### 1. Aggiungi le foto degli artisti

Copia le foto degli artisti nella cartella `public/artists/`:
- `artist1.jpg` - Foto del primo artista
- `artist2.jpg` - Foto del secondo artista

**Specifiche consigliate:**
- **Formato**: JPG o PNG
- **Dimensioni**: 200x200px (minimo)
- **Forma**: Quadrata (verrà ritagliata in cerchio)
- **Peso**: < 100KB per performance ottimali

### 2. Modifica la configurazione

Apri `src/lib/artistsConfig.ts` e personalizza:

```typescript
export const FEATURED_ARTISTS: Artist[] = [
  {
    id: "artist1",
    name: "Nome Artista Uno",
    image: "/artists/artist1.jpg",
    link: "https://soundcloud.com/tuo-artista-uno",
    description: "Descrizione opzionale"
  },
  {
    id: "artist2", 
    name: "Nome Artista Due",
    image: "/artists/artist2.jpg",
    link: "https://soundcloud.com/tuo-artista-due",
    description: "Descrizione opzionale"
  }
];
```

### 3. Personalizza i link

Puoi usare qualsiasi piattaforma:
- **SoundCloud**: `https://soundcloud.com/username`
- **Spotify**: `https://open.spotify.com/artist/...`
- **Bandcamp**: `https://artist.bandcamp.com`
- **Instagram**: `https://instagram.com/username`
- **YouTube**: `https://youtube.com/@username`

## 🎨 Design e animazioni

### Caratteristiche visive:
- **Foto profilo**: Cerchio con bordo semi-trasparente
- **Hover effect**: Bordo più visibile al passaggio del mouse
- **Animazioni**: Entrata progressiva con delay
- **Responsive**: Si adatta a mobile e desktop
- **Modal popup**: Clicca sui cerchi per aprire bio e links

### Fallback automatico:
Se una foto non si carica, viene mostrata un'immagine placeholder con l'iniziale dell'artista.

## 🎭 Modal degli Artisti

### Funzionalità:
- **Clic sui cerchi**: Apre una modal con bio e links
- **Chiusura**: Pulsante X, clic fuori, o tasto ESC
- **Design**: Sfondo sfocato con modal centrata
- **Animazioni**: Entrata/uscita fluide con spring animation

### Contenuto della modal:
- **Foto profilo grande** (96x96px mobile, 128x128px desktop)
- **Nome artista** in grande
- **Bio/descrizione** dettagliata
- **Pulsante "View Profile"** che apre il link esterno

## 📱 Pannello Espandibile

### Funzionalità:
- **Posizione**: Fisso in basso, sempre visibile
- **Attivazione**: Clicca sui cerchi degli artisti nella sezione in alto
- **Altezza**: 60px chiuso, auto aperto
- **Animazioni**: Espansione fluida con durata 0.5s

### Contenuto del pannello:
- **Header**: Titolo "Featured Artists" + pulsante X per chiudere
- **Layout**: Card singola con foto grande + info dettagliate
- **Foto**: 96x96px mobile, 128x128px desktop
- **Info**: Nome grande + bio completa + pulsante "Visit Profile"

### Interazioni:
- **Apertura**: Clic sui cerchi degli artisti
- **Chiusura**: Pulsante X, tasto ESC, o clic fuori
- **Hover effects**: Su tutti i pulsanti
- **Responsive**: Si adatta perfettamente a tutti i dispositivi

## 📱 Responsive design

| Schermo | Dimensioni foto | Spaziatura |
|---------|----------------|------------|
| **Mobile** | 64x64px | 24px |
| **Desktop** | 80x80px | 24px |

## 🔧 Aggiungere più artisti

Per aggiungere un terzo artista:

1. **Aggiungi la foto**: `public/artists/artist3.jpg`

2. **Aggiorna la configurazione**:
```typescript
export const FEATURED_ARTISTS: Artist[] = [
  // ... artisti esistenti
  {
    id: "artist3",
    name: "Terzo Artista",
    image: "/artists/artist3.jpg",
    link: "https://soundcloud.com/terzo-artista"
  }
];
```

3. **Il layout si adatterà automaticamente** per mostrare tutti gli artisti.

## 🎵 Esempi di configurazione

### Artisti techno/electronic:
```typescript
{
  name: "Aphex Twin",
  link: "https://soundcloud.com/aphextwin"
},
{
  name: "Squarepusher", 
  link: "https://soundcloud.com/squarepusher"
}
```

### Artisti ambient/experimental:
```typescript
{
  name: "Brian Eno",
  link: "https://open.spotify.com/artist/7MSUfLeTdDEoZiJPDSBXgi"
},
{
  name: "Tim Hecker",
  link: "https://timhecker.bandcamp.com"
}
```

## 🚀 Performance

- **Lazy loading**: Le immagini si caricano solo quando necessarie
- **Fallback**: Placeholder automatico se l'immagine non si carica
- **Ottimizzazione**: Dimensioni ridotte per caricamento veloce

## 🎯 Note aggiuntive

- La sezione appare solo se ci sono artisti configurati
- I link si aprono in una nuova tab
- Le animazioni sono sincronizzate con il resto del sito
- Il design mantiene la coerenza con il tema Flowgeist 