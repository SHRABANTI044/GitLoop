# GitLoop Backend

This backend provides the FastAPI API layer for the GitLoop product described in the project brief. It is modular and follows the same contract the React app expects from `src/lib/auth.ts` and `src/lib/dashboard.ts`.

## Quick start

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

The default configuration uses SQLite for local development; production can be switched to PostgreSQL + pgvector by setting `DATABASE_URL`.

### GitHub OAuth

To connect a real GitHub account locally, create a GitHub OAuth App and set these values in `backend/.env`:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:8001/api/auth/github/callback
FRONTEND_URL=http://localhost:5173
```

Set the OAuth App's **Authorization callback URL** to the same `GITHUB_REDIRECT_URI`, then restart the backend. Keep the client secret private and never commit `backend/.env`.

### AI Repository Analyzer

The analyzer uses the OpenAI Chat Completions API. Add the key only to `backend/.env` and restart the backend:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

Analysis reports and progress are stored in the database. The analyzer reads only bounded text files from the authenticated user's repository; secret-like files are excluded, repository content is treated as untrusted input, and code is never executed. If no provider key is configured, analysis and file explanations return a clear configuration error rather than a simulated answer.
