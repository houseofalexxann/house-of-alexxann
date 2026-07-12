# Credentials & recovery map

One page for the bad day. **No secrets live in this file** — it records *where*
every key is and *how* to recover it, so a lost phone or forgotten password
can't take the House down.

| System | Account | Recovery path |
|---|---|---|
| Domain (Namecheap) | houseofalexxann.com | Namecheap account email + their support with ID |
| Hosting (Vercel) | team `house-of-alexxann` | GitHub sign-in / email recovery |
| Database (Neon) | project "neon-cyan-notebook", via Vercel Storage integration | Recoverable through Vercel → Storage |
| Code (GitHub) | github.com/houseofalexxann/house-of-alexxann | GitHub account recovery; repo is public (clones everywhere are implicit backups) |
| Admin sign-in | House Mother account (role=admin User row) | Self-serve via /forgot once email is live; break-glass: ADMIN_EMAIL + ADMIN_PASSWORD env vars in Vercel |
| Session signing | SESSION_SECRET (Vercel env) | Rotating it signs everyone out (harmless); set a new 30+ char value and redeploy |
| Email (Resend) | pending | API key regenerable in Resend dashboard |
| Payments (Stripe) | pending | Keys regenerable in Stripe dashboard |
| Payment handles | Venmo/CashApp/Zelle/PayPal | Editable anytime in /admin/availability |

**Action items for Alexandria (do once):**
1. Turn on two-factor authentication for GitHub, Vercel, Namecheap, and (when created) Resend and Stripe.
2. Store account emails + 2FA backup codes somewhere offline (a printed page in a drawer beats a notes app).
3. If a device is lost: rotate SESSION_SECRET in Vercel and redeploy — every signed-in session everywhere is invalidated.
