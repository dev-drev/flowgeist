"use client";

import PoetryClouds from "@/components/PoetryClouds";

export default function TestPage() {
  // Il testo di default ora è "nothing is overly defined flowgeist"
  // Le lettere visualizzate nelle nuvole saranno solo quelle di queste parole
  // Puoi cambiarlo se vuoi:
  // text="FLOWGEIST" - solo questa parola
  // text="nothing is overly defined flowgeist" - le parole originali
  const customText = "nothing is overly defined flowgeist";

  return (
    <main className="flex min-h-screen w-full relative">
      <PoetryClouds
        className="fixed inset-0 z-0"
        text={customText}
        imageUrl="/artists/art4.jpeg"
        imageSize={300}
      />
    </main>
  );
}
