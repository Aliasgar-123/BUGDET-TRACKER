import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 54321;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors({ origin: true }));
app.use(express.json());

app.post('/delete-user', async (req, res) => {
  const { userId, secret } = req.body;
  if (!userId || !secret) {
    return res.status(400).json({ error: 'userId and secret are required.' });
  }

  if (secret !== process.env.DELETE_USER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    await supabaseAdmin.from('profiles').delete().eq('id', userId);
    await supabaseAdmin.from('user_data').delete().eq('user_id', userId);

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unknown error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Delete-user backend listening on port ${PORT}`);
});
