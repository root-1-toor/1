'use client';

import { useEffect } from 'react';
import { WinampPlayer } from './WinampPlayer';

export function PopupPlayer() {
  useEffect(() => {
    document.body.classList.add('wa-popup');
    return () => document.body.classList.remove('wa-popup');
  }, []);

  return <WinampPlayer />;
}
