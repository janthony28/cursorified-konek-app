# Supabase email templates

These HTML templates match the KONEK site theme (teal `#0ca678`, Plus Jakarta Sans, light backgrounds) for auth emails.

## Invite user email

**File:** `invite.html`

Used when an admin invites a user via Supabase (e.g. `supabase.auth.admin.inviteUserByEmail()`). The template uses:

- **`{{ .ConfirmationURL }}`** – Link the user must click to accept the invite and set a password
- **`{{ .Email }}`** – Invited user’s email address

### How to use in Supabase Dashboard

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **Email Templates**.
3. Select **Invite user**.
4. Set **Subject** (e.g. `You're invited to KONEK`).
5. Paste the full contents of `invite.html` into the **Message (HTML)** editor.
6. Save.

### Suggested subject line

```text
You're invited to KONEK
```

### Local / self‑hosted

For local or self-hosted Supabase, you can point config to this file, for example in `config.toml`:

```toml
[auth.email.template.invite]
subject = "You're invited to KONEK"
content_path = "./supabase/templates/invite.html"
```

---

**Note:** Some providers prefetch links and can consume the token. If users report “invalid or expired” links, consider using a custom confirmation page that uses `{{ .Token }}` and `verifyOtp()` instead of `{{ .ConfirmationURL }}` directly.
