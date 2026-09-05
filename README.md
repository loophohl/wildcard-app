# WildCard Tagger — PWA

Pitch-level matrix tagging for the Wildcard Format. Deploys to `app.loophohl.com`.

## What changed from the artifact version

- **Export actually works.** `handleShareFingerprint` now uses the Web Share API with a
  real `File`, so the JSON leaves as a `.json` attachment. Falls back to a blob download.
  The old mail-body path truncated around 56KB and silently dropped the tail of long games.
- **Installable.** Manifest + service worker. Add to Home Screen launches fullscreen,
  no Safari chrome.
- **Works offline.** The app shell is precached, so it runs with no signal at the field.
- **Ships compiled.** ~103KB gzipped instead of 350KB of JSX transpiled on the phone.

## Local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the built output
```

## Deploy

First time:

```bash
npm i -g vercel
vercel login
vercel --prod
```

Vercel auto-detects Vite. Accept the defaults — `vercel.json` already pins the build
command, output directory, and SPA rewrite.

## DNS — pointing app.loophohl.com

The domain is registered at Squarespace; the app is hosted on Vercel.

**Order matters. Add the domain in Vercel FIRST, then create the DNS record.**
Vercel now issues a project-specific CNAME target (e.g. `d1d4fc829fe7bc7c.vercel-dns-017.com`),
not the old generic `cname.vercel-dns.com`. Verification checks for the exact value your
project expects, so a guessed record leaves the domain stuck in an invalid state.

1. Deploy, then add the domain: `vercel domains add app.loophohl.com`
   (or Vercel dashboard → project → **Settings → Domains → Add**).
2. Read the exact CNAME target off the domain card, or run:
   `vercel domains inspect app.loophohl.com`
3. In **Squarespace → Domains → [loophohl.com] → DNS → DNS Settings**, scroll to
   **Custom Records** and add:
   - Type: `CNAME`
   - Host: `app`
   - Data: the exact value from step 2 — **including any trailing period**
4. Wait for propagation, then confirm **Valid Configuration** in Vercel. SSL is
   provisioned automatically once verification passes.

Notes:
- This is a subdomain record only. It does not touch the root `loophohl.com`, so the
  Squarespace Defaults can stay in place and the marketing site is unaffected.
- Do **not** add an AAAA record. Vercel doesn't support IPv6 for custom domains on
  third-party DNS, and a stray AAAA can stall SSL provisioning.
- Pointing the *root* `loophohl.com` at Vercel is a separate job and does require
  deleting the Squarespace Defaults records first (apex uses an A record, not a CNAME).

## Installing on the phone

Open `https://app.loophohl.com` in Safari → Share → **Add to Home Screen**.
Launches fullscreen. Verify offline by enabling Airplane Mode and reopening.

## Notes

- Storage is `localStorage`, scoped to the origin. Once installed, an in-progress game
  survives reloads and app restarts.
- Never test export in a private/incognito window — storage is cleared on close.
- The component is a single file: `src/LoopholeMatrixTagger.jsx`.
