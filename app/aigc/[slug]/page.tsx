import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import navigationStyles from "../../about/about.module.css";
import styles from "../../urban/urban.module.css";
import { aigcProjects, getAigcProject, AIGC_RETURN_HREF } from "../projects";
import PortraitRevealProject from "./PortraitRevealProject";
import PoseGallery from "./PoseGallery";
import revealStyles from "./portrait-reveal.module.css";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

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

      {project.slug === "project-01" ? <><PortraitRevealProject /><PoseGallery /></> : <article className={styles.project}>
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
