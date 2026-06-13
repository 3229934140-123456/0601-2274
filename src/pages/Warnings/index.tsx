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
  XCircle,
  User,
  Calendar,
  FileText,
  ClipboardList,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import WarningCard from '../../components/WarningCard';
import { cn, getWarningLevelName, getWarningStatusName, getWarningTypeName, formatDate } from '../../utils/format';
import type { WarningLevel, WarningStatus, WarningType } from '../../types';
import { useAppStore } from '../../store';
import { useAuth } from '../../context/AuthContext';
import { getCommunityById } from '../../data/mockData';

const levelFilters: { value: WarningLevel | 'all'; label: string }[] = [
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

const resultFilters: { value: string; label: string }[] = [
  { value: 'all', label: '全部结果' },
  { value: 'approved', label: '审批通过' },
  { value: 'rejected', label: '审批驳回' },
  { value: 'resolved_report', label: '报告解除' },
  { value: 'pending', label: '审批中' },
];

const stageFilters: { value: string; label: string }[] = [
  { value: 'all', label: '全部阶段' },
  { value: '1', label: '物业确认' },
  { value: '2', label: '区中心复核' },
  { value: '3', label: '市住建局批准' },
];

export default function Warnings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const storeWarnings = useAppStore((state) => state.warnings);
  const [levelFilter, setLevelFilter] = useState<WarningLevel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<WarningStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<WarningType | 'all'>('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [handlerFilter, setHandlerFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'ledger'>('card');

  const roleFilteredWarnings = useMemo(() => {
    let result = storeWarnings;

    if (user?.role === 'district') {
      result = result.filter(w => {
        const community = getCommunityById(w.communityId);
        return community?.district === '朝阳区' || community?.district?.includes('朝阳');
      });
    }

    if (user?.role === 'property') {
      result = result.filter(w => w.communityId === user.regionId);
    }

    return result;
  }, [storeWarnings, user]);

  const filteredWarnings = useMemo(() => {
    return roleFilteredWarnings.filter(w => {
      if (levelFilter !== 'all' && w.level !== levelFilter) return false;
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      if (typeFilter !== 'all' && w.type !== typeFilter) return false;
      if (searchText && !w.communityName.includes(searchText)) return false;

      if (resultFilter !== 'all') {
        if (resultFilter === 'approved') {
          const hasApproved = w.approvalHistory?.some(h => h.status === 'approved');
          if (!hasApproved) return false;
        } else if (resultFilter === 'rejected') {
          const hasRejected = w.approvalHistory?.some(h => h.status === 'rejected');
          if (!hasRejected) return false;
        } else if (resultFilter === 'resolved_report') {
          if (w.status !== 'resolved') return false;
          const hasApprovalStage = w.approvalHistory?.some(h => h.status !== 'pending');
          if (hasApprovalStage) return false;
        } else if (resultFilter === 'pending') {
          const hasPending = w.approvalHistory?.some(h => h.status === 'pending');
          if (!hasPending && !w.approvalStage) return false;
        }
      }

      if (stageFilter !== 'all') {
        const stage = parseInt(stageFilter);
        const hasStage = w.approvalHistory && w.approvalHistory.length >= stage;
        if (!hasStage) return false;
      }

      if (handlerFilter) {
        const allHandlers = w.approvalHistory
          ?.filter(h => h.status !== 'pending')
          .map(h => h.handler)
          .join(',') || '';
        if (!allHandlers.includes(handlerFilter)) return false;
      }

      return true;
    });
  }, [roleFilteredWarnings, levelFilter, statusFilter, typeFilter, searchText, resultFilter, stageFilter, handlerFilter, user]);

  const allHandlers = useMemo(() => {
    const handlers = new Set<string>();
    roleFilteredWarnings.forEach(w => {
      w.approvalHistory?.forEach(h => {
        if (h.status !== 'pending' && h.handler && h.handler !== '待审批' && h.handler !== '待复核') {
          handlers.add(h.handler);
        }
      });
    });
    return Array.from(handlers);
  }, [roleFilteredWarnings]);

  const stats = useMemo(() => {
    const warnings = roleFilteredWarnings;
    return {
      total: warnings.length,
      active: warnings.filter(w => w.status === 'active').length,
      processing: warnings.filter(w => w.status === 'processing' || w.status === 'escalated').length,
      resolved: warnings.filter(w => w.status === 'resolved').length,
      level1: warnings.filter(w => w.level === 'level1' && w.status !== 'resolved').length,
      level2: warnings.filter(w => w.level === 'level2' && w.status !== 'resolved').length,
    };
  }, [roleFilteredWarnings]);

  const getDisposalResult = (w: typeof storeWarnings[0]) => {
    if (w.status === 'resolved') {
      const hasRejected = w.approvalHistory?.some(h => h.status === 'rejected');
      if (hasRejected) return { label: '审批驳回', color: 'text-red-400', icon: XCircle };
      const hasApproval = w.approvalHistory?.some(h => h.status === 'approved');
      if (hasApproval) return { label: '审批通过', color: 'text-green-400', icon: CheckCircle };
      return { label: '报告解除', color: 'text-cyan-400', icon: FileText };
    }
    if (w.status === 'escalated') return { label: '已升级', color: 'text-red-400', icon: ArrowUpCircle };
    if (w.status === 'processing') return { label: '处理中', color: 'text-primary-400', icon: Clock };
    return { label: '待处理', color: 'text-orange-400', icon: AlertTriangle };
  };

  const getCurrentStage = (w: typeof storeWarnings[0]) => {
    if (!w.approvalStage) return '-';
    const stageNames: Record<number, string> = { 1: '物业确认', 2: '区中心复核', 3: '市住建局批准' };
    return stageNames[w.approvalStage] || '-';
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">预警管理</h2>
          <p className="text-dark-400 text-sm mt-1">
            实时监控空置率和租金收缴率，自动触发分级预警，完整处置台账可追溯
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-dark-800 rounded-lg">
          <button
            onClick={() => setViewMode('card')}
            className={cn(
              'p-2 rounded-md transition-all',
              viewMode === 'card' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('ledger')}
            className={cn(
              'p-2 rounded-md transition-all',
              viewMode === 'ledger' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'
            )}
          >
            <ClipboardList className="w-4 h-4" />
          </button>
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

          <div className="flex items-center gap-3 flex-wrap">
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
            <select
              value={resultFilter}
              onChange={e => setResultFilter(e.target.value)}
              className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-primary-500"
            >
              {resultFilters.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-primary-500"
            >
              {stageFilters.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            {allHandlers.length > 0 && (
              <select
                value={handlerFilter}
                onChange={e => setHandlerFilter(e.target.value)}
                className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-primary-500"
              >
                <option value="">全部处理人</option>
                {allHandlers.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            )}
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

      {viewMode === 'card' ? (
        filteredWarnings.length > 0 ? (
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
        )
      ) : (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">处置台账</h3>
            <span className="text-sm text-dark-400 ml-2">共 {filteredWarnings.length} 条记录</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-3 text-xs font-medium text-dark-400 uppercase">小区</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-dark-400 uppercase">预警级别</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-dark-400 uppercase">类型</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-dark-400 uppercase">触发日期</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-dark-400 uppercase">持续天数</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-dark-400 uppercase">审批阶段</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-dark-400 uppercase">处理结果</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-dark-400 uppercase">最后处理人</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-dark-400 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarnings.map(w => {
                  const result = getDisposalResult(w);
                  const ResultIcon = result.icon;
                  const lastHandler = w.approvalHistory
                    ?.filter(h => h.status !== 'pending')
                    .pop();
                  return (
                    <tr key={w.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                      <td className="py-3 px-3 text-sm text-white font-medium">{w.communityName}</td>
                      <td className="py-3 px-3">
                        <span className={`tag ${w.level === 'level2' ? 'tag-danger' : 'tag-warning'}`}>
                          {getWarningLevelName(w.level)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="tag tag-primary">{getWarningTypeName(w.type)}</span>
                      </td>
                      <td className="py-3 px-3 text-sm text-dark-300">{w.triggerDate}</td>
                      <td className="py-3 px-3 text-sm text-dark-300">{w.processingDays}天</td>
                      <td className="py-3 px-3 text-sm text-dark-300">{getCurrentStage(w)}</td>
                      <td className="py-3 px-3">
                        <span className={`flex items-center gap-1 text-sm ${result.color}`}>
                          <ResultIcon className="w-3.5 h-3.5" />
                          {result.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm text-dark-300">
                        {lastHandler ? lastHandler.handler : '-'}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                          onClick={() => navigate(`/warnings/${w.id}`)}
                        >
                          详情 <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredWarnings.length === 0 && (
            <div className="text-center py-8 text-dark-400">暂无符合条件的记录</div>
          )}
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
