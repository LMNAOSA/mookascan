export type PhotogrammetryEngine = 'RealityScan' | 'AliceVision' | 'Meshroom' | 'COLMAP' | 'Other';

export type ProcessingJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface PhotogrammetryProcessor {
  readonly engine: string;
  submit(input: { captureSessionId: string; imagePaths: string[] }): Promise<{ jobId: string }>;
  getStatus(jobId: string): Promise<ProcessingJobStatus>;
}

/**
 * v0.1 processor boundary. There is deliberately no fake processing here.
 * A future adapter can submit the preserved source-image set to a real engine.
 */
export class ManualModelUploadProcessor {
  readonly engine = 'ManualModelUpload';
}
