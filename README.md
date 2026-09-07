# River Industries

Quiet industrial systems for multi-planetary construction.

**Live:** https://river.industries

## Offices
- Austin, TX
- Boston, MA
- Jiangsu, China

## Site (v1.1)
- `/` — logo loader → hero (desktop 16:9 + mobile 9:16) · office nodes · tagline
- `/learn/` — coming soon · **real waitlist** (`POST /api/waitlist` → Cloudflare KV) · Paint / Frame / Floor with captions · lazy video
- OG image + favicon monogram
- Worker proxies Pages + stores waitlist in KV `river-waitlist`

## Waitlist
Emails land in Cloudflare KV namespace `river-waitlist`:
- `email:<addr>` → JSON record
- `index` → list of emails

## Stack
- GitHub: https://github.com/Tarzelf/river-industries
- Cloudflare Pages: `river-industries.pages.dev`
- Worker: `river-industries` on `river.industries` / `www`
