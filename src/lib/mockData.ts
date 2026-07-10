/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Vehicle, 
  DailyLog, 
  MonthlyLog, 
  MaintenanceSchedule, 
  MaintenanceHistory, 
  PartReplacementHistory, 
  SystemNotification, 
  EditRequest, 
  ActivityLog,
  UserProfile
} from '../types';
import { isFirebaseAvailable, db, setDoc, doc } from './firebase';

// Standard Initial Users
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin_uid_001',
    email: 'admin@gmail.com',
    phoneNumber: '0987654321',
    displayName: 'Thiếu tá Trần Quốc Toản',
    role: 'admin',
    assignedVehicles: []
  },
  {
    uid: 'user_uid_002',
    email: 'user@gmail.com',
    phoneNumber: '0912345678',
    displayName: 'Trung úy Lê Hoàng Nam',
    role: 'user',
    assignedVehicles: ['QA-12-34', 'QA-56-78']
  }
];

// Initial Vehicles
export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'QA-12-34',
    plateNumber: 'QA-12-34',
    name: 'Toyota Land Cruiser (Xe chỉ huy)',
    type: 'Ô tô chỉ huy',
    manufacturer: 'Toyota',
    manufacturingYear: 2020,
    usageYear: 2021,
    chassisNumber: 'TLC99824012A',
    engineNumber: '1UR-FE-998124',
    managementUnit: 'Ban Tham mưu',
    assignedTo: 'user_uid_002',
    assignedToName: 'Trung úy Lê Hoàng Nam',
    managementMethod: 'km',
    currentKm: 45620,
    currentHours: 0,
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'QA-56-78',
    plateNumber: 'QA-56-78',
    name: 'Kamaz-43118 (Xe vận tải)',
    type: 'Ô tô vận tải',
    manufacturer: 'Kamaz',
    manufacturingYear: 2018,
    usageYear: 2019,
    chassisNumber: 'KAMAZ43118-2018X',
    engineNumber: 'V8-740.662-819',
    managementUnit: 'Đại đội Vận tải',
    assignedTo: 'user_uid_002',
    assignedToName: 'Trung úy Lê Hoàng Nam',
    managementMethod: 'both',
    currentKm: 12450,
    currentHours: 840,
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'QA-90-12',
    plateNumber: 'QA-90-12',
    name: 'Kobelco SK200-10 (Máy xúc)',
    type: 'Máy công trình',
    manufacturer: 'Kobelco',
    manufacturingYear: 2017,
    usageYear: 2018,
    chassisNumber: 'KOB-SK200-10-771',
    engineNumber: 'HINO-J05ETA-KSD',
    managementUnit: 'Đại đội Công binh',
    assignedTo: 'user_uid_003',
    assignedToName: 'Thượng úy Trần Minh Tiến',
    managementMethod: 'hours',
    currentKm: 0,
    currentHours: 3240,
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initial Maintenance Schedules
export const INITIAL_MAINTENANCE_SCHEDULES: MaintenanceSchedule[] = [
  // QA-12-34 (Toyota Land Cruiser - managed by Km)
  {
    id: 'sch_toyota_oil',
    vehicleId: 'QA-12-34',
    title: 'Thay dầu động cơ',
    intervalKm: 5000,
    intervalMonths: 6,
    lastPerformedKm: 41000,
    lastPerformedDate: '2026-04-10',
    nextDueKm: 46000,
    nextDueDate: '2026-10-10',
    status: 'warning', // Current is 45,620. Due in 380 Km.
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sch_toyota_filter',
    vehicleId: 'QA-12-34',
    title: 'Thay lọc dầu động cơ',
    intervalKm: 10000,
    intervalMonths: 12,
    lastPerformedKm: 40000,
    lastPerformedDate: '2026-02-15',
    nextDueKm: 50000,
    nextDueDate: '2027-02-15',
    status: 'normal', // Current 45,620. Due in 4,380 Km.
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sch_toyota_coolant',
    vehicleId: 'QA-12-34',
    title: 'Thay nước làm mát',
    intervalKm: 40000,
    intervalMonths: 24,
    lastPerformedKm: 40000,
    lastPerformedDate: '2026-02-15',
    nextDueKm: 80000,
    nextDueDate: '2028-02-15',
    status: 'normal',
    updatedAt: new Date().toISOString()
  },

  // QA-56-78 (Kamaz - managed by both)
  {
    id: 'sch_kamaz_oil_km',
    vehicleId: 'QA-56-78',
    title: 'Thay dầu động cơ',
    intervalKm: 10000,
    intervalHours: 500,
    intervalMonths: 12,
    lastPerformedKm: 10000,
    lastPerformedHours: 600,
    lastPerformedDate: '2026-01-20',
    nextDueKm: 20000,
    nextDueHours: 1100,
    nextDueDate: '2027-01-20',
    status: 'normal', // Km left: 7550, Hours left: 260
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sch_kamaz_tier_1',
    vehicleId: 'QA-56-78',
    title: 'Bảo dưỡng cấp 1',
    intervalKm: 5000,
    lastPerformedKm: 10000,
    lastPerformedDate: '2026-01-20',
    nextDueKm: 15000,
    status: 'normal', // Km left: 2550
    updatedAt: new Date().toISOString()
  },

  // QA-90-12 (Kobelco SK200 - managed by hours)
  {
    id: 'sch_kobelco_oil',
    vehicleId: 'QA-90-12',
    title: 'Thay dầu thủy lực',
    intervalHours: 1000,
    lastPerformedHours: 2000,
    lastPerformedDate: '2025-06-01',
    nextDueHours: 3000,
    status: 'overdue', // Current hours: 3240. Overdue by 240 hours.
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sch_kobelco_filter',
    vehicleId: 'QA-90-12',
    title: 'Thay lọc nhiên liệu',
    intervalHours: 250,
    lastPerformedHours: 3000,
    lastPerformedDate: '2026-03-15',
    nextDueHours: 3250,
    status: 'warning', // Current hours: 3240. Due in 10 hours.
    updatedAt: new Date().toISOString()
  }
];

// Initial Logs
export const INITIAL_DAILY_LOGS: DailyLog[] = [
  {
    id: 'dl_01',
    vehicleId: 'QA-12-34',
    date: '2026-07-01',
    km: 45450,
    notes: 'Đi tuần tra biên giới',
    recordedBy: 'user_uid_002',
    recordedByName: 'Trung úy Lê Hoàng Nam',
    createdAt: new Date('2026-07-01T17:00:00').toISOString()
  },
  {
    id: 'dl_02',
    vehicleId: 'QA-12-34',
    date: '2026-07-05',
    km: 45580,
    notes: 'Bảo đảm chỉ huy công tác huấn luyện',
    recordedBy: 'user_uid_002',
    recordedByName: 'Trung úy Lê Hoàng Nam',
    createdAt: new Date('2026-07-05T17:00:00').toISOString()
  },
  {
    id: 'dl_03',
    vehicleId: 'QA-56-78',
    date: '2026-07-03',
    km: 12380,
    hours: 835,
    notes: 'Vận chuyển vũ khí trang bị kỹ thuật',
    recordedBy: 'user_uid_002',
    recordedByName: 'Trung úy Lê Hoàng Nam',
    createdAt: new Date('2026-07-03T16:30:00').toISOString()
  }
];

export const INITIAL_MONTHLY_LOGS: MonthlyLog[] = [
  // QA-12-34 (Toyota Land Cruiser)
  {
    id: 'ml_toyota_05',
    vehicleId: 'QA-12-34',
    month: 5,
    year: 2026,
    kmValue: 44200,
    kmDiff: 1100,
    notes: 'Hoạt động tốt, tiêu chuẩn xăng đạt định mức',
    recordedBy: 'user_uid_002',
    recordedByName: 'Trung úy Lê Hoàng Nam',
    createdAt: new Date('2026-05-31T18:00:00').toISOString()
  },
  {
    id: 'ml_toyota_06',
    vehicleId: 'QA-12-34',
    month: 6,
    year: 2026,
    kmValue: 45300,
    kmDiff: 1100,
    notes: 'Hoạt động bình thường. Có kế hoạch bảo dưỡng thay dầu tháng tới.',
    recordedBy: 'user_uid_002',
    recordedByName: 'Trung úy Lê Hoàng Nam',
    createdAt: new Date('2026-06-30T18:00:00').toISOString()
  },
  
  // QA-56-78 (Kamaz)
  {
    id: 'ml_kamaz_05',
    vehicleId: 'QA-56-78',
    month: 5,
    year: 2026,
    kmValue: 12000,
    hoursValue: 810,
    kmDiff: 800,
    hoursDiff: 45,
    notes: 'Phương tiện sẵn sàng chiến đấu cao',
    recordedBy: 'user_uid_002',
    recordedByName: 'Trung úy Lê Hoàng Nam',
    createdAt: new Date('2026-05-31T18:30:00').toISOString()
  },
  {
    id: 'ml_kamaz_06',
    vehicleId: 'QA-56-78',
    month: 6,
    year: 2026,
    kmValue: 12400,
    hoursValue: 835,
    kmDiff: 400,
    hoursDiff: 25,
    notes: 'Không có hư hỏng phát sinh',
    recordedBy: 'user_uid_002',
    recordedByName: 'Trung úy Lê Hoàng Nam',
    createdAt: new Date('2026-06-30T18:30:00').toISOString()
  }
];

export const INITIAL_MAINTENANCE_HISTORY: MaintenanceHistory[] = [
  {
    id: 'mh_01',
    vehicleId: 'QA-12-34',
    scheduleId: 'sch_toyota_oil',
    title: 'Thay dầu động cơ',
    performedDate: '2026-04-10',
    performedKm: 41000,
    cost: 1200000,
    performedBy: 'Trạm sửa chữa T78',
    notes: 'Sử dụng dầu Castrol 20W-50 chính hãng',
    createdAt: new Date('2026-04-10T11:00:00').toISOString()
  },
  {
    id: 'mh_02',
    vehicleId: 'QA-90-12',
    scheduleId: 'sch_kobelco_oil',
    title: 'Thay dầu động cơ máy công trình',
    performedDate: '2025-06-01',
    performedHours: 2000,
    cost: 4500000,
    performedBy: 'Công ty Kỹ thuật số 1',
    notes: 'Thay thế dầu thủy lực chất lượng cao',
    createdAt: new Date('2025-06-01T15:30:00').toISOString()
  }
];

export const INITIAL_PART_REPLACEMENT_HISTORY: PartReplacementHistory[] = [
  {
    id: 'pr_01',
    vehicleId: 'QA-12-34',
    partName: 'Bóng đèn pha halogen',
    replacedDate: '2026-05-12',
    replacedKm: 43500,
    warrantyMonths: 12,
    notes: 'Thay thế đèn bên phụ bị cháy',
    createdAt: new Date('2026-05-12T10:00:00').toISOString()
  },
  {
    id: 'pr_02',
    vehicleId: 'QA-56-78',
    partName: 'Lốp xe dã ngoại Kamaz dã chiến',
    replacedDate: '2026-03-20',
    replacedKm: 11000,
    replacedHours: 720,
    warrantyMonths: 24,
    notes: 'Thay thế lốp sau bên trái bị rách bạt',
    createdAt: new Date('2026-03-20T09:00:00').toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'not_01',
    title: 'Cảnh báo quá hạn bảo dưỡng!',
    body: 'Máy xúc Kobelco QA-90-12 đã quá hạn Thay dầu thủy lực 240 giờ máy.',
    type: 'maintenance_overdue',
    targetUser: 'all',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'not_02',
    title: 'Cảnh báo sắp đến hạn bảo dưỡng',
    body: 'Toyota Land Cruiser QA-12-34 còn 380 Km nữa sẽ đến hạn Thay dầu động cơ.',
    type: 'maintenance_due',
    targetUser: 'user_uid_002',
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_EDIT_REQUESTS: EditRequest[] = [
  {
    id: 'req_01',
    vehicleId: 'QA-12-34',
    logId: 'ml_toyota_06',
    logType: 'monthly',
    requestedBy: 'user_uid_002',
    requestedByName: 'Trung úy Lê Hoàng Nam',
    originalData: { kmValue: 45300 },
    newData: { kmValue: 45280 },
    reason: 'Nhập nhầm số công tơ mét cuối tháng (bị lệch 20km do nhìn nhầm công tơ mét phụ)',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act_01',
    userId: 'admin_uid_001',
    userName: 'Thiếu tá Trần Quốc Toản',
    action: 'Thiết lập định mức bảo dưỡng',
    details: 'Thiết lập định mức Thay dầu động cơ cho phương tiện QA-12-34 là 5000 Km',
    timestamp: new Date().toISOString()
  },
  {
    id: 'act_02',
    userId: 'user_uid_002',
    userName: 'Trung úy Lê Hoàng Nam',
    action: 'Nhập dữ liệu tổng hợp',
    details: 'Nhập chỉ số tháng 6 cho phương tiện QA-12-34 (Chỉ số: 45300 Km)',
    timestamp: new Date().toISOString()
  }
];

// LocalStorage Helper to load and save states
export class Database {
  private static get<T>(key: string, defaultValue: T): T {
    const val = localStorage.getItem(`qlxe_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  }

  private static set<T>(key: string, data: T): void {
    localStorage.setItem(`qlxe_${key}`, JSON.stringify(data));

    // If Firestore is available, attempt to mirror the collection there.
    try {
      // Avoid writing back to Firestore when we are already updating from Firestore snapshots
      const skip = typeof window !== 'undefined' && (window as any).__QLXE_SKIP_FIRESTORE_MIRROR;
      if (!skip && isFirebaseAvailable && db) {
        const collectionName = key;
        const payload = data as any;
        if (Array.isArray(payload)) {
          payload.forEach((item: any) => {
            const id = item?.id || item?.uid || item?.key || null;
            if (!id) return;
            // Fire-and-forget; do not block UI
            setDoc(doc(db, collectionName, String(id)), item).catch((err: any) => {
              console.warn(`Failed to sync ${collectionName}/${id} to Firestore:`, err);
            });
          });
        }
      }
    } catch (e) {
      console.warn('Error while attempting Firestore mirror:', e);
    }
  }

  static getVehicles(): Vehicle[] {
    return this.get<Vehicle[]>('vehicles', INITIAL_VEHICLES);
  }

  static saveVehicles(vehicles: Vehicle[]) {
    this.set('vehicles', vehicles);
  }

  static getDailyLogs(): DailyLog[] {
    return this.get<DailyLog[]>('daily_logs', INITIAL_DAILY_LOGS);
  }

  static saveDailyLogs(logs: DailyLog[]) {
    this.set('daily_logs', logs);
  }

  static getMonthlyLogs(): MonthlyLog[] {
    return this.get<MonthlyLog[]>('monthly_logs', INITIAL_MONTHLY_LOGS);
  }

  static saveMonthlyLogs(logs: MonthlyLog[]) {
    this.set('monthly_logs', logs);
  }

  static getSchedules(): MaintenanceSchedule[] {
    return this.get<MaintenanceSchedule[]>('schedules', INITIAL_MAINTENANCE_SCHEDULES);
  }

  static saveSchedules(schedules: MaintenanceSchedule[]) {
    this.set('schedules', schedules);
  }

  static getHistory(): MaintenanceHistory[] {
    return this.get<MaintenanceHistory[]>('history', INITIAL_MAINTENANCE_HISTORY);
  }

  static saveHistory(history: MaintenanceHistory[]) {
    this.set('history', history);
  }

  static getPartReplacements(): PartReplacementHistory[] {
    return this.get<PartReplacementHistory[]>('part_replacements', INITIAL_PART_REPLACEMENT_HISTORY);
  }

  static savePartReplacements(parts: PartReplacementHistory[]) {
    this.set('part_replacements', parts);
  }

  static getNotifications(): SystemNotification[] {
    return this.get<SystemNotification[]>('notifications', INITIAL_NOTIFICATIONS);
  }

  static saveNotifications(notifs: SystemNotification[]) {
    this.set('notifications', notifs);
  }

  static getRequests(): EditRequest[] {
    return this.get<EditRequest[]>('requests', INITIAL_EDIT_REQUESTS);
  }

  static saveRequests(requests: EditRequest[]) {
    this.set('requests', requests);
  }

  static getActivityLogs(): ActivityLog[] {
    return this.get<ActivityLog[]>('activity_logs', INITIAL_ACTIVITY_LOGS);
  }

  static saveActivityLogs(logs: ActivityLog[]) {
    this.set('activity_logs', logs);
  }

  static resetDatabase() {
    this.saveVehicles(INITIAL_VEHICLES);
    this.saveDailyLogs(INITIAL_DAILY_LOGS);
    this.saveMonthlyLogs(INITIAL_MONTHLY_LOGS);
    this.saveSchedules(INITIAL_MAINTENANCE_SCHEDULES);
    this.saveHistory(INITIAL_MAINTENANCE_HISTORY);
    this.savePartReplacements(INITIAL_PART_REPLACEMENT_HISTORY);
    this.saveNotifications(INITIAL_NOTIFICATIONS);
    this.saveRequests(INITIAL_EDIT_REQUESTS);
    this.saveActivityLogs(INITIAL_ACTIVITY_LOGS);
  }

  // Recalculates warnings/status based on vehicle current Km and Hours
  static updateScheduleStatus(vehicleId: string, currentKm: number, currentHours: number) {
    const schedules = this.getSchedules();
    const updated = schedules.map(s => {
      if (s.vehicleId !== vehicleId) return s;

      let status: 'normal' | 'warning' | 'overdue' = 'normal';

      // Check Km intervals
      if (s.intervalKm && s.nextDueKm) {
        const kmRemaining = s.nextDueKm - currentKm;
        if (kmRemaining <= 0) {
          status = 'overdue';
        } else if (kmRemaining <= s.intervalKm * 0.1 || kmRemaining <= 500) {
          status = 'warning';
        }
      }

      // Check Hours intervals
      if (s.intervalHours && s.nextDueHours) {
        const hoursRemaining = s.nextDueHours - currentHours;
        if (hoursRemaining <= 0) {
          status = 'overdue';
        } else if (hoursRemaining <= s.intervalHours * 0.1 || hoursRemaining <= 15) {
          if (status !== 'overdue') {
            status = 'warning';
          }
        }
      }

      // Check month interval
      if (s.intervalMonths && s.nextDueDate) {
        const remainingDays = Math.ceil((new Date(s.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (remainingDays <= 0) {
          status = 'overdue';
        } else if (remainingDays <= 30) {
          if (status !== 'overdue') {
            status = 'warning';
          }
        }
      }

      return {
        ...s,
        status,
        updatedAt: new Date().toISOString()
      };
    });

    this.saveSchedules(updated);
  }
}
