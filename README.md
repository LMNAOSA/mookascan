# Mooka Boys Digital Twin v0.1

A real, full-stack starting point for creating evidence-linked digital twins of physical Andamooka matrix opals.

## What this build does

- Supabase email/password authentication
- PostgreSQL data model for stones, capture sessions, original images, models, processing jobs and provenance
- Private Supabase Storage buckets
- Permanent human-readable Digital Twin IDs (`MB-000001`, etc.)
- Guided 3-step workflow: identify → capture → attach 3D model
- Direct browser upload of original capture images
- GLB upload with processing-engine metadata
- Interactive Three.js / React Three Fiber viewer
- Original photographic evidence gallery
- Basic provenance timeline
- Project room with real project roles and an explicit aspirational leadership simulation for Jony Ive and Amaar Reshi
- Photogrammetry boundary designed for future RealityScan / AliceVision / Meshroom / COLMAP adapters

## Core principle

A Digital Twin is not just a mesh.

It is an evidence-linked digital record of a physical object:

```text
PHYSICAL OPAL
      │
      ▼
   CAPTURE
      │
      ├───────────────┐
      ▼               ▼
ORIGINAL PHOTOS    METADATA
      │               │
      └───────┬───────┘
              ▼
       PHOTOGRAMMETRY
              │
              ▼
          3D MODEL
              │
              ▼
       DIGITAL TWIN
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
   PROVENANCE SCIENCE STORY
```

## Stack

- Next.js + React + TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL + Storage
- Three.js + React Three Fiber + Drei
- GitHub for source control
- Cloudflare-compatible deployment path

Supabase's current Next.js guidance uses `@supabase/ssr` for cookie-based server-side auth in SSR frameworks. See the official docs for the latest setup details.

## Local setup

### 1. Create Supabase project

Create a new Supabase project and enable Email/Password authentication.

### 2. Apply database migration

Run:

```text
supabase/migrations/001_mooka_boys_digital_twin.sql
```

You can paste it into Supabase SQL Editor or apply it using the Supabase CLI.

### 3. Create first user

Create the first user in Supabase Auth, then promote that account to admin in SQL:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

### 4. Configure environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Set:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Do not put a Supabase secret/service-role key in the browser environment.

### 5. Install and run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## The intended first test

Use one real Andamooka matrix opal.

1. Matt signs in.
2. Create `MB-000001`.
3. Enter basic physical information.
4. Upload the original multi-angle photographic capture.
5. Run that source image set through RealityScan or an open-source photogrammetry tool externally.
6. Export a GLB.
7. Upload the GLB and record the processing engine/version.
8. Open the Digital Twin.
9. Rotate and inspect the real reconstructed object.
10. Verify that the original evidence is still attached to the record.

## Photogrammetry boundary

Version 0.1 intentionally does **not** pretend to automate photogrammetry.

The application preserves the source capture and provides a clean boundary for future processors:

```text
capture_images
      │
      ▼
PhotogrammetryProcessor
      │
 ┌────┼───────────┐
 ▼    ▼           ▼
RealityScan  AliceVision  COLMAP
      │
      ▼
     GLB
      │
      ▼
   models
```

This lets the project compare reconstruction systems without rebuilding the Digital Twin data model.

## Important security note

The current v0.1 storage policy is deliberately simple for an internal team: authenticated users can access the private project buckets. Before giving the system to external users, replace that with organization/team/stones membership policies.

## Leadership simulation note

The Project page includes Jony Ive and Amaar Reshi as **aspirational leadership simulations**. The UI explicitly states that this is not a claim of affiliation, participation, endorsement or advice. Their names should not be used to imply a business relationship.

## Next technical layer

The natural next build after v0.1 is not blockchain. It is a reliable photogrammetry processing service that can take the preserved source image set, run one or more real reconstruction engines, store processing metadata and create model versions automatically.
