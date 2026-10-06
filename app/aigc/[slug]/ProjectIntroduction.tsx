import styles from "./project-introduction.module.css";

export default function ProjectIntroduction() {
  return (
    <section
      id="project-introduction"
      className={styles.introduction}
      aria-labelledby="ai-avatar-design-title"
    >
      <header className={styles.heading} lang="en">
        <h1 id="ai-avatar-design-title">AI AVATAR DESIGN</h1>
        <p className={styles.subtitle}>AI-Generated Character System</p>
      </header>

      <div className={styles.description}>
        <p lang="en">
          AI Avatar Design is inspired by my own appearance and everyday outfits.
          Using AI, I translate my facial features, hairstyles and clothing choices into a
          digital character, then explore different looks, poses and expressions while
          retaining a recognisable identity. The project brings personal style and everyday
          self-expression into digital and interactive experiences.
        </p>
        <p lang="zh-CN">
          AI Avatar Design（AI 个人形象设计）以我的个人形象与日常穿搭为灵感，通过 AI 将自己的面部特征、发型与服装搭配转化为数字角色。在保留个人辨识度的基础上，探索不同的造型、动作与表情，将日常生活中的风格与自我表达延伸至数字和交互体验。
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
