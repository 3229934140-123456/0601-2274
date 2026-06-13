import type { Province, City, Community, KPIData, OccupancyTrend, Complaint, RentRecord, Warning, WeeklyReport, AllocationPlan, DataSourceStatus } from '../types';

export const provinces: Province[] = [
  { id: '110000', name: '北京市', code: 'BJ', communityCount: 128, totalUnits: 45680, vacancyRate: 7.2, rentCollectionRate: 92.5, allocationEfficiency: 78.3, satisfaction: 85.6 },
  { id: '310000', name: '上海市', code: 'SH', communityCount: 156, totalUnits: 52340, vacancyRate: 6.8, rentCollectionRate: 94.2, allocationEfficiency: 82.1, satisfaction: 87.3 },
  { id: '440000', name: '广东省', code: 'GD', communityCount: 428, totalUnits: 128560, vacancyRate: 8.5, rentCollectionRate: 89.7, allocationEfficiency: 75.6, satisfaction: 83.2 },
  { id: '330000', name: '浙江省', code: 'ZJ', communityCount: 356, totalUnits: 98450, vacancyRate: 7.9, rentCollectionRate: 91.3, allocationEfficiency: 79.8, satisfaction: 86.1 },
  { id: '320000', name: '江苏省', code: 'JS', communityCount: 389, totalUnits: 105670, vacancyRate: 8.1, rentCollectionRate: 90.5, allocationEfficiency: 77.2, satisfaction: 84.8 },
  { id: '510000', name: '四川省', code: 'SC', communityCount: 245, totalUnits: 67890, vacancyRate: 9.2, rentCollectionRate: 87.6, allocationEfficiency: 71.5, satisfaction: 81.3 },
  { id: '420000', name: '湖北省', code: 'HB', communityCount: 198, totalUnits: 56780, vacancyRate: 8.8, rentCollectionRate: 88.9, allocationEfficiency: 73.4, satisfaction: 82.7 },
  { id: '370000', name: '山东省', code: 'SD', communityCount: 287, totalUnits: 78900, vacancyRate: 8.3, rentCollectionRate: 90.1, allocationEfficiency: 76.8, satisfaction: 84.2 },
  { id: '430000', name: '湖南省', code: 'HN', communityCount: 176, totalUnits: 48670, vacancyRate: 9.5, rentCollectionRate: 86.8, allocationEfficiency: 70.2, satisfaction: 80.9 },
  { id: '130000', name: '河北省', code: 'HE', communityCount: 165, totalUnits: 45780, vacancyRate: 9.8, rentCollectionRate: 85.3, allocationEfficiency: 68.7, satisfaction: 79.5 },
  { id: '410000', name: '河南省', code: 'HA', communityCount: 223, totalUnits: 62340, vacancyRate: 9.1, rentCollectionRate: 87.2, allocationEfficiency: 72.3, satisfaction: 81.8 },
  { id: '350000', name: '福建省', code: 'FJ', communityCount: 189, totalUnits: 52670, vacancyRate: 7.6, rentCollectionRate: 91.8, allocationEfficiency: 78.5, satisfaction: 85.3 },
  { id: '610000', name: '陕西省', code: 'SN', communityCount: 142, totalUnits: 38900, vacancyRate: 8.7, rentCollectionRate: 88.4, allocationEfficiency: 74.1, satisfaction: 82.5 },
  { id: '500000', name: '重庆市', code: 'CQ', communityCount: 134, totalUnits: 36780, vacancyRate: 9.0, rentCollectionRate: 87.8, allocationEfficiency: 73.8, satisfaction: 82.1 },
  { id: '120000', name: '天津市', code: 'TJ', communityCount: 98, totalUnits: 28900, vacancyRate: 7.5, rentCollectionRate: 92.1, allocationEfficiency: 79.5, satisfaction: 85.7 },
  { id: '210000', name: '辽宁省', code: 'LN', communityCount: 156, totalUnits: 42670, vacancyRate: 10.2, rentCollectionRate: 84.6, allocationEfficiency: 67.3, satisfaction: 78.9 },
  { id: '230000', name: '黑龙江省', code: 'HL', communityCount: 128, totalUnits: 35670, vacancyRate: 10.8, rentCollectionRate: 83.2, allocationEfficiency: 65.8, satisfaction: 77.6 },
  { id: '220000', name: '吉林省', code: 'JL', communityCount: 109, totalUnits: 30450, vacancyRate: 10.5, rentCollectionRate: 84.1, allocationEfficiency: 66.5, satisfaction: 78.2 },
  { id: '340000', name: '安徽省', code: 'AH', communityCount: 167, totalUnits: 45890, vacancyRate: 8.9, rentCollectionRate: 88.2, allocationEfficiency: 74.6, satisfaction: 83.4 },
  { id: '360000', name: '江西省', code: 'JX', communityCount: 145, totalUnits: 39670, vacancyRate: 9.3, rentCollectionRate: 87.5, allocationEfficiency: 72.8, satisfaction: 81.6 },
  { id: '450000', name: '广西壮族自治区', code: 'GX', communityCount: 132, totalUnits: 36780, vacancyRate: 9.7, rentCollectionRate: 86.5, allocationEfficiency: 71.2, satisfaction: 80.5 },
  { id: '520000', name: '贵州省', code: 'GZ', communityCount: 118, totalUnits: 32560, vacancyRate: 9.9, rentCollectionRate: 85.8, allocationEfficiency: 69.7, satisfaction: 79.8 },
  { id: '530000', name: '云南省', code: 'YN', communityCount: 125, totalUnits: 34890, vacancyRate: 9.4, rentCollectionRate: 87.1, allocationEfficiency: 71.8, satisfaction: 81.2 },
  { id: '620000', name: '甘肃省', code: 'GS', communityCount: 89, totalUnits: 24560, vacancyRate: 10.3, rentCollectionRate: 83.9, allocationEfficiency: 67.8, satisfaction: 78.4 },
  { id: '140000', name: '山西省', code: 'SX', communityCount: 112, totalUnits: 31230, vacancyRate: 9.6, rentCollectionRate: 86.9, allocationEfficiency: 71.5, satisfaction: 81.1 },
  { id: '150000', name: '内蒙古自治区', code: 'NM', communityCount: 76, totalUnits: 21450, vacancyRate: 10.1, rentCollectionRate: 85.1, allocationEfficiency: 68.2, satisfaction: 79.3 },
  { id: '460000', name: '海南省', code: 'HI', communityCount: 56, totalUnits: 15670, vacancyRate: 8.2, rentCollectionRate: 90.3, allocationEfficiency: 76.5, satisfaction: 84.6 },
  { id: '540000', name: '西藏自治区', code: 'XZ', communityCount: 34, totalUnits: 8900, vacancyRate: 8.8, rentCollectionRate: 89.5, allocationEfficiency: 75.2, satisfaction: 83.8 },
  { id: '630000', name: '青海省', code: 'QH', communityCount: 45, totalUnits: 12340, vacancyRate: 10.0, rentCollectionRate: 84.7, allocationEfficiency: 68.9, satisfaction: 79.6 },
  { id: '640000', name: '宁夏回族自治区', code: 'NX', communityCount: 52, totalUnits: 14560, vacancyRate: 9.5, rentCollectionRate: 86.2, allocationEfficiency: 70.5, satisfaction: 80.7 },
  { id: '650000', name: '新疆维吾尔自治区', code: 'XJ', communityCount: 68, totalUnits: 18760, vacancyRate: 10.5, rentCollectionRate: 83.5, allocationEfficiency: 66.2, satisfaction: 78.1 },
];

export const cities: City[] = [
  { id: '110100', provinceId: '110000', name: '北京市', communityCount: 128, totalUnits: 45680, vacancyRate: 7.2, rentCollectionRate: 92.5, allocationEfficiency: 78.3, satisfaction: 85.6 },
  { id: '310100', provinceId: '310000', name: '上海市', communityCount: 156, totalUnits: 52340, vacancyRate: 6.8, rentCollectionRate: 94.2, allocationEfficiency: 82.1, satisfaction: 87.3 },
  { id: '440100', provinceId: '440000', name: '广州市', communityCount: 98, totalUnits: 32560, vacancyRate: 7.8, rentCollectionRate: 91.2, allocationEfficiency: 78.5, satisfaction: 84.6 },
  { id: '440300', provinceId: '440000', name: '深圳市', communityCount: 112, totalUnits: 45780, vacancyRate: 6.5, rentCollectionRate: 93.8, allocationEfficiency: 85.2, satisfaction: 88.1 },
  { id: '440600', provinceId: '440000', name: '佛山市', communityCount: 56, totalUnits: 15670, vacancyRate: 8.9, rentCollectionRate: 88.5, allocationEfficiency: 73.6, satisfaction: 82.3 },
  { id: '441300', provinceId: '440000', name: '惠州市', communityCount: 45, totalUnits: 12450, vacancyRate: 9.2, rentCollectionRate: 87.6, allocationEfficiency: 71.8, satisfaction: 81.5 },
  { id: '330100', provinceId: '330000', name: '杭州市', communityCount: 89, totalUnits: 28900, vacancyRate: 6.9, rentCollectionRate: 92.8, allocationEfficiency: 81.5, satisfaction: 86.8 },
  { id: '330200', provinceId: '330000', name: '宁波市', communityCount: 76, totalUnits: 23450, vacancyRate: 7.3, rentCollectionRate: 91.5, allocationEfficiency: 79.2, satisfaction: 85.7 },
  { id: '330300', provinceId: '330000', name: '温州市', communityCount: 65, totalUnits: 19780, vacancyRate: 8.1, rentCollectionRate: 89.7, allocationEfficiency: 76.4, satisfaction: 83.9 },
  { id: '320100', provinceId: '320000', name: '南京市', communityCount: 78, totalUnits: 25670, vacancyRate: 7.1, rentCollectionRate: 92.3, allocationEfficiency: 80.8, satisfaction: 86.2 },
  { id: '320500', provinceId: '320000', name: '苏州市', communityCount: 92, totalUnits: 31230, vacancyRate: 6.7, rentCollectionRate: 93.2, allocationEfficiency: 83.5, satisfaction: 87.5 },
  { id: '320200', provinceId: '320000', name: '无锡市', communityCount: 56, totalUnits: 17890, vacancyRate: 7.5, rentCollectionRate: 90.8, allocationEfficiency: 78.1, satisfaction: 85.1 },
  { id: '510100', provinceId: '510000', name: '成都市', communityCount: 125, totalUnits: 36780, vacancyRate: 8.5, rentCollectionRate: 88.9, allocationEfficiency: 74.2, satisfaction: 82.8 },
  { id: '420100', provinceId: '420000', name: '武汉市', communityCount: 98, totalUnits: 28900, vacancyRate: 8.2, rentCollectionRate: 89.5, allocationEfficiency: 75.6, satisfaction: 83.4 },
  { id: '370100', provinceId: '370000', name: '济南市', communityCount: 67, totalUnits: 20450, vacancyRate: 7.8, rentCollectionRate: 90.8, allocationEfficiency: 77.5, satisfaction: 84.6 },
  { id: '370200', provinceId: '370000', name: '青岛市', communityCount: 89, totalUnits: 25670, vacancyRate: 7.2, rentCollectionRate: 91.9, allocationEfficiency: 79.8, satisfaction: 85.9 },
  { id: '430100', provinceId: '430000', name: '长沙市', communityCount: 78, totalUnits: 22340, vacancyRate: 8.9, rentCollectionRate: 87.6, allocationEfficiency: 72.5, satisfaction: 82.1 },
  { id: '130100', provinceId: '130000', name: '石家庄市', communityCount: 56, totalUnits: 16780, vacancyRate: 9.8, rentCollectionRate: 85.3, allocationEfficiency: 68.9, satisfaction: 79.6 },
  { id: '410100', provinceId: '410000', name: '郑州市', communityCount: 76, totalUnits: 23450, vacancyRate: 8.8, rentCollectionRate: 87.9, allocationEfficiency: 73.2, satisfaction: 82.3 },
  { id: '350100', provinceId: '350000', name: '福州市', communityCount: 67, totalUnits: 19780, vacancyRate: 7.5, rentCollectionRate: 91.5, allocationEfficiency: 78.9, satisfaction: 85.2 },
  { id: '350200', provinceId: '350000', name: '厦门市', communityCount: 58, totalUnits: 17670, vacancyRate: 6.8, rentCollectionRate: 92.8, allocationEfficiency: 82.3, satisfaction: 86.7 },
  { id: '610100', provinceId: '610000', name: '西安市', communityCount: 72, totalUnits: 21560, vacancyRate: 8.4, rentCollectionRate: 88.7, allocationEfficiency: 74.8, satisfaction: 83.1 },
  { id: '500100', provinceId: '500000', name: '重庆市', communityCount: 134, totalUnits: 36780, vacancyRate: 9.0, rentCollectionRate: 87.8, allocationEfficiency: 73.8, satisfaction: 82.1 },
  { id: '120100', provinceId: '120000', name: '天津市', communityCount: 98, totalUnits: 28900, vacancyRate: 7.5, rentCollectionRate: 92.1, allocationEfficiency: 79.5, satisfaction: 85.7 },
  { id: '210100', provinceId: '210000', name: '沈阳市', communityCount: 68, totalUnits: 20340, vacancyRate: 10.2, rentCollectionRate: 84.6, allocationEfficiency: 67.5, satisfaction: 79.1 },
  { id: '210200', provinceId: '210000', name: '大连市', communityCount: 56, totalUnits: 15670, vacancyRate: 9.8, rentCollectionRate: 85.2, allocationEfficiency: 68.9, satisfaction: 78.5 },
  { id: '230100', provinceId: '230000', name: '哈尔滨市', communityCount: 58, totalUnits: 17890, vacancyRate: 11.2, rentCollectionRate: 82.5, allocationEfficiency: 65.2, satisfaction: 77.3 },
  { id: '220100', provinceId: '220000', name: '长春市', communityCount: 52, totalUnits: 15670, vacancyRate: 10.8, rentCollectionRate: 83.6, allocationEfficiency: 66.3, satisfaction: 78.1 },
];

function generateCommunities(): Community[] {
  const communities: Community[] = [];
  const sampleCommunities = [
    { name: '阳光家园', district: '朝阳区', property: '阳光物业' },
    { name: '幸福里小区', district: '海淀区', property: '幸福物业' },
    { name: '和谐家园', district: '丰台区', property: '和谐物业' },
    { name: '安泰小区', district: '东城区', property: '安泰物业' },
    { name: '康乐家园', district: '西城区', property: '康乐物业' },
    { name: '民安小区', district: '石景山区', property: '民安物业' },
    { name: '福临家园', district: '通州区', property: '福临物业' },
    { name: '瑞祥小区', district: '大兴区', property: '瑞祥物业' },
    { name: '和悦家园', district: '昌平区', property: '和悦物业' },
    { name: '盛景小区', district: '房山区', property: '盛景物业' },
    { name: '嘉和园', district: '顺义区', property: '嘉和物业' },
    { name: '润景家园', district: '平谷区', property: '润景物业' },
    { name: '悦湖小区', district: '怀柔区', property: '悦湖物业' },
    { name: '翠湖家园', district: '密云区', property: '翠湖物业' },
    { name: '景园小区', district: '延庆区', property: '景园物业' },
    { name: '翰林家园', district: '门头沟区', property: '翰林物业' },
    { name: '紫郡小区', district: '燕郊区', property: '紫郡物业' },
    { name: '御景家园', district: '亦庄开发区', property: '御景物业' },
    { name: '观澜小区', district: '望京区', property: '观澜物业' },
    { name: '逸景家园', district: '国贸区', property: '逸景物业' },
  ];

  const cityId = '110100';

  for (let i = 0; i < 20; i++) {
    const totalUnits = 500 + Math.floor(Math.random() * 2500);
    const vacancyRate = 5 + Math.random() * 12;
    const vacantUnits = Math.floor(totalUnits * vacancyRate / 100);
    const occupiedUnits = totalUnits - vacantUnits;
    const rentCollectionRate = 75 + Math.random() * 22;
    const allocationEfficiency = 60 + Math.random() * 35;
    const satisfaction = 70 + Math.random() * 25;

    communities.push({
      id: `community-${i + 1}`,
      cityId,
      name: sampleCommunities[i].name,
      address: `${sampleCommunities[i].district}${sampleCommunities[i].name}${Math.floor(Math.random() * 100) + 1}号`,
      district: sampleCommunities[i].district,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      vacancyRate: Math.round(vacancyRate * 10) / 10,
      rentCollectionRate: Math.round(rentCollectionRate * 10) / 10,
      allocationEfficiency: Math.round(allocationEfficiency * 10) / 10,
      satisfaction: Math.round(satisfaction * 10) / 10,
      unitTypes: [
        { type: '一室一厅', count: Math.floor(totalUnits * 0.3), area: 45 },
        { type: '两室一厅', count: Math.floor(totalUnits * 0.45), area: 65 },
        { type: '三室一厅', count: Math.floor(totalUnits * 0.2), area: 85 },
        { type: '四室两厅', count: Math.floor(totalUnits * 0.05), area: 110 },
      ],
      buildYear: 2010 + Math.floor(Math.random() * 14),
      propertyCompany: sampleCommunities[i].property,
      warningCount: vacancyRate > 10 || rentCollectionRate < 80 ? Math.floor(Math.random() * 3) + 1 : 0,
      warningLevel: vacancyRate > 10 && rentCollectionRate < 80 ? 'level2' : vacancyRate > 10 || rentCollectionRate < 80 ? 'level1' : undefined,
    });
  }

  return communities;
}

export const communities: Community[] = generateCommunities();

export const nationalKPIData: KPIData = {
  allocationEfficiency: 74.2,
  allocationEfficiencyChange: 2.3,
  vacancyRate: 8.7,
  vacancyRateChange: -0.5,
  rentCollectionRate: 88.6,
  rentCollectionRateChange: 1.2,
  satisfaction: 82.9,
  satisfactionChange: 0.8,
  totalCommunities: 5876,
  totalUnits: 1687540,
  totalWaiters: 325680,
};

function generateOccupancyTrend(days: number): OccupancyTrend[] {
  const data: OccupancyTrend[] = [];
  const today = new Date();
  let baseRate = 85 + Math.random() * 10;
  let baseUnits = 800 + Math.floor(Math.random() * 500);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    baseRate += (Math.random() - 0.45) * 2;
    baseRate = Math.max(75, Math.min(95, baseRate));
    baseUnits += Math.floor((Math.random() - 0.45) * 20);
    baseUnits = Math.max(600, Math.min(1200, baseUnits));

    data.push({
      date: date.toISOString().split('T')[0],
      occupancyRate: Math.round(baseRate * 10) / 10,
      occupiedUnits: baseUnits,
    });
  }

  return data;
}

export const getCommunityOccupancyTrend = (communityId: string): OccupancyTrend[] => {
  return generateOccupancyTrend(30);
};

function generateComplaints(communityId: string, count: number): Complaint[] {
  const types: Array<{ type: any; titles: string[] }> = [
    { type: 'maintenance', titles: ['水管漏水维修', '电梯故障报修', '墙面脱落维修', '公共照明损坏', '门禁系统故障'] },
    { type: 'hygiene', titles: ['楼道卫生问题', '垃圾清运不及时', '小区环境脏乱', '蚊虫滋生问题', '污水管道堵塞'] },
    { type: 'security', titles: ['外来人员管理', '车辆乱停乱放', '监控设备故障', '夜间巡逻不足', '消防通道堵塞'] },
    { type: 'noise', titles: ['装修噪音扰民', '夜间噪音投诉', '广场舞噪音', '宠物叫声扰民', '电梯运行噪音'] },
    { type: 'service', titles: ['物业态度问题', '办事效率低', '收费标准争议', '信息不透明', '投诉处理慢'] },
    { type: 'other', titles: ['其他问题1', '其他问题2', '其他问题3'] },
  ];

  const complaints: Complaint[] = [];
  const statuses: ('pending' | 'processing' | 'resolved')[] = ['pending', 'processing', 'resolved'];

  for (let i = 0; i < count; i++) {
    const typeData = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createDate = new Date();
    createDate.setDate(createDate.getDate() - Math.floor(Math.random() * 30));

    complaints.push({
      id: `complaint-${communityId}-${i}`,
      communityId,
      type: typeData.type,
      title: typeData.titles[Math.floor(Math.random() * typeData.titles.length)],
      content: '这是一条模拟的投诉内容，描述了住户遇到的具体问题和诉求。',
      status,
      createDate: createDate.toISOString().split('T')[0],
      resolveDate: status === 'resolved' ? new Date(createDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      residentName: `住户${Math.floor(Math.random() * 1000)}`,
      unitNumber: `${Math.floor(Math.random() * 20) + 1}号楼${Math.floor(Math.random() * 30) + 1}0${Math.floor(Math.random() * 9) + 1}`,
    });
  }

  return complaints.sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());
}

export const getCommunityComplaints = (communityId: string): Complaint[] => {
  return generateComplaints(communityId, 35);
};

function generateRentRecords(communityId: string, months: number): RentRecord[] {
  const records: RentRecord[] = [];
  const today = new Date();
  let baseRate = 85 + Math.random() * 10;
  let baseShould = 150000 + Math.random() * 100000;

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    baseRate += (Math.random() - 0.45) * 3;
    baseRate = Math.max(75, Math.min(98, baseRate));
    baseShould += (Math.random() - 0.5) * 5000;
    baseShould = Math.max(100000, Math.min(300000, baseShould));

    const actual = baseShould * baseRate / 100;
    const arrearsCount = Math.floor((100 - baseRate) * 2);

    records.push({
      id: `rent-${communityId}-${i}`,
      communityId,
      month: date.toISOString().substring(0, 7),
      shouldCollect: Math.round(baseShould),
      actualCollect: Math.round(actual),
      rate: Math.round(baseRate * 10) / 10,
      arrearsCount,
      arrearsAmount: Math.round(baseShould - actual),
    });
  }

  return records;
}

export const getCommunityRentRecords = (communityId: string): RentRecord[] => {
  return generateRentRecords(communityId, 12);
};

function generateWarnings(): Warning[] {
  const warnings: Warning[] = [];
  const warningCommunities = communities.filter(c => c.warningLevel);

  let id = 1;
  warningCommunities.forEach(community => {
    if (community.vacancyRate > 10) {
      warnings.push({
        id: `warning-${id++}`,
        communityId: community.id,
        communityName: community.name,
        level: community.vacancyRate > 12 ? 'level2' : 'level1',
        type: 'vacancy',
        status: community.vacancyRate > 12 ? 'escalated' : 'active',
        triggerDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentValue: community.vacancyRate,
        threshold: 10,
        description: `该小区已连续${Math.floor(Math.random() * 20) + 30}天空置率超过10%，当前空置率为${community.vacancyRate}%`,
        processingDays: Math.floor(Math.random() * 25) + 5,
        approvalStage: community.vacancyRate > 12 ? 2 : undefined,
        approvalHistory: community.vacancyRate > 12 ? [
          { stage: 1, stageName: '物业确认', handler: '张经理', handlerRole: '物业负责人', opinion: '情况属实，已采取措施', date: '2026-05-28', status: 'approved' },
          { stage: 2, stageName: '区中心复核', handler: '李主任', handlerRole: '区住房保障中心', opinion: '复核通过，建议启动清退', date: '2026-06-02', status: 'approved' },
          { stage: 3, stageName: '市住建局批准', handler: '待审批', handlerRole: '市住建局', opinion: '', date: '', status: 'pending' },
        ] : undefined,
      });
    }
    if (community.rentCollectionRate < 80) {
      warnings.push({
        id: `warning-${id++}`,
        communityId: community.id,
        communityName: community.name,
        level: community.rentCollectionRate < 75 ? 'level2' : 'level1',
        type: 'rent',
        status: community.rentCollectionRate < 75 ? 'processing' : 'active',
        triggerDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentValue: community.rentCollectionRate,
        threshold: 80,
        description: `该小区本月租金收缴率为${community.rentCollectionRate}%，低于80%的警戒线`,
        processingDays: Math.floor(Math.random() * 20) + 3,
        approvalStage: community.rentCollectionRate < 75 ? 1 : undefined,
        approvalHistory: community.rentCollectionRate < 75 ? [
          { stage: 1, stageName: '物业确认', handler: '王主管', handlerRole: '物业负责人', opinion: '正在催收中', date: '2026-06-05', status: 'approved' },
          { stage: 2, stageName: '区中心复核', handler: '待复核', handlerRole: '区住房保障中心', opinion: '', date: '', status: 'pending' },
          { stage: 3, stageName: '市住建局批准', handler: '待审批', handlerRole: '市住建局', opinion: '', date: '', status: 'pending' },
        ] : undefined,
      });
    }
  });

  return warnings;
}

export const warnings: Warning[] = generateWarnings();

function generateWeeklyReports(): WeeklyReport[] {
  const reports: WeeklyReport[] = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - i * 7);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    const weekNumber = Math.ceil((endDate.getTime() - new Date(endDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

    reports.push({
      id: `report-${i}`,
      weekNumber,
      year: endDate.getFullYear(),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      vacancyRate: Math.round((8.5 + Math.random() * 1.5 + i * 0.1) * 10) / 10,
      vacancyRateYoY: Math.round((-2.3 + Math.random() * 1) * 10) / 10,
      vacancyRateMoM: Math.round((-0.3 + Math.random() * 0.5) * 10) / 10,
      avgWaitDays: Math.round(85 + Math.random() * 20 - i * 2),
      avgWaitDaysYoY: Math.round((-12.5 + Math.random() * 5) * 10) / 10,
      avgWaitDaysMoM: Math.round((-3.2 + Math.random() * 2) * 10) / 10,
      rentCollectionRate: Math.round((88 + Math.random() * 5 - i * 0.2) * 10) / 10,
      rentCollectionRateYoY: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      rentCollectionRateMoM: Math.round((0.8 + Math.random() * 0.5) * 10) / 10,
      satisfaction: Math.round((82 + Math.random() * 5) * 10) / 10,
      satisfactionYoY: Math.round((2.1 + Math.random() * 1) * 10) / 10,
      satisfactionMoM: Math.round((0.5 + Math.random() * 0.3) * 10) / 10,
      suggestions: [
        '建议优化轮候排序算法，提高匹配效率',
        '加强对空置率较高小区的宣传推广',
        '完善租金催收机制，提高收缴率',
        '增加小区配套设施，提升住户满意度',
      ],
      evictionPlan: [
        { communityName: '阳光家园', reason: '长期空置且无人申请', count: 25, priority: 'high' },
        { communityName: '幸福里小区', reason: '租金拖欠超6个月', count: 12, priority: 'high' },
        { communityName: '和谐家园', reason: '违规转租', count: 8, priority: 'medium' },
      ],
    });
  }

  return reports;
}

export const weeklyReports: WeeklyReport[] = generateWeeklyReports();

function generateAllocationPlan(): AllocationPlan {
  return {
    id: 'plan-2026',
    year: 2026,
    totalUnits: 15000,
    predictedGap: 8500,
    batches: [
      { batchNumber: 1, releaseDate: '2026-03-15', units: 3000, unitTypes: [{ type: '一室一厅', count: 900 }, { type: '两室一厅', count: 1500 }, { type: '三室一厅', count: 600 }], estimatedWaiters: 12000, expectedFillRate: 95 },
      { batchNumber: 2, releaseDate: '2026-06-20', units: 4000, unitTypes: [{ type: '一室一厅', count: 1200 }, { type: '两室一厅', count: 2000 }, { type: '三室一厅', count: 800 }], estimatedWaiters: 15000, expectedFillRate: 92 },
      { batchNumber: 3, releaseDate: '2026-09-10', units: 3500, unitTypes: [{ type: '一室一厅', count: 1050 }, { type: '两室一厅', count: 1750 }, { type: '三室一厅', count: 700 }], estimatedWaiters: 10000, expectedFillRate: 88 },
      { batchNumber: 4, releaseDate: '2026-12-01', units: 4500, unitTypes: [{ type: '一室一厅', count: 1350 }, { type: '两室一厅', count: 2250 }, { type: '三室一厅', count: 900 }], estimatedWaiters: 8000, expectedFillRate: 85 },
    ],
    recommendations: [
      '建议将第三批次房源投放时间提前至8月中旬，缓解暑期申请高峰',
      '优先将大户型房源分配给3人及以上家庭，提高居住匹配度',
      '针对空置率较高区域，适当降低准入门槛',
      '建立轮候家庭动态更新机制，及时清理无效申请',
      '建议增加一室户比例，满足单身青年需求',
    ],
  };
}

export const allocationPlan: AllocationPlan = generateAllocationPlan();

export const dataSources: DataSourceStatus[] = [
  { id: 'ds-1', name: '申请人轮候数据', type: 'applicant', status: 'online', lastUpdate: '2026-06-14 10:30:00', recordCount: 325680, errorCount: 0 },
  { id: 'ds-2', name: '房源分配数据', type: 'allocation', status: 'online', lastUpdate: '2026-06-14 10:25:00', recordCount: 125680, errorCount: 3 },
  { id: 'ds-3', name: '租金缴纳数据', type: 'rent', status: 'warning', lastUpdate: '2026-06-14 08:15:00', recordCount: 895600, errorCount: 28 },
  { id: 'ds-4', name: '住户投诉数据', type: 'complaint', status: 'online', lastUpdate: '2026-06-14 10:00:00', recordCount: 15680, errorCount: 0 },
];

export const getCitiesByProvince = (provinceId: string): City[] => {
  return cities.filter(c => c.provinceId === provinceId);
};

export const getCommunitiesByCity = (cityId: string): Community[] => {
  if (cityId === '110100') return communities;
  return communities.slice(0, 10).map((c, i) => ({
    ...c,
    id: `community-${cityId}-${i}`,
    cityId,
    name: `${c.name}(分)`,
  }));
};

export const getCommunityById = (id: string): Community | undefined => {
  return communities.find(c => c.id === id);
};

export const getWarningById = (id: string): Warning | undefined => {
  return warnings.find(w => w.id === id);
};
