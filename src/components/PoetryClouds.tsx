"use client";

import { useEffect, useRef } from "react";

// Defines the size of the text grid in pixels.
// Larger values = bigger letters
const cloudPixelScale = 10;

// Cloud coverage between 0.3 (plentiful) and 0.6 (sparse).
const cloudCutOff = 0.5;

// Speed of cloud panning. Larger values make it faster.
const panSpeed = 8;

// Speed of cloud transformation over time. Larger is faster.
const cloudEvolutionSpeed = 4;

interface PoetryCloudsProps {
  className?: string;
  text?: string; // Testo personalizzato (default: le parole desiderate)
  backgroundColor?: [number, number, number]; // Colore di sfondo RGB [r, g, b]
  imageUrl?: string; // URL dell'immagine da mostrare al centro
  imageSize?: number; // Dimensione dell'immagine (larghezza)
}

export default function PoetryClouds({
  className = "",
  text = "nothing is overly defined",
  backgroundColor = [72, 21, 155], // #48159B - Viola scuro di default
  imageUrl,
  imageSize = 200,
}: PoetryCloudsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamically import p5 only on client side
    import("p5").then((p5Module) => {
      const p5 = p5Module.default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sketch = (p: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let img: any = null;
        let imageLoaded = false;

        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);

          // Load image if provided
          if (imageUrl) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            p.loadImage(imageUrl, (loadedImg: any) => {
              img = loadedImg;
              imageLoaded = true;
            });
          }
        };

        p.draw = () => {
          // Background color (neon blue by default)
          p.background(
            backgroundColor[0],
            backgroundColor[1],
            backgroundColor[2]
          );

          // Split text into words/phrases
          const words = text.toUpperCase().split(/\s+/);
          const textWithoutSpaces = words.join("");

          // Calculate positions for text (centered, left-aligned for readability)
          p.textAlign(p.LEFT, p.CENTER);
          p.textSize(cloudPixelScale * 1.15);

          const tinyTimeOffset = p.millis() / 100000;

          // Calculate total width of all words with spaces
          const spaceWidth = cloudPixelScale * 0.5;
          let totalWidth = 0;
          words.forEach((word) => {
            totalWidth += word.length * cloudPixelScale * 1.2;
            totalWidth += spaceWidth; // Add space after each word
          });
          totalWidth -= spaceWidth; // Remove last space

          const startX = p.width / 2 - totalWidth / 2;
          let currentX = startX;

          // Draw all words in sequence (left to right)
          words.forEach((word, wordIndex) => {
            const wordLength = word.length;
            const startY =
              p.height / 2 +
              (wordIndex - words.length / 2) * cloudPixelScale * 2.5;

            // Draw each letter in the word sequentially from left to right
            for (let i = 0; i < wordLength; i++) {
              const letter = word[i];
              const x = currentX;

              // Use noise to determine visibility and alpha for cloud effect
              const noiseScale = 0.01;
              const n = p.noise(
                x * noiseScale + tinyTimeOffset * panSpeed,
                startY * noiseScale + tinyTimeOffset * 0.25 * panSpeed,
                tinyTimeOffset * cloudEvolutionSpeed
              );

              // Skip if noise value is under cutoff (cloud effect)
              if (n < cloudCutOff) {
                currentX += cloudPixelScale * 1.2;
                continue;
              }

              // Use the alpha channel to fade out the edges of the clouds
              const alpha = p.map(n, cloudCutOff, 0.65, 10, 255);
              p.fill(255, alpha);

              // Draw the letter at the current position
              p.text(letter, x, startY);

              // Move to next letter position
              currentX += cloudPixelScale * 1.2;
            }

            // Add space after word (except last word)
            if (wordIndex < words.length - 1) {
              currentX += spaceWidth;
            }
          });

          // Also draw scattered letters around for cloud effect
          for (let x = 0; x <= p.width; x += cloudPixelScale) {
            for (let y = 0; y <= p.height; y += cloudPixelScale) {
              // Skip if this is near the main text area
              const isNearText =
                y > p.height / 2 - cloudPixelScale * words.length * 2.5 &&
                y < p.height / 2 + cloudPixelScale * words.length * 2.5 &&
                x > startX - cloudPixelScale * 5 &&
                x < startX + totalWidth + cloudPixelScale * 5;

              if (isNearText) {
                continue;
              }

              const tinyTimeOffsetScatter = p.millis() / 100000;
              const noiseScale = 0.01;

              const n = p.noise(
                x * noiseScale + tinyTimeOffsetScatter * panSpeed,
                y * noiseScale + tinyTimeOffsetScatter * 0.25 * panSpeed,
                tinyTimeOffsetScatter * cloudEvolutionSpeed
              );

              if (n < cloudCutOff) {
                continue;
              }

              const alpha = p.map(n, cloudCutOff, 0.65, 10, 150); // More transparent for scattered letters

              p.textAlign(p.CENTER, p.CENTER);
              p.text(getLetterForCoordinate(p, x, y, textWithoutSpaces), x, y);
            }
          }

          // Draw image in the center if provided and loaded
          if (imageLoaded && img && img.width && img.height) {
            p.push();
            p.translate(p.width / 2, p.height / 2);
            p.rotate(p.PI / 2); // Rotate 90 degrees (PI/2 radians)
            p.imageMode(p.CENTER);
            const imgWidth = imageSize;
            const imgHeight = (img.height / img.width) * imgWidth;
            p.image(img, 0, 0, imgWidth, imgHeight);
            p.pop();
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getLetterForCoordinate = (
          p: any,
          x: number,
          y: number,
          textSource: string
        ) => {
          // Use position-based hash to select character from the text
          const hash = (x + y * 1000) * p.sin(x * 0.01) * p.cos(y * 0.01);
          const index = p.abs(p.int(hash)) % textSource.length;

          // Return character from the provided text
          return textSource[index];
        };

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
      };

      // Create new p5 instance
      if (containerRef.current) {
        p5InstanceRef.current = new p5(sketch, containerRef.current);
      }
    });

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [text, backgroundColor, imageUrl, imageSize]);

  return <div ref={containerRef} className={className} />;
}
