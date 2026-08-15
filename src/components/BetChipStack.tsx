import React from 'react';

// Maps a bet amount to the highest-value chip that fits
const CHIP_DEFS = [
  { value: 1000, ring: '#C89211', center: '#886207' },
  { value: 500,  ring: '#6A35C9', center: '#48208f' },
  { value: 100,  ring: '#242424', center: '#141414' },
  { value: 25,   ring: '#2E9F52', center: '#1c6a34' },
  { value: 5,    ring: '#D32F2F', center: '#911b1b' },
  { value: 2,    ring: '#E86CB5', center: '#b14681' },
  { value: 1,    ring: '#5a5a5a', center: '#383838' },
];

function getChipColor(amount: number) {
  for (const c of CHIP_DEFS) {
    if (amount >= c.value) return c;
  }
  return CHIP_DEFS[CHIP_DEFS.length - 1]!;
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildInsertPath(cx: number, cy: number, outerR: number, innerR: number, centerAngle: number, halfSpanDeg: number): string {
  const a1 = centerAngle - halfSpanDeg;
  const a2 = centerAngle + halfSpanDeg;
  const o1 = polarToXY(cx, cy, outerR, a1);
  const o2 = polarToXY(cx, cy, outerR, a2);
  const i2 = polarToXY(cx, cy, innerR, a2);
  const i1 = polarToXY(cx, cy, innerR, a1);
  return `M ${o1.x.toFixed(2)} ${o1.y.toFixed(2)} A ${outerR} ${outerR} 0 0 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)} L ${i2.x.toFixed(2)} ${i2.y.toFixed(2)} A ${innerR} ${innerR} 0 0 0 ${i1.x.toFixed(2)} ${i1.y.toFixed(2)} Z`;
}

interface MiniChipSVGProps {
  amount: number;
  size: number;
}

function MiniChipSVG({ amount, size }: MiniChipSVGProps) {
  const chip = getChipColor(amount);
  const cx = size / 2;
  const cy = size / 2;
  const s = size / 56;
  const outerR = cx - 1.5 * s;
  const centerR = size * 0.33;
  const ringThickness = outerR - centerR;
  const insertOuterR = outerR;
  const insertInnerR = outerR - ringThickness * 0.87;

  const label = amount >= 1000 ? (amount / 1000).toFixed(0) + 'K' : String(amount);
  const fontSize = label.length >= 3 ? 11 * s : label.length === 2 ? 13 * s : 15 * s;

  const inserts = Array.from({ length: 8 }, (_, i) => (
    <path
      key={i}
      d={buildInsertPath(cx, cy, insertOuterR, insertInnerR, i * 45, 7.5)}
      fill="#FFFFFF"
      opacity={0.9}
    />
  ));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <circle cx={cx} cy={cy} r={outerR} fill={chip.ring} />
      {inserts}
      <circle cx={cx} cy={cy} r={centerR} fill={chip.center} />
      <circle cx={cx} cy={cy} r={centerR} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={0.6 * s} />
      <text
        x={cx} y={cy + 0.5 * s}
        textAnchor="middle" dominantBaseline="central"
        fill="#ffffff" fontSize={fontSize}
        fontFamily="Arial, sans-serif" fontWeight="700"
      >
        {label}
      </text>
    </svg>
  );
}

interface BetChipStackProps {
  amount: number;
  size?: number;       // chip size in px
  maxChips?: number;   // max chips to visually stack
}

// Renders a small stacked chip pile + amount label
const BetChipStack: React.FC<BetChipStackProps> = ({ amount, size = 32, maxChips = 4 }) => {
  if (amount <= 0) return null;

  // Simulate a stack of chips (up to maxChips), each offset slightly upward
  const visibleCount = Math.min(maxChips, Math.ceil(Math.log2(amount + 1)));
  const offsetY = 4; // px each chip shifts up

  return (
    <div className="flex flex-col items-center gap-0.5 pointer-events-none select-none">
      {/* Stacked chips — rendered bottom to top */}
      <div
        className="relative"
        style={{
          width: size,
          height: size + offsetY * (visibleCount - 1),
        }}
      >
        {Array.from({ length: visibleCount }, (_, i) => (
          <div
            key={i}
            className="absolute left-0"
            style={{
              bottom: i * offsetY,
              zIndex: i,
              filter: i < visibleCount - 1 ? 'brightness(0.6)' : 'none',
            }}
          >
            <MiniChipSVG amount={amount} size={size} />
          </div>
        ))}
      </div>
      {/* Amount label */}
      <span
        className="font-black text-white leading-none"
        style={{
          fontSize: size <= 28 ? 9 : 10,
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
          marginTop: 2,
        }}
      >
        ₱{amount >= 1000 ? `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K` : amount}
      </span>
    </div>
  );
};

export default BetChipStack;
