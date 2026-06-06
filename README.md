![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## RS School React course project

Vite + React + TypeScript Pokedex browser extended with profile forms for the RS School **React Forms** task.

The base app still uses **PokeAPI** for paginated search and a master–detail split view. **TanStack Query** handles API fetching and caching. **Zustand** stores selected Pokemon and form submission history. **React Context API** controls light/dark theme with `localStorage` persistence.

### React Forms

Active branch: **`forms`**.

- **Validation:** shared [Zod](https://zod.dev/) schema for both forms (email without regex, image type/size, country list, password match, and more)
- **State:** [Zustand](https://zustand.docs.pmnd.rs/) store for `countries`, `submissions`, and `lastSubmissionId`
- **Forms:**
  - **Uncontrolled** — `FormData`, validate on submit
  - **React Hook Form** — live validation, disabled submit while invalid
- **Modal** — reusable accessible dialog via React Portal (focus trap, ESC/outside close, focus return)
- **Image upload** — PNG/JPEG only, converted to base64 on successful submit; preview in submission history cards
- **Profile submissions** — history on the main page with a short highlight for the newest entry

### Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_QUERY_CACHE_TTL_MS` | Query cache TTL in milliseconds (`staleTime` and `gcTime` for TanStack Query) | `300000` (5 minutes) if unset or invalid |

### Routes

- `/` — search, results, profile forms, and submission history (`?page=1`, `?page=2&details=25`)
- `/about` — author and course links
- unknown paths — 404 page (React Router catch-all)

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:coverage` | Tests with coverage (statements ≥ 80%) |

Tooling: **ESLint**, **Prettier**, **Husky** (pre-commit: `lint`, pre-push: `test`).

GitHub Pages deploy workflow runs on push to **`forms`**.
