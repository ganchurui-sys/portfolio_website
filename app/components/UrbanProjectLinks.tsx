import Link from "next/link";
import {
  urbanProjectRevealDelay,
  urbanProjects,
} from "../urban/projects";
import styles from "./UrbanProjectLinks.module.css";

type ProjectLinksProps = {
  projects: ReadonlyArray<{ slug: string; title: string }>;
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
            <Link
              className={styles.link}
              href={`/${section}/${project.slug}`}
              prefetch={false}
              aria-label={`查看 ${project.title} ${label}`}
            >
              <span className={styles.title}>{project.title}</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </Link>
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
