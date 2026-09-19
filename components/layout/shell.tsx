'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gem, LayoutDashboard, UsersRound, Plus, LogIn } from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Digital Twins', icon: LayoutDashboard },
  { href: '/project', label: 'Project', icon: UsersRound },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith('/login');

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {!isLogin && (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[#c9a66b]/50 bg-[#141210]">
                <Gem size={16} className="text-[#c9a66b]" />
              </span>
              <div>
                <div className="text-sm font-semibold tracking-[0.08em] text-[#f2f0eb]">MOOKA BOYS</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#9a9288]">Digital Twin Lab</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                      active ? 'bg-white/10 text-white' : 'text-[#9a9288] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
              <Link href="/twins/new" className="ml-2 flex items-center gap-2 rounded-full bg-[#c9a66b] px-4 py-2 text-sm font-semibold text-[#0a0a0a] hover:bg-[#d8b77f]">
                <Plus size={15} />
                New Digital Twin
              </Link>
            </nav>

            <div className="md:hidden">
              <Link href="/twins/new" className="grid h-9 w-9 place-items-center rounded-full bg-[#c9a66b] text-[#0a0a0a]">
                <Plus size={16} />
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className={isLogin ? '' : 'mx-auto max-w-[1500px] px-5 py-8 md:px-8'}>{children}</main>
    </div>
  );
}
