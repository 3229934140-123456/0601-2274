import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Filter,
  Search,
  Clock,
  CheckCircle,
  ArrowUpCircle,
  ChevronRight,
} from 'lucide-react';
import WarningCard from '../../components/WarningCard';
import { warnings } from '../../data/mockData';
import { cn, getWarningLevelName, getWarningStatusName, getWarningTypeName } from '../../utils/format';
import type { WarningLevel, WarningStatus, WarningType } from '../../types';

const levelFilters: { value: WarningLevel | 'all'; label: string; count?: number }[] = [
  { value: 'all', label: '全部' },
  { value: 'level1', label: '一级预警' },
  { value: 'level2', label: '二级预警' },
];

const statusFilters: { value: WarningStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'escalated', label: '已升级' },
  { value: 'resolved', label: '已解除' },
];

const typeFilters: { value: WarningType | 'all'; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'vacancy', label: '空置率过高' },
  { value: 'rent', label: '租金收缴率低' },
];

export default function Warnings() {
  const navigate = useNavigate();
  const [levelFilter, setLevelFilter] = useState<WarningLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<WarningStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<WarningType | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  const filteredWarnings = useMemo(() => {
    return warnings.filter(w => {
      if (levelFilter !== 'all' && w.level !== levelFilter) return false;
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      if (typeFilter !== 'all' && w.type !== typeFilter) return false;
      if (searchText && !w.communityName.includes(searchText)) return false;
      return true;
    });
  }, [levelFilter, statusFilter, typeFilter, searchText]);

  const stats = useMemo(() => ({
    total: warnings.length,
    active: warnings.filter(w => w.status === 'active').length,
    processing: warnings.filter(w => w.status === 'processing' || w.status === 'escalated').length,
    resolved: warnings.filter(w => w.status === 'resolved').length,
    level1: warnings.filter(w => w.level === 'level1' && w.status !== 'resolved').length,
    level2: warnings.filter(w => w.level === 'level2' && w.status !== 'resolved').length,
  }), []);

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">预警管理</h2>
          <p className="text-dark-400 text-sm mt-1">
            实时监控空置率和租金收缴率，自动触发分级预警
          </p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-dark-400 text-sm">预警总数</div>
              <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-primary-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-dark-400 text-sm">一级预警</div>
              <div className="text-2xl font-bold text-orange-400 mt-1">{stats.level1}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-dark-400 text-sm">二级预警</div>
              <div className="text-2xl font-bold text-red-400 mt-1">{stats.level2}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-danger/20 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-dark-400 text-sm">待处理</div>
              <div className="text-2xl font-bold text-warning mt-1">{stats.active}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-dark-400 text-sm">处理中</div>
              <div className="text-2xl font-bold text-primary-400 mt-1">{stats.processing}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-primary-400" />
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-dark-400 text-sm">已解除</div>
              <div className="text-2xl font-bold text-green-400 mt-1">{stats.resolved}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-dark-400" />
            <span className="text-sm text-dark-300">筛选：</span>
            <div className="flex gap-1 p-1 bg-dark-800 rounded-lg">
              {levelFilters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setLevelFilter(filter.value as any)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md transition-all',
                    levelFilter === filter.value
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-400 hover:text-white'
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-primary-500"
            >
              {typeFilters.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-primary-500"
            >
              {statusFilters.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="w-4 h-4 text-dark-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索小区名称..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 w-48"
              />
            </div>
          </div>
        </div>
      </div>

      {filteredWarnings.length > 0 ? (
        <div className="space-y-4">
          {filteredWarnings.map(warning => (
            <WarningCard key={warning.id} warning={warning} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <div className="text-lg text-white font-medium">暂无符合条件的预警</div>
          <div className="text-dark-400 text-sm mt-2">所有小区运营状态良好</div>
        </div>
      )}

      <div className="glass-card p-5">
        <h3 className="section-title">预警处理流程</h3>
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: '触发预警', desc: '指标连续30天超标' },
            { step: 2, title: '一级预警', desc: '推送物业和区中心' },
            { step: 3, title: '15天处理期', desc: '采取措施改善' },
            { step: 4, title: '升级二级预警', desc: '未改善则升级' },
            { step: 5, title: '三级审批', desc: '物业→区中心→市住建局' },
            { step: 6, title: '调整方案', desc: '调整分配或启动清退' },
          ].map((item, index) => (
            <div key={item.step} className="flex-1 text-center relative">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto text-white font-bold text-lg">
                {item.step}
              </div>
              <div className="mt-3 text-sm font-medium text-white">{item.title}</div>
              <div className="text-xs text-dark-400 mt-1">{item.desc}</div>
              {index < 5 && (
                <div className="absolute top-6 left-1/2 w-full h-0.5 bg-dark-700 -z-10">
                  <div className="w-full h-full bg-gradient-to-r from-primary-500 to-primary-700" style={{ width: '100%' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
