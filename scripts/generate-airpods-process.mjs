import { readFile, writeFile } from "node:fs/promises";

// Rebuild the two layouts with: node scripts/generate-airpods-process.mjs
// Text stays vector-based for sharp rendering without a large image download.
const content = JSON.parse(await readFile(new URL("../app/aigc/project-02-process.json", import.meta.url), "utf8"));
const ink = "#f0eee8";
const muted = "#aca9b4";
const accent = "#c5b4e5";
const line = "#38363e";
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

function createDiagram(mobile) {
  const width = mobile ? 720 : 1280;
  const pad = mobile ? 40 : 64;
  const inner = width - pad * 2;
  const elements = [];
  const text = (x, y, value, size = 28, color = ink, weight = 400, options = "") => elements.push(
    `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" ${options}>${escape(value)}</text>`,
  );
  const rule = (x1, y1, x2, y2, color = line) => elements.push(`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" fill="none"/>`);
  const path = (d, color = line, arrow = false) => elements.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" ${arrow ? 'marker-end="url(#arrow)"' : ""}/>`);
  const rect = (x, y, w, h, color = line) => elements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${color}"/>`);

  function phase(y, label, title) {
    rule(pad, y, width - pad, y);
    text(pad, y + 42, label, mobile ? 24 : 20, muted, 400, 'letter-spacing="1.3"');
    text(pad, y + 105, title, mobile ? 40 : 42, ink, 500);
    return y + 160;
  }

  function step(stepData, x, y, w) {
    text(x, y + 55, stepData.number, 64, accent, 400, 'letter-spacing="-3"');
    text(x + 94, y + 23, stepData.title, mobile ? 36 : 34, ink, 500);
    text(x + 94, y + 58, stepData.english, mobile ? 23 : 20, muted);
    rule(x, y + 85, x + w, y + 85);
    stepData.lines.forEach((value, i) => text(x, y + 137 + i * 44, value, mobile ? 30 : 27));
    text(x, y + 277, "产出 / " + stepData.output, mobile ? 26 : 23, accent);
  }

  text(pad, 56, "ZHONGISM / AIGC", mobile ? 23 : 20, muted, 400, 'letter-spacing="1.5"');
  text(width - pad, 56, "AIRPODS MAX · 2026", mobile ? 23 : 20, muted, 400, 'text-anchor="end"');
  rule(pad, 83, width - pad, 83);

  if (mobile) {
    text(pad - 4, 219, "AIGC", 112, ink, 500, 'letter-spacing="-7"');
    text(width - pad, 159, "设计", 60, ink, 500, 'text-anchor="end"');
    text(width - pad, 229, "流程", 60, ink, 500, 'text-anchor="end"');
    text(pad, 295, "PRODUCTION PROCESS", 25, accent, 400, 'letter-spacing="2"');
    text(pad, 360, content.title, 40, ink, 500);
    text(pad, 416, content.description, 30, muted);
  } else {
    text(pad - 8, 273, "AIGC", 198, ink, 500, 'letter-spacing="-13"');
    text(width - pad, 177, "从创意", 78, ink, 500, 'text-anchor="end"');
    text(width - pad, 275, "到成片", 78, ink, 500, 'text-anchor="end"');
    text(pad, 343, "PRODUCTION PROCESS", 22, accent, 400, 'letter-spacing="2"');
    text(pad, 409, content.title, 42, ink, 500);
    text(pad, 459, "AirPods Max 创意广告 · " + content.description, 27, muted);
    const gap = 18;
    const w = (inner - gap * 6) / 7;
    content.steps.forEach((item, i) => {
      const x = pad + i * (w + gap);
      rect(x, 513, w, 100, i === 0 || i === 6 ? "#6e617f" : line);
      text(x + 14, 544, item.number, 19, accent);
      text(x + 14, 583, item.title === "分镜与关键帧" ? "分镜关键帧" : item.title, 22, ink, 500);
      if (i < 6) path(`M${x + w + 3} 563H${x + w + gap - 4}`, muted, true);
    });
  }

  let y = phase(mobile ? 484 : 680, "PHASE 01 / CREATIVE DIRECTION", "先定义体验，再建立故事");
  const colWidth = (inner - 64) / 2;
  if (mobile) {
    step(content.steps[0], pad, y, inner);
    path(`M${pad + 12} ${y + 310}V${y + 344}`, muted, true);
    y += 382;
    step(content.steps[1], pad, y, inner);
    y += 350;
  } else {
    step(content.steps[0], pad, y, colWidth);
    step(content.steps[1], pad + colWidth + 64, y, colWidth);
    y += 350;
  }

  y = phase(y, "PHASE 02 / VISUAL DEVELOPMENT", mobile ? "让三个视觉系统保持一致" : "让产品、人物与城市保持一致");
  text(pad, y + 18, "03", mobile ? 48 : 42, accent);
  text(pad + 80, y + 18, "视觉设定 / VISUAL DEVELOPMENT", mobile ? 26 : 24, muted);
  const branchStart = y + 66;
  const branches = content.steps[2].branches;
  branches.forEach((branch, i) => {
    const x = mobile ? pad + 34 : pad + i * (inner + 36) / 3;
    const top = mobile ? branchStart + i * 228 : branchStart;
    const w = mobile ? inner - 34 : (inner - 72) / 3;
    rule(x, top, x + w, top);
    text(x, top + 48, branch.title, mobile ? 34 : 30, ink, 500);
    text(x + w, top + 48, branch.english, mobile ? 23 : 19, accent, 400, 'text-anchor="end"');
    branch.lines.forEach((value, j) => text(x, top + 100 + j * 42, value, mobile ? 30 : 26));
    text(x, top + 192, "产出 / " + branch.output, mobile ? 26 : 23, muted);
    if (mobile) path(`M${pad + 4} ${top + 12}H${pad + 20}`, accent, true);
  });
  if (mobile) path(`M${pad + 4} ${branchStart + 12}V${branchStart + 2 * 228 + 12}`, line);
  y = branchStart + (mobile ? 684 : 240);
  text(pad, y + 34, "一致性基准 → 贯穿关键帧与动态镜头", mobile ? 28 : 26, accent);
  y += 102;

  y = phase(y, "PHASE 03 / FRAME TO MOTION", "从静态画面到连续镜头");
  if (mobile) {
    step(content.steps[3], pad, y, inner);
    path(`M${pad + 12} ${y + 310}V${y + 344}`, muted, true);
    y += 382;
    step(content.steps[4], pad, y, inner);
    y += 326;
    rect(pad, y, inner, 136, "#6e617f");
    path(`M${pad + 40} ${y + 60}H${pad + 20}V${y + 28}H${pad + 42}`, accent, true);
    text(pad + 62, y + 43, "检查人物比例、产品外形与动作连续性", 28, ink);
    text(pad + 62, y + 91, "出现偏差 → 返回关键帧修正后重新生成", 28, accent);
    y += 200;
  } else {
    step(content.steps[3], pad, y, colWidth);
    step(content.steps[4], pad + colWidth + 64, y, colWidth);
    y += 325;
    path(`M${width - pad} ${y + 12}H${pad + 30}V${y - 8}H${pad + 4}`, accent, true);
    text(pad, y + 59, "人物比例 / 产品外形 / 动作连续性检查：出现偏差 → 返回关键帧修正后重新生成", 25, accent);
    y += 120;
  }

  y = phase(y, "PHASE 04 / EDIT & DELIVERY", "以剪辑与声音完成情绪");
  if (mobile) {
    step(content.steps[5], pad, y, inner);
    path(`M${pad + 12} ${y + 310}V${y + 344}`, muted, true);
    y += 382;
    step(content.steps[6], pad, y, inner);
  } else {
    step(content.steps[5], pad, y, colWidth);
    step(content.steps[6], pad + colWidth + 64, y, colWidth);
  }
  y += 353;
  rule(pad, y, width - pad, y);
  text(pad, y + 49, "AIRPODS MAX / AIGC CREATIVE FILM", mobile ? 23 : 20, muted);
  if (!mobile) text(width - pad, y + 49, "CONCEPT → CONSISTENCY → MOTION → FILM", 18, muted, 400, 'text-anchor="end"');
  const height = y + 92;
  return { width, height, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">AirPods Max AIGC 制作流程</title>
<desc id="desc">${escape(content.steps.map((item) => `${item.number} ${item.title}：${item.lines.join("")}产出：${item.output}。`).join(" ") + content.iteration)}</desc>
<defs><marker id="arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5" fill="${muted}"/></marker></defs>
<rect width="${width}" height="${height}" fill="#08090b"/>
<g font-family="Arial, 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif">
${elements.join("\n")}
</g>
</svg>\n` };
}

for (const mobile of [false, true]) {
  const { width, height, svg } = createDiagram(mobile);
  const name = `airpods-max-production-process${mobile ? "-mobile" : ""}-v1.svg`;
  await writeFile(new URL(`../public/aigc/project-02/${name}`, import.meta.url), svg);
  console.log(`${name}: ${width} × ${height}, ${Buffer.byteLength(svg)} bytes`);
}
