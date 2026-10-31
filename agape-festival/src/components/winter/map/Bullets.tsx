export interface SubwayLine {
  line: string;
  color: string;
  textColor: string;
}

/** The MTA route bullets (their real colours: wayfinding, not decoration). */
export function Bullets({ lines }: { lines: SubwayLine[] }) {
  return (
    <span className="gh-bullets">
      {lines.map((l) => (
        <span key={l.line} className="gh-bullet" style={{ backgroundColor: l.color, color: l.textColor }} role="img" aria-label={`${l.line} train`}>
          {l.line}
        </span>
      ))}
    </span>
  );
}
