import { readFile, writeFile } from "node:fs/promises";

// Rebuild the horizontal vector artwork: node scripts/generate-airpods-process.mjs
const content = JSON.parse(await readFile(new URL("../app/aigc/project-02-process.json", import.meta.url), "utf8"));
const width = 3360;
const height = 960;
const pad = 72;
const column = 432;
const gap = 32;
const ink = "#202024";
const muted = "#66636b";
const accent = "#766589";
const line = "#dedbe3";
const elements = [];
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
const text = (x, y, value, size = 28, color = ink, weight = 400, options = "") => elements.push(
  `<text x="${x}" y="${y}" font-size="${Math.max(20, Math.round(size * 0.86))}" fill="${color}" font-weight="${weight}" ${options}>${escape(value)}</text>`,
);
const path = (d, color = line, arrow = false) => elements.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" ${arrow ? 'marker-end="url(#arrow)"' : ""}/>`);
const xOf = (index) => pad + index * (column + gap);
const horizontalLines = {
  "02": ["城市喧嚣 → 佩戴耳机", "开启降噪 → 泡泡悬停", "车流悬浮 → 城市花开", "最终回到产品与品牌收束。"],
  "05": ["参考图约束人物、产品与场景；", "设计动作、运镜和超现实事件；", "逐镜筛选可用的生成结果。"],
  "06": ["剪辑节奏与镜头衔接，", "统一调色；", "分层处理音乐、脚步与车流声，", "让城市声渐弱、音乐渐强，", "完成沉浸式聆听的情绪转折。"],
  "07": ["输出 4K 完整影片，", "制作 Hero 片段与项目主视觉，", "整理制作过程，", "优化网页播放与加载体验。"],
};

// Width-aware wrapping keeps the wording intact and within its column.
function wrap(value, maxWidth, size) {
  const lines = [];
  let current = "";
  let units = 0;
  for (const char of value) {
    const advance = char.codePointAt(0) <= 127 ? (char === " " ? 0.3 : 0.58) : 1;
    if (units + advance > maxWidth / size && current) {
      lines.push(current.trim());
      current = "";
      units = 0;
    }
    current += char;
    units += advance;
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

text(pad, 51, "ZHONGISM / AIGC", 23, muted, 400, 'letter-spacing="1.5"');
text(width - pad, 51, "AIRPODS MAX · CREATIVE FILM · 2026", 23, muted, 400, 'text-anchor="end"');
path(`M${pad} 76H${width - pad}`);
text(pad - 7, 209, "AIGC", 146, ink, 500, 'letter-spacing="-9"');
text(510, 143, "从创意到成片", 54, ink, 500);
text(510, 200, "PRODUCTION PROCESS", 28, accent, 400, 'letter-spacing="2"');
text(width - pad, 193, "01 — 07", 56, accent, 400, 'text-anchor="end" letter-spacing="-1"');

const phases = [
  { start: 0, count: 2, label: "01 / CREATIVE DIRECTION · 创意与叙事" },
  { start: 2, count: 1, label: "02 / VISUAL SYSTEM · 视觉设定" },
  { start: 3, count: 2, label: "03 / FRAME TO MOTION · 镜头生成" },
  { start: 5, count: 2, label: "04 / EDIT & DELIVERY · 后期与输出" },
];
for (const phase of phases) {
  const x = xOf(phase.start);
  text(x, 265, phase.label, 23, muted);
  path(`M${x} 284H${x + phase.count * column + (phase.count - 1) * gap}`);
}

content.steps.forEach((step, index) => {
  const x = xOf(index);
  text(x, 374, step.number, 76, accent, 400, 'letter-spacing="-4"');
  text(x + 104, 337, step.title, 36, ink, 500);
  text(x + 104, 372, step.english, 20, muted);
  path(`M${x} 402H${x + column}`);
  if (index < content.steps.length - 1) path(`M${x + column + 4} 341H${x + column + gap - 7}`, muted, true);

  if (step.branches) {
    step.branches.forEach((branch, branchIndex) => {
      const y = 436 + branchIndex * 108;
      text(x, y, branch.title, 29, ink, 500);
      text(x + column, y, branch.english, 20, accent, 400, 'text-anchor="end"');
      text(x, y + 36, branch.lines[0], 28, muted);
      text(x, y + 68, branch.lines[1], 28, muted);
    });
  } else {
    const lines = (horizontalLines[step.number] ?? step.lines).flatMap((value) => wrap(value, column, 30));
    lines.forEach((value, i) => text(x, 451 + i * 42, value, 30));
  }

  path(`M${x} 738H${x + column}`);
  text(x, 776, "OUTPUT / 产出", 22, muted, 400, 'letter-spacing="1"');
  const outputLines = step.number === "03"
    ? ["贯穿关键帧与动态镜头的", "一致性基准"]
    : step.number === "07"
      ? ["完整影片 / Hero 片段", "项目主视觉"]
      : wrap(step.output, column, 28);
  outputLines.forEach((value, i) => text(x, 820 + i * 37, value, 28, accent));
});

const frameX = xOf(3);
const motionEnd = xOf(4) + column;
path(`M${motionEnd} 872H${frameX + 22}V853H${frameX + 3}`, accent, true);
text(frameX, 913, "人物 / 产品 / 动作连续性检查 → 返回关键帧修正", 26, accent);
text(pad, 914, "AIRPODS MAX / AIGC CREATIVE FILM", 23, muted);
text(width - pad, 914, "CONCEPT → CONSISTENCY → MOTION → FILM", 23, muted, 400, 'text-anchor="end"');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">AirPods Max AIGC 横向制作流程</title>
<desc id="desc">${escape(content.steps.map((step) => `${step.number} ${step.title}：${step.lines.join("")}产出：${step.output}。`).join(" ") + content.iteration)}</desc>
<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="${muted}"/></marker></defs>
<rect width="${width}" height="${height}" fill="#ffffff"/>
<g font-family="Arial, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif">
${elements.join("\n")}
</g>
</svg>\n`;
const name = "airpods-max-production-process-horizontal-v2.svg";
await writeFile(new URL(`../public/aigc/project-02/${name}`, import.meta.url), svg);
console.log(`${name}: ${width} × ${height}, ${Buffer.byteLength(svg)} bytes`);
