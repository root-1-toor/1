'use client';

import { useEffect } from 'react';
import { WinampPlayer } from '@/components/WinampPlayer';

export default function Home() {
  useEffect(() => {
    document.body.classList.add('wa-browser');
    return () => document.body.classList.remove('wa-browser');
  }, []);

  return <WinampPlayer />;
}
