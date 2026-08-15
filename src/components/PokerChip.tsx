import React, { useMemo } from 'react';

// ─── Flat Baccarat Chip Colors ────────────────────────────────────────────────
const COLORS: Record<number, { ring: string; center: string; label: string }> = {
  1:    { ring: '#5a5a5a', center: '#383838', label: '#ffffff' },
  2:    { ring: '#E86CB5', center: '#b14681', label: '#ffffff' },
  5:    { ring: '#D32F2F', center: '#911b1b', label: '#ffffff' },
  25:   { ring: '#2E9F52', center: '#1c6a34', label: '#ffffff' },
  100:  { ring: '#242424', center: '#141414', label: '#ffffff' },
  500:  { ring: '#6A35C9', center: '#48208f', label: '#ffffff' },
  1000: { ring: '#C89211', center: '#886207', label: '#ffffff' },
};

const FALLBACK = { ring: '#5a5a5a', center: '#383838', label: '#ffffff' };

interface PokerChipProps {
  value: number;
  label: string;
  isSelected?: boolean;
  size?: number;
  disabled?: boolean;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
  draggable?: boolean;
  className?: string;
}

// ─── Polar to Cartesian helper ─────────────────────────────────────────────────
function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  // 0° = top of circle
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// ─── Build one arc-trapezoid insert path ──────────────────────────────────────
// Creates a shape bounded by: outer arc, two radial lines, inner arc.
// This is wider at the outer edge and narrower at the inner edge — matching
// the trapezoidal insert shape seen on real casino chips.
function buildInsertPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  centerAngle: number, halfSpanDeg: number
): string {
  const a1 = centerAngle - halfSpanDeg;
  const a2 = centerAngle + halfSpanDeg;

  const o1 = polarToXY(cx, cy, outerR, a1); // outer start
  const o2 = polarToXY(cx, cy, outerR, a2); // outer end
  const i2 = polarToXY(cx, cy, innerR, a2); // inner end
  const i1 = polarToXY(cx, cy, innerR, a1); // inner start

  const largeArc = halfSpanDeg * 2 >= 180 ? 1 : 0;

  return [
    `M ${o1.x.toFixed(3)} ${o1.y.toFixed(3)}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x.toFixed(3)} ${o2.y.toFixed(3)}`,
    `L ${i2.x.toFixed(3)} ${i2.y.toFixed(3)}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i1.x.toFixed(3)} ${i1.y.toFixed(3)}`,
    `Z`,
  ].join(' ');
}

// ─── Build all 8 inserts ──────────────────────────────────────────────────────
function buildInserts(
  cx: number, cy: number,
  outerR: number, innerR: number,
  count: number, halfSpanDeg: number
): JSX.Element[] {
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => (
    <path
      key={i}
      d={buildInsertPath(cx, cy, outerR, innerR, i * step, halfSpanDeg)}
      fill="#FFFFFF"
      opacity={0.93}
    />
  ));
}

// ─── PokerChip Component ──────────────────────────────────────────────────────
const PokerChip: React.FC<PokerChipProps> = ({
  value,
  label,
  isSelected = false,
  size = 56,
  disabled = false,
  onClick,
  onDragStart,
  draggable = false,
  className = '',
}) => {
  const pal = COLORS[value] ?? FALLBACK;
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 56;

  // Outer radius — leaves 1.5px gap for selection ring rendering
  const outerRadius = cx - 1.5 * scale;

  // Center circle: 66% of chip diameter
  const centerRadius = size * 0.33;

  // Insert geometry:
  //   - Sits in the outer ring (between centerRadius and outerRadius)
  //   - Radially reduced by 13% (height = 87% of ring thickness)
  const ringThickness = outerRadius - centerRadius;
  const insertOuterR = outerRadius;
  const insertInnerR = outerRadius - ringThickness * 0.87;

  // 8 inserts at 45° spacing; each insert spans ±7.5° (15° total arc width)
  // → leaves 30° of colored ring between inserts for clear separation
  const INSERT_COUNT = 8;
  const INSERT_HALF_SPAN = 7.5;

  const inserts = useMemo(
    () => buildInserts(cx, cy, insertOuterR, insertInnerR, INSERT_COUNT, INSERT_HALF_SPAN),
    [cx, cy, insertOuterR, insertInnerR]
  );

  const fontSize =
    label.length >= 4 ? 13.5 * scale :
    label.length === 3 ? 15.5 * scale :
                         18.5 * scale;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onDragStart={onDragStart}
      draggable={draggable && !disabled}
      disabled={disabled}
      className={`relative flex-shrink-0 select-none cursor-grab active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none ${className}`}
      style={{ width: size, height: size, background: 'none', border: 'none', padding: 0 }}
      title={`₱${label}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Outer Ring (Solid Color) ── */}
        <circle cx={cx} cy={cy} r={outerRadius} fill={pal.ring} />

        {/* ── Arc-Trapezoid Inserts ── */}
        {inserts}

        {/* ── Center Circle (slightly darker solid shade of ring color) ── */}
        <circle cx={cx} cy={cy} r={centerRadius} fill={pal.center} />

        {/* ── Thin boundary line between ring and center ── */}
        <circle
          cx={cx} cy={cy} r={centerRadius}
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={0.6 * scale}
        />

        {/* ── Denomination Text ── */}
        <text
          x={cx}
          y={cy + 0.5 * scale}
          textAnchor="middle"
          dominantBaseline="central"
          fill={pal.label}
          fontSize={fontSize}
          fontFamily="Arial, sans-serif"
          fontWeight="700"
          letterSpacing="-0.01em"
        >
          {label}
        </text>

        {/* ── Selected: Gold double ring ── */}
        {isSelected && (
          <>
            <circle
              cx={cx} cy={cy}
              r={cx - 0.8 * scale}
              fill="none"
              stroke="#F5BA15"
              strokeWidth={2 * scale}
            />
            <circle
              cx={cx} cy={cy}
              r={outerRadius - 1.5 * scale}
              fill="none"
              stroke="#F5BA15"
              strokeWidth={0.7 * scale}
              opacity={0.75}
            />
          </>
        )}
      </svg>

      {/* ── Selected: Gold indicator bar above chip ── */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.33,
            height: 3,
            borderRadius: 2,
            background: '#F5BA15',
          }}
        />
      )}
    </button>
  );
};

export default PokerChip;
