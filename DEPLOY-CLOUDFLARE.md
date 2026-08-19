# Seth & Helena Wedding Website — Cloudflare Deployment

This package is a full-stack Cloudflare Worker project.

## Included

- Existing wedding website design in `public/`
- Cloudflare Worker API in `src/index.js`
- Auto-provisioned Cloudflare D1 database (`DB` binding)
- Working RSVP submission saved to D1
- Database-backed Registry and Journal content
- Password-protected admin dashboard at `/admin.html`
- RSVP CSV export
- Registry add/edit/delete
- Journal add/edit/delete and publish/draft setting

## First deploy from GitHub

1. Replace the files currently in your GitHub repository with the contents of this package.
2. In Cloudflare, connect the GitHub repository as a Worker.
3. Build command: leave blank.
4. Deploy command: `npx wrangler deploy`
5. Deploy.

The `DB` D1 binding intentionally has no database ID. Current Wrangler supports automatic provisioning for D1; Cloudflare will create the database resource on deployment.

## Set the admin password after the first deploy

In Cloudflare open the deployed Worker, then go to Settings > Variables and Secrets.

Add these two **Secrets**:

- `ADMIN_PASSWORD` — the password you want to use for `/admin.html`
- `SESSION_SECRET` — a long random secret (at least 32 random characters)

Do not commit either value to GitHub.

After saving the secrets, redeploy if Cloudflare asks you to.

## Test

- Open the public site and submit a test RSVP.
- Open `/admin.html` and sign in with `ADMIN_PASSWORD`.
- Confirm the RSVP appears.
- Add/edit a Registry item and reload `registry.html`.
- Add/edit a Journal post and reload `journal.html`.
- Export RSVPs using the CSV button in Admin.

## Custom domain

After testing the `workers.dev` URL, add the GoDaddy domain to Cloudflare and attach it as a Worker Custom Domain. Then update the nameservers at GoDaddy to the nameservers Cloudflare provides.

## Optional additional protection

For stronger admin security, configure Cloudflare Access for `/admin.html` and `/api/admin/*` in addition to the built-in password login.
