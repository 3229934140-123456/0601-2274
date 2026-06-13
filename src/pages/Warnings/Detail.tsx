import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Clock3,
  User,
  Calendar,
  FileText,
  ThumbsUp,
  TrendingDown,
  Home,
  DollarSign,
  Send,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { getCommunityById } from '../../data/mockData';
import { getWarningLevelName, getWarningTypeName, getWarningStatusName, formatPercent, formatDate, cn } from '../../utils/format';
import LineChart from '../../components/charts/LineChart';
import { useAppStore } from '../../store';
import { useAuth } from '../../context/AuthContext';

export default function WarningDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const warnings = useAppStore((state) => state.warnings);
  const approveWarning = useAppStore((state) => state.approveWarning);
  const rejectWarning = useAppStore((state) => state.rejectWarning);
  const resolveWarning = useAppStore((state) => state.resolveWarning);
  const markWarningProcessing = useAppStore((state) => state.markWarningProcessing);
  
  const warning = warnings.find((w) => w.id === id);
  const community = warning ? getCommunityById(warning.communityId) : undefined;
  const [approvalOpinion, setApprovalOpinion] = useState('');
  const [processingReport, setProcessingReport] = useState('');

  const hasWarningPermission = (warningId: string): boolean => {
    if (!user) return false;
    const w = warnings.find(item => item.id === warningId);
    if (!w) return false;
    
    if (user.role === 'national' || user.role === 'provincial' || user.role === 'municipal') {
      return true;
    }
    
    if (user.role === 'district') {
      const comm = getCommunityById(w.communityId);
      return comm?.district === '朝阳区' || comm?.district?.includes('朝阳');
    }
    
    if (user.role === 'property') {
      return w.communityId === user.regionId;
    }
    
    return false;
  };

  const showNoPermission = warning && !hasWarningPermission(id || '');

  const trendData = useMemo(() => {
    if (!warning) return [];
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      let baseValue = warning.threshold;
      if (warning.type === 'vacancy') {
        baseValue = warning.currentValue - Math.sin(i * 0.3) * 2;
      } else {
        baseValue = warning.currentValue + Math.sin(i * 0.3) * 3;
      }
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        value: Math.round(baseValue * 10) / 10,
      };
    });
  }, [warning]);

  if (showNoPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-lg font-medium text-white">无权限访问该预警</div>
        <div className="text-sm text-dark-400">您当前的账号权限不足以查看此预警的详细信息</div>
        <button
          className="btn btn-primary mt-2"
          onClick={() => navigate('/warnings')}
        >
          返回预警列表
        </button>
      </div>
    );
  }

  if (!warning) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-400">预警不存在</div>
      </div>
    );
  }

  const levelColors = {
    level1: { bg: 'bg-warning/10', border: 'border-warning', text: 'text-orange-400' },
    level2: { bg: 'bg-danger/10', border: 'border-danger', text: 'text-red-400' },
  };

  const colors = levelColors[warning.level];

  const statusSteps = [
    { stage: 1, name: '物业确认', role: '物业管理部门', days: '3个工作日' },
    { stage: 2, name: '区中心复核', role: '区住房保障中心', days: '5个工作日' },
    { stage: 3, name: '市住建局批准', role: '市住房和城乡建设局', days: '7个工作日' },
  ];

  const getApprovalHistory = warning.approvalHistory || [];

  const handleApprove = () => {
    if (!warning.approvalStage || !approvalOpinion.trim()) return;
    const handlerNames: Record<string, string> = {
      property: '物业负责人',
      district: '区中心主任',
      municipal: '市住建局局长',
    };
    approveWarning(
      warning.id,
      warning.approvalStage,
      approvalOpinion,
      user?.name || handlerNames[user?.role || ''] || '审批人'
    );
    setApprovalOpinion('');
  };

  const handleReject = () => {
    if (!warning.approvalStage || !approvalOpinion.trim()) return;
    const handlerNames: Record<string, string> = {
      property: '物业负责人',
      district: '区中心主任',
      municipal: '市住建局局长',
    };
    rejectWarning(
      warning.id,
      warning.approvalStage,
      approvalOpinion,
      user?.name || handlerNames[user?.role || ''] || '审批人'
    );
    setApprovalOpinion('');
  };

  const handleMarkResolved = () => {
    if (!processingReport.trim()) return;
    resolveWarning(warning.id, processingReport);
    setProcessingReport('');
  };

  const handleMarkProcessing = () => {
    markWarningProcessing(warning.id);
  };

  const canHandleApproval = (stage: number) => {
    if (!user || warning.status === 'resolved') return false;
    if (warning.approvalStage !== stage) return false;
    
    if (stage === 1 && (user.role === 'property' || user.role === 'district' || user.role === 'municipal')) return true;
    if (stage === 2 && (user.role === 'district' || user.role === 'municipal')) return true;
    if (stage === 3 && user.role === 'municipal') return true;
    return false;
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
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{warning.communityName}</h2>
            <span className={`tag ${warning.level === 'level2' ? 'tag-danger' : 'tag-warning'}`}>
              <AlertTriangle className="w-3 h-3" />
              {getWarningLevelName(warning.level)}
            </span>
            <span className="tag tag-primary">
              {getWarningTypeName(warning.type)}
            </span>
          </div>
          <p className="text-dark-400 text-sm mt-1">
            预警编号：{warning.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className={cn('glass-card p-5 border-l-4', warning.level === 'level2' ? 'border-l-danger' : 'border-l-warning')}>
          <div className="flex items-center gap-3 mb-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.bg)}>
              {warning.type === 'vacancy' ? (
                <Home className={cn('w-6 h-6', colors.text)} />
              ) : (
                <DollarSign className={cn('w-6 h-6', colors.text)} />
              )}
            </div>
            <div>
              <div className="text-dark-400 text-sm">{getWarningTypeName(warning.type)}</div>
              <div className="text-2xl font-bold text-white mt-0.5">
                {formatPercent(warning.currentValue)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-dark-400">
            <span>预警阈值：{formatPercent(warning.threshold)}</span>
            <span className={colors.text}>
              {warning.type === 'vacancy'
                ? `超标 ${Math.round((warning.currentValue - warning.threshold) * 10) / 10}个百分点`
                : `低于 ${Math.round((warning.threshold - warning.currentValue) * 10) / 10}个百分点`}
            </span>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <div className="text-dark-400 text-sm">已持续</div>
              <div className="text-2xl font-bold text-white mt-0.5">{warning.processingDays}天</div>
            </div>
          </div>
          <div className="text-xs text-dark-400">
            触发时间：{warning.triggerDate}
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-dark-400 text-sm">当前状态</div>
              <div className="text-2xl font-bold text-white mt-0.5">
                {getWarningStatusName(warning.status)}
              </div>
            </div>
          </div>
          <div className="text-xs text-dark-400">
            {warning.status === 'resolved' ? '预警已解除' : warning.status === 'escalated' ? '已升级至二级预警' : '正在处理中'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 space-y-5">
          <div className="glass-card p-5">
            <h3 className="section-title">指标趋势（近30天）</h3>
            <LineChart
              data={trendData}
              height={280}
              color={warning.type === 'vacancy' ? '#FB8C00' : '#43A047'}
              showArea
              yAxisName={warning.type === 'vacancy' ? '空置率(%)' : '收缴率(%)'}
            />
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-dark-400">
              <div className="w-8 h-0.5 bg-danger" />
              <span>阈值线 {formatPercent(warning.threshold)}</span>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="section-title">预警描述</h3>
            <p className="text-dark-300 text-sm leading-relaxed whitespace-pre-wrap">
              {warning.description}
            </p>
            <div className="mt-4 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
              <div className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-400" />
                处理建议
              </div>
              <ul className="text-sm text-dark-300 space-y-1.5">
                {warning.type === 'vacancy' ? (
                  <>
                    <li>• 加强小区宣传推广，提高知名度</li>
                    <li>• 优化申请条件，扩大覆盖范围</li>
                    <li>• 考虑调整租金定价策略</li>
                    <li>• 完善周边配套设施</li>
                    <li>• 如持续空置可考虑启动清退程序</li>
                  </>
                ) : (
                  <>
                    <li>• 加强租金催收工作</li>
                    <li>• 了解欠缴原因分析</li>
                    <li>• 制定分期还款方案</li>
                    <li>• 对长期拖欠启动法律程序</li>
                    <li>• 考虑启动清退程序</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="glass-card p-5">
            <h3 className="section-title">小区信息</h3>
            {community && (
              <div className="space-y-3">
                <InfoRow label="小区名称" value={community.name} />
                <InfoRow label="所在区域" value={community.district} />
                <InfoRow label="总房源" value={`${community.totalUnits}套`} />
                <InfoRow label="空置房源" value={`${community.vacantUnits}套`} highlight="warning" />
                <InfoRow label="租金收缴率" value={formatPercent(community.rentCollectionRate)} highlight={community.rentCollectionRate < 80 ? 'danger' : undefined} />
                <InfoRow label="物业公司" value={community.propertyCompany} />
                <InfoRow label="建成年份" value={`${community.buildYear}年`} />
              </div>
            )}
            <button
              className="w-full mt-4 btn btn-secondary justify-center text-sm w-full"
              onClick={() => navigate(`/community/${warning.communityId}`)}
            >
              查看小区详情
            </button>
          </div>
        </div>
      </div>

      {warning.level === 'level2' && (
        <div className="glass-card p-5">
          <h3 className="section-title">三级审批流程</h3>

          <div className="flex items-stretch justify-between gap-4">
            {statusSteps.map((step, index) => {
              const historyItem = getApprovalHistory[index];
              const isCompleted = historyItem?.status === 'approved';
              const isRejected = historyItem?.status === 'rejected';
              const isCurrent = historyItem?.status === 'pending' && warning.approvalStage === step.stage;
              const isPending = !historyItem || (historyItem.status === 'pending' && warning.approvalStage !== step.stage);

              return (
                <div key={step.stage} className="flex-1">
                  <div
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all',
                      isCompleted && 'border-success bg-success/10',
                      isRejected && 'border-danger bg-danger/10',
                      isCurrent && 'border-primary-500 bg-primary-500/10 animate-pulse',
                      isPending && 'border-dark-700 bg-dark-800/50'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                          isCompleted && 'bg-success',
                          isRejected && 'bg-danger',
                          isCurrent && 'bg-gradient-primary',
                          isPending && 'bg-dark-700 text-dark-400'
                        )}
                      >
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : isRejected ? <XCircle className="w-5 h-5" /> : step.stage}
                      </div>
                      <div>
                        <div className={cn('font-medium', isPending ? 'text-dark-400' : 'text-white')}>
                          {step.name}
                        </div>
                        <div className="text-xs text-dark-500">{step.role}</div>
                      </div>
                    </div>

                    {historyItem && (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-1 text-dark-400">
                          <User className="w-3 h-3" />
                          {historyItem.handler}
                        </div>
                        {historyItem.date && (
                          <div className="flex items-center gap-1 text-dark-400">
                            <Calendar className="w-3 h-3" />
                            {historyItem.date}
                          </div>
                        )}
                        {historyItem.opinion && (
                          <div className="p-2 bg-dark-900/50 rounded text-dark-300 mt-2">
                            {historyItem.opinion}
                          </div>
                        )}
                      </div>
                    )}

                    {isPending && !historyItem && (
                      <div className="text-xs text-dark-500 flex items-center gap-1">
                        <Clock3 className="w-3 h-3" />
                        预计 {step.days}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {warning.approvalStage !== undefined && warning.approvalStage < 4 && warning.status !== 'resolved' && canHandleApproval(warning.approvalStage) && (
            <div className="mt-6 pt-5 border-t border-dark-700">
              <div className="text-sm font-medium text-white mb-3">
                当前阶段：{statusSteps[warning.approvalStage - 1]?.name || '审批中'}
              </div>
              <textarea
                value={approvalOpinion}
                onChange={e => setApprovalOpinion(e.target.value)}
                placeholder="请输入审批意见..."
                className="w-full h-24 p-3 bg-dark-800 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
              />
              <div className="flex justify-end gap-3 mt-3">
                <button className="btn btn-secondary" onClick={handleReject}>
                  <XCircle className="w-4 h-4" />
                  驳回
                </button>
                <button className="btn btn-primary" onClick={handleApprove}>
                  <ThumbsUp className="w-4 h-4" />
                  通过
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {warning.level === 'level1' && (
        <div className="glass-card p-5">
          <h3 className="section-title">处理操作</h3>
          <p className="text-dark-400 text-sm mb-4">
            一级预警请物业和区住房保障中心需在15天内采取措施进行整改。如15天内未改善，将自动升级为二级预警并启动三级审批流程。
          </p>
          
          {warning.status !== 'resolved' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                  <div className="text-sm font-medium text-white mb-2">已采取措施</div>
                  <ul className="text-sm text-dark-300 space-y-1">
                    <li>• 加强宣传推广</li>
                    <li>• 优化申请流程</li>
                    <li>• 提高服务质量</li>
                  </ul>
                </div>
                <div className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
                  <div className="text-sm font-medium text-white mb-2">预计改善时间</div>
                  <div className="text-2xl font-bold text-primary-400">7天</div>
                  <div className="text-xs text-dark-400 mt-1">预计达到正常水平</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-white mb-2">提交处理报告</div>
                <textarea
                  value={processingReport}
                  onChange={e => setProcessingReport(e.target.value)}
                  placeholder="请描述已采取的处理措施和整改效果..."
                  className="w-full h-20 p-3 bg-dark-800 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                {warning.status === 'active' && (
                  <button className="btn btn-secondary" onClick={handleMarkProcessing}>
                    标记为处理中
                  </button>
                )}
                <button className="btn btn-primary" onClick={handleMarkResolved}>
                  <Send className="w-4 h-4" />
                  提交处理报告并解除
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 bg-success/10 rounded-lg border border-success/30 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <div className="text-lg font-medium text-white">预警已解除</div>
              <div className="text-sm text-dark-400 mt-1">该预警已处理完成，运营恢复正常</div>
            </div>
          )}
        </div>
      )}

      <div className="glass-card p-5">
        <h3 className="section-title">处置记录</h3>
        <div className="space-y-0">
          <TimelineItem
            icon={<AlertTriangle className="w-4 h-4" />}
            color="warning"
            title="预警触发"
            date={warning.triggerDate}
            description={`${warning.communityName} ${getWarningTypeName(warning.type)}指标触发${getWarningLevelName(warning.level)}`}
          />
          
          {warning.status === 'processing' && (
            <TimelineItem
              icon={<Clock className="w-4 h-4" />}
              color="primary"
              title="开始处理"
              date=""
              description="已标记为处理中状态"
            />
          )}
          
          {warning.approvalHistory?.filter(h => h.status !== 'pending').map((h, idx) => (
            <TimelineItem
              key={idx}
              icon={h.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              color={h.status === 'approved' ? 'success' : 'danger'}
              title={`${h.stageName} - ${h.status === 'approved' ? '通过' : '驳回'}`}
              date={h.date}
              handler={h.handler}
              handlerRole={h.handlerRole}
              description={h.opinion}
            />
          ))}
          
          {warning.status === 'resolved' && (
            <TimelineItem
              icon={<CheckCircle className="w-4 h-4" />}
              color="success"
              title="预警解除"
              date=""
              description="该预警已处理完成并解除"
              isLast
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ icon, color, title, date, handler, handlerRole, description, isLast }: {
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'danger';
  title: string;
  date: string;
  handler?: string;
  handlerRole?: string;
  description?: string;
  isLast?: boolean;
}) {
  const dotColors = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    danger: 'bg-red-500',
  };
  const iconBgColors = {
    primary: 'bg-primary-500/20 text-primary-400',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-orange-500/20 text-orange-400',
    danger: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', iconBgColors[color])}>
          {icon}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-dark-700 my-1" />}
      </div>
      <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">{title}</span>
          {date && <span className="text-xs text-dark-400">{date}</span>}
        </div>
        {(handler || handlerRole) && (
          <div className="flex items-center gap-3 mt-1">
            {handler && <span className="text-xs text-dark-300">处理人：{handler}</span>}
            {handlerRole && <span className="text-xs text-dark-500">({handlerRole})</span>}
          </div>
        )}
        {description && (
          <div className="mt-2 p-2 bg-dark-800/50 rounded text-sm text-dark-300">
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: 'warning' | 'danger' | 'success' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-dark-700/50 last:border-0">
      <span className="text-sm text-dark-400">{label}</span>
      <span className={cn(
        'text-sm font-medium',
        highlight === 'warning' && 'text-orange-400',
        highlight === 'danger' && 'text-red-400',
        highlight === 'success' && 'text-green-400',
        !highlight && 'text-dark-200'
      )}>
        {value}
      </span>
    </div>
  );
}
