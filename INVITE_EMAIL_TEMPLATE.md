# UFbiz Invite Email Template

Use this template in Supabase Dashboard → Authentication → Email Templates → "Invite user"

## Subject Line
```
You've been invited to join UFbiz
```

## Email Body (HTML)
```html
<h2 style="color: #FA4616; font-family: Arial, sans-serif;">You've been invited to join UFbiz! 🐊</h2>

<p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
  Hi there!
</p>

<p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
  You've been invited to manage events for <strong>{{ .OrganizationName }}</strong> on <strong>UFbiz</strong>, the hub for business organizations and events at the University of Florida.
</p>

<p style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
  Click the link below to create your account and start managing your organization's events:
</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #0021A5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: Arial, sans-serif; display: inline-block;">
    Create My Account
  </a>
</p>

<p style="font-family: Arial, sans-serif; font-size: 14px; color: #666;">
  This link will expire in 24 hours. If you didn't request this invite, you can safely ignore this email.
</p>

<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

<p style="font-family: Arial, sans-serif; font-size: 12px; color: #999; text-align: center;">
  Go Gators! 🐊<br>
  - The UFbiz Team
</p>
```

## Email Body (Plain Text Alternative)
```
You've been invited to join UFbiz! 🐊

Hi there!

You've been invited to manage events for {{ .OrganizationName }} on UFbiz, the hub for business organizations and events at the University of Florida.

Click the link below to create your account and start managing your organization's events:

{{ .ConfirmationURL }}

This link will expire in 24 hours. If you didn't request this invite, you can safely ignore this email.

---
Go Gators! 🐊
- The UFbiz Team
```

## Instructions for Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **"Invite user"** template
3. Copy the HTML template above into the editor
4. Customize colors/branding if needed:
   - UF Blue: `#0021A5`
   - UF Orange: `#FA4616`
5. Save the template

## Template Variables Available

Supabase provides these variables you can use:
- `{{ .ConfirmationURL }}` - The invite link (required)
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL
- `{{ .Token }}` - The invite token (usually not needed)

Note: The `{{ .OrganizationName }}` variable won't work directly - Supabase doesn't pass custom data to email templates. You can either:
- Remove the organization name from the template, OR
- Use a generic message like "your organization"

