import type { Metadata } from "next";
import Image from "../../components/ProjectImage";
import Link from "../../components/NavigationLink";
import { notFound } from "next/navigation";
import navigationStyles from "../../about/about.module.css";
import styles from "../../urban/urban.module.css";
import { aigcProjects, getAigcProject, AIGC_RETURN_HREF } from "../projects";
import PortraitRevealProject from "./PortraitRevealProject";
import ProjectIntroduction from "./ProjectIntroduction";
import ProjectOverview from "./ProjectOverview";
import PoseGallery from "./PoseGallery";
import CharacterTurnarounds from "./CharacterTurnarounds";
import ExpressionStudies from "./ExpressionStudies";
import OutfitStudies from "./OutfitStudies";
import overviewStyles from "./project-overview.module.css";
import revealStyles from "./portrait-reveal.module.css";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

const avatarAdditionalPages = [
  {
    page: 12,
    alt: "PDF 第 12 页：角色海报，七套造型的人物与两只狗行走在红白斑马线上。",
  },
  {
    page: 13,
    alt: "PDF 第 13 页：复古街头角色群像海报，角色与摩托车出现在报刊亭场景中。",
  },
  {
    page: 14,
    alt: "PDF 第 14 页：角色一致性与表情优化，通过手部结构和躺卧姿态的前后对比展示提示词修正过程。",
  },
  {
    page: 15,
    alt: "PDF 第 15 页：表情生成迭代，展示人物一致性、风格与表情细节的问题，以及草图引导的四种表情优化结果。",
  },
];

export const dynamicParams = false;

export function generateStaticParams() {
  return aigcProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = getAigcProject((await params).slug);
  if (!project) notFound();

  return {
    title: `${project.title} — AIGC — Zhongism`,
    description: project.slug === "project-01"
      ? "Zhong 的 AIGC 人物形象交互实验。"
      : project.summary || "Zhong 的 AIGC 作品，项目内容待上传。",
  };
}

export default async function AigcProjectPage({ params }: ProjectPageProps) {
  const project = getAigcProject((await params).slug);
  if (!project) notFound();

  return (
    <main className={`${navigationStyles.page} ${project.slug === "project-01" ? revealStyles.page : ""}`}>
      <header className={navigationStyles.header}>
        <Link
          className={navigationStyles.back}
          href={AIGC_RETURN_HREF}
          aria-label="返回主页 AIGC 板块"
        >
          <span aria-hidden="true">←</span>
          BACK
        </Link>
        <span className={navigationStyles.wordmark}>ZHONG / AIGC</span>
        <nav className={navigationStyles.indexNav} aria-label="作品集页面导航">
          <Link href="/?scene=0">INTRO</Link>
          <Link href="/?scene=1">ABOUT</Link>
          <Link href="/?scene=2">URBAN</Link>
          <Link href={AIGC_RETURN_HREF} aria-current="page">AIGC</Link>
          <Link href="/?scene=4">CONTACT</Link>
        </nav>
      </header>

      {project.slug === "project-01" ? (
        <>
          <ProjectIntroduction />
          <section className={`${overviewStyles.pageGallery} ${revealStyles.documentPages}`} aria-label="AI 个人形象设计作品集，前四页">
            {project.images.map((image, index) => (
              <figure className={overviewStyles.hero} key={image.src}>
                <Image
                  className={overviewStyles.heroImage}
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(max-width: 700px) calc(100vw - 24px), calc(100vw - 64px)"
                  priority={index === 0}
                />
              </figure>
            ))}
          </section>
          <PortraitRevealProject />
          <CharacterTurnarounds />
          <section
            id="pose-study-process"
            className={`${overviewStyles.pageGallery} ${revealStyles.documentPages}`}
            aria-label="角色动作与姿态延展，PDF 第六页"
          >
            <figure className={overviewStyles.hero}>
              <Image
                className={overviewStyles.heroImage}
                src="/project-media-v1/aigc/project-01/pdf-v1/page-06.webp"
                alt="PDF 第 6 页：角色动作与姿态延展，通过五组手绘动作草图与对应的 AI 角色图展示姿势生成过程。"
                width={3200}
                height={1813}
                sizes="(max-width: 700px) calc(100vw - 24px), calc(100vw - 64px)"
              />
            </figure>
          </section>
          <PoseGallery />
          <section
            id="expression-study-process"
            className={`${overviewStyles.pageGallery} ${revealStyles.documentPages}`}
            aria-label="角色表情与情绪延展，PDF 第七页"
          >
            <figure className={overviewStyles.hero}>
              <Image
                className={overviewStyles.heroImage}
                src="/project-media-v1/aigc/project-01/pdf-v1/page-07.webp"
                alt="PDF 第 7 页：角色表情与情绪延展，通过四组表情草图与角色图展示侧目观察、俏皮眨眼、平静直视和专注凝视。"
                width={3200}
                height={1813}
                sizes="(max-width: 700px) calc(100vw - 24px), calc(100vw - 64px)"
              />
            </figure>
          </section>
          <ExpressionStudies />
          <OutfitStudies />
          <section
            id="project-posters-and-process"
            className={`${overviewStyles.pageGallery} ${revealStyles.documentPages}`}
            aria-label="角色海报与生成优化过程，PDF 第十二至十五页"
          >
            {avatarAdditionalPages.map(({ page, alt }) => (
              <figure
                id={`pdf-page-${page}`}
                className={overviewStyles.hero}
                key={page}
              >
                <Image
                  className={overviewStyles.heroImage}
                  src={`/project-media-v1/aigc/project-01/pdf-v1/page-${page}.webp`}
                  alt={alt}
                  style={{ width: "100%" }}
                  width={3200}
                  height={1813}
                  sizes="(max-width: 700px) calc(100vw - 24px), calc(100vw - 64px)"
                />
              </figure>
            ))}
          </section>
        </>
      ) : project.overview ? (
        <ProjectOverview project={project} />
      ) : <article className={styles.project}>
        <header className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>AIGC / CREATIVE PRACTICE</p>
            <h1 className={styles.title}>{project.title}</h1>
          </div>
          <p className={styles.summary}>
            {project.summary || "项目介绍待补充。"}
          </p>
        </header>

        <section className={styles.gallery} aria-label="项目作品">
          {project.images.length > 0 ? project.images.map((image) => (
            <figure className={styles.figure} key={image.src}>
              <Image
                className={styles.image}
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 700px) calc(100vw - 24px), 79vw"
              />
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          )) : (
            <div className={styles.placeholder}>
              <p>作品内容待上传</p>
              <span>PROJECT GALLERY</span>
            </div>
          )}
        </section>
      </article>}
    </main>
  );
}
