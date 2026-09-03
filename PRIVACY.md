# Privacy Policy — BRAW

**Status: DRAFT. Not yet reviewed by a solicitor, and not yet published.**

This was written from an audit of what the code actually does, so the
factual claims below are accurate as of the commit that introduced the
optional backend. What it is not is legal advice, and it cannot be
published until:

1. A solicitor familiar with UK GDPR reviews it.
2. The bracketed identity and contact details are filled in — only the
   operator can supply those.
3. The outstanding items in "Known gaps" are fixed or disclosed.

Last reviewed against the code: 2026-08-23.

---

## Two versions of this app

BRAW can run with or without a backend, and which one you are using
changes this policy materially. The app tells you which: the sign-in
screen asks for an **email address** when there is a backend, and only
for an explorer name when there is not.

**Without a backend** — no account server exists. Everything stays on
your device. Nobody at BRAW can see your journeys, your photographs or
where you have been, because none of it is sent anywhere.

**With a backend** — you have a real account, so we hold your email
address and a copy of your journey progress. Photographs still stay on
your device unless you choose to upload them.

The rest of this policy marks clearly which parts apply only to the
second case.

---

## Who we are

[OPERATOR LEGAL NAME], [ADDRESS].
Contact: [EMAIL].
[If the operator is a UK data controller processing personal data, check
whether ICO registration is required — most small operators are exempt,
but this needs confirming rather than assuming.]

---

## What is kept on your device

This is created by you and stored in your own browser, in both versions:

| What | Where | Why |
| --- | --- | --- |
| Your explorer name | `localStorage` | To tell your profile from another on a shared device |
| Your saved journeys, XP, levels, badges, region stamps and activity | `localStorage` | The app is a progress tracker; this is the progress |
| Photographs you take at a location | `IndexedDB` | To show alongside the stop you took them at, and to make prints from |
| Your language, theme and location preferences | `localStorage` | So the app looks and behaves the way you left it |

Photographs are kept twice: a small copy for the app's own screens, and
one at print resolution, because they can be made into a calendar. The
larger copy is around 1MB each. The **Profile → Your photographs** panel
shows exactly how much space they take.

### We ask your browser to protect them

Browser storage can be cleared automatically when a device runs short of
space. The app asks your browser for *persistent* storage, which stops
that. It cannot stop **you** clearing your own browsing data — that
deletes photographs kept only on the device, permanently. The panel says
so plainly and offers to save copies elsewhere.

---

## What is kept on a server *(only with a backend)*

Only if you create an account:

| What | Why | Kept until |
| --- | --- | --- |
| Your email address | To identify the account, let you sign in on another device, and reset a forgotten password | You delete the account |
| A hashed password | To sign you in. Hashing is handled by the authentication service (bcrypt); we never see the password | You delete the account |
| Your display name | To greet you, and to put a name to an order | You delete the account |
| A copy of your journeys, XP, badges and activity | So a new phone picks up where the old one left off | You delete the account |
| Photographs **you chose to upload** | So the print shop has something to print | You delete them, or the account |
| Orders you have placed | To fulfil them and to keep proper records | See Retention |

We do not collect your date of birth, contacts, address book, device
identifiers, or advertising identifiers. We do not ask for them.

### Photographs are not uploaded automatically

Nothing is uploaded unless you ask. There are exactly three ways a
photograph leaves your device, and all three are a button you press:

* *Upload a copy* on a single photograph;
* *Upload to my account* in the storage panel;
* placing an order — the photographs you chose go up so they can be
  printed, and the app says so before you order.

Uploaded photographs go into private storage keyed to your account. They
are not public, not indexed, and not readable by another account.
Deleting a photograph in the app deletes both copies.

### We never see your password

With a backend, passwords are handled by the authentication service and
stored as a bcrypt hash. Without a backend, the local profile password is
hashed with unsalted SHA-256 in your browser — **which is not strong
password storage.** It exists only to stop a passer-by opening your
profile on a shared device. Do not reuse a password that matters
anywhere else.

---

## Location

Live location is **off unless you switch it on**, and the first time you
switch it on the app explains what it does before your browser asks for
permission.

When it is on:

* Your position draws a dot on the map and notices when you arrive
  within about 500 metres of a stop.
* It is held **in memory only**. It is not written to storage, not
  included in your profile, and **never sent to any server** — in either
  version of the app.
* Switching it off releases the location watch, so your device stops
  powering the receiver.

The app never requests background location and cannot track you when it
is closed.

Note that a photograph may itself carry location data in its EXIF. BRAW
re-encodes every photograph when it is saved, which drops EXIF —
including GPS coordinates and camera serial numbers — so an uploaded
photograph does not carry your location with it.

---

## Buying things *(only with a backend, and only if you order)*

The Store makes calendars, prints and magnets out of your own
photographs.

* **We do not take payments.** Ordering hands a reference number to a
  separate shop, which takes the money and posts the parcel. Its own
  privacy policy governs what happens there.
* **We do not send your details to the shop.** The hand-off carries the
  order reference and the product, and nothing else — no email, no name.
  The shop asks you for a delivery address itself.
* **We hold no card details.** Nowhere in this app, at any point.

---

## Cookies and analytics

BRAW sets **no cookies**. It runs **no analytics**, no pixels, no
advertising, no A/B testing and no crash reporting. Nothing about your
use of the app is measured or reported.

`localStorage` and `IndexedDB` are used as described above. They are
storage, not tracking: readable only by this site, on this device. With
an account, a session token is kept in `localStorage` so you are not
signed out every time you open the app.

---

## Third parties

**Google Fonts.** The app loads three typefaces from
`fonts.googleapis.com`. That request discloses your IP address and
general request metadata to Google, who set out their handling at
policies.google.com/privacy. The fonts are requested after the page has
drawn, so the app works fully without them, but the request is still
made. We intend to self-host these files, which removes the third party
entirely. See "Known gaps".

**Google Maps** *(only if you switch it on)*. BRAW can show a map of
anywhere in the world, drawn by Google. It is **off until you turn it
on**, on your profile page, and while it is off no request is made and
nothing about you reaches Google from the map.

Turn it on and, whenever a map opens, your browser fetches Google's
script and its map tiles. That discloses to Google your IP address,
roughly the area you are looking at, and the ordinary metadata any web
request carries. Google is a separate controller for that data under
its own terms, not our processor: we cannot see it, limit it or delete
it on your behalf. Their handling is at policies.google.com/privacy.

Two things follow that are worth stating plainly:

- **We cannot self-host this the way we intend to with the fonts.**
  Google's terms forbid storing or re-serving their map tiles, so the
  third party is permanent for as long as the worldwide map is on.
- **Scotland does not need it.** The 182 Scottish locations are ours,
  with their own coordinates and their own map, and they work with the
  switch off and with no signal at all.

**Supabase** *(only with a backend)*. Accounts, the profile copy and
uploaded photographs are held on infrastructure operated by Supabase,
acting as our processor under a data processing agreement. The project
region is [REGION — set this to an EU/UK region and state it here, or
disclose the transfer]. Supabase's sub-processors are listed at
supabase.com/privacy.

**The shop** *(only if you order)*. Whichever fulfilment partner is
configured. To be named here before the shop opens.

Beyond that: no error tracker, no advertising, no social
embeds. The map is drawn from data compiled into the app itself, which is
why it works offline.

## Hosting

The site is served as static files from GitHub Pages. As with any web
host, GitHub receives the network requests needed to deliver the page and
may log them; see GitHub's own privacy statement. We have no access to
those logs.

## Retention

* **On your device** — indefinitely, under your control. Clearing this
  site's data in your browser removes all of it immediately.
* **Your account** — until you delete it. Deleting the account removes
  the profile copy, the photograph records and the uploaded files.
* **Orders** — kept while the order is being fulfilled, and afterwards
  for as long as tax and consumer-rights law requires. [Confirm the
  period with an accountant — six years is the usual UK answer for
  transaction records.]

## Your rights

Under UK GDPR you have rights of access, rectification, erasure,
restriction, portability and objection.

Without a backend, you can exercise all of them yourself, immediately:

* **Access and portability** — Profile → Your data → *Download a backup*
  gives you every journey, badge and photograph as one file. *Save every
  photo to my device* gives you the photographs as ordinary `.jpg` files.
* **Erasure** — clearing this site's data in your browser erases
  everything, permanently. There is no copy anywhere else.
* **Objection and restriction** — switch location off, or stop using the
  app. Nothing continues in the background.

With an account, the same exports work, and in addition you may write to
[EMAIL] to ask us to show you, correct, or delete what we hold. We will
respond within one month. Deleting your account deletes the profile copy
and every uploaded photograph.

You may complain to the Information Commissioner's Office at ico.org.uk.

## Lawful basis *(only with a backend)*

For a solicitor to confirm:

* Account, sign-in and profile sync — **contract**: you asked for an
  account and this is what an account does.
* Photograph upload — **consent**, given per upload by pressing the
  button, withdrawable by deleting the photograph.
* Orders and their retention — **contract**, and **legal obligation**
  for the record-keeping period.

## Children

BRAW is not directed at children and collects nothing that would
identify one. It does describe hill walking, wild swimming and
mountaineering, and is not a substitute for adult supervision.

## Changes

Material changes will be noted here with a date. The current version of
this page is the only notice we can give, unless you have an account and
have given us an email address.

---

## Known gaps

Written down rather than glossed over, so they get fixed.

1. **Google Fonts is still a third-party request.** Self-hosting the
   three families removes it. Blocked only on downloading the files.
1b. **The worldwide map cannot be made first-party.** Unlike the fonts,
   Google's terms forbid storing or re-serving their tiles, so switching
   the map on means a permanent third party. The mitigation is that it
   is off by default and Scotland never needs it — not that it can be
   removed later.
1c. **There is no map without a connection.** The same clause that
   forbids re-serving tiles forbids caching them, so the worldwide map
   cannot be made to work offline. Where there is no signal the app
   shows the itinerary as a list instead, and Scottish stops keep their
   names, descriptions and coordinates because those are ours.
2. **Local password hashing is weak** (unsalted SHA-256). Acceptable
   only as a shared-device convenience, and it is no longer used for
   real accounts once a backend is configured. It still guards local
   profiles and the demo.
3. **Account deletion is not yet self-service.** The database is set up
   to cascade — deleting the account row removes the profile, the
   photograph records and the orders — but nothing in the app triggers
   it, and the uploaded files in storage are **not** removed by that
   cascade. Both need building before launch, and until they are, a
   deletion request has to be handled by hand.
4. **No cookie or consent banner.** Believed correct — we set no cookies
   and do no tracking, the session token is strictly necessary, and the
   font request is arguably necessary for presentation — but this is
   exactly the kind of judgement that needs a solicitor.
5. **The processor region is not yet fixed.** Set the Supabase project
   to an EU or UK region, or disclose the transfer and its safeguards.
6. **The fulfilment partner is not chosen**, so it cannot yet be named
   or its terms reviewed.
