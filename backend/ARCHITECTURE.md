# Magic Maze Backend Architecture

## Current Status

This backend is a server-authoritative MVP for Magic Maze Online. Clients request actions, the server validates them against the current `GameSession`, applies legal state changes, and broadcasts updated state plus semantic events for the frontend.

Implemented backend areas:

- Room creation, joining, token-based reconnect/sync, host checks, and Socket.IO ownership validation
- Scenario selection for scenarios 1-7 and difficulty selection
- Shared heroes controlled by player action cards
- One-cell movement and multi-cell directional movement
- Wall, occupancy, guard, Vortex, Escalator, and tile-placement validation
- Tile exploration and backend-validated placement with placeholder tile metadata
- Sand timer spaces, loudspeaker communication, temporary discussion, and automatic mute after the next valid gameplay action
- Scenario 1 tutorial communication, Scenario 3 action-card passing on timer flip, and post-game room reuse
- Theft, escape, victory, defeat, objectives, achievements, guards/challenges, and character ability MVPs
- `game:effect` events for frontend animation/audio hooks
- `GET /scenarios` for lobby scenario display

Honest limitations:

- Physical tile image fidelity is not complete. Tile metadata marked `placeholder` is playable backend data, not a verified exact translation of the uploaded board images.
- Advanced scenarios beyond the represented rule flags are MVP implementations, not complete board-game simulations.
- Tile rotation is blocked until rotated coordinates, walls, arrows, entries, and neighbor links are implemented.
- Sessions are in memory only. There is no database persistence yet.
- Reconnect is MVP-scoped: it restores a same-browser player while the backend process still holds the room.
- Frontend voice/audio/rendering is outside this backend. The backend only emits state and effect hooks.

## Main Runtime Model

`GameSession` is the authoritative state object. It contains:

- selected scenario and difficulty
- players and assigned action cards
- shared heroes and their positions
- board cells, placed tiles, and tile deck
- sand timer state
- communication state
- objectives, achievements, result, and challenge state

The frontend should treat server broadcasts as the source of truth.

Reconnect tokens are stored on backend `Player` objects as non-enumerable fields. They are sent only in the private `room:created` / `room:joined` payload for that player, not in room-wide `GameSession` broadcasts.

## Request Flow

1. Socket handler receives a client event.
2. Zod validator parses the payload.
3. `RoomService` verifies the room, player, socket ownership, host status when needed, game status, and rule-specific conditions.
4. If valid, the service mutates the session, records effects/objective changes, and returns the room.
5. Handler emits `action:accepted`, `state:updated`, and any dedicated events such as `timer:updated`, `communication:updated`, `tile:placed`, `game:victory`, or `game:effect`.
6. If invalid, handler emits `action:rejected` to the requester.

Unexpected backend failures should use `server:error`; normal illegal gameplay requests should use `action:rejected`.

## Communication Flow

Lobby and post-game communication are open.

For scenarios without tutorial communication:

- game start sets communication to silent gameplay
- sand timer spaces open temporary discussion
- loudspeaker spaces open temporary discussion when not ignored by the scenario
- Elf exploration can open temporary discussion when the scenario flag is enabled
- the next valid gameplay action closes temporary communication automatically
- invalid actions do not close communication

Scenario 1 uses `communicationAlwaysOpen`, so gameplay stays open and movement does not mute players.

## Timer Flow

Sand timer reset uses `session.difficultySettings.timeLimitSeconds`:

- Easy: 240 seconds
- Normal: 180 seconds
- Hard: 120 seconds

Timer spaces can be used once, cannot be used after theft/final countdown, and can be activated either through `sandtimer:activate` or automatically when a hero lands on an unused timer cell.

Scenario 3 rotates action cards among active non-spectator players when a timer space is used.

## Post-Game Flow

Victory and defeat keep the room available. Communication opens with `PostGame` reason, and the host can:

- start a new setup with `game:playAgain`
- return to lobby with `game:returnToLobby`
- change scenario after game end
- change difficulty after game end

The reset preserves room code, connected players, and host identity while rebuilding board, heroes, deck, objectives, timer state, signals, guards, result, and effects.

## Key Files

- `src/rooms/roomService.ts`: central service for room and gameplay actions
- `src/socket/handlers.ts`: Socket.IO event wiring and emissions
- `src/game/gameTypes.ts`: shared domain types
- `src/game/gameStateFactory.ts`: session initialization and reset setup
- `src/rules/communicationState.ts`: communication mode helpers
- `src/rules/sandTimerRules.ts`: timer activation and automatic timer handling
- `src/rules/movementRules.ts`: one-cell and multi-cell movement checks
- `src/rules/tilePlacementRules.ts`: exploration and tile placement
- `src/rules/specialActionRules.ts`: Vortex and Escalator
- `src/rules/objectiveRules.ts`: objective updates
- `src/rules/achievementRules.ts`: achievement updates
- `src/rules/guardRules.ts`: guard challenge MVP
- `src/data/scenarios.ts`: scenario definitions and flags
- `src/data/mallTiles.ts`: tile metadata, including placeholder status
- `src/data/actionCards.ts`: uploaded action-card image mapping

## Verification

Use:

```bash
npm run build
npm test
```

The test suite covers illegal moves, illegal client-server interactions, scenario/difficulty selection, communication flow, timer behavior, post-game reuse, tile placement, special actions, objectives, achievements, guards, and API shape.
