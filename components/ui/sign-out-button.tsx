'use client';

import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <button onClick={signOut} title="Sign out" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-[#9a9288] hover:bg-white/5 hover:text-white">
      <LogOut size={15} />
    </button>
  );
}
