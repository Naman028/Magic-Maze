# Magic Maze Frontend

React MVP for Magic Maze Online.

## Run Locally

Start the backend first. By default the frontend expects:

```text
VITE_BACKEND_URL=http://localhost:8000
```

Install and build:

```bash
npm install
npm run build
```

Run a local preview:

```bash
npm run preview
```

For development:

```bash
npm run dev
```

If Vite dev dependency optimization has trouble in a synced OneDrive path, use `npm run build` and `npm run preview`.

## Source File Convention

This project uses TypeScript everywhere.

- Use `.tsx` for React files that return JSX, such as pages, providers, routes, and UI components.
- Use `.ts` for non-UI code, such as domain types, stores, socket code, constants, hooks without JSX, and utility functions.
- Do not rename every file to `.tsx`; plain logic files should stay `.ts` so the structure remains clear and professional.

## Source Structure

```text
src/
  app/              App shell, routing, providers, and application stores
  domain/           Shared game contracts and domain types
  features/         Feature-owned UI, hooks, and feature logic
  pages/            Route-level screens
  services/         External service integrations, such as Socket.IO
  shared/           Cross-feature constants, utilities, and reusable pieces
  styles/           Global styles
```

Use `@/` imports for cross-folder references, for example `@/domain/game.types`.
Keep short relative imports inside the same feature folder.

Production notes:
- Copy `.env.example` to `.env` for local configuration.
- Set `VITE_BACKEND_URL` to the deployed backend URL before building.

## Current Scope

Implemented:

- Landing page, lobby page, game page, and result overlay
- Socket.IO connection to the backend contract
- Room create/join, ready, scenario/difficulty selection, start game, reconnect/sync
- Timer, communication, player cards, action cards, board, objectives, log, and post-game controls
- Maze tile image rendering with backend cell overlays
- Hero pawns, guard pawns, movement target selection, tile placement, Vortex target selection, Escalator, Mage crystal explore, and Barbarian camera disable buttons

Limitations:

- Backend tile metadata is still placeholder unless marked verified, so physical image/cell fidelity is not final.
- The How to Play and settings controls are visual placeholders.
- Frontend tests are not implemented yet.
