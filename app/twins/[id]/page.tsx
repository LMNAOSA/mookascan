import Link from 'next/link';
import { ArrowLeft, CalendarDays, Camera, ChevronRight, CircleDot, FileImage, Gem, MapPin, Ruler, Scale, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { ModelViewerShell } from '@/components/twins/model-viewer-shell';
import type { CaptureImage, CaptureSession, ProvenanceEvent, Stone, StoneModel } from '@/lib/types';

export default async function TwinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();

  const { data: stone } = await supabase.from('stones').select('*').eq('id', id).single();
  if (!stone) notFound();
  const record = stone as Stone;

  const [{ data: models }, { data: captures }, { data: provenance }] = await Promise.all([
    supabase.from('models').select('*').eq('stone_id', id).order('version', { ascending: false }),
    supabase.from('capture_sessions').select('*').eq('stone_id', id).order('created_at', { ascending: false }),
    supabase.from('provenance').select('*').eq('stone_id', id).order('date', { ascending: true }),
  ]);

  const latestModel = (models?.[0] || null) as StoneModel | null;
  let modelUrl: string | null = null;
  if (latestModel) {
    const { data } = await supabase.storage.from('models').createSignedUrl(latestModel.file_path, 60 * 60);
    modelUrl = data?.signedUrl || null;
  }

  const captureSessions = (captures || []) as CaptureSession[];
  const latestCapture = captureSessions[0];
  let images: { image: CaptureImage; url: string }[] = [];
  if (latestCapture) {
    const { data: imageRows } = await supabase.from('capture_images').select('*').eq('capture_session_id', latestCapture.id).order('sequence', { ascending: true });
    const rows = (imageRows || []) as CaptureImage[];
    images = rows.map((image) => image).filter(Boolean).length ? await Promise.all(rows.slice(0, 24).map(async (image) => {
      const { data } = await supabase.storage.from('original-captures').createSignedUrl(image.file_path, 60 * 60);
      return { image, url: data?.signedUrl || '' };
    })) : [];
  }

  return (
    <div className="pb-16">
      <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm text-[#9a9288] hover:text-white"><ArrowLeft size={15} /> Back to Digital Twins</Link>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <div>
          {modelUrl ? <ModelViewerShell url={modelUrl} /> : <div className="grid h-[58vh] min-h-[430px] place-items-center rounded-2xl border border-white/10 bg-[#11100e]"><div className="max-w-md text-center px-6"><Gem size={30} className="mx-auto text-[#c9a66b]" /><h2 className="mt-4 text-xl font-medium">The 3D model has not been attached yet.</h2><p className="mt-2 text-sm leading-6 text-[#9a9288]">The original capture may already be preserved. Process it externally, then upload the GLB to complete the first Digital Twin.</p></div></div>}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Metric icon={Camera} label="Source images" value={String(latestCapture?.image_count || 0)} />
            <Metric icon={Sparkles} label="Model version" value={latestModel ? `v${latestModel.version}` : '—'} />
            <Metric icon={CircleDot} label="Processing" value={latestModel?.processing_engine || 'Not attached'} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="mb-panel rounded-2xl p-6">
            <div className="mb-label text-[#c9a66b]">{record.digital_twin_id}</div>
            <h1 className="mb-display mt-2 text-4xl">{record.name}</h1>
            <p className="mt-3 text-sm leading-6 text-[#9a9288]">{record.description || 'No description recorded yet.'}</p>
            <span className="mt-5 inline-flex rounded-full border border-[#6aa7a1]/30 bg-[#6aa7a1]/5 px-3 py-1 text-[11px] uppercase tracking-[.14em] text-[#87c0b9]">{record.status.replace('_', ' ')}</span>
          </div>

          <div className="mb-panel rounded-2xl p-6">
            <div className="mb-label">Physical information</div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Info icon={Scale} label="Weight" value={record.weight != null ? `${record.weight} g` : 'Not recorded'} />
              <Info icon={Ruler} label="Dimensions" value={[record.length_mm, record.width_mm, record.height_mm].every((v) => v != null) ? `${record.length_mm} × ${record.width_mm} × ${record.height_mm} mm` : 'Partial / unknown'} />
              <Info icon={MapPin} label="Origin" value={record.origin || 'Not recorded'} />
              <Info icon={CalendarDays} label="Acquired" value={record.acquired_date || 'Not recorded'} />
            </div>
          </div>

          <div className="mb-panel rounded-2xl p-6">
            <div className="mb-label">Model record</div>
            {latestModel ? <div className="mt-5 space-y-3 text-sm"><Row label="Version" value={`v${latestModel.version}`} /><Row label="Format" value={latestModel.file_format.toUpperCase()} /><Row label="Engine" value={latestModel.processing_engine} /><Row label="Engine version" value={latestModel.processing_version || 'Not recorded'} /><Row label="Polygons" value={latestModel.polygon_count ? latestModel.polygon_count.toLocaleString() : 'Not recorded'} /></div> : <p className="mt-4 text-sm leading-6 text-[#9a9288]">No processed model is attached yet.</p>}
          </div>
        </aside>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="mb-panel rounded-2xl p-6 md:p-8">
          <div className="mb-label">Original photographic evidence</div>
          <h2 className="mt-2 text-2xl font-medium">Capture set</h2>
          <p className="mt-2 text-sm leading-6 text-[#9a9288]">The source images remain part of the Digital Twin record. The mesh can be regenerated; the evidence should not disappear.</p>
          {images.length ? <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">{images.map(({ image, url }) => url ? <a key={image.id} href={url} target="_blank" rel="noreferrer" className="group aspect-square overflow-hidden rounded-lg border border-white/10 bg-black"><img src={url} alt={image.file_name} className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" /></a> : null)}</div> : <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-[#6f675f]">No capture images available.</div>}
        </div>

        <div className="mb-panel rounded-2xl p-6 md:p-8">
          <div className="mb-label">Provenance</div>
          <h2 className="mt-2 text-2xl font-medium">Object timeline</h2>
          <div className="mt-7 space-y-6">
            {(provenance as ProvenanceEvent[] || []).length ? (provenance as ProvenanceEvent[]).map((event) => <div key={event.id} className="relative pl-7"><span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border border-[#c9a66b] bg-[#0a0a0a]" /><div className="text-sm font-medium">{event.event_type}</div><div className="mt-1 text-xs text-[#9a9288]">{event.date || 'Date not recorded'}{event.location ? ` · ${event.location}` : ''}</div><p className="mt-2 text-sm leading-6 text-[#bdb4aa]">{event.description}</p></div>) : <div className="rounded-xl border border-dashed border-white/10 p-8 text-center"><FileImage size={18} className="mx-auto text-[#6f675f]" /><p className="mt-3 text-sm text-[#6f675f]">Provenance events will appear here as the object history grows.</p></div>}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.015] p-6">
        <div className="flex items-start gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#c9a66b]/5"><Gem size={17} className="text-[#c9a66b]" /></div><div><div className="mb-label">Identity principle</div><p className="mt-2 text-sm leading-7 text-[#cfc7bd]">This record is not just a 3D asset. It links the physical stone, its source capture, its processed representation and its provenance in one persistent object identity.</p></div></div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Camera; label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-[#141210]/60 p-4"><div className="flex items-center gap-2 text-[#9a9288]"><Icon size={14} /> <span className="text-[10px] uppercase tracking-[.13em]">{label}</span></div><div className="mt-3 text-sm font-medium text-[#f2f0eb]">{value}</div></div>;
}

function Info({ icon: Icon, label, value }: { icon: typeof Scale; label: string; value: string }) {
  return <div><div className="flex items-center gap-2 text-[#6f675f]"><Icon size={13} /> <span className="text-[10px] uppercase tracking-[.12em]">{label}</span></div><div className="mt-1 text-sm leading-5 text-[#d1c8bd]">{value}</div></div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-5 border-b border-white/5 pb-3 last:border-0 last:pb-0"><span className="text-[#6f675f]">{label}</span><span className="text-right text-[#d1c8bd]">{value}</span></div>;
}
