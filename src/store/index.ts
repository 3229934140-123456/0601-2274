import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Warning, AllocationPlan, UserRole, DisposalLogEntry, AllocationBatch } from '../types';
import { warnings as initialWarnings, allocationPlan as initialPlan, getCommunityById } from '../data/mockData';

function roleToName(role: string): string {
  const map: Record<string, string> = {
    national: '国家级管理员',
    provincial: '省级管理员',
    municipal: '市住建局',
    district: '区住房保障中心',
    property: '物业管理部门',
  };
  return map[role] || role;
}

function makeLog(partial: Partial<DisposalLogEntry> & Pick<DisposalLogEntry, 'action' | 'actionLabel'>): DisposalLogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...partial,
  };
}

function appendLog(warning: Warning, entry: DisposalLogEntry): Warning {
  const log = warning.disposalLog ? [...warning.disposalLog] : [];
  log.push(entry);
  return { ...warning, disposalLog: log };
}

interface AppState {
  warnings: Warning[];
  allocationPlan: AllocationPlan;
  currentRole: UserRole;
  planHistory: AllocationPlan[];
  setWarnings: (warnings: Warning[]) => void;
  updateWarning: (id: string, updates: Partial<Warning>) => void;
  setAllocationPlan: (plan: AllocationPlan) => void;
  resetAllocationPlan: () => void;
  setCurrentRole: (role: UserRole) => void;
  approveWarning: (warningId: string, stage: number, opinion: string, handler: string, handlerRole?: string) => void;
  rejectWarning: (warningId: string, stage: number, opinion: string, handler: string, handlerRole?: string) => void;
  resolveWarning: (warningId: string, report: string, handler?: string, handlerRole?: string) => void;
  markWarningProcessing: (warningId: string, handler?: string, handlerRole?: string, remark?: string) => void;
  addPlanToHistory: (plan: AllocationPlan) => void;
  removePlanFromHistory: (planId: string) => void;
  clearPlanHistory: () => void;
  updateBatchActual: (batchNumber: number, updates: Partial<AllocationBatch>) => void;
}

const stageNames: Record<number, string> = {
  1: '物业确认',
  2: '区中心复核',
  3: '市住建局批准',
};

const warningsWithInitialLogs = initialWarnings.map((w): Warning => {
  const log: DisposalLogEntry[] = [
    makeLog({
      action: 'trigger',
      actionLabel: '预警触发',
      timestamp: `${w.triggerDate}T00:00:00.000Z`,
      description: `${w.communityName}${w.type === 'vacancy' ? '空置率' : '租金收缴率'}${w.type === 'vacancy' ? '超' : '低于'}阈值，触发${w.level === 'level1' ? '一级' : '二级'}预警`,
    }),
  ];

  let updated: Warning = { ...w, disposalLog: log };

  if (w.status === 'processing' || w.status === 'escalated' || w.approvalHistory?.some(h => h.status !== 'pending')) {
    const startDate = w.triggerDate ? new Date(w.triggerDate) : new Date();
    startDate.setDate(startDate.getDate() + 1);
    log.push(makeLog({
      action: 'start_processing',
      actionLabel: '开始处理',
      timestamp: startDate.toISOString(),
      handler: w.level === 'level1' ? '物业管理员' : '物业负责人',
      handlerRole: w.level === 'level1' ? 'property' : 'property',
      handlerRoleName: '物业管理部门',
      description: '接收预警通知，组织人员排查情况并开始处理',
      remark: '已派单给社区物业团队',
    }));
    updated = {
      ...updated,
      processingStartDate: startDate.toISOString().split('T')[0],
      lastHandler: '物业管理员',
      lastActionDate: startDate.toISOString().split('T')[0],
    };
  }

  if (w.approvalHistory) {
    w.approvalHistory.forEach((h) => {
      if (h.status === 'approved' || h.status === 'rejected') {
        log.push(makeLog({
          action: h.status === 'approved' ? 'approval' : 'reject',
          actionLabel: `${h.stageName} - ${h.status === 'approved' ? '审批通过' : '审批驳回'}`,
          timestamp: h.date ? `${h.date}T10:00:00.000Z` : new Date().toISOString(),
          handler: h.handler,
          handlerRole: '',
          handlerRoleName: h.handlerRole || roleToName(h.stage === 1 ? 'property' : h.stage === 2 ? 'district' : 'municipal'),
          stage: h.stage,
          stageName: h.stageName,
          description: h.opinion,
          result: h.status,
        }));
      }
    });
  }

  if (w.status === 'escalated') {
    const escalateDate = w.triggerDate ? new Date(w.triggerDate) : new Date();
    escalateDate.setDate(escalateDate.getDate() + 15);
    log.push(makeLog({
      action: 'escalate',
      actionLabel: '升级预警',
      timestamp: escalateDate.toISOString(),
      handler: '系统自动',
      description: '一级预警15天内未改善，自动升级为二级预警并启动三级审批流程',
    }));
    updated = { ...updated, escalateDate: escalateDate.toISOString().split('T')[0] };
  }

  if (w.status === 'resolved') {
    const hasApproval = w.approvalHistory?.some(h => h.status !== 'pending');
    const resolveDate = w.triggerDate ? new Date(w.triggerDate) : new Date();
    resolveDate.setDate(resolveDate.getDate() + w.processingDays);
    log.push(makeLog({
      action: hasApproval ? 'approval' : 'resolve',
      actionLabel: hasApproval ? '全部审批通过，解除预警' : '提交处理报告，解除预警',
      timestamp: resolveDate.toISOString(),
      handler: hasApproval ? '市住建局局长' : '物业管理员',
      handlerRole: hasApproval ? 'municipal' : 'property',
      handlerRoleName: hasApproval ? '市住房和城乡建设局' : '物业管理部门',
      description: hasApproval
        ? '三级审批全部通过，已按批准方案调整分配/启动清退，运营指标恢复正常'
        : '已采取整改措施，空置率/收缴率指标已恢复正常阈值内，申请解除预警',
      result: 'success',
    }));
    updated = {
      ...updated,
      resolveDate: resolveDate.toISOString().split('T')[0],
      reportDate: hasApproval ? undefined : resolveDate.toISOString().split('T')[0],
      lastHandler: hasApproval ? '市住建局局长' : '物业管理员',
      lastActionDate: resolveDate.toISOString().split('T')[0],
    };
  }

  updated.disposalLog = log.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return updated;
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      warnings: warningsWithInitialLogs,
      allocationPlan: initialPlan,
      currentRole: 'municipal',
      planHistory: [],

      setWarnings: (warnings) => set({ warnings }),

      updateWarning: (id, updates) =>
        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      setAllocationPlan: (plan) => set({ allocationPlan: plan }),

      resetAllocationPlan: () => set({ allocationPlan: initialPlan }),

      setCurrentRole: (role) => set({ currentRole: role }),

      approveWarning: (warningId, stage, opinion, handler, handlerRole) => {
        const warning = get().warnings.find((w) => w.id === warningId);
        if (!warning) return;

        const history = warning.approvalHistory ? [...warning.approvalHistory] : [];
        const stageIndex = stage - 1;
        const todayStr = new Date().toISOString().split('T')[0];

        if (history[stageIndex]) {
          history[stageIndex] = {
            ...history[stageIndex],
            status: 'approved',
            opinion,
            handler,
            date: todayStr,
          };
        }

        const nextStage = stage < 3 ? stage + 1 : undefined;
        const isFullyApproved = stage === 3;

        const logEntry = makeLog({
          action: 'approval',
          actionLabel: `${stageNames[stage] || `阶段${stage}`} - 审批通过`,
          stage,
          stageName: stageNames[stage] || `阶段${stage}`,
          handler,
          handlerRole: handlerRole || '',
          handlerRoleName: handlerRole ? roleToName(handlerRole) : '',
          description: opinion,
          result: 'approved',
        });

        let updated: Warning = appendLog(warning, logEntry);
        updated = {
          ...updated,
          approvalStage: nextStage,
          approvalHistory: history,
          status: isFullyApproved ? 'resolved' : 'processing',
          lastHandler: handler,
          lastActionDate: todayStr,
        };

        if (isFullyApproved) {
          updated.resolveDate = todayStr;
          const finalLog = makeLog({
            action: 'resolve',
            actionLabel: '审批通过 · 解除预警',
            handler,
            handlerRole: handlerRole || '',
            handlerRoleName: handlerRole ? roleToName(handlerRole) : '',
            description: '三级审批流程全部通过，已解除预警并按方案执行调整',
            result: 'success',
          });
          updated = appendLog(updated, finalLog);
        }

        get().updateWarning(warningId, updated);
      },

      rejectWarning: (warningId, stage, opinion, handler, handlerRole) => {
        const warning = get().warnings.find((w) => w.id === warningId);
        if (!warning) return;

        const history = warning.approvalHistory ? [...warning.approvalHistory] : [];
        const stageIndex = stage - 1;
        const todayStr = new Date().toISOString().split('T')[0];

        if (history[stageIndex]) {
          history[stageIndex] = {
            ...history[stageIndex],
            status: 'rejected',
            opinion,
            handler,
            date: todayStr,
          };
        }

        const logEntry = makeLog({
          action: 'reject',
          actionLabel: `${stageNames[stage] || `阶段${stage}`} - 审批驳回`,
          stage,
          stageName: stageNames[stage] || `阶段${stage}`,
          handler,
          handlerRole: handlerRole || '',
          handlerRoleName: handlerRole ? roleToName(handlerRole) : '',
          description: opinion,
          result: 'rejected',
        });

        let updated: Warning = appendLog(warning, logEntry);
        updated = {
          ...updated,
          approvalHistory: history,
          status: 'resolved',
          resolveDate: todayStr,
          lastHandler: handler,
          lastActionDate: todayStr,
        };

        get().updateWarning(warningId, updated);
      },

      resolveWarning: (warningId, report, handler, handlerRole) => {
        const warning = get().warnings.find((w) => w.id === warningId);
        if (!warning) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const reportLog = makeLog({
          action: 'submit_report',
          actionLabel: '提交处理报告',
          handler: handler || '物业管理员',
          handlerRole: handlerRole || 'property',
          handlerRoleName: handlerRole ? roleToName(handlerRole) : '物业管理部门',
          description: report,
        });

        const resolveLog = makeLog({
          action: 'resolve',
          actionLabel: '解除预警',
          handler: handler || '物业管理员',
          handlerRole: handlerRole || 'property',
          handlerRoleName: handlerRole ? roleToName(handlerRole) : '物业管理部门',
          description: '处理完毕，运营指标恢复正常，申请解除预警',
          result: 'success',
        });

        let updated: Warning = appendLog(warning, reportLog);
        updated = appendLog(updated, resolveLog);
        updated = {
          ...updated,
          status: 'resolved',
          resolveDate: todayStr,
          reportDate: todayStr,
          lastHandler: handler || '物业管理员',
          lastActionDate: todayStr,
          description: report
            ? `${warning.description}\n\n处理报告：${report}`
            : warning.description,
        };

        get().updateWarning(warningId, updated);
      },

      markWarningProcessing: (warningId, handler, handlerRole, remark) => {
        const warning = get().warnings.find((w) => w.id === warningId);
        if (!warning) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const logEntry = makeLog({
          action: 'start_processing',
          actionLabel: '开始处理',
          handler: handler || '物业管理员',
          handlerRole: handlerRole || 'property',
          handlerRoleName: handlerRole ? roleToName(handlerRole) : '物业管理部门',
          description: '已接收预警通知，组织人员开展处置工作',
          remark: remark || '已派单处理',
        });

        let updated: Warning = appendLog(warning, logEntry);
        updated = {
          ...updated,
          status: 'processing',
          processingStartDate: todayStr,
          lastHandler: handler || '物业管理员',
          lastActionDate: todayStr,
        };

        get().updateWarning(warningId, updated);
      },

      addPlanToHistory: (plan) => {
        const currentHistory = get().planHistory;
        const existing = currentHistory.findIndex(p => p.id === plan.id);
        if (existing >= 0) {
          const updated = [...currentHistory];
          updated[existing] = plan;
          set({ planHistory: updated });
        } else {
          set({ planHistory: [...currentHistory, plan].slice(-5) });
        }
      },

      removePlanFromHistory: (planId) => {
        set((state) => ({
          planHistory: state.planHistory.filter(p => p.id !== planId),
        }));
      },

      clearPlanHistory: () => set({ planHistory: [] }),

      updateBatchActual: (batchNumber, updates) => {
        const plan = get().allocationPlan;
        const batches = plan.batches.map(b => {
          if (b.batchNumber !== batchNumber) return b;
          const merged: AllocationBatch = { ...b, ...updates };
          const todayStr = new Date().toISOString().split('T')[0];
          if (!merged.status) merged.status = 'completed';
          return merged;
        });
        set({
          allocationPlan: { ...plan, batches },
        });
      },
    }),
    {
      name: 'housing-security-app-storage',
      partialize: (state) => ({
        warnings: state.warnings,
        allocationPlan: state.allocationPlan,
        currentRole: state.currentRole,
        planHistory: state.planHistory,
      }),
    }
  )
);

export function getFilteredWarningsByRole(
  warnings: Warning[],
  role: UserRole,
  regionId: string
): Warning[] {
  if (role === 'national' || role === 'provincial' || role === 'municipal') {
    return warnings;
  }

  if (role === 'district') {
    return warnings.filter((w) => {
      const community = getCommunityById(w.communityId);
      return community?.district?.includes('朝阳') || w.communityId === 'community-1';
    });
  }

  if (role === 'property') {
    return warnings.filter((w) => w.communityId === regionId);
  }

  return warnings;
}
