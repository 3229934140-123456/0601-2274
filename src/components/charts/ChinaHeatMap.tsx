import { useState } from 'react';
import { provinces } from '../../data/mockData';
import { useRegion } from '../../context/RegionContext';
import { useNavigate } from 'react-router-dom';
import { cn, formatPercent, formatNumber } from '../../utils/format';
import { MapPin, TrendingUp, Building2 } from 'lucide-react';

type MetricType = 'vacancyRate' | 'rentCollectionRate' | 'allocationEfficiency' | 'totalUnits';

interface ChinaHeatMapProps {
  metric?: MetricType;
  onProvinceClick?: (provinceId: string, provinceName: string) => void;
}

const metricConfig: Record<MetricType, { label: string; unit: string; colorRange: [string, string]; higherIsBetter: boolean }> = {
  vacancyRate: {
    label: '空置率',
    unit: '%',
    colorRange: ['#1E88E5', '#E53935'],
    higherIsBetter: false,
  },
  rentCollectionRate: {
    label: '租金收缴率',
    unit: '%',
    colorRange: ['#E53935', '#43A047'],
    higherIsBetter: true,
  },
  allocationEfficiency: {
    label: '分配效率',
    unit: '%',
    colorRange: ['#FB8C00', '#1E88E5'],
    higherIsBetter: true,
  },
  totalUnits: {
    label: '总房源',
    unit: '套',
    colorRange: ['#1E88E5', '#8E24AA'],
    higherIsBetter: true,
  },
};

export default function ChinaHeatMap({ metric = 'vacancyRate', onProvinceClick }: ChinaHeatMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>(metric);
  const { setProvince, level } = useRegion();
  const navigate = useNavigate();

  const config = metricConfig[selectedMetric];

  const getColor = (value: number) => {
    const values = provinces.map(p => p[selectedMetric] as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const ratio = (value - min) / (max - min || 1);

    const adjustedRatio = config.higherIsBetter ? ratio : 1 - ratio;

    const startColor = hexToRgb(config.colorRange[0]);
    const endColor = hexToRgb(config.colorRange[1]);

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * adjustedRatio);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * adjustedRatio);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * adjustedRatio);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const handleProvinceClick = (provinceId: string, provinceName: string) => {
    if (onProvinceClick) {
      onProvinceClick(provinceId, provinceName);
    } else {
      setProvince(provinceId, provinceName);
    }
  };

  const metricOptions: { value: MetricType; label: string }[] = [
    { value: 'vacancyRate', label: '空置率' },
    { value: 'rentCollectionRate', label: '租金收缴率' },
    { value: 'allocationEfficiency', label: '分配效率' },
    { value: 'totalUnits', label: '总房源' },
  ];

  const eastRegion = ['北京市', '天津市', '河北省', '山东省', '江苏省', '上海市', '浙江省', '福建省'];
  const centralRegion = ['河南省', '湖北省', '湖南省', '安徽省', '江西省', '山西省'];
  const southRegion = ['广东省', '广西壮族自治区', '海南省', '台湾省'];
  const westRegion = ['四川省', '重庆市', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区'];
  const northeastRegion = ['辽宁省', '吉林省', '黑龙江省'];
  const innerMongolia = ['内蒙古自治区'];

  const getRegionProvinces = (region: string[]) => {
    return provinces.filter(p => region.includes(p.name));
  };

  return (
    <div className="glass-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">全国{config.label}热力分布</h3>
        <div className="flex gap-1">
          {metricOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedMetric(opt.value)}
              className={cn(
                'px-3 py-1 text-xs rounded-lg transition-all',
                selectedMetric === opt.value
                  ? 'bg-primary-500 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[
          { name: '东北地区', provinces: getRegionProvinces(northeastRegion) },
          { name: '华北地区', provinces: [...getRegionProvinces(eastRegion.slice(0, 3)), ...getRegionProvinces(innerMongolia)] },
          { name: '华东地区', provinces: getRegionProvinces(eastRegion.slice(3)) },
          { name: '华中地区', provinces: getRegionProvinces(centralRegion) },
          { name: '华南地区', provinces: getRegionProvinces(southRegion) },
          { name: '西南地区', provinces: getRegionProvinces(westRegion.slice(0, 5)) },
          { name: '西北地区', provinces: getRegionProvinces(westRegion.slice(5)) },
        ].map(region => (
          region.provinces.length > 0 && (
            <div key={region.name} className="flex items-start gap-3">
              <div className="w-14 text-xs text-dark-500 pt-2 flex-shrink-0">{region.name}</div>
              <div className="flex flex-wrap gap-1.5">
                {region.provinces.map(province => {
                  const value = province[selectedMetric] as number;
                  const color = getColor(value);
                  const isHovered = hoveredProvince === province.id;

                  return (
                    <button
                      key={province.id}
                      onMouseEnter={() => setHoveredProvince(province.id)}
                      onMouseLeave={() => setHoveredProvince(null)}
                      onClick={() => handleProvinceClick(province.id, province.name)}
                      className={cn(
                        'relative px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 group',
                        'hover:scale-105 hover:z-10',
                        isHovered ? 'ring-2 ring-white/50 shadow-lg' : ''
                      )}
                      style={{
                        backgroundColor: `${color}25`,
                        color: color,
                        borderColor: `${color}50`,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      <span className="relative z-10">{province.name}</span>

                      {isHovered && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 glass-card p-3 text-left pointer-events-none">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4" style={{ color }} />
                            <span className="font-medium text-white text-sm">{province.name}</span>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-dark-400">{config.label}</span>
                              <span className="text-white font-medium">
                                {selectedMetric === 'totalUnits' ? formatNumber(value) : formatPercent(value)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark-400">小区数量</span>
                              <span className="text-dark-200">{formatNumber(province.communityCount)}个</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark-400">总房源</span>
                              <span className="text-dark-200">{formatNumber(province.totalUnits)}套</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-dark-700">
        <span className="text-xs text-dark-500">低</span>
        <div className="flex-1 h-2 rounded-full max-w-xs"
          style={{
            background: `linear-gradient(to right, ${config.colorRange[config.higherIsBetter ? 0 : 1]}, ${config.colorRange[config.higherIsBetter ? 1 : 0]})`,
            opacity: 0.6,
          }}
        />
        <span className="text-xs text-dark-500">高</span>
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-dark-400">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-primary-400" />
          <span>共 {provinces.length} 个省级行政区</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-green-400" />
          <span>点击省份查看详情</span>
        </div>
      </div>
    </div>
  );
}
