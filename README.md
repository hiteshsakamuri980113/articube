# ArtiCube

ArtiCube is a search app that answers a question with a short, organized write-up and a list of the sources it used. You type a topic, an AI agent searches the web, and you get structured content back with titles, links and years for each source. You can save results, and your recent searches are kept so you can come back to them.

It is a full-stack project: Google's Agent Development Kit (ADK) agents behind a FastAPI backend, with a React frontend.

## What it does

- Search a topic and get an organized answer plus a sources list (title, source, link, year)
- Register with an email, username and password, then log in (JWT auth)
- Save a result with the Save button, open it again later from the Saved page, and delete it
- Recent searches on the home page, backed by the stored query history
- Account page with your profile details and logout

## How a search works

The backend runs a small group of Gemini 2.0 Flash agents built with Google ADK:

1. A coordinating agent (`sources_agent`) receives the topic.
2. It calls `finder_agent`, which uses the `google_search` tool to collect results.
3. It calls a `get_fact_sources` function that pulls the source list out of the shared session state.
4. It calls `organizer_agent`, which turns the search content into the final write-up.

The write-up and the formatted sources are returned from `POST /api/agent/query`, and the query is saved to the user's history.

## Tech stack

**Backend:** Python 3.11, FastAPI, Google ADK, MongoDB (Motor), python-jose for JWT, passlib/bcrypt for password hashing

**Frontend:** React 19, TypeScript, Vite, Redux Toolkit, React Router 7, Tailwind CSS, Axios, Jest and Testing Library

**Hosting:** Render for the API, Vercel for the frontend (see [DEPLOYMENT.md](DEPLOYMENT.md))

## Project layout

```
articube/
├── backend/
│   ├── main.py                 FastAPI app, CORS, router setup, health checks
│   └── app/
│       ├── agents/             ADK agents (knowledge_agent.py)
│       ├── api/models/         Pydantic models (users, saved content)
│       ├── api/routers/        agent, content and user routes
│       ├── auth/               JWT creation and verification
│       ├── db/                 MongoDB connection
│       └── utils/              settings, content and JSON helpers
└── frontend/
    └── src/
        ├── pages/              Landing, Login, Register, Home, Saved, Account
        ├── components/         search modal, results, saved-content modal, layout
        ├── store/slices/       Redux slices (auth, knowledge, content, ui, notifications)
        ├── services/api.ts     API calls
        └── context/            auth, content and knowledge contexts
```

## Running it locally

You need Python 3.11+, Node 18+, a MongoDB database (Atlas works fine) and a Google API key.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `.env`. The values the app reads are:

```env
MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
MONGODB_DB_NAME=articube
SECRET_KEY=<any long random string>
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GOOGLE_API_KEY=<your Google API key>
GOOGLE_GENAI_USE_VERTEXAI=false
CORS_ORIGINS=["http://localhost:5173"]
```

Then start the server:

```bash
uvicorn main:app --reload
```

The API runs on http://localhost:8000 and the interactive docs are at http://localhost:8000/docs.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

The app runs on http://localhost:5173.

## API

All routes except register, login and the health checks need a bearer token.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/users/register` | Create an account |
| POST | `/api/users/login` | Log in and get a token |
| GET | `/api/users/me` | Current user |
| PUT | `/api/users/me` | Update the current user |
| POST | `/api/agent/query` | Run a search (`save_to_history` query param, default true) |
| GET | `/api/agent/history` | Recent searches (`limit`, 1 to 50) |
| POST | `/api/content/save` | Save a result |
| GET | `/api/content/saved` | List saved results |
| DELETE | `/api/content/delete?content_id=<id>` | Delete a saved result |
| GET | `/`, `/health`, `/api/v1/health` | Health checks |

## Tests

The frontend has a Jest setup with one component test (`FloatingMenu`):

```bash
cd frontend
npm test
```

The backend has a few integration scripts around reference/source handling (`backend/test_*.py`). They are meant to be run directly with `python`, for example `python test_simple_integration.py`, and they need a configured `.env`. They are not a pytest suite.

## Known limitations

- The agent uses one fixed ADK session ID with an in-memory session service. That is fine for a single user, but two searches running at the same time would share state. Using a session per request is the first thing I would change.
- The login token is stored in `localStorage`.
- Test coverage is thin, especially on the frontend.
- Answers come from Gemini plus web search results, so quality depends on what the search returns. The sources list is there so you can check them.

## Author

Hitesh Sakamuri
