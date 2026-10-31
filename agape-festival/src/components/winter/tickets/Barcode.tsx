/**
 * Decorative barcode, seeded from the DICE event id so it is stable between
 * server and client renders. It encodes nothing; the stub's text carries the id.
 */
export function Barcode({ seed, className }: { seed: string; className?: string }) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const rnd = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };

  const bars: [number, number][] = [];
  let x = 0;
  const push = (w: number, gap: number) => {
    bars.push([x, w]);
    x += w + gap;
  };
  // Guard bars, a seeded body, guard bars.
  push(1, 1);
  push(1, 2);
  for (let i = 0; i < 44; i++) push(1 + Math.floor(rnd() * 3), 1 + Math.floor(rnd() * 2));
  push(1, 1);
  push(1, 0);

  return (
    <svg className={className} viewBox={`0 0 ${x} 10`} preserveAspectRatio="none" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
      {bars.map(([bx, w]) => (
        <rect key={bx} x={bx} y={0} width={w} height={10} />
      ))}
    </svg>
  );
}
