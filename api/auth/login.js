export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.json({ error: 'Method not allowed' });
    return;
  }

  let body = {};
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = {};
  }

  const { username, password } = body;
  if (!username || !password) {
    res.statusCode = 400;
    res.json({ error: 'Username and password are required' });
    return;
  }

  res.statusCode = 200;
  res.json({
    message: 'Login successful',
    token: 'demo-token',
    user: { id: 1, username, role: 'Super Admin', name: 'Demo Admin' }
  });
}
