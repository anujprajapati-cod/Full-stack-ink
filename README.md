# Ink Blog

This repository keeps the API and web app in separate folders:

- `backend/` — Express API
- `frontend/` — React + Vite web app

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and fill in the database, JWT, and Cloudinary values.
2. Copy `frontend/.env.example` to `frontend/.env`. For local development, `VITE_API_URL` should be `http://localhost:3000/api/v1`.
3. In one terminal, run `cd backend && npm install && npm run dev`.
4. In another terminal, run `cd frontend && npm install && npm run dev`.

Never commit either `.env` file. The backend exits at startup if required environment variables are missing.
