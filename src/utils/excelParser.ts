import * as XLSX from 'xlsx';
import type { AllocationPlan, AllocationBatch } from '../types';

export interface ExcelRow {
  批次?: number | string;
  批次号?: number | string;
  batch?: number | string;
  投放时间?: string;
  投放日期?: string;
  日期?: string;
  date?: string;
  房源数量?: number | string;
  总套数?: number | string;
  套数?: number | string;
  units?: number | string;
  一室一厅?: number | string;
  两室一厅?: number | string;
  三室一厅?: number | string;
  四室两厅?: number | string;
  预计轮候人数?: number | string;
  轮候人数?: number | string;
  预计去化率?: number | string;
  去化率?: number | string;
}

export async function parseExcelFile(file: File): Promise<AllocationPlan> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

        const batches: AllocationBatch[] = [];
        let totalUnits = 0;

        jsonData.forEach((row, index) => {
          const batchNumber = parseInt(
            String(row.批次 || row.批次号 || row.batch || index + 1)
          );
          
          let releaseDate = String(
            row.投放时间 || row.投放日期 || row.日期 || row.date || ''
          );
          
          if (!releaseDate) {
            const date = new Date();
            date.setMonth(date.getMonth() + index * 2);
            releaseDate = date.toISOString().split('T')[0];
          }

          const units = parseInt(
            String(row.房源数量 || row.总套数 || row.套数 || row.units || 500)
          );

          const unitTypes: { type: string; count: number }[] = [];
          
          if (row['一室一厅'] !== undefined) {
            unitTypes.push({ type: '一室一厅', count: parseInt(String(row['一室一厅'])) || 0 });
          }
          if (row['两室一厅'] !== undefined) {
            unitTypes.push({ type: '两室一厅', count: parseInt(String(row['两室一厅'])) || 0 });
          }
          if (row['三室一厅'] !== undefined) {
            unitTypes.push({ type: '三室一厅', count: parseInt(String(row['三室一厅'])) || 0 });
          }
          if (row['四室两厅'] !== undefined) {
            unitTypes.push({ type: '四室两厅', count: parseInt(String(row['四室两厅'])) || 0 });
          }

          if (unitTypes.length === 0) {
            unitTypes.push({ type: '一室一厅', count: Math.floor(units * 0.3) });
            unitTypes.push({ type: '两室一厅', count: Math.floor(units * 0.45) });
            unitTypes.push({ type: '三室一厅', count: Math.floor(units * 0.2) });
            unitTypes.push({ type: '四室两厅', count: Math.floor(units * 0.05) });
          }

          const estimatedWaiters = parseInt(
            String(row['预计轮候人数'] || row['轮候人数'] || units * 4)
          );
          
          const expectedFillRate = parseInt(
            String(row['预计去化率'] || row['去化率'] || 90)
          );

          batches.push({
            batchNumber,
            releaseDate,
            units,
            unitTypes,
            estimatedWaiters,
            expectedFillRate: Math.min(100, Math.max(50, expectedFillRate)),
          });

          totalUnits += units;
        });

        if (batches.length === 0) {
          for (let i = 1; i <= 4; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + (i - 1) * 3);
            const units = 2000 + i * 500;
            batches.push({
              batchNumber: i,
              releaseDate: date.toISOString().split('T')[0],
              units,
              unitTypes: [
                { type: '一室一厅', count: Math.floor(units * 0.3) },
                { type: '两室一厅', count: Math.floor(units * 0.45) },
                { type: '三室一厅', count: Math.floor(units * 0.2) },
                { type: '四室两厅', count: Math.floor(units * 0.05) },
              ],
              estimatedWaiters: units * 4,
              expectedFillRate: 90 + i * 2,
            });
            totalUnits += units;
          }
        }

        const predictedGap = Math.floor(totalUnits * 0.55 + batches.length * 300);

        const recommendations = generateRecommendations(batches, totalUnits, predictedGap);

        resolve({
          id: `plan-${Date.now()}`,
          year: new Date().getFullYear(),
          batches,
          totalUnits,
          predictedGap,
          recommendations,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsBinaryString(file);
  });
}

function generateRecommendations(
  batches: AllocationBatch[],
  totalUnits: number,
  predictedGap: number
): string[] {
  const recommendations: string[] = [];

  if (batches.length > 0) {
    const firstBatch = batches[0];
    const lastBatch = batches[batches.length - 1];
    
    if (predictedGap > totalUnits * 0.5) {
      recommendations.push(
        `预测缺口达 ${Math.round(predictedGap / totalUnits * 100)}%，建议增加房源投放总量或分批次扩大供给`
      );
    }

    const avgFillRate = batches.reduce((sum, b) => sum + b.expectedFillRate, 0) / batches.length;
    if (avgFillRate < 85) {
      recommendations.push('整体去化率偏低，建议加强宣传推广，优化申请条件');
    }

    if (firstBatch.estimatedWaiters > lastBatch.estimatedWaiters * 1.5) {
      recommendations.push('首波申请需求旺盛，建议将第一批次房源规模适当扩大');
    }

    const bigBatch = batches.find(b => b.units > totalUnits / batches.length * 1.3);
    if (bigBatch) {
      recommendations.push(
        `第${bigBatch.batchNumber}批次房源规模较大，建议提前做好人员配置和系统保障`
      );
    }

    const smallUnitBatch = batches.find(b => {
      const smallUnits = b.unitTypes.filter(u => u.type.includes('一') || u.type.includes('两')).reduce((s, u) => s + u.count, 0);
      return smallUnits / b.units > 0.7;
    });
    if (smallUnitBatch) {
      recommendations.push('小户型占比较高，建议重点针对年轻单身群体和小家庭开展宣传');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('整体分配计划合理，建议按计划推进实施');
  }

  if (recommendations.length < 5) {
    recommendations.push('建议建立轮候家庭动态更新机制，及时清理无效申请');
    recommendations.push('优先将大户型房源分配给3人及以上家庭，提高居住匹配度');
  }

  return recommendations.slice(0, 5);
}

export function generateGapPrediction(batches: AllocationBatch[]): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = [];
  const today = new Date();
  
  const sortedBatches = [...batches].sort((a, b) => 
    new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  let currentGap = 3000;
  
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    
    const batchOnDate = sortedBatches.find(b => {
      const batchDate = new Date(b.releaseDate);
      return batchDate.toDateString() === date.toDateString();
    });

    if (batchOnDate) {
      currentGap = Math.max(0, currentGap - batchOnDate.units * 0.8);
    } else {
      currentGap += 40 + Math.sin(i * 0.1) * 20;
    }

    currentGap += Math.random() * 30 - 10;
    currentGap = Math.max(0, currentGap);

    data.push({
      date: dateStr,
      value: Math.round(currentGap),
    });
  }

  return data;
}
