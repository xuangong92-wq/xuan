// 医学博士学位论文答辩 PPT 生成器
// 《AARS1 经组蛋白乳酸化修饰调控成纤维细胞铜死亡在瘢痕疙瘩形成中的作用及机制研究》
// 设计：深海军蓝(参照模板 183A6A) + 主题铜色(呼应"铜死亡")强调色
const PptxGenJS = require("pptxgenjs");
const pptx = new PptxGenJS();
pptx.defineLayout({ name: "W16x9", width: 13.333, height: 7.5 });
pptx.layout = "W16x9";
pptx.author = "武汉大学";
pptx.title = "AARS1-H3K18la-MT2A 轴调控成纤维细胞铜死亡与瘢痕疙瘩 · 博士学位论文答辩";

// ---------- 调色板 ----------
const NAVY = "183A6A";     // 主色 深海军蓝
const NAVY_DK = "0B1E37";  // 更深
const SLATE = "31475D";    // 次级蓝灰
const STEEL = "5B7BA8";    // 中蓝
const MIST = "EEF3FA";     // 最浅蓝灰 卡片底
const MIST2 = "DCE6F4";    // 浅钢蓝
const COPPER = "B4703C";   // 铜色强调(主题相关)
const COPPER_D = "8A5227";
const COPPER_L = "EADbca".toUpperCase();
const INK = "1F2733";      // 正文近黑
const MUTED = "6E7787";    // 辅助灰
const WHITE = "FFFFFF";
const LINE = "D6DEEA";
const FONT = "Microsoft YaHei";      // 微软雅黑(中文Office通用)
const FONTL = "Microsoft YaHei Light";

// ---------- 通用工具 ----------
function soft() { return { type: "outer", color: "8595AC", blur: 6, offset: 2, angle: 90, opacity: 0.28 }; }
function bg(slide, color) { slide.background = { color }; }

// 内容页页眉：编号胶囊 + 章节名 + 标题 + 右上校名 + 页脚
function header(slide, secNo, secName, title) {
  bg(slide, WHITE);
  // 左上：铜色小方块motif + 章节
  slide.addShape("rect", { x: 0.55, y: 0.52, w: 0.12, h: 0.12, fill: { color: COPPER }, line: { type: "none" } });
  slide.addShape("rect", { x: 0.71, y: 0.52, w: 0.12, h: 0.12, fill: { color: NAVY }, line: { type: "none" } });
  slide.addText([
    { text: secNo + "  ", options: { bold: true, color: COPPER, fontSize: 12 } },
    { text: secName, options: { bold: true, color: SLATE, fontSize: 12 } },
  ], { x: 0.92, y: 0.44, w: 8.5, h: 0.3, valign: "middle", fontFace: FONT, charSpacing: 1, margin: 0 });
  // 标题
  slide.addText(title, { x: 0.54, y: 0.78, w: 10.7, h: 0.7, fontFace: FONT, fontSize: 23, bold: true, color: NAVY, valign: "middle", margin: 0 });
  // 右上 校名占位（可替换为武汉大学校徽）
  slide.addText([
    { text: "武汉大学", options: { bold: true, color: NAVY, fontSize: 12 } },
    { text: "  WUHAN UNIVERSITY", options: { color: MUTED, fontSize: 7 } },
  ], { x: 9.4, y: 0.5, w: 3.4, h: 0.3, align: "right", valign: "middle", fontFace: FONT, margin: 0 });
  return 1.68; // content top y
}

function footer(slide, n) {
  slide.addText("AARS1 · H3K18la · MT2A · 铜死亡 · 瘢痕疙瘩", { x: 0.55, y: 7.06, w: 7, h: 0.3, fontFace: FONT, fontSize: 8, color: "9AA3AF", valign: "middle", margin: 0 });
  slide.addText([
    { text: "武汉大学博士学位论文答辩", options: { color: "9AA3AF", fontSize: 8 } },
    { text: "   " + String(n).padStart(2, "0") + " / 19", options: { color: COPPER, fontSize: 8, bold: true } },
  ], { x: 8.3, y: 7.06, w: 4.5, h: 0.3, align: "right", valign: "middle", fontFace: FONT, margin: 0 });
}

// 段落小卡：加粗导语 + 正文
function pointCard(slide, x, y, w, h, lead, body, opts) {
  opts = opts || {};
  const fill = opts.fill || MIST;
  slide.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { type: "none" }, shadow: soft() });
  slide.addShape("rect", { x: x + 0.2, y: y + 0.26, w: 0.1, h: 0.1, fill: { color: opts.mark || COPPER }, line: { type: "none" } });
  const runs = [{ text: lead, options: { bold: true, color: opts.leadColor || NAVY, fontSize: opts.leadSize || 14, breakLine: true } }];
  if (body) runs.push({ text: body, options: { color: opts.bodyColor || INK, fontSize: opts.bodySize || 11.5 } });
  slide.addText(runs, { x: x + 0.42, y: y + 0.05, w: w - 0.62, h: h - 0.1, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.1, margin: 0 });
}

// 一句话结论条（海军蓝底白字）
function takeaway(slide, x, y, w, h, text) {
  slide.addShape("roundRect", { x, y, w, h, rectRadius: 0.06, fill: { color: NAVY }, line: { type: "none" }, shadow: soft() });
  slide.addShape("rect", { x: x + 0.22, y: y + h / 2 - 0.09, w: 0.18, h: 0.18, fill: { color: COPPER }, line: { type: "none" } });
  slide.addText([
    { text: "结论  ", options: { bold: true, color: COPPER_L, fontSize: 11 } },
    { text: text, options: { color: WHITE, fontSize: 12.5, bold: true } },
  ], { x: x + 0.55, y: y, w: w - 0.75, h: h, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.02, margin: 0 });
}

// 图表占位框 —— 用户在此插入论文原图
function figBox(slide, x, y, w, h, tag, caption, suggestion) {
  slide.addShape("roundRect", { x, y, w, h, rectRadius: 0.05, fill: { color: "F5F8FC" }, line: { color: STEEL, width: 1.25, dashType: "dash" } });
  // 顶部标签条
  slide.addText([
    { text: "🖼  图表占位区", options: { color: STEEL, fontSize: 10, bold: true } },
  ], { x: x + 0.15, y: y + 0.12, w: w - 0.3, h: 0.28, valign: "middle", fontFace: FONT, margin: 0 });
  // 中央圆形图标
  const cy = y + h * 0.30;
  slide.addShape("ellipse", { x: x + w / 2 - 0.42, y: cy, w: 0.84, h: 0.84, fill: { color: WHITE }, line: { color: STEEL, width: 1.25 } });
  slide.addText("图", { x: x + w / 2 - 0.42, y: cy, w: 0.84, h: 0.84, align: "center", valign: "middle", fontFace: FONT, fontSize: 26, bold: true, color: NAVY });
  slide.addText([
    { text: tag + "  ", options: { bold: true, color: NAVY, fontSize: 13 } },
    { text: caption, options: { color: INK, fontSize: 12 } },
  ], { x: x + 0.3, y: y + h * 0.30 + 0.98, w: w - 0.6, h: 0.6, align: "center", valign: "top", fontFace: FONT, lineSpacingMultiple: 1.05, margin: 0 });
  slide.addShape("line", { x: x + w * 0.28, y: y + h - 1.02, w: w * 0.44, h: 0, line: { color: LINE, width: 1 } });
  slide.addText([
    { text: "图表建议：", options: { bold: true, color: COPPER, fontSize: 10.5 } },
    { text: suggestion, options: { color: MUTED, fontSize: 10.5 } },
  ], { x: x + 0.35, y: y + h - 0.9, w: w - 0.7, h: 0.82, align: "left", valign: "top", fontFace: FONT, lineSpacingMultiple: 1.08, margin: 0 });
}

// 章节水印大数字
function watermark(slide, num) {
  slide.addText(num, { x: 9.7, y: 4.7, w: 3.4, h: 2.6, align: "right", valign: "bottom", fontFace: "Arial", fontSize: 150, bold: true, color: "EEF2F8", margin: 0 });
}

// =========================================================
// SLIDE 1 —— 封面
// =========================================================
let s = pptx.addSlide();
bg(s, NAVY);
// 深色底 + 右侧竖向铜色/钢蓝色 分子motif（小方块阵列，非色条）
s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: NAVY }, line: { type: "none" } });
// 顶部细节：三色小方块 motif
for (let i = 0; i < 3; i++) s.addShape("rect", { x: 0.9 + i * 0.26, y: 0.9, w: 0.16, h: 0.16, fill: { color: [COPPER, STEEL, WHITE][i] }, line: { type: "none" } });
s.addText([
  { text: "武汉大学  博士学位论文（专业学位）答辩", options: { color: "C7D3E6", fontSize: 13, bold: true } },
], { x: 0.9, y: 1.28, w: 11, h: 0.35, fontFace: FONT, charSpacing: 2, margin: 0 });
s.addText("AARS1 经组蛋白乳酸化修饰调控成纤维细胞铜死亡\n在瘢痕疙瘩形成中的作用及机制研究", {
  x: 0.88, y: 1.95, w: 11.5, h: 1.9, fontFace: FONT, fontSize: 33, bold: true, color: WHITE, lineSpacingMultiple: 1.16, valign: "top", margin: 0,
});
s.addText("The Role and Mechanism of AARS1 in Regulating Fibroblast Cuproptosis via Histone Lactylation in Keloid Formation", {
  x: 0.9, y: 3.95, w: 11.2, h: 0.7, fontFace: FONT, fontSize: 13, italic: true, color: "AEBCD4", lineSpacingMultiple: 1.1, margin: 0,
});
// 关键词标签
const kws = ["AARS1", "H3K18la", "MT2A", "铜死亡", "瘢痕疙瘩"];
let kx = 0.9;
kws.forEach((k) => {
  const w = 0.5 + k.length * (/[A-Za-z0-9]/.test(k) ? 0.13 : 0.28);
  s.addShape("roundRect", { x: kx, y: 4.75, w, h: 0.42, rectRadius: 0.21, fill: { color: "24437A" }, line: { color: STEEL, width: 0.75 } });
  s.addText(k, { x: kx, y: 4.75, w, h: 0.42, align: "center", valign: "middle", fontFace: FONT, fontSize: 11.5, color: "DCE6F4", bold: true, margin: 0 });
  kx += w + 0.2;
});
// 底部信息条
s.addShape("line", { x: 0.9, y: 5.7, w: 11.5, h: 0, line: { color: "3A5488", width: 1 } });
s.addText([
  { text: "答辩人：", options: { color: "9FB0CC", fontSize: 12 } }, { text: "XXX", options: { color: WHITE, fontSize: 12, bold: true } },
  { text: "        导师：", options: { color: "9FB0CC", fontSize: 12 } }, { text: "XXX 教授", options: { color: WHITE, fontSize: 12, bold: true } },
  { text: "        学科专业：", options: { color: "9FB0CC", fontSize: 12 } }, { text: "外科学（整形外科）", options: { color: WHITE, fontSize: 12, bold: true } },
], { x: 0.9, y: 5.9, w: 11.5, h: 0.4, fontFace: FONT, valign: "middle", margin: 0 });
s.addText([
  { text: "培养单位：", options: { color: "9FB0CC", fontSize: 12 } }, { text: "武汉大学 · 基础医学院／临床医学", options: { color: WHITE, fontSize: 12, bold: true } },
  { text: "        答辩日期：", options: { color: "9FB0CC", fontSize: 12 } }, { text: "2026 年 4 月", options: { color: WHITE, fontSize: 12, bold: true } },
], { x: 0.9, y: 6.35, w: 11.5, h: 0.4, fontFace: FONT, valign: "middle", margin: 0 });
s.addNotes("各位老师好！我是XXX，我的博士学位论文题目是《AARS1经组蛋白乳酸化修饰调控成纤维细胞铜死亡在瘢痕疙瘩形成中的作用及机制研究》，指导教师是XXX教授。下面向各位评审专家汇报我的研究工作，敬请批评指正。本研究围绕瘢痕疙瘩成纤维细胞的‘死亡抵抗’这一核心难题，从代谢—表观遗传—细胞死亡的新视角，揭示了一条全新的调控轴。");

// =========================================================
// SLIDE 2 —— 目录
// =========================================================
s = pptx.addSlide();
bg(s, NAVY);
s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: NAVY }, line: { type: "none" } });
// 左侧 目录标题块
s.addText("目录", { x: 0.9, y: 2.2, w: 4, h: 1.2, fontFace: FONT, fontSize: 60, bold: true, color: WHITE, margin: 0 });
s.addText("CONTENTS", { x: 0.98, y: 3.45, w: 4, h: 0.5, fontFace: FONT, fontSize: 18, color: COPPER, bold: true, charSpacing: 6, margin: 0 });
s.addShape("line", { x: 1.0, y: 4.15, w: 2.6, h: 0, line: { color: "3A5488", width: 1.5 } });
s.addText("发现现象 · 阐明机制 · 体内验证", { x: 1.0, y: 4.35, w: 4.2, h: 0.5, fontFace: FONT, fontSize: 13, color: "9FB0CC", margin: 0 });
// 右侧 六个条目
const toc = [
  ["01", "研究背景与目的", "临床困境 · 科学问题 · 假说与目标"],
  ["02", "研究思路与技术路线", "发现现象—阐明机制—体内验证 三部曲"],
  ["03", "研究结果", "单细胞图谱 · 机制解析 · 体内验证（8 项）"],
  ["04", "研究结论", "AARS1-H3K18la-MT2A-铜死亡 全新分子轴"],
  ["05", "创新点与研究意义", "三大创新 · 理论与临床价值"],
  ["06", "局限性与研究展望", "不足之处 · 未来方向"],
];
let ty = 1.15;
toc.forEach((t) => {
  s.addText(t[0], { x: 5.55, y: ty, w: 0.9, h: 0.9, fontFace: "Arial", fontSize: 34, bold: true, color: COPPER, valign: "middle", margin: 0 });
  s.addText(t[1], { x: 6.5, y: ty + 0.05, w: 6.3, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: WHITE, valign: "middle", margin: 0 });
  s.addText(t[2], { x: 6.52, y: ty + 0.52, w: 6.3, h: 0.35, fontFace: FONT, fontSize: 10.5, color: "9FB0CC", valign: "middle", margin: 0 });
  ty += 0.97;
});
s.addNotes("我的汇报分为六个部分：第一，研究背景与目的；第二，研究思路与技术路线；第三，研究结果，这是汇报的重点，共八项结果，按‘发现现象—阐明机制—体内验证’三部分展开；第四，研究结论；第五，创新点与研究意义；第六，局限性与展望。");

// =========================================================
// SLIDE 3 —— 01 研究背景：临床困境
// =========================================================
s = pptx.addSlide();
let y0 = header(s, "01", "研究背景与目的", "瘢痕疙瘩：沉重的临床负担与治疗困境");
watermark(s, "01");
pointCard(s, 0.55, y0, 5.85, 1.28,
  "疾病特征", "皮肤损伤后典型的纤维增生性疾病，胶原过度沉积、病灶浸润性生长、易复发。");
pointCard(s, 0.55, y0 + 1.42, 5.85, 1.28,
  "核心机制", "成纤维细胞是关键效应细胞；其“凋亡抵抗（不死性）”是发病与复发的核心。");
pointCard(s, 0.55, y0 + 2.84, 5.85, 1.28,
  "治疗困境", "手术、激素、放疗等手段难以有效清除病理性细胞，缺乏根治手段。");
takeaway(s, 0.55, y0 + 4.26, 5.85, 0.72, "如何“清除”而非仅“抑制”病理性成纤维细胞，是治疗的关键突破口。");
figBox(s, 6.7, y0, 6.08, 4.98, "图 1｜临床与细胞背景",
  "瘢痕疙瘩大体照片与成纤维细胞浸润示意",
  "建议放临床大体照片 +（正常皮肤 vs 瘢痕）HE/Masson 对比，直观呈现胶原过度沉积与浸润性生长。");
footer(s, 3);
s.addNotes("瘢痕疙瘩是皮肤损伤后常见的纤维增生性疾病，表现为胶原过度沉积、超出原始损伤范围的浸润性生长和很高的复发率。它的核心病理是成纤维细胞获得了‘凋亡抵抗’、也就是‘不死’的特性。现有的手术、激素注射、放疗等手段，往往只能抑制而无法清除这群病理细胞，因此复发率居高不下。这提示我们：能否主动‘清除’而非仅仅‘抑制’这群细胞，是实现根治的关键。");

// =========================================================
// SLIDE 4 —— 01 研究现状与科学问题
// =========================================================
s = pptx.addSlide();
y0 = header(s, "01", "研究背景与目的", "研究现状与科学问题：被忽视的“写入酶”与铜死亡");
watermark(s, "01");
// 左：时间线三节点
const tl = [
  ["2019", "组蛋白乳酸化(Kla)", "Zhang 等《Nature》首次报道，架起“代谢—基因表达”桥梁；纤维化中乳酸化放大炎症与纤维化。"],
  ["2022", "铜死亡(Cuproptosis)", "Tsvetkov 等提出铜依赖的新型程序性死亡，经 DLAT 脂酰化聚集、FDX1 执行。"],
  ["缺口", "写入酶 × 铜死亡", "领域多聚焦“底物驱动”的全局乳酸化，忽视关键“写入酶”的位点特异调控；瘢痕中写入酶、靶基因及其与铜死亡的联系空白。"],
];
let yy = y0;
tl.forEach((t, i) => {
  const h = i === 2 ? 1.6 : 1.18;
  s.addShape("roundRect", { x: 0.55, y: yy, w: 5.9, h, rectRadius: 0.06, fill: { color: i === 2 ? MIST2 : MIST }, line: { type: "none" }, shadow: soft() });
  s.addShape("roundRect", { x: 0.55, y: yy, w: 1.15, h, rectRadius: 0.06, fill: { color: i === 2 ? COPPER : NAVY }, line: { type: "none" } });
  s.addText(t[0], { x: 0.55, y: yy, w: 1.15, h, align: "center", valign: "middle", fontFace: FONT, fontSize: i === 2 ? 15 : 18, bold: true, color: WHITE, margin: 0 });
  s.addText([
    { text: t[1] + "\n", options: { bold: true, color: NAVY, fontSize: 13.5 } },
    { text: t[2], options: { color: INK, fontSize: 11 } },
  ], { x: 1.85, y: yy + 0.04, w: 4.5, h: h - 0.08, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.08, margin: 0 });
  yy += h + 0.14;
});
figBox(s, 6.7, y0, 6.08, 4.98, "图 2｜科学问题示意",
  "“代谢重编程—乳酸化修饰—铜死亡逃逸”三角关系",
  "建议用三角/闭环示意图串联三大特征，并标注课题组前期发现：多种写入酶高表达、AARS1 特异高表达、铜死亡通路受抑。");
footer(s, 4);
s.addNotes("2019年，Zhang等在《Nature》首次报道组蛋白乳酸化修饰，把细胞代谢和基因表达直接联系起来；随后发现它在肾纤维化、皮肤瘢痕中放大炎症与纤维化。2022年，铜死亡作为一种铜依赖的新型程序性死亡被提出。但现有研究大多是‘底物驱动’的思路，只关注乳酸浓度升高导致的全局乳酸化，忽略了真正决定位点特异性的‘写入酶’。在瘢痕疙瘩里，乳酸化的整体特征、关键写入酶、下游靶基因，以及它和铜死亡之间的联系，都还是空白。我们课题组前期的单细胞分析恰恰发现：多种写入酶高表达、AARS1特异性高表达、而铜死亡通路显著受抑——这正是本课题的切入点。");

// =========================================================
// SLIDE 5 —— 01 科学假说与研究目标
// =========================================================
s = pptx.addSlide();
y0 = header(s, "01", "研究背景与目的", "科学假说与研究目标");
watermark(s, "01");
// 假说大卡（navy）
s.addShape("roundRect", { x: 0.55, y: y0, w: 12.25, h: 1.98, rectRadius: 0.07, fill: { color: NAVY }, line: { type: "none" }, shadow: soft() });
s.addText([{ text: "科 学 假 说", options: { color: COPPER_L, fontSize: 12, bold: true } }], { x: 0.85, y: y0 + 0.16, w: 3, h: 0.32, fontFace: FONT, charSpacing: 3, margin: 0 });
s.addText("在高糖酵解、乳酸蓄积的瘢痕微环境中，异常高表达的 AARS1 突破经典氨酰-tRNA 合成酶功能，作为乳酸化“写入酶”提升 H3K18la 水平并富集于 MT2A 启动子，表观激活 MT2A 转录、维持铜稳态、抑制 DLAT 聚集介导的铜死亡，从而赋予成纤维细胞生存优势、驱动瘢痕形成。",
  { x: 0.85, y: y0 + 0.52, w: 11.65, h: 1.34, fontFace: FONT, fontSize: 14.5, color: WHITE, lineSpacingMultiple: 1.22, valign: "middle", margin: 0 });
// 三目标
const aims = [
  ["目标一", "表达与功能", "解析微环境代谢—表观特征，明确 AARS1 特异性高表达并初验其对增殖与铜死亡的调控。"],
  ["目标二", "分子机制", "阐明 AARS1-H3K18la-MT2A 轴表观激活 MT2A、抑制铜死亡的分子机制。"],
  ["目标三", "体内验证", "在裸鼠瘢痕模型中验证该轴对瘢痕形成的调控与可干预性、评估转化潜力。"],
];
aims.forEach((a, i) => {
  const x = 0.55 + i * 4.13;
  s.addShape("roundRect", { x, y: y0 + 2.2, w: 3.95, h: 2.55, rectRadius: 0.07, fill: { color: MIST }, line: { type: "none" }, shadow: soft() });
  s.addShape("ellipse", { x: x + 0.28, y: y0 + 2.45, w: 0.72, h: 0.72, fill: { color: NAVY }, line: { type: "none" } });
  s.addText(String(i + 1), { x: x + 0.28, y: y0 + 2.45, w: 0.72, h: 0.72, align: "center", valign: "middle", fontFace: "Arial", fontSize: 24, bold: true, color: WHITE, margin: 0 });
  s.addText(a[1], { x: x + 1.12, y: y0 + 2.5, w: 2.7, h: 0.62, fontFace: FONT, fontSize: 15, bold: true, color: NAVY, valign: "middle", margin: 0 });
  s.addText(a[0], { x: x + 1.12, y: y0 + 2.46, w: 2.7, h: 0.3, fontFace: FONT, fontSize: 9.5, color: COPPER, bold: true, margin: 0, valign: "top" });
  s.addShape("line", { x: x + 0.3, y: y0 + 3.32, w: 3.35, h: 0, line: { color: LINE, width: 1 } });
  s.addText(a[2], { x: x + 0.3, y: y0 + 3.42, w: 3.4, h: 1.2, fontFace: FONT, fontSize: 11.5, color: INK, lineSpacingMultiple: 1.15, valign: "top", margin: 0 });
});
footer(s, 5);
s.addNotes("基于以上现状与前期线索，我提出如下科学假说：在高糖酵解、乳酸蓄积的瘢痕微环境中，异常高表达的AARS1不再只是翻译管家，而是作为乳酸化‘写入酶’，特异性提升H3K18的乳酸化水平，并把它富集到铜稳态关键基因MT2A的启动子上，从而激活MT2A转录、维持铜稳态、抑制铜死亡，最终让成纤维细胞获得生存优势、驱动瘢痕形成。围绕这一假说，我设置了三个递进的研究目标：明确表达与功能、阐明分子机制、完成体内验证。");

// =========================================================
// SLIDE 6 —— 02 技术路线
// =========================================================
s = pptx.addSlide();
y0 = header(s, "02", "研究思路与技术路线", "研究思路：发现现象 — 阐明机制 — 体内验证");
watermark(s, "02");
const parts = [
  ["第一部分", "发现现象", "单细胞转录组整合分析\n组织/细胞水平验证", ["scRNA-seq 细胞图谱", "乳酸化↑ / 铜死亡↓ 通路评分", "AARS1 特异高表达", "siAARS1 功能初探"]],
  ["第二部分", "阐明机制", "多组学 + 表观遗传实验\n分子机制解析", ["RNA-seq 锁定 MT2A", "CUT&Tag / ChIP-qPCR", "双荧光素酶报告基因", "WB / 激光共聚焦"]],
  ["第三部分", "体内验证", "裸鼠瘢痕模型\n慢病毒基因干预", ["shAARS1 敲低 / MT2A 过表达", "Masson 胶原染色", "组织铜与代谢物检测", "FDX1 免疫组化"]],
];
parts.forEach((p, i) => {
  const x = 0.55 + i * 4.16;
  // 头部navy块
  s.addShape("roundRect", { x, y: y0, w: 3.95, h: 1.15, rectRadius: 0.06, fill: { color: i === 2 ? COPPER : NAVY }, line: { type: "none" }, shadow: soft() });
  s.addText(p[0], { x: x + 0.2, y: y0 + 0.14, w: 3.6, h: 0.34, fontFace: FONT, fontSize: 11, color: i === 2 ? COPPER_L : "9FB0CC", bold: true, margin: 0 });
  s.addText(p[1], { x: x + 0.2, y: y0 + 0.44, w: 3.6, h: 0.6, fontFace: FONT, fontSize: 21, bold: true, color: WHITE, valign: "middle", margin: 0 });
  // 方法说明
  s.addShape("roundRect", { x, y: y0 + 1.3, w: 3.95, h: 0.9, rectRadius: 0.05, fill: { color: MIST2 }, line: { type: "none" } });
  s.addText(p[2], { x: x + 0.2, y: y0 + 1.34, w: 3.6, h: 0.82, fontFace: FONT, fontSize: 11, color: SLATE, bold: true, align: "center", valign: "middle", lineSpacingMultiple: 1.05, margin: 0 });
  // 要点列表
  s.addShape("roundRect", { x, y: y0 + 2.32, w: 3.95, h: 2.5, rectRadius: 0.05, fill: { color: MIST }, line: { type: "none" }, shadow: soft() });
  const items = p[3].map((it, k) => ({ text: it, options: { bullet: { code: "25AA", indent: 14 }, color: INK, fontSize: 11.5, breakLine: true, paraSpaceAfter: 8, colorbullet: COPPER } }));
  s.addText(p[3].map((it) => ({ text: it, options: { bullet: { code: "25AA", indent: 12 }, color: INK, fontSize: 11.5, breakLine: true, paraSpaceAfter: 7 } })),
    { x: x + 0.28, y: y0 + 2.5, w: 3.55, h: 2.2, fontFace: FONT, valign: "top", margin: 0 });
  // 箭头连接
  if (i < 2) s.addText("▶", { x: x + 3.9, y: y0 + 0.35, w: 0.35, h: 0.5, align: "center", valign: "middle", fontFace: "Arial", fontSize: 16, color: COPPER, margin: 0 });
});
footer(s, 6);
s.addNotes("整个研究按照‘发现现象—阐明机制—体内验证’的三段式逻辑展开。第一部分是发现现象：整合单细胞转录组，刻画瘢痕微环境的代谢与表观特征，锁定AARS1并做功能初探。第二部分是阐明机制：用RNA-seq、CUT&Tag、ChIP-qPCR、双荧光素酶、Western blot和共聚焦，一步步解析AARS1-H3K18la-MT2A轴如何抑制铜死亡。第三部分是体内验证：在裸鼠瘢痕模型上用慢病毒敲低AARS1、过表达MT2A，从整体水平验证结论并评估转化潜力。");

// =========================================================
// 结果页统一渲染器（文本三卡 + 结论条 + 图占位）
// =========================================================
function resultSlide(n, secTitle, title, cards, tk, fig, notes, figLeft) {
  const sl = pptx.addSlide();
  const yy0 = header(sl, "03", "研究结果", title);
  watermark(sl, "03");
  const textX = figLeft ? 6.98 : 0.55;
  const figX = figLeft ? 0.55 : 6.7;
  // 三卡
  const ch = 1.28, gap = 0.14;
  cards.forEach((c, i) => pointCard(sl, textX, yy0 + i * (ch + gap), 5.85, ch, c[0], c[1], c[2] || {}));
  takeaway(sl, textX, yy0 + 3 * (ch + gap), 5.85, 0.72, tk);
  figBox(sl, figX, yy0, 6.08, 4.98, fig[0], fig[1], fig[2]);
  footer(sl, n);
  sl.addNotes(notes);
  return sl;
}

// SLIDE 7 —— 结果1 单细胞图谱
resultSlide(7, "研究结果", "结果一 · 单细胞图谱揭示“代谢-表观-死亡”三通路失衡",
  [
    ["细胞图谱重塑", "整合瘢痕与正常皮肤 scRNA-seq，注释 20 个细胞簇；瘢痕中成纤维细胞比例显著升高。"],
    ["代谢与表观激活", "乳酸代谢与组蛋白乳酸化通路评分显著升高（LDHA、PKM2、GLUT3 等上调）。"],
    ["铜死亡受抑", "成纤维细胞中铜死亡通路评分显著降低，提示存在主动的死亡逃逸。"],
  ],
  "瘢痕微环境呈现“乳酸化↑ / 铜死亡↓”的协同失衡格局。",
  ["图 3｜Fig.1 + Fig.S1", "单细胞图谱与通路评分",
    "建议：UMAP 细胞注释（Fig.S1）+ 成纤维细胞比例柱图 + 乳酸化/铜死亡通路 AddModuleScore 小提琴图或热图（Fig.1）。"],
  "第一项结果来自单细胞转录组。我们整合了瘢痕疙瘩和正常皮肤的scRNA-seq数据，降维聚类得到20个细胞簇，发现瘢痕中成纤维细胞比例明显升高。进一步做通路打分，乳酸代谢和组蛋白乳酸化通路显著上调，LDHA、PKM2、GLUT3等关键酶升高；而铜死亡通路评分显著下降。也就是说，瘢痕微环境呈现出‘乳酸化升高、铜死亡受抑’的协同失衡——这为后续锁定写入酶提供了方向。");

// SLIDE 8 —— 结果2 细胞通讯 & AARS1
resultSlide(8, "研究结果", "结果二 · 成纤维细胞信号强化与 AARS1 异常高表达",
  [
    ["细胞通讯增强", "CellChat 显示 COLLAGEN、LAMININ、FN1、TGF-β 等成纤维细胞输出信号显著增强。"],
    ["AARS1 特异高表达", "差异分析结合组织/细胞验证，证实 AARS1 在瘢痕成纤维细胞中特异性高表达。"],
    ["定位与功能转变", "AARS1 由胞质翻译“管家”转向核内定位，提示其发挥“乳酸化写入酶”功能。"],
  ],
  "AARS1 是连接代谢—乳酸化—铜死亡逃逸的关键候选枢纽。",
  ["图 4｜Fig.S2 + Fig.1", "细胞通讯网络与 AARS1 表达",
    "建议：CellChat 信号通路气泡图/网络图（Fig.S2）+ AARS1 表达（qPCR/WB/免疫荧光核定位，Fig.1）。"],
  "第二项结果聚焦细胞通讯和AARS1本身。CellChat分析显示，瘢痕中COLLAGEN、LAMININ、FN1、TGF-β等以成纤维细胞为输出的信号明显增强，说明纤维化微环境非常活跃。在多种候选写入酶里，AARS1在瘢痕成纤维细胞中特异性高表达，我们在组织和细胞两个层面都做了验证。更重要的是，AARS1从经典的胞质翻译管家，转向了细胞核内定位，这提示它在细胞核里承担了‘乳酸化写入酶’的新功能，成为连接代谢、乳酸化和铜死亡逃逸的关键枢纽。", true);

// SLIDE 9 —— 结果3 敲低AARS1
resultSlide(9, "研究结果", "结果三 · 敲低 AARS1 抑制增殖并重新激活铜死亡",
  [
    ["增殖显著受抑", "siAARS1 后 CCK-8 活性与 EdU 阳性率显著下降，细胞增殖能力明显减弱。"],
    ["代谢稳态被打破", "胞内游离铜离子升高，α-酮戊二酸、丙酮酸降低，三羧酸循环受扰。"],
    ["铜死亡被激活", "FDX1 表达上调、DLAT 异常聚集，铜死亡通路被重新点燃。"],
  ],
  "AARS1 是维持瘢痕成纤维细胞“高增殖、低死亡”表型的关键。",
  ["图 5｜Fig.2", "AARS1 敲低的功能与铜死亡表型",
    "建议：siRNA 筛选 qPCR + CCK-8 + EdU + 铜/α-KG/丙酮酸柱状图 + FDX1 免疫荧光（Fig.2 A–F）。"],
  "第三项是功能实验。我们用siRNA敲低AARS1，先看增殖：CCK-8和EdU都显示细胞活性和增殖率显著下降。再看代谢：胞内游离铜离子升高，而α-酮戊二酸和丙酮酸下降，说明三羧酸循环这一铜死亡的代谢基础被打乱。最后看死亡标志：FDX1上调、DLAT出现异常聚集，铜死亡被重新激活。三条证据一致说明，AARS1是维持瘢痕成纤维细胞‘高增殖、低死亡’表型的关键。");

// SLIDE 10 —— 结果4 RNA-seq → MT2A
resultSlide(10, "研究结果", "结果四 · RNA-seq 锁定下游核心分子 MT2A",
  [
    ["转录组重塑", "siAARS1 引起大量差异表达基因；火山图显示广泛的表达变化。"],
    ["通路富集", "KEGG 富集于纤维化相关通路，Hallmark 显示 EMT 通路被激活。"],
    ["核心候选 MT2A", "差异基因中锁定金属硫蛋白 MT2A —— 负责铜缓冲与氧化应激防御。"],
  ],
  "MT2A 是 AARS1 调控铜死亡最可能的下游“铜缓冲”枢纽。",
  ["图 6｜Fig.3", "AARS1 敲低转录组分析",
    "建议：火山图 + GO 富集 + KEGG 通路 + Hallmark(EMT) 条形图 + MT2A 表达变化（Fig.3 A–E）。"],
  "从这一项开始进入第二部分——机制解析。我们对siNC和siAARS1做了RNA-seq。火山图显示敲低AARS1引起大量基因表达改变；KEGG富集到纤维化相关通路，Hallmark分析发现上皮间充质转化EMT被激活。在这些差异基因里，我们特别关注了金属硫蛋白MT2A——它参与铜离子缓冲和氧化应激防御，正好和铜死亡表型吻合。因此我们把MT2A锁定为AARS1调控铜死亡最可能的下游枢纽。", true);

// SLIDE 11 —— 结果5 CUT&Tag
resultSlide(11, "研究结果", "结果五 · CUT&Tag 揭示 AARS1 重塑 H3K18la 修饰景观",
  [
    ["修饰景观重塑", "H3K18la 主要富集于启动子区；敲低 AARS1 后整体修饰景观显著改变。"],
    ["靶基因富集", "H3K18la 下降的基因显著富集于铜死亡与代谢相关通路。"],
    ["直接靶点 MT2A", "基因组浏览器显示 MT2A 启动子存在明显 H3K18la 峰，敲低后显著降低。"],
  ],
  "AARS1 通过 H3K18la 直接“写”在 MT2A 启动子上。",
  ["图 7｜Fig.4", "H3K18la CUT&Tag 分析",
    "建议：H3K18la 信号热图 + 峰基因组注释饼图 + 差异峰 + GO/KEGG + MT2A 启动子 genome-browser track（Fig.4 A–F）。"],
  "第五项用CUT&Tag直接检测H3K18的乳酸化修饰。热图显示H3K18la主要富集在基因启动子区；敲低AARS1后，整个修饰景观被明显重塑。对H3K18la下降的基因做富集分析，它们集中在铜死亡和代谢相关通路。最关键的是基因组浏览器结果：在对照组，MT2A启动子上有一个清晰的H3K18la富集峰，敲低AARS1后这个峰显著降低。这说明AARS1是通过H3K18la，直接‘写’在MT2A启动子上的。");

// SLIDE 12 —— 结果6 AARS1经H3K18la激活MT2A
resultSlide(12, "研究结果", "结果六 · AARS1 经 H3K18la 表观激活 MT2A 转录",
  [
    ["全局修饰下降", "Western blot 证实敲低 AARS1 后 H3K18la 整体水平显著下降。"],
    ["启动子占位减少", "ChIP-qPCR 显示 MT2A 启动子 H3K18la 富集与 RNA 聚合酶 II 占位同步下降。"],
    ["转录活性受控", "双荧光素酶报告基因证实 AARS1 正向调控 MT2A 启动子活性。"],
  ],
  "“写入酶”功能被直接证实：AARS1→H3K18la→MT2A 转录激活。",
  ["图 8｜Fig.5 A–D", "MT2A 表观激活的分子证据",
    "建议：H3K18la Western blot + MT2A 启动子 ChIP-qPCR + RNA Pol II ChIP + 双荧光素酶报告基因（Fig.5 A–D）。"],
  "第六项从多个角度证实AARS1的‘写入酶’功能。首先，Western blot显示敲低AARS1后，H3K18la的整体水平明显下降。其次，ChIP-qPCR显示MT2A启动子上的H3K18la富集和RNA聚合酶II占位同步减少，说明转录起始被削弱。最后，双荧光素酶报告基因实验证实AARS1正向调控MT2A启动子活性。三者结合，直接证实了‘AARS1→H3K18la→MT2A转录激活’这条表观调控链。", true);

// SLIDE 13 —— 结果7 MT2A挽救实验
resultSlide(13, "研究结果", "结果七 · MT2A 挽救实验：回补逆转铜死亡表型",
  [
    ["功能回补", "siAARS1 后回补 MT2A，可显著恢复细胞活性与 EdU 增殖能力。"],
    ["铜稳态恢复", "MT2A 回补降低胞内游离铜、回升 α-KG 与丙酮酸，重建代谢稳态。"],
    ["抑制铜死亡", "DLAT 异常聚集减少、FDX1 回落，铜死亡被重新抑制。"],
  ],
  "MT2A 是 AARS1 抑制铜死亡的关键“执行者”，构成 AARS1-MT2A 轴。",
  ["图 9｜Fig.6", "MT2A 挽救实验（siAARS1 + MT2A OE）",
    "建议：CCK-8 + EdU + 铜/α-KG/丙酮酸 + DLAT 共聚焦聚集 + MT2A/FDX1 免疫荧光的挽救分组对比（Fig.6 A–F）。"],
  "第七项是关键的挽救实验，用来确认MT2A就是那个下游执行者。我们在敲低AARS1的基础上回补MT2A：结果细胞活性和EdU增殖能力显著恢复；胞内游离铜下降、α-酮戊二酸和丙酮酸回升，代谢稳态被重建；DLAT的异常聚集减少、FDX1回落，铜死亡被重新抑制。也就是说，MT2A的回补能够逆转敲低AARS1造成的表型。这在功能上证明，MT2A是AARS1抑制铜死亡的关键执行者，二者共同构成AARS1-MT2A调控轴。");

// SLIDE 14 —— 结果8 体内验证
resultSlide(14, "研究结果", "结果八 · 裸鼠体内验证：瘢痕形成与铜死亡重塑",
  [
    ["瘢痕显著减轻", "shAARS1 组瘢痕体积减小、Masson 胶原沉积显著减少。"],
    ["代谢与铜稳态改变", "组织游离铜升高，α-KG、丙酮酸降低，铜死亡代谢特征增强。"],
    ["MT2A 回补逆转", "过表达 MT2A 可部分逆转上述抗纤维化效应，FDX1 免疫组化随之改变。"],
  ],
  "体内验证 AARS1-MT2A 轴是调控瘢痕形成的核心可干预通路。",
  ["图 10｜Fig.7", "体内瘢痕模型与铜死亡指标",
    "建议：各组瘢痕大体照 + Masson 染色 + AARS1/MT2A qPCR + 组织铜/α-KG/丙酮酸 + FDX1 免疫组化（Fig.7 A–F）。"],
  "第三部分是体内验证。我们构建裸鼠瘢痕模型，用慢病毒敲低AARS1或过表达MT2A。大体观察和Masson染色显示，敲低AARS1后瘢痕体积明显减小、胶原沉积显著减少；组织检测发现游离铜升高、α-酮戊二酸和丙酮酸下降，铜死亡的代谢特征增强，FDX1免疫组化也相应改变。而过表达MT2A能够部分逆转这种抗纤维化效应。这就在整体动物水平证明，AARS1-MT2A轴是调控瘢痕形成的核心通路，而且是可以被干预的。", true);

// =========================================================
// SLIDE 15 —— 04 研究结论 + 机制模式图
// =========================================================
s = pptx.addSlide();
y0 = header(s, "04", "研究结论", "研究结论：AARS1-H3K18la-MT2A-铜死亡 全新分子轴");
watermark(s, "04");
// 左：结论要点
const concl = [
  ["核心结论", "AARS1 是瘢痕成纤维细胞铜死亡抵抗的核心负向调节因子。"],
  ["调控机制", "AARS1 经 H3K18la 激活 MT2A，重塑代谢稳态、抑制铜死亡。"],
  ["表型结局", "赋予成纤维细胞“高增殖、低死亡”表型，驱动瘢痕形成。"],
  ["认知突破", "首次打通“代谢—表观遗传—铜死亡”跨网络调控链条。"],
];
concl.forEach((c, i) => {
  const yc = y0 + i * 0.98;
  s.addShape("roundRect", { x: 0.55, y: yc, w: 5.85, h: 0.86, rectRadius: 0.06, fill: { color: i === 3 ? MIST2 : MIST }, line: { type: "none" }, shadow: soft() });
  s.addShape("ellipse", { x: 0.72, y: yc + 0.19, w: 0.48, h: 0.48, fill: { color: i === 3 ? COPPER : NAVY }, line: { type: "none" } });
  s.addText(String(i + 1), { x: 0.72, y: yc + 0.19, w: 0.48, h: 0.48, align: "center", valign: "middle", fontFace: "Arial", fontSize: 16, bold: true, color: WHITE, margin: 0 });
  s.addText([
    { text: c[0] + "　", options: { bold: true, color: i === 3 ? COPPER_D : NAVY, fontSize: 13 } },
    { text: c[1], options: { color: INK, fontSize: 11.5 } },
  ], { x: 1.4, y: yc, w: 4.9, h: 0.86, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.05, margin: 0 });
});
figBox(s, 6.7, y0, 6.08, 3.92, "图 11｜Fig.8 机制模式图",
  "AARS1-H3K18la-MT2A-铜死亡 工作模型",
  "建议：放论文机制总结图（Graphical Abstract / Fig.8），突出乳酸→AARS1→H3K18la→MT2A→铜稳态→抑制铜死亡→瘢痕形成的完整链条。");
// 底部一句话总纲
s.addShape("roundRect", { x: 6.7, y: y0 + 4.06, w: 6.08, h: 0.92, rectRadius: 0.06, fill: { color: NAVY }, line: { type: "none" }, shadow: soft() });
s.addText("乳酸 → AARS1 → H3K18la → MT2A → 铜稳态 → 抑制铜死亡 → 瘢痕形成",
  { x: 6.85, y: y0 + 4.06, w: 5.8, h: 0.92, valign: "middle", align: "center", fontFace: FONT, fontSize: 12.5, bold: true, color: WHITE, lineSpacingMultiple: 1.05, margin: 0 });
footer(s, 15);
s.addNotes("综合以上结果，可以得出核心结论：AARS1是瘢痕成纤维细胞铜死亡抵抗的核心负向调节因子。它通过介导H3K18la修饰激活MT2A表达，重塑细胞代谢稳态、抑制铜死亡，最终赋予成纤维细胞‘高增殖、低死亡’的病理表型，驱动瘢痕形成。本研究首次构建并验证了AARS1-H3K18la-MT2A-铜死亡受抑这条全新分子轴，打破了AARS1只参与胞质翻译的经典认知，第一次打通了‘代谢—表观遗传—铜死亡’的跨网络调控链条。右边这张机制模式图，完整概括了从乳酸到瘢痕形成的整条通路。");

// =========================================================
// SLIDE 16 —— 05 创新点
// =========================================================
s = pptx.addSlide();
y0 = header(s, "05", "创新点与研究意义", "研究创新点");
watermark(s, "05");
const inno = [
  ["01", "发现全新“写入酶”功能", "首次发现组蛋白乳酸化“写入酶”AARS1 在瘢痕疙瘩微环境中异常高表达，并揭示其维持成纤维细胞死亡抵抗的功能，提供全新的“代谢—表观遗传”视角。"],
  ["02", "阐明全新调控轴机制", "首次阐明 AARS1-H3K18la-MT2A 表观调控轴抑制铜死亡的新机制，打通“代谢—表观遗传—细胞死亡”分子链条；回补 MT2A 可逆转表型。"],
  ["03", "提出全新抗纤维策略", "体内验证靶向 AARS1-MT2A 轴激活铜死亡可抑制瘢痕形成，提出“精准诱发代谢性死亡”的三位一体抗纤维化新策略，具临床转化潜力。"],
];
inno.forEach((it, i) => {
  const x = 0.55 + i * 4.16;
  s.addShape("roundRect", { x, y: y0, w: 3.95, h: 4.95, rectRadius: 0.08, fill: { color: i === 1 ? NAVY : MIST }, line: { type: "none" }, shadow: soft() });
  // 大编号
  s.addText(it[0], { x: x + 0.25, y: y0 + 0.25, w: 2, h: 1.1, fontFace: "Arial", fontSize: 52, bold: true, color: i === 1 ? COPPER : COPPER, margin: 0 });
  s.addShape("rect", { x: x + 0.32, y: y0 + 1.45, w: 0.55, h: 0.08, fill: { color: i === 1 ? STEEL : NAVY }, line: { type: "none" } });
  s.addText(it[1], { x: x + 0.32, y: y0 + 1.62, w: 3.35, h: 0.95, fontFace: FONT, fontSize: 16.5, bold: true, color: i === 1 ? WHITE : NAVY, lineSpacingMultiple: 1.1, valign: "top", margin: 0 });
  s.addText(it[2], { x: x + 0.32, y: y0 + 2.62, w: 3.4, h: 2.1, fontFace: FONT, fontSize: 11.5, color: i === 1 ? "D6E0F0" : INK, lineSpacingMultiple: 1.22, valign: "top", margin: 0 });
});
footer(s, 16);
s.addNotes("本研究有三个创新点。第一，首次发现组蛋白乳酸化写入酶AARS1在瘢痕疙瘩中异常高表达，并揭示它维持成纤维细胞死亡抵抗的功能，提供了全新的代谢—表观遗传视角。第二，首次阐明AARS1-H3K18la-MT2A这条表观调控轴抑制铜死亡的机制，打通了‘代谢—表观遗传—细胞死亡’的分子链条，而且回补MT2A能够逆转表型。第三，在体内证明靶向这条轴、激活铜死亡可以抑制瘢痕形成，提出了从‘抑制增殖’转向‘精准诱发代谢性死亡’的抗纤维化新策略，具有临床转化潜力。");

// =========================================================
// SLIDE 17 —— 05 研究意义
// =========================================================
s = pptx.addSlide();
y0 = header(s, "05", "创新点与研究意义", "研究意义与临床转化价值");
watermark(s, "05");
// 左理论 右临床
const sig = [
  ["理论意义", NAVY, [
    ["“代谢酶兼职”新证据", "首次在纤维化中揭示 AARS1 的非经典表观遗传功能，为“代谢酶兼职”理论提供实体生化证据。"],
    ["构建闭环调控链条", "首次建立“糖酵解/乳酸—H3K18la—铜稳态与铜死亡”闭环，丰富皮肤纤维化分子病理理论。"],
  ]],
  ["临床价值", COPPER, [
    ["治疗理念转变", "推动瘢痕治疗从“抑制细胞增殖”转向“精准诱发代谢性死亡”。"],
    ["候选干预靶点", "AARS1 及其下游 MT2A-铜死亡轴，可作为瘢痕及其他纤维化疾病的候选靶点。"],
  ]],
];
sig.forEach((g, i) => {
  const x = 0.55 + i * 6.35;
  s.addShape("roundRect", { x, y: y0, w: 6.05, h: 0.85, rectRadius: 0.06, fill: { color: g[1] }, line: { type: "none" }, shadow: soft() });
  s.addText(g[0], { x: x + 0.3, y: y0, w: 5.5, h: 0.85, valign: "middle", fontFace: FONT, fontSize: 18, bold: true, color: WHITE, margin: 0 });
  s.addText(i === 0 ? "THEORETICAL" : "CLINICAL", { x: x + 0.3, y: y0, w: 5.6, h: 0.85, align: "right", valign: "middle", fontFace: FONT, fontSize: 10, bold: true, color: i === 0 ? "8FA2C4" : COPPER_L, charSpacing: 2, margin: 0 });
  g[2].forEach((it, k) => {
    const yc = y0 + 1.05 + k * 1.95;
    s.addShape("roundRect", { x, y: yc, w: 6.05, h: 1.78, rectRadius: 0.06, fill: { color: MIST }, line: { type: "none" }, shadow: soft() });
    s.addShape("rect", { x: x + 0.28, y: yc + 0.32, w: 0.12, h: 0.12, fill: { color: g[1] }, line: { type: "none" } });
    s.addText(it[0], { x: x + 0.55, y: yc + 0.22, w: 5.3, h: 0.4, fontFace: FONT, fontSize: 14.5, bold: true, color: NAVY, margin: 0, valign: "middle" });
    s.addText(it[1], { x: x + 0.55, y: yc + 0.68, w: 5.3, h: 0.95, fontFace: FONT, fontSize: 12, color: INK, lineSpacingMultiple: 1.2, valign: "top", margin: 0 });
  });
});
footer(s, 17);
s.addNotes("研究意义可以分为理论和临床两方面。理论上：其一，我们首次在纤维化疾病里揭示AARS1作为乳酸化写入酶的非经典功能，为‘代谢酶兼职’这一理论提供了实体证据；其二，首次建立了‘糖酵解/乳酸—H3K18la—铜稳态与铜死亡’的闭环调控链条，丰富了皮肤纤维化的分子病理理论。临床上：本研究推动瘢痕治疗理念从‘抑制增殖’转向‘精准诱发代谢性死亡’，AARS1和它下游的MT2A-铜死亡轴，有望成为瘢痕疙瘩乃至其他纤维化疾病的候选干预靶点。");

// =========================================================
// SLIDE 18 —— 06 局限与展望
// =========================================================
s = pptx.addSlide();
y0 = header(s, "06", "局限性与研究展望", "研究局限性与未来展望");
watermark(s, "06");
// 左：局限
s.addShape("roundRect", { x: 0.55, y: y0, w: 5.85, h: 0.7, rectRadius: 0.06, fill: { color: SLATE }, line: { type: "none" } });
s.addText("研究局限性", { x: 0.55, y: y0, w: 5.85, h: 0.7, align: "center", valign: "middle", fontFace: FONT, fontSize: 16, bold: true, color: WHITE, margin: 0 });
const lim = [
  ["样本与测序深度", "CUT&Tag 样本量有限，H3K18la 全景图谱有待更大样本验证。"],
  ["模型局限", "裸鼠异种移植免疫缺陷，未能反映免疫微环境对瘢痕的影响。"],
  ["机制深度", "AARS1 核转位与乳酸感知的上游调控、位点选择性仍需深入。"],
];
lim.forEach((l, i) => {
  const yc = y0 + 0.85 + i * 1.35;
  s.addShape("roundRect", { x: 0.55, y: yc, w: 5.85, h: 1.2, rectRadius: 0.06, fill: { color: MIST }, line: { type: "none" }, shadow: soft() });
  s.addShape("rect", { x: 0.75, y: yc + 0.24, w: 0.1, h: 0.1, fill: { color: SLATE }, line: { type: "none" } });
  s.addText([
    { text: l[0] + "\n", options: { bold: true, color: SLATE, fontSize: 13 } },
    { text: l[1], options: { color: INK, fontSize: 11.5 } },
  ], { x: 0.98, y: yc + 0.05, w: 5.3, h: 1.1, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.12, margin: 0 });
});
// 右：展望
s.addShape("roundRect", { x: 6.7, y: y0, w: 6.08, h: 0.7, rectRadius: 0.06, fill: { color: COPPER }, line: { type: "none" } });
s.addText("未来研究方向", { x: 6.7, y: y0, w: 6.08, h: 0.7, align: "center", valign: "middle", fontFace: FONT, fontSize: 16, bold: true, color: WHITE, margin: 0 });
const fut = [
  ["机制深挖", "解析 AARS1 核转位、乳酸感知与位点选择的上游机制。"],
  ["拓展病种", "验证该轴在肥厚性瘢痕、肺/肝纤维化等疾病中的普适性。"],
  ["靶向干预", "开发 AARS1 抑制剂或铜死亡诱导剂，探索联合治疗策略。"],
];
fut.forEach((f, i) => {
  const yc = y0 + 0.85 + i * 1.35;
  s.addShape("roundRect", { x: 6.7, y: yc, w: 6.08, h: 1.2, rectRadius: 0.06, fill: { color: "FaF3EC".toUpperCase() }, line: { color: COPPER_L, width: 1 }, shadow: soft() });
  s.addShape("ellipse", { x: 6.9, y: yc + 0.36, w: 0.5, h: 0.5, fill: { color: COPPER }, line: { type: "none" } });
  s.addText(String(i + 1), { x: 6.9, y: yc + 0.36, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: "Arial", fontSize: 16, bold: true, color: WHITE, margin: 0 });
  s.addText([
    { text: f[0] + "\n", options: { bold: true, color: COPPER_D, fontSize: 13 } },
    { text: f[1], options: { color: INK, fontSize: 11.5 } },
  ], { x: 7.55, y: yc + 0.05, w: 5.05, h: 1.1, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.12, margin: 0 });
});
footer(s, 18);
s.addNotes("当然，本研究也存在一些局限。第一，CUT&Tag的样本量相对有限，H3K18la的全景图谱还需要更大样本来验证；第二，裸鼠是免疫缺陷模型，没能反映免疫微环境对瘢痕的影响；第三，AARS1如何核转位、如何感知乳酸、以及位点选择性的上游机制，还需要更深入的研究。面向未来，我计划从三个方向推进：一是深挖上游机制；二是把这条轴拓展到肥厚性瘢痕、肺纤维化、肝纤维化等更多病种去验证普适性；三是开发AARS1抑制剂或铜死亡诱导剂，探索靶向和联合治疗策略，推动临床转化。");

// =========================================================
// SLIDE 19 —— 致谢
// =========================================================
s = pptx.addSlide();
bg(s, NAVY);
s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: NAVY }, line: { type: "none" } });
// 边框
s.addShape("roundRect", { x: 0.7, y: 0.7, w: 11.93, h: 6.1, rectRadius: 0.08, fill: { type: "none" }, line: { color: "3A5488", width: 1.5 } });
for (let i = 0; i < 3; i++) s.addShape("rect", { x: 6.0 + i * 0.46, y: 2.15, w: 0.28, h: 0.28, fill: { color: [COPPER, STEEL, WHITE][i] }, line: { type: "none" } });
s.addText("敬请各位评审专家批评指正！", { x: 1, y: 2.85, w: 11.33, h: 1.2, align: "center", valign: "middle", fontFace: FONT, fontSize: 40, bold: true, color: WHITE, margin: 0 });
s.addText("Thanks for your attention & guidance", { x: 1, y: 4.05, w: 11.33, h: 0.5, align: "center", fontFace: FONT, fontSize: 15, italic: true, color: "AEBCD4", margin: 0 });
s.addShape("line", { x: 5.0, y: 4.75, w: 3.33, h: 0, line: { color: "3A5488", width: 1 } });
s.addText([
  { text: "答辩人：", options: { color: "9FB0CC", fontSize: 13 } }, { text: "XXX", options: { color: WHITE, fontSize: 13, bold: true } },
  { text: "        导师：", options: { color: "9FB0CC", fontSize: 13 } }, { text: "XXX 教授", options: { color: WHITE, fontSize: 13, bold: true } },
  { text: "        2026 年 4 月 · 武汉大学", options: { color: "9FB0CC", fontSize: 13 } },
], { x: 1, y: 5.0, w: 11.33, h: 0.4, align: "center", valign: "middle", fontFace: FONT, margin: 0 });
s.addNotes("我的汇报到此结束。衷心感谢我的导师XXX教授在选题、实验设计和论文写作上的悉心指导，感谢课题组老师和同学的帮助，感谢各位评审专家在百忙之中审阅我的论文。恳请各位老师批评指正，谢谢！");

// ---------- 输出 ----------
const OUT = process.env.OUT || "defense.pptx";
pptx.writeFile({ fileName: OUT }).then(() => console.log("WROTE", OUT)).catch((e) => { console.error(e); process.exit(1); });
