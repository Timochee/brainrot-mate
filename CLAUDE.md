# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Brainrot Finder" — a single-page vanilla JS web app where users enter their name, surname, date of birth, favorite platform, and screen time level to get a deterministic brainrot term/meme match. No build system, no dependencies.

## Development

Open `index.html` directly in a browser. No build step, no package manager, no server required.

## File structure

```
├── index.html              # Entry point
├── css/
│   └── style.css           # All styles
├── js/
│   ├── brainrots.js        # Data: brainrotTerms array + brainrotImageMap object
│   └── script.js           # All app logic
├── assets/
│   ├── favicon.png         # Favicon
│   ├── image_map.json      # Reference copy (not used at runtime)
│   └── images/             # Brainrot images (lowercase, hyphens, mixed .webp/.png)
└── CLAUDE.md
```

## Architecture

- **index.html** — Page structure: form section (inputs + two pill groups) and result section (term reveal + retry). Loads `js/brainrots.js` before `js/script.js`.
- **js/brainrots.js** — Brainrot term data: flat `brainrotTerms` array and `brainrotImageMap` object mapping term names to image filenames (mixed `.webp` and `.png`). Data-only, no logic.
- **js/script.js** — All app logic: hash-based term matching, form validation, shuffle/reveal animations, floating emoji system. Uses `setupPillGroup()` for pill groups and `getContainerCenter()` for heart animations.
- **css/style.css** — Fully responsive layout using `clamp()` with `dvh`/`vw` units. Includes animated gradient background (blue), 3D flip transitions, dark mode via `prefers-color-scheme`, emoji animations, and `user-select: none` on the result view.
- **assets/images/** — Brainrot term images, all lowercase filenames with hyphens (e.g. `bombardiro-crocodilo.webp`). Mixed `.webp` and `.png` formats.
- **assets/image_map.json** — Reference copy of the term-to-image mapping (not used at runtime, `brainrotImageMap` in `js/brainrots.js` is the source of truth).

## Key patterns

- **All sizing uses `clamp()` with `dvh` for vertical and `vw` for horizontal** — no fixed breakpoints except for extreme small screens. The container must never exceed viewport height.
- **Emojis overflow the container intentionally** (`overflow: visible`) so they can float across the full page.
- **Image lookup uses `brainrotImageMap`** — not slugified filenames. To add a new term, add it to both `brainrotTerms` and `brainrotImageMap` in `js/brainrots.js`, and place the image in `assets/images/`.
- **Code and variable names are in English**, UI text is in French.
- **No inline event handlers** — all events use `addEventListener` in script.js.
