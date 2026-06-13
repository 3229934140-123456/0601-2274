export type UserRole = 'national' | 'provincial' | 'municipal' | 'district' | 'property';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  regionId: string;
  regionName: string;
  avatar?: string;
}

export interface Province {
  id: string;
  name: string;
  code: string;
  communityCount: number;
  totalUnits: number;
  vacancyRate: number;
  rentCollectionRate: number;
  allocationEfficiency: number;
  satisfaction: number;
}

export interface City {
  id: string;
  provinceId: string;
  name: string;
  communityCount: number;
  totalUnits: number;
  vacancyRate: number;
  rentCollectionRate: number;
  allocationEfficiency: number;
  satisfaction: number;
}

export interface Community {
  id: string;
  cityId: string;
  name: string;
  address: string;
  district: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  vacancyRate: number;
  rentCollectionRate: number;
  allocationEfficiency: number;
  satisfaction: number;
  unitTypes: UnitType[];
  buildYear: number;
  propertyCompany: string;
  warningCount: number;
  warningLevel?: WarningLevel;
}

export interface UnitType {
  type: string;
  count: number;
  area: number;
}

export type WarningLevel = 'level1' | 'level2';
export type WarningType = 'vacancy' | 'rent';
export type WarningStatus = 'active' | 'processing' | 'resolved' | 'escalated';

export interface Warning {
  id: string;
  communityId: string;
  communityName: string;
  level: WarningLevel;
  type: WarningType;
  status: WarningStatus;
  triggerDate: string;
  currentValue: number;
  threshold: number;
  description: string;
  processingDays: number;
  approvalStage?: number;
  approvalHistory?: ApprovalRecord[];
}

export interface ApprovalRecord {
  stage: number;
  stageName: string;
  handler: string;
  handlerRole: string;
  opinion: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Complaint {
  id: string;
  communityId: string;
  type: ComplaintType;
  title: string;
  content: string;
  status: 'pending' | 'processing' | 'resolved';
  createDate: string;
  resolveDate?: string;
  residentName: string;
  unitNumber: string;
}

export type ComplaintType = 'maintenance' | 'hygiene' | 'security' | 'noise' | 'service' | 'other';

export interface RentRecord {
  id: string;
  communityId: string;
  month: string;
  shouldCollect: number;
  actualCollect: number;
  rate: number;
  arrearsCount: number;
  arrearsAmount: number;
}

export interface OccupancyTrend {
  date: string;
  occupancyRate: number;
  occupiedUnits: number;
}

export interface KPIData {
  allocationEfficiency: number;
  allocationEfficiencyChange: number;
  vacancyRate: number;
  vacancyRateChange: number;
  rentCollectionRate: number;
  rentCollectionRateChange: number;
  satisfaction: number;
  satisfactionChange: number;
  totalCommunities: number;
  totalUnits: number;
  totalWaiters: number;
}

export interface RegionContextType {
  level: 'national' | 'province' | 'city';
  provinceId?: string;
  cityId?: string;
  provinceName?: string;
  cityName?: string;
  setProvince: (id: string, name: string) => void;
  setCity: (id: string, name: string) => void;
  resetToNational: () => void;
  canSwitchToNational?: boolean;
  canSwitchToProvince?: boolean;
}

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  vacancyRate: number;
  vacancyRateYoY: number;
  vacancyRateMoM: number;
  avgWaitDays: number;
  avgWaitDaysYoY: number;
  avgWaitDaysMoM: number;
  rentCollectionRate: number;
  rentCollectionRateYoY: number;
  rentCollectionRateMoM: number;
  satisfaction: number;
  satisfactionYoY: number;
  satisfactionMoM: number;
  suggestions: string[];
  evictionPlan: EvictionPlan[];
}

export interface EvictionPlan {
  communityName: string;
  reason: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
}

export interface AllocationPlan {
  id: string;
  year: number;
  batches: AllocationBatch[];
  totalUnits: number;
  predictedGap: number;
  recommendations: string[];
}

export interface AllocationBatch {
  batchNumber: number;
  releaseDate: string;
  units: number;
  unitTypes: { type: string; count: number }[];
  estimatedWaiters: number;
  expectedFillRate: number;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  type: 'applicant' | 'allocation' | 'rent' | 'complaint';
  status: 'online' | 'offline' | 'warning';
  lastUpdate: string;
  recordCount: number;
  errorCount: number;
}
