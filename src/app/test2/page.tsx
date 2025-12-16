"use client";

import { useEffect, useRef } from "react";

export default function Test2Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p5InstanceRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import p5 only on client side
    import("p5").then((p5Module) => {
      const p5 = p5Module.default;

      // Define the global variables.
      // The symmetry variable will define how many reflective sections the canvas
      // is split into.
      const symmetry = 6;

      // The angle button will calculate the angle at which each section is rotated.
      const angle = 360 / symmetry;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sketch = (p: any) => {
        p.setup = () => {
          p.createCanvas(p.windowWidth, p.windowHeight);
          p.angleMode(p.DEGREES);
          p.background(0); // Nero
        };

        p.draw = () => {
          // Move the 0,0 coordinates of the canvas to the center, instead of in
          // the top left corner.
          p.translate(p.width / 2, p.height / 2);

          // If the cursor is within the limits of the canvas...
          if (
            p.mouseX > 0 &&
            p.mouseX < p.width &&
            p.mouseY > 0 &&
            p.mouseY < p.height
          ) {
            // Translate the current position and the previous position of the
            // cursor to the new coordinates set with the translate() function above.
            const lineStartX = p.mouseX - p.width / 2;
            const lineStartY = p.mouseY - p.height / 2;
            const lineEndX = p.pmouseX - p.width / 2;
            const lineEndY = p.pmouseY - p.height / 2;

            // Draw continuously as mouse moves (no click required)
            // For every reflective section the canvas is split into, draw the cursor's
            // coordinates...
            for (let i = 0; i < symmetry; i++) {
              p.rotate(angle);
              p.stroke(30); // Grigio molto scuro
              p.strokeWeight(3);
              p.line(lineStartX, lineStartY, lineEndX, lineEndY);

              // ... and reflect the line within the symmetry sections as well.
              p.push();
              p.scale(1, -1);
              p.line(lineStartX, lineStartY, lineEndX, lineEndY);
              p.pop();
            }
          }
        };

        p.windowResized = () => {
          p.resizeCanvas(p.windowWidth, p.windowHeight);
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
