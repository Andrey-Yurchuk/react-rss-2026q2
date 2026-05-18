![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## RS School React course project

Vite + React + TypeScript Pokedex browser for the RS School **routing and hooks** task.

**PokeAPI** powers paginated search results, a master–detail split view, and lookup by exact English name. State lives in **functional components** with hooks; **`useLocalStorage`** persists the last submitted search. **`AppErrorBoundary`** remains a class component.

### Routing

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

Active branch for this task: **`hooks-and-routing`**.
