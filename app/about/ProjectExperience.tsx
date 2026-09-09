import styles from "./about.module.css";

export default function ProjectExperience() {
  return (
    <div className={styles.experienceCopy} lang="zh-CN">
      <details className={styles.experienceEntry}>
        <summary className={styles.experienceSummary}>
          <h2 className={styles.experienceTitle}>LUA-Studio ｜ 负责人 / 品牌与内容运营</h2>
          <span className={styles.experienceToggle} aria-hidden="true" />
        </summary>
        <ul className={styles.experiencePoints}>
          <li><strong>品牌搭建。</strong> 从 0 到 1 搭建面向建筑、景观与城市设计方向的留学作品集工作室，负责品牌定位、视觉体系、服务内容及整体对外形象的建立与统一。</li>
          <li><strong>内容运营。</strong> 围绕作品集设计、院校申请、设计方法与案例分享等方向进行内容策划，负责选题、文案、视觉排版与社交媒体内容输出，并持续优化封面及内容表达。</li>
          <li><strong>数据增长。</strong> 根据内容曝光、互动反馈及用户需求持续进行运营复盘与策略调整，相关内容累计获得 <strong>10W+ 曝光、1W+ 点赞与评论互动</strong>，逐步建立建筑设计留学领域的垂直内容体系。</li>
        </ul>
      </details>

      <details className={styles.experienceEntry}>
        <summary className={styles.experienceSummary}>
          <h2 className={styles.experienceTitle}>重庆朝天门未来城市规划的参数化设想 ｜ 核心成员</h2>
          <span className={styles.experienceToggle} aria-hidden="true" />
        </summary>
        <p className={styles.experienceDates}><time dateTime="2024-05">2024.05</time> — <time dateTime="2024-07">2024.07</time></p>
        <ul className={styles.experiencePoints}>
          <li><strong>参数化设计。</strong> 运用 Rhino、Grasshopper 与 Python 搭建城市空间参数化模型，通过控制点、斥力算法及参数调整，对城市肌理、建筑排布与空间结构进行生成式探索。</li>
          <li><strong>方案迭代。</strong> 基于不同参数快速生成并比较多版本城市空间方案，结合场地条件与功能需求持续调整空间结构，提高设计迭代效率。</li>
          <li><strong>数字化表达。</strong> 将参数化成果转化为三维模型与 AIGC 视觉图像，并进一步通过 3D 打印完成实体模型制作，形成从计算生成到视觉展示的完整流程。</li>
        </ul>
      </details>

      <details className={styles.experienceEntry}>
        <summary className={styles.experienceSummary}>
          <h2 className={styles.experienceTitle}>国际工作坊「过去的创新」 ｜ 核心成员</h2>
          <span className={styles.experienceToggle} aria-hidden="true" />
        </summary>
        <p className={styles.experienceDates}><time dateTime="2023-06">2023.06</time> — <time dateTime="2023-07">2023.07</time></p>
        <ul className={styles.experiencePoints}>
          <li><strong>场地研究。</strong> 围绕中国传统乡村聚落开展实地调研，对建筑形态、家庭结构、社会需求、历史文化及生态环境等信息进行系统整理与分析。</li>
          <li><strong>跨国协作。</strong> 参与中意联合研究，将中国传统建筑研究方法与意大利古建筑修复体系结合，对建筑要素、场地问题与保护策略进行分类和梳理。</li>
          <li><strong>信息可视化。</strong> 完成 <strong>30+ 处核心景观及建筑节点</strong>的分类、编号与数据整理，并制作 <strong>3+ 套可视化图标系统</strong>、分析图及设计成果，实现研究信息的系统化表达。</li>
        </ul>
      </details>

      <details className={styles.experienceEntry}>
        <summary className={styles.experienceSummary}>
          <h2 className={styles.experienceTitle}>青木川魏家大院古建筑测绘 ｜ 项目负责人</h2>
          <span className={styles.experienceToggle} aria-hidden="true" />
        </summary>
        <p className={styles.experienceDates}><time dateTime="2021-09">2021.09</time> — <time dateTime="2024-11">2024.11</time></p>
        <ul className={styles.experiencePoints}>
          <li><strong>项目统筹。</strong> 担任团队负责人，统筹现场测绘、数据校核、图纸绘制、模型制作及成果展示等环节，并负责团队任务分配与项目进度管理。</li>
          <li><strong>数字化测绘。</strong> 结合现场测量与数字化建模，对建筑体量、构造、装饰纹样及色彩等信息进行记录与复原，累计完成 <strong>20+ 张 CAD 图纸</strong>及三维数字模型。</li>
          <li><strong>数字展示。</strong> 基于测绘数据进一步完成实体比例模型、VR 沉浸式全景及二维码线上展示，将传统建筑资料转化为可保存、可传播的数字化成果。</li>
        </ul>
      </details>
    </div>
  );
}
