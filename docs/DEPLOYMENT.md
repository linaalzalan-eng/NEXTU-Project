# Deployment checklist

Status: prepared for Vercel; no public deployment has been performed. Public deployment requires explicit owner approval. No database or security changes are part of this procedure.

## Build configuration
- Import the NEXTU GitHub repository into a Vercel project; root directory is the repository root.
- Framework: Vite; install: `npm ci`; build: `npm run build`; output: `dist`.
- Use a supported Node version at least 22.22. `vercel.json` provides the SPA rewrite for direct `/tasks` and `/analytics` links.
- Deploy only the reviewed final commit. Do not upload `.env.local`, test-account passwords or build artifacts to Git.

## Environment variables
Configure these for the selected Preview/Production environment before building:
- `VITE_DATA_SOURCE=supabase`
- `VITE_SUPABASE_URL`: project's public URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: publishable key (or legacy anon key), never a secret/service-role key.
Do not configure `ST_A_*` or `ST_B_*` in Vercel. `VITE_*` values are public browser configuration. Rebuild after changes.

## Supabase Auth URLs (owner action)
Once the intended HTTPS domain is known:
- Set Site URL to that exact production origin.
- Add that origin with `/dashboard` and `/reset-password` to Redirect URLs.
- Keep localhost URLs only when local development needs them. Preview domains need their own explicitly allowed origins if testing email there.
- Keep Email provider and Confirm email enabled. Do not change RLS or activate paid features.

## Deferred email checks (D-31)
With an inbox the tester controls: register, confirm email, log in; request reset, use the link once, verify the new password works and the old one fails; reuse the link and expect rejection. Never paste token-bearing links into issue reports.
Supabase's built-in sender has limits; inbox delivery may need external email configuration. Do not purchase or configure a new provider without owner approval.

## Smoke test after an approved deployment
- Open `/tasks` and `/analytics` directly, then refresh; no hosting 404.
- Log in; add/edit/complete/delete one disposable task. Check Dashboard/Analytics update.
- Reload and verify the session; open another browser and verify the same account's task data.
- Check Arabic/English at 360px and desktop. Log out and verify protected routes require login.
- Run the deferred email checks. Recheck Security Advisor: the accepted Free-plan leaked-password warning may remain; investigate new warnings.

## Accepted limitations
- Leaked Password Protection is unavailable on Free (owner accepted); no paid feature activated.
- Inbox flow, production domain redirects and deployed smoke test are unverified until performed above. Local readiness is not a claim of a publicly deployed Beta.

References: https://vercel.com/docs/frameworks/frontend/vite and https://supabase.com/docs/guides/auth/redirect-urls