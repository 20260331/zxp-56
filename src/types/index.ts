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
  createdAt: string;
  receiptStatus: ReportReceiptStatus;
  receivedBy?: string;
  receivedAt?: string;
}

export type FilterType = 'all' | 'today' | 'overdue' | 'pending' | 'completed';
