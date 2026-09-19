# Deployment notes

The application is structured as a standard Next.js project with no provider-specific database code outside Supabase.

For Cloudflare, use the current official Next.js-on-Cloudflare deployment path for your chosen Workers/OpenNext setup. The exact adapter/command changes over time, so do not hard-code an old Cloudflare adapter into the application source.

Supabase remains the data/auth/storage layer.
