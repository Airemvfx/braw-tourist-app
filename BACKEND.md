# The backend

BRAW works with no backend at all. Accounts, journeys and photographs
live in the browser, and that is the default this repository ships in —
open `index.html` and everything works, offline, with nothing to set up.

Configuring a backend adds three things and changes nothing else:

* **Real accounts.** Sign in on a second device and your journeys are
  there.
* **Optional photo upload.** Only when the user asks, and only so the
  print shop can be given something to print.
* **Orders.** A calendar, prints, a magnet — priced and recorded
  server-side.

Supabase is the starting point because it gives Postgres, auth, storage
and row-level security without operating any of it. It is not a
commitment; see [Moving off Supabase](#moving-off-supabase).

---

## Setting it up

### 1. Create the project

Make a project at [supabase.com](https://supabase.com). Any region;
`eu-west` keeps European users' data in Europe, which is one fewer thing
to explain in the privacy policy.

### 2. Apply the schema

Open the SQL editor and run **[`supabase/schema.sql`](supabase/schema.sql)**
whole. It is re-runnable — applying it twice is harmless — and it
creates:

| object | what it is for |
| --- | --- |
| `profiles` | one row per account, holding the same profile document the browser keeps |
| `photos` | metadata for uploaded photographs; the bytes live in Storage |
| `products` | the price list, and the **only** place a price may come from |
| `orders` | created solely by `create_order()`; clients cannot insert one |
| `journey-photos` | a private Storage bucket, partitioned by user id |

Row-level security is on for every table, and every table denies by
default.

### 3. Point the app at it

Edit [`js/cloud-config.js`](js/cloud-config.js):

```js
const BUILT_IN = {
  url: 'https://YOUR-PROJECT.supabase.co',
  anonKey: 'eyJhbGciOi...',      // the anon key — see the warning below
  bucket: 'journey-photos',
  storeUrl: '',                  // the shop, once there is one
  syncProfile: true,
};
```

> ### Use the anon key, never the service_role key
>
> The two sit next to each other on the same settings page and look
> identical. The **anon** key is meant to be public and is safe in a file
> anyone can read — it grants nothing on its own, because row-level
> security decides everything.
>
> The **service_role** key bypasses row-level security completely. In a
> browser it hands every visitor every other user's data, and once it is
> committed it is in git history for good.
>
> `js/supabase.js` decodes the key it is given and refuses to start if it
> sees a `service_role` token, with an explanation in the console. That
> guard is tested (`tests/cloud.js`), but do not rely on it — check.

Deployments that would rather not commit the project URL can set
`window.BRAW_CLOUD` from an inline `<script>` in `index.html` before the
modules load; it overrides the built-in values.

### 4. Auth settings

In **Authentication → Providers**, keep email enabled. Decide about
confirmations:

* **Confirmations on** (recommended for a real launch) — addresses are
  verified, so password resets and order emails actually reach someone.
  The app handles the "check your email" state.
* **Confirmations off** — a smoother first run, and fine while testing.

Set **Site URL** to wherever the app is hosted, or password-reset links
will point at localhost.

### 5. Prices

`schema.sql` seeds four products at placeholder prices. Set real ones in
the dashboard before taking any money. Nothing needs redeploying — the
client displays whatever the server returns, and `create_order()` charges
from the same table.

---

## Checking it

```
./supabase/check.sh      # the schema's security properties, against a scratch Postgres
./tests/run.sh cloud     # the client, against a stand-in server
```

`check.sh` builds a throwaway Postgres, stubs the parts of Supabase the
schema leans on, applies the real `schema.sql`, and then attacks it as
two ordinary users: reading each other's rows, inserting orders by hand,
discounting a total, marking an order paid, pushing over a newer profile.
Every one of those must fail. It never touches your project.

Run it after any change to `schema.sql`. Access control is easy to loosen
by accident and the loosening is silent.

---

## How it fits together

```
  browser                          Supabase
  ───────                          ────────
  app.js
    │
    ├── store.js ──── localStorage      the working copy: journeys, XP, badges
    ├── photos.js ─── IndexedDB         the photographs themselves
    │
    └── cloud.js                        the only thing that talks to a server
          └── supabase.js
                ├── /auth/v1     ────►  accounts and tokens
                ├── /rest/v1     ────►  profiles, photos, products, orders
                └── /storage/v1  ────►  journey-photos
```

Two rules hold this together, and both matter more than they look:

**The local copy is the truth.** Every view renders from localStorage and
IndexedDB. Nothing waits on the network. Turn the backend off, or walk
into a glen with no signal, and the app is unchanged — which is the point
of a mapping app for the Highlands.

**The cloud is a copy.** `cloud.js` is the whole seam. Nothing else in the
app knows Supabase exists.

### Profile sync

The profile is pushed as one JSON document, debounced eight seconds after
a save and flushed when the tab is hidden.

Conflicts are detected, not merged. `profiles.revision` is a counter; a
push carrying a stale one is refused by `push_profile()` and the user is
asked which version to keep. Merging two divergent XP histories would
produce a profile neither device ever had — badges awarded for journeys
that are not there — so the app asks instead.

### Photographs

Photographs stay on the device. Upload is always something the user asked
for: a button on a photograph, a button in the storage panel, or the
moment they order a print, because the shop cannot print what it has not
been given.

Each is stored twice — a 480px thumbnail for the interface and a 3000px
copy for print. See the comment at the top of `js/photos.js` for why 3000
and not less; briefly, an A4 page is 11.7 inches across, so 1024px is
87 dpi and visibly soft, and nobody would have discovered that until the
first calendar came back from the printer.

### Orders

`create_order()` is the only way an order exists. It prices the basket
from `products`, checks the photograph count against the product, and
checks the caller actually owns every photograph referenced. Clients have
no insert privilege on `orders` and can write exactly one column
afterwards: `status`, to submit or cancel.

The app then hands the reference to whatever shop is configured in
`storeUrl`. Nothing else travels with it — no email, no name, no
photographs. The shop can ask for a delivery address itself.

Until `storeUrl` is set, the Store shows its catalogue, builds an order
and says plainly that checkout is not connected. It never claims to have
sold anything.

---

## What this costs

Supabase's free tier covers a small launch: 500MB of Postgres, 1GB of
file storage, 50,000 monthly active users. The binding constraint here is
storage, and it is worth doing the arithmetic before it surprises you.

A print-resolution photograph is roughly **1MB**. Storage is only used by
photographs a user chose to upload, so:

| uploaded photographs | storage |
| --- | --- |
| 1,000 | ~1GB — the free tier, spent |
| 10,000 | ~10GB — about $2/month on the paid plan |
| 100,000 | ~100GB — about $21/month |

Which is a good problem: those are photographs attached to orders. At
$25/GB/month, storage costs a fraction of one calendar.

Egress is the one to watch. Signed URLs and a print shop pulling
full-resolution files can move more data than the uploads did, and 250GB
of egress is included before it is billed at $0.09/GB.

---

## Moving off Supabase

The seam is `js/cloud.js`. It is the only file that imports
`js/supabase.js`, and the rest of the app imports only `cloud.js`.

What a replacement has to provide:

* `POST /auth` — sign up, sign in, refresh, sign out, password reset
* `GET/PATCH` a profile document with an optimistic-concurrency counter
* a private object store with per-user paths and time-limited read URLs
* one endpoint that prices and records an order server-side

`schema.sql` is ordinary Postgres apart from three Supabase-specific
pieces, all of them small and all of them noted in the file:

* `auth.users` and `auth.uid()` — whatever replaces them needs an
  equivalent, since every policy keys off `auth.uid()`
* `storage.buckets` / `storage.objects` — the bucket and its four
  policies
* the `anon` / `authenticated` roles

The `profiles.data` column deliberately holds the whole profile as JSONB
rather than normalised tables. That is a trade made for a client with no
build step and no ORM, where every extra table is another join to
hand-write in `fetch()`. It carries everything needed to normalise later.

---

## Still to do before launch

- [ ] Real prices in `products`.
- [ ] A shop at `storeUrl` that can take a reference and a payment.
- [ ] Decide on email confirmations, and set the Site URL.
- [ ] `PRIVACY.md` reviewed by a solicitor, and the bracketed operator
      details filled in. Holding email addresses and photographs is a
      material change from "nothing leaves your device".
- [ ] A backup policy for the database. Supabase's own backups are daily
      on paid plans and absent on the free tier.
- [ ] Decide what happens to uploaded photographs when an account is
      deleted. The schema cascades the rows; the Storage objects need
      removing too, and nothing does that yet.
