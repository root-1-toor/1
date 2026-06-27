import type { Metadata } from 'next';
import './winamp.css';

export const metadata: Metadata = {
  title: 'Winamp',
  description: 'Classic Winamp media player',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
