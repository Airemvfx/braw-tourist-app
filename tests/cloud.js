// ============================================================
// The hand-written Supabase client, against a stand-in server.
//
// Worth testing properly because it is the piece with no library
// behind it: token refresh, the single-flight that stops two parallel
// requests spending the same rotating refresh token, and the guard that
// refuses a service_role key. That last one protects against the single
// most damaging mistake available in a Supabase project, and it is
// exactly the sort of safety net that rots silently if untested.
// ============================================================
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http');

const PORT = 8123;
let failures = 0;
const ok = (cond, what) => {
  console.log(`  ${cond ? '✓' : '✗'} ${what}`);
  if (!cond) failures++;
};

// ---- a stand-in for GoTrue / PostgREST / Storage -------------------
const state = {
  refreshCalls: 0,
  uploads: [],
  rows: { profiles: [{ id: 'user-1', data: {}, revision: 0, display_name: 'Ailsa' }] },
  issued: 0,
  orders: [],
};

function makeToken(role) {
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'HS256' })}.${b64({ role, sub: 'user-1' })}.sig`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let body = '';
  req.on('data', c => { body += c; });
  req.on('end', () => {
    const send = (code, obj) => {
      res.writeHead(code, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Expose-Headers': '*',
      });
      res.end(obj === undefined ? '' : JSON.stringify(obj));
    };
    if (req.method === 'OPTIONS') return send(204);

    const p = url.pathname;
    const auth = req.headers.authorization || '';

    // ---- GoTrue ----
    if (p === '/auth/v1/signup') {
      const { email } = JSON.parse(body || '{}');
      if (email === 'taken@example.test') return send(422, { error_code: 'user_already_exists', msg: 'User already registered' });
      if (email === 'confirm@example.test') return send(200, { id: 'user-2', email });   // no session
      return send(200, session());
    }
    if (p === '/auth/v1/token') {
      const grant = url.searchParams.get('grant_type');
      if (grant === 'password') {
        const { password } = JSON.parse(body || '{}');
        if (password !== 'correct-horse') return send(400, { error: 'invalid_grant', error_description: 'Invalid login credentials' });
        return send(200, session());
      }
      if (grant === 'refresh_token') {
        state.refreshCalls++;
        return send(200, session());
      }
    }
    if (p === '/auth/v1/logout') return send(204);
    if (p === '/auth/v1/recover') return send(200, {});
    if (p === '/auth/v1/user') {
      if (!auth.includes('access-')) return send(401, { msg: 'invalid token' });
      return send(200, { id: 'user-1', email: 'a@example.test', user_metadata: { display_name: 'Ailsa' } });
    }

    // ---- PostgREST ----
    if (p === '/rest/v1/products') {
      return send(200, [
        { id: 'calendar-a4', kind: 'calendar', name: { en: 'A4 wall calendar' }, blurb: {},
          price_pence: 2600, currency: 'GBP', photo_count: 12, meta: {} },
      ]);
    }
    if (p === '/rest/v1/profiles') return send(200, state.rows.profiles);
    if (p === '/rest/v1/photos') return send(201, [JSON.parse(body || '{}')].flat());
    if (p === '/rest/v1/rpc/push_profile') {
      const { p_revision, p_data } = JSON.parse(body || '{}');
      const row = state.rows.profiles[0];
      if (p_revision !== row.revision) return send(200, [{ ok: false, revision: row.revision }]);
      row.revision++; row.data = p_data;
      return send(200, [{ ok: true, revision: row.revision }]);
    }
    if (p === '/rest/v1/rpc/create_order') {
      const { p_items } = JSON.parse(body || '{}');
      const order = { id: 'o1', ref: 'BRAW-KJ4MN7', product_id: 'calendar-a4',
        kind: 'calendar', status: 'draft', total_pence: 2600, currency: 'GBP', items: p_items };
      state.orders.push(order);
      return send(200, [order]);
    }
    if (p === '/rest/v1/orders') return send(200, state.orders);

    // ---- Storage ----
    if (p.startsWith('/storage/v1/object/sign/')) {
      return send(200, { signedURL: `/object/signed${p.replace('/storage/v1/object/sign', '')}?token=x` });
    }
    if (p.startsWith('/storage/v1/object/')) {
      if (req.method === 'POST') { state.uploads.push({ path: p, bytes: Buffer.byteLength(body), auth }); return send(200, { Key: p }); }
      if (req.method === 'DELETE') return send(200, {});
    }

    send(404, { msg: 'no such route: ' + p });
  });
});

function session() {
  state.issued++;
  return {
    access_token: `access-${state.issued}`,
    refresh_token: `refresh-${state.issued}`,
    expires_in: 3600,
    user: { id: 'user-1', email: 'a@example.test', user_metadata: { display_name: 'Ailsa' } },
  };
}

(async () => {
  await new Promise(r => server.listen(PORT, r));

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const console_ = [];
  page.on('console', m => console_.push(m.text()));

  const anonKey = makeToken('anon');
  const serviceKey = makeToken('service_role');

  const boot = async key => {
    await page.addInitScript(k => {
      window.BRAW_CLOUD = { url: `http://localhost:${8123}`, anonKey: k, bucket: 'journey-photos' };
    }, key);
    await page.goto('http://localhost:8099/');
    await page.evaluate(() => localStorage.clear());
  };

  // ---------------------------------------------------------------
  console.log('\n-- a service_role key is refused, loudly --');
  // ---------------------------------------------------------------
  await boot(serviceKey);
  const refused = await page.evaluate(async () => {
    const { auth } = await import('/js/supabase.js');
    const { cloudAvailable } = await import('/js/cloud.js');
    return { ready: auth.ready(), available: cloudAvailable() };
  });
  ok(refused.ready === false, 'the client will not start with a service_role key');
  ok(refused.available === false, 'the app therefore treats the cloud as unavailable');
  ok(console_.some(m => /service_role|Refusing to start/.test(m)),
    'and it says why in the console, for whoever deployed it');

  // ---------------------------------------------------------------
  console.log('\n-- signing in --');
  // ---------------------------------------------------------------
  await ctx.clearCookies();
  const page2 = await ctx.newPage();
  await page2.addInitScript(k => {
    window.BRAW_CLOUD = { url: 'http://localhost:8123', anonKey: k, bucket: 'journey-photos' };
  }, anonKey);
  await page2.goto('http://localhost:8099/');
  await page2.evaluate(() => localStorage.clear());

  const signIn = await page2.evaluate(async () => {
    const { account, cloudSignedIn, cloudUser } = await import('/js/cloud.js');
    const out = {};
    try { await account.signIn('a@example.test', 'wrong'); out.badAccepted = true; }
    catch (e) { out.badKey = e.i18nKey; }
    await account.signIn('a@example.test', 'correct-horse');
    out.signedIn = cloudSignedIn();
    out.email = cloudUser()?.email;
    out.persisted = Boolean(localStorage.getItem('braw_cloud_session_v1'));
    return out;
  });
  ok(signIn.badKey === 'cloud.err.badLogin', 'a wrong password is reported as a wrong password');
  ok(!signIn.badAccepted, 'a wrong password does not sign anyone in');
  ok(signIn.signedIn === true, 'a correct password does');
  ok(signIn.email === 'a@example.test', 'the session carries the account');
  ok(signIn.persisted, 'the session survives a reload');

  // ---------------------------------------------------------------
  console.log('\n-- an expiring token is refreshed exactly once --');
  // ---------------------------------------------------------------
  const before = state.refreshCalls;
  // Reload first: the module caches the session in memory once it has
  // read it, so ageing the stored copy has to happen before anything
  // imports supabase.js, exactly as it would on a real page load with a
  // session that went stale while the app was closed.
  await page2.reload();
  const refresh = await page2.evaluate(async () => {
    const s = JSON.parse(localStorage.getItem('braw_cloud_session_v1'));
    s.expiresAt = Date.now() + 1000;      // inside the refresh margin
    localStorage.setItem('braw_cloud_session_v1', JSON.stringify(s));

    const { db } = await import('/js/supabase.js');
    // Six at once: without single-flight this is six refreshes, and with
    // rotating refresh tokens five of them would fail and sign the user out.
    await Promise.all(Array.from({ length: 6 }, () => db.select('profiles', 'select=*')));
    const after = JSON.parse(localStorage.getItem('braw_cloud_session_v1'));
    return { stillSignedIn: Boolean(after?.accessToken), expiresAt: after.expiresAt };
  });
  ok(state.refreshCalls - before === 1,
    `six parallel requests caused one refresh, not six (${state.refreshCalls - before})`);
  ok(refresh.stillSignedIn, 'and the user is still signed in afterwards');
  ok(refresh.expiresAt > Date.now() + 60000, 'the new expiry was stored');

  // ---------------------------------------------------------------
  console.log('\n-- profile sync and conflicts --');
  // ---------------------------------------------------------------
  const sync = await page2.evaluate(async () => {
    const { pushProfile, pullProfile, knownRevision } = await import('/js/cloud.js');
    const profile = { name: 'Ailsa', xp: 120, trips: [{ id: 't1' }], achievements: [], activity: [], stamps: {}, game: {} };
    const first = await pushProfile(profile);
    const remote = await pullProfile();
    // Pretend another device pushed in the meantime.
    localStorage.setItem('braw_cloud_rev_v1', JSON.stringify({ 'user-1': 0 }));
    const stale = await pushProfile({ ...profile, xp: 999 });
    return { first, remoteXp: remote?.data?.xp, stale, rev: knownRevision('user-1') };
  });
  ok(sync.first.ok === true && sync.first.revision === 1, 'a first push is accepted');
  ok(sync.remoteXp === 120, 'and can be read back');
  ok(sync.stale.ok === false && sync.stale.conflict === true,
    'a push from a device that missed an update is refused, not applied');
  ok(sync.rev === 1, 'the client learns the real revision from the refusal');

  // ---------------------------------------------------------------
  console.log('\n-- uploading a photograph --');
  // ---------------------------------------------------------------
  const uploads = state.uploads.length;
  const up = await page2.evaluate(async () => {
    const photos = await import('/js/photos.js');
    const { uploadPhoto } = await import('/js/cloud.js');
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 900;
    c.getContext('2d').fillRect(0, 0, 400, 400);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.8));
    const rec = await photos.addPhoto('user-1', { tripId: 't1', poiId: 'iona' },
      new File([blob], 'x.jpg', { type: 'image/jpeg' }));
    const path = await uploadPhoto(rec);
    const after = await photos.getPhoto(rec.id);
    return { path, remote: after?.remote?.path, id: rec.id };
  });
  ok(state.uploads.length === uploads + 1, 'the bytes reached the server');
  ok(up.path.startsWith('user-1/'), 'stored under the account\'s own folder');
  ok(up.remote === up.path, 'and the local record remembers it is uploaded');
  ok(state.uploads[state.uploads.length - 1].bytes > 1000, 'a real image was sent, not an empty body');

  // ---------------------------------------------------------------
  console.log('\n-- the shop reads prices from the server --');
  // ---------------------------------------------------------------
  const shop = await page2.evaluate(async () => {
    const { products, placeOrder } = await import('/js/cloud.js');
    const { mergeRemote } = await import('/js/shop.js');
    const rows = await products();
    const merged = mergeRemote(rows);
    const cal = merged.find(p => p.id === 'calendar-a4');
    const order = await placeOrder('calendar-a4', [{ photo_id: 'p1', month: 1 }]);
    return { price: cal.pricePence, count: merged.length, ref: order.ref, total: order.total_pence };
  });
  ok(shop.price === 2600, `the server's price won over the built-in one (${shop.price})`);
  ok(shop.count >= 4, 'products the server did not mention are still listed');
  ok(/^BRAW-[346789CDFHJKMNPR]{6}$/.test(shop.ref), 'the order reference came back in the expected form');
  ok(shop.total === 2600, 'the total came from the server, not the browser');

  // ---------------------------------------------------------------
  console.log('\n-- with nothing configured, the app is untouched --');
  // ---------------------------------------------------------------
  const page3 = await ctx.newPage();
  await page3.goto('http://localhost:8099/');
  const off = await page3.evaluate(async () => {
    const c = await import('/js/cloud.js');
    let threw = null;
    try { await c.pullProfile(); } catch (e) { threw = e.i18nKey; }
    return { available: c.cloudAvailable(), signedIn: c.cloudSignedIn(), threw, store: c.storeConfigured() };
  });
  ok(off.available === false, 'no project configured means no cloud');
  ok(off.signedIn === false, 'and nobody is signed in');
  ok(off.threw === 'cloud.err.offConfig', 'calls fail with a clear reason rather than hanging');
  ok(off.store === false, 'and the shop knows checkout is not connected');

  await browser.close();
  server.close();
  console.log(failures ? `\n${failures} failed` : '\ncloud: all good');
  process.exit(failures ? 1 : 0);
})();
