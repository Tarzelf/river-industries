# River Industries

Quiet industrial systems for multi-planetary construction.

**Live:** https://river.industries

## Offices
- Austin, TX
- Boston, MA
- Jiangsu, China

## Site v1.1
- `/` — logo loader → hero (desktop 16:9 + mobile 9:16) with office nodes · tagline
- `/learn/` — coming soon · real waitlist API · system captions · lazy holos
- OG image + favicon monogram

## Waitlist
`POST /api/waitlist` `{ "email": "..." }` → Cloudflare Worker + KV (`river-waitlist`)

## Stack
- Cloudflare Pages (static) + Worker (proxy + waitlist)
- Source: https://github.com/Tarzelf/river-industries
