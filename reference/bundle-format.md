# Bundle format

A bundle is one folder that contains everything needed to generate the mockups
for **one design direction**. Self-contained on purpose: you can hand it to
someone else, or open it in six months, and it still works. Nothing in it points
at a file outside the folder.

## Layout

```
bundles/<direction-slug>/
├── 01-SYSTEM-PROMPT.md     copy of prompts/section-mockup-system-prompt.md
├── 00-PASTE-ME.txt         the job block, ready to paste
├── PROMPT.md               the full reasoning: facts, palette, exclusions
├── INDEX.md                sources, assets, rights, status
├── assets/                 cleared reference images, logos, screenshots
└── images/                 THE INBOX: generated images come back in here
```

`01-SYSTEM-PROMPT.md` is a **copy**, not a link. That is what makes the bundle
portable.

## The inbox

`images/` is the handoff point between the two phases. Phase 1 creates it empty.
You fill it from the chat. Phase 2 reads it.

```
bundles/<direction-slug>/images/
├── 1-hero.png
├── 2-beans.png
└── 3-visit.png
```

The **leading number is the stacking order**. `1` is the hero and keeps its
navigation; everything after it gets the repeated nav cropped off. The rest of
the filename is for you, it is not parsed.

Do not mix directions in one inbox. One inbox per bundle is what lets phase 2
work without asking which image belongs where.

Then, from the repo root:

```bash
./scripts/stack-direction.sh -c 72 bundles/<direction-slug>
```

## Paste order

One fresh chat per direction. Exactly two pastes:

1. **`01-SYSTEM-PROMPT.md`**: the whole file, always first. It sets the rules:
   one image per section, no browser chrome, one palette across the set.
2. **`00-PASTE-ME.txt`**: the job block for this direction.

Without paste 1 the model uses its own defaults and the sections drift apart in
colour, type and framing. `00-PASTE-ME.txt` says at the top which file comes
first, so nobody has to remember.

**On conflict, the job wins.** Locked facts and hard exclusions in the job block
override any style preference in the system prompt. Write that line into the
bundle itself.

## 00-PASTE-ME.txt

Short and directly usable. No commentary, no explanation of your reasoning;
that lives in `PROMPT.md`. Structure:

```
Paste 01-SYSTEM-PROMPT.md first, then this block.

Website: <company>, <what they do>, <where>
Direction: <name>, <one line of character>
Palette: <exact hex values>
Type: <heading character> / <body character>
Language: <language of all visible text>

Generate <n> images, one per section:

1. Hero: <real headline>, <real subline>, <CTA label>
2. <section>: <what it contains, real copy>
3. <section>: <what it contains, real copy>

Never show: <hard exclusions>
```

## PROMPT.md

The checkable version. Everything `00-PASTE-ME.txt` compresses:

- where each fact came from (brief, call, website)
- why this direction exists and who it is aimed at
- the palette with roles, not just hex values
- what is deliberately excluded and why
- what is still unknown

If a reviewer asks "where does this claim come from", `PROMPT.md` answers.

## INDEX.md

- Source of the brief and its date
- Every asset used, with its origin and rights status
- Whether people appear and whether they consented
- Status: bundle only, images generated, or approved
- Result of the visual check

## Checks before you use a bundle

- `01-SYSTEM-PROMPT.md` is present and named as paste 1 in `00-PASTE-ME.txt`
- One section per image, count matches the list
- Real copy, no lorem ipsum, no invented facts
- Palette given as exact hex values
- Rights cleared for every person and asset
- Language stated explicitly
