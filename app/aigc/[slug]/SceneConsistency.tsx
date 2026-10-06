import Image from "next/image";
import type { AigcProject } from "../projects";
import introductionStyles from "./project-introduction.module.css";
import overviewStyles from "./project-overview.module.css";
import styles from "./scene-consistency.module.css";

type SceneConsistencyProps = {
  projectSlug: string;
  content: NonNullable<AigcProject["sceneConsistency"]>;
};

export default function SceneConsistency({ projectSlug, content }: SceneConsistencyProps) {
  const titleId = `${projectSlug}-scene-consistency-title`;

  return (
    <section
      id="project-scene-consistency"
      className={`${introductionStyles.introduction} ${styles.section}`}
      aria-labelledby={titleId}
    >
      <div className={introductionStyles.description}>
        <h2 id={titleId} className={overviewStyles.overviewHeading}>
          <span lang="en">SCENE CONSISTENCY</span>
          <span className={overviewStyles.headingTranslation} lang="zh-CN">场景一致性</span>
        </h2>
        <p lang="en">{content.description}</p>
        <p lang="zh-CN">{content.translation}</p>
      </div>

      <div className={styles.visuals}>
        <figure className={styles.base}>
          <a className={styles.imageLink} href={content.base.src} target="_blank" rel="noopener noreferrer" aria-label="查看基础场景大图（新标签页）">
            <Image
              src={content.base.src}
              alt={content.base.alt}
              width={content.base.width}
              height={content.base.height}
              sizes="(max-width: 600px) 240px, (max-width: 900px) 28vw, 19vw"
            />
          </a>
          <figcaption className={styles.caption}>
            <span lang="en">BASE SCENE</span>
            <span lang="zh-CN">基础场景</span>
          </figcaption>
        </figure>

        <figure className={styles.variations}>
          <div className={styles.grid}>
            {content.images.map((image, index) => (
              <a
                className={styles.imageLink}
                href={image.src}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`查看衍生场景 ${index + 1} 大图（新标签页）`}
                key={image.src}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(max-width: 600px) 46vw, (max-width: 900px) 32vw, 23vw"
                />
              </a>
            ))}
          </div>
          <figcaption className={styles.caption}>
            <span lang="en">SCENE VARIATIONS</span>
            <span lang="zh-CN">衍生场景</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
