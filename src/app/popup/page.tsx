import type { Metadata } from 'next';
import '../winamp.css';
import { PopupPlayer } from '@/components/PopupPlayer';

export const metadata: Metadata = {
  title: 'Winamp',
};

export default function PopupPage() {
  return <PopupPlayer />;
}
