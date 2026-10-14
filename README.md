# BUGDET-TRACKER

## Local Preview

Install dependencies and start the local app:

```sh
npm install
npm start
```

Open `http://localhost:54321`. The frontend and its client-side routes work without a local `.env` file. Sign-in and synced data still use the Supabase project configured in `index.html`.

## Local Backend Setup for Full Account Deletion

This project now includes a small backend service that can securely delete a Supabase auth user and associated records.

### Files added
- `package.json`
- `server.js`
- `.env.example`

### Setup
1. Copy `.env.example` to `.env`
2. Set your Supabase server settings:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (the private service-role key, never the anon key)
3. Run `npm start`

The server listens on port `54321` by default and exposes:
- `POST /api/delete-user`
- `GET /api/health`

### How it works
The frontend sends the current Supabase session token to the backend.
The backend uses the Service Role key to:
- delete the Supabase auth user
- delete the `profiles` row
- delete the `user_data` row

### Notes
- Do not check `.env` into source control.
- Use the Service Role key only on the server.
