# jmcte.me

Personal portfolio and agent-readable landing site for `jmcte.me`.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide React icons
- Vitest + Testing Library

## Project structure

- `content/` holds source-of-truth content in Markdown + JSON.
- `app/` contains server-rendered pages.
- `components/` contains reusable UI blocks.
- `lib/` contains loader and contract logic.
- `public/` contains generated machine-readable outputs:
  - `profile.json`
  - `projects.json`
  - `resume.json`
  - `agent-profile.json`
  - `sitemap.xml`
  - `robots.txt`
  - `.well-known/security.txt`

## Scripts

- `npm run sync:data` - generate public JSON and metadata from `content/`.
- `npm run dev` - local Next.js dev server.
- `npm run build` - static export for Cloudflare Pages.
- `npm run test` - run Vitest suite.
- `npm run lint` - run ESLint.
- `npm run typecheck` - run TypeScript check.

## Running locally

```bash
npm install
npm run sync:data
npm run dev
```

## Deployment to Cloudflare Pages

1. Connect repository to Cloudflare Pages.
2. Set framework preset to Next.js.
3. Use build command:
   - `npm run build`
4. Set output directory:
   - `out`
5. Add custom domain:
   - `jmcte.me`
   - `www.jmcte.me`

### Automated push deployment (GitHub Actions)

This repo includes `.github/workflows/pages-deploy.yml` which runs on push to `main` and deploys `out` to Cloudflare Pages with `cloudflare/wrangler-action`.

Required repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Expected Pages project name in workflow:
- `jmcte-me` by default (can be overridden via GitHub Actions variable `CLOUDFLARE_PAGES_PROJECT`).

If your project name is different, set `CLOUDFLARE_PAGES_PROJECT` in GitHub Actions variables, or update the Wrangler command in the workflow.

### Refreshing the Slopmeter snapshot

The homepage Slopmeter image is generated from local Codex usage data. Refresh both the image and its displayed date range with:

- `npm run refresh:slopmeter`

The command updates `public/heatmap-last-year.png` and `content/slopmeter.json` together. Commit both files so the published label always describes the published image. The Cloudflare runner does not regenerate this private local-usage snapshot during deployment.

### Provisioning the Cloudflare deploy token (scripted)

If you have a Cloudflare token that can manage API tokens, you can provision a least-privilege Pages deploy token and wire it into GitHub:

1. Copy `.env.example` to `.env` and fill:
   - `CLOUDFLARE_TOKEN_MGMT_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. Ensure GitHub CLI is authenticated:
   - `gh auth login`
3. Run:
   - `node scripts/provision-cloudflare-pages-token.mjs`

This script:
- Creates a deploy token with `Cloudflare Pages:Edit` permissions scoped to your account.
- Sets GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Sets GitHub Actions variable: `CLOUDFLARE_PAGES_PROJECT`

## Git hooks

Enable project hooks with:

```bash
git config core.hooksPath .githooks
```

## DNS setup for `jmcte.me` purchased at Porkbun

You have two production-ready options.

### Option 1 (Recommended): Keep DNS at Porkbun

1. In Cloudflare Pages, add custom domains for:
   - `jmcte.me`
   - `www.jmcte.me`
2. Cloudflare Pages will show target hostnames (example form: `<project-name>.pages.dev`).
3. In Porkbun DNS:
   - Create a DNS record for `www`:
     - Type: `CNAME`
     - Name: `www`
     - Value: `<your-project>.pages.dev`
   - For root `@`, create one of:
     - `CNAME`-flattened/`ALIAS` record to `<your-project>.pages.dev` (if your DNS plan supports it), or
     - `URL Redirect` from `@` -> `www.jmcte.me`.
4. In Cloudflare Pages, wait for verification and enable HTTPS.

### Option 2 (Most deterministic): Move DNS to Cloudflare

1. Add `jmcte.me` to Cloudflare as a new zone.
2. Cloudflare will provide nameservers (for example `xxxx.ns.cloudflare.com`, `yyyy.ns.cloudflare.com`).
3. In Porkbun, replace domain nameservers with Cloudflare nameservers.
4. In Cloudflare DNS, add or confirm records from Pages wizard for:
   - `jmcte.me` -> `<your-project>.pages.dev`
   - `www.jmcte.me` -> `<your-project>.pages.dev`
5. Enable SSL mode (automatic) and force HTTPS.

Notes:
- Keep TTL near default unless you are coordinating a change window.
- SSL/TLS certificate issuance can take a few minutes after DNS propagation.
