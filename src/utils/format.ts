export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}万`;
  }
  return value.toLocaleString();
};

export const formatCurrency = (value: number): string => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万元`;
  }
  return `${value.toLocaleString()}元`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const getTrendIcon = (change: number): 'up' | 'down' | 'flat' => {
  if (change > 0.1) return 'up';
  if (change < -0.1) return 'down';
  return 'flat';
};

export const getComplaintTypeName = (type: string): string => {
  const nameMap: Record<string, string> = {
    maintenance: '设施维修',
    hygiene: '环境卫生',
    security: '安全保卫',
    noise: '噪音扰民',
    service: '服务态度',
    other: '其他问题',
  };
  return nameMap[type] || type;
};

export const getWarningTypeName = (type: string): string => {
  const nameMap: Record<string, string> = {
    vacancy: '空置率过高',
    rent: '租金收缴率过低',
  };
  return nameMap[type] || type;
};

export const getWarningLevelName = (level: string): string => {
  const nameMap: Record<string, string> = {
    level1: '一级预警',
    level2: '二级预警',
  };
  return nameMap[level] || level;
};

export const getWarningStatusName = (status: string): string => {
  const nameMap: Record<string, string> = {
    active: '待处理',
    processing: '处理中',
    escalated: '已升级',
    resolved: '已解除',
  };
  return nameMap[status] || status;
};

export const getDataSourceTypeName = (type: string): string => {
  const nameMap: Record<string, string> = {
    applicant: '申请人轮候',
    allocation: '房源分配',
    rent: '租金缴纳',
    complaint: '住户投诉',
  };
  return nameMap[type] || type;
};

export const getRoleName = (role: string): string => {
  const nameMap: Record<string, string> = {
    national: '国家级',
    provincial: '省级',
    municipal: '市级',
    district: '区级',
    property: '物业级',
  };
  return nameMap[role] || role;
};

export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
