# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Brainrot Finder" — a single-page vanilla JS web app where users enter their name, surname, date of birth, energy type (Goblin/Rizz/Slay/Skibidi), and element (Feu/Eau/Terre/Air) to get a deterministic brainrot term/meme match. No build system, no dependencies.

This project shares a config-driven engine (`js/engine.js`, `css/style.css`, `index.html`) with the sibling project `/Users/timoremy/GithubProjects/ame-soeur`. These three files must stay **identical** between the two projects.

## Development

Open `index.html` directly in a browser. No build step, no package manager, no server required.

## File structure

```
├── index.html              # SHARED shell (identical across projects)
├── config.js               # SPECIFIC: theme, texts, pills, callbacks, features
├── data.js                 # SPECIFIC: brainrot terms + image map (APP_DATA)
├── manifest.json           # PWA manifest (app name, icons, theme)
├── sw.js                   # Service worker (offline cache)
├── css/
│   └── style.css           # SHARED styles (CSS custom properties, identical)
├── js/
│   └── engine.js           # SHARED logic (identical across projects)
├── assets/
│   ├── favicon.png         # Favicon & PWA icon
│   ├── image_map.json      # Reference copy (not used at runtime)
│   └── images/             # Brainrot images (lowercase, hyphens, mixed .webp/.png)
└── CLAUDE.md
```

## Architecture

- **index.html** — Shared static shell: 3 fixed inputs (prénom, nom, dob), a `#pillGroupsContainer` div for dynamic pill groups, result section with image + name + actions. Loads `config.js` → `data.js` → `js/engine.js`.
- **config.js** — Project-specific `APP_CONFIG` object defining: theme colors (CSS custom properties), UI texts, pill groups, emoji config, result display options, seed/pool/result callbacks, and feature flags (PWA, analytics, date validation, stagger animations).
- **data.js** — Project-specific `APP_DATA` object containing the data (terms array + imageMap object for brainrot).
- **js/engine.js** — Shared IIFE that reads `APP_CONFIG` + `APP_DATA`: applies theme via CSS custom properties, builds pill groups from config, populates UI text, runs discover logic using config callbacks (`getSeed`, `getPool`, `getResult`), manages the floating emoji system, conditional share button, PWA registration, and analytics injection.
- **css/style.css** — Shared responsive layout using `clamp()` with `dvh`/`vw` units. All colors use `var(--xxx)` CSS custom properties set by engine.js at runtime. Includes animated gradient, 3D flip, stagger animations (opt-in via `.stagger` class), dark mode via `prefers-color-scheme`, emoji drift/flying animations.
- **manifest.json** — PWA manifest: declares the app name, icons, theme color, and `display: standalone`.
- **sw.js** — Service worker: caches all assets at install, serves cache-first with background revalidation.

## Key patterns

- **Config-driven architecture** — All project-specific behavior lives in `config.js`. The engine and styles are 100% shared.
- **All colors are CSS custom properties** — set by `applyTheme()` in engine.js from `APP_CONFIG.theme`. Never hardcode colors in style.css.
- **All sizing uses `clamp()` with `dvh` for vertical and `vw` for horizontal** — no fixed breakpoints. The container must never exceed viewport height.
- **Emojis overflow the container intentionally** (`overflow: visible`) so they can float across the full page.
- **Image lookup uses `APP_DATA.imageMap`** — not slugified filenames. To add a new term, add it to both `terms` and `imageMap` in `data.js`, and place the image in `assets/images/`.
- **Code and variable names are in English**, UI text is in French.
- **No inline event handlers** — all events use `addEventListener` in engine.js.
- **When modifying shared files** (`index.html`, `js/engine.js`, `css/style.css`), always copy them to the sibling project afterwards and verify both still work.
