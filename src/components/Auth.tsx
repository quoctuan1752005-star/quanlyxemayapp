/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Search, Phone, LogIn, Users, Key, ArrowLeft, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthProps {
  users: UserProfile[];
  onLogin: (user: UserProfile) => void;
  onRegister?: (name: string, role: 'admin' | 'user', phoneNumber?: string) => UserProfile;
}

export default function Auth({ users, onLogin }: AuthProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<UserProfile | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Handle personnel list login click
  const handleSelectUser = (user: UserProfile) => {
    if (user.role === 'admin') {
      setSelectedAdmin(user);
      setPassword('');
      setPasswordError('');
    } else {
      localStorage.setItem('qlxe_remembered_user', JSON.stringify(user));
      onLogin(user);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === 'Daidoi4') {
      localStorage.setItem('qlxe_remembered_user', JSON.stringify(selectedAdmin));
      onLogin(selectedAdmin!);
    } else {
      setPasswordError('Mật khẩu không chính xác. Vui lòng liên hệ đơn vị hoặc thử lại!');
    }
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const term = searchQuery.toLowerCase().trim();
    return (
      user.displayName.toLowerCase().includes(term) ||
      (user.phoneNumber && user.phoneNumber.includes(term))
    );
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-800 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-yellow-600 blur-3xl"></div>
      </div>

      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 relative overflow-hidden">
        {/* Army Green Top Accent Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-800 dark:bg-emerald-700"></div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mb-4 border border-emerald-800/10 dark:border-emerald-700/30 shadow-inner">
            <div className="relative">
              <Shield className="w-12 h-12 text-emerald-800 dark:text-emerald-500 fill-emerald-800/10 dark:fill-emerald-500/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-yellow-500 text-xl font-black">★</span>
              </div>
            </div>
          </div>
          <h1 className="text-base font-black tracking-wider text-emerald-900 dark:text-emerald-500 uppercase leading-snug">
            QUẢN LÝ KỸ THUẬT XE - MÁY QUÂN SỰ
          </h1>
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
            Hộp thư nghiệp vụ & Sổ tay kỹ thuật điện tử
          </p>
        </div>

        {selectedAdmin ? (
          /* Password verification screen for commander */
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50 dark:border-gray-800/50">
              <button
                type="button"
                onClick={() => setSelectedAdmin(null)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition mr-1"
                title="Quay lại"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-700 dark:text-gray-300 font-extrabold uppercase tracking-wider">
                Xác minh quyền Chỉ Huy
              </span>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-800 dark:text-amber-400 font-extrabold shrink-0">
                {selectedAdmin.displayName.substring(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Đang yêu cầu truy cập với tên:</p>
                <p className="text-sm font-black text-amber-800 dark:text-amber-400 truncate">
                  {selectedAdmin.displayName}
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xxs font-black text-red-600 dark:text-red-400 uppercase tracking-wider leading-relaxed">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                Nhập mật khẩu Chỉ huy *
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu xác minh..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-150 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 text-xs font-bold text-gray-950 dark:text-white"
                  autoFocus
                  required
                />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-1.5 uppercase tracking-wider">
                * Chỉ huy liên hệ đơn vị để nhận thông tin mật khẩu.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAdmin(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Xác nhận
              </button>
            </div>
          </form>
        ) : (
          /* Selection Card Container */
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50 dark:border-gray-800/50">
              <Users className="w-4.5 h-4.5 text-emerald-800 dark:text-emerald-500" />
              <span className="text-xs text-gray-700 dark:text-gray-300 font-extrabold uppercase tracking-wider">
                Chọn tên đăng nhập đơn vị
              </span>
              <span className="ml-auto text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                Quân số: {users.length}
              </span>
            </div>

            <p className="text-xxs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
              * Hệ thống chỉ cho phép Chỉ Huy đăng ký và cấu hình danh sách quân nhân. Đồng chí vui lòng chọn đúng tên mình để tiếp tục sử dụng.
            </p>

            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nhập họ tên hoặc SĐT quân nhân để tìm kiếm nhanh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-150 dark:border-gray-700/80 rounded-xl text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-750"
              />
            </div>

            {/* User List selection cards */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => handleSelectUser(user)}
                  className="w-full flex items-center justify-between p-3.5 bg-gray-50/50 dark:bg-gray-800/10 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 border border-gray-100 dark:border-gray-800/60 hover:border-emerald-300 dark:hover:border-emerald-800/40 rounded-2xl transition duration-150 group text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-800 dark:text-emerald-400 font-extrabold text-sm border border-emerald-200/50 dark:border-emerald-900/50 group-hover:scale-105 transition duration-150 shrink-0">
                      {user.displayName.substring(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                        {user.phoneNumber ? (
                          <>
                            <Phone className="w-2.5 h-2.5" />
                            <span>{user.phoneNumber}</span>
                          </>
                        ) : (
                          <span>Lái xe quân sự</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded ${user.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'}`}>
                      {user.role === 'admin' ? 'Chỉ Huy' : 'Lái Xe'}
                    </span>
                    <LogIn className="w-4 h-4 text-gray-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition duration-150" />
                  </div>
                </button>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 px-4 bg-gray-50/50 dark:bg-gray-800/10 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-red-500 dark:text-red-400 font-black uppercase tracking-wider">Không tìm thấy quân nhân "{searchQuery}"</p>
                  <p className="mt-2 text-xxs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wide leading-relaxed">
                    Vui lòng liên hệ Chỉ Huy Kỹ Thuật để thêm tên của đồng chí vào danh sách quân số phụ trách xe.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Notes */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/80 text-center">
          <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase">
            SỔ TAY ĐIỆN TỬ • KỶ LUẬT LÀ SỨC MẠNH CỦA QUÂN ĐỘI
          </p>
        </div>
      </div>
    </div>
  );
}
