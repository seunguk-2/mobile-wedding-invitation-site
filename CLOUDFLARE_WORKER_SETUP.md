# Cloudflare Worker Publish Endpoint

This project now supports a protected serverless publish endpoint so the browser editor does not need to hold a GitHub token.

## What this does

- `editor.html` sends publish requests to a Cloudflare Worker endpoint.
- The Worker validates a publish password.
- The Worker uses a GitHub token stored only in Cloudflare secrets.
- The Worker uploads gallery images to `uploads/` and updates `content.json`.
- GitHub Pages serves the updated invitation site.

## Files

- `worker/publish-endpoint.js`: Cloudflare Worker source
- `wrangler.toml`: Worker config
- `.dev.vars.example`: local/example binding names

## Required secrets and variables

Set these in Cloudflare Worker settings:

- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `PUBLIC_SITE_BASE_URL`
- `ALLOWED_ORIGIN`
- `GITHUB_TOKEN`
- `PUBLISH_PASSWORD`

Suggested values for this project:

- `GITHUB_OWNER=seunguk-2`
- `GITHUB_REPO=mobile-wedding-invitation-site`
- `GITHUB_BRANCH=main`
- `PUBLIC_SITE_BASE_URL=https://seunguk-2.github.io/mobile-wedding-invitation-site`
- `ALLOWED_ORIGIN=https://seunguk-2.github.io`

Notes:

- `PUBLIC_SITE_BASE_URL` includes the repo path.
- `ALLOWED_ORIGIN` is only the origin, not the full path.
- `GITHUB_TOKEN` should be a fine-grained token with `Contents: Read and write` for this repo only.
- `PUBLISH_PASSWORD` is the password you type into the editor page.

## Deploy in Cloudflare Dashboard

1. Create a new Worker in Cloudflare.
2. Replace the Worker code with `worker/publish-endpoint.js`.
3. Add the variables and secrets above.
4. Deploy the Worker.
5. Copy the Worker URL, for example:
   `https://wedding-invitation-publisher.<subdomain>.workers.dev/publish`
6. Open `editor.html`.
7. Paste the Worker URL into `발행 엔드포인트 URL`.
8. Paste your chosen `PUBLISH_PASSWORD` into `발행 비밀번호`.
9. Confirm `공개 사이트 주소` is your GitHub Pages site URL.
10. Use `공유 페이지에 발행하기`.

## Deploy with Wrangler

If you prefer CLI deployment:

1. Install Wrangler locally.
2. Copy `.dev.vars.example` to `.dev.vars`.
3. Replace placeholder values in `.dev.vars`.
4. Run:

```bash
wrangler deploy
```

5. Use the deployed Worker URL in `editor.html`.

## Security model

- The browser never sees the GitHub token.
- The browser only sees the Worker URL and the publish password you type into the editor.
- The Worker accepts publish requests only from `ALLOWED_ORIGIN`.
- The Worker writes only to the configured GitHub repository and branch.

## Limits

- Old uploaded images are not deleted when you replace them.
- GitHub Pages may take about 1-2 minutes to show the updated `content.json`.
- If you want stronger admin auth than a shared publish password, the next step would be Cloudflare Access or OAuth.
