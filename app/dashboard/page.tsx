import Link from 'next/link';
import { ArrowUpRight, Box, Camera, CheckCircle2, Gem, Plus, ScanLine, Sparkles } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import type { Stone } from '@/lib/types';
import { SignOutButton } from '@/components/ui/sign-out-button';

function statusLabel(status: Stone['status']) {
  return {
    draft: 'Draft',
    captured: 'Captured',
    processing: 'Processing',
    ready: 'Digital Twin Ready',
    archived: 'Archived',
  }[status];
}

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const [{ data: stones }, { count: modelCount }] = await Promise.all([
    supabase.from('stones').select('*').order('created_at', { ascending: false }),
    supabase.from('models').select('id', { count: 'exact', head: true }),
  ]);

  const stoneRows = (stones || []) as Stone[];
  const readyCount = stoneRows.filter((s) => s.status === 'ready').length;
  const processingCount = stoneRows.filter((s) => s.status === 'processing').length;

  return (
    <div className="mb-grain min-h-[calc(100vh-120px)] space-y-10">
      <section className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
        <div>
          <div className="mb-label">Mooka Boys / Digital Twin Lab</div>
          <h1 className="mb-display mt-3 text-4xl md:text-6xl">The stones are the heroes.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#9a9288]">
            Preserve the original evidence. Reconstruct the object. Give each physical opal a persistent digital identity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-xs text-[#9a9288]">Signed in as</div>
            <div className="text-sm text-[#f2f0eb]">{user.email}</div>
          </div>
          <SignOutButton />
          <Link href="/twins/new" className="flex items-center gap-2 rounded-full bg-[#c9a66b] px-4 py-2.5 text-sm font-semibold text-[#0a0a0a] hover:bg-[#d8b77f]">
            <Plus size={16} /> New Twin
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Gem} label="Digital Twins" value={stoneRows.length.toString()} />
        <StatCard icon={CheckCircle2} label="Twin Ready" value={readyCount.toString()} />
        <StatCard icon={ScanLine} label="Processing" value={processingCount.toString()} />
        <StatCard icon={Box} label="3D Models" value={(modelCount || 0).toString()} />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="mb-label">Object ledger</div>
            <h2 className="mt-2 text-2xl font-medium">Digital Twins</h2>
          </div>
          <Link href="/project" className="hidden items-center gap-1 text-sm text-[#c9a66b] sm:flex">Project & leadership <ArrowUpRight size={15} /></Link>
        </div>

        {stoneRows.length === 0 ? (
          <div className="mb-panel rounded-2xl border-dashed p-10 md:p-14">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#c9a66b]/30 bg-[#c9a66b]/5">
                <Sparkles size={22} className="text-[#c9a66b]" />
              </div>
              <h3 className="mt-5 text-2xl font-medium">Create the first digital twin.</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#9a9288]">
                Start with one real Andamooka matrix opal. Capture the physical object, preserve the source images and add the first GLB reconstruction.
              </p>
              <Link href="/twins/new" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0a0a0a] hover:bg-[#ece9e2]">
                <Plus size={16} /> Create MB-000001
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {stoneRows.map((stone) => <StoneCard key={stone.id} stone={stone} />)}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#c9a66b]/20 bg-[#c9a66b]/[.045] p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-label text-[#c9a66b]">Prototype principle</div>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-[#f2f0eb]">
              A Digital Twin is not just a mesh. It is an evidence-linked digital record of a physical object.
            </p>
          </div>
          <Link href="/project" className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-white hover:bg-white/5">
            See the project <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Gem; label: string; value: string }) {
  return (
    <div className="mb-panel rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/20"><Icon size={16} className="text-[#c9a66b]" /></div>
        <span className="text-3xl font-medium tracking-tight">{value}</span>
      </div>
      <div className="mt-5 mb-label">{label}</div>
    </div>
  );
}

function StoneCard({ stone }: { stone: Stone }) {
  return (
    <Link href={`/twins/${stone.id}`} className="group mb-panel rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-white/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-label text-[#c9a66b]">{stone.digital_twin_id}</div>
          <h3 className="mt-2 text-xl font-medium">{stone.name}</h3>
          <p className="mt-1 text-sm text-[#9a9288]">{stone.origin || 'Origin not recorded'}</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[.12em] text-[#bdb4aa]">{statusLabel(stone.status)}</span>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-[#9a9288]">
        <span className="flex items-center gap-2"><Camera size={14} /> {stone.stone_reference || 'No field reference'}</span>
        <ArrowUpRight size={16} className="text-[#c9a66b] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
