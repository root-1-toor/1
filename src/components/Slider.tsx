'use client';

import { useRef } from 'react';

interface SliderProps {
  value: number;         // 0–100
  onChange: (v: number) => void;
  fillClass?: string;
  label?: string;
}

export function Slider({ value, onChange, fillClass = 'green', label }: SliderProps) {
  const ref = useRef<HTMLDivElement>(null);

  const calcPct = (clientX: number) => {
    if (!ref.current) return 0;
    const rect = ref.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleClick = (e: React.MouseEvent) => {
    onChange(Math.round(calcPct(e.clientX) * 100));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const move = (me: MouseEvent) => onChange(Math.round(calcPct(me.clientX) * 100));
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div
      ref={ref}
      className="wa-vol-slider"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      role="slider"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`wa-vol-fill ${fillClass}`} style={{ width: `${value}%` }}>
        <div className="wa-vol-thumb" />
      </div>
    </div>
  );
}
