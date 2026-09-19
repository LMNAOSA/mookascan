'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, Loader2 } from 'lucide-react';

export function LoginForm({ nextPath }: { nextPath: string }) {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    window.location.href = nextPath;
  }

  return (
    <form onSubmit={onSubmit} className="mb-panel rounded-2xl p-7 md:p-8">
      <div className="mb-label">Secure sign in</div>
      <h2 className="mt-3 text-2xl font-medium">Digital Twin Lab</h2>
      <p className="mt-2 text-sm leading-6 text-[#9a9288]">Use your Mooka Boys team account.</p>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[.14em] text-[#9a9288]">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#c9a66b]/70" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[.14em] text-[#9a9288]">Password</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#c9a66b]/70" />
        </label>
      </div>

      {error && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">{error}</div>}

      <button disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c9a66b] px-4 py-3 font-semibold text-[#0a0a0a] transition hover:bg-[#d8b77f] disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <Loader2 size={17} className="animate-spin" /> : <ArrowRight size={17} />}
        {loading ? 'Signing in…' : 'Enter Digital Twin Lab'}
      </button>
    </form>
  );
}
