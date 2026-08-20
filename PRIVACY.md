# Privacy Policy — BRAW

**Status: DRAFT. Not yet reviewed by a solicitor, and not yet published.**

This was written from an audit of what the code actually does, so the
factual claims below are accurate as of commit `e28f0e7`. What it is not
is legal advice, and it cannot be published until:

1. A solicitor familiar with UK GDPR reviews it.
2. The bracketed identity and contact details are filled in — only the
   operator can supply those.
3. The outstanding item in "Known gaps" is fixed or disclosed.

Last reviewed against the code: 2026-08-20.

---

## The short version

BRAW keeps everything on your device. There is no account on a server,
no analytics, no advertising, and no tracking. Nobody at BRAW can see
your trips, your photographs or where you have been, because none of it
is ever sent anywhere.

The one exception is the webfont request described below, which
unavoidably discloses your IP address to Google. We are working on
removing it.

---

## Who we are

[OPERATOR LEGAL NAME], [ADDRESS].
Contact: [EMAIL].
[If the operator is a UK data controller processing personal data, check
whether ICO registration is required — most small operators are exempt,
but this needs confirming rather than assuming.]

## What we collect

**Nothing on a server.** BRAW has no backend. There is no database, no
user table and no log of your activity, because there is nowhere to keep
one.

The following is created by you and stored **in your own browser**, on
your own device:

| What | Where it is kept | Why |
| --- | --- | --- |
| Your explorer name and a hash of your password | `localStorage` | So the app can tell your profile from another on a shared device |
| Your saved journeys, XP, levels, badges, region stamps and activity | `localStorage` | The app is a progress tracker; this is the progress |
| Photographs you take at a location | `IndexedDB` | To show alongside the stop you took them at |
| Your language, theme and location preferences | `localStorage` | So the app looks and behaves the way you left it |

We do not collect your name, email address, date of birth, payment
details, contacts, or anything else. We do not ask for them.

## Location

Live location is **off unless you switch it on**, and the first time you
switch it on the app explains what it does before your browser asks for
permission.

When it is on:

* Your position is used to draw a dot on the map and to notice when you
  arrive within about 500 metres of a stop on your journey.
* It is held in memory only. It is **not written to storage** and **not
  transmitted**. There is no server to transmit it to.
* Switching it off releases the location watch, so your device stops
  powering the receiver.

The app never requests background location and cannot track you when it
is closed.

## Your password

Your password is hashed with SHA-256 before being stored in your
browser, and the plain password is never kept. **This is not strong
password storage** — it is unsalted and uncomputationally-cheap, which
would be inadequate for a server holding many accounts. It is used here
only to stop a casual passer-by opening your profile on a shared device.

Do not reuse a password you use anywhere important.

If a real account system is added later, this policy must be rewritten
before it ships.

## Cookies and analytics

BRAW sets **no cookies**. It runs **no analytics**, no pixels, no
advertising, no A/B testing and no crash reporting. Nothing about your
use of the app is measured or reported.

`localStorage` and `IndexedDB` are used as described above. They are
storage, not tracking: they are readable only by this site, on this
device.

## Third parties

There is one, and we are not happy about it.

**Google Fonts.** The app loads three typefaces from
`fonts.googleapis.com`. Making that request discloses your IP address
and general request metadata to Google, who set out their handling at
policies.google.com/privacy. The fonts are requested after the page has
drawn, so the app works fully without them, but the request is still
made.

We intend to self-host these files, which removes the third party
entirely. Until then this disclosure stands. See "Known gaps".

Beyond that: no CDNs, no map tile provider, no error tracker, no social
embeds. The map is drawn from data compiled into the app itself, which is
why it works offline.

## Hosting

The site is served as static files from GitHub Pages. As with any web
host, GitHub receives the network requests needed to deliver the page and
may log them; see GitHub's own privacy statement. We have no access to
those logs and receive nothing from them.

## Your rights

Under UK GDPR you have rights of access, rectification, erasure,
restriction, portability and objection.

In practice, because your data never leaves your device, you can
exercise most of them yourself and immediately:

* **Access and portability** — Profile → Your data → *Download a
  backup*. You get every quest, badge and photograph as one JSON file.
* **Rectification and erasure** — clearing this site's data in your
  browser settings erases everything, permanently and instantly. There
  is no copy anywhere else.
* **Objection and restriction** — switch location off, or stop using the
  app. Nothing continues in the background.

We cannot delete your data on request, because we do not have it. If you
believe we hold something about you, write to [EMAIL] and we will
explain what we can see, which we expect to be nothing.

You may complain to the Information Commissioner's Office at ico.org.uk.

## Children

BRAW is not directed at children and collects nothing that would
identify one. It does describe hill walking, wild swimming and
mountaineering, and is not a substitute for adult supervision.

## Changes

Material changes will be noted here with a date. Because the app has no
way to contact you, the current version of this page is the only notice
we can give.

---

## Known gaps

Written down rather than glossed over, so they get fixed.

1. **Google Fonts is still a third-party request.** Self-hosting the
   three families removes it. Blocked only on downloading the files.
2. **Password hashing is weak** (unsalted SHA-256). Acceptable only
   while it is a local convenience and not a real credential. Must be
   replaced before any server-side account exists.
3. **No cookie or consent banner.** Believed correct — we set no cookies
   and do no tracking, and the font request is arguably necessary for
   presentation — but this is exactly the kind of judgement that needs a
   solicitor rather than a developer.
4. **No documented retention period**, because nothing is retained by
   us. Confirm that "the user's own device, indefinitely, under their
   control" is an adequate answer in the policy.
