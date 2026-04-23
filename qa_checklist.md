# QA Checklist

A deck's first render is never its final render. Budget time for at least one full fix-and-verify cycle.

## Stage 1 — Text QA (via python-pptx)

Open the generated .pptx and walk every text frame:

```python
from pptx import Presentation
p = Presentation('nvidia-report.pptx')
for i, slide in enumerate(p.slides, 1):
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                if para.text.strip():
                    print(f'[{i}] {para.text}')
```

Check for:

- [ ] No placeholder strings (`xxxx`, `lorem`, `TBD`, `Click to add text`)
- [ ] Every monetary stat cited on a slide matches a figure in the source data
- [ ] Every date cited falls inside the report window
- [ ] No years outside the report window (common LLM error: "2023", "2024" drifting in)
- [ ] Subject name spelled consistently (no "Nvidia" / "NVIDIA" mixing within one deck)
- [ ] Source attributions present on every claim that needs one

## Stage 2 — Visual QA (render to images)

Generate slide images so you can review what the reader actually sees, not what the code *suggests* they see.

**Via LibreOffice** (if installed):
```bash
soffice --headless --convert-to pdf nvidia-report.pptx
pdftoppm -jpeg -r 150 nvidia-report.pdf slide
```

**Via PowerPoint (macOS AppleScript)** when LibreOffice is not available:
```bash
osascript -e '
tell application "Microsoft PowerPoint"
    open POSIX file "/abs/path/nvidia-report.pptx"
    save active presentation in "/abs/path/nvidia-report.pdf" as save as PDF
    close active presentation
end tell'
pdftoppm -jpeg -r 150 nvidia-report.pdf slide
```

**Via Keynote** (also macOS) if neither available — similar AppleScript with the `export` verb.

Inspect `slide-*.jpg` for each slide. Specific things to catch:

### Chart-specific

- [ ] **Scatter / bubble** — are all points visible, or are some clipped by axis minimums? Widen axes if so.
- [ ] **Scatter / bubble** — bubble sizes look reasonable, no one cluster is a solid blob. If blob: halve all sizes and re-render.
- [ ] **Heatmap** — cell-text contrast works for BOTH light and dark cells. Dark navy cells need white text; light cells need navy text.
- [ ] **Heatmap** — white gridlines visible between cells (pure tiled color is harder to read).
- [ ] **Combo charts** — both axes labeled. Secondary axis isn't hiding on the wrong side.
- [ ] **Log-scale bar** — smallest-value bars are visible (not squashed to 0). Labels present on each bar.
- [ ] **Radar** — corner labels not cut off at slide edges. Dimension labels fit.
- [ ] **Pareto** — line ends at exactly 100%. Bars sorted descending.

### Layout

- [ ] No text clipped at box edges (pptxgenjs won't warn; it'll silently overflow)
- [ ] Big-number stats fit inside their frames (100pt+ text easily overflows — check manually)
- [ ] Charts don't touch slide margins (≤ 0.3" from edge is cramped)
- [ ] Consistent margins across slides (don't center slide 3's content and left-align slide 4's for no reason)
- [ ] Footer / slide number in same position on every slide

### Color consistency

- [ ] Each theme uses the **same hex** in every chart (the #1 QA failure — charts diverge because different chart APIs default differently)
- [ ] Red/crimson appears only on risk content
- [ ] No subject-brand-color mimicry (independent brief should look independent)

### Typography

- [ ] One header font + one body font across the whole deck (no third font sneaking in)
- [ ] Title sizes consistent (don't have 36pt on some slides and 44pt on others)
- [ ] Body sizes consistent (14-16pt for analyst brief density)
- [ ] No long body passages in all-caps (fine for short labels and titles)

## Stage 3 — The "fresh eyes" pass

The human building the deck has seen every pixel for an hour; they will see what they *expected* to render, not what's actually there. Mitigations:

- Hand the rendered images to a fresh reviewer (subagent, colleague, next-day you) with this prompt:

> "Look at these slide images. Assume there are visual issues — your job is to find them, not confirm everything is fine. For each slide, list 3 specific things that look wrong or ambiguous. If you can't find 3, look harder."

- Read the deck **out of order**. Start from slide 8 backward. Inconsistencies jump out that linear reading smooths over.

## Stage 4 — The audit trail

Every claim in the deck should be traceable to a specific item in the source data. Spot-check 5 random slides:

1. Pick a headline or stat from the slide.
2. Open the source JSON.
3. Find the item with matching date / title / value.
4. If you cannot find it within ~30 seconds, the claim is an LLM hallucination and must be removed or corrected.

The slides you want to audit most carefully are:

- The **executive summary** (highest visibility; errors here are catastrophic)
- The **risk slide** (where alarmism or invented details damage trust)
- The **forward-look slide** (most prone to speculation drifting into claims)
- Any slide with a **direct quote** ("We've achieved AGI") — verify the attribution exactly

## When to ship

Ship when:

- All text-QA checks pass
- At least one visual-QA cycle has run with at least one fix applied
- The audit trail spot-check found no hallucinations
- The subject's name, the period, the total count, and the data source are all on a methodology slide

Do **not** ship when:

- You did QA "by inspection only" without rendering images
- You have unresolved chart issues and are tempted to defer them ("reader will skip slide 7")
- Any stat on the cover slide is un-audited

Decks are durable artifacts; bad ones travel further than good ones. Take the extra render pass.
