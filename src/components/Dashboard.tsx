/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Truck, AlertTriangle, AlertCircle, Bell, BarChart3, Settings, ClipboardList, PenTool, CheckSquare } from 'lucide-react';
import { Vehicle, SystemNotification, MaintenanceSchedule, EditRequest } from '../types';

interface DashboardProps {
  vehicles: Vehicle[];
  schedules: MaintenanceSchedule[];
  notifications: SystemNotification[];
  requests: EditRequest[];
  userRole: string;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ 
  vehicles, 
  schedules, 
  notifications, 
  requests, 
  userRole, 
  onNavigate 
}: DashboardProps) {
  
  // Counts
  const totalVehicles = vehicles.length;
  const warningCount = schedules.filter(s => s.status === 'warning').length;
  const overdueCount = schedules.filter(s => s.status === 'overdue').length;
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Info */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
          Hệ thống kỹ thuật đơn vị
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Trang chỉ huy kỹ thuật và theo dõi phương tiện dã chiến
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigate('vehicles')}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition duration-200 cursor-pointer flex items-center gap-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-950/20 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition duration-200"></div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl text-emerald-800 dark:text-emerald-400 z-10">
            <Truck className="w-6 h-6" />
          </div>
          <div className="z-10">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tổng phương tiện</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{totalVehicles}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigate('maintenance')}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition duration-200 cursor-pointer flex items-center gap-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-amber-950/20 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition duration-200"></div>
          <div className="p-3 bg-amber-100 dark:bg-amber-950/50 rounded-xl text-amber-800 dark:text-amber-400 z-10">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="z-10">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sắp bảo dưỡng</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{warningCount}</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigate('maintenance')}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition duration-200 cursor-pointer flex items-center gap-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 dark:bg-red-950/20 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition duration-200"></div>
          <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl text-red-800 dark:text-red-400 z-10">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="z-10">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Quá hạn bảo dưỡng</p>
            <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{overdueCount}</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => onNavigate('notifications')}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition duration-200 cursor-pointer flex items-center gap-4 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-950/20 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition duration-200"></div>
          <div className="p-3 bg-blue-100 dark:bg-blue-950/50 rounded-xl text-blue-800 dark:text-blue-400 z-10">
            <Bell className="w-6 h-6" />
          </div>
          <div className="z-10">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Thông báo mới</p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{unreadNotifications}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Bento Cards Menu & Sidebar alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bento Menu */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Chức năng hệ thống
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Box 1 */}
            <div 
              onClick={() => onNavigate('vehicles')}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-emerald-800/30 dark:hover:border-emerald-700/50 hover:shadow-md transition duration-200 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-800 dark:text-emerald-400 mb-4 group-hover:scale-105 transition">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Hồ Sơ Phương Tiện</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Quản lý lý lịch, số khung số máy, năm sản xuất, và phân công phương tiện cho người dùng.
              </p>
            </div>

            {/* Box 2 */}
            <div 
              onClick={() => onNavigate('entry')}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-emerald-800/30 dark:hover:border-emerald-700/50 hover:shadow-md transition duration-200 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-800 dark:text-emerald-400 mb-4 group-hover:scale-105 transition">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Nhập Chỉ Số Hoạt Động</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Nhập Km hoặc giờ máy hoạt động hàng ngày hoặc tổng hợp cuối tháng bắt buộc.
              </p>
            </div>

            {/* Box 3 */}
            <div 
              onClick={() => onNavigate('maintenance')}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-emerald-800/30 dark:hover:border-emerald-700/50 hover:shadow-md transition duration-200 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-800 dark:text-emerald-400 mb-4 group-hover:scale-105 transition">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Bảo Dưỡng & Vật Tư</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Theo dõi định mức thay dầu động cơ, thay thế phụ tùng, và cập nhật trạng thái dã chiến.
              </p>
            </div>

            {/* Box 4 */}
            <div 
              onClick={() => onNavigate('statistics')}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-emerald-800/30 dark:hover:border-emerald-700/50 hover:shadow-md transition duration-200 cursor-pointer group"
            >
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-800 dark:text-emerald-400 mb-4 group-hover:scale-105 transition">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Biểu Đồ Thống Kê</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Thống kê tần suất hoạt động theo tháng, quý, năm, xuất dữ liệu biểu mẫu Excel/PDF.
              </p>
            </div>

            {/* Admin Features Section */}
            {userRole === 'admin' && (
              <>
                <div 
                  onClick={() => onNavigate('requests')}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-emerald-800/30 dark:hover:border-emerald-700/50 hover:shadow-md transition duration-200 cursor-pointer group border-l-4 border-l-amber-500"
                >
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-center justify-center text-amber-700 dark:text-amber-400 mb-4 group-hover:scale-105 transition">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    Duyệt Yêu Cầu Sửa Đổi
                    {pendingRequests > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 text-xxs font-black rounded-full animate-pulse">
                        {pendingRequests} mới
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Xem xét và duyệt các yêu cầu hiệu chỉnh dữ liệu công tơ mét từ lái xe.
                  </p>
                </div>

                <div 
                  onClick={() => onNavigate('settings')}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:border-emerald-800/30 dark:hover:border-emerald-700/50 hover:shadow-md transition duration-200 cursor-pointer group border-l-4 border-l-emerald-800"
                >
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-800 dark:text-emerald-400 mb-4 group-hover:scale-105 transition">
                    <Settings className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Cấu Hình Kỹ Thuật</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Thiết lập định mức bảo dưỡng, phân cấp phương tiện, cấp quyền tài khoản đơn vị.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Alerts / Priority List */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Bản tin cảnh báo kỹ thuật
          </h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            {schedules.filter(s => s.status !== 'normal').length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-10 h-10 text-emerald-700/30 dark:text-emerald-500/30 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Trạng thái an toàn</p>
                <p className="text-xxs text-gray-400 dark:text-gray-500 mt-1">Không có cảnh báo bảo dưỡng nào cần xử lý.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {schedules
                  .filter(s => s.status !== 'normal')
                  .sort((a, b) => (b.status === 'overdue' ? 1 : 0) - (a.status === 'overdue' ? 1 : 0))
                  .map(sch => {
                    const vehicle = vehicles.find(v => v.id === sch.vehicleId);
                    return (
                      <div 
                        key={sch.id} 
                        onClick={() => onNavigate('maintenance')}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 transition cursor-pointer hover:opacity-90 ${sch.status === 'overdue' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-950/50' : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-950/50'}`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${sch.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'}`}>
                          {sch.status === 'overdue' ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                            {vehicle?.plateNumber} - {vehicle?.name}
                          </p>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
                            {sch.title}
                          </p>
                          <p className={`text-xxs font-black uppercase mt-1.5 ${sch.status === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {sch.status === 'overdue' ? 'Quá hạn bảo dưỡng!' : 'Sắp đến hạn!'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
