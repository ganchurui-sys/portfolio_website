import NavigationLink from "./NavigationLink";
import {
  urbanProjectRevealDelay,
  urbanProjects,
} from "../urban/projects";
import styles from "./UrbanProjectLinks.module.css";

type ProjectLinksProps = {
  projects: ReadonlyArray<{ slug: string; title: string; titleZh?: string }>;
  section: "urban" | "aigc";
  label: string;
  updateNote?: string;
};

export function ProjectLinks({ projects, section, label, updateNote }: ProjectLinksProps) {
  return (
    <nav
      className={updateNote ? `${styles.nav} ${styles.updating}` : styles.nav}
      data-section={section}
      aria-label={label}
    >
      <ol
        className={styles.list}
        style={{ gridTemplateRows: `repeat(${projects.length}, minmax(0, 1fr))` }}
      >
        {projects.map((project, index) => (
          <li
            key={project.slug}
            className={styles.item}
            style={{ animationDelay: `${urbanProjectRevealDelay(index)}ms` }}
          >
            <NavigationLink
              className={styles.link}
              href={`/${section}/${project.slug}`}
              aria-label={`查看 ${project.title}${project.titleZh ? `，${project.titleZh}` : ""} ${label}`}
            >
              <span className={styles.titles}>
                <span className={styles.title} lang="en">{project.title}</span>
                {project.titleZh && (
                  <span className={styles.translation} lang="zh-CN">{project.titleZh}</span>
                )}
              </span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </NavigationLink>
          </li>
        ))}
      </ol>
      {updateNote && (
        <p
          className={styles.updateNote}
          style={{ animationDelay: `${urbanProjectRevealDelay(projects.length)}ms` }}
        >
          {updateNote}
        </p>
      )}
    </nav>
  );
}

export default function UrbanProjectLinks() {
  return <ProjectLinks projects={urbanProjects} section="urban" label="城市设计作品" />;
}
