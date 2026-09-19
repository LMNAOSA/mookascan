'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createStoneAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'You are not signed in.' };

  const name = String(formData.get('name') || '').trim();
  if (!name) return { ok: false as const, error: 'Stone name is required.' };

  const payload = {
    name,
    stone_reference: String(formData.get('stone_reference') || '').trim() || null,
    description: String(formData.get('description') || '').trim() || null,
    origin: String(formData.get('origin') || '').trim() || null,
    location: String(formData.get('location') || '').trim() || null,
    acquired_date: String(formData.get('acquired_date') || '').trim() || null,
    weight: numberOrNull(formData.get('weight')),
    length_mm: numberOrNull(formData.get('length_mm')),
    width_mm: numberOrNull(formData.get('width_mm')),
    height_mm: numberOrNull(formData.get('height_mm')),
    created_by: user.id,
    status: 'draft',
  };

  const { data: stone, error } = await supabase.from('stones').insert(payload).select('*').single();
  if (error || !stone) return { ok: false as const, error: error?.message || 'Could not create the stone.' };

  const { data: captureSession, error: captureError } = await supabase.from('capture_sessions').insert({
    stone_id: stone.id,
    captured_by: user.id,
    device: String(formData.get('device') || '').trim() || null,
    notes: String(formData.get('capture_notes') || '').trim() || null,
    processing_status: 'not_processed',
    image_count: 0,
  });

  if (captureError) return { ok: false as const, error: captureError.message };

  revalidatePath('/dashboard');
  return { ok: true as const, stoneId: stone.id, digitalTwinId: stone.digital_twin_id, captureSessionId: captureSession?.id ?? null };
}

function numberOrNull(value: FormDataEntryValue | null) {
  if (value == null || String(value).trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
