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

// Add the supplied AIGC project introductions and media here later.
export const aigcProjects: AigcProject[] = [
  {
    slug: "project-01",
    title: "PROJECT 01",
    summary: "An interactive AIGC character identity study.",
    images: [],
  },
  { slug: "project-02", title: "PROJECT 02", summary: "", images: [] },
  { slug: "project-03", title: "PROJECT 03", summary: "", images: [] },
  { slug: "project-04", title: "PROJECT 04", summary: "", images: [] },
  { slug: "project-05", title: "PROJECT 05", summary: "", images: [] },
];

export const AIGC_RETURN_HREF = "/?scene=3";

export const getAigcProject = (slug: string) =>
  aigcProjects.find((project) => project.slug === slug);
