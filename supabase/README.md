# Supabase setup

1. Create a Supabase project.
2. Run `migrations/001_mooka_boys_digital_twin.sql` in the SQL Editor (or apply it through the Supabase CLI).
3. Enable Email/Password authentication.
4. Create your first team user in Auth.
5. Promote that user's profile to admin:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

The four private storage buckets are created by the migration:

- `original-captures`
- `models`
- `textures`
- `documents`

The v0.1 storage policies allow authenticated internal users to read/write these buckets. Before opening the system to external users, replace these broad team policies with per-organization/per-stone membership policies.
