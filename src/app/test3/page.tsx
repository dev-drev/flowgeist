"use client";

import { useEffect, useRef } from "react";

export default function Test3Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p5InstanceRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import p5 only on client side
    import("p5").then((p5Module) => {
      const p5 = p5Module.default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sketch = (p: any) => {
        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);
          p.pixelDensity(1);
          p.background(0);

          // Establish a range of values on the complex plane
          // Different width values change the zoom level
          const w = 4;
          const h = (w * p.height) / p.width;

          // Start at negative half the width and height
          const xMin = -w / 2;
          const yMin = -h / 2;

          // Access the pixels[] array
          p.loadPixels();

          // Set the maximum number of iterations for each point on the complex plane
          const maxIterations = 100;

          // x goes from xMin to xMax
          const xMax = xMin + w;

          // y goes from yMin to yMax
          const yMax = yMin + h;

          // Calculate amount we increment x,y for each pixel
          const dx = (xMax - xMin) / p.width;
          const dy = (yMax - yMin) / p.height;

          // Start y
          let y = yMin;
          for (let j = 0; j < p.height; j += 1) {
            // Start x
            let x = xMin;
            for (let i = 0; i < p.width; i += 1) {
              // Test whether iteration of z = z^2 + cm diverges
              let a = x;
              let b = y;
              let iterations = 0;
              while (iterations < maxIterations) {
                const aSquared = p.pow(a, 2);
                const bSquared = p.pow(b, 2);
                const twoAB = 2.0 * a * b;
                a = aSquared - bSquared + x;
                b = twoAB + y;

                // If the values are too big, stop iteration
                if (p.dist(aSquared, bSquared, 0, 0) > 16) {
                  break;
                }
                iterations += 1;
              }

              // Color each pixel based on how long it takes to get to infinity

              const index = (i + j * p.width) * 4;

              // Convert number of iterations to range of 0-1
              const normalized = p.map(iterations, 0, maxIterations, 0, 1);

              // Use square root of normalized value for color interpolation
              const lerpAmount = p.sqrt(normalized);

              // Set default color to black
              let pixelColor = p.color(0);

              // Blue
              const startColor = p.color(47, 68, 159);

              // Light yellow
              const endColor = p.color(255, 255, 128);

              // If iteration is under the maximum, interpolate a color
              if (iterations < maxIterations) {
                pixelColor = p.lerpColor(startColor, endColor, lerpAmount);
              }

              // Copy the RGBA values from the color to the pixel
              p.pixels[index + 0] = p.red(pixelColor);
              p.pixels[index + 1] = p.green(pixelColor);
              p.pixels[index + 2] = p.blue(pixelColor);
              p.pixels[index + 3] = p.alpha(pixelColor);

              x += dx;
            }
            y += dy;
          }
          p.updatePixels();
        };

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
          // Recalculate Mandelbrot set on resize
          p.setup();
        };
      };

      // Run p5 instance
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
  }, []);

  return (
    <main className="flex min-h-screen w-full">
      <div ref={containerRef} className="w-full h-screen" />
    </main>
  );
}

