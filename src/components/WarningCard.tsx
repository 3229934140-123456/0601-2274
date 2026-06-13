import { AlertTriangle, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Warning } from '../types';
import { cn, getWarningTypeName, getWarningLevelName, getWarningStatusName, formatPercent, formatDate } from '../utils/format';

interface WarningCardProps {
  warning: Warning;
  compact?: boolean;
}

export default function WarningCard({ warning, compact = false }: WarningCardProps) {
  const navigate = useNavigate();

  const levelColors = {
    level1: {
      bg: 'bg-warning/10',
      border: 'border-warning/40',
      text: 'text-orange-400',
      glow: 'shadow-orange-500/20',
    },
    level2: {
      bg: 'bg-danger/10',
      border: 'border-danger/40',
      text: 'text-red-400',
      glow: 'shadow-red-500/20',
    },
  };

  const statusColors: Record<string, string> = {
    active: 'tag-warning',
    processing: 'tag-primary',
    escalated: 'tag-danger',
    resolved: 'tag-success',
  };

  const colors = levelColors[warning.level];

  if (compact) {
    return (
      <div
        className={cn(
          'p-3 rounded-lg border cursor-pointer transition-all hover:shadow-lg',
          colors.bg,
          colors.border,
          `hover:${colors.glow}`
        )}
        onClick={() => navigate(`/warnings/${warning.id}`)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn('w-4 h-4', colors.text)} />
            <span className="text-sm font-medium text-white truncate">{warning.communityName}</span>
          </div>
          <span className={cn('text-xs', colors.text)}>{getWarningLevelName(warning.level)}</span>
        </div>
        <div className="mt-2 text-xs text-dark-400">
          {getWarningTypeName(warning.type)}: {formatPercent(warning.currentValue)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'glass-card p-5 cursor-pointer transition-all hover:shadow-card-hover group border-l-4',
        warning.level === 'level2' ? 'border-l-danger' : 'border-l-warning'
      )}
      onClick={() => navigate(`/warnings/${warning.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.bg)}>
            <AlertTriangle className={cn('w-5 h-5', colors.text)} />
          </div>
          <div>
            <h4 className="text-white font-semibold">{warning.communityName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-xs', colors.text)}>
                {getWarningLevelName(warning.level)}
              </span>
              <span className="text-dark-600">|</span>
              <span className={`tag ${statusColors[warning.status]}`}>
                {getWarningStatusName(warning.status)}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors group-hover:translate-x-1" />
      </div>

      <p className="text-sm text-dark-300 mb-4">{warning.description}</p>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-dark-400">
            <MapPin className="w-3.5 h-3.5" />
            当前值: <span className={cn('font-medium', colors.text)}>{formatPercent(warning.currentValue)}</span>
          </div>
          <div className="flex items-center gap-1 text-dark-400">
            <span>阈值: {formatPercent(warning.threshold)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-dark-400">
          <Clock className="w-3.5 h-3.5" />
          已持续 {warning.processingDays} 天
        </div>
      </div>

      {warning.approvalStage !== undefined && (
        <div className="mt-4 pt-4 border-t border-dark-700">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-dark-400">审批进度</span>
            <span className="text-primary-400">第 {warning.approvalStage}/3 阶段</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map(stage => (
              <div
                key={stage}
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-all',
                  stage <= warning.approvalStage!
                    ? 'bg-gradient-primary'
                    : 'bg-dark-700'
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
