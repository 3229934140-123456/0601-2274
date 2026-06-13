import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Warning, AllocationPlan, UserRole } from '../types';
import { warnings as initialWarnings, allocationPlan as initialPlan, getCommunityById } from '../data/mockData';

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
  approveWarning: (warningId: string, stage: number, opinion: string, handler: string) => void;
  rejectWarning: (warningId: string, stage: number, opinion: string, handler: string) => void;
  resolveWarning: (warningId: string, report: string) => void;
  markWarningProcessing: (warningId: string) => void;
  addPlanToHistory: (plan: AllocationPlan) => void;
  removePlanFromHistory: (planId: string) => void;
  clearPlanHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      warnings: initialWarnings,
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

      approveWarning: (warningId, stage, opinion, handler) => {
        const warning = get().warnings.find((w) => w.id === warningId);
        if (!warning) return;

        const history = warning.approvalHistory ? [...warning.approvalHistory] : [];
        const stageIndex = stage - 1;

        if (history[stageIndex]) {
          history[stageIndex] = {
            ...history[stageIndex],
            status: 'approved',
            opinion,
            handler,
            date: new Date().toISOString().split('T')[0],
          };
        }

        const nextStage = stage < 3 ? stage + 1 : undefined;
        const isFullyApproved = stage === 3;

        get().updateWarning(warningId, {
          approvalStage: nextStage,
          approvalHistory: history,
          status: isFullyApproved ? 'resolved' : 'processing',
        });
      },

      rejectWarning: (warningId, stage, opinion, handler) => {
        const warning = get().warnings.find((w) => w.id === warningId);
        if (!warning) return;

        const history = warning.approvalHistory ? [...warning.approvalHistory] : [];
        const stageIndex = stage - 1;

        if (history[stageIndex]) {
          history[stageIndex] = {
            ...history[stageIndex],
            status: 'rejected',
            opinion,
            handler,
            date: new Date().toISOString().split('T')[0],
          };
        }

        get().updateWarning(warningId, {
          approvalHistory: history,
          status: 'resolved',
        });
      },

      resolveWarning: (warningId, report) => {
        get().updateWarning(warningId, {
          status: 'resolved',
          description: report ? `${get().warnings.find(w => w.id === warningId)?.description}\n\n处理报告：${report}` : get().warnings.find(w => w.id === warningId)?.description,
        });
      },

      markWarningProcessing: (warningId) => {
        get().updateWarning(warningId, {
          status: 'processing',
        });
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
