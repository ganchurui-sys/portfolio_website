import imageManifest from "./project-images.json";

export function projectImageSource(source: string) {
  return (imageManifest as Record<string, string>)[source] ?? source;
}

const firstProjectImages = [
  "/aigc/project-01/portraits-white-v1/portrait-01.png",
  "/aigc/project-01/portraits-white-v1/portrait-02.png",
  "/aigc/project-01/portraits-white-v1/portrait-03.png",
  "/aigc/project-01/portraits-white-v2/portrait-04-half-body.png",
  "/aigc/project-01/portraits-white-v1/portrait-05.png",
  "/aigc/project-02/airpods-max-hero-clean.jpg",
  "/aigc/project-03/pdf-v2/page-01.webp",
  "/urban/mla/page-01.jpg",
  "/project-media-v1/urban/ucl-final/preview.webp",
  "/urban/ucl-workshop/ucl-workshop-poster.jpg",
  "/home-media-v2/poster.webp",
  "/home-media-v2/end.webp",
];

export async function preloadProjectImages(onProgress: (progress: number) => void) {
  let finished = 0;
  await Promise.all(firstProjectImages.map(async (source) => {
    const image = new window.Image();
    image.src = projectImageSource(source);
    await image.decode();
    onProgress(++finished / firstProjectImages.length);
  }));
}
