import { useState, useMemo, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  TrendingUp,
  Calendar,
  Home,
  Users,
  AlertTriangle,
  CheckCircle,
  X,
  Info,
  Lightbulb,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import { cn, formatNumber, formatDate } from '../../utils/format';
import { useAppStore } from '../../store';
import { parseExcelFile, generateGapPrediction } from '../../utils/excelParser';
import type { AllocationPlan } from '../../types';
import { allocationPlan as defaultPlan } from '../../data/mockData';

export default function Plan() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storePlan = useAppStore((state) => state.allocationPlan);
  const setAllocationPlan = useAppStore((state) => state.setAllocationPlan);
  const resetAllocationPlan = useAppStore((state) => state.resetAllocationPlan);

  const currentPlan: AllocationPlan = storePlan || defaultPlan;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setUploadedFile(file);
      setIsParsing(true);
      setParseProgress(0);
      setParseError(null);

      const progressInterval = setInterval(() => {
        setParseProgress(prev => {
          if (prev >= 70) {
            clearInterval(progressInterval);
            return 70;
          }
          return prev + Math.random() * 10;
        });
      }, 150);

      try {
        const plan = await parseExcelFile(file);
        clearInterval(progressInterval);
        setParseProgress(100);
        setAllocationPlan(plan);
        
        setTimeout(() => {
          setIsParsing(false);
        }, 500);
      } catch (error) {
        clearInterval(progressInterval);
        setParseError('文件解析失败，请检查文件格式');
        setIsParsing(false);
        setUploadedFile(null);
      }
    } else {
      setParseError('请上传 .xlsx 或 .xls 格式的文件');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setParseError(null);
    resetAllocationPlan();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const gapPredictionData = useMemo(() => {
    return generateGapPrediction(currentPlan.batches);
  }, [currentPlan.batches]);

  const releasePoints = useMemo(() => {
    return currentPlan.batches.map(batch => {
      const batchDate = new Date(batch.releaseDate);
      const daysDiff = Math.floor((batchDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return {
        date: `${batchDate.getMonth() + 1}/${batchDate.getDate()}`,
        units: batch.units,
        daysDiff,
      };
    }).filter(b => b.daysDiff > 0 && b.daysDiff < 90);
  }, [currentPlan.batches]);

  const totalWaiters = useMemo(() => {
    return currentPlan.batches.reduce((sum, b) => sum + b.estimatedWaiters, 0);
  }, [currentPlan.batches]);

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">年度分配计划</h2>
          <p className="text-dark-400 text-sm mt-1">
            上传年度分配计划，智能预测分配缺口，推荐最优分房批次
          </p>
        </div>
        <div className="flex items-center gap-3">
          {uploadedFile && (
            <button className="btn btn-secondary" onClick={handleReset}>
              <RefreshCw className="w-4 h-4" />
              重置
            </button>
          )}
          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            下载模板
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="glass-card p-5">
          <div className="text-dark-400 text-sm mb-1">年度总房源</div>
          <div className="text-2xl font-bold text-white">{formatNumber(currentPlan.totalUnits)}</div>
          <div className="text-xs text-dark-500 mt-1">套</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-dark-400 text-sm mb-1">分配批次</div>
          <div className="text-2xl font-bold text-primary-400">{currentPlan.batches.length}</div>
          <div className="text-xs text-dark-500 mt-1">个批次</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-dark-400 text-sm mb-1">预测缺口</div>
          <div className="text-2xl font-bold text-orange-400">{formatNumber(currentPlan.predictedGap)}</div>
          <div className="text-xs text-dark-500 mt-1">套</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-dark-400 text-sm mb-1">预计轮候家庭</div>
          <div className="text-2xl font-bold text-cyan-400">{formatNumber(Math.floor(totalWaiters / currentPlan.batches.length))}</div>
          <div className="text-xs text-dark-500 mt-1">户/平均批次</div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="section-title">上传年度计划</h3>

        {parseError && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-red-400 text-sm">
            {parseError}
          </div>
        )}

        {!uploadedFile ? (
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer',
              isDragging
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-800/30'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <Upload className={cn('w-12 h-12 mx-auto mb-4', isDragging ? 'text-primary-400' : 'text-dark-500')} />
            <div className="text-lg font-medium text-white mb-2">
              拖拽Excel文件到此处，或点击上传
            </div>
            <div className="text-sm text-dark-400">
              支持 .xlsx / .xls 格式，文件大小不超过 10MB
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-dark-500">
              <Info className="w-4 h-4" />
              请使用标准模板格式上传，包含批次、投放时间、房源数量等列
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg border border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{uploadedFile.name}</div>
                  <div className="text-xs text-dark-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isParsing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all"
                        style={{ width: `${Math.min(parseProgress, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-dark-400">
                      解析中 {Math.round(parseProgress)}%
                    </span>
                  </div>
                ) : (
                  <span className="tag tag-success">
                    <CheckCircle className="w-3 h-3" />
                    解析完成
                  </span>
                )}
                <button
                  className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                  onClick={handleReset}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isParsing && !parseError && (
              <div className="p-4 bg-primary-500/10 rounded-lg border border-primary-500/30">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-white">数据校验通过</div>
                    <div className="text-xs text-dark-400 mt-1">
                      共解析 {currentPlan.batches.length} 个批次，{currentPlan.totalUnits} 套房源
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">未来90天分配缺口预测</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-dark-400">缺口预测</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-dark-400">房源投放</span>
              </div>
            </div>
          </div>
          <LineChart
            data={gapPredictionData.map(d => ({ ...d, name: '分配缺口' }))}
            height={320}
            color="#FB8C00"
            showArea
            yAxisName="缺口(套)"
          />
          
          {releasePoints.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-dark-400">投放节点：</span>
              {releasePoints.map((point, idx) => (
                <span key={idx} className="text-xs tag tag-success">
                  {point.date} · {formatNumber(point.units)}套
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-4 glass-card p-5">
          <h3 className="section-title">批次房源分布</h3>
          <BarChart
            data={currentPlan.batches.map(b => ({
              name: `第${b.batchNumber}批`,
              value: b.units,
            }))}
            height={320}
            unit="套"
            horizontal
            color="#1E88E5"
          />
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="section-title">分房批次详情</h3>
        <div className="grid grid-cols-4 gap-4">
          {currentPlan.batches.map(batch => (
            <div key={batch.batchNumber} className="p-4 bg-dark-800/50 rounded-xl border border-dark-700 hover:border-primary-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">第 {batch.batchNumber} 批次</span>
                <span className="tag tag-primary">
                  <Calendar className="w-3 h-3" />
                  {formatDate(batch.releaseDate)}
                </span>
              </div>
              <div className="text-2xl font-bold text-primary-400 mb-1">
                {formatNumber(batch.units)}
              </div>
              <div className="text-xs text-dark-400 mb-4">套房源</div>

              <div className="space-y-2 text-xs">
                {batch.unitTypes.map(ut => (
                  <div key={ut.type} className="flex items-center justify-between">
                    <span className="text-dark-400">{ut.type}</span>
                    <span className="text-dark-200">{ut.count}套</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-dark-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-400">预计轮候</span>
                  <span className="text-dark-200">{formatNumber(batch.estimatedWaiters)}人</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-dark-400">预计去化率</span>
                  <span className="text-green-400">{batch.expectedFillRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold text-white">优化建议</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {currentPlan.recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 bg-warning/5 rounded-lg border border-warning/20 flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-orange-400">
                {index + 1}
              </div>
              <p className="text-sm text-dark-300 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="btn btn-secondary">
          保存草稿
        </button>
        <button className="btn btn-primary">
          确认发布计划
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
