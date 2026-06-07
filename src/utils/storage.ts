import { HandoverItem, HandoverStatus, ShiftReport, ShiftReportItem, ReportReceiptStatus, RiskLevel, RiskStatus } from '../types';

const STORAGE_KEY = 'duty_handover_items';
const REPORTS_STORAGE_KEY = 'duty_shift_reports';

export const ensureItemRiskFields = (): void => {
  const items = getItems();
  let updated = false;
  const migrated = items.map(item => {
    if (item.isRisk === undefined) {
      updated = true;
      return {
        ...item,
        isRisk: false,
        riskLevel: RiskLevel.NONE,
        riskStatus: RiskStatus.RESOLVED
      };
    }
    return item;
  });
  if (updated) {
    saveItems(migrated);
  }
};

export const getItems = (): HandoverItem[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveItems = (items: HandoverItem[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const addItem = (item: Omit<HandoverItem, 'id' | 'createdAt' | 'updatedAt'>): HandoverItem => {
  const items = getItems();
  const newItem: HandoverItem = {
    ...item,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  items.unshift(newItem);
  saveItems(items);
  return newItem;
};

export const updateItem = (id: string, updates: Partial<HandoverItem>): HandoverItem | null => {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveItems(items);
  return items[index];
};

export const deleteItem = (id: string): boolean => {
  const items = getItems();
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  saveItems(filtered);
  return true;
};

export const completeItem = (id: string, remarks?: string): HandoverItem | null => {
  const items = getItems();
  const existingItem = items.find(item => item.id === id);
  if (!existingItem) return null;
  
  const mergedRemarks = [existingItem.remarks, remarks]
    .filter(Boolean)
    .join('\n\n');
  
  return updateItem(id, {
    status: HandoverStatus.COMPLETED,
    completedAt: new Date().toISOString(),
    remarks: mergedRemarks || undefined
  });
};

export const resolveRisk = (id: string, remarks?: string): HandoverItem | null => {
  const items = getItems();
  const existingItem = items.find(item => item.id === id);
  if (!existingItem) return null;

  const mergedRemarks = [existingItem.remarks, remarks]
    .filter(Boolean)
    .join('\n\n');

  return updateItem(id, {
    riskStatus: RiskStatus.RESOLVED,
    riskResolvedAt: new Date().toISOString(),
    remarks: mergedRemarks || undefined
  });
};

export const getOpenRiskItems = (): HandoverItem[] => {
  return getItems().filter(item => item.isRisk && item.riskStatus === RiskStatus.OPEN);
};

export const ensureReportRiskFields = (): void => {
  const reports = getReports();
  let updated = false;
  const migrated = reports.map(report => {
    if (report.riskItems === undefined || report.hasUnresolvedRisk === undefined) {
      updated = true;
      const riskItems = [
        ...(report.newItems || []),
        ...(report.pendingItems || [])
      ].filter(item => item.isRisk && item.riskStatus === RiskStatus.OPEN);
      return {
        ...report,
        riskItems,
        hasUnresolvedRisk: riskItems.length > 0
      };
    }
    return report;
  });
  if (updated) {
    saveReports(migrated);
  }
};

export const ensureReportReceiptFields = (): void => {
  const reports = getReports();
  let updated = false;
  const migrated = reports.map(report => {
    if (!report.receiptStatus) {
      updated = true;
      return {
        ...report,
        receiptStatus: ReportReceiptStatus.PENDING
      };
    }
    return report;
  });
  if (updated) {
    saveReports(migrated);
  }
};

export const ensureReportRiskFeedbackFields = (): void => {
  const reports = getReports();
  let updated = false;
  const migrated = reports.map(report => {
    return report;
  });
  if (updated) {
    saveReports(migrated);
  }
};

export const ensureAllMigrations = (): void => {
  ensureItemRiskFields();
  ensureReportReceiptFields();
  ensureReportRiskFields();
  ensureReportRiskFeedbackFields();
};

export const getReports = (): ShiftReport[] => {
  const data = localStorage.getItem(REPORTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveReports = (reports: ShiftReport[]): void => {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
};

export const addReport = (report: Omit<ShiftReport, 'id' | 'createdAt' | 'receiptStatus'>): ShiftReport => {
  const reports = getReports();
  const newReport: ShiftReport = {
    ...report,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    receiptStatus: ReportReceiptStatus.PENDING
  };
  reports.unshift(newReport);
  saveReports(reports);
  return newReport;
};

export const getReportById = (id: string): ShiftReport | null => {
  const reports = getReports();
  return reports.find(report => report.id === id) || null;
};

export const deleteReport = (id: string): boolean => {
  const reports = getReports();
  const filtered = reports.filter(report => report.id !== id);
  if (filtered.length === reports.length) return false;
  saveReports(filtered);
  return true;
};

export const confirmReport = (id: string, receivedBy: string): ShiftReport | null => {
  const reports = getReports();
  const index = reports.findIndex(report => report.id === id);
  if (index === -1) return null;

  reports[index] = {
    ...reports[index],
    receiptStatus: ReportReceiptStatus.RECEIVED,
    receivedBy,
    receivedAt: new Date().toISOString()
  };
  saveReports(reports);
  return reports[index];
};

export const saveRiskFeedback = (
  reportId: string,
  itemId: string,
  feedback: string,
  feedbackBy: string
): ShiftReport | null => {
  const reports = getReports();
  const index = reports.findIndex(report => report.id === reportId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updateItem = (item: ShiftReportItem): ShiftReportItem => {
    if (item.id === itemId) {
      return {
        ...item,
        riskFeedback: feedback,
        riskFeedbackBy: feedbackBy,
        riskFeedbackAt: now
      };
    }
    return item;
  };

  reports[index] = {
    ...reports[index],
    newItems: reports[index].newItems.map(updateItem),
    completedItems: reports[index].completedItems.map(updateItem),
    pendingItems: reports[index].pendingItems.map(updateItem),
    riskItems: reports[index].riskItems ? reports[index].riskItems.map(updateItem) : reports[index].riskItems
  };
  saveReports(reports);
  return reports[index];
};

export const convertToReportItem = (item: HandoverItem): ShiftReportItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  priority: item.priority,
  assignee: item.assignee,
  deadline: item.deadline,
  isRisk: item.isRisk,
  riskLevel: item.riskLevel,
  riskStatus: item.riskStatus,
  followUpPlan: item.followUpPlan
});
