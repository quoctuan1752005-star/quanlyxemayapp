/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'admin' | 'user';
export type ManagementMethod = 'km' | 'hours' | 'both';
export type LogType = 'daily' | 'monthly';
export type MaintenanceStatus = 'normal' | 'warning' | 'overdue';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  phoneNumber?: string;
  displayName: string;
  role: Role;
  assignedVehicles: string[]; // vehicle plate numbers or IDs
  createdAt?: string;
  updatedAt?: string;
}

export interface Vehicle {
  id: string; // usually plate number
  plateNumber: string;
  name: string;
  type: string; // Ô tô, Xe máy, Máy xúc, v.v.
  manufacturer: string;
  manufacturingYear: number;
  usageYear: number;
  chassisNumber: string;
  engineNumber: string;
  managementUnit: string;
  assignedTo: string; // User ID
  assignedToName: string; // User Display Name
  imageUrl?: string;
  managementMethod: ManagementMethod;
  currentKm: number;
  currentHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  km?: number;
  hours?: number;
  notes: string;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
}

export interface MonthlyLog {
  id: string;
  vehicleId: string;
  month: number; // 1-12
  year: number;
  kmValue?: number;
  hoursValue?: number;
  kmDiff?: number;
  hoursDiff?: number;
  notes: string;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  vehicleId: string;
  title: string; // e.g. Thay dầu động cơ, Thay lọc dầu
  intervalKm?: number;
  intervalHours?: number;
  intervalMonths?: number;
  lastPerformedKm?: number;
  lastPerformedHours?: number;
  lastPerformedDate?: string; // YYYY-MM-DD
  nextDueKm?: number;
  nextDueHours?: number;
  nextDueDate?: string; // YYYY-MM-DD
  status: MaintenanceStatus;
  updatedAt: string;
}

export interface MaintenanceHistory {
  id: string;
  vehicleId: string;
  scheduleId?: string;
  title: string;
  performedDate: string; // YYYY-MM-DD
  performedKm?: number;
  performedHours?: number;
  cost: number;
  performedBy: string;
  notes: string;
  createdAt: string;
}

export interface PartReplacementHistory {
  id: string;
  vehicleId: string;
  partName: string;
  replacedDate: string; // YYYY-MM-DD
  replacedKm?: number;
  replacedHours?: number;
  warrantyMonths?: number;
  notes: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  type: string; // 'maintenance_due' | 'maintenance_overdue' | 'new_log' | 'request' | 'system'
  targetUser: string; // 'all' or specific userId
  isRead: boolean;
  createdAt: string;
}

export interface EditRequest {
  id: string;
  vehicleId: string;
  logId: string;
  logType: LogType;
  requestedBy: string;
  requestedByName: string;
  originalData: any;
  newData: any;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}
