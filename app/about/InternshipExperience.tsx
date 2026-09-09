import styles from "./about.module.css";

export default function InternshipExperience() {
  return (
    <div className={styles.experienceCopy} lang="zh-CN">
      <details className={styles.experienceEntry}>
        <summary className={styles.experienceSummary}>
          <h2 className={styles.experienceTitle}>AMASS 国际艺术留学 ｜ 作品集辅导老师</h2>
          <span className={styles.experienceToggle} aria-hidden="true" />
        </summary>
        <p className={styles.experienceDates}><time dateTime="2024-07">2024.07</time> — <time dateTime="2024-12">2024.12</time></p>
        <ul className={styles.experiencePoints}>
          <li><strong>内容策划。</strong> 负责小红书账号内容策划与日常运营，围绕艺术留学、院校申请与作品集制作等主题完成选题规划、内容组织及视觉呈现。</li>
          <li><strong>用户运营。</strong> 结合问答、线上讲座、评论互动及平台内容策略提升用户参与度，累计沉淀 <strong>300+ 私域用户</strong>。</li>
          <li><strong>设计辅导。</strong> 为艺术设计方向学生提供从创意构思、项目深化到视觉表达的作品集指导，并根据项目进度持续优化设计方案与最终呈现。</li>
        </ul>
      </details>

      <details className={styles.experienceEntry}>
        <summary className={styles.experienceSummary}>
          <h2 className={styles.experienceTitle}>纳爱斯集团有限公司浙江分公司 ｜ 运营实习生</h2>
          <span className={styles.experienceToggle} aria-hidden="true" />
        </summary>
        <p className={styles.experienceDates}><time dateTime="2024-04">2024.04</time> — <time dateTime="2024-06">2024.06</time></p>
        <ul className={styles.experiencePoints}>
          <li><strong>运营执行。</strong> 参与区域业务日常运营及营销活动推进，围绕活动排期、渠道协同、物料准备及执行节点进行跟进，及时整理执行反馈并协助推动问题闭环。</li>
          <li><strong>数据运营。</strong> 整理销售、渠道与活动相关数据，通过 Excel 进行分类统计、趋势对比及阶段性汇总，为活动复盘与后续运营策略调整提供参考。</li>
          <li><strong>市场分析。</strong> 跟踪同类品牌的产品、价格、促销及渠道动态，整理竞品与市场信息，并协同市场、销售等团队推进相关运营事项落地。</li>
        </ul>
      </details>

      <details className={styles.experienceEntry}>
        <summary className={styles.experienceSummary}>
          <h2 className={styles.experienceTitle}>福州睿翼天翔广告有限公司 ｜ 设计师助理</h2>
          <span className={styles.experienceToggle} aria-hidden="true" />
        </summary>
        <p className={styles.experienceDates}><time dateTime="2023-06">2023.06</time> — <time dateTime="2024-02">2024.02</time></p>
        <ul className={styles.experiencePoints}>
          <li><strong>品牌视觉。</strong> 参与品牌主视觉、活动海报、宣传册及社交媒体物料设计，根据品牌定位与传播需求完成视觉概念、版式设计与最终输出。</li>
          <li><strong>营销设计。</strong> 围绕品牌营销节点及热点内容完成公众号配图、活动长图与传播海报等视觉物料，参与从创意构思到最终交付的设计流程。</li>
          <li><strong>视觉传播。</strong> 针对线上与线下不同传播场景优化版式、色彩与视觉元素，相关设计内容累计获得 <strong>300+ 次平台自发分享</strong>。</li>
        </ul>
      </details>

      <details className={styles.experienceEntry}>
        <summary className={styles.experienceSummary}>
          <h2 className={styles.experienceTitle}>杭州青道房建筑设计有限公司 ｜ 景观设计师助理</h2>
          <span className={styles.experienceToggle} aria-hidden="true" />
        </summary>
        <p className={styles.experienceDates}><time dateTime="2022-07">2022.07</time> — <time dateTime="2023-02">2023.02</time></p>
        <ul className={styles.experiencePoints}>
          <li><strong>场地研究。</strong> 参与杭州西湖区乡村景观项目实地调研，对地形、植被、交通流线及空间环境等场地信息进行采集、整理与分析。</li>
          <li><strong>空间设计。</strong> 基于调研结果参与景观概念与整体空间方案设计，完成空间布局、景观节点及公共活动空间等内容的方案深化。</li>
          <li><strong>设计表达。</strong> 参与分析图、方案图、三维模型及视觉成果制作，将场地研究与设计概念转化为完整、清晰的空间设计表达。</li>
        </ul>
      </details>
    </div>
  );
}
