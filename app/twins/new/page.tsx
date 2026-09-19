import { NewTwinForm } from '@/components/twins/new-twin-form';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewTwinPage() {
  return (
    <div className="max-w-5xl pb-14">
      <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm text-[#9a9288] hover:text-white"><ChevronLeft size={15} /> Back to Digital Twins</Link>
      <div className="mb-10">
        <div className="mb-label">Create</div>
        <h1 className="mb-display mt-3 text-4xl md:text-5xl">Create a Digital Twin.</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#9a9288]">Start with the physical object. We will preserve the source capture first, then attach the 3D reconstruction.</p>
      </div>
      <NewTwinForm />
    </div>
  );
}
