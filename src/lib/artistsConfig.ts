// Configurazione per gli artisti featured
export interface Artist {
  id: string;
  name: string;
  image: string;
  link: string;
  description?: string;
}

export const FEATURED_ARTISTS: Artist[] = [
  {
    id: "artist1",
    name: "Marco Bruno",
    image: "/artists/artist1.jpg",
    link: "https://www.marcobruno.net",
    description:
      "A sound narrative in its purest form. From Tresor to TEDx, Marco blends electronics, emotion, and philosophy through a unique vision that transcends genres. With releases on Helena Hauff’s label and several others across the electronic music panorama, he also runs his own  Evighet Records, a multi-disciplinary lab of identity and evolution.",
  },
  {
    id: "artist2",
    name: "Velvet May",
    image: "/artists/artist2.png",
    link: "https://soundcloud.com/artist2",
    description:
      "Ambient sound designer crafting immersive sonic landscapes. Specializes in creating polyhedral textures that merge seamlessly with momentum-driven compositions.",
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
