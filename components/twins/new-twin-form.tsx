'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, CircleHelp, FileUp, Loader2, Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createStoneAction } from '@/app/twins/new/actions';

const MAX_IMAGE_FILES = 150;
const MAX_IMAGE_SIZE = 30 * 1024 * 1024;
const MAX_MODEL_SIZE = 200 * 1024 * 1024;

export function NewTwinForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [stoneId, setStoneId] = useState<string | null>(null);
  const [digitalTwinId, setDigitalTwinId] = useState<string | null>(null);
  const [captureSessionId, setCaptureSessionId] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [engine, setEngine] = useState('RealityScan');
  const [processingVersion, setProcessingVersion] = useState('');
  const [polygonCount, setPolygonCount] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  const totalSize = useMemo(() => images.reduce((sum, file) => sum + file.size, 0), [images]);

  async function createStone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setError('');
    const formData = new FormData(event.currentTarget);
    const result = await createStoneAction(formData);
    if (!result.ok) {
      setError(result.error);
      setWorking(false);
      return;
    }
    setStoneId(result.stoneId);
    setDigitalTwinId(result.digitalTwinId);

    setCaptureSessionId(result.captureSessionId);
    setStep(2);
    setWorking(false);
  }

  function acceptImages(fileList: FileList | null) {
    if (!fileList) return;
    const incoming = Array.from(fileList);
    const invalid = incoming.find((file) => !file.type.startsWith('image/') || file.size > MAX_IMAGE_SIZE);
    if (invalid) {
      setError(`${invalid.name} is not a supported image or is larger than 30 MB.`);
      return;
    }
    setImages((current) => [...current, ...incoming].slice(0, MAX_IMAGE_FILES));
    setError('');
  }

  async function uploadCapture() {
    if (!stoneId || !captureSessionId) return;
    if (!images.length) {
      setError('Upload at least one capture image. For a useful reconstruction, aim for a dense multi-angle set.');
      return;
    }
    setWorking(true);
    setError('');
    const supabase = createClient();

    for (let i = 0; i < images.length; i += 1) {
      const file = images[i];
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const path = `${stoneId}/${captureSessionId}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from('original-captures').upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        setError(`Upload failed for ${file.name}: ${uploadError.message}`);
        setWorking(false);
        return;
      }
      const { error: rowError } = await supabase.from('capture_images').insert({
        capture_session_id: captureSessionId,
        file_path: path,
        file_name: file.name,
        sequence: i + 1,
        metadata: { type: file.type, size: file.size, lastModified: file.lastModified },
      });
      if (rowError) {
        setError(`Image record failed for ${file.name}: ${rowError.message}`);
        setWorking(false);
        return;
      }
    }

    await supabase.from('capture_sessions').update({ image_count: images.length, processing_status: 'not_processed' }).eq('id', captureSessionId);
    await supabase.from('stones').update({ status: 'captured' }).eq('id', stoneId);
    setStep(3);
    setWorking(false);
  }

  async function uploadModel() {
    if (!stoneId || !modelFile) {
      setError('Select a GLB file first.');
      return;
    }
    if (!modelFile.name.toLowerCase().endsWith('.glb')) {
      setError('Version 0.1 accepts GLB models only.');
      return;
    }
    if (modelFile.size > MAX_MODEL_SIZE) {
      setError('The GLB must be 200 MB or smaller.');
      return;
    }
    setWorking(true);
    setError('');
    const supabase = createClient();
    const modelPath = `${stoneId}/${crypto.randomUUID()}-${modelFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const { error: uploadError } = await supabase.storage.from('models').upload(modelPath, modelFile, { contentType: 'model/gltf-binary', upsert: false });
    if (uploadError) {
      setError(uploadError.message);
      setWorking(false);
      return;
    }
    const { data: existing } = await supabase.from('models').select('version').eq('stone_id', stoneId).order('version', { ascending: false }).limit(1);
    const version = (existing?.[0]?.version || 0) + 1;
    const { error: rowError } = await supabase.from('models').insert({
      stone_id: stoneId,
      capture_session_id: captureSessionId,
      version,
      file_path: modelPath,
      file_format: 'glb',
      processing_engine: engine,
      processing_version: processingVersion.trim() || null,
      polygon_count: polygonCount.trim() ? Number(polygonCount) : null,
    });
    if (rowError) {
      setError(rowError.message);
      setWorking(false);
      return;
    }
    const { error: stoneError } = await supabase.from('stones').update({ status: 'ready' }).eq('id', stoneId);
    if (stoneError) {
      setError(stoneError.message);
      setWorking(false);
      return;
    }
    setWorking(false);
    router.push(`/twins/${stoneId}`);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-7 grid grid-cols-3 gap-2">
        <Step step={1} active={step >= 1} current={step === 1} label="Identify" />
        <Step step={2} active={step >= 2} current={step === 2} label="Capture" />
        <Step step={3} active={step >= 3} current={step === 3} label="3D model" />
      </div>

      {digitalTwinId && <div className="mb-6 rounded-xl border border-[#c9a66b]/20 bg-[#c9a66b]/5 px-4 py-3 text-sm"><span className="text-[#9a9288]">Digital Twin:</span> <strong className="ml-2 text-[#c9a66b]">{digitalTwinId}</strong></div>}

      {step === 1 && (
        <form onSubmit={createStone} className="space-y-6">
          <Panel title="Physical object" eyebrow="Step 1">
            <div className="grid gap-5 md:grid-cols-2">
              <Field name="name" label="Stone name" placeholder="Andamooka Matrix" required />
              <Field name="stone_reference" label="Field / stock reference" placeholder="MB-MAT-001" />
              <Field name="origin" label="Origin" placeholder="Andamooka" />
              <Field name="location" label="Specific location" placeholder="Mine / field / claim" />
              <Field name="acquired_date" label="Acquired date" type="date" />
              <Field name="weight" label="Weight (g)" type="number" step="0.01" />
              <Field name="length_mm" label="Length (mm)" type="number" step="0.01" />
              <Field name="width_mm" label="Width (mm)" type="number" step="0.01" />
              <Field name="height_mm" label="Height (mm)" type="number" step="0.01" />
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-xs uppercase tracking-[.14em] text-[#9a9288]">Description</span>
              <textarea name="description" rows={4} placeholder="What is physically known about the stone at this point?" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#c9a66b]/60" />
            </label>
          </Panel>

          <Panel title="Capture session" eyebrow="Prepare the evidence">
            <div className="grid gap-5 md:grid-cols-2">
              <Field name="device" label="Capture device" placeholder="iPhone 17 Pro" />
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[.14em] text-[#9a9288]">Operator notes</span>
                <input name="capture_notes" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#c9a66b]/60" placeholder="Lighting / lens / setup notes" />
              </label>
            </div>
          </Panel>
          {error && <ErrorBox message={error} />}
          <button disabled={working} className="flex items-center gap-2 rounded-full bg-[#c9a66b] px-5 py-3 text-sm font-semibold text-[#0a0a0a] disabled:opacity-50">
            {working ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
            {working ? 'Creating…' : 'Create Digital Twin record'}
          </button>
        </form>
      )}

      {step === 2 && (
        <Panel title="Preserve the photographic evidence" eyebrow="Step 2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/5"><CircleHelp size={18} className="text-[#c9a66b]" /></div>
              <div>
                <h3 className="font-medium">Capture more than you think you need.</h3>
                <p className="mt-2 text-sm leading-6 text-[#9a9288]">The photographs are the evidence layer. The first 3D reconstruction can be replaced; the source capture should remain intact.</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-3 text-sm text-[#c4bdb4] md:grid-cols-2">
              {['Top / bottom / all sides covered', 'Sharp frames with no major motion blur', 'Consistent lighting where practical', 'Avoid harsh glare and clipped highlights', 'Keep the stone stationary while circling', 'Include a few close detail images'].map((item) => <li key={item} className="flex items-start gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#6aa7a1]" />{item}</li>)}
            </ul>
          </div>

          <label className="mt-6 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 p-8 text-center hover:border-[#c9a66b]/50 hover:bg-white/[.02]">
            <Upload size={24} className="text-[#c9a66b]" />
            <span className="mt-4 text-sm font-medium">Choose capture images</span>
            <span className="mt-2 text-xs leading-5 text-[#9a9288]">JPG, PNG, HEIC or other browser-supported images · up to 150 files</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => acceptImages(e.target.files)} />
          </label>

          {images.length > 0 && (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-4 text-sm"><span>{images.length} images selected</span><span className="text-[#9a9288]">{formatBytes(totalSize)}</span></div>
              <div className="mt-4 max-h-48 overflow-auto space-y-2">{images.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-white/[.025] px-3 py-2 text-xs"><span className="flex min-w-0 items-center gap-2"><FileUp size={13} className="shrink-0 text-[#9a9288]" /><span className="truncate">{file.name}</span></span><button type="button" onClick={() => setImages((list) => list.filter((_, i) => i !== index))} className="text-[#9a9288] hover:text-white"><X size={14} /></button></div>)}</div>
            </div>
          )}

          {error && <ErrorBox message={error} />}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setStep(1)} className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-[#bdb4aa] hover:bg-white/5">Back</button>
            <button type="button" onClick={uploadCapture} disabled={working} className="flex items-center gap-2 rounded-full bg-[#c9a66b] px-5 py-3 text-sm font-semibold text-[#0a0a0a] disabled:opacity-50">
              {working ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {working ? 'Preserving capture…' : 'Store original evidence'}
            </button>
          </div>
        </Panel>
      )}

      {step === 3 && (
        <Panel title="Attach the 3D reconstruction" eyebrow="Step 3">
          <div className="rounded-2xl border border-[#c9a66b]/20 bg-[#c9a66b]/5 p-5">
            <div className="mb-label text-[#c9a66b]">No fake processing</div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#cfc7bd]">Photogrammetry is intentionally kept outside the app in v0.1. Process the preserved source images in RealityScan, AliceVision / Meshroom, COLMAP or another verified pipeline, then upload the resulting GLB here.</p>
          </div>

          <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 p-8 text-center hover:border-[#c9a66b]/50">
            <FileUp size={24} className="text-[#c9a66b]" />
            <span className="mt-4 text-sm font-medium">Choose GLB model</span>
            <span className="mt-2 text-xs text-[#9a9288]">GLB only · up to 200 MB</span>
            <input type="file" accept=".glb,model/gltf-binary" className="hidden" onChange={(e) => setModelFile(e.target.files?.[0] || null)} />
          </label>

          {modelFile && <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm"><div className="flex items-center gap-2"><FileUp size={14} className="text-[#c9a66b]" /><span className="truncate">{modelFile.name}</span><span className="ml-auto text-[#9a9288]">{formatBytes(modelFile.size)}</span></div></div>}

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <label className="block md:col-span-1"><span className="mb-2 block text-xs uppercase tracking-[.14em] text-[#9a9288]">Processing engine</span><select value={engine} onChange={(e) => setEngine(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#141210] px-4 py-3 text-sm text-white outline-none focus:border-[#c9a66b]/60">{['RealityScan','AliceVision','Meshroom','COLMAP','Other'].map((option) => <option key={option}>{option}</option>)}</select></label>
            <FieldValue label="Engine version" value={processingVersion} onChange={setProcessingVersion} placeholder="Optional" />
            <FieldValue label="Polygon count" value={polygonCount} onChange={setPolygonCount} placeholder="Optional" />
          </div>

          {error && <ErrorBox message={error} />}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setStep(2)} className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-[#bdb4aa] hover:bg-white/5">Back</button>
            <button type="button" onClick={uploadModel} disabled={working} className="flex items-center gap-2 rounded-full bg-[#c9a66b] px-5 py-3 text-sm font-semibold text-[#0a0a0a] disabled:opacity-50">
              {working ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {working ? 'Building twin…' : 'Create Digital Twin'}
            </button>
          </div>
        </Panel>
      )}
    </div>
  );
}

function Step({ step, active, current, label }: { step: number; active: boolean; current: boolean; label: string }) {
  return <div className={`rounded-xl border px-4 py-3 ${current ? 'border-[#c9a66b]/50 bg-[#c9a66b]/5' : active ? 'border-white/10 bg-white/[.025]' : 'border-white/5 bg-transparent'}`}><div className="flex items-center gap-3"><span className={`grid h-7 w-7 place-items-center rounded-full border text-xs ${current ? 'border-[#c9a66b] text-[#c9a66b]' : active ? 'border-white/15 text-[#f2f0eb]' : 'border-white/10 text-[#6f675f]'}`}>{step}</span><span className={`text-sm ${current ? 'text-white' : 'text-[#9a9288]'}`}>{label}</span></div></div>;
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="mb-panel rounded-2xl p-6 md:p-8"><div className="mb-label text-[#c9a66b]">{eyebrow}</div><h2 className="mt-2 text-xl font-medium">{title}</h2>{children}</section>;
}

function Field({ name, label, placeholder, required, type = 'text', step }: { name: string; label: string; placeholder?: string; required?: boolean; type?: string; step?: string }) {
  return <label className="block"><span className="mb-2 block text-xs uppercase tracking-[.14em] text-[#9a9288]">{label}</span><input name={name} type={type} step={step} required={required} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#c9a66b]/60" /></label>;
}

function FieldValue({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-xs uppercase tracking-[.14em] text-[#9a9288]">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#c9a66b]/60" /></label>;
}

function ErrorBox({ message }: { message: string }) {
  return <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm leading-6 text-red-200">{message}</div>;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
