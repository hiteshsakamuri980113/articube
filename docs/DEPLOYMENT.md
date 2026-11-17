# Deploying ArtiCube

The backend runs on Render and the frontend on Vercel. MongoDB lives on Atlas. The dashboards change over time, so treat the setting names below as a guide.

## 1. MongoDB Atlas

1. Create a cluster and a database user with read/write access.
2. Allow access from your host. Render's outbound IPs can change, so the simplest option is `0.0.0.0/0`, which is open to every address. Tighten it if you can.
3. Copy the connection string. It looks like `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/`.

## 2. Backend on Render

Create a new Web Service from the GitHub repo with these settings:

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Health check path | `/api/v1/health` |

`backend/render.yaml`, `backend/Procfile` and `backend/runtime.txt` (Python 3.11) are in the repo if you prefer to deploy from config.

Environment variables:

```
MONGODB_URL=<your Atlas connection string>
MONGODB_DB_NAME=articube
SECRET_KEY=<a long random string>
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GOOGLE_API_KEY=<your Google API key>
GOOGLE_GENAI_USE_VERTEXAI=false
CORS_ORIGINS=["https://<your-app>.vercel.app"]
```

Once it is up, open `https://<your-service>.onrender.com/api/v1/health`. It should return `{"status": "ok", "message": "ArtiCube API v1 is running"}`.

## 3. Frontend on Vercel

Import the same repo as a new project:

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |

Environment variables:

```
VITE_API_URL=https://<your-service>.onrender.com
VITE_APP_NAME=ArtiCube
VITE_DEV_MODE=false
```

`frontend/vercel.json` rewrites unknown paths to `index.html` so client-side routes like `/app/saved` work on refresh.

## 4. Allow the frontend in CORS

After Vercel gives you the final URL, put it into `CORS_ORIGINS` on Render (add `http://localhost:5173` too if you still develop locally) and redeploy the backend. A CORS error in the browser console right after deploying almost always means this step was missed.

## Checking it works

1. Open the Vercel URL and register an account.
2. Run a search and wait for the answer and sources.
3. Save a result and find it on the Saved page.

## Things to know

- Render's free tier puts the service to sleep when idle, so the first request after a while can take a minute.
- A search can take several seconds, because the agent makes more than one model call.
- `deploy-prep.sh` in the repo root checks the folder layout, installs the frontend dependencies and runs a test build before you deploy.
