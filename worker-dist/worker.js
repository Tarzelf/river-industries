const PAGES = 'https://river-industries.pages.dev';

function cors(headers = {}) {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    ...headers,
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: cors({ 'content-type': 'application/json; charset=utf-8' }),
  });
}

function validEmail(e) {
  return typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
}

async function handleWaitlist(request, env) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }
  if (!env.WAITLIST) {
    return json({ error: 'Waitlist unavailable' }, 503);
  }
  let email = '';
  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) {
      const body = await request.json();
      email = (body.email || '').trim().toLowerCase();
    } else if (ct.includes('form')) {
      const fd = await request.formData();
      email = String(fd.get('email') || '').trim().toLowerCase();
    } else {
      const body = await request.json().catch(() => ({}));
      email = (body.email || '').trim().toLowerCase();
    }
  } catch {
    return json({ error: 'Invalid body' }, 400);
  }
  if (!validEmail(email)) {
    return json({ error: 'Enter a valid email.' }, 400);
  }
  const key = `email:${email}`;
  const existing = await env.WAITLIST.get(key);
  if (!existing) {
    const record = {
      email,
      ts: new Date().toISOString(),
      ua: (request.headers.get('user-agent') || '').slice(0, 200),
    };
    await env.WAITLIST.put(key, JSON.stringify(record));
    const raw = (await env.WAITLIST.get('index')) || '[]';
    let list = [];
    try { list = JSON.parse(raw); } catch { list = []; }
    if (!list.includes(email)) {
      list.push(email);
      if (list.length > 5000) list = list.slice(-5000);
      await env.WAITLIST.put('index', JSON.stringify(list));
    }
  }
  return json({ message: 'Thanks — we will be in touch.' });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/waitlist' || url.pathname === '/api/waitlist/') {
      return handleWaitlist(request, env);
    }

    // Proxy static site from Pages
    const target = new URL(url.pathname + url.search, PAGES);
    const init = {
      method: request.method,
      headers: request.headers,
      redirect: 'manual',
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = request.body;
    }
    const res = await fetch(target.toString(), init);
    const headers = new Headers(res.headers);
    if (headers.has('location')) {
      try {
        const loc = new URL(headers.get('location'), PAGES);
        if (loc.hostname === 'river-industries.pages.dev') {
          loc.hostname = url.hostname;
          headers.set('location', loc.toString());
        }
      } catch {}
    }
    // Long cache for media
    if (/\.(mp4|jpg|jpeg|png|ico|webp|avif)$/i.test(url.pathname)) {
      headers.set('cache-control', 'public, max-age=86400, stale-while-revalidate=604800');
    }
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  },
};
