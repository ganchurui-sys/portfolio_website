import Image from "next/image";
import type { AigcProject } from "../projects";
import overviewStyles from "./project-overview.module.css";
import styles from "./storyboard-overview.module.css";

type StoryboardOverviewProps = {
  projectSlug: string;
  content: NonNullable<AigcProject["storyboardOverview"]>;
};

export default function StoryboardOverview({ projectSlug, content }: StoryboardOverviewProps) {
  const titleId = `${projectSlug}-storyboard-overview-title`;

  return (
    <section id="project-storyboard-overview" className={styles.section} aria-labelledby={titleId}>
      <header className={styles.header}>
        <h2 id={titleId} className={overviewStyles.overviewHeading}>
          <span lang="en">STORYBOARD OVERVIEW</span>
          <span className={overviewStyles.headingTranslation} lang="zh-CN">分镜总览</span>
        </h2>
        <div className={styles.description}>
          <p lang="en">{content.description}</p>
          <p lang="zh-CN">{content.translation}</p>
        </div>
      </header>

      <figure className={styles.figure}>
        <a
          className={styles.imageLink}
          href={content.image.src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="放大查看完整分镜手稿（新标签页）"
        >
          <Image
            className={styles.image}
            src={content.image.src}
            alt={content.image.alt}
            width={content.image.width}
            height={content.image.height}
            unoptimized
            loading="lazy"
          />
        </a>
        <figcaption className={styles.caption}>
          <span lang="en">24 KEY FRAMES</span>
          <span lang="zh-CN">点击图片放大查看</span>
          <span aria-hidden="true">↗</span>
        </figcaption>
      </figure>
    </section>
  );
}
