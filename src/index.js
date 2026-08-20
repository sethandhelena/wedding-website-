const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const SESSION_COOKIE = 'wedding_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith('/api/')) {
        return await handleApi(request, env, url);
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(error);
      if (url.pathname.startsWith('/api/')) {
        return json({ ok: false, error: 'Unexpected server error.' }, 500);
      }
      return new Response('Server error', { status: 500 });
    }
  }
};

async function handleApi(request, env, url) {
  const { pathname } = url;
  await ensureDb(env);

  if (pathname === '/api/health' && request.method === 'GET') {
    return json({ ok: true, service: 'wedding-website' });
  }

  if (pathname === '/api/rsvp' && request.method === 'POST') {
    return createRsvp(request, env);
  }

  if (pathname === '/api/registry' && request.method === 'GET') {
    return getRegistry(env, url);
  }

  if (pathname === '/api/journal' && request.method === 'GET') {
    return getJournal(env, url);
  }

  if (pathname === '/api/admin/login' && request.method === 'POST') {
    return adminLogin(request, env);
  }

  if (pathname === '/api/admin/logout' && request.method === 'POST') {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        ...JSON_HEADERS,
        'set-cookie': `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`
      }
    });
  }

  if (pathname === '/api/admin/session' && request.method === 'GET') {
    return json({ ok: true, authenticated: await isAdmin(request, env) });
  }

  if (pathname.startsWith('/api/admin/')) {
    if (!(await isAdmin(request, env))) {
      return json({ ok: false, error: 'Unauthorized' }, 401);
    }
    return handleAdminApi(request, env, url);
  }

  return json({ ok: false, error: 'Not found' }, 404);
}


let dbReadyPromise;
async function ensureDb(env) {
  if (!env.DB) throw new Error('D1 database binding DB is unavailable.');
  if (!dbReadyPromise) dbReadyPromise = initializeDb(env.DB);
  return dbReadyPromise;
}

async function initializeDb(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS rsvps (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT NOT NULL,attendance TEXT NOT NULL,guests INTEGER NOT NULL DEFAULT 1,meal TEXT,dietary TEXT,message TEXT,created_at TEXT NOT NULL DEFAULT (datetime('now')))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS registry_items (id INTEGER PRIMARY KEY AUTOINCREMENT,store TEXT NOT NULL,title TEXT NOT NULL,price TEXT,description TEXT,status TEXT NOT NULL DEFAULT 'available',featured INTEGER NOT NULL DEFAULT 0,image_class TEXT,image_url TEXT,gift_url TEXT,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT (datetime('now')),updated_at TEXT NOT NULL DEFAULT (datetime('now')))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS journal_posts (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,category TEXT,post_date TEXT,excerpt TEXT,content TEXT,image_class TEXT,image_url TEXT,published INTEGER NOT NULL DEFAULT 1,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT (datetime('now')),updated_at TEXT NOT NULL DEFAULT (datetime('now')))`)
  ]);
  const registryCount = await db.prepare('SELECT COUNT(*) count FROM registry_items').first();
  if (!Number(registryCount?.count || 0)) {
    const items = [
      ['crate','Stoneware Dinnerware Set','$129.95','A timeless place setting for dinners at home and celebrations for years to come.','available',1,'gift-image-one','#',10],
      ['target','Artisan Stand Mixer','$449.99','For weekend baking, family recipes, and plenty of homemade treats together.','available',0,'gift-image-two','#',20],
      ['target','Luxury Bath Towel Set','$54.00','Soft everyday essentials in a dusty blue tone that fits our home perfectly.','available',0,'gift-image-three','#',30],
      ['honeymoon','Honeymoon Adventure Fund','Any Amount','Help us make memories on our first adventure together as newlyweds.','available',1,'gift-image-four','#',40],
      ['crate','Gold Flatware Set','$89.95','A warm gold accent for hosting friends, family, and holiday dinners.','purchased',0,'gift-image-five','#',50],
      ['target','Linen Bedding Set','$119.00','Relaxed, neutral bedding for creating a cozy home together.','available',0,'gift-image-six','#',60],
      ['crate','Glassware Set','$79.95','Classic glassware for everyday dinners, celebrations, and hosting friends.','available',0,'gift-image-seven','#',70],
      ['target','Cookware Set','$149.99','A versatile cookware collection for weeknight meals and weekend hosting.','available',0,'gift-image-eight','#',80],
      ['crate','Serving Platter','$64.95','A simple serving piece we can use for holidays, dinners, and gatherings.','available',1,'gift-image-nine','#',90],
      ['target','Cozy Throw Blanket','$39.99','A soft neutral throw for movie nights, reading, and relaxing at home.','available',0,'gift-image-ten','#',100],
      ['honeymoon','Romantic Dinner','$150.00','Help us enjoy a special dinner together during our honeymoon.','available',0,'gift-image-eleven','#',110],
      ['honeymoon','Excursion Fund','$200.00','Contribute toward an unforgettable activity during our first trip as newlyweds.','available',0,'gift-image-twelve','#',120]
    ];
    await db.batch(items.map(i => db.prepare(`INSERT INTO registry_items (store,title,price,description,status,featured,image_class,gift_url,sort_order) VALUES (?,?,?,?,?,?,?,?,?)`).bind(...i)));
  }
  const journalCount = await db.prepare('SELECT COUNT(*) count FROM journal_posts').first();
  if (!Number(journalCount?.count || 0)) {
    const posts = [
      ['A Weekend in Alexandria','Travel','June 2, 2027','Our favorite coffee shops, lake walks, restaurants, and local places to visit while you’re in town.','journal-one',10],
      ['Why We Chose Our Venue','Planning','May 16, 2027','We knew we wanted somewhere peaceful, welcoming, and close to the water. Here’s what made Stonewall Farms feel right.','journal-two',20],
      ['The Colors Behind Our Day','Inspiration','April 18, 2027','Dusty blue, sage green, soft ivory, and warm gold inspired the relaxed garden atmosphere we’re creating.','journal-three',30],
      ['A Few Menu Favorites','Food','March 4, 2027','A little preview of the dinner, desserts, and late-night snacks we’re most excited to share.','journal-four',40],
      ['Building Our Wedding Playlist','Music','January 20, 2027','The songs that remind us of road trips, family parties, first dates, and the dance floor.','journal-five',50],
      ['The Proposal Story','Engagement','December 15, 2026','The sunset, the question, and the moment we officially started planning forever.','journal-six',60],
      ['Choosing Our Wedding Flowers','Planning','November 12, 2026','How soft blues, greenery, and warm gold details shaped the floral direction for our day.','journal-seven',70],
      ['Our Invitation Inspiration','Details','October 4, 2026','A closer look at the colors, typography, and delicate details that inspired our wedding stationery.','journal-eight',80],
      ['Places to Visit Near Willmar','Travel','September 18, 2026','A few local stops, restaurants, and places to explore if you’re making a weekend of the wedding.','journal-nine',90]
    ];
    await db.batch(posts.map(i => db.prepare(`INSERT INTO journal_posts (title,category,post_date,excerpt,content,image_class,published,sort_order) VALUES (?,?,?,?,?,?,1,?)`).bind(i[0],i[1],i[2],i[3],i[3],i[4],i[5])));
  }
}

async function createRsvp(request, env) {
  const body = await readJson(request);
  if (!body) return json({ ok: false, error: 'Invalid request.' }, 400);

  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const attendance = clean(body.attendance, 80);
  const guests = Number.parseInt(body.guests, 10);
  const meal = clean(body.meal, 80);
  const dietary = clean(body.dietary, 500);
  const message = clean(body.message, 1000);

  if (!name || !isValidEmail(email) || !['Joyfully accepts', 'Regretfully declines'].includes(attendance)) {
    return json({ ok: false, error: 'Please complete your name, email, and attendance selection.' }, 422);
  }

  const guestCount = Number.isFinite(guests) ? Math.min(Math.max(guests, 1), 12) : 1;

  await env.DB.prepare(`
    INSERT INTO rsvps (name, email, attendance, guests, meal, dietary, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(name, email, attendance, guestCount, meal, dietary, message).run();

  return json({ ok: true, message: 'Thank you! Your RSVP has been received.' }, 201);
}

async function getRegistry(env, url) {
  const store = clean(url.searchParams.get('store'), 30);
  const availableOnly = url.searchParams.get('available') === '1';

  let sql = `SELECT id, store, title, price, description, status, featured, image_class, image_url, gift_url, sort_order
             FROM registry_items WHERE 1=1`;
  const binds = [];
  if (store && store !== 'all') {
    sql += ' AND store = ?';
    binds.push(store);
  }
  if (availableOnly) sql += " AND status = 'available'";
  sql += ' ORDER BY sort_order ASC, id ASC';

  const stmt = env.DB.prepare(sql);
  const result = binds.length ? await stmt.bind(...binds).all() : await stmt.all();
  return json({ ok: true, items: result.results || [] });
}

async function getJournal(env, url) {
  const id = Number.parseInt(url.searchParams.get('id') || '', 10);
  if (Number.isFinite(id) && id > 0) {
    const post = await env.DB.prepare(`
      SELECT id, title, category, post_date, excerpt, content, image_class, image_url, sort_order
      FROM journal_posts
      WHERE published = 1 AND id = ?
      LIMIT 1
    `).bind(id).first();
    if (!post) return json({ ok: false, error: 'Journal post not found.' }, 404);
    return json({ ok: true, post });
  }

  const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get('limit') || '50', 10), 1), 100);
  const result = await env.DB.prepare(`
    SELECT id, title, category, post_date, excerpt, content, image_class, image_url, sort_order
    FROM journal_posts
    WHERE published = 1
    ORDER BY sort_order ASC, id ASC
    LIMIT ?
  `).bind(limit).all();
  return json({ ok: true, posts: result.results || [] });
}

async function adminLogin(request, env) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ ok: false, error: 'Admin secrets are not configured.' }, 503);
  }

  const body = await readJson(request);
  const password = body ? String(body.password || '') : '';
  if (!timingSafeStringEqual(password, env.ADMIN_PASSWORD)) {
    return json({ ok: false, error: 'Invalid password.' }, 401);
  }

  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin.${expires}`;
  const signature = await sign(payload, env.SESSION_SECRET);
  const token = `${payload}.${signature}`;

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      ...JSON_HEADERS,
      'set-cookie': `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`
    }
  });
}

async function isAdmin(request, env) {
  if (!env.SESSION_SECRET) return false;
  const cookies = parseCookies(request.headers.get('cookie') || '');
  const token = cookies[SESSION_COOKIE];
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'admin') return false;

  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;

  const payload = `${parts[0]}.${parts[1]}`;
  const expected = await sign(payload, env.SESSION_SECRET);
  return timingSafeStringEqual(parts[2], expected);
}

async function handleAdminApi(request, env, url) {
  const path = url.pathname;

  if (path === '/api/admin/stats' && request.method === 'GET') {
    const [rsvps, attending, registry, posts] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) count FROM rsvps').first(),
      env.DB.prepare("SELECT COALESCE(SUM(guests),0) count FROM rsvps WHERE attendance = 'Joyfully accepts'").first(),
      env.DB.prepare('SELECT COUNT(*) count FROM registry_items').first(),
      env.DB.prepare('SELECT COUNT(*) count FROM journal_posts').first()
    ]);
    return json({
      ok: true,
      stats: {
        rsvps: Number(rsvps?.count || 0),
        attendingGuests: Number(attending?.count || 0),
        registryItems: Number(registry?.count || 0),
        journalPosts: Number(posts?.count || 0)
      }
    });
  }

  if (path === '/api/admin/rsvps' && request.method === 'GET') {
    const result = await env.DB.prepare(`SELECT * FROM rsvps ORDER BY datetime(created_at) DESC, id DESC`).all();
    return json({ ok: true, items: result.results || [] });
  }

  const rsvpMatch = path.match(/^\/api\/admin\/rsvps\/(\d+)$/);
  if (rsvpMatch && request.method === 'DELETE') {
    const id = Number(rsvpMatch[1]);
    const result = await env.DB.prepare('DELETE FROM rsvps WHERE id=?').bind(id).run();
    if (!result.meta?.changes) {
      return json({ ok: false, error: 'RSVP not found.' }, 404);
    }
    return json({ ok: true });
  }

  if (path === '/api/admin/rsvps.csv' && request.method === 'GET') {
    const result = await env.DB.prepare(`SELECT * FROM rsvps ORDER BY datetime(created_at) DESC, id DESC`).all();
    const rows = result.results || [];
    const columns = ['id','name','email','attendance','guests','meal','dietary','message','created_at'];
    const csv = [columns.join(','), ...rows.map(row => columns.map(c => csvCell(row[c])).join(','))].join('\n');
    return new Response(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="wedding-rsvps.csv"'
      }
    });
  }

  if (path === '/api/admin/registry/import' && request.method === 'POST') {
    return importRegistryItem(request);
  }

  if (path === '/api/admin/registry') {
    if (request.method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM registry_items ORDER BY sort_order ASC, id ASC').all();
      return json({ ok: true, items: result.results || [] });
    }
    if (request.method === 'POST') {
      const item = normalizeRegistry(await readJson(request));
      if (!item.title || !item.store) return json({ ok: false, error: 'Store and title are required.' }, 422);
      const result = await env.DB.prepare(`
        INSERT INTO registry_items (store,title,price,description,status,featured,image_class,image_url,gift_url,sort_order,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now'))
      `).bind(item.store,item.title,item.price,item.description,item.status,item.featured,item.image_class,item.image_url,item.gift_url,item.sort_order).run();
      return json({ ok: true, id: result.meta?.last_row_id }, 201);
    }
  }

  const registryMatch = path.match(/^\/api\/admin\/registry\/(\d+)$/);
  if (registryMatch) {
    const id = Number(registryMatch[1]);
    if (request.method === 'PUT') {
      const item = normalizeRegistry(await readJson(request));
      await env.DB.prepare(`
        UPDATE registry_items SET store=?,title=?,price=?,description=?,status=?,featured=?,image_class=?,image_url=?,gift_url=?,sort_order=?,updated_at=datetime('now')
        WHERE id=?
      `).bind(item.store,item.title,item.price,item.description,item.status,item.featured,item.image_class,item.image_url,item.gift_url,item.sort_order,id).run();
      return json({ ok: true });
    }
    if (request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM registry_items WHERE id=?').bind(id).run();
      return json({ ok: true });
    }
  }

  if (path === '/api/admin/journal') {
    if (request.method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM journal_posts ORDER BY sort_order ASC, id ASC').all();
      return json({ ok: true, items: result.results || [] });
    }
    if (request.method === 'POST') {
      const post = normalizeJournal(await readJson(request));
      if (!post.title) return json({ ok: false, error: 'Title is required.' }, 422);
      const result = await env.DB.prepare(`
        INSERT INTO journal_posts (title,category,post_date,excerpt,content,image_class,image_url,published,sort_order,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,datetime('now'))
      `).bind(post.title,post.category,post.post_date,post.excerpt,post.content,post.image_class,post.image_url,post.published,post.sort_order).run();
      return json({ ok: true, id: result.meta?.last_row_id }, 201);
    }
  }

  const journalMatch = path.match(/^\/api\/admin\/journal\/(\d+)$/);
  if (journalMatch) {
    const id = Number(journalMatch[1]);
    if (request.method === 'PUT') {
      const post = normalizeJournal(await readJson(request));
      await env.DB.prepare(`
        UPDATE journal_posts SET title=?,category=?,post_date=?,excerpt=?,content=?,image_class=?,image_url=?,published=?,sort_order=?,updated_at=datetime('now')
        WHERE id=?
      `).bind(post.title,post.category,post.post_date,post.excerpt,post.content,post.image_class,post.image_url,post.published,post.sort_order,id).run();
      return json({ ok: true });
    }
    if (request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM journal_posts WHERE id=?').bind(id).run();
      return json({ ok: true });
    }
  }

  return json({ ok: false, error: 'Not found' }, 404);
}


async function importRegistryItem(request) {
  const body = await readJson(request);
  const rawUrl = clean(body?.url, 1500);
  if (!rawUrl) return json({ ok: false, error: 'Paste a retailer URL first.' }, 422);

  let url;
  try { url = new URL(rawUrl); }
  catch { return json({ ok: false, error: 'Enter a valid retailer URL.' }, 422); }

  if (url.protocol !== 'https:') return json({ ok: false, error: 'Registry URLs must use HTTPS.' }, 422);

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const allowed = [
    ['target.com', 'target'],
    ['crateandbarrel.com', 'crate'],
    ['honeyfund.com', 'honeymoon']
  ];
  const match = allowed.find(([domain]) => host === domain || host.endsWith('.' + domain));
  if (!match) {
    return json({ ok: false, error: 'Automatic import currently supports Target, Crate & Barrel, and Honeyfund URLs.' }, 422);
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; SethHelenaWeddingRegistry/1.0)',
        'accept': 'text/html,application/xhtml+xml'
      }
    });
  } catch {
    return json({ ok: false, error: 'The retailer page could not be reached. You can still enter the item manually.' }, 502);
  }

  if (!response.ok) {
    return json({ ok: false, error: `The retailer returned ${response.status}. You can still enter the item manually.` }, 502);
  }

  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return json({ ok: false, error: 'The retailer page did not return product HTML.' }, 422);

  const html = (await response.text()).slice(0, 2500000);
  const meta = extractRetailMetadata(html);

  return json({
    ok: true,
    item: {
      store: match[1],
      title: clean(meta.title, 160),
      description: clean(meta.description, 1000),
      price: clean(meta.price, 60),
      image_url: clean(meta.image, 1000),
      gift_url: url.toString()
    },
    warning: (!meta.title || (!meta.description && !meta.image))
      ? 'Some retailer details could not be read automatically. Review and complete the fields before saving.'
      : ''
  });
}

function extractRetailMetadata(html) {
  const getMeta = (...keys) => {
    for (const key of keys) {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i')
      ];
      for (const pattern of patterns) {
        const m = html.match(pattern);
        if (m?.[1]) return decodeHtml(m[1]);
      }
    }
    return '';
  };

  let title = getMeta('og:title', 'twitter:title');
  let description = getMeta('og:description', 'description', 'twitter:description');
  let image = getMeta('og:image', 'twitter:image');
  let price = getMeta('product:price:amount', 'og:price:amount', 'product:price', 'price');

  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const script of scripts) {
    try {
      const data = JSON.parse(script[1].trim());
      const nodes = flattenJsonLd(data);
      for (const node of nodes) {
        const types = Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']];
        const isProduct = types.some(t => String(t || '').toLowerCase() === 'product');
        if (!isProduct) continue;

        title ||= String(node.name || '');
        description ||= String(node.description || '');

        if (!image) {
          if (Array.isArray(node.image)) image = String(node.image[0] || '');
          else if (typeof node.image === 'string') image = node.image;
          else if (node.image?.url) image = String(node.image.url);
        }

        const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
        if (!price && offers) {
          const amount = offers.price ?? offers.lowPrice ?? offers.highPrice;
          if (amount !== undefined && amount !== null && String(amount) !== '') {
            const currency = String(offers.priceCurrency || '').toUpperCase();
            price = formatImportedPrice(amount, currency);
          }
        }
      }
    } catch {}
  }

  if (!title) {
    const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (m?.[1]) title = decodeHtml(m[1]).replace(/\s+/g, ' ').trim();
  }

  if (price && /^\d+(?:\.\d+)?$/.test(String(price).trim())) {
    price = '$' + Number(price).toFixed(2);
  }

  return { title, description, image, price };
}

function flattenJsonLd(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (typeof value !== 'object') return [];
  const out = [value];
  if (value['@graph']) out.push(...flattenJsonLd(value['@graph']));
  if (value.mainEntity) out.push(...flattenJsonLd(value.mainEntity));
  return out;
}

function formatImportedPrice(amount, currency) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return String(amount || '');
  if (!currency || currency === 'USD') return '$' + num.toFixed(2);
  return `${currency} ${num.toFixed(2)}`;
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .trim();
}

function normalizeRegistry(body = {}) {
  return {
    store: clean(body.store, 30),
    title: clean(body.title, 160),
    price: clean(body.price, 60),
    description: clean(body.description, 1000),
    status: ['available','purchased'].includes(body.status) ? body.status : 'available',
    featured: body.featured ? 1 : 0,
    image_class: clean(body.image_class, 80),
    image_url: clean(body.image_url, 1000),
    gift_url: clean(body.gift_url, 1000),
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0
  };
}

function normalizeJournal(body = {}) {
  return {
    title: clean(body.title, 180),
    category: clean(body.category, 80),
    post_date: clean(body.post_date, 80),
    excerpt: clean(body.excerpt, 1200),
    content: clean(body.content, 10000),
    image_class: clean(body.image_class, 80),
    image_url: clean(body.image_url, 1000),
    published: body.published === false || body.published === 0 ? 0 : 1,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0
  };
}

async function readJson(request) {
  const type = request.headers.get('content-type') || '';
  if (!type.includes('application/json')) return null;
  try { return await request.json(); } catch { return null; }
}

function clean(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function parseCookies(header) {
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

async function sign(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return base64Url(new Uint8Array(sig));
}

function base64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function timingSafeStringEqual(a, b) {
  const aa = new TextEncoder().encode(String(a));
  const bb = new TextEncoder().encode(String(b));
  if (aa.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
  return diff === 0;
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}
