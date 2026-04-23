# auto-ppt

> A Claude Code skill for turning structured event data into narrative intelligence slide decks (.pptx).

Built for analysts, monitoring platforms, and competitive-intelligence work — where you have a pile of dated signals and need to turn them into a deck that tells a story, not just lists headlines.

**Author**: Judy ([@witch-Judy](https://github.com/witch-Judy))
**License**: [GPL-3.0](LICENSE)

---

## What it does

Given structured event data (news, intel items, transactions, deal logs, dated signals), this skill guides Claude through generating a **narrative-first** `.pptx` deck:

- Picks the right chart for each data pattern (time clustering, sentiment drift, orders-of-magnitude comparison, risk clusters, source concentration, competitive profiling)
- Enforces consistent color coding across every chart in the deck
- Writes analyst-grade prose — not bulleted headline parrots
- Runs a mandatory text-QA + visual-QA loop before shipping

The output deck reads like a research brief, not a generated report.

---

## Quick start

This skill lives in `~/.claude/skills/auto-ppt/`. To install:

```bash
git clone https://github.com/witch-Judy/auto-ppt.git ~/.claude/skills/auto-ppt
```

Then in Claude Code, invoke via the Skill tool or by prompting Claude with something like:

> "I have NVIDIA news signals for Q1 2026 at `/path/data.json`. Generate a narrative intelligence deck using the auto-ppt skill."

Claude will read `SKILL.md`, ask for the design context it needs, and build the deck.

### Dependencies

- [`pptxgenjs`](https://gitbrent.github.io/PptxGenJS/) (MIT) — deck generation
- [`python-pptx`](https://python-pptx.readthedocs.io/) — text QA
- LibreOffice OR macOS PowerPoint/Keynote — PDF rendering for visual QA
- `pdftoppm` (poppler) — PDF → JPG for visual QA

See [`SKILL.md`](SKILL.md) for the full setup instructions.

---

## What's in this repo

| File | What it is |
|---|---|
| [`SKILL.md`](SKILL.md) | Entry point. Triggers, input contract, design-context gathering, implementation scaffolding. |
| [`chart_playbook.md`](chart_playbook.md) | Chart selection guide: 8 data patterns → 8 chart recipes with working pptxgenjs config. |
| [`tone_guide.md`](tone_guide.md) | Writing rules for analyst-grade prose. Headline parrot vs. analyst take. |
| [`qa_checklist.md`](qa_checklist.md) | Mandatory pre-ship QA loop (text + visual + audit trail). |
| [`examples/nvidia_202604/`](examples/nvidia_202604/) | Reference implementation. 12-slide NVIDIA intel brief covering May 2025 – Apr 2026 (79 events, 7 themes). Full `build.js`, generated `nvidia-report.pptx`, rendered slide JPGs. |

---

## Example output

The reference deck (`examples/nvidia_202604/`) includes:

- Timeline bubble scatter showing the GTC-week event explosion
- Month × theme heatmap for precise cadence
- Sentiment drift combo chart (volume up, sentiment cooling)
- Log-scale dollar comparison ($1T roadmap alongside $92M banned shipments)
- Annotated risk scatter with dated callouts
- Moat radar across 5 dimensions
- Source Pareto exposing aggregator concentration

Open [`examples/nvidia_202604/nvidia-report.pptx`](examples/nvidia_202604/nvidia-report.pptx) to see the output.

---

## Why this exists

Most auto-generated decks fail in the same way: they treat data as filler for a pre-made template, not as the subject of the deck. The result is slides that restate headlines and charts that are decorative rather than load-bearing.

This skill bakes in a different default:

1. **Narrative claim first** — every slide states what it's arguing, then proves it with a chart.
2. **Charts fit data patterns** — there's a playbook, not a default chart type.
3. **Colors code meaning** — theme colors stay consistent across every chart in the deck.
4. **Tone is analyst, not press release** — write what the data *means*, not what happened.
5. **Always QA** — render, inspect, fix, re-render. No exceptions.

It came out of building intelligence briefs for a real monitoring platform (SIGINT) and hitting the same "this looks AI-generated" failure mode over and over until the fixes crystallized.

---

## Customization

The skill is opinionated but not rigid. Things you can override per-report:

- **Palette** — pick a subject-informed dominant color and one accent; the skill will use them consistently
- **Themes** — the category axis can be anything (industries, regions, deal types); the chart playbook is category-agnostic
- **Period length** — works for weekly, monthly, quarterly, or multi-year windows
- **Depth** — 8-slide short brief vs. 20-slide deep dive both work; adjust slide count in the prompt

What you cannot override without defeating the skill's purpose:

- Using pie charts
- Inconsistent color coding across slides
- Skipping the visual QA loop
- Parroting headlines instead of analyst takes

---

## Contributing

This skill is public so it can improve over time. Ways to contribute:

- Open an issue with a chart pattern that would belong in the playbook
- Submit a PR with a worked example from a different domain (M&A, hiring intel, patent activity, etc.)
- Propose refinements to the tone guide based on decks that worked (or didn't)

Pull requests welcome. Keep changes opinionated — a skill that hedges loses its value.

