import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import navigationStyles from "../../about/about.module.css";
import { getUrbanProject, urbanProjects, URBAN_RETURN_HREF } from "../projects";
import styles from "../urban.module.css";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return urbanProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = getUrbanProject((await params).slug);
  if (!project) notFound();

  return {
    title: `${project.title} — Urban Design — Zhongism`,
    description: project.summary || "Zhong 的 UCL 城市设计作品，项目内容待上传。",
  };
}

export default async function UrbanProjectPage({ params }: ProjectPageProps) {
  const project = getUrbanProject((await params).slug);
  if (!project) notFound();

  return (
    <main className={navigationStyles.page}>
      <header className={navigationStyles.header}>
        <Link
          className={navigationStyles.back}
          href={URBAN_RETURN_HREF}
          aria-label="返回主页 URBAN 板块"
        >
          <span aria-hidden="true">←</span>
          BACK
        </Link>
        <span className={navigationStyles.wordmark}>ZHONG / URBAN</span>
        <nav className={navigationStyles.indexNav} aria-label="作品集页面导航">
          <Link href="/?scene=0">INTRO</Link>
          <Link href="/?scene=1">ABOUT</Link>
          <Link href={URBAN_RETURN_HREF} aria-current="page">URBAN</Link>
          <Link href="/?scene=3">AIGC</Link>
          <Link href="/?scene=4">CONTACT</Link>
        </nav>
      </header>

      <article className={styles.project}>
        <header className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>UCL / URBAN DESIGN</p>
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
              <span>PROJECT IMAGES / DRAWINGS</span>
            </div>
          )}
        </section>
      </article>
    </main>
  );
}
