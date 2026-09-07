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

### On the phone, over wifi

```bash
npm run dev -- --host
```

Vite then prints a **Network** URL (e.g. `http://192.168.1.67:5173`). Open that on the
phone with both devices on the same wifi and edits hot-reload instantly — a much tighter
loop than deploy-and-check for UI work like button sizing or the velocity scroller feel.

- The LAN IP is DHCP-assigned and changes when the Mac rejoins the network. If the phone
  stops loading, re-read the Network line.
- The service worker does **not** run in dev, so this loop won't exercise offline
  behaviour. Use `npm run preview -- --host` to test the built output with the SW active.

## Deploy

The repo (`loophohl/wildcard-app`) is connected to the Vercel project, so pushing to
`main` builds automatically. `vercel.json` pins the build command, output directory,
and SPA rewrite, so no dashboard configuration is needed.

```bash
git push origin main    # builds on Vercel
```

A push to `main` deploys straight to production — `app.loophohl.com` updates as soon
as the build finishes (~25s). There is no promote step, so treat `main` as live.

To deploy straight from the working tree, bypassing git:

```bash
vercel --prod
```

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
