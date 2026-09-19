import { LoginForm } from '@/components/ui/login-form';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_.9fr] bg-[#0a0a0a]">
      <div className="hidden lg:flex relative overflow-hidden border-r border-white/10 p-14 flex-col justify-between">
        <div>
          <div className="mb-label">Mooka Boys / Digital Twin Lab</div>
          <h1 className="mb-display mt-6 max-w-3xl text-6xl leading-[.98] text-[#f2f0eb]">
            Give the stone a digital identity.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#9a9288]">
            Capture an Andamooka opal, preserve the evidence, reconstruct the object and carry its provenance forward.
          </p>
        </div>
        <div className="text-sm text-[#6f675f]">v0.1 · working internal prototype</div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="mb-label">Mooka Boys / Digital Twin Lab</div>
            <h1 className="mt-4 text-4xl font-medium tracking-tight">Give the stone a digital identity.</h1>
          </div>
          <LoginForm nextPath={params.next || '/dashboard'} />
        </div>
      </div>
    </div>
  );
}
