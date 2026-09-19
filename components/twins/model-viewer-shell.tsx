'use client';

import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('@/components/three/model-viewer').then((mod) => mod.ModelViewer), {
  ssr: false,
  loading: () => <div className="h-[58vh] min-h-[430px] animate-pulse rounded-2xl border border-white/10 bg-[#11100e]" />,
});

export function ModelViewerShell({ url }: { url: string }) {
  return <ModelViewer url={url} />;
}
