import { useState, useMemo } from 'react';
import {
  FileBarChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Home,
  DollarSign,
  Clock,
  Smile,
  Lightbulb,
  Target,
  CheckCircle,
  Users,
  XCircle,
  MapPin,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { getReportsByRole, getCommunityById, communities } from '../../data/mockData';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import { cn, formatPercent, formatNumber, formatDate, getWarningStatusName, getWarningTypeName, getWarningLevelName } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../store';
import type { AllocationBatch } from '../../types';

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return function () {
    hash = Math.sin(hash) * 10000;
    return hash - Math.floor(hash);
  };
}

export default function Reports() {
  const { user } = useAuth();
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [selectedBatchIdx, setSelectedBatchIdx] = useState<number | null>(null);
  const warnings = useAppStore((state) => state.warnings);
  const allocationPlan = useAppStore((state) => state.allocationPlan);

  const weeklyReports = useMemo(() => {
    if (!user) return [];
    return getReportsByRole(user.role, user.regionId);
  }, [user]);

  const currentReport = weeklyReports[selectedReportIndex];

  const visibleCommunities = useMemo(() => {
    if (!user) return communities;
    if (user.role === 'national' || user.role === 'provincial' || user.role === 'municipal') {
      return communities;
    }
    if (user.role === 'district') {
      return communities.filter(c => c.district?.includes('朝阳'));
    }
    if (user.role === 'property') {
      return communities.filter(c => c.id === user.regionId);
    }
    return communities;
  }, [user]);

  const planBatches = useMemo(() => {
    return allocationPlan?.batches || [];
  }, [allocationPlan]);

  const selectedBatch: AllocationBatch | null = useMemo(() => {
    if (selectedBatchIdx === null) return null;
    return planBatches[selectedBatchIdx] || null;
  }, [planBatches, selectedBatchIdx]);

  const batchDateInfo = useMemo(() => {
    if (!selectedBatch || !selectedBatch.releaseDate) return null;
    const d = new Date(selectedBatch.releaseDate);
    if (isNaN(d.getTime())) return null;
    const beforeStart = new Date(d); beforeStart.setDate(beforeStart.getDate() - 30);
    const beforeEnd = new Date(d); beforeEnd.setDate(beforeEnd.getDate() - 1);
    const afterStart = new Date(d);
    const afterEnd = new Date(d); afterEnd.setDate(afterEnd.getDate() + 30);
    return {
      batchDate: d,
      beforeWindow: { start: beforeStart, end: beforeEnd },
      afterWindow: { start: afterStart, end: afterEnd },
    };
  }, [selectedBatch]);

  const communityWarnings = useMemo(() => {
    if (!selectedCommunityId) return [];
    return warnings.filter(w => w.communityId === selectedCommunityId);
  }, [warnings, selectedCommunityId]);

  const communityData = useMemo(() => {
    if (!selectedCommunityId) return null;
    return getCommunityById(selectedCommunityId);
  }, [selectedCommunityId]);

  const batchMetrics = useMemo(() => {
    if (!batchDateInfo || !selectedBatch) return null;
    const seed = `${selectedBatch.batchNumber}-${selectedBatch.releaseDate}-${selectedCommunityId || 'global'}`;
    const rnd = seededRandom(seed);

    const base = currentReport || weeklyReports[0];
    if (!base) return null;

    const beforeVacancy = Math.round((base.vacancyRate + (rnd() - 0.3) * 1.5) * 10) / 10;
    const afterVacancy = Math.max(1.5, Math.round((beforeVacancy - 1.8 - rnd() * 1.2) * 10) / 10);
    const beforeRent = Math.round((base.rentCollectionRate + (rnd() - 0.5) * 1.2) * 10) / 10;
    const afterRent = Math.min(99, Math.round((beforeRent + 2.5 + rnd() * 1.5) * 10) / 10);
    const beforeWaitDays = Math.round(base.avgWaitDays + (rnd() - 0.3) * 8);
    const afterWaitDays = Math.max(20, Math.round(beforeWaitDays - 12 - rnd() * 8));
    const beforeWarnings = Math.round((base.vacancyRate - 5) * 3 + rnd() * 5);
    const afterWarnings = Math.max(0, Math.round(beforeWarnings * (0.3 + rnd() * 0.2)));

    return {
      beforeVacancy, afterVacancy,
      beforeRent, afterRent,
      beforeWaitDays, afterWaitDays,
      beforeWarnings, afterWarnings,
    };
  }, [batchDateInfo, selectedBatch, selectedCommunityId, currentReport, weeklyReports]);

  const buildWindowSeries = (batchNum: number, releaseDate: string, prefix: '投放前' | '投放后', valueFn: (i: number, rnd: () => number) => number, name: string) => {
    if (!releaseDate) return [];
    const base = new Date(releaseDate);
    const rnd = seededRandom(`${batchNum}-${releaseDate}-${prefix}-${selectedCommunityId || 'g'}-${name}`);
    const days = 30;
    const startOffset = prefix === '投放前' ? -30 : 0;
    const arr: { date: string; value: number; name: string }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + startOffset + i);
      arr.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        value: Math.round(valueFn(i, rnd) * 10) / 10,
        name,
      });
    }
    return arr;
  };

  const beforeAfterVacancy = useMemo(() => {
    if (!selectedBatch || !batchMetrics) return { before: [], after: [] };
    const v = batchMetrics;
    return {
      before: buildWindowSeries(selectedBatch.batchNumber, selectedBatch.releaseDate, '投放前', (i, r) => v.beforeVacancy + Math.sin(i * 0.2) * 0.8 + (r() - 0.5) * 0.4, '空置率(前)'),
      after: buildWindowSeries(selectedBatch.batchNumber, selectedBatch.releaseDate, '投放后', (i, r) => v.afterVacancy + (v.beforeVacancy - v.afterVacancy) * Math.exp(-i * 0.12) + Math.sin(i * 0.2) * 0.5 + (r() - 0.5) * 0.3, '空置率(后)'),
    };
  }, [selectedBatch, batchMetrics]);

  const beforeAfterRent = useMemo(() => {
    if (!selectedBatch || !batchMetrics) return { before: [], after: [] };
    const v = batchMetrics;
    return {
      before: buildWindowSeries(selectedBatch.batchNumber, selectedBatch.releaseDate, '投放前', (i, r) => v.beforeRent + Math.sin(i * 0.25) * 0.8 + (r() - 0.5) * 0.3, '收缴率(前)'),
      after: buildWindowSeries(selectedBatch.batchNumber, selectedBatch.releaseDate, '投放后', (i, r) => v.afterRent + (1 - Math.exp(-i * 0.1)) * (v.afterRent - v.beforeRent) * 0.5 + (r() - 0.5) * 0.2, '收缴率(后)'),
    };
  }, [selectedBatch, batchMetrics]);

  const beforeAfterWarning = useMemo(() => {
    if (!selectedBatch || !batchMetrics) return { before: [], after: [] };
    const v = batchMetrics;
    return {
      before: buildWindowSeries(selectedBatch.batchNumber, selectedBatch.releaseDate, '投放前', (i, r) => Math.max(0, v.beforeWarnings + Math.round((r() - 0.5) * 2)), '预警数(前)'),
      after: buildWindowSeries(selectedBatch.batchNumber, selectedBatch.releaseDate, '投放后', (i, r) => Math.max(0, Math.round(v.afterWarnings + (v.beforeWarnings - v.afterWarnings) * Math.exp(-i * 0.15) + (r() - 0.5) * 1.5)), '预警数(后)'),
    };
  }, [selectedBatch, batchMetrics]);

  const combinedVacancy = [...beforeAfterVacancy.before, ...beforeAfterVacancy.after];
  const combinedRent = [...beforeAfterRent.before, ...beforeAfterRent.after];
  const combinedWarning = [...beforeAfterWarning.before, ...beforeAfterWarning.after];

  const trendData = useMemo(() => {
    return weeklyReports.slice(0, 8).reverse().map(r => ({
      date: `第${r.weekNumber}周`,
      value: r.vacancyRate,
      name: '空置率',
    }));
  }, [weeklyReports]);

  const rentTrendData = useMemo(() => {
    return weeklyReports.slice(0, 8).reverse().map(r => ({
      date: `第${r.weekNumber}周`,
      value: r.rentCollectionRate,
      name: '租金收缴率',
    }));
  }, [weeklyReports]);

  const waitDaysTrendData = useMemo(() => {
    return weeklyReports.slice(0, 8).reverse().map(r => ({
      date: `第${r.weekNumber}周`,
      value: r.avgWaitDays,
      name: '轮候天数',
    }));
  }, [weeklyReports]);

  const warningTrendData = useMemo(() => {
    return weeklyReports.slice(0, 8).reverse().map((r, i) => ({
      date: `第${r.weekNumber}周`,
      value: selectedCommunityId
        ? communityWarnings.filter(w => {
            const triggerWeek = Math.floor((new Date(w.triggerDate).getTime() - new Date(r.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000));
            return triggerWeek <= 0;
          }).length
        : Math.floor(Math.abs(r.vacancyRate - 5) * 2),
      name: '预警数',
    }));
  }, [weeklyReports, selectedCommunityId, communityWarnings]);

  const getChangeColor = (value: number, lowerIsBetter = false) => {
    if (value > 0) return lowerIsBetter ? 'text-red-400' : 'text-green-400';
    if (value < 0) return lowerIsBetter ? 'text-green-400' : 'text-red-400';
    return 'text-dark-400';
  };

  const getChangeIcon = (value: number, lowerIsBetter = false) => {
    if (value > 0.1) return lowerIsBetter ? TrendingDown : TrendingUp;
    if (value < -0.1) return lowerIsBetter ? TrendingUp : TrendingDown;
    return Minus;
  };

  const StatCard = ({
    title,
    value,
    change,
    unit,
    icon,
    color,
    lowerIsBetter = false,
  }: {
    title: string;
    value: number;
    change: number;
    unit: string;
    icon: React.ReactNode;
    color: string;
    lowerIsBetter?: boolean;
  }) => {
    const ChangeIcon = getChangeIcon(change, lowerIsBetter);
    const changeColor = getChangeColor(change, lowerIsBetter);
    return (
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-dark-400">{title}</span>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}/20 text-${color}`}>
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {unit === '%' ? formatPercent(value) : formatNumber(value)}
          {unit !== '%' && <span className="text-sm font-normal text-dark-400 ml-1">{unit}</span>}
        </div>
        <div className={`flex items-center gap-1 text-xs ${changeColor}`}>
          <ChangeIcon className="w-3.5 h-3.5" />
          环比 {change > 0 ? '+' : ''}{change.toFixed(1)}%
        </div>
      </div>
    );
  };

  const BatchCompareCard = ({
    title, before, after, unit, lowerIsBetter,
  }: {
    title: string; before: number; after: number; unit: string; lowerIsBetter?: boolean;
  }) => {
    const delta = after - before;
    const improved = lowerIsBetter ? delta < 0 : delta > 0;
    const DeltaIcon = delta === 0 ? Minus : (improved ? TrendingDown : TrendingUp);
    const deltaColor = improved ? 'text-green-400' : 'text-red-400';
    const fmt = unit === '%' ? formatPercent : formatNumber;
    return (
      <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
        <div className="text-xs text-dark-400 mb-2">{title}</div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-xs text-dark-400 mb-0.5">投放前</div>
            <div className="text-xl font-bold text-white">{fmt(before)}{unit !== '%' ? unit : ''}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-dark-500 mb-2" />
          <div className="text-right">
            <div className="text-xs text-dark-400 mb-0.5">投放后</div>
            <div className="text-xl font-bold text-primary-400">{fmt(after)}{unit !== '%' ? unit : ''}</div>
          </div>
        </div>
        <div className={cn('flex items-center gap-1 mt-2 text-xs', deltaColor)}>
          <DeltaIcon className="w-3.5 h-3.5" />
          {delta > 0 ? '+' : ''}{unit === '%' ? delta.toFixed(1) : delta}{unit}
          <span className="text-dark-500 ml-1">（{improved ? '改善' : delta === 0 ? '持平' : '恶化'}）</span>
        </div>
      </div>
    );
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-danger/20 text-red-400 border-danger/30',
    medium: 'bg-warning/20 text-orange-400 border-warning/30',
    low: 'bg-info/20 text-cyan-400 border-info/30',
  };

  const getReportScopeName = () => {
    if (!user) return '全国';
    switch (user.role) {
      case 'national': return '全国';
      case 'provincial': return user.regionName;
      case 'municipal': return user.regionName;
      case 'district': return user.regionName;
      case 'property': return user.regionName;
      default: return '全国';
    }
  };

  if (weeklyReports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-400">暂无报告数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{getReportScopeName()}运营健康报告</h2>
          <p className="text-dark-400 text-sm mt-1">
            每周自动生成{getReportScopeName()}运营健康报告，联动预警与分配计划
            {selectedBatch && <span className="text-primary-400 ml-1">· 聚焦第{selectedBatch.batchNumber}批投放</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1 bg-dark-800 rounded-lg">
            <button
              onClick={() => setSelectedReportIndex(Math.min(selectedReportIndex + 1, weeklyReports.length - 1))}
              className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
              disabled={selectedReportIndex >= weeklyReports.length - 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-white font-medium min-w-32 text-center">
              第 {currentReport.weekNumber} 周 ({currentReport.year})
            </span>
            <button
              onClick={() => setSelectedReportIndex(Math.max(selectedReportIndex - 1, 0))}
              className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
              disabled={selectedReportIndex <= 0}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-dark-400">聚焦维度：</span>
          <select
            value={selectedCommunityId || ''}
            onChange={e => setSelectedCommunityId(e.target.value || null)}
            className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-primary-500"
          >
            <option value="">全局概览</option>
            {visibleCommunities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {planBatches.length > 0 && (
            <select
              value={selectedBatchIdx !== null ? String(selectedBatchIdx) : ''}
              onChange={e => setSelectedBatchIdx(e.target.value !== '' ? parseInt(e.target.value) : null)}
              className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-primary-500"
            >
              <option value="">全部批次</option>
              {planBatches.map((b, i) => (
                <option key={i} value={i}>
                  第{b.batchNumber}批 · {b.releaseDate ? formatDate(b.releaseDate) : '待定'} · {formatNumber(b.units)}套
                </option>
              ))}
            </select>
          )}
          {(selectedCommunityId || selectedBatchIdx !== null) && (
            <button
              className="text-xs text-dark-400 hover:text-primary-400 flex items-center gap-1"
              onClick={() => { setSelectedCommunityId(null); setSelectedBatchIdx(null); }}
            >
              <XCircle className="w-3 h-3" />
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* 批次投放前后对比 */}
      {selectedBatch && batchMetrics && batchDateInfo && (
        <div className="glass-card p-5 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  第{selectedBatch.batchNumber}批投放 · 前后30天效果对比
                </h3>
                <p className="text-xs text-dark-400">
                  投放日期：{formatDate(selectedBatch.releaseDate)}
                  ，投放前：{formatDate(batchDateInfo.beforeWindow.start.toISOString().split('T')[0])} ~ {formatDate(batchDateInfo.beforeWindow.end.toISOString().split('T')[0])}
                  ，投放后：{formatDate(batchDateInfo.afterWindow.start.toISOString().split('T')[0])} ~ {formatDate(batchDateInfo.afterWindow.end.toISOString().split('T')[0])}
                </p>
              </div>
            </div>
            <span className="tag tag-primary text-xs">{formatNumber(selectedBatch.units)}套房源投放</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <BatchCompareCard title="空置率" before={batchMetrics.beforeVacancy} after={batchMetrics.afterVacancy} unit="%" lowerIsBetter />
            <BatchCompareCard title="租金收缴率" before={batchMetrics.beforeRent} after={batchMetrics.afterRent} unit="%" />
            <BatchCompareCard title="平均轮候天数" before={batchMetrics.beforeWaitDays} after={batchMetrics.afterWaitDays} unit="天" lowerIsBetter />
            <BatchCompareCard title="预警总数" before={batchMetrics.beforeWarnings} after={batchMetrics.afterWarnings} unit="个" lowerIsBetter />
          </div>
        </div>
      )}

      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <FileBarChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {currentReport.year}年第{currentReport.weekNumber}周运营健康报告
              {communityData && ` · ${communityData.name}`}
            </h3>
            <p className="text-sm text-dark-400">
              报告周期：{currentReport.startDate} 至 {currentReport.endDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-5">
          <StatCard
            title={communityData ? `${communityData.name}空置率` : "空置率"}
            value={communityData ? communityData.vacancyRate : currentReport.vacancyRate}
            change={currentReport.vacancyRateMoM}
            unit="%"
            icon={<Home className="w-5 h-5" />}
            color="warning"
            lowerIsBetter
          />
          <StatCard
            title={communityData ? `${communityData.name}租金收缴率` : "租金收缴率"}
            value={communityData ? communityData.rentCollectionRate : currentReport.rentCollectionRate}
            change={currentReport.rentCollectionRateMoM}
            unit="%"
            icon={<DollarSign className="w-5 h-5" />}
            color="success"
          />
          <StatCard
            title="平均轮候时长"
            value={currentReport.avgWaitDays}
            change={currentReport.avgWaitDaysMoM}
            unit="天"
            icon={<Clock className="w-5 h-5" />}
            color="primary"
            lowerIsBetter
          />
          <StatCard
            title="住户满意度"
            value={communityData ? communityData.satisfaction : currentReport.satisfaction}
            change={currentReport.satisfactionMoM}
            unit="分"
            icon={<Smile className="w-5 h-5" />}
            color="info"
          />
        </div>
      </div>

      {selectedBatch && combinedVacancy.length > 0 ? (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-6 glass-card p-5">
            <h3 className="section-title">空置率投放前后对比</h3>
            <LineChart
              data={[]}
              height={220}
              showArea
              yAxisName="空置率(%)"
              xAxisData={beforeAfterVacancy.before.concat(beforeAfterVacancy.after).map((_, i, arr) => {
                const arr2 = beforeAfterVacancy.before.concat(beforeAfterVacancy.after);
                return arr2[i]?.date;
              }).filter((x, i, arr) => arr.indexOf(x) === i)}
              series={[
                { name: '空置率(前)', data: beforeAfterVacancy.before.map(d => d.value).concat(new Array(beforeAfterVacancy.after.length).fill(undefined as any)), color: '#F59E0B' },
                { name: '空置率(后)', data: new Array(beforeAfterVacancy.before.length).fill(undefined as any).concat(beforeAfterVacancy.after.map(d => d.value)), color: '#10B981' },
              ]}
            />
          </div>
          <div className="col-span-6 glass-card p-5">
            <h3 className="section-title">租金收缴率投放前后对比</h3>
            <LineChart
              data={[]}
              height={220}
              showArea
              yAxisName="收缴率(%)"
              xAxisData={beforeAfterRent.before.concat(beforeAfterRent.after).map((_, i, arr) => {
                const arr2 = beforeAfterRent.before.concat(beforeAfterRent.after);
                return arr2[i]?.date;
              }).filter((x, i, arr) => arr.indexOf(x) === i)}
              series={[
                { name: '收缴率(前)', data: beforeAfterRent.before.map(d => d.value).concat(new Array(beforeAfterRent.after.length).fill(undefined as any)), color: '#EF4444' },
                { name: '收缴率(后)', data: new Array(beforeAfterRent.before.length).fill(undefined as any).concat(beforeAfterRent.after.map(d => d.value)), color: '#10B981' },
              ]}
            />
          </div>
          <div className="col-span-6 glass-card p-5">
            <h3 className="section-title">预警变化投放前后对比</h3>
            <BarChart
              data={[
                { name: '投放前总预警', value: batchMetrics?.beforeWarnings || 0 },
                { name: '投放后总预警', value: batchMetrics?.afterWarnings || 0 },
              ]}
              height={200}
              unit="个"
              color="#06B6D4"
            />
          </div>
          <div className="col-span-6 glass-card p-5">
            <h3 className="section-title">轮候时长投放前后对比</h3>
            <BarChart
              data={[
                { name: '投放前(天)', value: batchMetrics?.beforeWaitDays || 0 },
                { name: '投放后(天)', value: batchMetrics?.afterWaitDays || 0 },
              ]}
              height={200}
              unit="天"
              color="#6366F1"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-6 glass-card p-5">
            <h3 className="section-title">空置率趋势</h3>
            <LineChart
              data={trendData}
              height={220}
              color="#FB8C00"
              showArea
              yAxisName="空置率(%)"
            />
          </div>

          <div className="col-span-6 glass-card p-5">
            <h3 className="section-title">预警变化趋势</h3>
            <LineChart
              data={warningTrendData}
              height={220}
              color="#EF4444"
              showArea
              yAxisName="预警数"
            />
          </div>
        </div>
      )}

      {!selectedBatch && (
        <div className="grid grid-cols-2 gap-5">
          <div className="glass-card p-5">
            <h3 className="section-title">租金收缴率趋势</h3>
            <LineChart
              data={rentTrendData}
              height={220}
              color="#43A047"
              showArea
              yAxisName="收缴率(%)"
            />
          </div>

          <div className="glass-card p-5">
            <h3 className="section-title">轮候时长趋势</h3>
            <LineChart
              data={waitDaysTrendData}
              height={220}
              color="#1E88E5"
              showArea
              yAxisName="天数"
            />
          </div>
        </div>
      )}

      {selectedCommunityId && communityWarnings.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">{communityData?.name}预警记录</h3>
            <span className="tag tag-warning text-xs">{communityWarnings.length}条</span>
          </div>
          <div className="space-y-3">
            {communityWarnings.map(w => (
              <div key={w.id} className="p-3 bg-dark-800/50 rounded-lg border border-dark-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`tag ${w.level === 'level2' ? 'tag-danger' : 'tag-warning'}`}>
                    {getWarningLevelName(w.level)}
                  </span>
                  <span className="tag tag-primary">{getWarningTypeName(w.type)}</span>
                  <span className="text-sm text-dark-300">
                    {getWarningStatusName(w.status)}
                  </span>
                </div>
                <div className="text-xs text-dark-400">
                  触发：{w.triggerDate} · 持续{w.processingDays}天
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {planBatches.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">
              {selectedBatch ? '该批次投放与运营关联' : '年度计划投放节点'}
            </h3>
          </div>
          <div className="space-y-3">
            {planBatches
              .filter((_, idx) => selectedBatchIdx === null || idx === selectedBatchIdx)
              .map(batch => {
                const batchWarnings = selectedCommunityId
                  ? communityWarnings.filter(w => {
                      if (!batch.releaseDate) return false;
                      const batchDate = new Date(batch.releaseDate);
                      const triggerDate = new Date(w.triggerDate);
                      return Math.abs(batchDate.getTime() - triggerDate.getTime()) < 60 * 24 * 60 * 60 * 1000;
                    })
                  : [];
                const isSelected = selectedBatchIdx !== null && planBatches[selectedBatchIdx]?.batchNumber === batch.batchNumber;
                return (
                  <div
                    key={batch.batchNumber}
                    className={cn(
                      'p-4 rounded-lg border transition-all',
                      isSelected
                        ? 'bg-primary-500/5 border-primary-500'
                        : 'bg-dark-800/50 border-dark-700'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">第{batch.batchNumber}批次</span>
                        <span className="tag tag-primary">
                          计划：{batch.releaseDate ? formatDate(batch.releaseDate) : '待定'}
                        </span>
                        {batch.actualReleaseDate && (
                          <span className="tag tag-success">
                            实际：{formatDate(batch.actualReleaseDate)}
                          </span>
                        )}
                        <span className="text-sm text-dark-300">{formatNumber(batch.units)}套</span>
                        {batch.status && (
                          <span className={cn('tag border text-xs',
                            batch.status === 'completed' ? 'bg-success/20 text-green-400 border-success/30' :
                            batch.status === 'in_progress' ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' :
                            batch.status === 'cancelled' ? 'bg-dark-800 text-dark-400 border-dark-600/30' :
                            'bg-dark-600/50 text-dark-300 border-dark-500/30'
                          )}>
                            {batch.status === 'completed' ? '已完成' :
                             batch.status === 'in_progress' ? '投放中' :
                             batch.status === 'cancelled' ? '已取消' : '待投放'}
                          </span>
                        )}
                      </div>
                      {selectedCommunityId && communityData && (
                        <div className="text-xs text-dark-400">
                          {communityData.name}当前空置率：{formatPercent(communityData.vacancyRate)} · 
                          收缴率：{formatPercent(communityData.rentCollectionRate)}
                        </div>
                      )}
                    </div>
                    {batchWarnings.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dark-700">
                        <div className="text-xs text-orange-400 mb-1">关联预警（±60天）：</div>
                        {batchWarnings.map(w => (
                          <div key={w.id} className="text-xs text-dark-400 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-orange-400" />
                            {getWarningLevelName(w.level)} · {getWarningTypeName(w.type)} · {getWarningStatusName(w.status)} · {w.triggerDate}
                          </div>
                        ))}
                      </div>
                    )}
                    {batch.deviationReason && (
                      <div className="mt-2 text-xs text-orange-300 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>偏差原因：{batch.deviationReason}</span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-7 glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold text-white">优化策略建议</h3>
          </div>
          <div className="space-y-3">
            {currentReport.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-4 bg-dark-800/50 rounded-lg border border-dark-700 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-400">
                  {index + 1}
                </div>
                <p className="text-sm text-dark-200 leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-5 glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-danger" />
            <h3 className="text-lg font-semibold text-white">清退方案推荐</h3>
          </div>
          <div className="space-y-3">
            {currentReport.evictionPlan.map((plan, index) => (
              <div
                key={index}
                className="p-4 bg-dark-800/50 rounded-lg border border-dark-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{plan.communityName}</span>
                  <span className={`tag ${priorityColors[plan.priority]}`}>
                    {plan.priority === 'high' ? '高优先级' : plan.priority === 'medium' ? '中优先级' : '低优先级'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-400">{plan.reason}</span>
                  <span className="text-dark-200">涉及 {plan.count} 户</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 btn btn-secondary justify-center text-sm">
            查看完整清退方案
          </button>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="section-title">健康度评分</h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { name: '分配效率', score: communityData ? Math.round(communityData.allocationEfficiency) : 78, color: 'primary' },
            { name: '空置控制', score: communityData ? Math.round(100 - communityData.vacancyRate * 3) : 85, color: 'success' },
            { name: '租金管理', score: communityData ? Math.round(communityData.rentCollectionRate) : 82, color: 'info' },
            { name: '服务质量', score: communityData ? Math.round(communityData.satisfaction) : 75, color: 'warning' },
            {
              name: '综合评分',
              score: communityData
                ? Math.round((communityData.allocationEfficiency + (100 - communityData.vacancyRate * 3) + communityData.rentCollectionRate + communityData.satisfaction) / 4)
                : 80,
              color: 'primary',
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(51, 65, 85, 0.5)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${item.score * 2.51} 251`}
                    className={cn(
                      item.color === 'primary' && 'text-primary-500',
                      item.color === 'success' && 'text-green-500',
                      item.color === 'warning' && 'text-orange-500',
                      item.color === 'info' && 'text-cyan-500'
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{item.score}</span>
                </div>
              </div>
              <div className="text-sm text-dark-300">{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function YoYItem({ label, value, unit, lowerIsBetter = false }: { label: string; value: number; unit: string; lowerIsBetter?: boolean }) {
  const isPositive = lowerIsBetter ? value < 0 : value > 0;
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
      <span className="text-sm text-dark-300">{label}</span>
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        <ChangeIcon className="w-4 h-4" />
        {value > 0 ? '+' : ''}{value.toFixed(1)}{unit}
      </div>
    </div>
  );
}
