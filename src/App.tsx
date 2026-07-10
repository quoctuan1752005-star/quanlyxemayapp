/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Truck, 
  Bell, 
  BarChart3, 
  Settings as SettingsIcon, 
  PenTool, 
  ClipboardList, 
  CheckSquare, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { 
  UserProfile, 
  Vehicle, 
  DailyLog, 
  MonthlyLog, 
  MaintenanceSchedule, 
  MaintenanceHistory, 
  PartReplacementHistory, 
  SystemNotification, 
  EditRequest, 
  ActivityLog 
} from './types';
import { Database, INITIAL_USERS } from './lib/mockData';
import { auth, onAuthStateChanged, db, doc, getDoc, setDoc } from './lib/firebase';
import { startFirestoreListeners } from './lib/firestoreSync';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import VehicleList from './components/VehicleList';
import DataEntry from './components/DataEntry';
import Maintenance from './components/Maintenance';
import Statistics from './components/Statistics';
import Requests from './components/Requests';
import Settings from './components/Settings';
import Notifications from './components/Notifications';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const savedUsers = localStorage.getItem('qlxe_users_list');
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers);
      } catch (e) {
        console.error("Failed to parse saved users list", e);
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('qlxe_remembered_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const savedUsers = localStorage.getItem('qlxe_users_list');
        const userList = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
        const exists = userList.some((u: any) => u.uid === parsed.uid);
        if (exists) return parsed;
      } catch (e) {
        console.error("Failed to parse remembered user", e);
      }
    }
    return null; // Yêu cầu người dùng chọn tên đăng nhập
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  // User list modification functions
  const handleAddUser = (name: string, role: 'admin' | 'user', phoneNumber?: string) => {
    const newUser: UserProfile = {
      uid: 'user_uid_' + Date.now(),
      email: `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '')}@qlxe.vn`,
      phoneNumber: phoneNumber || '',
      displayName: name,
      role: role,
      assignedVehicles: []
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('qlxe_users_list', JSON.stringify(updatedUsers));
    
    logActivity(
      currentUser?.uid || 'system',
      currentUser?.displayName || 'Hệ thống',
      'Thêm quân số mới',
      `Đã thêm thành viên ${name} với vai trò ${role === 'admin' ? 'Chỉ huy kỹ thuật' : 'Lái xe quân sự'}`
    );
    return newUser;
  };

  const handleDeleteUser = (uid: string) => {
    if (currentUser && currentUser.uid === uid) {
      triggerNotification('Không thể xóa', 'Đồng chí không thể tự xóa tài khoản của chính mình.', 'warning');
      return;
    }
    const userToDelete = users.find(u => u.uid === uid);
    if (!userToDelete) return;

    const updatedUsers = users.filter(u => u.uid !== uid);
    setUsers(updatedUsers);
    localStorage.setItem('qlxe_users_list', JSON.stringify(updatedUsers));

    logActivity(
      currentUser?.uid || 'system',
      currentUser?.displayName || 'Hệ thống',
      'Xóa quân số',
      `Đã xóa thành viên ${userToDelete.displayName} khỏi danh sách đơn vị`
    );
    
    triggerNotification('Xóa quân số thành công', `Đã loại đồng chí ${userToDelete.displayName} khỏi danh sách quân số.`, 'info');
  };

  // Core Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [monthlyLogs, setMonthlyLogs] = useState<MonthlyLog[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [history, setHistory] = useState<MaintenanceHistory[]>([]);
  const [replacements, setReplacements] = useState<PartReplacementHistory[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [requests, setRequests] = useState<EditRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // 1. Initial Load & Theme Setup
  useEffect(() => {
    // Check theme
    const savedTheme = localStorage.getItem('qlxe_theme');
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Load data from Local Database
    loadAllData();

    // Start Firestore listeners (if available) to keep clients in sync
    const unsubscribes = startFirestoreListeners({
      setVehicles,
      setDailyLogs,
      setMonthlyLogs,
      setSchedules,
      setHistory,
      setPartReplacements: setReplacements,
      setNotifications,
      setRequests,
      setActivityLogs
    });

    // If Firebase Auth is present, listen for sign-in state and map to local user profiles
    let authUnsub: (() => void) | undefined;
    try {
      if (auth && typeof onAuthStateChanged === 'function') {
        authUnsub = onAuthStateChanged(auth, async (fbUser) => {
          try {
            if (!fbUser) return;
            const uid = fbUser.uid;
            const userDocRef = doc(db, 'users', uid);
            const snap = await getDoc(userDocRef).catch(() => null);
            let profile: any = null;
            if (snap && snap.exists && snap.exists()) {
              const d = (snap as any).data();
              profile = {
                uid,
                email: fbUser.email || d.email || '',
                phoneNumber: d.phoneNumber || '',
                displayName: d.displayName || fbUser.displayName || (fbUser.email || '').split('@')[0],
                role: d.role || 'user',
                assignedVehicles: d.assignedVehicles || []
              };
            } else {
              // Create a minimal user doc in Firestore so security rules referencing users/uid work
              const defaultRole = (fbUser.email === INITIAL_USERS[0].email) ? 'admin' : 'user';
              profile = {
                uid,
                email: fbUser.email || '',
                phoneNumber: '',
                displayName: fbUser.displayName || (fbUser.email || '').split('@')[0],
                role: defaultRole,
                assignedVehicles: []
              };
              await setDoc(userDocRef, profile, { merge: true }).catch((e) => console.warn('Failed to create user doc', e));
            }

            // Persist into local user list if missing
            try {
              const savedUsersRaw = localStorage.getItem('qlxe_users_list');
              const list = savedUsersRaw ? JSON.parse(savedUsersRaw) : INITIAL_USERS.slice();
              const exists = list.some((u: any) => u.uid === profile.uid);
              if (!exists) {
                list.push(profile);
                localStorage.setItem('qlxe_users_list', JSON.stringify(list));
                setUsers(list);
              }
            } catch (e) {
              console.warn('Failed to persist user locally', e);
            }

            // Finally set as current user in the app
            localStorage.setItem('qlxe_remembered_user', JSON.stringify(profile));
            setCurrentUser(profile);
          } catch (e) {
            console.warn('Error handling Firebase auth state change', e);
          }
        });
      }
    } catch (e) {
      // ignore if auth not configured
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      // Cleanup Firestore listeners
      if (unsubscribes && unsubscribes.length) {
        unsubscribes.forEach(u => {
          try { u(); } catch (e) { /* ignore */ }
        });
      }
      // Cleanup auth listener
      try { if (authUnsub) authUnsub(); } catch (e) { /* ignore */ }
    };
  }, []);

  const loadAllData = () => {
    setVehicles(Database.getVehicles());
    setDailyLogs(Database.getDailyLogs());
    setMonthlyLogs(Database.getMonthlyLogs());
    setSchedules(Database.getSchedules());
    setHistory(Database.getHistory());
    setReplacements(Database.getPartReplacements());
    setNotifications(Database.getNotifications());
    setRequests(Database.getRequests());
    setActivityLogs(Database.getActivityLogs());
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    if (newVal) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('qlxe_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('qlxe_theme', 'light');
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // 2. Auth handlers
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    logActivity(
      user.uid,
      user.displayName,
      'Đăng nhập hệ thống',
      `Đồng chí ${user.displayName} đăng nhập thành công vào trang chỉ huy kỹ thuật`
    );
  };

  const handleLogout = () => {
    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Đăng xuất hệ thống',
        `Đồng chí ${currentUser.displayName} đăng xuất`
      );
    }
    localStorage.removeItem('qlxe_remembered_user');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const handleToggleRole = () => {
    if (!currentUser) return;
    const currentRole = currentUser.role;
    const nextUser = users.find(u => u.role !== currentRole) || users[0];
    if (!nextUser) return;
    setCurrentUser(nextUser);
    localStorage.setItem('qlxe_remembered_user', JSON.stringify(nextUser));
    logActivity(
      nextUser.uid,
      nextUser.displayName,
      'Chuyển đổi vai trò',
      `Người dùng chuyển đổi sang vai trò ${nextUser.role === 'admin' ? 'Chỉ Huy Kỹ Thuật' : 'Lái Xe Quân Sự'} (${nextUser.displayName})`
    );
    triggerNotification(
      'Chuyển đổi chế độ xem',
      `Đã chuyển chế độ xem sang ${nextUser.role === 'admin' ? 'Chỉ Huy Kỹ Thuật' : 'Lái Xe Quân Sự'}`,
      'info'
    );
  };

  // 3. System helpers: Log audit action
  const logActivity = (userId: string, userName: string, action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    const updated = [newLog, ...Database.getActivityLogs()];
    Database.saveActivityLogs(updated);
    setActivityLogs(updated);
  };

  // Create notifications automatically
  const triggerNotification = (title: string, body: string, type: string, targetUser: string = 'all') => {
    const newNotif: SystemNotification = {
      id: `not_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title,
      body,
      type,
      targetUser,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newNotif, ...Database.getNotifications()];
    Database.saveNotifications(updated);
    setNotifications(updated);
  };

  // 4. Vehicle Operations
  const handleAddVehicle = (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: vehicleData.plateNumber, // License plate as unique id
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...vehicles, newVehicle];
    Database.saveVehicles(updated);
    setVehicles(updated);

    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Thêm hồ sơ xe',
        `Thêm mới hồ sơ dã ngoại cho xe ${newVehicle.plateNumber} (${newVehicle.name})`
      );
    }
  };

  const handleEditVehicle = (id: string, updatedFields: Partial<Vehicle>) => {
    const updated = vehicles.map(v => {
      if (v.id !== id) return v;
      return {
        ...v,
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
    });
    Database.saveVehicles(updated);
    setVehicles(updated);

    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Sửa lý lịch xe',
        `Cập nhật thông tin lý lịch cho xe ${id}`
      );
    }
  };

  const handleDeleteVehicle = (id: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ xe ${id} ra khỏi biên chế?`)) {
      const updated = vehicles.filter(v => v.id !== id);
      Database.saveVehicles(updated);
      setVehicles(updated);

      if (currentUser) {
        logActivity(
          currentUser.uid,
          currentUser.displayName,
          'Xóa hồ sơ xe',
          `Xóa hồ sơ dã chiến xe ${id} ra khỏi cơ sở dữ liệu`
        );
      }
    }
  };

  // 5. Data Entry Operations
  const handleAddDailyLog = (logData: Omit<DailyLog, 'id' | 'createdAt'>) => {
    const newLog: DailyLog = {
      ...logData,
      id: `dl_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Update state & DB
    const updatedLogs = [newLog, ...dailyLogs];
    Database.saveDailyLogs(updatedLogs);
    setDailyLogs(updatedLogs);

    // Update vehicle's current indicators
    const vehicle = vehicles.find(v => v.id === logData.vehicleId);
    if (vehicle) {
      const updatedVehicleFields: Partial<Vehicle> = {};
      if (logData.km !== undefined && logData.km > vehicle.currentKm) {
        updatedVehicleFields.currentKm = logData.km;
      }
      if (logData.hours !== undefined && logData.hours > vehicle.currentHours) {
        updatedVehicleFields.currentHours = logData.hours;
      }

      handleEditVehicle(logData.vehicleId, updatedVehicleFields);
      // Recalculate schedule statuses
      Database.updateScheduleStatus(
        logData.vehicleId,
        updatedVehicleFields.currentKm || vehicle.currentKm,
        updatedVehicleFields.currentHours || vehicle.currentHours
      );
      setSchedules(Database.getSchedules());
    }

    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Ghi chỉ số theo ngày',
        `Nhập số liệu hành trình ngày cho xe ${logData.vehicleId} (Ghi chú: ${logData.notes})`
      );
    }
  };

  const handleAddMonthlyLog = (logData: Omit<MonthlyLog, 'id' | 'createdAt'>) => {
    const newLog: MonthlyLog = {
      ...logData,
      id: `ml_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Update state & DB
    const updatedLogs = [newLog, ...monthlyLogs];
    Database.saveMonthlyLogs(updatedLogs);
    setMonthlyLogs(updatedLogs);

    // Update vehicle's current indicators
    const vehicle = vehicles.find(v => v.id === logData.vehicleId);
    if (vehicle) {
      const updatedVehicleFields: Partial<Vehicle> = {};
      if (logData.kmValue !== undefined && logData.kmValue > vehicle.currentKm) {
        updatedVehicleFields.currentKm = logData.kmValue;
      }
      if (logData.hoursValue !== undefined && logData.hoursValue > vehicle.currentHours) {
        updatedVehicleFields.currentHours = logData.hoursValue;
      }

      handleEditVehicle(logData.vehicleId, updatedVehicleFields);
      // Recalculate schedule statuses
      Database.updateScheduleStatus(
        logData.vehicleId,
        updatedVehicleFields.currentKm || vehicle.currentKm,
        updatedVehicleFields.currentHours || vehicle.currentHours
      );
      
      // Load re-evaluated schedules
      const currentSchedules = Database.getSchedules();
      setSchedules(currentSchedules);

      // Trigger warning alerts if any schedule gets warning or overdue status
      currentSchedules
        .filter(s => s.vehicleId === logData.vehicleId && s.status !== 'normal')
        .forEach(s => {
          triggerNotification(
            s.status === 'overdue' ? 'Cảnh báo quá hạn bảo dưỡng!' : 'Sắp đến hạn bảo dưỡng',
            `Phương tiện ${vehicle.plateNumber} (${vehicle.name}) đang ở trạng thái ${s.status === 'overdue' ? 'Quá hạn' : 'Sắp đến hạn'} cho hạng mục: ${s.title}`,
            s.status === 'overdue' ? 'maintenance_overdue' : 'maintenance_due',
            vehicle.assignedTo || 'all'
          );
        });
    }

    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Báo cáo tổng hợp tháng',
        `Xác nhận tổng kết kỹ thuật Tháng ${logData.month}/${logData.year} cho xe ${logData.vehicleId} (Độ chênh: +${logData.kmDiff || 0} Km / +${logData.hoursDiff || 0} Giờ máy)`
      );
    }
  };

  // 6. Maintenance Operations
  const handleAddSchedule = (scheduleData: Omit<MaintenanceSchedule, 'id' | 'status' | 'updatedAt'>) => {
    const newSch: MaintenanceSchedule = {
      ...scheduleData,
      id: `sch_${Date.now()}`,
      status: 'normal',
      updatedAt: new Date().toISOString()
    };
    
    // Add next due estimates initially
    const vehicle = vehicles.find(v => v.id === scheduleData.vehicleId);
    if (vehicle) {
      if (scheduleData.intervalKm) {
        newSch.nextDueKm = (vehicle.currentKm || 0) + scheduleData.intervalKm;
      }
      if (scheduleData.intervalHours) {
        newSch.nextDueHours = (vehicle.currentHours || 0) + scheduleData.intervalHours;
      }
      if (scheduleData.intervalMonths) {
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + scheduleData.intervalMonths);
        newSch.nextDueDate = nextDate.toISOString().split('T')[0];
      }
    }

    const updatedSchedules = [...schedules, newSch];
    Database.saveSchedules(updatedSchedules);
    setSchedules(updatedSchedules);

    // Run status recalculation immediately
    if (vehicle) {
      Database.updateScheduleStatus(vehicle.id, vehicle.currentKm, vehicle.currentHours);
      setSchedules(Database.getSchedules());
    }

    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Thiết lập định mức kỹ thuật',
        `Cài đặt chu kỳ bảo dưỡng hạng mục "${scheduleData.title}" cho xe ${scheduleData.vehicleId}`
      );
    }
  };

  const handleAddHistory = (historyData: Omit<MaintenanceHistory, 'id' | 'createdAt'>) => {
    const newHistory: MaintenanceHistory = {
      ...historyData,
      id: `mh_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updatedHistory = [newHistory, ...history];
    Database.saveHistory(updatedHistory);
    setHistory(updatedHistory);

    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Ghi chép bảo dưỡng thủ công',
        `Lưu hồ sơ đã bảo dưỡng hạng mục "${historyData.title}" cho xe ${historyData.vehicleId}`
      );
    }
  };

  const handleAddReplacement = (replacementData: Omit<PartReplacementHistory, 'id' | 'createdAt'>) => {
    const newRep: PartReplacementHistory = {
      ...replacementData,
      id: `rep_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newRep, ...replacements];
    Database.savePartReplacements(updated);
    setReplacements(updated);

    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Thay thế phụ tùng',
        `Đăng ký thay thế phụ tùng "${replacementData.partName}" cho phương tiện ${replacementData.vehicleId}`
      );
    }
  };

  const handlePerformMaintenance = (
    scheduleId: string, 
    performedKm?: number, 
    performedHours?: number, 
    date?: string, 
    cost?: number, 
    notes?: string
  ) => {
    const perfDate = date || new Date().toISOString().split('T')[0];
    const perfCost = cost || 0;

    // 1. Locate the schedule
    const sch = schedules.find(s => s.id === scheduleId);
    if (!sch) return;

    const vehicle = vehicles.find(v => v.id === sch.vehicleId);
    if (!vehicle) return;

    // 2. Add history record
    const newHistory: MaintenanceHistory = {
      id: `mh_${Date.now()}`,
      vehicleId: sch.vehicleId,
      scheduleId,
      title: sch.title,
      performedDate: perfDate,
      performedKm,
      performedHours,
      cost: perfCost,
      performedBy: currentUser?.displayName || 'Nhà xưởng đơn vị',
      notes: notes || 'Hoàn thành định kỳ đạt quy chuẩn',
      createdAt: new Date().toISOString()
    };
    const updatedHistory = [newHistory, ...history];
    Database.saveHistory(updatedHistory);
    setHistory(updatedHistory);

    // 3. Estimate new next due values based on current performance
    const updatedSchedules = schedules.map(s => {
      if (s.id !== scheduleId) return s;

      const nextDue: Partial<MaintenanceSchedule> = {
        lastPerformedKm: performedKm || vehicle.currentKm,
        lastPerformedHours: performedHours || vehicle.currentHours,
        lastPerformedDate: perfDate,
        status: 'normal',
        updatedAt: new Date().toISOString()
      };

      if (s.intervalKm) {
        nextDue.nextDueKm = (performedKm || vehicle.currentKm) + s.intervalKm;
      }
      if (s.intervalHours) {
        nextDue.nextDueHours = (performedHours || vehicle.currentHours) + s.intervalHours;
      }
      if (s.intervalMonths) {
        const nextDate = new Date(perfDate);
        nextDate.setMonth(nextDate.getMonth() + s.intervalMonths);
        nextDue.nextDueDate = nextDate.toISOString().split('T')[0];
      }

      return {
        ...s,
        ...nextDue
      };
    });

    Database.saveSchedules(updatedSchedules);
    setSchedules(updatedSchedules);

    // Refresh evaluations
    Database.updateScheduleStatus(vehicle.id, vehicle.currentKm, vehicle.currentHours);
    setSchedules(Database.getSchedules());

    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Hoàn tất bảo dưỡng',
        `Xác nhận thực hiện bảo dưỡng thành công hạng mục "${sch.title}" cho xe ${sch.vehicleId}`
      );
    }
  };

  // 7. Edit Requests Approve/Reject Handlers (Admins only)
  const handleApproveRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    // 1. Update request status to 'approved'
    const updatedRequests = requests.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: 'approved' as const,
        resolvedAt: new Date().toISOString(),
        resolvedBy: currentUser?.uid
      };
    });
    Database.saveRequests(updatedRequests);
    setRequests(updatedRequests);

    // 2. Adjust target log indicators
    if (req.logType === 'monthly') {
      const adjustedLogs = monthlyLogs.map(log => {
        if (log.id !== req.logId) return log;
        return {
          ...log,
          ...req.newData,
          kmDiff: req.newData.kmValue !== undefined && log.kmDiff !== undefined 
            ? req.newData.kmValue - (req.originalData.kmValue - log.kmDiff)
            : log.kmDiff,
          hoursDiff: req.newData.hoursValue !== undefined && log.hoursDiff !== undefined 
            ? req.newData.hoursValue - (req.originalData.hoursValue - log.hoursDiff)
            : log.hoursDiff
        };
      });
      Database.saveMonthlyLogs(adjustedLogs);
      setMonthlyLogs(adjustedLogs);

      // Also adjust vehicle values if this was the latest month
      const vehicle = vehicles.find(v => v.id === req.vehicleId);
      if (vehicle) {
        const updatedFields: Partial<Vehicle> = {};
        if (req.newData.kmValue !== undefined) {
          updatedFields.currentKm = req.newData.kmValue;
        }
        if (req.newData.hoursValue !== undefined) {
          updatedFields.currentHours = req.newData.hoursValue;
        }
        handleEditVehicle(req.vehicleId, updatedFields);
      }
    }

    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Duyệt yêu cầu sửa',
        `Phê duyệt yêu cầu chỉnh sửa chỉ số kỹ thuật từ đồng chí ${req.requestedByName} cho xe ${req.vehicleId}`
      );
    }
  };

  const handleRejectRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const updatedRequests = requests.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: 'rejected' as const,
        resolvedAt: new Date().toISOString(),
        resolvedBy: currentUser?.uid
      };
    });
    Database.saveRequests(updatedRequests);
    setRequests(updatedRequests);

    if (currentUser) {
      logActivity(
        currentUser.uid,
        currentUser.displayName,
        'Từ chối sửa chỉ số',
        `Không phê duyệt yêu cầu điều chỉnh từ đồng chí ${req.requestedByName} cho xe ${req.vehicleId}`
      );
    }
  };

  // 8. Notification Read Handlers
  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => {
      if (n.id !== id) return n;
      return { ...n, isRead: true };
    });
    Database.saveNotifications(updated);
    setNotifications(updated);
  };

  const handleClearAllNotifications = () => {
    if (window.confirm("Bạn có muốn xóa toàn bộ cảnh báo cũ không?")) {
      Database.saveNotifications([]);
      setNotifications([]);
    }
  };

  // Reset complete database
  const handleResetDatabase = () => {
    Database.resetDatabase();
    loadAllData();
  };

  // Render components conditionally based on activeTab
  const renderTabContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            vehicles={vehicles}
            schedules={schedules}
            notifications={notifications}
            requests={requests}
            userRole={currentUser.role}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setIsSidebarOpen(false);
            }}
          />
        );
      case 'vehicles':
        return (
          <VehicleList 
            vehicles={vehicles}
            users={users}
            userRole={currentUser.role}
            currentUserUid={currentUser.uid}
            onAddVehicle={handleAddVehicle}
            onEditVehicle={handleEditVehicle}
            onDeleteVehicle={handleDeleteVehicle}
          />
        );
      case 'entry':
        return (
          <DataEntry 
            vehicles={currentUser.role === 'admin' ? vehicles : vehicles.filter(v => v.assignedTo === currentUser.uid)}
            dailyLogs={dailyLogs}
            monthlyLogs={monthlyLogs}
            currentUserUid={currentUser.uid}
            currentUserName={currentUser.displayName}
            onAddDailyLog={handleAddDailyLog}
            onAddMonthlyLog={handleAddMonthlyLog}
          />
        );
      case 'maintenance':
        return (
          <Maintenance 
            vehicles={currentUser.role === 'admin' ? vehicles : vehicles.filter(v => v.assignedTo === currentUser.uid)}
            schedules={currentUser.role === 'admin' ? schedules : schedules.filter(s => {
              const v = vehicles.find(x => x.id === s.vehicleId);
              return v?.assignedTo === currentUser.uid;
            })}
            history={currentUser.role === 'admin' ? history : history.filter(h => {
              const v = vehicles.find(x => x.id === h.vehicleId);
              return v?.assignedTo === currentUser.uid;
            })}
            replacements={currentUser.role === 'admin' ? replacements : replacements.filter(r => {
              const v = vehicles.find(x => x.id === r.vehicleId);
              return v?.assignedTo === currentUser.uid;
            })}
            userRole={currentUser.role}
            onAddSchedule={handleAddSchedule}
            onAddHistory={handleAddHistory}
            onAddReplacement={handleAddReplacement}
            onPerformMaintenance={handlePerformMaintenance}
          />
        );
      case 'statistics':
        return (
          <Statistics 
            vehicles={currentUser.role === 'admin' ? vehicles : vehicles.filter(v => v.assignedTo === currentUser.uid)}
            monthlyLogs={currentUser.role === 'admin' ? monthlyLogs : monthlyLogs.filter(log => {
              const v = vehicles.find(x => x.id === log.vehicleId);
              return v?.assignedTo === currentUser.uid;
            })}
            history={currentUser.role === 'admin' ? history : history.filter(h => {
              const v = vehicles.find(x => x.id === h.vehicleId);
              return v?.assignedTo === currentUser.uid;
            })}
          />
        );
      case 'requests':
        if (currentUser.role !== 'admin') {
          setActiveTab('dashboard');
          return null;
        }
        return (
          <Requests 
            requests={requests}
            vehicles={vehicles}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
          />
        );
      case 'settings':
        return (
          <Settings 
            users={users}
            activityLogs={currentUser.role === 'admin' ? activityLogs : activityLogs.filter(l => l.userId === currentUser.uid)}
            userRole={currentUser.role}
            onResetDatabase={handleResetDatabase}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'notifications':
        return (
          <Notifications 
            notifications={currentUser.role === 'admin' ? notifications : notifications.filter(n => n.targetUser === currentUser.uid || n.targetUser === 'all')}
            onMarkAsRead={handleMarkAsRead}
            onClearAll={handleClearAllNotifications}
          />
        );
      default:
        return <div className="text-center py-12 text-sm text-gray-500">Mục này đang phát triển dã ngoại.</div>;
    }
  };

  // If user is not authenticated, show login page
  if (!currentUser) {
    return (
      <>
        <Auth onLogin={handleLogin} users={users} onRegister={handleAddUser} />
        {isInstallable && (
          <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2">
            <div className="flex items-center justify-between rounded-2xl border border-emerald-800 bg-emerald-950/95 px-4 py-3 text-white shadow-2xl">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">Cài đặt ứng dụng</p>
                <p className="text-sm font-semibold">Mở nhanh như app trên điện thoại</p>
              </div>
              <button onClick={handleInstallApp} className="rounded-xl bg-yellow-500 px-3 py-2 text-sm font-black text-emerald-950">
                Cài đặt
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  const unreadNotificationsCount = notifications.filter(n => !n.isRead && (n.targetUser === currentUser.uid || n.targetUser === 'all')).length;
  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row text-gray-800 dark:text-gray-100 font-sans">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden shrink-0 bg-emerald-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-emerald-950 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center font-bold text-emerald-950 shadow-inner">
            ★
          </div>
          <span className="font-black tracking-tight text-xs uppercase text-emerald-100">QUẢN LÝ XE - MÁY</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={toggleDarkMode}
            className="p-1.5 hover:bg-emerald-800/60 rounded-lg text-emerald-100"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-emerald-800/60 rounded-lg text-emerald-100"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {isInstallable && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 md:bottom-6">
          <div className="flex items-center justify-between rounded-2xl border border-emerald-800 bg-emerald-950/95 px-4 py-3 text-white shadow-2xl">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">Cài đặt ứng dụng</p>
              <p className="text-sm font-semibold">Mở nhanh như app trên điện thoại</p>
            </div>
            <button onClick={handleInstallApp} className="rounded-xl bg-yellow-500 px-3 py-2 text-sm font-black text-emerald-950">
              Cài đặt
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-emerald-950 text-white flex flex-col justify-between border-r border-emerald-950/80 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand header */}
        <div className="p-6 shrink-0 border-b border-emerald-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-xl font-bold text-emerald-950 shadow-md animate-pulse">
              ★
            </div>
            <div>
              <h1 className="font-black text-xs uppercase tracking-tight text-yellow-500">QUẢN LÝ XE - MÁY</h1>
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Đại đội 4 D1CB</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-emerald-900 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User profile widget inside sidebar */}
        <div className="px-6 py-4 border-b border-emerald-900/40 bg-emerald-900/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center border border-emerald-700/50 shadow-inner shrink-0 text-yellow-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black truncate">{currentUser.displayName}</p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">
                {currentUser.role === 'admin' ? 'Chỉ Huy Kỹ Thuật' : 'Lái Xe Quân Sự'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {/* Dashboard link */}
          <button
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase flex items-center gap-3 transition ${activeTab === 'dashboard' ? 'bg-emerald-800 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/40 hover:text-white'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Bản chỉ huy chung
          </button>

          {/* Vehicles list link */}
          <button
            onClick={() => { setActiveTab('vehicles'); setIsSidebarOpen(false); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase flex items-center justify-between transition ${activeTab === 'vehicles' ? 'bg-emerald-800 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/40 hover:text-white'}`}
          >
            <span className="flex items-center gap-3">
              <Truck className="w-4 h-4" />
              Lý lịch xe - máy
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-900 border border-emerald-800 text-xxs font-mono rounded">
              {vehicles.length}
            </span>
          </button>

          {/* Data entry link */}
          <button
            onClick={() => { setActiveTab('entry'); setIsSidebarOpen(false); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase flex items-center gap-3 transition ${activeTab === 'entry' ? 'bg-emerald-800 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/40 hover:text-white'}`}
          >
            <PenTool className="w-4 h-4" />
            Nhập chỉ số QL
          </button>

          {/* Maintenance schedules link */}
          <button
            onClick={() => { setActiveTab('maintenance'); setIsSidebarOpen(false); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase flex items-center justify-between transition ${activeTab === 'maintenance' ? 'bg-emerald-800 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/40 hover:text-white'}`}
          >
            <span className="flex items-center gap-3">
              <ClipboardList className="w-4 h-4" />
              Bảo dưỡng & Vật tư
            </span>
            {schedules.filter(s => s.status !== 'normal').length > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-600 text-white text-[9px] font-black rounded-full animate-bounce">
                {schedules.filter(s => s.status !== 'normal').length}
              </span>
            )}
          </button>

          {/* Statistics link */}
          <button
            onClick={() => { setActiveTab('statistics'); setIsSidebarOpen(false); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase flex items-center gap-3 transition ${activeTab === 'statistics' ? 'bg-emerald-800 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/40 hover:text-white'}`}
          >
            <BarChart3 className="w-4 h-4" />
            Thống kê / Báo cáo
          </button>

          {/* Requests correction link (Admins only) */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => { setActiveTab('requests'); setIsSidebarOpen(false); }}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase flex items-center justify-between transition ${activeTab === 'requests' ? 'bg-emerald-800 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/40 hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4" />
                Duyệt yêu cầu
              </span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications link */}
          <button
            onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase flex items-center justify-between transition ${activeTab === 'notifications' ? 'bg-emerald-800 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/40 hover:text-white'}`}
          >
            <span className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              Hộp thư cảnh báo
            </span>
            {unreadNotificationsCount > 0 && (
              <span className="px-1.5 py-0.5 bg-yellow-500 text-emerald-950 text-[9px] font-black rounded-full animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Settings link */}
          <button
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase flex items-center gap-3 transition ${activeTab === 'settings' ? 'bg-emerald-800 text-white shadow-md' : 'text-emerald-200 hover:bg-emerald-900/40 hover:text-white'}`}
          >
            <SettingsIcon className="w-4 h-4" />
            Cấu hình đơn vị
          </button>
        </nav>

        {/* Sidebar footer / Logout */}
        <div className="p-4 border-t border-emerald-900/60 space-y-3 bg-emerald-950/80 shrink-0">
          {/* Quick theme toggler for desktop */}
          <div className="hidden md:flex items-center justify-between px-2 text-xs text-emerald-300">
            <span className="font-bold uppercase text-[9px] tracking-wider">Chế độ tối</span>
            <button 
              onClick={toggleDarkMode}
              className="p-1.5 hover:bg-emerald-900 rounded-lg text-white"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-emerald-900 hover:bg-red-950 text-emerald-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* MAIN BODY AREA */}
      <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          {renderTabContent()}
        </div>

        {/* Sticky decorative footer */}
        <footer className="mt-16 py-6 border-t border-gray-150 dark:border-gray-900 text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Sổ tay Kỹ thuật Điện tử • Kỷ luật là sức mạnh của Quân đội
        </footer>
      </main>
    </div>
  );
}
