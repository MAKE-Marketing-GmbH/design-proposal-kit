# PDF structure

Page order, and the CSS classes that build each page. Copy
`templates/proposal-starter.html` and fill it in.

## Page order

| # | Page | What is on it |
|---|---|---|
| 1 | **Cover** | Display title, eyebrow, "Prepared for &lt;client&gt;", a `.note` saying what this is and what is not final yet, three `.pill` tags |
| 2 | **What to expect** | Three `.steps`: the structure, the directions, your choice |
| 3..N | **Structure** | One page per website page: name, numbered sections, two short bullets each. `.sm-grid` / `.sm-secgrid` |
| N+1 | **The directions** | A/B/C with names and one or two lines of character. `.dirs` |
| N+2..N+4 | **Direction A / B / C** | One continuous stacked homepage per direction. `.vpage` / `.vshot` |
| −2 | **What we still need** | Open questions the brief does not answer, grouped. Lead with "most of it is already in your brief, these are just the gaps" |
| −1 | **What happens next** | Three `.steps`, plus a `.callout` that takes the pressure off the decision |

Structure pages scale with the sitemap. A homepage with many sections gets its
own page (`.sm-secgrid`, two columns). Two small pages share one (`.sm-grid`).

## The cover note

The single most useful paragraph in the document. It stops the client reading a
draft as a finished product:

> Here is what your new website could look like: the structure, and three design
> directions for the homepage. This is about layout, look and feel, not the
> final copy and not your real photos. Have a look and tell us which direction
> feels most like you.

## Direction pages

One direction per page, shown as **one continuous homepage** you could scroll,
not three loose screenshots. That is what `scripts/stack-sections.sh` produces.

```html
<section class="page vpage">
  <div class="brandbar">
    <span class="kicker">Direction A</span>
    <span class="logo-text">Your studio</span>
  </div>
  <div class="vlabel">
    <div class="eyebrow">Direction A</div>
    <h2 class="h2">Warm and playful</h2>
  </div>
  <div class="vshot"><img src="stacked/a-full.png" alt="Direction A homepage"></div>
  <div class="foot"><span>Your studio</span><span>Direction A</span></div>
</section>
```

`.vshot img` is capped with `object-fit:contain`, so a tall stacked page scales
down to fit A4 instead of overflowing.

## Naming directions

A short name plus one or two sentences of character. Name the thing, do not sell
it:

- **Warm and playful**: cream, a serif, hand-drawn marks
- **Bright and photographic**: big photos, lots of white space, one accent
- **Bold and colourful**: dark hero, bright tiles

## Branding it

Everything brand-specific is a token at the top of `templates/proposal-base.css`.
Change `--accent` first, then the fonts:

```css
:root{
  --accent:#1F5C4A;
  --font-head:"Your Display Font", Helvetica, sans-serif;
  --font-body:"Your Text Font", Helvetica, sans-serif;
}
```

For custom fonts, put the files next to your HTML and add `@font-face` rules
with **relative** paths. Absolute paths break the moment someone else opens the
file.

## Available classes

| Class | Use |
|---|---|
| `.page` | one A4 page; `.warm` and `.dark` are variants |
| `.brandbar` `.kicker` `.logo-text` | top bar |
| `.display` `.h1` `.h2` `.h3` | headings, uppercase |
| `.eyebrow` | small tracked label above a heading |
| `.lead` `p` `.small` | body copy |
| `.note` | left-bar box, for the cover note |
| `.pills` `.pill` | meta tags; `.solid` fills with the accent |
| `.steps` `.step` `.num` | numbered steps; `.num.circle` for a filled circle |
| `.panel` `.callout` | card, and an accent-filled card |
| `.sm-grid` `.sm-secgrid` `.sm-sec` | sitemap pages |
| `.dirs` `.dir` | the directions overview |
| `.vpage` `.vshot` | a full-page stacked mockup |
| `.secshot` `.seccap` | a single section with a caption under it |
| `.foot` `.pageno` | footer and page number |

## Checks

- Every page opened and looked at, in the PDF, not the HTML.
- Cover title does not overflow its box.
- Mockups fit the page, no browser chrome, no half nav bar at a seam.
- Facts match the brief; open questions are on the "What we still need" page.
- If an image did not load it renders as a blank box. The renderer warns about
  failed loads, so read its output.
