# Tone Guide

An intelligence deck earns trust through its voice, not just its data. This file codifies the writing choices that separate an analyst brief from a news aggregator readout.

## The single test

For every line of text on every slide, ask:

> *Does this tell the reader what the data means, or does it just restate what a headline said?*

If the answer is "restate", cut or rewrite.

## Analyst take vs. headline parrot

**Headline parrot** (don't):
> "NVIDIA announced the Vera Rubin architecture at GTC Taipei."

**Analyst take** (do):
> "Vera Rubin pulls the next-gen roadmap into 2026; combined with the Micron memory deal, this is NVIDIA betting on sustained data-center GPU dominance through 2027+."

The second sentence makes a claim the reader couldn't have made by just reading the source article. That's the bar.

## Writing cadence for each slide type

- **Executive summary slide**: 3-5 findings. Each finding is ≤ 15 words. No "In summary" openers. Lead with the claim, not "We observed…".
- **Theme slides**: one-paragraph thesis at the top (2-3 sentences), then dated headlines below. The paragraph is YOUR synthesis; the headlines are the receipts.
- **Risk slide**: **show each risk in a single line** with date + source. Expand in speaker notes, not on the slide.
- **Forward look / watchlist**: each item phrased as "What to watch: [concrete thing], because [reasoning]". Avoid vague forecasts.
- **Methodology slide**: 4-6 bullets. Tell the reader what was collected, what was filtered, what was deduplicated, what the source mix looks like, any known biases.

## Language rules

- **No hedging filler**: cut "it seems", "appears to", "may suggest", "could potentially". If the data warrants the claim, say it. If not, the claim shouldn't be on the slide.
- **No breathless language**: "massive", "huge", "groundbreaking", "game-changing". The numbers speak; adjectives don't amplify them.
- **Use the subject's full name once per slide**, then pronouns or short form. "NVIDIA" → "the company". This keeps text dense.
- **Active voice**: "NVIDIA acquired SchedMD" beats "SchedMD was acquired by NVIDIA".
- **Dates as citations**: every claim tied to external data should cite a date or source inline (e.g., "(Apr 10)"). Not every word — every claim.

## Risk framing

Risk slides are where tone matters most. Two failure modes:

- **Alarmist**: exaggerates severity, erodes trust on the next brief.
- **Cozy**: hedges everything into meaninglessness ("some analysts have raised concerns").

The right tone is **flat and specific**: name what happened, cite the date and source, note what changes downstream. Let the reader calibrate severity from the facts.

Example:
> **Apr 10 — Sharetronic / $92M banned chips disclosed.** Shenzhen-based firm publicly reported holdings of restricted NVIDIA servers. Second enforcement-adjacent disclosure this month. Watch for US Commerce Department statement.

That's 40 words. Flat, specific, dated, downstream-oriented.

## What goes in speaker notes (vs. on the slide)

Put in speaker notes:

- Methodology caveats ("this radar scoring is subjective; based on items observed in the period")
- Source-article URLs when the slide gets crowded
- Counterfactuals and alternate interpretations
- Analyst rationale for scoring / categorization decisions

Keep on the slide:

- The claim
- The evidence (dates, counts, chart)
- The citation attribution

Readers should be able to extract the whole argument from the slide. Speaker notes are for the presenter's reinforcement.

## Copy-editing pass

Before declaring the deck done, do one pass where you:

1. Read each slide title aloud. Does it state what the slide claims, or is it a generic label ("Results", "Analysis")? Rewrite labels into claims.
2. Cut every "the", "a", "an" you can. Intelligence brief prose is compressed.
3. Check every stat. For each number on the slide, open the source data and verify the number appears there or is a trivial aggregation of it. Wrong numbers on a brief destroy credibility.
4. Check for dates. LLM-generated decks often hallucinate old dates (2023, 2024) into a current-period brief. Grep the deck's extracted text for any date before the period start.

## Voice references

Aspire to:
- A Bloomberg bullet (compressed, dated, attributed)
- An FT Alphaville post (opinionated but citation-heavy)
- A private equity deal memo (specific amounts, specific parties, specific dates)

Avoid sounding like:
- A corporate blog post (generic momentum language)
- A press release (subject-flattering)
- An AI summary (hedged, bullet-heavy, no point of view)
