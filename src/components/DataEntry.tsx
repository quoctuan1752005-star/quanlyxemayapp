/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Compass, Clock, AlertTriangle, CheckCircle, HelpCircle, FileText, Send, User } from 'lucide-react';
import { Vehicle, DailyLog, MonthlyLog } from '../types';

interface DataEntryProps {
  vehicles: Vehicle[];
  dailyLogs: DailyLog[];
  monthlyLogs: MonthlyLog[];
  currentUserUid: string;
  currentUserName: string;
  onAddDailyLog: (log: Omit<DailyLog, 'id' | 'createdAt'>) => void;
  onAddMonthlyLog: (log: Omit<MonthlyLog, 'id' | 'createdAt'>) => void;
}

export default function DataEntry({
  vehicles,
  dailyLogs,
  monthlyLogs,
  currentUserUid,
  currentUserName,
  onAddDailyLog,
  onAddMonthlyLog
}: DataEntryProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('monthly');

  // Selected vehicle for logging
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Daily Log Form State
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyKm, setDailyKm] = useState('');
  const [dailyHours, setDailyHours] = useState('');
  const [dailyNotes, setDailyNotes] = useState('');

  // Monthly Log Form State
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyKm, setMonthlyKm] = useState('');
  const [monthlyHours, setMonthlyHours] = useState('');
  const [monthlyNotes, setMonthlyNotes] = useState('');

  // Feedback notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleDailySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedVehicleId) {
      setErrorMsg('Vui lòng chọn một phương tiện.');
      return;
    }

    const kmVal = dailyKm ? Number(dailyKm) : undefined;
    const hoursVal = dailyHours ? Number(dailyHours) : undefined;

    // Validation
    if (selectedVehicle?.managementMethod === 'km' && !dailyKm) {
      setErrorMsg('Vui lòng nhập chỉ số Km hiện tại.');
      return;
    }
    if (selectedVehicle?.managementMethod === 'hours' && !dailyHours) {
      setErrorMsg('Vui lòng nhập chỉ số giờ máy hiện tại.');
      return;
    }
    if (selectedVehicle?.managementMethod === 'both' && !dailyKm && !dailyHours) {
      setErrorMsg('Vui lòng nhập ít nhất chỉ số Km hoặc giờ máy hiện tại.');
      return;
    }

    // Value decreasing validation
    if (kmVal !== undefined && kmVal < selectedVehicle.currentKm) {
      setErrorMsg(`Chỉ số Km không được nhỏ hơn chỉ số hiện tại (${selectedVehicle.currentKm} Km).`);
      return;
    }
    if (hoursVal !== undefined && hoursVal < selectedVehicle.currentHours) {
      setErrorMsg(`Chỉ số giờ máy không được nhỏ hơn chỉ số hiện tại (${selectedVehicle.currentHours} giờ).`);
      return;
    }

    onAddDailyLog({
      vehicleId: selectedVehicleId,
      date: dailyDate,
      km: kmVal,
      hours: hoursVal,
      notes: dailyNotes,
      recordedBy: currentUserUid,
      recordedByName: currentUserName
    });

    setSuccessMsg('Đã ghi nhận dữ liệu hoạt động hàng ngày thành công.');
    setDailyKm('');
    setDailyHours('');
    setDailyNotes('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleMonthlySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setWarningMsg('');
    setSuccessMsg('');

    if (!selectedVehicleId) {
      setErrorMsg('Vui lòng chọn một phương tiện.');
      return;
    }

    const kmVal = monthlyKm ? Number(monthlyKm) : undefined;
    const hoursVal = monthlyHours ? Number(monthlyHours) : undefined;

    // Method specifications
    const method = selectedVehicle?.managementMethod;

    // Minimum check
    if (method === 'km' && !monthlyKm) {
      setErrorMsg('Bắt buộc nhập chỉ số công tơ mét cuối tháng.');
      return;
    }
    if (method === 'hours' && !monthlyHours) {
      setErrorMsg('Bắt buộc nhập tổng số giờ máy cuối tháng.');
      return;
    }
    if (method === 'both' && !monthlyKm && !monthlyHours) {
      setErrorMsg('Nhập ít nhất chỉ số công tơ mét hoặc giờ máy tổng kết.');
      return;
    }

    // Duplicate Month Check
    const isDuplicate = monthlyLogs.some(
      log => log.vehicleId === selectedVehicleId && log.month === Number(monthlyMonth) && log.year === Number(monthlyYear)
    );
    if (isDuplicate) {
      setErrorMsg(`Phương tiện đã được lập báo cáo tháng ${monthlyMonth}/${monthlyYear} trước đó.`);
      return;
    }

    // Validate if less than previous MONTH
    if (kmVal !== undefined && kmVal < selectedVehicle.currentKm) {
      setErrorMsg(`Chỉ số Km tổng hợp không được nhỏ hơn chỉ số hiện tại của xe (${selectedVehicle.currentKm} Km).`);
      return;
    }
    if (hoursVal !== undefined && hoursVal < selectedVehicle.currentHours) {
      setErrorMsg(`Chỉ số giờ máy không được nhỏ hơn chỉ số hiện tại của máy (${selectedVehicle.currentHours} giờ).`);
      return;
    }

    // Check abnormal increase warning
    let isAbnormal = false;
    if (kmVal !== undefined) {
      const kmDiff = kmVal - selectedVehicle.currentKm;
      if (kmDiff > 6000) { // e.g. more than 6,000 Km in a single month
        isAbnormal = true;
        setWarningMsg(`Cảnh báo: Chỉ số Km tăng bất thường (+${kmDiff.toLocaleString()} Km so với tháng trước).`);
      }
    }
    if (hoursVal !== undefined) {
      const hoursDiff = hoursVal - selectedVehicle.currentHours;
      if (hoursDiff > 350) { // more than 350 hours in a month
        isAbnormal = true;
        setWarningMsg(`Cảnh báo: Chỉ số giờ máy tăng bất thường (+${hoursDiff.toLocaleString()} giờ so với tháng trước).`);
      }
    }

    // Function to submit
    const submitLog = () => {
      onAddMonthlyLog({
        vehicleId: selectedVehicleId,
        month: Number(monthlyMonth),
        year: Number(monthlyYear),
        kmValue: kmVal,
        hoursValue: hoursVal,
        kmDiff: kmVal !== undefined ? kmVal - selectedVehicle.currentKm : undefined,
        hoursDiff: hoursVal !== undefined ? hoursVal - selectedVehicle.currentHours : undefined,
        notes: monthlyNotes,
        recordedBy: currentUserUid,
        recordedByName: currentUserName
      });

      setSuccessMsg(`Báo cáo tổng kết tháng ${monthlyMonth}/${monthlyYear} đã được ghi nhận và đồng bộ.`);
      setMonthlyKm('');
      setMonthlyHours('');
      setMonthlyNotes('');
      if (!isAbnormal) setWarningMsg('');
      setTimeout(() => {
        setSuccessMsg('');
        setWarningMsg('');
      }, 5000);
    };

    if (isAbnormal) {
      // Prompt confirm on abnormal
      if (window.confirm("Số liệu tăng bất thường! Bạn có chắc chắn số liệu nhập vào là chính xác không?")) {
        submitLog();
      }
    } else {
      submitLog();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Ghi nhận chỉ số hoạt động</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cập nhật dữ liệu Km và giờ máy hoạt động phục vụ định mức kỹ thuật</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => { setActiveTab('monthly'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider border-b-2 transition duration-200 ${activeTab === 'monthly' ? 'border-emerald-800 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Nhập tổng hợp cuối tháng (Bắt buộc)
        </button>
        <button
          onClick={() => { setActiveTab('daily'); setErrorMsg(''); setSuccessMsg(''); }}
          className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider border-b-2 transition duration-200 ${activeTab === 'daily' ? 'border-emerald-800 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Nhập theo ngày (Không bắt buộc)
        </button>
      </div>

      {/* Status Notifications */}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3 text-xs text-red-800 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Lỗi nhập liệu số liệu</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {warningMsg && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-400">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-bold">Cảnh báo số liệu tăng vọt</p>
            <p className="mt-0.5">{warningMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-400">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-bold">Thao tác thành công</p>
            <p className="mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Vehicle select & details card */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs">
            <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-3">Chọn phương tiện</h3>
            <select
              value={selectedVehicleId}
              onChange={(e) => {
                setSelectedVehicleId(e.target.value);
                setErrorMsg('');
                setWarningMsg('');
                setSuccessMsg('');
              }}
              className="w-full px-3 py-2.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white font-bold"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plateNumber} - {v.name}</option>
              ))}
            </select>

            {selectedVehicle && (
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800 space-y-3.5">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Chủng loại quản lý</span>
                  <p className="text-xs font-black text-gray-800 dark:text-gray-200 mt-0.5">{selectedVehicle.type}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Chỉ số hiện tại</span>
                  <div className="mt-1.5 space-y-1.5">
                    {(selectedVehicle.managementMethod === 'km' || selectedVehicle.managementMethod === 'both') && (
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                        <Compass className="w-4 h-4 shrink-0" />
                        <span className="font-mono text-sm font-black">{selectedVehicle.currentKm.toLocaleString()} Km</span>
                      </div>
                    )}
                    {(selectedVehicle.managementMethod === 'hours' || selectedVehicle.managementMethod === 'both') && (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span className="font-mono text-sm font-black">{selectedVehicle.currentHours.toLocaleString()} Giờ máy</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Form entry */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs">
            {activeTab === 'monthly' ? (
              // Monthly reporting
              <form onSubmit={handleMonthlySubmit} className="space-y-5">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50 dark:border-gray-800">
                  <FileText className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
                  <h3 className="font-black text-gray-900 dark:text-white uppercase text-xs">Báo cáo tổng kết tháng</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Báo cáo cho tháng</label>
                    <select
                      value={monthlyMonth}
                      onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white"
                    >
                      {months.map(m => (
                        <option key={m} value={m}>Tháng {m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Năm</label>
                    <input
                      type="number"
                      value={monthlyYear}
                      onChange={(e) => setMonthlyYear(Number(e.target.value))}
                      placeholder="Nhập năm"
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white"
                      min="2020"
                      max="2100"
                    />
                  </div>
                </div>

                {selectedVehicle && (
                  <div className="space-y-4 pt-2">
                    {/* Km input */}
                    {(selectedVehicle.managementMethod === 'km' || selectedVehicle.managementMethod === 'both') && (
                      <div>
                        <label className="block text-xxs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                          Chỉ số công tơ mét cuối tháng (Km) *
                        </label>
                        <input
                          type="number"
                          value={monthlyKm}
                          onChange={(e) => setMonthlyKm(e.target.value)}
                          placeholder={`Lớn hơn hoặc bằng ${selectedVehicle.currentKm} Km`}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white font-mono text-sm"
                          required={selectedVehicle.managementMethod === 'km'}
                        />
                      </div>
                    )}

                    {/* Hours input */}
                    {(selectedVehicle.managementMethod === 'hours' || selectedVehicle.managementMethod === 'both') && (
                      <div>
                        <label className="block text-xxs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                          Tổng số giờ máy hiện tại (Giờ) *
                        </label>
                        <input
                          type="number"
                          value={monthlyHours}
                          onChange={(e) => setMonthlyHours(e.target.value)}
                          placeholder={`Lớn hơn hoặc bằng ${selectedVehicle.currentHours} Giờ`}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white font-mono text-sm"
                          required={selectedVehicle.managementMethod === 'hours'}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ghi chú tình trạng phương tiện</label>
                  <textarea
                    value={monthlyNotes}
                    onChange={(e) => setMonthlyNotes(e.target.value)}
                    placeholder="Ghi nhận tình trạng kỹ thuật, hư hỏng đột xuất hoặc kiến nghị (nếu có)..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition duration-150 flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                >
                  <Send className="w-4 h-4" /> Xác nhận & Gửi dữ liệu tổng kết
                </button>
              </form>
            ) : (
              // Daily reporting
              <form onSubmit={handleDailySubmit} className="space-y-5">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50 dark:border-gray-800">
                  <Calendar className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
                  <h3 className="font-black text-gray-900 dark:text-white uppercase text-xs">Ghi nhận hoạt động hàng ngày</h3>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ngày hoạt động</label>
                  <input
                    type="date"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white font-mono"
                    required
                  />
                </div>

                {selectedVehicle && (
                  <div className="space-y-4">
                    {/* Km input */}
                    {(selectedVehicle.managementMethod === 'km' || selectedVehicle.managementMethod === 'both') && (
                      <div>
                        <label className="block text-xxs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                          Chỉ số Km hiện tại
                        </label>
                        <input
                          type="number"
                          value={dailyKm}
                          onChange={(e) => setDailyKm(e.target.value)}
                          placeholder={`Chỉ số Km hiện tại (gần nhất: ${selectedVehicle.currentKm} Km)`}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white font-mono text-xs"
                        />
                      </div>
                    )}

                    {/* Hours input */}
                    {(selectedVehicle.managementMethod === 'hours' || selectedVehicle.managementMethod === 'both') && (
                      <div>
                        <label className="block text-xxs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                          Chỉ số giờ máy hiện tại
                        </label>
                        <input
                          type="number"
                          value={dailyHours}
                          onChange={(e) => setDailyHours(e.target.value)}
                          placeholder={`Tổng số giờ máy hiện tại (gần nhất: ${selectedVehicle.currentHours} giờ)`}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white font-mono text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nội dung nhiệm vụ / Nhật trình</label>
                  <textarea
                    value={dailyNotes}
                    onChange={(e) => setDailyNotes(e.target.value)}
                    placeholder="Nhập nội dung hoạt động dã chiến, cung đường dã ngoại hoặc nhiệm vụ bảo đảm..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition duration-150 flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                >
                  <Send className="w-4 h-4" /> Ghi nhận dữ liệu
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
