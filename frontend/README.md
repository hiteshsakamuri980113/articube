# ArtiCube frontend

React 19 + TypeScript app built with Vite. The main project README is [one level up](../README.md).

## Run it

```bash
npm install
```

Create `.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

The app runs on http://localhost:5173 and expects the backend to be running at the `VITE_API_URL` address.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run build:check` | Type-check, then build |
| `npm run lint` | ESLint |
| `npm test` | Jest |

## Pages

| Route | Page |
|---|---|
| `/` | Landing page |
| `/login`, `/register` | Authentication |
| `/app` | Home, with the search box and recent searches |
| `/app/search` | Home with the search modal open |
| `/app/saved` | Saved results |
| `/app/account` | Account details and logout |

Everything under `/app` sits behind a protected route that redirects to `/login` when there is no logged-in user.

## Structure

- `src/pages/` has one component per page.
- `src/components/search/` has the search modal, the loading state and the results view.
- `src/components/content/ViewContentModal.tsx` shows a saved result with its sources.
- `src/store/slices/` has the Redux Toolkit slices for auth, search results, saved content, UI state and notifications.
- `src/services/api.ts` is the Axios client and the API calls.
- `src/utils/` has config and a few performance helpers (virtualized list, GPU-friendly rendering, monitoring).
