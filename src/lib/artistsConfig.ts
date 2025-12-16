// Configurazione per gli artisti featured
export interface Artist {
  id: string;
  name: string;
  image: string;
  link: string;
  link2?: string; // Secondo link opzionale
  link2Label?: string; // Label per il secondo link
  description?: string;
}

export const FEATURED_ARTISTS: Artist[] = [
  {
    id: "artist1",
    name: "Marco Bruno",
    image: "/artists/artist1.jpg",
    link: "https://www.marcobruno.net",
    link2Label: "SoundCloud",
    description:
      "A sound narrative in its purest form. From Tresor to TEDx, Marco blends electronics, emotion, and philosophy through a unique vision that transcends genres. With releases on Helena Hauff's label and several others across the electronic music panorama, he also runs his own  Evighet Records, a multi-disciplinary lab of identity and evolution.",
  },
  {
    id: "artist2",
    name: "Velvet May",
    image: "/artists/artist2.png",
    link: "https://instagram.com/velvetxmay",
    link2: "https://linktr.ee/velvetmay",
    link2Label: "Linktree",
    description:
      "Jagged edges of electronic body music meet fractured breakbeats and off-kilter rhythms, with subtle cinematic color and a propulsive energy that nods to the bold new wave sounds of the ’80s and the adventurous electronic explorations of the ’90s. As a versatile live performer, singer, and DJ, Velvet May moves beyond the ordinary, blending experimentation, meticulous sound design, and rhythmic tension that reflects the ever-shifting frontiers of electronic music. His sonic identity is a collision of Industrial grit, evocative Body Music, and raw Rock intensity — an independent form that intertwines psychedelic inflections and breakbeat pulse into its DNA.",
  },
];

// Funzione per ottenere tutti gli artisti
export const getFeaturedArtists = (): Artist[] => {
  return FEATURED_ARTISTS;
};

// Funzione per ottenere un artista specifico
export const getArtistById = (id: string): Artist | undefined => {
  return FEATURED_ARTISTS.find((artist) => artist.id === id);
};
