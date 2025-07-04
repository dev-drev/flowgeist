interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
  showText?: boolean;
}

export default function CircularProgress({
  progress,
  size = 120, // Increased default size for a larger, more prominent spinner
  strokeWidth = 8, // Increased stroke width for better visibility
  color = "#000000", // Pure black color
  className = "",
  showText = true, // Always show text by default
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle with subtle gray */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-50"
        />
        {/* Progress circle with pure black and enhanced styling */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out drop-shadow-lg filter"
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
          }}
        />
      </svg>
      {/* Progress text - always visible and larger with enhanced styling */}
      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-black font-mono select-none">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}
