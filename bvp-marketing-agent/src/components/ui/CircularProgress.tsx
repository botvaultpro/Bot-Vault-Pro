interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  color = '#F97316',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const offset = circumference - (clampedValue / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#2A2A2A"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-heading font-bold text-[#F5F5F5] leading-none"
            style={{ fontSize: size * 0.2 }}
          >
            {Math.round(clampedValue)}
          </span>
          {label && (
            <span
              className="text-[#6B6B6B] font-medium leading-none mt-0.5"
              style={{ fontSize: size * 0.1 }}
            >
              {label}
            </span>
          )}
        </div>
      </div>
      {sublabel && (
        <p className="text-xs text-[#A3A3A3] text-center">{sublabel}</p>
      )}
    </div>
  );
}
