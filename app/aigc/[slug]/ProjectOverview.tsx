import Image from "next/image";
import type { AigcProject } from "../projects";
import CharacterConsistency from "./CharacterConsistency";
import SceneConsistency from "./SceneConsistency";
import Storyboard from "./Storyboard";
import ProductionProcess from "./ProductionProcess";
import Workflow from "./Workflow";
import introductionStyles from "./project-introduction.module.css";
import styles from "./project-overview.module.css";

export default function ProjectOverview({ project }: { project: AigcProject }) {
  if (!project.overview) return null;

  const titleId = `${project.slug}-title`;
  const contentSections = [
    { id: "brief", title: "BRIEF", titleZh: "创意简述", content: project.brief },
    { id: "product-visuals", title: "PRODUCT VISUALS", titleZh: "产品视觉", content: project.productVisuals },
  ];

  return (
    <article>
      <section
        id="project-introduction"
        className={introductionStyles.introduction}
        aria-labelledby={titleId}
      >
        <header className={introductionStyles.heading}>
          <h1 id={titleId} lang="en">{project.overview.title}</h1>
          <p className={`${introductionStyles.subtitle} ${styles.subtitle}`}>
            <span lang="en">{project.overview.subtitle}</span>
            <span className={styles.titleTranslation} lang="zh-CN">{project.titleZh}</span>
          </p>
        </header>

        <div className={introductionStyles.description}>
          <h2 className={styles.overviewHeading} lang="en">
            PROJECT OVERVIEW
          </h2>
          <p lang="en">{project.summary}</p>
          <p lang="zh-CN">{project.overview.translation}</p>
        </div>

        {project.overview.details && (
          <dl className={introductionStyles.details} lang="en">
            {project.overview.details.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-label="项目主视觉">
        {project.video && (
          <figure className={styles.hero}>
            <video
              key={project.video.src}
              className={styles.heroVideo}
              controls={false}
              disablePictureInPicture
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={project.video.poster}
              width={project.video.width}
              height={project.video.height}
              aria-label={project.video.label}
            >
              <source src={project.video.src} type="video/mp4" />
              您的浏览器暂不支持视频播放。
              <a href={project.video.src}>打开 AirPods Max 创意广告短片</a>
            </video>
          </figure>
        )}
        {project.images.map((image, index) => (
          <figure className={styles.hero} key={image.src}>
            <Image
              className={styles.heroImage}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 700px) calc(100vw - 24px), calc(100vw - 64px)"
              priority={index === 0}
            />
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>
        ))}
      </section>

      {contentSections.map(({ id, title, titleZh, content }) => content && (
        <section
          key={id}
          id={`project-${id}`}
          className={`${introductionStyles.introduction} ${styles.contentSection}`}
          aria-labelledby={`${project.slug}-${id}-title`}
        >
          <div className={introductionStyles.description}>
            <h2 id={`${project.slug}-${id}-title`} className={styles.overviewHeading}>
              <span lang="en">{title}</span>
              <span className={styles.headingTranslation} lang="zh-CN">{titleZh}</span>
            </h2>
            <p lang="en">{content.description}</p>
            <p lang="zh-CN">{content.translation}</p>
          </div>
          <figure className={styles.sectionVisual}>
            <Image
              className={styles.sectionImage}
              src={content.image.src}
              alt={content.image.alt}
              width={content.image.width}
              height={content.image.height}
              sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 900px) calc(100vw - 104px), 52vw"
            />
          </figure>
        </section>
      ))}

      {project.characterConsistency && (
        <CharacterConsistency projectSlug={project.slug} content={project.characterConsistency} />
      )}

      {project.sceneConsistency && (
        <SceneConsistency projectSlug={project.slug} content={project.sceneConsistency} />
      )}

      {project.storyboard && (
        <Storyboard projectSlug={project.slug} content={project.storyboard} />
      )}

      {project.fullFilm && (
        <section
          id="project-full-film"
          className={styles.fullFilmSection}
          aria-labelledby={`${project.slug}-full-film-title`}
        >
          <header className={styles.fullFilmHeader}>
            <h2 id={`${project.slug}-full-film-title`} className={styles.overviewHeading}>
              <span lang="en">FULL FILM</span>
              <span className={styles.headingTranslation} lang="zh-CN">完整影片</span>
            </h2>
            <p className={styles.fullFilmDuration} aria-label={`4K，片长 ${project.fullFilm.duration}`}>
              4K <span aria-hidden="true">/</span> {project.fullFilm.duration}
            </p>
          </header>
          <figure className={styles.fullFilmFigure}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption -- No caption track was supplied for this original film. */}
            <video
              className={styles.heroVideo}
              controls
              playsInline
              preload="none"
              poster={project.fullFilm.poster}
              width={project.fullFilm.width}
              height={project.fullFilm.height}
              aria-label={project.fullFilm.label}
            >
              <source src={project.fullFilm.src} type="video/mp4" />
              您的浏览器暂不支持视频播放。
              <a href={project.fullFilm.src}>打开完整影片</a>
            </video>
          </figure>
        </section>
      )}
      {project.productionProcess && (
        <ProductionProcess projectSlug={project.slug} content={project.productionProcess} />
      )}
      {project.workflow && (
        <Workflow projectSlug={project.slug} content={project.workflow} />
      )}
    </article>
  );
}
