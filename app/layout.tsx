import type { Metadata } from 'next';
import './globals.css';
import { Shell } from '@/components/layout/shell';

export const metadata: Metadata = {
  title: 'Mooka Boys Digital Twin',
  description: 'A working digital twin system for Andamooka matrix opal.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
