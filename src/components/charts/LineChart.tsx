import { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface LineChartProps {
  data: Array<{ date: string; value: number; name?: string }>;
  title?: string;
  color?: string;
  yAxisName?: string;
  height?: number;
  showArea?: boolean;
  smooth?: boolean;
  series?: Array<{ name: string; data: number[]; color?: string }>;
  xAxisData?: string[];
}

export default function LineChart({
  data,
  title,
  color = '#1E88E5',
  yAxisName,
  height = 300,
  showArea = true,
  smooth = true,
  series,
  xAxisData,
}: LineChartProps) {
  const chartRef = useRef<any>(null);

  const getOption = (): EChartsOption => {
    const xData = xAxisData || data.map(d => d.date);
    const seriesData = series || [
      {
        name: data[0]?.name || '数值',
        data: data.map(d => d.value),
        color,
      },
    ];

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(100, 181, 246, 0.3)',
        textStyle: {
          color: '#E2E8F0',
          fontSize: 12,
        },
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(100, 181, 246, 0.5)',
          },
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: title ? 40 : 10,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xData,
        axisLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.2)',
          },
        },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 11,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        name: yAxisName,
        nameTextStyle: {
          color: '#94A3B8',
          fontSize: 11,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#94A3B8',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(148, 163, 184, 0.1)',
            type: 'dashed',
          },
        },
      },
      series: seriesData.map((s, index) => ({
        name: s.name,
        type: 'line',
        smooth,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 2.5,
          color: s.color || color,
          shadowColor: s.color || color,
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        itemStyle: {
          color: s.color || color,
          borderColor: '#0F172A',
          borderWidth: 2,
        },
        areaStyle: showArea
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: `${s.color || color}30`,
                  },
                  {
                    offset: 1,
                    color: `${s.color || color}00`,
                  },
                ],
              },
            }
          : undefined,
        data: s.data,
      })),
    };
  };

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ height }}>
      {title && <div className="text-sm font-medium text-white mb-2">{title}</div>}
      <ReactECharts
        ref={chartRef}
        option={getOption()}
        style={{ height: title ? height - 30 : height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
