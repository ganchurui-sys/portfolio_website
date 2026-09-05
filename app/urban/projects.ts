export type UrbanProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export type UrbanProject = {
  slug: string;
  title: string;
  summary: string;
  images: UrbanProjectImage[];
};

// Replace each temporary title and add the supplied portfolio content here.
export const urbanProjects: UrbanProject[] = [
  { slug: "project-01", title: "portfolio01", summary: "", images: [] },
  { slug: "project-02", title: "portfolio02", summary: "", images: [] },
  { slug: "project-03", title: "portfolio03", summary: "", images: [] },
  { slug: "project-04", title: "portfolio04", summary: "", images: [] },
];

export const URBAN_RETURN_HREF = "/?scene=2";
export const URBAN_REVEAL_DELAY_MS = 120;
export const URBAN_REVEAL_STEP_MS = 220;

export const urbanProjectHref = (slug: string) => `/urban/${slug}`;

export const urbanProjectRevealDelay = (index: number) =>
  URBAN_REVEAL_DELAY_MS + index * URBAN_REVEAL_STEP_MS;

export const getUrbanProject = (slug: string) =>
  urbanProjects.find((project) => project.slug === slug);
