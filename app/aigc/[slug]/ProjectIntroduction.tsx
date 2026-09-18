import styles from "./project-introduction.module.css";

export default function ProjectIntroduction() {
  return (
    <section
      id="project-introduction"
      className={styles.introduction}
      aria-labelledby="interactive-identity-title"
    >
      <header className={styles.heading} lang="en">
        <h1 id="interactive-identity-title">INTERACTIVE IDENTITY</h1>
        <p className={styles.subtitle}>AI-Generated Character System</p>
      </header>

      <div className={styles.description}>
        <p lang="en">
          Interactive Identity explores how AI can be used to build a consistent yet flexible
          digital character across different styles, poses, expressions and visual states.
          Through iterative generation, selection and refinement, the project transforms a
          single identity into an evolving visual system designed for digital and interactive
          experiences.
        </p>
        <p lang="zh-CN">
          Interactive Identity 探索如何运用 AI，在不同风格、姿态、表情与视觉状态之间，构建兼具一致性与灵活性的数字角色。通过反复生成、筛选与优化，项目将单一角色形象拓展为持续演变的视觉系统，服务于数字与交互体验。
        </p>
      </div>

      <dl className={styles.details} lang="en">
        <div>
          <dt>ROLE</dt>
          <dd>AI Visual Design / Art Direction / Interaction Design</dd>
        </div>
        <div>
          <dt>OUTPUT</dt>
          <dd>Character System / Motion / Interactive Experience</dd>
        </div>
        <div>
          <dt>YEAR</dt>
          <dd>2026</dd>
        </div>
      </dl>
    </section>
  );
}
