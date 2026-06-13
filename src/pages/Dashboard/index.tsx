import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Home as HomeIcon,
  DollarSign,
  Smile,
  Building2,
  Users,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import KpiCard from '../../components/KpiCard';
import ChinaHeatMap from '../../components/charts/ChinaHeatMap';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import LineChart from '../../components/charts/LineChart';
import WarningCard from '../../components/WarningCard';
import { useRegion } from '../../context/RegionContext';
import { useAuth } from '../../context/AuthContext';
import { nationalKPIData, provinces, warnings, communities, getCitiesByProvince, getCommunitiesByCity } from '../../data/mockData';
import { formatPercent, formatNumber } from '../../utils/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const { level, provinceId, cityId, provinceName, cityName } = useRegion();
  const { hasPermission } = useAuth();

  const kpiData = useMemo(() => {
    if (level === 'national') {
      return nationalKPIData;
    }
    if (level === 'province') {
      const province = provinces.find(p => p.id === provinceId);
      if (province) {
        return {
          allocationEfficiency: province.allocationEfficiency,
          allocationEfficiencyChange: 2.1,
          vacancyRate: province.vacancyRate,
          vacancyRateChange: -0.3,
          rentCollectionRate: province.rentCollectionRate,
          rentCollectionRateChange: 0.8,
          satisfaction: province.satisfaction,
          satisfactionChange: 0.5,
          totalCommunities: province.communityCount,
          totalUnits: province.totalUnits,
          totalWaiters: Math.floor(province.totalUnits * 0.35),
        };
      }
    }
    if (level === 'city') {
      const cities = getCitiesByProvince(provinceId || '');
      const city = cities.find(c => c.id === cityId);
      if (city) {
        return {
          allocationEfficiency: city.allocationEfficiency,
          allocationEfficiencyChange: 1.8,
          vacancyRate: city.vacancyRate,
          vacancyRateChange: -0.2,
          rentCollectionRate: city.rentCollectionRate,
          rentCollectionRateChange: 1.1,
          satisfaction: city.satisfaction,
          satisfactionChange: 0.6,
          totalCommunities: city.communityCount,
          totalUnits: city.totalUnits,
          totalWaiters: Math.floor(city.totalUnits * 0.4),
        };
      }
    }
    return nationalKPIData;
  }, [level, provinceId, cityId]);

  const rankingData = useMemo(() => {
    if (level === 'national') {
      return provinces
        .sort((a, b) => b.vacancyRate - a.vacancyRate)
        .slice(0, 10)
        .map(p => ({ name: p.name, value: p.vacancyRate }));
    }
    if (level === 'province') {
      return getCitiesByProvince(provinceId || '')
        .sort((a, b) => b.vacancyRate - a.vacancyRate)
        .slice(0, 10)
        .map(c => ({ name: c.name, value: c.vacancyRate }));
    }
    return [];
  }, [level, provinceId]);

  const rentRankingData = useMemo(() => {
    if (level === 'national') {
      return provinces
        .sort((a, b) => a.rentCollectionRate - b.rentCollectionRate)
        .slice(0, 10)
        .map(p => ({ name: p.name, value: p.rentCollectionRate }));
    }
    if (level === 'province') {
      return getCitiesByProvince(provinceId || '')
        .sort((a, b) => a.rentCollectionRate - b.rentCollectionRate)
        .slice(0, 10)
        .map(c => ({ name: c.name, value: c.rentCollectionRate }));
    }
    return [];
  }, [level, provinceId]);

  const communityList = useMemo(() => {
    if (level === 'city') {
      return getCommunitiesByCity(cityId || '').slice(0, 5);
    }
    return communities.slice(0, 5);
  }, [level, cityId]);

  const activeWarnings = warnings.filter(w => w.status !== 'resolved').slice(0, 4);
  const level1Count = warnings.filter(w => w.level === 'level1' && w.status !== 'resolved').length;
  const level2Count = warnings.filter(w => w.level === 'level2' && w.status !== 'resolved').length;

  const occupancyTrendData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      value: 85 + Math.sin(i * 0.5) * 3 + Math.random() * 2,
    };
  });

  const complaintTypeData = [
    { name: '设施维修', value: 35, color: '#1E88E5' },
    { name: '环境卫生', value: 25, color: '#43A047' },
    { name: '安全保卫', value: 18, color: '#FB8C00' },
    { name: '噪音扰民', value: 12, color: '#E53935' },
    { name: '服务态度', value: 10, color: '#8E24AA' },
  ];

  const getPageTitle = () => {
    if (level === 'national') return '全国保障性住房运营监测';
    if (level === 'province') return `${provinceName}保障性住房运营监测`;
    if (level === 'city') return `${cityName}保障性住房运营监测`;
    return '保障性住房运营监测';
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{getPageTitle()}</h2>
          <p className="text-dark-400 text-sm mt-1">
            数据更新时间：{new Date().toLocaleString('zh-CN')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="tag tag-success">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-1.5"></span>
            实时数据接入正常
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <KpiCard
          title="分配效率"
          value={kpiData.allocationEfficiency}
          change={kpiData.allocationEfficiencyChange}
          icon={<TrendingUp className="w-5 h-5" />}
          color="primary"
          format="percent"
        />
        <KpiCard
          title="空置率"
          value={kpiData.vacancyRate}
          change={kpiData.vacancyRateChange}
          icon={<HomeIcon className="w-5 h-5" />}
          color="warning"
          format="percent"
        />
        <KpiCard
          title="租金收缴率"
          value={kpiData.rentCollectionRate}
          change={kpiData.rentCollectionRateChange}
          icon={<DollarSign className="w-5 h-5" />}
          color="success"
          format="percent"
        />
        <KpiCard
          title="住户满意度"
          value={kpiData.satisfaction}
          change={kpiData.satisfactionChange}
          icon={<Smile className="w-5 h-5" />}
          color="info"
          format="percent"
        />
      </div>

      <div className="grid grid-cols-6 gap-5">
        <div className="glass-card p-5 col-span-1">
          <div className="text-dark-400 text-sm mb-2">保障小区</div>
          <div className="text-2xl font-bold text-white">{formatNumber(kpiData.totalCommunities)}</div>
          <div className="text-xs text-dark-500 mt-1">个</div>
        </div>
        <div className="glass-card p-5 col-span-1">
          <div className="text-dark-400 text-sm mb-2">总房源</div>
          <div className="text-2xl font-bold text-white">{formatNumber(kpiData.totalUnits)}</div>
          <div className="text-xs text-dark-500 mt-1">套</div>
        </div>
        <div className="glass-card p-5 col-span-1">
          <div className="text-dark-400 text-sm mb-2">轮候家庭</div>
          <div className="text-2xl font-bold text-white">{formatNumber(kpiData.totalWaiters)}</div>
          <div className="text-xs text-dark-500 mt-1">户</div>
        </div>
        <div className="glass-card p-5 col-span-1">
          <div className="text-dark-400 text-sm mb-2">一级预警</div>
          <div className="text-2xl font-bold text-orange-400">{level1Count}</div>
          <div className="text-xs text-dark-500 mt-1">起</div>
        </div>
        <div className="glass-card p-5 col-span-1">
          <div className="text-dark-400 text-sm mb-2">二级预警</div>
          <div className="text-2xl font-bold text-red-400">{level2Count}</div>
          <div className="text-xs text-dark-500 mt-1">起</div>
        </div>
        <div className="glass-card p-5 col-span-1">
          <div className="text-dark-400 text-sm mb-2">本周新增投诉</div>
          <div className="text-2xl font-bold text-cyan-400">1,268</div>
          <div className="text-xs text-dark-500 mt-1">件</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-7">
          <ChinaHeatMap />
        </div>

        <div className="col-span-5 space-y-5">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">空置率排名 TOP10</h3>
              <button
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                onClick={() => navigate('/warnings')}
              >
                查看全部 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <BarChart
              data={rankingData}
              height={280}
              unit="%"
              horizontal
              color="#FB8C00"
            />
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">租金收缴率排名 TOP10</h3>
              <button className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                查看全部 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <BarChart
              data={rentRankingData}
              height={280}
              unit="%"
              horizontal
              color="#43A047"
              reversed
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5">
          <div className="glass-card p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">入住率趋势</h3>
              <div className="flex gap-1">
                <button className="px-2 py-1 text-xs bg-primary-500/20 text-primary-400 rounded">近7天</button>
                <button className="px-2 py-1 text-xs text-dark-400 hover:text-white hover:bg-dark-700 rounded">近30天</button>
              </div>
            </div>
            <LineChart
              data={occupancyTrendData}
              height={260}
              color="#1E88E5"
              yAxisName="入住率(%)"
              showArea
            />
          </div>
        </div>

        <div className="col-span-4">
          <div className="glass-card p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">投诉类型分布</h3>
              <PieChartIcon className="w-5 h-5 text-primary-400" />
            </div>
            <PieChart
              data={complaintTypeData}
              height={260}
              totalLabel="投诉总数"
              radius={['55%', '78%']}
            />
          </div>
        </div>

        <div className="col-span-3">
          <div className="glass-card p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">预警概览</h3>
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-danger/10 rounded-lg border border-danger/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-400 font-medium">二级预警</span>
                  <span className="text-xl font-bold text-red-400">{level2Count}</span>
                </div>
                <div className="text-xs text-dark-400 mt-1">需三级审批处理</div>
              </div>
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-400 font-medium">一级预警</span>
                  <span className="text-xl font-bold text-orange-400">{level1Count}</span>
                </div>
                <div className="text-xs text-dark-400 mt-1">待物业/区中心处理</div>
              </div>
              <div className="p-3 bg-success/10 rounded-lg border border-success/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-400 font-medium">已解除</span>
                  <span className="text-xl font-bold text-green-400">12</span>
                </div>
                <div className="text-xs text-dark-400 mt-1">本月累计</div>
              </div>
              <button
                className="w-full mt-2 btn btn-primary justify-center text-sm"
                onClick={() => navigate('/warnings')}
              >
                查看全部预警
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">最新预警</h3>
              <button
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                onClick={() => navigate('/warnings')}
              >
                全部预警 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {activeWarnings.map(warning => (
                <WarningCard key={warning.id} warning={warning} />
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="glass-card p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">小区列表</h3>
              <Building2 className="w-5 h-5 text-primary-400" />
            </div>
            <div className="space-y-2">
              {communityList.map(community => (
                <div
                  key={community.id}
                  className="p-3 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 cursor-pointer transition-colors flex items-center justify-between group"
                  onClick={() => navigate(`/community/${community.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{community.name}</div>
                    <div className="text-xs text-dark-400 mt-0.5">{community.district} · {community.totalUnits}套</div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-medium text-primary-400">{formatPercent(community.vacancyRate)}</div>
                    <div className="text-xs text-dark-500">空置率</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
