# Chart Playbook

Opinionated chart-selection guide for narrative intelligence decks. Every recommendation here comes with the pptxgenjs config sketch so you can implement it directly.

---

## 1. Timeline bubble scatter — "the event cloud"

**Use when**: You have 30+ dated events and want the reader to *feel* when the subject was busiest.

**Encoding**:
- x-axis: day-of-period (convert dates to integers: `(d - periodStart) / 86400000`)
- y-axis: category index (one row per theme, labeled)
- size: importance score
- color: theme (use `THEME_COLORS`)

**Narrative claim it supports**: "Activity was sparse until [date]; then concentrated around [event]."

**pptxgenjs shape**:
```js
const data = [
  { name: 'X', values: allDates.map(d => dayOf(d)) },
  { name: 'AI Platform', values: [...], sizes: [...] }, // null-padded
  { name: 'Earnings',    values: [...], sizes: [...] },
  // one series per theme — all with same-length null-padded arrays
];
slide.addChart(pptx.ChartType.bubble, data, {
  x: 0.4, y: 1.0, w: 12.5, h: 5.5,
  showLegend: true, legendPos: 'b',
  chartColors: Object.values(THEME_COLORS),
  valAxisMinVal: -1, valAxisMaxVal: 9,
});
```

**Gotchas**:
- Don't rely on chart x-axis labels to show month names — they'll show day-of-period integers. Either add a chart title explaining the scale ("Day 0 = period start; day 320 = GTC week"), or draw your own month-label strip underneath via `addText`.
- PowerPoint auto-scales bubble diameters; if one cluster looks like a blob, halve all sizes and re-render. Don't try to fix individual points.

---

## 2. Category × time heatmap — "the cadence grid"

**Use when**: You want precise counts per category per month/week, in one glance.

**Encoding**:
- Rows: categories (themes)
- Columns: time buckets (months, weeks)
- Cell color: count, interpolated from light (empty) to dark (max)
- Cell text: the count itself

**Narrative claim it supports**: "AI Platform dominated in March (14 items); Geopolitics surged only in April."

**pptxgenjs has no native heatmap**. Build it from rectangles:

```js
const maxCount = Math.max(...Object.values(matrix).flatMap(Object.values));
for (const [t, ti] of themes.entries()) {
  for (const [m, mi] of months.entries()) {
    const count = matrix[t]?.[m] ?? 0;
    const alpha = count === 0 ? 0.08 : 0.2 + 0.8 * (count / maxCount);
    const fillHex = lerp(LIGHT_NAVY, DARK_NAVY, alpha);
    slide.addShape('rect', {
      x: colX(mi), y: rowY(ti), w: cellW, h: cellH,
      fill: { color: fillHex }, line: { color: 'FFFFFF', width: 1 },
    });
    if (count > 0) slide.addText(String(count), {
      x: colX(mi), y: rowY(ti), w: cellW, h: cellH,
      align: 'center', valign: 'middle',
      color: alpha > 0.6 ? 'FFFFFF' : '131B44',
      fontSize: 11, fontFace: 'Calibri', bold: true,
    });
  }
}
```

**Gotchas**:
- White gridlines between cells help readability far more than tight packing.
- Contrast flip at alpha ~0.6 is critical — dark text on a half-shaded cell is unreadable.
- Put a small color-swatch to the LEFT of each row label, matching `THEME_COLORS[theme]`. This anchors the heatmap to the consistent coding used elsewhere.

---

## 3. Sentiment / volume drift — "the combo"

**Use when**: You want to show that volume and sentiment moved in different directions, or that a surge in items came with cooling mood.

**Encoding**:
- Bar (primary axis): monthly item count
- Line (secondary axis): monthly average sentiment
- Color: bars in accent color, line in dominant (or inverse) color

**Narrative claim it supports**: "Volume peaked in March, but sentiment cooled entering April as risk items surfaced."

**pptxgenjs combo chart** (use 2-arg form):

```js
slide.addChart([
  { type: pptx.ChartType.bar, data: [{ name: 'Item count', labels: months, values: counts }],
    options: { barDir: 'col', chartColors: [ACCENT] } },
  { type: pptx.ChartType.line, data: [{ name: 'Avg sentiment', labels: months, values: sentiments }],
    options: { chartColors: [NAVY], secondaryValAxis: true, secondaryCatAxis: true,
               lineSize: 3, lineDataSymbolSize: 8 } },
], {
  x: 0.5, y: 1.2, w: 12.3, h: 5.0,
  showLegend: true, legendPos: 'b',
  valAxisMinVal: 0,
  valAxes: [
    { valAxisMinVal: 0, showValAxisTitle: true, valAxisTitle: 'Item count' },
    { valAxisMinVal: -1, valAxisMaxVal: 1, showValAxisTitle: true, valAxisTitle: 'Avg sentiment' },
  ],
});
```

**Gotchas**:
- The 3-arg `addChart(type, data, opts)` form is for single-type charts. Combo needs the 2-arg `addChart([...configs], opts)` form. Getting this wrong is the #1 failure mode.
- Don't cram a third series (count-of-negatives etc.). Two stories is the max for one chart.

---

## 4. Order-of-magnitude bar — "the log chart"

**Use when**: Your dataset mentions values spanning 2+ orders of magnitude (e.g., $1T, $26B, $92M).

**Encoding**:
- Horizontal bars, sorted by value
- Value axis on log base 10
- Value labels alongside bars (don't rely on axis ticks)
- A short caption per bar explaining what the figure is

**Narrative claim it supports**: "The roadmap ambition ($1T) and the banned-shipments disclosure ($92M) are both real — but four orders of magnitude apart."

**pptxgenjs**:
```js
slide.addChart(pptx.ChartType.bar, [{
  name: 'Dollar figure (USD)',
  labels: dollars.map(d => `${d.label} — ${d.context}`),
  values: dollars.map(d => d.value),
}], {
  x: 0.5, y: 1.2, w: 12.3, h: 5.2,
  barDir: 'bar',
  chartColors: [NAVY],
  valAxisLogBase: 10,
  showValue: true,
  dataLabelFormatCode: '$#,##0.00,,,"B"',
  valAxisMinVal: 1e7,
});
```

**Gotchas**:
- `catAxisLogBase` is a misnomer — log is applied to the *value* axis regardless. Use `valAxisLogBase`.
- Per-bar fill colors aren't supported in pptxgenjs horizontal bar; accept one color or overlay colored rects manually.
- Display the raw dollar label next to each bar. Readers won't compute `10^11` to $100B in their head.

---

## 5. Risk scatter — "the annotated danger zone"

**Use when**: A subset of events are negative / risky and you want readers to see both the cluster shape and the specific top-N items.

**Encoding**:
- x-axis: date
- y-axis: sentiment (negative region only; 0 at top, -1 at bottom)
- Size: importance
- Color: theme
- Inline text annotations on 3-5 key points: "Iran IRGC threat video", "Shenzhen smuggling disclosure"

**Narrative claim it supports**: "Six of the seven most-negative items landed inside a two-week window in early April."

**Implementation**: Use `bubble` chart for the dots; overlay callouts via `addText` at absolute positions computed from the same date/sentiment → canvas math. Do not rely on pptxgenjs data-labels — they're too small and hard to position.

**Gotchas**:
- Invert the y-axis intuitively: "further down = worse". If the default puts -1 at top, flip by swapping min/max.
- Don't annotate more than 5 points. Past that, add a companion list on the right side.

---

## 6. Radar — "the profile polygon"

**Use when**: Summarizing a subject's profile across 4-6 qualitative dimensions (moat strength, risk exposure, talent depth, etc.).

**Encoding**:
- 4-6 axes, equally spaced
- Each axis labeled with the dimension
- Scores 1-10 (or 0-100)
- One polygon (the subject); optionally a comparator polygon (competitor or benchmark)

**Narrative claim it supports**: "The moat is widest in hardware and software; the weakest edge is open-source hedging."

**pptxgenjs**:
```js
slide.addChart(pptx.ChartType.radar, [{
  name: subject,
  labels: ['Hardware', 'Software', 'Mindshare', 'Open-source hedge', 'Acquisition depth'],
  values: [10, 9, 8, 6, 7],
}], {
  x: 1.0, y: 1.2, w: 6.0, h: 5.0,
  radarStyle: 'standard', // or 'marker' — NOT 'filled', which looks muddy
  chartColors: [ACCENT], lineSize: 2,
  catAxisLabelFontSize: 11,
});
```

**Gotchas**:
- **Always document scoring rationale in speaker notes**. A radar chart in a public deck without justification reads as opinion masquerading as measurement.
- Keep to 5 axes if possible. 6+ makes labels overlap at the corners.
- Don't add a comparator polygon unless you've scored the comparator with the same rubric — asymmetric scoring is misleading.

---

## 7. Source Pareto — "the concentration tell"

**Use when**: The dataset's **provenance** is itself a data-quality note (e.g., 68% of items came from one aggregator).

**Encoding**:
- Bars: source counts, descending
- Line: cumulative percentage
- Label the 80% threshold with an annotation

**Narrative claim it supports**: "Coverage is concentrated — the top 2 sources produced 70% of all items. Diversify collection or disclose the skew."

**pptxgenjs combo** (same pattern as #3):
```js
slide.addChart([
  { type: pptx.ChartType.bar, data: [{ name: 'Count', labels: srcLabels, values: counts }],
    options: { chartColors: [NAVY] } },
  { type: pptx.ChartType.line, data: [{ name: 'Cumulative %', labels: srcLabels, values: cumPct }],
    options: { chartColors: [ACCENT], secondaryValAxis: true, lineSize: 2.5 } },
], { /* combo opts */ });
```

**Gotchas**:
- Sort the bar series descending **in the data**, not via chart options (which may not be respected).
- Cumulative % must hit exactly 100.0 at the final point, or the line looks broken. Round to 1 decimal.

---

## 8. Oversized stat — "when the number is the point"

**Use when**: One number is the entire slide's claim ("79 signals / 11 months").

**Encoding**:
- 100pt+ number, dominant color
- 12-14pt caption explaining what the number is
- Optional small context line (the source or period)

**Implementation**: Just `addText` with a massive `fontSize`. No chart library involved.

**Gotchas**:
- Only one of these per deck. More than that and they stop being impactful.
- Make sure the number is **auditable** — it must appear exactly in your source data or be a trivial aggregation of it. A wrong stat on the cover slide destroys credibility for the whole deck.

---

## Charts that are usually wrong

- **Pie chart** — humans read angle badly. Always use a bar or heatmap instead.
- **3D anything** — the perspective distorts the actual values. Every 3D chart is a lie about magnitudes.
- **Two charts that encode the same data** (bar + donut for the same counts) — redundancy wastes a slide.
- **Word cloud** — no information density; looks AI-generated.
- **Funnel charts** when you don't have a funnel — they imply sequence; don't use them for unrelated categories.
- **Sparklines** as decoration — tiny charts without axes or labels are just visual noise.
