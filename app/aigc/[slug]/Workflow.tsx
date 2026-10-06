import Image from "next/image";
import type { AigcProject } from "../projects";
import overviewStyles from "./project-overview.module.css";
import styles from "./workflow.module.css";

type WorkflowProps = {
  projectSlug: string;
  content: NonNullable<AigcProject["workflow"]>;
};

export default function Workflow({ projectSlug, content }: WorkflowProps) {
  const titleId = `${projectSlug}-workflow-title`;

  return (
    <section id="project-workflow" className={styles.section} aria-labelledby={titleId}>
      <header className={styles.header}>
        <h2 id={titleId} className={overviewStyles.overviewHeading}>
          <span lang="en">WORKFLOW</span>
          <span className={overviewStyles.headingTranslation} lang="zh-CN">制作流程</span>
        </h2>
      </header>

      <figure className={styles.figure}>
        <Image
          className={styles.image}
          src={content.image.src}
          alt={content.image.alt}
          width={content.image.width}
          height={content.image.height}
          unoptimized
          loading="lazy"
          draggable={false}
        />
      </figure>
    </section>
  );
}
