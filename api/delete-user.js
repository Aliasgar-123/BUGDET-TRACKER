import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getBearerToken(req) {
  const header = req.headers.authorization;
  return header && /^Bearer\s+/i.test(header) ? header.replace(/^Bearer\s+/i, '').trim() : null;
}

function jsonError(res, statusCode, message) {
  return res.status(statusCode).json({ error: message });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonError(res, 500, 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY configuration.');
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const token = getBearerToken(req);
  if (!token) {
    return jsonError(res, 401, 'Missing or invalid Authorization header.');
  }

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData?.user) {
      return jsonError(res, 401, authError?.message || 'Invalid or expired access token.');
    }

    const userId = authData.user.id;
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (body?.userId && body.userId !== userId) {
      return jsonError(res, 403, 'You can only delete your own account.');
    }

    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    if (profileError && profileError.code !== '42P01') {
      return jsonError(res, 500, `Failed to delete profile: ${profileError.message}`);
    }

    const { error: dataError } = await supabaseAdmin.from('user_data').delete().eq('user_id', userId);
    if (dataError && dataError.code !== '42P01') {
      return jsonError(res, 500, `Failed to delete user data: ${dataError.message}`);
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      return jsonError(res, 500, `Failed to delete auth user: ${deleteError.message}`);
    }

    return res.status(200).json({ ok: true, deletedUserId: userId });
  } catch (error) {
    console.error('Delete-user endpoint error:', error);
    return jsonError(res, 500, error?.message || 'Internal server error.');
  }
}
