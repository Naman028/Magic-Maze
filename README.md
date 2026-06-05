# Magic Maze Online

Magic Maze Online is a real-time cooperative web adaptation of the Magic Maze board game. Players control heroes together, explore maze tiles, collect items, use special actions, and escape before the timer runs out.

This project was built for the Software Architecture and Development course.

## Repository Branches

The repository is organized by branch:

- `main`: repository metadata and stable entry point
- `frontend`: frontend-only code
- `backend`: backend-only code
- `integration`: combined frontend and backend application

Use the `integration` branch to run the complete project locally.

## Tech Stack

- Frontend: React, TypeScript, Vite, Zustand, Socket.IO client
- Backend: Node.js, Express, TypeScript, Socket.IO, Zod
- Testing: Vitest

## Project Structure

```text
backend/
  src/
    data/          Game data, tile metadata, heroes, scenarios, action cards
    game/          Game session types and factories
    rooms/         Room lifecycle and game orchestration
    rules/         Movement, tile placement, timer, objectives, and special rules
    socket/        Socket.IO event handlers and payloads
    tests/         Backend rule and integration tests

frontend/
  public/          Public game assets and images
  src/
    app/           App shell, routes, and stores
    domain/        Shared frontend game types
    features/      Game, lobby, landing, and result UI
    services/      Socket.IO client integration
    shared/        Asset paths and reusable utilities
    styles/        Global styles
```

## Run Locally

Clone the repository and switch to the combined branch:

```bash
git clone https://github.com/Naman028/Magic-Maze.git
cd Magic-Maze
git switch integration
```

Install and start the backend:

```bash
cd backend
npm install
npm run dev
```

In a second terminal, install and start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at:

```text
http://localhost:5173
```

The backend runs at:

```text
http://localhost:8000
```

## Build and Test

Frontend build:

```bash
cd frontend
npm run build
```

Backend tests:

```bash
cd backend
npm test
```

## Assets

Game images are stored in:

```text
frontend/public/assets/magic-maze/
```

This includes action cards, hero pawns, hero cards, maze tiles, decks, and game tokens.
