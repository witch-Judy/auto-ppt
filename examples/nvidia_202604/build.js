// NVIDIA Signal Brief — 16:9 deck
// Palette: Midnight Executive (navy #1E2761 / ice blue #CADCFC / white #FFFFFF)
// Accent: amber #F5B700 for "high-importance" hits. Risk slide uses a crimson accent #C0352E.
// Fonts: Georgia (headers, serif character) + Calibri (body, clean sans).

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ------------ constants ------------
const NAVY = "1E2761";        // dominant 60%
const NAVY_DEEP = "131B44";   // slide background shade
const ICE = "CADCFC";         // secondary 30%
const WHITE = "FFFFFF";       // accent 10%
const AMBER = "F5B700";       // highlight accent
const CRIMSON = "C0352E";     // risk accent
const MUTED = "6E7896";       // muted grey-blue
const DIVIDER = "2A3775";     // subtle panel divider
const PANEL = "F4F6FB";       // light panel on light slides

const H_FONT = "Georgia";
const B_FONT = "Calibri";

const OUT_PATH = path.join(__dirname, "nvidia-report.pptx");
const DATA_PATH = fs.existsSync(path.join(__dirname, "report_data.json"))
  ? path.join(__dirname, "report_data.json")
  : "/tmp/nvidia_report_data.json";
const VIZ_PATH = path.join(__dirname, "viz_data.json");
const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
const viz = JSON.parse(fs.readFileSync(VIZ_PATH, "utf8"));

// ------------ theme colors (reused across every chart) ------------
const THEME_COLORS = {
  "AI Platform (Blackwell / Vera Rubin / GPU Roadmap)": "F5B700", // amber — dominant theme
  "Leadership, GTC & Vision": "CADCFC",                           // ice blue
  "Earnings & Market": "7FB069",                                   // sage
  "Strategic Deals & Customers": "E07A5F",                         // terracotta
  "Software, CUDA & Developer Moat": "8884D8",                     // periwinkle
  "Geopolitics & Export Controls": "C0352E",                       // crimson
  "Hiring Signals": "6B8E9E",                                      // slate
  "Other": "9B8C8C",                                               // dusty rose gray
};
const THEME_SHORT = {
  "AI Platform (Blackwell / Vera Rubin / GPU Roadmap)": "AI Platform / Roadmap",
  "Leadership, GTC & Vision": "Leadership & GTC",
  "Earnings & Market": "Earnings & Market",
  "Strategic Deals & Customers": "Strategic Deals",
  "Software, CUDA & Developer Moat": "Software & CUDA",
  "Geopolitics & Export Controls": "Geopolitics",
  "Hiring Signals": "Hiring",
  "Other": "Other",
};

// helper: date → day-of-period (x-axis serial)
const EPOCH_MS = Date.parse("2025-05-01");
function dayOf(dateStr) {
  return Math.round((Date.parse(dateStr) - EPOCH_MS) / 86400000);
}

// helper: parse dollar string → USD value (number)
function parseDollar(v) {
  const s = v.toLowerCase().replace(/[\$,\s]/g, "");
  const m = s.match(/([\d.]+)(trillion|billion|million|t|b|m)?/);
  if (!m) return 0;
  const num = parseFloat(m[1]);
  const unit = (m[2] || "").toLowerCase();
  if (unit.startsWith("t")) return num * 1e12;
  if (unit.startsWith("b")) return num * 1e9;
  if (unit.startsWith("m")) return num * 1e6;
  return num;
}

// helper: interpolate hex color between two stops
function lerpHex(a, b, t) {
  const ar = parseInt(a.substr(0, 2), 16), ag = parseInt(a.substr(2, 2), 16), ab = parseInt(a.substr(4, 2), 16);
  const br = parseInt(b.substr(0, 2), 16), bg = parseInt(b.substr(2, 2), 16), bb = parseInt(b.substr(4, 2), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  const hex = (n) => n.toString(16).padStart(2, "0");
  return (hex(r) + hex(g) + hex(bl)).toUpperCase();
}

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.author = "NVIDIA Signal Brief";
pres.title = "NVIDIA Signal Brief — Last 11 months";

// slide dimensions
const W = 13.3;
const H = 7.5;

// helper: header strip used on content slides
function addHeaderStrip(slide, kicker, title) {
  // narrow navy bar at top-left (motif carried across deck)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.55, w: 0.14, h: 0.6,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  slide.addText(kicker, {
    x: 0.78, y: 0.5, w: 6, h: 0.35,
    fontFace: B_FONT, fontSize: 11, color: MUTED,
    bold: true, charSpacing: 4, margin: 0,
  });
  slide.addText(title, {
    x: 0.78, y: 0.8, w: 12, h: 0.7,
    fontFace: H_FONT, fontSize: 30, color: NAVY,
    bold: true, margin: 0,
  });
}

// helper: page number & brand footer
function addFooter(slide, pageNum, total) {
  slide.addText("NVIDIA SIGNAL BRIEF  ·  2025-05 → 2026-04", {
    x: 0.5, y: 7.12, w: 8, h: 0.28,
    fontFace: B_FONT, fontSize: 9, color: MUTED, charSpacing: 3, margin: 0,
  });
  slide.addText(`${pageNum} / ${total}`, {
    x: 12.0, y: 7.12, w: 0.8, h: 0.28,
    fontFace: B_FONT, fontSize: 9, color: MUTED, align: "right", margin: 0,
  });
}

const TOTAL_SLIDES = 12;

// ===================================================================
// SLIDE 1 — Title
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY_DEEP };

  // large off-page accent circle (motif) — concentric navy rings, no muddy amber blend
  s.addShape(pres.shapes.OVAL, {
    x: 8.9, y: -2.6, w: 8.0, h: 8.0,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 10.0, y: -1.5, w: 5.8, h: 5.8,
    fill: { color: NAVY_DEEP }, line: { color: NAVY_DEEP },
  });
  // amber ring (thin) as accent — no transparency blend
  s.addShape(pres.shapes.OVAL, {
    x: 10.6, y: -0.9, w: 4.6, h: 4.6,
    fill: { color: NAVY_DEEP }, line: { color: AMBER, width: 3 },
  });

  // kicker
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 1.7, w: 0.5, h: 0.08,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  s.addText("CONFIDENTIAL INTELLIGENCE BRIEF", {
    x: 1.42, y: 1.55, w: 7, h: 0.35,
    fontFace: B_FONT, fontSize: 11, color: ICE, bold: true, charSpacing: 6, margin: 0,
  });

  // title
  s.addText("NVIDIA", {
    x: 0.8, y: 2.1, w: 10, h: 1.4,
    fontFace: H_FONT, fontSize: 96, color: WHITE, bold: true, margin: 0,
  });
  s.addText("Signal Brief", {
    x: 0.8, y: 3.35, w: 10, h: 1.0,
    fontFace: H_FONT, fontSize: 54, color: AMBER, italic: true, margin: 0,
  });

  // subtitle
  s.addText("Reporting period  ·  2025-05-19 → 2026-04-16", {
    x: 0.8, y: 4.65, w: 11, h: 0.4,
    fontFace: B_FONT, fontSize: 16, color: ICE, margin: 0,
  });

  // 3 badges — stats
  const badges = [
    { big: "79", small: "signals collected" },
    { big: "7",  small: "theme buckets" },
    { big: "11", small: "months of coverage" },
  ];
  const bx0 = 0.8, by = 5.5, bw = 2.9, bh = 1.3, gap = 0.25;
  badges.forEach((b, i) => {
    const x = bx0 + i * (bw + gap);
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: by, w: bw, h: bh,
      fill: { color: NAVY }, line: { color: ICE, width: 0.75 },
    });
    s.addText(b.big, {
      x, y: by + 0.05, w: bw, h: 0.75,
      fontFace: H_FONT, fontSize: 44, color: AMBER, bold: true,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(b.small, {
      x, y: by + 0.82, w: bw, h: 0.4,
      fontFace: B_FONT, fontSize: 11, color: ICE,
      align: "center", valign: "middle", charSpacing: 3, margin: 0,
    });
  });

  // issued date bottom right
  s.addText("Issued 2026-04-23", {
    x: 10, y: 7.02, w: 2.8, h: 0.35,
    fontFace: B_FONT, fontSize: 10, color: ICE,
    align: "right", charSpacing: 3, margin: 0,
  });
}

// ===================================================================
// SLIDE 2 — Executive summary
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeaderStrip(s, "02  ·  EXECUTIVE SUMMARY", "Four takes from 79 signals");

  // four cards in 2x2
  const cards = [
    {
      num: "01",
      title: "The roadmap is the story",
      body: "Blackwell + Vera Rubin dominate coverage (30 of 79 items, 38%). Jensen's $1T lifetime sales claim is repeated across 5+ outlets — narrative consolidation, not just a one-off headline.",
    },
    {
      num: "02",
      title: "Moat is shifting from silicon to software",
      body: "CUDA gets reframed as survival moat (Mar 31). $26B OpenAI stake + SchedMD buy + AITune open-source release suggest NVIDIA is buying distribution for software, not just selling chips.",
    },
    {
      num: "03",
      title: "Demand signal is concrete",
      body: "H100 rentals up 40%, 10-day stock streak +18%, Firmus at $5.5B, ByteDance tapping 36k Blackwells via Malaysia — supply tightness is visible through prices and workarounds.",
    },
    {
      num: "04",
      title: "Risk surface is widening",
      body: "Sharetronic smuggling ($92M banned chips), IRGC death-threat video, Supermicro $2.5B China probe, Mythos export-control debate. Four distinct geopolitics lines in one quarter.",
    },
  ];
  const cx0 = 0.55, cy0 = 1.8, cw = 6.1, ch = 2.45, gx = 0.2, gy = 0.2;
  cards.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = cx0 + col * (cw + gx);
    const y = cy0 + row * (ch + gy);
    // card background
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: cw, h: ch,
      fill: { color: PANEL }, line: { color: ICE, width: 0.75 },
    });
    // left accent stripe
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.09, h: ch,
      fill: { color: NAVY }, line: { color: NAVY },
    });
    // big number
    s.addText(c.num, {
      x: x + 0.25, y: y + 0.15, w: 1.2, h: 0.8,
      fontFace: H_FONT, fontSize: 40, color: AMBER, bold: true, margin: 0,
    });
    // title
    s.addText(c.title, {
      x: x + 1.4, y: y + 0.18, w: cw - 1.6, h: 0.7,
      fontFace: H_FONT, fontSize: 18, color: NAVY, bold: true, margin: 0,
      valign: "top",
    });
    // body
    s.addText(c.body, {
      x: x + 1.4, y: y + 0.95, w: cw - 1.55, h: ch - 1.05,
      fontFace: B_FONT, fontSize: 12, color: "2A2F45",
      paraSpaceAfter: 3, margin: 0, valign: "top",
    });
  });

  addFooter(s, 2, TOTAL_SLIDES);
}

// ===================================================================
// SLIDE 3 — Tempo: timeline scatter (VIZ A)
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeaderStrip(s, "03  ·  TEMPO", "70 of 79 signals landed in March–April 2026");

  // Bubble chart shape: data[0] is X axis (shared), data[1..N] are Y-series per theme.
  // For non-member events, we pad Y with null/undefined + size=0 so they don't render.
  const themesOrder = viz.heatmap.themes_order;
  const yIndex = {};
  themesOrder.forEach((t, i) => { yIndex[t] = themesOrder.length - i; }); // AI Platform on top (y=8)

  // Sort timeline by date so X axis is monotonic-ish (nicer ordering)
  const tl = viz.timeline.slice().sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const xs = tl.map(ev => dayOf(ev.date));
  // Shared X axis series
  const bubbleData = [{ name: "X", values: xs }];
  // Only include themes that actually have events
  const activeThemes = themesOrder.filter(t => tl.some(ev => ev.theme === t));
  activeThemes.forEach(theme => {
    const ys = tl.map(ev => ev.theme === theme ? yIndex[theme] : null);
    const sizes = tl.map(ev => {
      if (ev.theme !== theme) return 0;
      return ev.importance >= 9 ? 6 : ev.importance >= 8 ? 4 : 2.5;
    });
    bubbleData.push({ name: THEME_SHORT[theme] || theme, values: ys, sizes });
  });
  const chartColors = activeThemes.map(t => THEME_COLORS[t]);

  s.addChart(pres.charts.BUBBLE, bubbleData, {
    x: 0.55, y: 1.75, w: 12.25, h: 4.55,
    chartColors,
    chartColorsOpacity: 70,
    chartArea: { fill: { color: WHITE }, roundedCorners: false },
    plotArea: { fill: { color: WHITE } },
    catAxisLabelFontFace: B_FONT, catAxisLabelFontSize: 10, catAxisLabelColor: MUTED,
    valAxisHidden: true,
    valGridLine: { style: "none" },
    catGridLine: { color: "E8ECF4", size: 0.5, style: "dot" },
    catAxisMinVal: 0, catAxisMaxVal: 355,
    catAxisMajorUnit: 60,
    valAxisMinVal: 0, valAxisMaxVal: themesOrder.length + 1,
    showLegend: true,
    legendPos: "b",
    legendFontFace: B_FONT, legendFontSize: 10, legendColor: NAVY,
    // Hint to PPT: show X axis title labels instead of generic numbers
    catAxisTitle: "Day-of-period (May 2025 → Apr 2026) — GTC week = day 318",
    showCatAxisTitle: true,
    catAxisTitleColor: MUTED, catAxisTitleFontFace: B_FONT, catAxisTitleFontSize: 10,
    dataBorder: { pt: 0.75, color: WHITE },
  });

  // caption / callout strip
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 6.4, w: 12.25, h: 0.5,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 6.4, w: 0.1, h: 0.5,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  s.addText("GTC week (Mar 13–17) ignites coverage: 44 signals in March alone, 26 more through mid-April. Bubble size = importance.",
    {
      x: 0.8, y: 6.4, w: 12.0, h: 0.5,
      fontFace: B_FONT, fontSize: 11, color: WHITE, italic: true, valign: "middle", margin: 0,
    }
  );

  addFooter(s, 3, TOTAL_SLIDES);
}

// ===================================================================
// SLIDE 4 — Theme distribution via HEATMAP (VIZ B)
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeaderStrip(s, "04  ·  COVERAGE DISTRIBUTION", "Where the 79 signals cluster");

  const hm = viz.heatmap;
  const months = hm.months;
  const themes = hm.themes_order;
  // find max for interpolation
  let maxVal = 0;
  themes.forEach(t => months.forEach(m => {
    const v = hm.matrix[t][m] || 0;
    if (v > maxVal) maxVal = v;
  }));

  // layout
  const gridX0 = 2.95, gridY0 = 2.0;
  const cellW = 1.15, cellH = 0.48;
  const gridW = cellW * months.length;
  const gridH = cellH * themes.length;

  // column headers (months)
  months.forEach((m, ci) => {
    s.addText(m, {
      x: gridX0 + ci * cellW, y: gridY0 - 0.42, w: cellW, h: 0.35,
      fontFace: B_FONT, fontSize: 10, color: NAVY, bold: true,
      align: "center", valign: "middle", charSpacing: 2, margin: 0,
    });
  });

  // cells + row labels
  const ICE_LIGHT = "EEF4FF"; // even lighter than ICE so 0 cells don't disappear
  const NAVY_DARK = NAVY;
  themes.forEach((t, ri) => {
    // theme color swatch (left of row label)
    s.addShape(pres.shapes.RECTANGLE, {
      x: gridX0 - 2.55, y: gridY0 + ri * cellH + cellH / 2 - 0.06, w: 0.12, h: 0.12,
      fill: { color: THEME_COLORS[t] }, line: { color: THEME_COLORS[t] },
    });
    // row label
    s.addText(THEME_SHORT[t] || t, {
      x: gridX0 - 2.35, y: gridY0 + ri * cellH, w: 2.3, h: cellH,
      fontFace: B_FONT, fontSize: 10.5, color: NAVY, bold: true,
      align: "right", valign: "middle", margin: 0,
    });
    months.forEach((m, ci) => {
      const v = hm.matrix[t][m] || 0;
      const t01 = maxVal > 0 ? v / maxVal : 0;
      // steps: 0 → ICE_LIGHT, 1 → ICE, 3 → muted blue, 6 → navy-mid, 10+ → NAVY
      let fill;
      if (v === 0) fill = ICE_LIGHT;
      else fill = lerpHex("CADCFC", "1E2761", Math.min(1, v / 14));
      s.addShape(pres.shapes.RECTANGLE, {
        x: gridX0 + ci * cellW, y: gridY0 + ri * cellH,
        w: cellW - 0.04, h: cellH - 0.04,
        fill: { color: fill }, line: { color: WHITE, width: 1 },
      });
      // text contrast: dark fill → white text, light → navy
      const textColor = v >= 5 ? WHITE : (v === 0 ? "C8D0E0" : NAVY);
      s.addText(v === 0 ? "·" : String(v), {
        x: gridX0 + ci * cellW, y: gridY0 + ri * cellH,
        w: cellW - 0.04, h: cellH - 0.04,
        fontFace: B_FONT, fontSize: 12, color: textColor, bold: v > 0,
        align: "center", valign: "middle", margin: 0,
      });
    });
  });

  // right column: big callout + caption (kept from original)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 10.9, y: 1.85, w: 1.95, h: 4.7,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  s.addText("38%", {
    x: 10.9, y: 2.0, w: 1.95, h: 1.0,
    fontFace: H_FONT, fontSize: 54, color: AMBER, bold: true,
    align: "center", margin: 0,
  });
  s.addText("of 79 signals hit", {
    x: 10.9, y: 3.0, w: 1.95, h: 0.35,
    fontFace: B_FONT, fontSize: 10, color: ICE,
    align: "center", margin: 0,
  });
  s.addText("AI Platform /\nRoadmap", {
    x: 10.9, y: 3.35, w: 1.95, h: 0.7,
    fontFace: H_FONT, fontSize: 14, color: WHITE, bold: true, italic: true,
    align: "center", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 11.3, y: 4.15, w: 1.15, h: 0.03,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  s.addText("Mar–Apr 2026 is where the story lives.",
    {
      x: 11.0, y: 4.3, w: 1.8, h: 2.2,
      fontFace: B_FONT, fontSize: 10, color: ICE, margin: 0,
    }
  );

  // bottom caption
  s.addText("Cell values = signal count per theme per month  ·  darker = higher volume  ·  GTC week dominates March",
    {
      x: 0.55, y: 6.65, w: 12.2, h: 0.3,
      fontFace: B_FONT, fontSize: 10, color: MUTED, italic: true, margin: 0,
    }
  );

  addFooter(s, 4, TOTAL_SLIDES);
}

// ===================================================================
// SLIDE 5 — Sentiment drift (VIZ C — combo: bars + line)
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeaderStrip(s, "05  ·  SENTIMENT DRIFT", "Volume surged, tone cooled into April");

  // Prepare monthly data — chronological
  const sot = viz.sentiment_over_time;
  const labels = sot.map(r => r.month);
  const counts = sot.map(r => r.count);
  const avgs = sot.map(r => r.avg);

  // Combo chart: bar (count) on primary axis + line (avg sentiment) on secondary
  const comboTypes = [
    {
      type: pres.charts.BAR,
      data: [{ name: "Signals / month", labels, values: counts }],
      options: { barDir: "col", barGapWidthPct: 40, chartColors: [AMBER] },
    },
    {
      type: pres.charts.LINE,
      data: [{ name: "Avg sentiment", labels, values: avgs }],
      options: {
        chartColors: [NAVY],
        lineDataSymbol: "circle", lineDataSymbolSize: 10,
        lineSize: 2.5,
        secondaryValAxis: true, secondaryCatAxis: true,
      },
    },
  ];

  s.addChart(comboTypes, {
    x: 0.55, y: 1.8, w: 8.3, h: 4.75,
    chartColors: [AMBER, NAVY],
    chartArea: { fill: { color: WHITE }, roundedCorners: false },
    plotArea: { fill: { color: WHITE } },
    catAxisLabelFontFace: B_FONT, catAxisLabelFontSize: 11, catAxisLabelColor: "2A2F45",
    valAxisLabelFontFace: B_FONT, valAxisLabelFontSize: 10, valAxisLabelColor: MUTED,
    valGridLine: { color: "E2E8F0", size: 0.5 },
    catGridLine: { style: "none" },
    valAxes: [
      { valAxisTitle: "Signal volume", showValAxisTitle: true,
        valAxisTitleColor: MUTED, valAxisTitleFontFace: B_FONT, valAxisTitleFontSize: 10,
        valAxisLabelColor: MUTED, valAxisLabelFontFace: B_FONT, valAxisLabelFontSize: 10,
        valAxisMinVal: 0, valAxisMaxVal: 50,
      },
      { valAxisTitle: "Avg sentiment", showValAxisTitle: true,
        valAxisTitleColor: NAVY, valAxisTitleFontFace: B_FONT, valAxisTitleFontSize: 10,
        valAxisLabelColor: NAVY, valAxisLabelFontFace: B_FONT, valAxisLabelFontSize: 10,
        valAxisMinVal: 0, valAxisMaxVal: 1, valAxisOrientation: "minMax",
        valGridLine: { style: "none" },
      },
    ],
    catAxes: [
      { catAxisLabelColor: "2A2F45", catAxisLabelFontFace: B_FONT, catAxisLabelFontSize: 11 },
      { catAxisHidden: true },
    ],
    showLegend: true, legendPos: "b",
    legendFontFace: B_FONT, legendFontSize: 10, legendColor: NAVY,
  });

  // right: commentary card
  s.addShape(pres.shapes.RECTANGLE, {
    x: 9.15, y: 1.8, w: 3.65, h: 4.75,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  s.addText("+0.64 → +0.29", {
    x: 9.15, y: 1.95, w: 3.65, h: 0.7,
    fontFace: H_FONT, fontSize: 26, color: AMBER, bold: true,
    align: "center", margin: 0,
  });
  s.addText("Monthly avg sentiment,\nMarch → April 2026", {
    x: 9.15, y: 2.65, w: 3.65, h: 0.6,
    fontFace: B_FONT, fontSize: 11, color: ICE,
    align: "center", margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 9.95, y: 3.35, w: 2.05, h: 0.03,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  s.addText("March was pure GTC euphoria — 44 items, avg +0.64.",
    { x: 9.35, y: 3.55, w: 3.3, h: 0.85, fontFace: B_FONT, fontSize: 12, color: WHITE, margin: 0 }
  );
  s.addText("April added $92M smuggling disclosures, Iran death-threat video, SchedMD backlash, PE at 7-year low — tone halved.",
    { x: 9.35, y: 4.5, w: 3.3, h: 1.7, fontFace: B_FONT, fontSize: 11, color: ICE, margin: 0 }
  );

  s.addText("7 months plotted  ·  bars = signal count (left axis)  ·  line = mean sentiment (right axis, −1…+1)",
    {
      x: 0.55, y: 6.65, w: 12.2, h: 0.3,
      fontFace: B_FONT, fontSize: 10, color: MUTED, italic: true, margin: 0,
    }
  );

  addFooter(s, 5, TOTAL_SLIDES);
}

// ===================================================================
// SLIDE 6 — AI Platform (30 items) + Dollar-Scale viz (VIZ D)
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeaderStrip(s, "06  ·  THEME  ·  AI PLATFORM", "Roadmap thunder: Blackwell → Vera Rubin → $1T");

  // left: big-number callout (compressed vertically to make room)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 1.8, w: 3.0, h: 2.3,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  s.addText("30", {
    x: 0.55, y: 1.85, w: 3.0, h: 1.1,
    fontFace: H_FONT, fontSize: 72, color: AMBER, bold: true,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("signals in-period", {
    x: 0.55, y: 2.95, w: 3.0, h: 0.35,
    fontFace: B_FONT, fontSize: 11, color: ICE,
    align: "center", charSpacing: 3, margin: 0,
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1.35, y: 3.35, w: 1.4, h: 0.03,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  s.addText("$1T lifetime sales, Blackwell + Vera Rubin (through 2027)",
    {
      x: 0.55, y: 3.45, w: 3.0, h: 0.6,
      fontFace: B_FONT, fontSize: 11, color: WHITE, italic: true,
      align: "center", margin: 0,
    }
  );

  // DOLLAR SCALE viz (VIZ D) — horizontal log-scale bars below the callout
  // Curate distinct values (dedupe sources that reported the same headline number)
  const dollarRows = [
    { label: "$1T  Blackwell+Rubin lifetime", val: 1e12, color: AMBER, bucket: "Ambition" },
    { label: "$100B  roadmap chatter", val: 1e11, color: AMBER, bucket: "Ambition" },
    { label: "$30B  roadmap chatter", val: 3e10, color: AMBER, bucket: "Ambition" },
    { label: "$26B  → OpenAI models", val: 2.6e10, color: ICE, bucket: "Execution" },
    { label: "$7B  NVLink licensing buzz", val: 7e9, color: ICE, bucket: "Execution" },
    { label: "$5.5B  Firmus valuation", val: 5.5e9, color: ICE, bucket: "Execution" },
    { label: "$2.5B  Supermicro China probe", val: 2.5e9, color: CRIMSON, bucket: "Defense" },
    { label: "$830M  Mistral debt finance", val: 8.3e8, color: ICE, bucket: "Execution" },
    { label: "$170M  Starcloud orbital DC", val: 1.7e8, color: ICE, bucket: "Execution" },
    { label: "$92M  Sharetronic banned chips", val: 9.2e7, color: CRIMSON, bucket: "Defense" },
  ];
  // Title
  s.addText("DOLLAR SCALE  ·  log-axis, orders of magnitude", {
    x: 0.55, y: 4.25, w: 6.2, h: 0.25,
    fontFace: B_FONT, fontSize: 9, color: MUTED, bold: true, charSpacing: 3, margin: 0,
  });

  s.addChart(pres.charts.BAR, [{
    name: "USD",
    labels: dollarRows.map(r => r.label),
    values: dollarRows.map(r => r.val),
  }], {
    x: 0.45, y: 4.5, w: 6.9, h: 2.35,
    barDir: "bar",
    chartColors: [NAVY],
    chartArea: { fill: { color: WHITE }, roundedCorners: false },
    plotArea: { fill: { color: WHITE } },
    catAxisLabelFontFace: B_FONT, catAxisLabelFontSize: 8.5, catAxisLabelColor: "2A2F45",
    valAxisLabelFontFace: B_FONT, valAxisLabelFontSize: 8, valAxisLabelColor: MUTED,
    valGridLine: { color: "E2E8F0", size: 0.5 },
    catGridLine: { style: "none" },
    valAxisLogScaleBase: 10,
    valAxisMinVal: 1e7, valAxisMaxVal: 2e12,
    valAxisLabelFormatCode: "$#,##0,,,\"B\"",
    showLegend: false,
    showValue: false,
    barGapWidthPct: 35,
  });

  // right: dated headline list (compressed)
  const items = [
    { date: "2026-04-11", t: "Vera Rubin platform launches with Micron HBM4 memory deal", src: "Yahoo Finance" },
    { date: "2026-04-06", t: "H100 rental prices jump 40% as shortage bites", src: "TradingView · TipRanks" },
    { date: "2026-03-16", t: "GTC 2026: Huang projects $1T orders through 2027", src: "CNBC · TechCrunch" },
    { date: "2026-02-25", t: "Vera Rubin claimed 10x more efficient than predecessor", src: "CNBC" },
    { date: "2026-02-16", t: "Blackwell Ultra benchmarks: up to 50x perf, 35x cheaper", src: "SemiAnalysis InferenceX" },
    { date: "2025-12-04", t: "CUDA 13.1 ships with Tile programming primitives", src: "NVIDIA Developer" },
  ];
  const lx = 7.55, ly = 1.8, lw = 5.25;
  s.addText("DATED HEADLINES  ·  SELECTED FROM 30", {
    x: lx, y: ly, w: lw, h: 0.3,
    fontFace: B_FONT, fontSize: 9, color: MUTED, bold: true, charSpacing: 3, margin: 0,
  });

  items.forEach((it, i) => {
    const y = ly + 0.38 + i * 0.78;
    s.addShape(pres.shapes.RECTANGLE, {
      x: lx, y: y + 0.05, w: 1.3, h: 0.32,
      fill: { color: NAVY }, line: { color: NAVY },
    });
    s.addText(it.date, {
      x: lx, y: y + 0.05, w: 1.3, h: 0.32,
      fontFace: B_FONT, fontSize: 9, color: WHITE, bold: true,
      align: "center", valign: "middle", margin: 0,
    });
    s.addText(it.t, {
      x: lx + 1.4, y: y + 0.0, w: lw - 1.5, h: 0.45,
      fontFace: H_FONT, fontSize: 12, color: NAVY, bold: true, margin: 0,
    });
    s.addText(it.src, {
      x: lx + 1.4, y: y + 0.45, w: lw - 1.5, h: 0.28,
      fontFace: B_FONT, fontSize: 9, color: MUTED, italic: true, margin: 0,
    });
  });

  addFooter(s, 6, TOTAL_SLIDES);
}

// ===================================================================
// SLIDE 7 — Leadership & GTC (12 items)
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeaderStrip(s, "07  ·  THEME  ·  LEADERSHIP & GTC", "Jensen is running the narrative");

  // two columns: left quote-callout, right headline list
  // LEFT: pull quote card
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 1.8, w: 5.5, h: 3.9,
    fill: { color: PANEL }, line: { color: ICE, width: 0.75 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 1.8, w: 0.09, h: 3.9,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  // big quote mark
  s.addText("“", {
    x: 0.8, y: 1.65, w: 1.8, h: 1.4,
    fontFace: H_FONT, fontSize: 120, color: NAVY, bold: true, margin: 0,
  });
  s.addText("We've achieved AGI.", {
    x: 0.9, y: 2.55, w: 5.1, h: 0.9,
    fontFace: H_FONT, fontSize: 30, color: NAVY, bold: true, italic: true, margin: 0,
  });
  s.addText("— Jensen Huang, Mar 30 2026", {
    x: 0.9, y: 3.45, w: 5.1, h: 0.4,
    fontFace: B_FONT, fontSize: 12, color: MUTED, italic: true, margin: 0,
  });
  // divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.9, y: 3.95, w: 1.5, h: 0.03,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  s.addText("Three separate pillars are converging in Jensen's public rhetoric: AGI has arrived (Apr 5), engineers should earn 'AI tokens' on top of salary (Mar 20), and a consumer-surprise Taipei keynote is teed up before Computex 2026 (Apr 16).",
    {
      x: 0.9, y: 4.15, w: 5.1, h: 1.45,
      fontFace: B_FONT, fontSize: 13, color: "2A2F45",
      paraSpaceAfter: 4, margin: 0, valign: "top",
    }
  );
  // secondary stat panel below quote card
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 5.85, w: 5.5, h: 0.85,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  s.addText("12", {
    x: 0.75, y: 5.85, w: 0.9, h: 0.85,
    fontFace: H_FONT, fontSize: 34, color: AMBER, bold: true,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("leadership / GTC signals in-period", {
    x: 1.7, y: 5.85, w: 4.3, h: 0.85,
    fontFace: B_FONT, fontSize: 12, color: ICE, italic: true,
    valign: "middle", margin: 0,
  });

  // RIGHT: timeline of leadership moments
  const lx = 6.5, ly = 1.8, lw = 6.3;
  s.addText("KEY MOMENTS  ·  SELECTED FROM 12", {
    x: lx, y: ly, w: lw, h: 0.3,
    fontFace: B_FONT, fontSize: 10, color: MUTED, bold: true, charSpacing: 4, margin: 0,
  });
  const moments = [
    { date: "2026-04-16", t: "GTC Taipei keynote teased ahead of Computex 2026", imp: 9 },
    { date: "2026-04-05", t: "Huang: 'AGI is here' — Yahoo Finance follow-up", imp: 8 },
    { date: "2026-03-30", t: "AGI claim goes viral; definition debate ensues", imp: 8 },
    { date: "2026-03-23", t: "AI-tokens-on-top-of-salary pitch (Yahoo / CNBC)", imp: 8 },
    { date: "2026-03-16", t: "GTC 2026: $1T orders, DLSS 5, OpenClaw, Olaf robot", imp: 8 },
  ];
  moments.forEach((m, i) => {
    const y = ly + 0.45 + i * 0.85;
    // timeline dot
    s.addShape(pres.shapes.OVAL, {
      x: lx, y: y + 0.18, w: 0.22, h: 0.22,
      fill: { color: m.imp >= 9 ? AMBER : NAVY }, line: { color: WHITE, width: 1.5 },
    });
    // vertical connector (except last)
    if (i < moments.length - 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: lx + 0.095, y: y + 0.38, w: 0.03, h: 0.65,
        fill: { color: ICE }, line: { color: ICE },
      });
    }
    // date
    s.addText(m.date, {
      x: lx + 0.4, y: y, w: 1.6, h: 0.3,
      fontFace: B_FONT, fontSize: 10, color: MUTED, bold: true, charSpacing: 2, margin: 0,
    });
    // imp pill (right-aligned in row)
    if (m.imp >= 9) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: lx + lw - 0.95, y: y + 0.03, w: 0.85, h: 0.28,
        fill: { color: AMBER }, line: { color: AMBER },
      });
      s.addText("IMP 9", {
        x: lx + lw - 0.95, y: y + 0.03, w: 0.85, h: 0.28,
        fontFace: B_FONT, fontSize: 9, color: NAVY, bold: true,
        align: "center", valign: "middle", charSpacing: 3, margin: 0,
      });
    }
    // title
    s.addText(m.t, {
      x: lx + 0.4, y: y + 0.32, w: lw - 0.5, h: 0.55,
      fontFace: H_FONT, fontSize: 14, color: NAVY, bold: true, margin: 0,
    });
  });

  addFooter(s, 7, TOTAL_SLIDES);
}

// ===================================================================
// SLIDE 8 — Strategic Deals & Customers (9 items)
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeaderStrip(s, "08  ·  THEME  ·  STRATEGIC DEALS", "Buying distribution, not just selling chips");

  // three stat tiles across top + list below
  const tiles = [
    { big: "$26B", label: "Invested in OpenAI models", sub: "Forbes · Mar 12" },
    { big: "SchedMD", label: "Acquired — HPC scheduler", sub: "Reuters · Apr 6-7" },
    { big: "$5.5B", label: "Firmus ('Southgate') valuation", sub: "TechCrunch · Apr 7" },
  ];
  const tx0 = 0.55, ty = 1.75, tw = 4.03, th = 1.7, gx = 0.17;
  tiles.forEach((t, i) => {
    const x = tx0 + i * (tw + gx);
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: ty, w: tw, h: th,
      fill: { color: NAVY }, line: { color: NAVY },
    });
    s.addText(t.big, {
      x, y: ty + 0.18, w: tw, h: 0.75,
      fontFace: H_FONT, fontSize: 40, color: AMBER, bold: true,
      align: "center", margin: 0,
    });
    s.addText(t.label, {
      x, y: ty + 0.98, w: tw, h: 0.35,
      fontFace: B_FONT, fontSize: 12, color: WHITE, bold: true,
      align: "center", margin: 0,
    });
    s.addText(t.sub, {
      x, y: ty + 1.32, w: tw, h: 0.3,
      fontFace: B_FONT, fontSize: 10, color: ICE, italic: true,
      align: "center", margin: 0,
    });
  });

  // list below — tight rows
  const rows = [
    { date: "2026-04-07", t: "Nvidia acquisition of SchedMD sparks worry among AI specialists about software access", src: "The Times of India · Reuters" },
    { date: "2026-03-30", t: "'We've achieved AGI' — definition debate underscores narrative power", src: "Yahoo Entertainment" },
    { date: "2026-03-15", t: "Taiwan AI economy bubble-risk & geopolitical warnings", src: "Yahoo Entertainment" },
    { date: "2026-03-12", t: "The CUDA Power Play: Nvidia is investing $26 Billion in OpenAI models", src: "Forbes" },
  ];
  const lx = 0.55, ly = 3.65, lw = 12.25;
  s.addText("NOTABLE DEAL SIGNALS  ·  SELECTED FROM 9", {
    x: lx, y: ly, w: lw, h: 0.3,
    fontFace: B_FONT, fontSize: 10, color: MUTED, bold: true, charSpacing: 4, margin: 0,
  });
  rows.forEach((r, i) => {
    const y = ly + 0.4 + i * 0.73;
    // row band
    s.addShape(pres.shapes.RECTANGLE, {
      x: lx, y, w: lw, h: 0.63,
      fill: { color: i % 2 === 0 ? PANEL : WHITE }, line: { color: ICE, width: 0.5 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: lx, y, w: 0.08, h: 0.63,
      fill: { color: AMBER }, line: { color: AMBER },
    });
    s.addText(r.date, {
      x: lx + 0.2, y: y + 0.05, w: 1.4, h: 0.53,
      fontFace: B_FONT, fontSize: 11, color: NAVY, bold: true,
      valign: "middle", margin: 0,
    });
    s.addText(r.t, {
      x: lx + 1.55, y: y + 0.03, w: lw - 4.0, h: 0.35,
      fontFace: H_FONT, fontSize: 13, color: NAVY, bold: true,
      valign: "top", margin: 0,
    });
    s.addText(r.src, {
      x: lx + 1.55, y: y + 0.36, w: lw - 4.0, h: 0.28,
      fontFace: B_FONT, fontSize: 10, color: MUTED, italic: true,
      valign: "top", margin: 0,
    });
  });

  addFooter(s, 8, TOTAL_SLIDES);
}

// ===================================================================
// SLIDE 9 — Software & CUDA moat — RADAR (VIZ F)
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeaderStrip(s, "09  ·  THEME  ·  SOFTWARE & CUDA MOAT", "The second moat, measured across 5 axes");

  // Speaker-note rationale (appears in Notes pane)
  s.addNotes([
    "Analyst radar — 1-10 scoring rationale:",
    " • Hardware lead (10): Blackwell Ultra 50x perf / 35x cheaper validated by SemiAnalysis InferenceX.",
    " • Software ecosystem (9): CUDA 13.1 + AITune open-sourced + SchedMD buy = full-stack control.",
    " • Developer mindshare (8): GTC 2026 attendance record + $1T narrative consolidation. China push to 'break CUDA grip' suggests mindshare is still the central asset to defend.",
    " • Open-source hedge (6): AITune is real but SchedMD acquisition triggered dev-community worry — 6 reflects ambivalence.",
    " • Acquisition depth (7): $26B OpenAI stake + SchedMD + Firmus backing = buying distribution, not just selling chips.",
  ].join("\n"));

  // Radar: one series, 5 axes
  const radarLabels = [
    "Hardware lead",
    "Software ecosystem",
    "Developer mindshare",
    "Open-source hedge",
    "Acquisition depth",
  ];
  const radarVals = [10, 9, 8, 6, 7];

  s.addChart(pres.charts.RADAR, [{ name: "NVIDIA moat", labels: radarLabels, values: radarVals }], {
    x: 0.35, y: 1.7, w: 7.4, h: 4.9,
    chartColors: [AMBER],
    chartColorsOpacity: 35,
    chartArea: { fill: { color: WHITE }, roundedCorners: false },
    plotArea: { fill: { color: WHITE } },
    radarStyle: "filled",
    lineSize: 2.5,
    lineDataSymbol: "circle",
    lineDataSymbolSize: 8,
    lineDataSymbolLineColor: NAVY,
    lineDataSymbolLineSize: 1.5,
    catAxisLabelFontFace: B_FONT, catAxisLabelFontSize: 11, catAxisLabelColor: NAVY,
    catAxisLabelFontBold: true,
    valAxisLabelFontFace: B_FONT, valAxisLabelFontSize: 9, valAxisLabelColor: MUTED,
    valAxisMinVal: 0, valAxisMaxVal: 10,
    valAxisMajorUnit: 2,
    showLegend: false,
    showValue: false,
  });

  // right column — takeaways
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.95, y: 1.8, w: 4.85, h: 4.75,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.95, y: 1.8, w: 0.1, h: 4.75,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  s.addText("ANALYST READ", {
    x: 8.2, y: 1.9, w: 4.5, h: 0.3,
    fontFace: B_FONT, fontSize: 10, color: AMBER, bold: true, charSpacing: 4, margin: 0,
  });
  const reads = [
    { head: "Hardware lead (10/10)", body: "Blackwell Ultra 50x perf / 35x cheaper — InferenceX validated." },
    { head: "Software ecosystem (9/10)", body: "CUDA 13.1 Tile + AITune + SchedMD → full-stack control." },
    { head: "Mindshare (8/10)", body: "$1T narrative consolidates GTC week; China still forced to 'break CUDA grip'." },
    { head: "Open-source hedge (6/10)", body: "AITune is real, but SchedMD buy triggered dev-community worry." },
    { head: "Acquisition depth (7/10)", body: "$26B OpenAI + SchedMD + Firmus — buying distribution, not just chips." },
  ];
  reads.forEach((r, i) => {
    const y = 2.25 + i * 0.85;
    s.addText(r.head, {
      x: 8.2, y, w: 4.5, h: 0.28,
      fontFace: H_FONT, fontSize: 12, color: WHITE, bold: true, margin: 0,
    });
    s.addText(r.body, {
      x: 8.2, y: y + 0.28, w: 4.5, h: 0.55,
      fontFace: B_FONT, fontSize: 10.5, color: ICE, margin: 0,
    });
  });

  // takeaway bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 6.7, w: 12.25, h: 0.35,
    fill: { color: NAVY }, line: { color: NAVY },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 6.7, w: 0.1, h: 0.35,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  s.addText("Scores are analyst judgment (see speaker notes) on a 1–10 scale. Fill area = cumulative moat strength.",
    {
      x: 0.8, y: 6.7, w: 12.0, h: 0.35,
      fontFace: B_FONT, fontSize: 10, color: WHITE, italic: true,
      valign: "middle", margin: 0,
    }
  );

  addFooter(s, 9, TOTAL_SLIDES);
}

// ===================================================================
// SLIDE 10 — Risk watchlist (VIZ E — risk scatter, darker palette)
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY_DEEP };

  // header band custom (dark variant)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.55, w: 0.14, h: 0.6,
    fill: { color: CRIMSON }, line: { color: CRIMSON },
  });
  s.addText("10  ·  RISK WATCHLIST", {
    x: 0.78, y: 0.5, w: 6, h: 0.35,
    fontFace: B_FONT, fontSize: 11, color: ICE,
    bold: true, charSpacing: 4, margin: 0,
  });
  s.addText("Four parallel risk threads opened this quarter", {
    x: 0.78, y: 0.8, w: 12, h: 0.7,
    fontFace: H_FONT, fontSize: 30, color: WHITE, bold: true, margin: 0,
  });

  // Risk scatter: only negative-sentiment items. Bubble format:
  //   data[0] = shared X (dayOfPeriod)
  //   data[1..N] = per-theme Y series (sentiment), padded with null for non-members
  const negRisks = viz.risks.filter(r => r.sentiment < 0)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const riskXs = negRisks.map(r => dayOf(r.date));
  const riskData = [{ name: "X", values: riskXs }];
  const riskThemesActive = [...new Set(negRisks.map(r => r.theme))];
  riskThemesActive.forEach(theme => {
    const ys = negRisks.map(r => r.theme === theme ? r.sentiment : null);
    const sizes = negRisks.map(r => r.theme === theme ? 14 : 0);
    riskData.push({ name: THEME_SHORT[theme] || theme, values: ys, sizes });
  });
  const riskColors = riskThemesActive.map(t => THEME_COLORS[t] || CRIMSON);

  // Plot the scatter — white-on-dark chart
  s.addChart(pres.charts.BUBBLE, riskData, {
    x: 0.55, y: 1.7, w: 8.2, h: 4.6,
    chartColors: riskColors,
    chartColorsOpacity: 80,
    chartArea: { fill: { color: NAVY_DEEP }, roundedCorners: false },
    plotArea: { fill: { color: NAVY_DEEP } },
    catAxisLabelFontFace: B_FONT, catAxisLabelFontSize: 9, catAxisLabelColor: ICE,
    valAxisLabelFontFace: B_FONT, valAxisLabelFontSize: 9, valAxisLabelColor: ICE,
    valAxisMinVal: -1, valAxisMaxVal: 0,
    valAxisMajorUnit: 0.25,
    valAxisTitle: "Sentiment",
    showValAxisTitle: true,
    valAxisTitleColor: ICE, valAxisTitleFontFace: B_FONT, valAxisTitleFontSize: 10,
    catAxisTitle: "Day of period (May 2025 → Apr 2026)",
    showCatAxisTitle: true,
    catAxisTitleColor: ICE, catAxisTitleFontFace: B_FONT, catAxisTitleFontSize: 10,
    catAxisMinVal: 260, catAxisMaxVal: 360,
    catAxisMajorUnit: 20,
    valGridLine: { color: "2A3775", size: 0.5, style: "dot" },
    catGridLine: { color: "2A3775", size: 0.5, style: "dot" },
    showLegend: true,
    legendPos: "b",
    legendColor: ICE,
    legendFontFace: B_FONT, legendFontSize: 9,
  });

  // Right column: annotated callouts for 4 key points
  const callouts = [
    { tag: "EXPORT CONTROL", title: "Sharetronic smuggling ring", body: "$92M of banned H100/H200 chips disclosed to Beijing.", date: "Apr 10" },
    { tag: "PHYSICAL SECURITY", title: "IRGC death-threat video", body: "Iran's IRGC targets Huang + Altman; Trump 2-wk ceasefire.", date: "Apr 7" },
    { tag: "GEOPOLITICS", title: "Supermicro $2.5B probe", body: "Alleged smuggling of $2.5B in Nvidia chips to China.", date: "Mar 23" },
    { tag: "DEVELOPER RELATIONS", title: "SchedMD acquisition blowback", body: "AI specialists fear gating of open HPC software access.", date: "Apr 6–7" },
  ];
  const cx = 9.0, cy0 = 1.75, cw = 3.9, ch = 1.15, cg = 0.1;
  callouts.forEach((c, i) => {
    const y = cy0 + i * (ch + cg);
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx, y, w: cw, h: ch,
      fill: { color: NAVY }, line: { color: CRIMSON, width: 1.0 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx, y, w: 1.5, h: 0.26,
      fill: { color: CRIMSON }, line: { color: CRIMSON },
    });
    s.addText(c.tag, {
      x: cx, y, w: 1.5, h: 0.26,
      fontFace: B_FONT, fontSize: 7.5, color: WHITE, bold: true,
      align: "center", valign: "middle", charSpacing: 2, margin: 0,
    });
    s.addText(c.date, {
      x: cx + cw - 1.0, y: y + 0.03, w: 0.95, h: 0.22,
      fontFace: B_FONT, fontSize: 9, color: ICE, bold: true,
      align: "right", charSpacing: 2, margin: 0,
    });
    s.addText(c.title, {
      x: cx + 0.15, y: y + 0.32, w: cw - 0.3, h: 0.32,
      fontFace: H_FONT, fontSize: 13, color: WHITE, bold: true, margin: 0,
    });
    s.addText(c.body, {
      x: cx + 0.15, y: y + 0.65, w: cw - 0.3, h: 0.45,
      fontFace: B_FONT, fontSize: 9.5, color: ICE, margin: 0,
    });
  });

  // footer override for this slide (different bg)
  s.addText("NVIDIA SIGNAL BRIEF  ·  2025-05 → 2026-04", {
    x: 0.5, y: 7.12, w: 8, h: 0.28,
    fontFace: B_FONT, fontSize: 9, color: ICE, charSpacing: 3, margin: 0,
  });
  s.addText(`10 / ${TOTAL_SLIDES}`, {
    x: 12.0, y: 7.12, w: 0.8, h: 0.28,
    fontFace: B_FONT, fontSize: 9, color: ICE, align: "right", margin: 0,
  });
}

// ===================================================================
// SLIDE 11 — What to watch (forward-looking)
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeaderStrip(s, "11  ·  FORWARD LOOK", "What to watch next");

  const items = [
    {
      label: "Q2",
      title: "GTC Taipei keynote (pre-Computex 2026)",
      body: "Next-gen AI reveals teased — track whether 'consumer surprise' materially widens NVIDIA's consumer GPU/Arm-SoC share.",
      thread: "thread: Leadership & GTC",
    },
    {
      label: "Q2",
      title: "Vera Rubin + Micron HBM4 ramp",
      body: "Watch Micron shipment cadence and any second-source HBM4 news — supply tightness is already visible (H100 +40%).",
      thread: "thread: AI Platform",
    },
    {
      label: "Q2",
      title: "SchedMD / open-source narrative",
      body: "Will AITune-style releases offset the SchedMD backlash, or does the dev community start hedging toward CUDA alternatives?",
      thread: "thread: Software & CUDA Moat",
    },
    {
      label: "Q2",
      title: "Export-control enforcement cycle",
      body: "Sharetronic disclosures + Supermicro $2.5B probe likely produce fresh BIS or DOJ actions. Stock has priced in ceasefire optimism.",
      thread: "thread: Geopolitics",
    },
    {
      label: "Q3",
      title: "$1T forecast reality check",
      body: "By mid-2026, first Blackwell + Vera Rubin shipment data should let analysts stress-test the $1T-through-2027 claim.",
      thread: "thread: Earnings & Market",
    },
  ];

  const lx = 0.55, ly = 1.8, lw = 12.25;
  items.forEach((it, i) => {
    const y = ly + i * 0.93;
    // label chip
    s.addShape(pres.shapes.RECTANGLE, {
      x: lx, y: y + 0.12, w: 0.75, h: 0.6,
      fill: { color: NAVY }, line: { color: NAVY },
    });
    s.addText(it.label, {
      x: lx, y: y + 0.12, w: 0.75, h: 0.6,
      fontFace: H_FONT, fontSize: 20, color: AMBER, bold: true,
      align: "center", valign: "middle", margin: 0,
    });
    // title
    s.addText(it.title, {
      x: lx + 0.95, y: y + 0.05, w: lw - 3.2, h: 0.4,
      fontFace: H_FONT, fontSize: 15, color: NAVY, bold: true, margin: 0,
    });
    // body
    s.addText(it.body, {
      x: lx + 0.95, y: y + 0.43, w: lw - 3.2, h: 0.42,
      fontFace: B_FONT, fontSize: 11.5, color: "2A2F45", margin: 0,
    });
    // thread tag right
    s.addShape(pres.shapes.RECTANGLE, {
      x: lx + lw - 2.2, y: y + 0.3, w: 2.15, h: 0.35,
      fill: { color: PANEL }, line: { color: ICE, width: 0.75 },
    });
    s.addText(it.thread, {
      x: lx + lw - 2.2, y: y + 0.3, w: 2.15, h: 0.35,
      fontFace: B_FONT, fontSize: 10, color: NAVY, italic: true, bold: true,
      align: "center", valign: "middle", margin: 0,
    });
    // divider between rows
    if (i < items.length - 1) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: lx, y: y + 0.9, w: lw, h: 0.015,
        fill: { color: ICE }, line: { color: ICE },
      });
    }
  });

  addFooter(s, 11, TOTAL_SLIDES);
}

// ===================================================================
// SLIDE 12 — Methodology / sources + Pareto (VIZ G)
// ===================================================================
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeaderStrip(s, "12  ·  METHODOLOGY", "How this brief was built");

  // 4 stat tiles across top
  const stats = [
    { big: "79", small: "signals after dedup" },
    { big: "7",  small: "theme buckets" },
    { big: "≥7", small: "importance floor" },
    { big: "11 mo", small: "2025-05 → 2026-04" },
  ];
  const sx0 = 0.55, sy = 1.8, sw = 3.0, sh = 1.4, sg = 0.15;
  stats.forEach((st, i) => {
    const x = sx0 + i * (sw + sg);
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: sy, w: sw, h: sh,
      fill: { color: NAVY }, line: { color: NAVY },
    });
    s.addText(st.big, {
      x, y: sy + 0.1, w: sw, h: 0.7,
      fontFace: H_FONT, fontSize: 38, color: AMBER, bold: true,
      align: "center", margin: 0,
    });
    s.addText(st.small, {
      x, y: sy + 0.85, w: sw, h: 0.4,
      fontFace: B_FONT, fontSize: 11, color: ICE,
      align: "center", charSpacing: 3, margin: 0,
    });
  });

  // two columns below: left = pipeline, right = source mix
  // LEFT: pipeline steps
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 3.45, w: 6.3, h: 3.3,
    fill: { color: PANEL }, line: { color: ICE, width: 0.75 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.55, y: 3.45, w: 0.09, h: 3.3,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  s.addText("PIPELINE", {
    x: 0.85, y: 3.55, w: 5.8, h: 0.3,
    fontFace: B_FONT, fontSize: 10, color: MUTED, bold: true, charSpacing: 4, margin: 0,
  });
  const steps = [
    "Collect from news, financial, social, patent, web, hiring, GitHub releases, CUDA forums, GTC",
    "AI-analyze each item: relevance, sentiment, importance (0-10), tags",
    "Deduplicate by title overlap (≥55%) — Primary > Media > Community",
    "Filter: importance ≥ 7 for the brief; drop low-relevance community noise",
    "Bucket into 7 themes; unclassified held aside",
  ];
  s.addText(
    steps.map((t, i) => ({
      text: t,
      options: { bullet: { code: "25A0" }, breakLine: i < steps.length - 1 },
    })),
    {
      x: 0.9, y: 3.85, w: 5.9, h: 2.85,
      fontFace: B_FONT, fontSize: 12, color: "2A2F45",
      paraSpaceAfter: 6, margin: 0,
    }
  );

  // RIGHT: source-mix Pareto (VIZ G)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.05, y: 3.45, w: 5.75, h: 3.3,
    fill: { color: PANEL }, line: { color: ICE, width: 0.75 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.05, y: 3.45, w: 0.09, h: 3.3,
    fill: { color: AMBER }, line: { color: AMBER },
  });
  s.addText("SOURCE MIX  ·  PARETO", {
    x: 7.3, y: 3.55, w: 5.4, h: 0.28,
    fontFace: B_FONT, fontSize: 10, color: MUTED, bold: true, charSpacing: 4, margin: 0,
  });
  s.addText("Google News aggregator = 68% of flow (54 / 79).", {
    x: 7.3, y: 3.83, w: 5.4, h: 0.25,
    fontFace: B_FONT, fontSize: 9.5, color: NAVY, italic: true, margin: 0,
  });

  // Collapse long-tail sources beyond top-6 into "Other"
  const sm = viz.source_mix.slice(); // [[name, count], ...]
  const top = sm.slice(0, 6);
  const otherCount = sm.slice(6).reduce((a, r) => a + r[1], 0);
  if (otherCount > 0) top.push(["Other sources", otherCount]);
  const total = top.reduce((a, r) => a + r[1], 0);
  let running = 0;
  const cumPct = top.map(r => { running += r[1]; return +(100 * running / total).toFixed(1); });

  const paretoCombo = [
    {
      type: pres.charts.BAR,
      data: [{ name: "Items", labels: top.map(r => r[0]), values: top.map(r => r[1]) }],
      options: { barDir: "col", barGapWidthPct: 40, chartColors: [NAVY] },
    },
    {
      type: pres.charts.LINE,
      data: [{ name: "Cumulative %", labels: top.map(r => r[0]), values: cumPct }],
      options: {
        chartColors: [AMBER],
        lineSize: 2,
        lineDataSymbol: "circle", lineDataSymbolSize: 7,
        secondaryValAxis: true, secondaryCatAxis: true,
      },
    },
  ];
  s.addChart(paretoCombo, {
    x: 7.2, y: 4.1, w: 5.5, h: 2.55,
    chartColors: [NAVY, AMBER],
    chartArea: { fill: { color: PANEL }, roundedCorners: false },
    plotArea: { fill: { color: PANEL } },
    catAxisLabelFontFace: B_FONT, catAxisLabelFontSize: 7.5, catAxisLabelColor: "2A2F45",
    valAxisLabelFontFace: B_FONT, valAxisLabelFontSize: 8, valAxisLabelColor: MUTED,
    valGridLine: { color: "D8DFEE", size: 0.5 },
    catGridLine: { style: "none" },
    valAxes: [
      { valAxisMinVal: 0, valAxisMaxVal: 60,
        valAxisLabelColor: MUTED, valAxisLabelFontFace: B_FONT, valAxisLabelFontSize: 8 },
      { valAxisMinVal: 0, valAxisMaxVal: 100,
        valAxisLabelColor: AMBER, valAxisLabelFontFace: B_FONT, valAxisLabelFontSize: 8,
        valAxisLabelFormatCode: "0\"%\"", valGridLine: { style: "none" } },
    ],
    catAxes: [
      { catAxisLabelColor: "2A2F45", catAxisLabelFontFace: B_FONT, catAxisLabelFontSize: 7.5, catAxisLabelRotate: -25 },
      { catAxisHidden: true },
    ],
    showLegend: false,
  });

  // bottom disclaimer
  s.addText("Auto-generated by the Personal Intelligence System. Dates are as published; importance scores are model-assigned and reviewed.",
    {
      x: 0.55, y: 6.85, w: 12.2, h: 0.25,
      fontFace: B_FONT, fontSize: 9, color: MUTED, italic: true, margin: 0,
    }
  );

  addFooter(s, 12, TOTAL_SLIDES);
}

// ------------ write ------------
pres.writeFile({ fileName: OUT_PATH }).then(() => {
  console.log("wrote", OUT_PATH);
});
