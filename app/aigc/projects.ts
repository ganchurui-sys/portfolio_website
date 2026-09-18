export type AigcProject = {
  slug: string;
  title: string;
  summary: string;
  images: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption?: string;
  }[];
};

// Add new AIGC projects here when their content is ready.
export const aigcProjects: AigcProject[] = [
  {
    slug: "project-01",
    title: "PROJECT 01",
    summary: "An interactive AIGC character identity study.",
    images: [],
  },
];

export const AIGC_RETURN_HREF = "/?scene=3";

export const getAigcProject = (slug: string) =>
  aigcProjects.find((project) => project.slug === slug);
