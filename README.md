# BUGDET-TRACKER

## Local Backend Setup for Full Account Deletion

This project now includes a small backend service that can securely delete a Supabase auth user and associated records.

### Files added
- `package.json`
- `server.js`
- `.env.example`

### Setup
1. Copy `.env.example` to `.env`
2. Fill in your Supabase settings:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run:
   - `npm install`
   - `npm start`

The backend listens on port `54321` by default and exposes:
- `POST /delete-user`

### How it works
The frontend sends the current Supabase session token to the backend.
The backend uses the Service Role key to:
- delete the Supabase auth user
- delete the `profiles` row
- delete the `user_data` row

### Notes
- Do not check `.env` into source control.
- Use the Service Role key only on the server.
