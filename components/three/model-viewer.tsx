'use client';

import { Canvas } from '@react-three/fiber';
import { Center, Environment, OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} />;
}

function ViewerScene({ url }: { url: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 40 }} dpr={[1, 2]}>
      <color attach="background" args={['#11100e']} />
      <ambientLight intensity={0.8} />
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.55} adjustCamera={false} shadows={false}>
          <Center>
            <Model url={url} />
          </Center>
        </Stage>
        <Environment preset="studio" />
      </Suspense>
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={0.55} maxDistance={8} />
      <gridHelper args={[5, 16, new THREE.Color('#302b25'), new THREE.Color('#171411')]} position={[0, -0.72, 0]} />
    </Canvas>
  );
}

export function ModelViewer({ url }: { url: string }) {
  return (
    <div className="relative h-[58vh] min-h-[430px] overflow-hidden rounded-2xl border border-white/10 bg-[#11100e]">
      <ViewerScene url={url} />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[.16em] text-[#a49b91] backdrop-blur">Drag to rotate · wheel / pinch to zoom</div>
    </div>
  );
}

