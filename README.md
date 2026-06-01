![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## RS School React course project

Vite + React + TypeScript Pokedex browser for the RS School **API querying in React** task.

**PokeAPI** powers paginated search and a master–detail split view. **TanStack Query** handles API fetching, caching, and cache TTL for server state. **Zustand** stores user-selected Pokemon and survives page changes and SPA navigation. A sticky **flyout** shows the selected count with **Unselect all** and **Download CSV** actions (native `Blob` + `URL.createObjectURL`, filename like `N_items.csv`). **React Context API** controls light/dark theme via a top-level toggle, with the choice persisted to `localStorage`.

### Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_QUERY_CACHE_TTL_MS` | Query cache TTL in milliseconds (`staleTime` and `gcTime` for TanStack Query) | `300000` (5 minutes) if unset or invalid |

### Routes

- `/` — search and results (`?page=1`, `?page=2&details=25`)
- `/about` — author and course links
- unknown paths — 404 page (React Router catch-all)

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:coverage` | Tests with coverage (statements ≥ 80%) |
| `npm run lint` | ESLint |

Tooling: **ESLint**, **Prettier**, **Husky** (pre-commit: `lint`, pre-push: `test`).

Active branch for this task: **`api-queries`**.
