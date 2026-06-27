'use client';

interface VizProps {
  data: number[];
}

export function Visualizer({ data }: VizProps) {
  return (
    <div className="wa-viz" aria-hidden="true">
      {data.map((h, i) => (
        <div key={i} className="wa-viz-bar" style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}
