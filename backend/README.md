# ArtiCube backend

FastAPI service for ArtiCube. It handles user accounts, runs the search agents, and stores search history and saved results in MongoDB. The main project README is [one level up](../README.md).

## Run it

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in the values
uvicorn main:app --reload
```

The API runs on http://localhost:8000 with interactive docs at `/docs`.

Settings are read from `.env` by `app/utils/config.py`. `MONGODB_URL`, `MONGODB_DB_NAME`, `SECRET_KEY` and `CORS_ORIGINS` are required. `GOOGLE_API_KEY` is needed for the search agent to work.

## Where things are

| Path | What it does |
|---|---|
| `main.py` | App setup, CORS, routers, health checks, MongoDB connect and disconnect |
| `app/agents/knowledge_agent.py` | The ADK agents and the `get_information()` function the route calls |
| `app/api/routers/agent_router.py` | `POST /api/agent/query`, `GET /api/agent/history` |
| `app/api/routers/user_router.py` | Register, login, get and update the current user |
| `app/api/routers/content_router.py` | Save, list and delete saved results |
| `app/auth/jwt.py` | Password hashing and token creation and verification |
| `app/utils/json_helpers.py` | Cleans up and formats the sources list |

`app/agents/backup.py`, `app/api/routers/agent_router_new.py` and `app/utils/cp_backup.py` are older versions of the agent code that I kept around. They are not used by `main.py`.

## How the agent flow works

`knowledge_agent.py` has three Gemini 2.0 Flash agents. A coordinating agent calls `finder_agent` (Google Search) and then `organizer_agent` as tools, with a `get_fact_sources` function in between that reads the search results out of the session state. The organized text and the source list are returned to the route. `AGENT_ARCHITECTURE.md` in this folder describes an earlier four-agent design, so trust the code over that document.

The agent keeps its state in an in-memory ADK session with a fixed session ID, so it only handles one search at a time properly.

## Tests

The `test_*.py` files are standalone scripts, not a pytest suite. Run one directly:

```bash
python test_simple_integration.py
```

They call the agent and need a working `.env`.
