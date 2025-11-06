// components/ui/progress-bar.tsx

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'green' | 'blue' | 'purple';
}

export function ProgressBar({
  current,
  max,
  label,
  showPercentage = true,
  size = 'md',
  color = 'indigo'
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600'
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {current !== undefined && max !== undefined && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {current.toLocaleString()} / {max.toLocaleString()} XP
          </span>
        </div>
      )}
    </div>
  );
}
