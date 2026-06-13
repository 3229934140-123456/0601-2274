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
} from 'lucide-react';
import { weeklyReports } from '../../data/mockData';
import LineChart from '../../components/charts/LineChart';
import { cn, formatPercent, formatNumber, formatDate } from '../../utils/format';

export default function Reports() {
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);
  const currentReport = weeklyReports[selectedReportIndex];

  const trendData = useMemo(() => {
    return weeklyReports.slice(0, 8).reverse().map(r => ({
      date: `第${r.weekNumber}周`,
      value: r.vacancyRate,
      name: '空置率',
    }));
  }, []);

  const rentTrendData = useMemo(() => {
    return weeklyReports.slice(0, 8).reverse().map(r => ({
      date: `第${r.weekNumber}周`,
      value: r.rentCollectionRate,
      name: '租金收缴率',
    }));
  }, []);

  const waitDaysTrendData = useMemo(() => {
    return weeklyReports.slice(0, 8).reverse().map(r => ({
      date: `第${r.weekNumber}周`,
      value: r.avgWaitDays,
      name: '轮候天数',
    }));
  }, []);

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

  const priorityColors: Record<string, string> = {
    high: 'bg-danger/20 text-red-400 border-danger/30',
    medium: 'bg-warning/20 text-orange-400 border-warning/30',
    low: 'bg-info/20 text-cyan-400 border-info/30',
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">运营健康报告</h2>
          <p className="text-dark-400 text-sm mt-1">
            每周自动生成运营健康报告，提供数据分析与优化建议
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

      <div className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <FileBarChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {currentReport.year}年第{currentReport.weekNumber}周运营健康报告
            </h3>
            <p className="text-sm text-dark-400">
              报告周期：{currentReport.startDate} 至 {currentReport.endDate}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-5">
          <StatCard
            title="空置率"
            value={currentReport.vacancyRate}
            change={currentReport.vacancyRateMoM}
            unit="%"
            icon={<Home className="w-5 h-5" />}
            color="warning"
            lowerIsBetter
          />
          <StatCard
            title="租金收缴率"
            value={currentReport.rentCollectionRate}
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
            value={currentReport.satisfaction}
            change={currentReport.satisfactionMoM}
            unit="分"
            icon={<Smile className="w-5 h-5" />}
            color="info"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 glass-card p-5">
          <h3 className="section-title">空置率趋势</h3>
          <LineChart
            data={trendData}
            height={250}
            color="#FB8C00"
            showArea
            yAxisName="空置率(%)"
          />
        </div>

        <div className="col-span-4 glass-card p-5">
          <h3 className="section-title">同比变化</h3>
          <div className="space-y-4">
            <YoYItem label="空置率同比" value={currentReport.vacancyRateYoY} unit="%" lowerIsBetter />
            <YoYItem label="租金收缴率同比" value={currentReport.rentCollectionRateYoY} unit="%" />
            <YoYItem label="轮候时长同比" value={currentReport.avgWaitDaysYoY} unit="天" lowerIsBetter />
            <YoYItem label="满意度同比" value={currentReport.satisfactionYoY} unit="分" />
          </div>
        </div>
      </div>

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
            { name: '分配效率', score: 78, color: 'primary' },
            { name: '空置控制', score: 85, color: 'success' },
            { name: '租金管理', score: 82, color: 'info' },
            { name: '服务质量', score: 75, color: 'warning' },
            { name: '综合评分', score: 80, color: 'primary' },
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
