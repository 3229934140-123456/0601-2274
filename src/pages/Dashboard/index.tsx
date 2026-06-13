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
import { nationalKPIData, provinces, communities, getCitiesByProvince, getCommunitiesByCity, getCommunityById } from '../../data/mockData';
import { formatPercent, formatNumber } from '../../utils/format';
import { useAppStore } from '../../store';
import { roleHierarchy } from '../../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { level, provinceId, cityId, provinceName, cityName } = useRegion();
  const { user, hasPermission } = useAuth();
  const storeWarnings = useAppStore((state) => state.warnings);

  const filteredWarnings = useMemo(() => {
    if (!user) return storeWarnings;

    if (user.role === 'national' || user.role === 'provincial' || user.role === 'municipal') {
      return storeWarnings;
    }

    if (user.role === 'district') {
      return storeWarnings.filter(w => {
        const community = getCommunityById(w.communityId);
        return community?.district === '朝阳区' || community?.district?.includes('朝阳');
      });
    }

    if (user.role === 'property') {
      return storeWarnings.filter(w => w.communityId === user.regionId);
    }

    return storeWarnings;
  }, [storeWarnings, user]);

  const kpiData = useMemo(() => {
    if (!user) return nationalKPIData;

    if (user.role === 'district') {
      const districtCommunities = communities.filter(c => c.district === '朝阳区' || c.district?.includes('朝阳'));
      const totalUnits = districtCommunities.reduce((sum, c) => sum + c.totalUnits, 0);
      const avgVacancy = districtCommunities.reduce((sum, c) => sum + c.vacancyRate, 0) / districtCommunities.length;
      const avgRent = districtCommunities.reduce((sum, c) => sum + c.rentCollectionRate, 0) / districtCommunities.length;
      const avgEfficiency = districtCommunities.reduce((sum, c) => sum + c.allocationEfficiency, 0) / districtCommunities.length;
      const avgSatisfaction = districtCommunities.reduce((sum, c) => sum + c.satisfaction, 0) / districtCommunities.length;
      
      return {
        allocationEfficiency: Math.round(avgEfficiency * 10) / 10,
        allocationEfficiencyChange: 1.5,
        vacancyRate: Math.round(avgVacancy * 10) / 10,
        vacancyRateChange: -0.2,
        rentCollectionRate: Math.round(avgRent * 10) / 10,
        rentCollectionRateChange: 0.6,
        satisfaction: Math.round(avgSatisfaction * 10) / 10,
        satisfactionChange: 0.3,
        totalCommunities: districtCommunities.length,
        totalUnits,
        totalWaiters: Math.floor(totalUnits * 0.42),
      };
    }

    if (user.role === 'property') {
      const community = getCommunityById(user.regionId);
      if (community) {
        return {
          allocationEfficiency: community.allocationEfficiency,
          allocationEfficiencyChange: 1.2,
          vacancyRate: community.vacancyRate,
          vacancyRateChange: -0.1,
          rentCollectionRate: community.rentCollectionRate,
          rentCollectionRateChange: 0.5,
          satisfaction: community.satisfaction,
          satisfactionChange: 0.4,
          totalCommunities: 1,
          totalUnits: community.totalUnits,
          totalWaiters: Math.floor(community.totalUnits * 0.45),
        };
      }
    }

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
  }, [level, provinceId, cityId, user]);

  const rankingData = useMemo(() => {
    if (!user) return [];
    
    if (user.role === 'district') {
      const districtCommunities = communities.filter(c => c.district === '朝阳区' || c.district?.includes('朝阳'));
      return districtCommunities
        .sort((a, b) => b.vacancyRate - a.vacancyRate)
        .slice(0, 10)
        .map(c => ({ name: c.name, value: c.vacancyRate }));
    }

    if (user.role === 'property') {
      return [];
    }

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
    if (level === 'city') {
      return getCommunitiesByCity(cityId || '')
        .sort((a, b) => b.vacancyRate - a.vacancyRate)
        .slice(0, 10)
        .map(c => ({ name: c.name, value: c.vacancyRate }));
    }
    return [];
  }, [level, provinceId, cityId, user]);

  const rentRankingData = useMemo(() => {
    if (!user) return [];

    if (user.role === 'district') {
      const districtCommunities = communities.filter(c => c.district === '朝阳区' || c.district?.includes('朝阳'));
      return districtCommunities
        .sort((a, b) => a.rentCollectionRate - b.rentCollectionRate)
        .slice(0, 10)
        .map(c => ({ name: c.name, value: c.rentCollectionRate }));
    }

    if (user.role === 'property') {
      return [];
    }

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
    if (level === 'city') {
      return getCommunitiesByCity(cityId || '')
        .sort((a, b) => a.rentCollectionRate - b.rentCollectionRate)
        .slice(0, 10)
        .map(c => ({ name: c.name, value: c.rentCollectionRate }));
    }
    return [];
  }, [level, provinceId, cityId, user]);

  const communityList = useMemo(() => {
    if (!user) return communities.slice(0, 5);

    if (user.role === 'district') {
      return communities.filter(c => c.district === '朝阳区' || c.district?.includes('朝阳')).slice(0, 5);
    }

    if (user.role === 'property') {
      const community = getCommunityById(user.regionId);
      return community ? [community] : [];
    }

    if (level === 'city') {
      return getCommunitiesByCity(cityId || '').slice(0, 5);
    }
    return communities.slice(0, 5);
  }, [level, cityId, user]);

  const activeWarnings = filteredWarnings.filter(w => w.status !== 'resolved').slice(0, 4);
  const level1Count = filteredWarnings.filter(w => w.level === 'level1' && w.status !== 'resolved').length;
  const level2Count = filteredWarnings.filter(w => w.level === 'level2' && w.status !== 'resolved').length;
  const resolvedCount = filteredWarnings.filter(w => w.status === 'resolved').length;

  const occupancyTrendData = useMemo(() => {
    const baseRate = kpiData.vacancyRate ? 100 - kpiData.vacancyRate : 88;
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        value: Math.max(75, Math.min(98, baseRate + Math.sin(i * 0.5) * 3 + Math.random() * 2)),
      };
    });
  }, [kpiData.vacancyRate]);

  const complaintTypeData = useMemo(() => {
    const baseCount = kpiData.totalCommunities * 30;
    return [
      { name: '设施维修', value: Math.round(baseCount * 0.3), color: '#1E88E5' },
      { name: '环境卫生', value: Math.round(baseCount * 0.25), color: '#43A047' },
      { name: '安全保卫', value: Math.round(baseCount * 0.2), color: '#FB8C00' },
      { name: '噪音扰民', value: Math.round(baseCount * 0.12), color: '#E53935' },
      { name: '服务态度', value: Math.round(baseCount * 0.13), color: '#8E24AA' },
    ];
  }, [kpiData.totalCommunities]);

  const getPageTitle = () => {
    if (user?.role === 'district') {
      return `${user.regionName}保障性住房运营监测`;
    }
    if (user?.role === 'property') {
      return `${user.regionName}运营监测`;
    }
    if (level === 'national') return '全国保障性住房运营监测';
    if (level === 'province') return `${provinceName}保障性住房运营监测`;
    if (level === 'city') return `${cityName}保障性住房运营监测`;
    return '保障性住房运营监测';
  };

  const showHeatMap = hasPermission(['national', 'provincial']);
  const showCommunityList = hasPermission(['national', 'provincial', 'municipal', 'district']) && communityList.length > 0;

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
          <div className="text-2xl font-bold text-cyan-400">{formatNumber(Math.floor(kpiData.totalCommunities * 6.3))}</div>
          <div className="text-xs text-dark-500 mt-1">件</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {showHeatMap ? (
          <div className="col-span-7">
            <ChinaHeatMap />
          </div>
        ) : (
          <div className="col-span-7">
            <div className="glass-card p-5 h-full">
              <h3 className="section-title mb-4">小区空置率排名</h3>
              <BarChart
                data={rankingData}
                height={350}
                unit="%"
                horizontal
                color="#FB8C00"
              />
            </div>
          </div>
        )}

        <div className="col-span-5 space-y-5">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">{showHeatMap ? '空置率排名 TOP10' : '租金收缴率排名'}</h3>
              <button
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                onClick={() => navigate('/warnings')}
              >
                查看全部 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <BarChart
              data={showHeatMap ? rankingData : rentRankingData}
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
                  <span className="text-xl font-bold text-green-400">{resolvedCount}</span>
                </div>
                <div className="text-xs text-dark-400 mt-1">累计处理</div>
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
              {activeWarnings.length > 0 ? (
                activeWarnings.map(warning => (
                  <WarningCard key={warning.id} warning={warning} />
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-dark-400">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-green-400" />
                  暂无待处理预警
                </div>
              )}
            </div>
          </div>
        </div>

        {showCommunityList && (
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
        )}
      </div>
    </div>
  );
}
