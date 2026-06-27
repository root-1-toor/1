'use client';

import { EqBand } from '@/types';
import { useRef } from 'react';

interface EqProps {
  bands: EqBand[];
  enabled: boolean;
  onToggleEnabled: () => void;
  onBandChange: (index: number, gain: number) => void;
  onClose: () => void;
}

export function EqWindow({ bands, enabled, onToggleEnabled, onBandChange, onClose }: EqProps) {
  const dragging = useRef<{ index: number; startY: number; startGain: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    dragging.current = { index, startY: e.clientY, startGain: bands[index].gain };
    const onMove = (me: MouseEvent) => {
      if (!dragging.current) return;
      const delta = (dragging.current.startY - me.clientY) / 3;
      const gain = Math.max(-12, Math.min(12, dragging.current.startGain + delta));
      onBandChange(dragging.current.index, gain);
    };
    const onUp = () => {
      dragging.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const knobTop = (gain: number) => {
    // gain: -12..+12 → top: 52..0px (center at 26px)
    const pct = (12 - gain) / 24;
    return Math.round(pct * 52);
  };

  return (
    <div className="wa-window" role="region" aria-label="Equalizer">
      <div className="wa-titlebar">
        <span className="wa-title-text">WINAMP EQUALIZER</span>
        <div className="wa-winbtns">
          <button className="wa-winbtn" onClick={onClose} aria-label="Close EQ">×</button>
        </div>
      </div>

      <div className="wa-eq-toggles">
        <button className={`wa-eq-toggle ${enabled ? 'on' : ''}`} onClick={onToggleEnabled}>EQ</button>
        <button className="wa-eq-toggle">AUTO</button>
        <button className="wa-eq-toggle">PRESETS</button>
      </div>

      <div className="wa-eq-body">
        {bands.map((band, i) => (
          <div key={i} className="wa-eq-col">
            <div
              className="wa-eq-track"
              onMouseDown={e => handleMouseDown(e, i)}
              title={`${band.label}: ${band.gain > 0 ? '+' : ''}${band.gain.toFixed(0)} dB`}
            >
              <div className="wa-eq-knob" style={{ top: `${knobTop(band.gain)}px` }} />
            </div>
            <span className="wa-eq-band-label">{band.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
