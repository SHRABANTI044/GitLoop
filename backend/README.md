# GitLoop Backend

This backend provides the FastAPI API layer for the GitLoop product described in the project brief. It is modular and follows the same contract the React app expects from `src/lib/auth.ts` and `src/lib/dashboard.ts`.

## Quick start

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The default configuration uses SQLite for local development; production can be switched to PostgreSQL + pgvector by setting `DATABASE_URL`.
