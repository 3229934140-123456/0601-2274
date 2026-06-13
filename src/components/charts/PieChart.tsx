import { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface PieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title?: string;
  center?: string[];
  radius?: string[];
  height?: number;
  showLabel?: boolean;
  totalLabel?: string;
}

const defaultColors = ['#1E88E5', '#00ACC1', '#43A047', '#FB8C00', '#E53935', '#8E24AA', '#6D4C41', '#546E7A'];

export default function PieChart({
  data,
  title,
  center = ['50%', '50%'],
  radius = ['50%', '75%'],
  height = 300,
  showLabel = false,
  totalLabel,
}: PieChartProps) {
  const chartRef = useRef<any>(null);

  const getOption = (): EChartsOption => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(100, 181, 246, 0.3)',
        textStyle: {
          color: '#E2E8F0',
          fontSize: 12,
        },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        show: true,
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: {
          color: '#94A3B8',
          fontSize: 12,
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 12,
      },
      series: [
        {
          type: 'pie',
          radius,
          center,
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#0F172A',
            borderWidth: 2,
          },
          label: {
            show: showLabel,
            position: 'center',
            formatter: totalLabel
              ? `{total|${total}}\n{name|${totalLabel}}}`
              : `{total|${total}}`,
            rich: {
              total: {
              fontSize: 24,
              fontWeight: 'bold',
              color: '#fff',
              lineHeight: 30,
            },
            name: {
              fontSize: 12,
              color: '#94A3B8',
              lineHeight: 20,
            },
          },
        },
        emphasis: {
          scale: true,
          scaleSize: 8,
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: {
            color: item.color || defaultColors[index % defaultColors.length],
          },
        })),
      },
    ],
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

export { defaultColors };
