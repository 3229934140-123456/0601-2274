import { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface BarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title?: string;
  height?: number;
  horizontal?: boolean;
  showValue?: boolean;
  unit?: string;
  color?: string;
  reversed?: boolean;
}

export default function BarChart({
  data,
  title,
  height = 300,
  horizontal = true,
  showValue = true,
  unit = '',
  color = '#1E88E5',
  reversed = false,
}: BarChartProps) {
  const chartRef = useRef<any>(null);

  const getOption = (): EChartsOption => {
    const sortedData = [...data].sort((a, b) =>
      reversed ? b.value - a.value : a.value - b.value
    );

    const colors = sortedData.map((item, index) => {
      if (item.color) {
        const hex = item.color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return {
          main: item.color,
          light: `rgba(${r}, ${g}, ${b}, 0.5)`,
        };
      }
      const ratio = index / (sortedData.length - 1 || 1);
      const r = Math.round(30 + ratio * 200);
      const g = Math.round(136 - ratio * 80);
      const b = Math.round(229 - ratio * 150);
      return {
        main: `rgb(${r}, ${g}, ${b})`,
        light: `rgba(${r}, ${g}, ${b}, 0.5)`,
      };
    });

    return {
      tooltip: {
        trigger: horizontal ? 'axis' : 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(100, 181, 246, 0.3)',
        textStyle: {
          color: '#E2E8F0',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `${p.name}: ${p.value}${unit}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: title ? 40 : 10,
        containLabel: true,
      },
      xAxis: horizontal
        ? {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: '#94A3B8',
              fontSize: 11,
              formatter: `{value}${unit}`,
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(148, 163, 184, 0.1)',
                type: 'dashed',
              },
            },
          }
        : {
            type: 'category',
            data: sortedData.map(d => d.name),
            axisLine: {
              lineStyle: {
                color: 'rgba(148, 163, 184, 0.2)',
              },
            },
            axisTick: { show: false },
            axisLabel: {
              color: '#94A3B8',
              fontSize: 11,
            },
          },
      yAxis: horizontal
        ? {
            type: 'category',
            data: sortedData.map(d => d.name),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: '#CBD5E1',
              fontSize: 12,
            },
          }
        : {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              color: '#94A3B8',
              fontSize: 11,
              formatter: `{value}${unit}`,
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(148, 163, 184, 0.1)',
                type: 'dashed',
              },
            },
          },
      series: [
        {
          type: 'bar',
          barWidth: horizontal ? 14 : '40%',
          data: sortedData.map((item, index) => ({
            value: item.value,
            itemStyle: {
              color: {
                type: horizontal ? 'linear' : 'linear',
                x: 0,
                y: 0,
                x2: horizontal ? 1 : 0,
                y2: horizontal ? 0 : 1,
                colorStops: [
                  { offset: 0, color: colors[index].main },
                  { offset: 1, color: colors[index].light },
                ],
              },
              borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
            },
          })),
          label: {
            show: showValue,
            position: horizontal ? 'right' : 'top',
            color: '#E2E8F0',
            fontSize: 11,
            formatter: `{c}${unit}`,
          },
        },
      ],
      animationDuration: 1000,
      animationEasing: 'cubicOut',
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
