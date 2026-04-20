declare module "hover-effect" {
  type HoverEffectOptions = {
    parent: HTMLElement;
    intensity?: number;
    image1: string;
    image2: string;
    displacementImage: string;
    hover?: boolean;
    speedIn?: number;
    speedOut?: number;
    easing?: string;
  };

  export default class HoverEffect {
    constructor(options: HoverEffectOptions);
    next(): void;
    destroy(): void;
  }
}
