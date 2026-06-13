import { useState } from 'react';
import {
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  FileText,
  Filter,
  Search,
  Download,
} from 'lucide-react';
import { dataSources } from '../../data/mockData';
import { getDataSourceTypeName, formatNumber, cn } from '../../utils/format';

const typeColors: Record<string, { bg: string; text: string; icon: any }> = {
  applicant: { bg: 'bg-primary-500/20', text: 'text-primary-400', icon: Database },
  allocation: { bg: 'bg-success/20', text: 'text-green-400', icon: TrendingUp },
  rent: { bg: 'bg-warning/20', text: 'text-orange-400', icon: FileText },
  complaint: { bg: 'bg-info/20', text: 'text-cyan-400', icon: AlertTriangle },
};

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  online: { label: '正常', class: 'tag-success', icon: CheckCircle },
  warning: { label: '异常', class: 'tag-warning', icon: AlertTriangle },
  offline: { label: '离线', class: 'tag-danger', icon: XCircle },
};

export default function Data() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const filteredSources = dataSources.filter(ds => {
    if (selectedType !== 'all' && ds.type !== selectedType) return false;
    if (searchText && !ds.name.includes(searchText)) return false;
    return true;
  });

  const typeOptions = [
    { value: 'all', label: '全部类型' },
    { value: 'applicant', label: '申请人轮候' },
    { value: 'allocation', label: '房源分配' },
    { value: 'rent', label: '租金缴纳' },
    { value: 'complaint', label: '住户投诉' },
  ];

  const cleaningLogs = [
    { id: 1, time: '2026-06-14 10:30:00', source: '申请人轮候数据', records: 15280, cleaned: 15245, errors: 35, status: 'success' },
    { id: 2, time: '2026-06-14 10:25:00', source: '房源分配数据', records: 8950, cleaned: 8947, errors: 3, status: 'success' },
    { id: 3, time: '2026-06-14 10:15:00', source: '租金缴纳数据', records: 25680, cleaned: 25652, errors: 28, status: 'warning' },
    { id: 4, time: '2026-06-14 10:00:00', source: '住户投诉数据', records: 1568, cleaned: 1568, errors: 0, status: 'success' },
    { id: 5, time: '2026-06-14 09:30:00', source: '申请人轮候数据', records: 14520, cleaned: 14500, errors: 20, status: 'success' },
    { id: 6, time: '2026-06-14 09:00:00', source: '房源分配数据', records: 7890, cleaned: 7885, errors: 5, status: 'success' },
    { id: 7, time: '2026-06-14 08:30:00', source: '租金缴纳数据', records: 23450, cleaned: 23420, errors: 30, status: 'warning' },
    { id: 8, time: '2026-06-14 08:00:00', source: '住户投诉数据', records: 1420, cleaned: 1420, errors: 0, status: 'success' },
  ];

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">数据管理</h2>
          <p className="text-dark-400 text-sm mt-1">
            实时数据接入状态监控与数据清洗日志
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <RefreshCw className="w-4 h-4" />
            刷新数据
          </button>
          <button className="btn btn-primary">
            <Download className="w-4 h-4" />
            导出数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {dataSources.map(ds => {
          const config = typeColors[ds.type];
          const status = statusConfig[ds.status];
          const Icon = config.icon;
          const StatusIcon = status.icon;
          return (
            <div key={ds.id} className="glass-card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${config.text}`} />
                </div>
                <span className={`tag ${status.class} gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              <div className="text-lg font-semibold text-white mb-1">{ds.name}</div>
              <div className="text-2xl font-bold text-white mb-1">{formatNumber(ds.recordCount)}</div>
              <div className="text-xs text-dark-400 mb-4">条记录</div>
              <div className="flex items-center justify-between text-xs text-dark-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {ds.lastUpdate}
                </div>
                {ds.errorCount > 0 && (
                  <span className="text-red-400">{ds.errorCount} 条错误</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-5">
        <h3 className="section-title">数据清洗日志</h3>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-dark-400" />
            <div className="flex gap-1 p-1 bg-dark-800 rounded-lg">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedType(opt.value)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md transition-all',
                    selectedType === opt.value
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-400 hover:text-white'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-dark-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索数据源..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">时间</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">数据源</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">原始记录</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">清洗后</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">异常数据</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-dark-400 uppercase">清洗率</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-dark-400 uppercase">状态</th>
              </tr>
            </thead>
            <tbody>
              {cleaningLogs.map(log => {
                const cleanRate = ((log.cleaned / log.records) * 100).toFixed(1);
                return (
                  <tr key={log.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-dark-400 font-mono">{log.time}</td>
                    <td className="py-3 px-4 text-sm text-white font-medium">{log.source}</td>
                    <td className="py-3 px-4 text-sm text-dark-300 text-right">{formatNumber(log.records)}</td>
                    <td className="py-3 px-4 text-sm text-green-400 text-right">{formatNumber(log.cleaned)}</td>
                    <td className={`py-3 px-4 text-sm text-right ${log.errors > 0 ? 'text-red-400' : 'text-dark-400'}`}>
                      {log.errors}条
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2 min-w-24">
                        <div className="w-16 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${cleanRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-dark-300">{cleanRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`tag ${log.status === 'success' ? 'tag-success' : 'tag-warning'} gap-1`}>
                        {log.status === 'success' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {log.status === 'success' ? '成功' : '有异常'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="section-title">数据质量概览</h3>
          <div className="space-y-4">
            <QualityItem label="数据完整性" value={98.5} />
            <QualityItem label="数据准确性" value={97.2} />
            <QualityItem label="数据时效性" value={99.1} />
            <QualityItem label="数据一致性" value={96.8} />
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="section-title">数据接入说明</h3>
          <div className="space-y-3 text-sm text-dark-300">
            <p>• 数据每30分钟自动同步一次，实时更新各项指标</p>
            <p>• 数据清洗规则包括：去重、格式校验、逻辑校验、异常值处理</p>
            <p>• 异常数据会被标记并进入人工审核流程</p>
            <p>• 支持历史数据回溯查询，最长保留3年</p>
            <p>• 数据导出支持Excel、CSV、JSON多种格式</p>
          </div>
          <div className="mt-4 p-4 bg-primary-500/10 rounded-lg border border-primary-500/30">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-white">数据安全</div>
                <div className="text-xs text-dark-400 mt-1">
                  所有数据传输均采用加密方式，敏感信息已脱敏处理
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QualityItem({ label, value }: { label: string; value: number }) {
  const color = value >= 98 ? 'text-green-400' : value >= 95 ? 'text-primary-400' : 'text-orange-400';
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-dark-300">{label}</span>
        <span className={`text-sm font-medium ${color}`}>{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${value >= 98 ? 'bg-green-500' : value >= 95 ? 'bg-primary-500' : 'bg-orange-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
