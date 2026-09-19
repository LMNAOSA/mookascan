export type StoneStatus = 'draft' | 'captured' | 'processing' | 'ready' | 'archived';

export type ProcessingStatus = 'not_processed' | 'processing' | 'processed' | 'failed';

export type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  role: 'admin' | 'user';
  created_at: string;
};

export type Stone = {
  id: string;
  digital_twin_id: string;
  name: string;
  stone_reference: string | null;
  description: string | null;
  status: StoneStatus;
  weight: number | null;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  origin: string | null;
  location: string | null;
  acquired_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CaptureSession = {
  id: string;
  stone_id: string;
  capture_date: string;
  captured_by: string;
  device: string | null;
  notes: string | null;
  image_count: number;
  processing_status: ProcessingStatus;
  created_at: string;
};

export type CaptureImage = {
  id: string;
  capture_session_id: string;
  file_path: string;
  file_name: string;
  sequence: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type StoneModel = {
  id: string;
  stone_id: string;
  capture_session_id: string | null;
  version: number;
  file_path: string;
  file_format: string;
  processing_engine: string;
  processing_version: string | null;
  texture_file_path: string | null;
  polygon_count: number | null;
  created_at: string;
};

export type ProvenanceEvent = {
  id: string;
  stone_id: string;
  event_type: string;
  description: string;
  location: string | null;
  person: string | null;
  date: string | null;
  source: string | null;
  created_at: string;
};
