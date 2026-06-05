# Magic Maze Backend

Server-authoritative backend MVP for Magic Maze Online.

Implemented:
- Rooms, host validation, Socket.IO sync, token-based same-browser reconnect, and `GET /scenarios`
- Scenario selection for scenarios 1-7 and difficulty selection
- Shared heroes with action-card validation
- One-cell and multi-cell movement with walls, occupancy, guards, Vortex, and Escalator
- Tile exploration and backend-validated tile placement
- Sand timer, loudspeaker communication, temporary discussion, automatic mute after the next valid gameplay action, theft, escape, victory, and defeat
- Post-game room reuse with play-again, return-to-lobby, scenario changes, and difficulty changes
- Objectives, achievements/progression, guard/challenge MVP, and character ability MVPs
- `game:effect` events for frontend animation/audio hooks
- Automated backend tests for illegal moves and illegal client-server interactions

Honest limitations:
- Exact visual/cell metadata for the uploaded physical maze tiles is still placeholder unless marked verified.
- Advanced scenarios beyond the MVP flags are not full board-game simulations.
- Frontend rendering, audio playback, and animation are outside the backend.
- Sessions and reconnect tokens are in memory only; no database persistence is implemented.

Run:

```bash
npm install
npm run build
npm test
```

Production notes:
- Copy `.env.example` to `.env` for local configuration.
- Set `NODE_ENV=production` and a concrete `CORS_ORIGIN` before deploying.
- Rooms are still in memory. Use persistent storage before relying on this for long-running public games.

Additional backend notes live in `ARCHITECTURE.md`.
