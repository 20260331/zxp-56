export enum HandoverStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum RiskLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum RiskStatus {
  OPEN = 'open',
  RESOLVED = 'resolved'
}

export interface HandoverItem {
  id: string;
  title: string;
  description: string;
  status: HandoverStatus;
  priority: Priority;
  assignee: string;
  reporter: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  remarks?: string;
  isRisk: boolean;
  riskLevel: RiskLevel;
  riskStatus: RiskStatus;
  followUpPlan?: string;
  riskResolvedAt?: string;
}

export interface DutyShift {
  id: string;
  date: string;
  shiftType: 'morning' | 'afternoon' | 'night';
  operator: string;
  handoverTime: string;
}

export interface ShiftReportItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  assignee: string;
  deadline: string;
  isRisk: boolean;
  riskLevel: RiskLevel;
  riskStatus: RiskStatus;
  followUpPlan?: string;
}

export enum ReportReceiptStatus {
  PENDING = 'pending',
  RECEIVED = 'received'
}

export interface ShiftReport {
  id: string;
  date: string;
  shiftType: 'morning' | 'afternoon' | 'night';
  operator: string;
  handoverTime: string;
  nextOperator: string;
  summary: string;
  newItems: ShiftReportItem[];
  completedItems: ShiftReportItem[];
  pendingItems: ShiftReportItem[];
  riskItems: ShiftReportItem[];
  createdAt: string;
  receiptStatus: ReportReceiptStatus;
  receivedBy?: string;
  receivedAt?: string;
  hasUnresolvedRisk: boolean;
}

export type FilterType = 'all' | 'today' | 'overdue' | 'pending' | 'completed';
