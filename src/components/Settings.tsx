/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Users, ClipboardList, Database, LogIn, Key, RefreshCw, Trash2, Clock, Plus } from 'lucide-react';
import { UserProfile, ActivityLog } from '../types';

interface SettingsProps {
  users: UserProfile[];
  activityLogs: ActivityLog[];
  userRole: string;
  onResetDatabase: () => void;
  onAddUser?: (name: string, role: 'admin' | 'user', phoneNumber?: string) => void;
  onDeleteUser?: (uid: string) => void;
}

export default function Settings({ users, activityLogs, userRole, onResetDatabase, onAddUser, onDeleteUser }: SettingsProps) {
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const handleReset = () => {
    if (window.confirm("BẠN CÓ CHẮC CHẮN MUỐN KHÔI PHỤC DỮ LIỆU GỐC?\nToàn bộ chỉ số Km, lịch sử sửa chữa và xe tự thêm sẽ bị xóa sạch.")) {
      onResetDatabase();
      alert("Đã khôi phục dữ liệu kỹ thuật gốc của đơn vị thành công.");
      window.location.reload();
    }
  };

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    if (onAddUser) {
      onAddUser(newUserName.trim(), newUserRole, newUserPhone.trim());
      setNewUserName('');
      setNewUserPhone('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Cấu hình kỹ thuật đơn vị</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quản lý tài khoản lái xe, phân cấp chỉ huy, và nhật ký hoạt động kỹ thuật</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Accounts & DB Action Card */}
        <div className="space-y-4">
          {/* User profiles card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50 dark:border-gray-800/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" />
                <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Danh sách quân số phụ trách</h3>
              </div>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                {users.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {users.map(u => (
                <div key={u.uid} className="flex items-center justify-between gap-2.5 p-2 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-gray-50 dark:hover:bg-gray-800/20 border border-gray-100/50 dark:border-gray-800/30 rounded-xl transition duration-150">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-400 font-bold text-xs shrink-0 border border-emerald-100 dark:border-emerald-900">
                      {u.displayName.substring(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">{u.displayName}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate">
                        {u.phoneNumber ? `SĐT: ${u.phoneNumber}` : 'Lái xe quân sự'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${u.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'}`}>
                      {u.role === 'admin' ? 'Chỉ huy' : 'Lái xe'}
                    </span>
                    {userRole === 'admin' && onDeleteUser && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Xác nhận loại quân nhân ${u.displayName} khỏi danh sách đơn vị?`)) {
                            onDeleteUser(u.uid);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-md transition hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Xóa quân số"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Admin Form to Add User */}
            {userRole === 'admin' && onAddUser && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/80">
                {!showAddForm ? (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 rounded-xl text-xxs font-black tracking-wider uppercase text-emerald-800 dark:text-emerald-400 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm thành viên mới
                  </button>
                ) : (
                  <form onSubmit={handleSubmitUser} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Thêm quân nhân mới</span>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-xxs font-bold text-red-500 hover:underline uppercase tracking-wide"
                      >
                        Hủy
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Họ và tên quân nhân..."
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-150 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          placeholder="Số điện thoại..."
                          value={newUserPhone}
                          onChange={(e) => setNewUserPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-150 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        />
                      </div>
                      <div>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-150 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                        >
                          <option value="user">Lái xe</option>
                          <option value="admin">Chỉ huy</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-black rounded-xl text-xxs uppercase tracking-wider shadow-xs transition"
                    >
                      Lưu & Thêm quân số
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Database & maintenance operations card */}
          {userRole === 'admin' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-red-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Thao tác dữ liệu quân sự</h3>
              </div>
              <p className="text-xxs text-gray-500 dark:text-gray-400 leading-normal">
                Xóa sạch các số liệu hiệu chỉnh, xe máy mới và khôi phục mốc biên chế dã chiến ban đầu.
              </p>
              <button
                onClick={handleReset}
                className="w-full mt-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xxs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-100 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Khôi phục dữ liệu gốc
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Detailed technical audit log */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50 dark:border-gray-800/50">
              <Clock className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Nhật ký tác nghiệp kỹ thuật đơn vị</h3>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3.5 bg-gray-50/50 dark:bg-gray-800/10 rounded-2xl border border-gray-50 dark:border-gray-800/30">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 rounded-lg shrink-0 text-xxs font-bold">
                    OK
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-black text-gray-900 dark:text-white">{log.action}</p>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString('vi-VN')} {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                      {log.details}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-400" /> Người thực hiện: {log.userName}
                    </p>
                  </div>
                </div>
              ))}

              {activityLogs.length === 0 && (
                <div className="text-center py-12 text-gray-400 uppercase text-xxs font-bold">
                  Chưa ghi nhận hoạt động tác nghiệp nào.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
