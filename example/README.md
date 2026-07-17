# The worked example

A complete proposal for **Northwind Coffee Roasters**, a company that does not
exist. Every name, bean, opening hour and tasting note on these pages is
invented. Nothing here belongs to a real client.

Run it:

```bash
npm run example
```

That produces `proposal.pdf`, nine pages. It also rewrites the committed PDF;
`git checkout example/proposal.pdf` puts it back.

## What is here

```
bundles/                 phase 1 output: one folder per direction
  warm-and-playful/
    01-SYSTEM-PROMPT.md    paste 1, a copy so the bundle is self-contained
    00-PASTE-ME.txt        paste 2, the job block
    PROMPT.md              the checkable version: facts, sources, exclusions
    INDEX.md               assets, rights, status
    images/                THE INBOX. gitignored, refilled by npm run example
  bright-and-photographic/
  bold-and-colourful/

stacked/                 phase 2 output, committed so proposal.html just works
proposal.html            the proposal itself, the thing to copy
proposal.pdf             committed output, so you can look without running
make-demo-sections.cjs   stands in for the human step, fills the inboxes
_readme-page5.png        the screenshot in the top-level README
```

`warm-and-playful/PROMPT.md` is the fully annotated one. The other two are
shorter on purpose, to show what a normal bundle looks like once you are not
explaining yourself.

## About the images

In a real project the images come out of an image chat: you paste
`01-SYSTEM-PROMPT.md`, then `00-PASTE-ME.txt`, and drop what comes back into
`images/`.

This example has **no generated images in it**. `make-demo-sections.cjs` builds
the nine sections as plain HTML, screenshots them at 1440px, and writes them into
those same inboxes. Two reasons:

- The repo stays small and clones fast.
- Nobody has to wonder which parts are real. The flat colour blocks where photos
  would go are obviously placeholders, and that is the point.

So the demo does not show you what a good generated mockup looks like. It shows
you what the pipeline does with one.

**Every section carries the navigation bar**, not just the hero. The system
prompt asks for a nav on the hero only, and models repeat it anyway. That is why
`stack-sections.sh` can crop, so the example reproduces the realistic case:
`npm run example` really does crop 76px off every section after the hero. Look at
`stacked/warm-and-playful-full.png` and you will not find a seam.

## What the example demonstrates

- The two-phase shape: bundles, a stop, then inboxes to PDF
- The nine-page order from [`../reference/pdf-structure.md`](../reference/pdf-structure.md)
- Three genuinely different directions from the same structure and the same copy,
  which is what makes a direction a real choice rather than a shade
- The nav crop and stack, running for real
- A "What we still need" page that names gaps instead of inventing answers
- Branding via one CSS variable: this example only sets `--accent`
