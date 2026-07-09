/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, BellOff, Check, Trash2, Calendar, ShieldAlert } from 'lucide-react';
import { SystemNotification } from '../types';

interface NotificationsProps {
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export default function Notifications({ notifications, onMarkAsRead, onClearAll }: NotificationsProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Cảnh báo & Thông báo</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Danh sách cảnh báo bảo dưỡng kỹ thuật định mức tự động</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xxs uppercase tracking-wider flex items-center gap-1.5 dark:bg-red-950/20 dark:text-red-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span>Hộp tin ({notifications.length})</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 rounded-full text-xxs lowercase animate-pulse">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-3xl border flex items-start gap-3.5 transition relative overflow-hidden ${notif.isRead ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800' : 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/40 shadow-xs'}`}
            >
              {/* Mark of unread notification */}
              {!notif.isRead && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-800 dark:bg-emerald-500 rounded-bl-lg"></div>
              )}

              <div className={`p-2 rounded-xl shrink-0 ${notif.type.includes('overdue') ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'}`}>
                <Bell className="w-4 h-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-black text-gray-900 dark:text-white ${notif.isRead ? 'opacity-85' : ''}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest shrink-0 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium leading-relaxed">
                  {notif.body}
                </p>

                {/* Mark as read button */}
                {!notif.isRead && (
                  <button
                    onClick={() => onMarkAsRead(notif.id)}
                    className="mt-2.5 px-2.5 py-1 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-bold text-[9px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition"
                  >
                    <Check className="w-3 h-3 text-emerald-700 stroke-[3]" /> Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-16 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900">
              <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Không có cảnh báo hay thông báo nào</p>
              <p className="text-xxs text-gray-400 mt-1">Hệ thống xe - máy hoạt động hoàn hảo và định mức kỹ thuật đang ở trạng thái an toàn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
