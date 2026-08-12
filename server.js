import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 54321;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

app.use(cors({ origin: true, methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowedHeaders: ['Authorization', 'Content-Type'] }));
app.use(express.json({ limit: '1mb' }));

function getBearerToken(req) {
  const header = req.headers.authorization;
  return header && /^Bearer\s+/i.test(header) ? header.replace(/^Bearer\s+/i, '').trim() : null;
}

async function deleteUser(req, res) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header.' });

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      return res.status(401).json({ error: authError?.message || 'Invalid or expired access token.' });
    }

    const userId = authData.user.id;
    if (req.body?.userId && req.body.userId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own account.' });
    }

    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    if (profileError && profileError.code !== '42P01') {
      return res.status(500).json({ error: `Failed to delete profile: ${profileError.message}` });
    }

    const { error: dataError } = await supabaseAdmin.from('user_data').delete().eq('user_id', userId);
    if (dataError && dataError.code !== '42P01') {
      return res.status(500).json({ error: `Failed to delete user data: ${dataError.message}` });
    }

    const { data: avatarFiles, error: listError } = await supabaseAdmin.storage
      .from('profile-uploads')
      .list(userId, { limit: 100 });

    if (!listError && avatarFiles?.length) {
      const paths = avatarFiles.filter(file => file?.name).map(file => `${userId}/${file.name}`);
      if (paths.length) {
        const { error: removeError } = await supabaseAdmin.storage.from('profile-uploads').remove(paths);
        if (removeError) console.warn('Avatar cleanup warning:', removeError.message);
      }
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) return res.status(500).json({ error: `Failed to delete auth user: ${deleteError.message}` });

    return res.status(200).json({ ok: true, deletedUserId: userId });
  } catch (error) {
    console.error('Delete-user endpoint error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error.' });
  }
}

app.delete('/api/delete-user', deleteUser);
app.post('/api/delete-user', deleteUser);
app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }));

app.listen(PORT, () => console.log(`CoinFlow backend listening on port ${PORT}`));
