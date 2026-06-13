import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn, getTrendIcon } from '../utils/format';
import { useEffect, useState } from 'react';

interface KpiCardProps {
  title: string;
  value: number;
  unit?: string;
  change: number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  format?: 'percent' | 'number' | 'currency';
  decimals?: number;
}

export default function KpiCard({
  title,
  value,
  unit = '',
  change,
  icon,
  color = 'primary',
  format = 'number',
  decimals = 1,
}: KpiCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const trend = getTrendIcon(change);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(step * stepValue, value);
      setDisplayValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (val: number) => {
    switch (format) {
      case 'percent':
        return `${val.toFixed(decimals)}%`;
      case 'currency':
        if (val >= 10000) return `${(val / 10000).toFixed(2)}万`;
        return val.toFixed(decimals);
      default:
        if (val >= 10000) return `${(val / 10000).toFixed(1)}万`;
        return Math.round(val).toLocaleString();
    }
  };

  const colorClasses = {
    primary: 'from-primary-400 to-primary-600',
    success: 'from-green-400 to-green-600',
    warning: 'from-orange-400 to-orange-600',
    danger: 'from-red-400 to-red-600',
    info: 'from-cyan-400 to-cyan-600',
  };

  const iconBgClasses = {
    primary: 'bg-primary-500/20 text-primary-400',
    success: 'bg-success/20 text-green-400',
    warning: 'bg-warning/20 text-orange-400',
    danger: 'bg-danger/20 text-red-400',
    info: 'bg-info/20 text-cyan-400',
  };

  return (
    <div className="glass-card p-5 glow-border hover:shadow-card-hover transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="text-dark-400 text-sm font-medium">{title}</div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBgClasses[color])}>
          {icon}
        </div>
      </div>

      <div className="mb-3">
        <span className={cn('text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent animate-number', colorClasses[color])}>
          {formatValue(displayValue)}
        </span>
        {unit && <span className="text-dark-400 text-sm ml-1">{unit}</span>}
      </div>

      <div className="flex items-center gap-2">
        {trend === 'up' && (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="w-3 h-3" />
            上升 {Math.abs(change).toFixed(decimals)}%
          </span>
        )}
        {trend === 'down' && (
          <span className="flex items-center gap-1 text-xs text-red-400">
            <TrendingDown className="w-3 h-3" />
            下降 {Math.abs(change).toFixed(decimals)}%
          </span>
        )}
        {trend === 'flat' && (
          <span className="flex items-center gap-1 text-xs text-dark-400">
            <Minus className="w-3 h-3" />
            持平
          </span>
        )}
        <span className="text-xs text-dark-500">较上周</span>
      </div>
    </div>
  );
}
