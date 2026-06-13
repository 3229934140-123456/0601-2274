import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Calendar,
  Home,
  Users,
  DollarSign,
  Smile,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { getCommunityById, getCommunity7DayOccupancyTrend, getCommunityComplaints, getCommunityRentRecords } from '../../data/mockData';
import { useAppStore } from '../../store';
import KpiCard from '../../components/KpiCard';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import WarningCard from '../../components/WarningCard';
import { formatPercent, formatCurrency, getComplaintTypeName, formatDate, getWarningLevelName } from '../../utils/format';
import { useMemo, useState } from 'react';
import type { ComplaintType } from '../../types';

export default function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const community = getCommunityById(id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'rent' | 'units'>('overview');

  const occupancyTrend = useMemo(() => {
    if (!community) return [];
    return getCommunity7DayOccupancyTrend(community.id).map(d => ({
      date: d.date.substring(5),
      value: d.occupancyRate,
      name: '入住率',
    }));
  }, [community]);

  const complaints = useMemo(() => {
    if (!community) return [];
    return getCommunityComplaints(community.id);
  }, [community]);

  const rentRecords = useMemo(() => {
    if (!community) return [];
    return getCommunityRentRecords(community.id);
  }, [community]);

  const warnings = useAppStore((state) => state.warnings);

  const communityWarnings = useMemo(() => {
    return warnings.filter(w => w.communityId === id && w.status !== 'resolved');
  }, [warnings, id]);

  const complaintTypeData = useMemo(() => {
    const typeMap: Record<string, number> = {};
    complaints.forEach(c => {
      typeMap[c.type] = (typeMap[c.type] || 0) + 1;
    });
    const colors: Record<string, string> = {
      maintenance: '#1E88E5',
      hygiene: '#43A047',
      security: '#FB8C00',
      noise: '#E53935',
      service: '#8E24AA',
      other: '#546E7A',
    };
    return Object.entries(typeMap).map(([name, value]) => ({
      name: getComplaintTypeName(name),
      value,
      color: colors[name] || '#546E7A',
    }));
  }, [complaints]);

  const rentTrendData = useMemo(() => {
    return rentRecords.map(r => ({
      date: r.month.substring(5) + '月',
      value: r.rate,
      name: '收缴率',
    }));
  }, [rentRecords]);

  const unitTypeData = useMemo(() => {
    if (!community) return [];
    return community.unitTypes.map(ut => ({
      name: ut.type,
      value: ut.count,
    }));
  }, [community]);

  if (!community) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-400">小区不存在</div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: '总览' },
    { key: 'complaints', label: '投诉管理' },
    { key: 'rent', label: '租金收缴' },
    { key: 'units', label: '房源明细' },
  ];

  const complaintStatusMap: Record<string, { label: string; class: string; icon: any }> = {
    pending: { label: '待处理', class: 'tag-warning', icon: Clock },
    processing: { label: '处理中', class: 'tag-primary', icon: AlertTriangle },
    resolved: { label: '已解决', class: 'tag-success', icon: CheckCircle },
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white">{community.name}</h2>
          <div className="flex items-center gap-4 mt-1 text-sm text-dark-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {community.address}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {community.buildYear}年建成
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {community.propertyCompany}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <KpiCard
          title="空置率"
          value={community.vacancyRate}
          change={-0.5}
          icon={<Home className="w-5 h-5" />}
          color="warning"
          format="percent"
        />
        <KpiCard
          title="租金收缴率"
          value={community.rentCollectionRate}
          change={1.2}
          icon={<DollarSign className="w-5 h-5" />}
          color="success"
          format="percent"
        />
        <KpiCard
          title="住户满意度"
          value={community.satisfaction}
          change={0.8}
          icon={<Smile className="w-5 h-5" />}
          color="info"
          format="percent"
        />
        <KpiCard
          title="在住户数"
          value={community.occupiedUnits}
          change={2.3}
          icon={<Users className="w-5 h-5" />}
          color="primary"
          format="number"
          unit="户"
        />
      </div>

      <div className="glass-card p-2">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-5">
          {communityWarnings.length > 0 && (
            <div className="glass-card p-5 border-l-4 border-l-danger">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title mb-0">
                  <AlertTriangle className="w-5 h-5 text-danger mr-2" />
                  当前预警 ({communityWarnings.length}起)
                </h3>
                <button
                  className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  onClick={() => navigate('/warnings')}
                >
                  查看全部 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {communityWarnings.map(warning => (
                  <WarningCard key={warning.id} warning={warning} />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-7 glass-card p-5">
              <h3 className="section-title">近7天入住趋势</h3>
              <LineChart
                data={occupancyTrend}
                height={300}
                color="#1E88E5"
                showArea
                yAxisName="入住率(%)"
              />
            </div>

            <div className="col-span-5 glass-card p-5">
              <h3 className="section-title">户型分布</h3>
              <PieChart
                data={unitTypeData}
                height={300}
                totalLabel="总套数"
                radius={['55%', '78%']}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-6 glass-card p-5">
              <h3 className="section-title">投诉类型分布</h3>
              <PieChart
                data={complaintTypeData}
                height={280}
                totalLabel="总投诉"
                radius={['55%', '78%']}
              />
            </div>

            <div className="col-span-6 glass-card p-5">
              <h3 className="section-title">租金收缴率趋势</h3>
              <LineChart
                data={rentTrendData}
                height={280}
                color="#43A047"
                showArea
                yAxisName="收缴率(%)"
              />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0">基本信息</h3>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div className="space-y-3">
                <InfoItem label="小区名称" value={community.name} />
                <InfoItem label="所在区域" value={community.district} />
                <InfoItem label="详细地址" value={community.address} />
              </div>
              <div className="space-y-3">
                <InfoItem label="总房源" value={`${community.totalUnits}套`} />
                <InfoItem label="已入住" value={`${community.occupiedUnits}套`} />
                <InfoItem label="空置房源" value={`${community.vacantUnits}套`} />
              </div>
              <div className="space-y-3">
                <InfoItem label="物业公司" value={community.propertyCompany} />
                <InfoItem label="建成年份" value={`${community.buildYear}年`} />
                <InfoItem label="在住人数" value={`约${Math.floor(community.occupiedUnits * 2.5)}人`} />
              </div>
              <div className="space-y-3">
                <InfoItem label="本月投诉" value={`${complaints.filter(c => new Date(c.createDate).getMonth() === new Date().getMonth()).length}件`} />
                <InfoItem label="待处理投诉" value={`${complaints.filter(c => c.status === 'pending').length}件`} />
                <InfoItem label="平均租金" value={formatCurrency(1500)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">投诉列表</h3>
            <div className="flex gap-2">
              <select className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-primary-500">
                <option>全部类型</option>
                <option>设施维修</option>
                <option>环境卫生</option>
                <option>安全保卫</option>
                <option>噪音扰民</option>
                <option>服务态度</option>
              </select>
              <select className="px-3 py-1.5 bg-dark-700 border border-dark-600 rounded-lg text-sm text-dark-200 focus:outline-none focus:border-primary-500">
                <option>全部状态</option>
                <option>待处理</option>
                <option>处理中</option>
                <option>已解决</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">投诉编号</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">标题</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">类型</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">投诉人</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">房号</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">提交时间</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">状态</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(complaint => {
                  const statusInfo = complaintStatusMap[complaint.status];
                  const StatusIcon = statusInfo.icon;
                  return (
                    <tr key={complaint.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-dark-300 font-mono">{complaint.id}</td>
                      <td className="py-3 px-4 text-sm text-white font-medium">{complaint.title}</td>
                      <td className="py-3 px-4">
                        <span className="tag tag-primary">{getComplaintTypeName(complaint.type)}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-dark-300">{complaint.residentName}</td>
                      <td className="py-3 px-4 text-sm text-dark-300">{complaint.unitNumber}</td>
                      <td className="py-3 px-4 text-sm text-dark-400">{complaint.createDate}</td>
                      <td className="py-3 px-4">
                        <span className={`tag ${statusInfo.class} gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rent' && (
        <div className="space-y-5">
          <div className="glass-card p-5">
            <h3 className="section-title">租金收缴趋势（近12个月）</h3>
            <LineChart
              data={rentTrendData}
              height={320}
              color="#43A047"
              showArea
              yAxisName="收缴率(%)"
            />
          </div>

          <div className="glass-card p-5">
            <h3 className="section-title">收缴明细</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">月份</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">应收金额</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">实收金额</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">收缴率</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">欠费户数</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">欠费金额</th>
                  </tr>
                </thead>
                <tbody>
                  {rentRecords.slice().reverse().map(record => (
                    <tr key={record.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-white font-medium">{record.month}</td>
                      <td className="py-3 px-4 text-sm text-dark-300 text-right">{formatCurrency(record.shouldCollect)}</td>
                      <td className="py-3 px-4 text-sm text-green-400 text-right">{formatCurrency(record.actualCollect)}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={record.rate >= 90 ? 'text-green-400' : record.rate >= 80 ? 'text-orange-400' : 'text-red-400'}>
                          {formatPercent(record.rate)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-dark-300 text-right">{record.arrearsCount}户</td>
                      <td className="py-3 px-4 text-sm text-red-400 text-right">{formatCurrency(record.arrearsAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'units' && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-5">
            {community.unitTypes.map(ut => (
              <div key={ut.type} className="glass-card p-5 text-center">
                <div className="text-3xl font-bold text-primary-400 mb-1">{ut.count}</div>
                <div className="text-sm text-dark-300">{ut.type}</div>
                <div className="text-xs text-dark-500 mt-1">约{ut.area}㎡/套</div>
              </div>
            ))}
          </div>

          <div className="glass-card p-5">
            <h3 className="section-title">房源状态分布</h3>
            <PieChart
              data={[
                { name: '已入住', value: community.occupiedUnits, color: '#43A047' },
                { name: '空置中', value: community.vacantUnits, color: '#FB8C00' },
                { name: '维修中', value: Math.floor(community.totalUnits * 0.02), color: '#E53935' },
                { name: '装修中', value: Math.floor(community.totalUnits * 0.03), color: '#8E24AA' },
              ]}
              height={300}
              totalLabel="总房源"
              radius={['55%', '78%']}
            />
          </div>

          <div className="glass-card p-5">
            <h3 className="section-title">户型面积分布</h3>
            <BarChart
              data={community.unitTypes.map(ut => ({ name: ut.type, value: ut.area }))}
              height={250}
              horizontal={false}
              unit="㎡"
              color="#1E88E5"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-dark-500 mb-1">{label}</div>
      <div className="text-sm text-dark-200">{value}</div>
    </div>
  );
}
