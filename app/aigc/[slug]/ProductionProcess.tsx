import Image from "next/image";
import type { AigcProject } from "../projects";
import overviewStyles from "./project-overview.module.css";
import styles from "./production-process.module.css";

type ProductionProcessProps = {
  projectSlug: string;
  content: NonNullable<AigcProject["productionProcess"]>;
};

export default function ProductionProcess({ projectSlug, content }: ProductionProcessProps) {
  const titleId = `${projectSlug}-production-process-title`;

  return (
    <section id="project-production-process" className={styles.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={overviewStyles.overviewHeading}>
        <span lang="en">PRODUCTION PROCESS</span>
        <span className={overviewStyles.headingTranslation} lang="zh-CN">制作流程图</span>
      </h2>
      <figure className={styles.figure}>
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet={content.mobileImage.src}
            width={content.mobileImage.width}
            height={content.mobileImage.height}
          />
          <Image
            className={styles.image}
            src={content.image.src}
            alt={content.image.alt}
            width={content.image.width}
            height={content.image.height}
            loading="lazy"
            unoptimized
            draggable={false}
          />
        </picture>
        <figcaption className={styles.transcript} lang="zh-CN">
          <ol>
            {content.steps.map((step) => (
              <li key={step.number}>
                <h3>{step.title} <span lang="en">{step.english}</span></h3>
                <p>{step.lines.join("")}产出：{step.output}。</p>
                {step.branches && (
                  <ul>
                    {step.branches.map((branch) => (
                      <li key={branch.english}>
                        {branch.title}：{branch.lines.join("；")}。产出：{branch.output}。
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
          <p>{content.iteration}</p>
        </figcaption>
      </figure>
    </section>
  );
}
