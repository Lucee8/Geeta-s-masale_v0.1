export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  const path = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);

  if (req.method === 'GET' && path[0] === 'auth' && path[1] === 'profile') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      res.statusCode = 401;
      res.json({ error: 'Unauthorized' });
      return;
    }

    res.statusCode = 200;
    res.json({
      user: {
        id: 1,
        username: 'admin',
        role: 'Super Admin',
        name: 'Demo Admin'
      }
    });
    return;
  }

  res.statusCode = 404;
  res.json({ error: 'Route not found' });
}
