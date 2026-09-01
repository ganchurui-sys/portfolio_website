declare module "threejs-components/build/backgrounds/liquid1.min.js" {
  export type LiquidSurface = {
    liquidPlane: {
      attenuation: number;
      material: {
        metalness: number;
        roughness: number;
      };
      uniforms: {
        displacementScale: { value: number };
      };
    };
    loadImage: (source: string) => Promise<void>;
    setRain: (enabled: boolean) => void;
    dispose: () => void;
  };

  const createLiquidSurface: (canvas: HTMLCanvasElement) => LiquidSurface;
  export default createLiquidSurface;
}
