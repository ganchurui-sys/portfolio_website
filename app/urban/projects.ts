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
  book?: {
    source: string;
    pageCount: number;
    startPage: number;
    pageMode: "split-spreads" | "single-pages";
    eyebrow: string;
    description: string;
    type: string;
    years: string;
    works: string;
  };
  video?: {
    source: string;
    poster: string;
    width: number;
    height: number;
  };
};

const mlaPortfolioPages: UrbanProjectImage[] = Array.from(
  { length: 22 },
  (_, index) => {
    const pageNumber = index + 1;
    const fileNumber = String(pageNumber).padStart(2, "0");

    return {
      src: `/urban/mla/page-${fileNumber}.jpg`,
      alt: `Landscape Architecture Portfolio page ${pageNumber}`,
      width: 2560,
      height: 1811,
    };
  },
);

export const urbanProjects: UrbanProject[] = [
  {
    slug: "project-01",
    title: "SELECTED DESIGN WORKS",
    summary: "Landscape Architecture Portfolio 2020–2023.",
    images: mlaPortfolioPages,
    book: {
      source: "/urban/mla/mla-pageflip.pdf",
      pageCount: 45,
      startPage: 2,
      pageMode: "split-spreads",
      eyebrow: "URBAN / PROJECT 01",
      description: "四个项目穿梭于建筑、景观与城市之间，以尺度变化作为设计线索。从局部空间的塑造，到场地关系的重构，再到城市系统的组织，设计被视为一种连接不同环境、行为与空间结构的媒介。",
      type: "Landscape Architecture",
      years: "2020–2023",
      works: "4 selected projects",
    },
  },
  {
    slug: "project-02",
    title: "UCL final design",
    summary: "AFTER FRAME — UCL RC11 final design portfolio, 2025/2026.",
    images: [],
    book: {
      source: "/urban/ucl-final/ucl-final-design-web.pdf",
      pageCount: 131,
      startPage: 1,
      pageMode: "single-pages",
      eyebrow: "URBAN / PROJECT 02",
      description: "AFTER FRAME is a collaborative final design project developed for UCL RC11's 2025/2026 ODD-TWINS studio.",
      type: "Urban Design",
      years: "2025–2026",
      works: "1 collaborative project",
    },
  },
  {
    slug: "project-03",
    title: "UCL workshop",
    summary: "A UCL workshop project exploring spatial design through digital modelling and VR.",
    images: [],
    video: {
      source: "/urban/ucl-workshop/ucl-workshop.mp4",
      poster: "/urban/ucl-workshop/ucl-workshop-poster.jpg",
      width: 3480,
      height: 2160,
    },
  },
];

export const URBAN_RETURN_HREF = "/?scene=2";
export const URBAN_REVEAL_DELAY_MS = 120;
export const URBAN_REVEAL_STEP_MS = 220;

export const urbanProjectHref = (slug: string) => `/urban/${slug}`;

export const urbanProjectRevealDelay = (index: number) =>
  URBAN_REVEAL_DELAY_MS + index * URBAN_REVEAL_STEP_MS;

export const getUrbanProject = (slug: string) =>
  urbanProjects.find((project) => project.slug === slug);
