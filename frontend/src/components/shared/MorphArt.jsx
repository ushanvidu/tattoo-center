const MOTIFS = [
  "M50 18 C58 26 58 38 50 46 C42 38 42 26 50 18 Z M50 22 C44 30 44 40 50 50 C56 40 56 30 50 22 M30 40 C40 38 48 44 50 54 C40 56 32 50 30 40 Z M70 40 C60 38 52 44 50 54 C60 56 68 50 70 40 Z M50 52 C50 64 44 72 36 78 M50 52 C50 64 56 72 64 78 M50 54 L50 84",
  "M50 14 L62 38 L50 50 L38 38 Z M50 50 L74 50 L62 74 L50 62 Z M50 50 L50 86 M50 50 L26 50 L38 74 L50 62 M30 30 L50 50 M70 30 L50 50 M50 50 L34 70 M50 50 L66 70",
  "M26 26 C44 20 44 44 26 50 C44 56 44 80 62 74 M62 74 C78 70 78 46 62 40 C50 36 50 24 62 22 M40 38 a3 3 0 1 0 .1 0 M58 60 a3 3 0 1 0 .1 0",
  "M50 22 L50 82 M50 30 C36 30 22 40 16 56 C30 52 42 56 50 64 M50 30 C64 30 78 40 84 56 C70 52 58 56 50 64 M50 46 C40 46 32 52 28 62 M50 46 C60 46 68 52 72 62",
];

export default function MorphArt({ seed = 0, tone = '#1a1a21' }) {
  const d = MOTIFS[seed % MOTIFS.length];
  const gid = `g${seed}`;
  return (
    <div className="morph">
      <div className="pane pane-art ph" style={{ background: `radial-gradient(130% 110% at 30% 10%, ${tone}, #0a0a0d 70%)` }}>
        <span className="stage">01 · Artwork</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff5db0"/>
              <stop offset=".5" stopColor="#7c5cff"/>
              <stop offset="1" stopColor="#00e0c6"/>
            </linearGradient>
          </defs>
          <path d={d} fill="none" stroke={`url(#${gid})`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity=".95"/>
          <path d={d} fill={`url(#${gid})`} opacity=".14"/>
        </svg>
      </div>
      <div className="pane pane-sten" style={{ background: '#0b0b0e' }}>
        <span className="stage">02 · Stencil</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <path d={d} fill="none" stroke="#00e0c6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 4px rgba(0,224,198,.7))' }}/>
        </svg>
      </div>
      <div className="pane pane-tat" style={{ background: 'linear-gradient(150deg,#c79b82,#a9755a 70%)' }}>
        <span className="stage">03 · On skin</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <path d={d} fill="none" stroke="rgba(26,16,16,.86)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
