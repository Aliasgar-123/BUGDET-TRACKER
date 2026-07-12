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
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Missing access token.' });
  }

  try {
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData?.user) {
      return res.status(401).json({ error: authError?.message || 'Invalid user token.' });
    }

    const userId = userData.user.id;
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
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
