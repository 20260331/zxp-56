import { HandoverItem, HandoverStatus, ShiftReport, ShiftReportItem } from '../types';

const STORAGE_KEY = 'duty_handover_items';
const REPORTS_STORAGE_KEY = 'duty_shift_reports';

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

export const getReports = (): ShiftReport[] => {
  const data = localStorage.getItem(REPORTS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveReports = (reports: ShiftReport[]): void => {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
};

export const addReport = (report: Omit<ShiftReport, 'id' | 'createdAt'>): ShiftReport => {
  const reports = getReports();
  const newReport: ShiftReport = {
    ...report,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
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

export const convertToReportItem = (item: HandoverItem): ShiftReportItem => ({
  id: item.id,
  title: item.title,
  description: item.description,
  priority: item.priority,
  assignee: item.assignee,
  deadline: item.deadline
});
