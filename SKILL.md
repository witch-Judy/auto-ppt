---
name: auto-ppt
description: Turn a structured dataset of events (news, signals, intel items, transactions, timeline entries) into a narrative intelligence slide deck (.pptx). Optimized for monitoring reports, market briefs, competitive-intelligence decks, and signal analyses where raw items must be distilled into chart-led storytelling. Use when the user has tabular or JSON event data and wants a presentation that tells a story rather than lists headlines.
version: 0.1.0
user-invocable: true
license: GPL-3.0
author: Judy (@witch-Judy)
---

# auto-ppt

Auto-generate **narrative-first** intelligence decks from event data. The thesis of this skill: a deck built from event data should be led by charts that encode the dataset's *shape*, not by bulleted text that lists its contents.

## When to use

Trigger this skill when:

- The user has a **collection of dated events** (news items, intel signals, transactions, research sightings, deal announcements, incident logs) and wants a deck summarizing them.
- The dataset spans **weeks or months** and has some structure: dates, categories/themes, importance scores, sentiment scores, sources, or monetary values.
- The user says things like "make a NVIDIA report", "summarize this quarter's signals as slides", "generate a brief from this data", or references a `.pptx` deliverable for a monitoring/analyst task.

**Do not use** for:

- Pure pitch decks with no underlying dataset — use a pitch-deck template instead.
- Single-document summaries (one article, one paper) — that's a writeup, not a deck.
- Decks where the user will hand-author every slide — this skill's value is data-driven chart selection.

## Input contract

This skill expects the caller to produce or point to a JSON file shaped roughly like this (field names may vary — adapt in the prompt):

```json
{
  "subject": "NVIDIA",
  "window": { "start": "2025-05-19", "end": "2026-04-16" },
  "items": [
    {
      "title": "…",
      "summary": "…",
      "date": "2026-04-16",
      "theme": "AI Platform",
      "source": "Bloomberg",
      "importance": 8,
      "sentiment": 0.7,
      "url": "…"
    }
  ]
}
```

Before generating the deck, **pre-compute** a few derived aggregates in a separate JSON (helps keep the build script focused):

- Monthly item counts per theme (for the heatmap)
- Monthly average sentiment + item count (for the drift chart)
- Dollar-figure mentions extracted from titles/summaries (for the scale chart)
- Top-N negative or risk-flagged items (for the risk slide)
- Source distribution (for the Pareto)

See `examples/nvidia_202604/build.js` for a working reference of both shape and aggregation.

## Design context

Before picking colors, fonts, or a tone, settle on these with the user (ask once, don't guess):

- **Audience**: Internal analysts, external clients, executives, investors? This determines how much jargon to keep and whether risk language should be hedged.
- **Venue**: Printed handout, screen-shared in a call, attached to an email? Determines density and font sizes.
- **Persona**: Is the deck a **calm research brief** (quiet authority), a **boardroom-urgency brief** (red flags foregrounded), or a **market-celebratory brief** (momentum framing)? Pick one — decks without a persona read as AI-generated.
- **Subject-coded color**: The palette should be informed by the subject. If generating a deck about a green-branded company, avoid making the deck *look like the company's own slides* — an independent analyst deck should read as editorially distinct.

## Core principle: narrative-first, charts second, text third

Every slide has a job. In order of precedence:

1. **Narrative claim** — one clear statement the slide is making. If you cannot state it in one sentence, the slide shouldn't exist.
2. **Chart that proves the claim** — the visual is load-bearing, not decorative.
3. **Supporting text** — citations, analyst take, dated headlines that corroborate.

If a slide is mostly bullet text with a small chart in the corner, invert it.

## Chart selection

Every data pattern has a chart that fits it best. See [`chart_playbook.md`](chart_playbook.md) for the full reference. Summary:

| Data pattern | Chart | Why |
|---|---|---|
| Many events clustered in time | **Timeline bubble scatter** (x=date, y=category, size=importance) | Event density is felt, not counted |
| Category × time counts | **Heatmap** (grid of colored cells) | Precise cell counts + cadence in one view |
| Sentiment/volume over time | **Combo bar+line** (bar=count, line=avg) | Two stories share an axis honestly |
| Values spanning orders of magnitude | **Log-scale bar** | $1T and $92M stop being incomparable |
| Risk/negative events | **Annotated scatter** (x=date, y=sentiment, size=importance, colored dots, labels for 3-5 key) | Cluster-spotting + specifics at once |
| Competitive/strength profile | **Radar** | 4-6 dimensions, one polygon, honest about trade-offs |
| Source/category concentration | **Pareto** (bar descending + cumulative line) | Shows both the 80/20 and the tail |
| One big stat | **Oversized number** (100pt+) with small caption | When ambient framing already set the context |

Don't use pie charts. Don't use 3D anything. Don't use two charts that encode the same information in one slide.

## Consistent color coding

Define a single `THEME_COLORS` constant at the top of your build script mapping each category/theme to one hex color. **Reuse it across every chart, every cell, every dot.** Inconsistent color across slides destroys comprehension faster than any single bad slide does.

For intelligence decks, you want one dominant neutral (navy, ink, charcoal), an accent for the *dominant* theme in the dataset, and a red/crimson **reserved exclusively for risk** so the eye knows to slow down there.

Avoid:

- Using a rainbow category palette where no theme dominates visually (weak hierarchy)
- Mimicking the subject's brand colors (looks like an internal deck, not analysis)
- Light-gray text on cream or near-white on pale (contrast is non-negotiable in charts)

## Implementation

Use [`pptxgenjs`](https://gitbrent.github.io/PptxGenJS/) (MIT licensed) — install locally in a per-report working directory:

```bash
mkdir -p reports/<subject>/pptx && cd reports/<subject>/pptx
npm init -y && npm install pptxgenjs
```

Structure a single `build.js` with:

1. Top-of-file constants: `THEME_COLORS`, font names, palette hex values, slide dimensions
2. Data loading from the two JSON files (raw + aggregated)
3. Helper functions for recurring elements: title bar, footer with date + subject, a stat-tile component, a headline-list component
4. One function per slide, each returning the configured slide (keeps diff-friendliness; avoids 2000-line `main()`)
5. Each chart function accepts pre-aggregated data, not raw — aggregation happens in the pre-computation step

### pptxgenjs gotchas learned the hard way

- **Combo charts** (bar + line) are called with the **2-arg form** `addChart(multiConfig, opts)` — the 3-arg form passed in tutorials is for single-type charts.
- **Bubble charts** treat `data[0].values` as the shared X axis, **not** per-series `labels`. Reshape data as `[{name: 'X', values: xs}, {name: 'SeriesA', values: ys, sizes: zs}, ...]`. Null-pad per-series arrays when series have different points on the X axis.
- **Log-scale bar** with `catAxisLogBase: 10` works, but only on the *value* axis, not the category axis — name is misleading.
- **Per-bar colors** in horizontal bar charts aren't supported without workarounds; accept uniform fill or switch to stacked shapes.
- **Bubble size auto-scaling**: PowerPoint rescales bubble diameters at render time; if all bubbles look enormous in one cluster, shrink `size` values globally (e.g., divide all by 2) and re-test. Don't chase this with per-bubble overrides.

## QA loop (required, non-negotiable)

Follow [`qa_checklist.md`](qa_checklist.md) on every deck. Core steps:

1. **Text QA** via `python-pptx`: confirm no placeholder text, every stat you claim appears in the source data, every date is in-window.
2. **Visual QA** via Keynote/PowerPoint AppleScript → PDF → `pdftoppm -jpeg -r 150` → read each slide image. Look specifically for: axis labels cut off, scatter points clustered at one edge, heatmap cell-text contrast, legend overlapping data, inconsistent chart colors across slides.
3. **One fix-and-verify cycle minimum**. First render is never final.

## Tone

See [`tone_guide.md`](tone_guide.md) for the full guide. Short version: write **analyst takes**, not parroted headlines. If a headline says "X announces Y", your slide-body text should say what Y *means* for the subject's position, not restate it. If you cannot say anything beyond the headline, the item probably doesn't deserve a slide.

## Reference example

[`examples/nvidia_202604/`](examples/nvidia_202604/) is a 12-slide NVIDIA intel brief covering May 2025 – Apr 2026 (79 events, 7 themes) — the deck this skill was distilled from. Open `nvidia-report.pptx` to see the output; `build.js` is the full generator; `slides/` has rendered JPGs if you don't have PowerPoint handy.

## What this skill is not

- It is **not** a generic pptx skill. For free-form slide creation without a dataset, use a simpler pptx tool.
- It does **not** ship a full design system. It gives you opinionated defaults; pick a palette and commit.
