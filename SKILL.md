---
name: design-proposal-kit
description: "Turns a client brief into a design proposal PDF in two phases: first write self-contained prompt bundles to paste into an image chat, then take the returned images and render an A4 proposal with several design directions. Use for design proposals, website pitches, mockup PDFs, or client-facing design presentations."
---

# Design proposal kit

Takes a client brief and produces the PDF you actually send: a few pages that
explain the page structure, then one full-page mockup per design direction.

## Two phases, and a stop in between

This is not one continuous run. The images are made by a human in an image chat,
so the work splits at that point and waits.

```
PHASE 1                          YOU                       PHASE 2
brief -> prompt bundles   ->   paste into chat,      ->    stack -> A4 PDF
                               drop images in inbox
         [ STOP. Hand over. ]                              [ resume here ]
```

**Phase 1 ends by stopping.** Do not continue, do not invent placeholder images,
do not call an image API. Print the bundle paths, say what to paste and in which
order, and stop.

**Phase 2 starts when the images exist** in the inbox. If you are invoked and the
inboxes already have images, you are in phase 2. Skip phase 1.

## The inbox

The handoff point is a fixed folder per direction:

```
bundles/<direction-slug>/images/
├── 1-hero.png
├── 2-<section>.png
└── 3-<section>.png
```

The leading number is the order they get stacked in. `1` is the hero and keeps
its navigation. Anything else is fine as a name.

One inbox per direction, so phase 2 never has to guess which image belongs to
which direction.

---

## Phase 1: write the bundles

1. **Read the brief.** Company, offer, location, audience, conversion goal, and
   the one thing the site must achieve. Missing facts stay missing. They go on
   the "What we still need" page, they never get invented.

2. **Decide the sitemap.** Which pages, and which sections per page. If the
   brief does not say, ask. Do not guess a sitemap and present it as fact.

3. **Find references.** A direction built on taste alone is a guess. Pick a style
   per direction and pull two or three real examples from the standing tag pages
   in `reference/style-references.md`. Rules that matter:
   - **Style beats industry.** International is welcome. A moving company can be
     shown a Japanese furniture shop.
   - Never the client's competitors as the style reference. Their current site is
     a **fact** source only.
   - Search wide, keep few. Each keeper gets a reference card.
   - Screenshot them into `bundles/<slug>/references/`. They get attached to the
     image chat. They never go in the client PDF.

4. **Name the directions.** Default is three (A/B/C). Each gets a short name that
   names the thing, plus one or two sentences of character. "Warm and playful:
   cream, a serif, hand-drawn marks" beats "Direction A: modern and clean". One
   of the three should be a deliberate outlier.

5. **Write one bundle per direction**, plus its empty `images/` inbox. Format:
   `reference/bundle-format.md`. Each bundle is self-contained: the system
   prompt, the job block, the full prompt, the references, an index.

6. **Stop and hand over.** Tell the person, per direction:
   - which folder the bundle is in
   - that paste 1 is `01-SYSTEM-PROMPT.md`, whole file, in a **fresh** chat
   - that paste 2 is `00-PASTE-ME.txt`, **with the images in `references/`
     attached to the same message**
   - how many images to expect back
   - where to drop them: `bundles/<slug>/images/`, named `1-hero.png` and so on

   Then stop. Phase 2 is a separate run.

## Phase 2: build the PDF

7. **Check the inboxes.** Every direction needs the same number of images. If one
   is short, say which and stop. Do not build a proposal with a half direction.

8. **Look at the images first.** One section each, **16:9**, no browser chrome, no
   burned-in labels, palette consistent within a direction. A bad image caught
   here costs a re-prompt. Caught after the PDF, it costs the whole page.

9. **Stack each direction.**

   ```bash
   # measure the repeated nav once, on any non-hero section
   ./scripts/stack-sections.sh -m bundles/<slug>/images/2-*.png
   # then stack the whole direction from its inbox
   ./scripts/stack-direction.sh -c 72 bundles/<slug>
   ```

10. **Build the PDF.** Copy `templates/proposal-starter.html`, fill it in, then
    `node scripts/render-pdf.cjs your-proposal.html`. Page order and the
    available CSS classes are in `reference/pdf-structure.md`.

11. **Check every page of the PDF.** Not the HTML. The PDF.

---

## Decisions

- **How many directions?** Three. Two if the brief is tight and the client is
  decisive. Never more than three. It stops being a choice and becomes work.
- **How many sections per direction?** Enough to show the page reads well.
  Usually hero plus two or three. All directions get the same sections, so the
  client compares like with like.
- **One big page** (a homepage with many sections) gets its own structure page.
  **Two small pages** share one.

## Limits

- Never invent a company name, phone number, address, price, review or claim.
- Real people, logos and reference photos need cleared rights before they go in.
- If a fact is missing, it goes on the "What we still need" page.
- No image API and no key. The images come from a chat, by hand. If the inbox is
  empty, phase 2 does not start. It says so and stops.
- The PDF is a proposal about structure, look and feel, not final copy and not
  final photography. Say so on the cover, or the client will read it as final.

## Not this skill

| Request | Belongs to |
|---|---|
| A single image, no PDF | your image tool directly |
| An invoice, report or onboarding PDF | a general document tool |
| Actually building the website | your frontend workflow |
| Writing the site copy | a copywriting workflow |

## Checks before you send

- Cover: title does not overflow, client name is spelled right.
- Structure pages: sections numbered, facts match the brief.
- Direction pages: mockup fits A4, no browser chrome, no half nav bar at a seam,
  no label burned into the image.
- Every direction has the same sections, so the comparison is fair.
- Every fact traceable to the brief. Open questions visible, not filled in.
- Read every page of the rendered PDF. Not the HTML. The PDF.

## Layout

```
prompts/section-mockup-system-prompt.md   paste 1 in every image chat
reference/bundle-format.md                what a bundle contains, and the inbox
reference/style-references.md             the eight styles and where to find them
reference/pdf-structure.md                page order and CSS classes
templates/proposal-base.css               tokens and components
templates/proposal-starter.html           skeleton to copy
scripts/stack-direction.sh                phase 2: one inbox -> one page
scripts/stack-sections.sh                 the low-level stacker and nav measurer
scripts/render-pdf.cjs                    HTML -> A4 PDF
example/                                  a complete worked example
```
