/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClipboardList, AlertTriangle, AlertCircle, CheckCircle, Plus, Calendar, Settings, ShieldAlert, Check, DollarSign, PenTool } from 'lucide-react';
import { Vehicle, MaintenanceSchedule, MaintenanceHistory, PartReplacementHistory } from '../types';

interface MaintenanceProps {
  vehicles: Vehicle[];
  schedules: MaintenanceSchedule[];
  history: MaintenanceHistory[];
  replacements: PartReplacementHistory[];
  userRole: string;
  onAddSchedule: (schedule: Omit<MaintenanceSchedule, 'id' | 'status' | 'updatedAt'>) => void;
  onAddHistory: (history: Omit<MaintenanceHistory, 'id' | 'createdAt'>) => void;
  onAddReplacement: (replacement: Omit<PartReplacementHistory, 'id' | 'createdAt'>) => void;
  onPerformMaintenance: (scheduleId: string, performedKm?: number, performedHours?: number, date?: string, cost?: number, notes?: string) => void;
}

export default function Maintenance({
  vehicles,
  schedules,
  history,
  replacements,
  userRole,
  onAddSchedule,
  onAddHistory,
  onAddReplacement,
  onPerformMaintenance
}: MaintenanceProps) {
  const [activeTab, setActiveTab] = useState<'schedules' | 'history' | 'parts'>('schedules');

  // Modal controls
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [selectedScheduleForPerform, setSelectedScheduleForPerform] = useState<MaintenanceSchedule | null>(null);

  // Form states: New Schedule
  const [schVehicleId, setSchVehicleId] = useState(vehicles[0]?.id || '');
  const [schTitle, setSchTitle] = useState('Thay dầu động cơ');
  const [schIntervalKm, setSchIntervalKm] = useState('');
  const [schIntervalHours, setSchIntervalHours] = useState('');
  const [schIntervalMonths, setSchIntervalMonths] = useState('');

  // Form states: Log History
  const [histVehicleId, setHistVehicleId] = useState(vehicles[0]?.id || '');
  const [histTitle, setHistTitle] = useState('Bảo dưỡng định kỳ');
  const [histDate, setHistDate] = useState(new Date().toISOString().split('T')[0]);
  const [histKm, setHistKm] = useState('');
  const [histHours, setHistHours] = useState('');
  const [histCost, setHistCost] = useState('');
  const [histNotes, setHistNotes] = useState('');

  // Form states: Log Part Replacement
  const [partVehicleId, setPartVehicleId] = useState(vehicles[0]?.id || '');
  const [partName, setPartName] = useState('');
  const [partDate, setPartDate] = useState(new Date().toISOString().split('T')[0]);
  const [partKm, setPartKm] = useState('');
  const [partHours, setPartHours] = useState('');
  const [partWarranty, setPartWarranty] = useState('12');
  const [partNotes, setPartNotes] = useState('');

  // Form states: Performing active warning schedule
  const [perfDate, setPerfDate] = useState(new Date().toISOString().split('T')[0]);
  const [perfKm, setPerfKm] = useState('');
  const [perfHours, setPerfHours] = useState('');
  const [perfCost, setPerfCost] = useState('');
  const [perfNotes, setPerfNotes] = useState('');

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schVehicleId || !schTitle) return;

    onAddSchedule({
      vehicleId: schVehicleId,
      title: schTitle,
      intervalKm: schIntervalKm ? Number(schIntervalKm) : undefined,
      intervalHours: schIntervalHours ? Number(schIntervalHours) : undefined,
      intervalMonths: schIntervalMonths ? Number(schIntervalMonths) : undefined
    });

    setShowScheduleModal(false);
    setSchIntervalKm('');
    setSchIntervalHours('');
    setSchIntervalMonths('');
  };

  const handleCreateHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!histVehicleId || !histTitle) return;

    onAddHistory({
      vehicleId: histVehicleId,
      title: histTitle,
      performedDate: histDate,
      performedKm: histKm ? Number(histKm) : undefined,
      performedHours: histHours ? Number(histHours) : undefined,
      cost: Number(histCost) || 0,
      performedBy: userRole === 'admin' ? 'Xưởng sửa chữa quân khí' : 'Lái xe tự bảo dưỡng',
      notes: histNotes
    });

    setShowHistoryModal(false);
    setHistKm('');
    setHistHours('');
    setHistCost('');
    setHistNotes('');
  };

  const handleCreatePartReplacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partVehicleId || !partName) return;

    onAddReplacement({
      vehicleId: partVehicleId,
      partName,
      replacedDate: partDate,
      replacedKm: partKm ? Number(partKm) : undefined,
      replacedHours: partHours ? Number(partHours) : undefined,
      warrantyMonths: Number(partWarranty) || undefined,
      notes: partNotes
    });

    setShowPartModal(false);
    setPartName('');
    setPartKm('');
    setPartHours('');
    setPartNotes('');
  };

  const handlePerformScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleForPerform) return;

    onPerformMaintenance(
      selectedScheduleForPerform.id,
      perfKm ? Number(perfKm) : undefined,
      perfHours ? Number(perfHours) : undefined,
      perfDate,
      Number(perfCost) || 0,
      perfNotes
    );

    setSelectedScheduleForPerform(null);
    setPerfKm('');
    setPerfHours('');
    setPerfCost('');
    setPerfNotes('');
  };

  // Status helper text
  const getStatusText = (sch: MaintenanceSchedule, vehicle?: Vehicle) => {
    if (!vehicle) return '';
    let textLines: string[] = [];

    // Checked Km
    if (sch.intervalKm && sch.nextDueKm && (vehicle.managementMethod === 'km' || vehicle.managementMethod === 'both')) {
      const remainingKm = sch.nextDueKm - vehicle.currentKm;
      if (remainingKm <= 0) {
        textLines.push(`Đã quá hạn ${Math.abs(remainingKm).toLocaleString()} Km`);
      } else {
        textLines.push(`Còn ${remainingKm.toLocaleString()} Km nữa sẽ đến hạn`);
      }
    }

    // Checked Hours
    if (sch.intervalHours && sch.nextDueHours && (vehicle.managementMethod === 'hours' || vehicle.managementMethod === 'both')) {
      const remainingHours = sch.nextDueHours - vehicle.currentHours;
      if (remainingHours <= 0) {
        textLines.push(`Đã quá hạn ${Math.abs(remainingHours).toLocaleString()} giờ máy`);
      } else {
        textLines.push(`Còn ${remainingHours.toLocaleString()} giờ máy nữa sẽ đến hạn`);
      }
    }

    // Checked date
    if (sch.intervalMonths && sch.nextDueDate) {
      const remainingDays = Math.ceil((new Date(sch.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (remainingDays <= 0) {
        textLines.push(`Quá hạn thời gian ${Math.abs(remainingDays)} ngày`);
      } else {
        textLines.push(`Còn khoảng ${remainingDays} ngày nữa đến hạn`);
      }
    }

    return textLines.join(' | ');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Kế hoạch bảo dưỡng kỹ thuật</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quản lý định mức, theo dõi cảnh báo và lịch sử sửa chữa định kỳ</p>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          {userRole === 'admin' && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xxs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" /> Định mức bảo dưỡng
            </button>
          )}
          <button
            onClick={() => setShowPartModal(true)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 font-bold rounded-xl text-xxs uppercase tracking-wider flex items-center gap-1.5 border border-transparent dark:border-gray-700"
          >
            <Plus className="w-3.5 h-3.5" /> Thay phụ tùng
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider border-b-2 transition duration-200 ${activeTab === 'schedules' ? 'border-emerald-800 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Cảnh báo đến hạn ({schedules.filter(s => s.status !== 'normal').length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider border-b-2 transition duration-200 ${activeTab === 'history' ? 'border-emerald-800 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Lịch sử bảo dưỡng ({history.length})
        </button>
        <button
          onClick={() => setActiveTab('parts')}
          className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider border-b-2 transition duration-200 ${activeTab === 'parts' ? 'border-emerald-800 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Thay phụ tùng ({replacements.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map(sch => {
              const vehicle = vehicles.find(v => v.id === sch.vehicleId);
              if (!vehicle) return null;

              return (
                <div 
                  key={sch.id}
                  className={`border rounded-3xl p-5 flex flex-col justify-between bg-white dark:bg-gray-900 transition ${sch.status === 'overdue' ? 'border-red-200 dark:border-red-950/50 shadow-xs' : sch.status === 'warning' ? 'border-amber-200 dark:border-amber-950/50 shadow-xs' : 'border-gray-100 dark:border-gray-800'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 rounded">
                          {vehicle.plateNumber}
                        </span>
                        <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider">{vehicle.name}</span>
                      </div>
                      <h3 className="font-black text-gray-900 dark:text-white text-sm mt-2">{sch.title}</h3>
                      <p className="text-xxs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                        Mốc định mức: {sch.intervalKm ? `${sch.intervalKm.toLocaleString()} Km` : ''} 
                        {sch.intervalHours ? ` / ${sch.intervalHours.toLocaleString()} giờ máy` : ''} 
                        {sch.intervalMonths ? ` / ${sch.intervalMonths} tháng` : ''}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span className={`px-2.5 py-1 text-xxs font-black uppercase rounded-lg ${sch.status === 'overdue' ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400' : sch.status === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'}`}>
                      {sch.status === 'overdue' ? 'Quá hạn' : sch.status === 'warning' ? 'Sắp đến hạn' : 'Bình thường'}
                    </span>
                  </div>

                  {/* Calculations warning */}
                  <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      {sch.status === 'overdue' ? (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      ) : sch.status === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <span className="text-xxs font-bold text-gray-700 dark:text-gray-300">
                        {getStatusText(sch, vehicle)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedScheduleForPerform(sch);
                        setPerfKm(vehicle.currentKm ? String(vehicle.currentKm) : '');
                        setPerfHours(vehicle.currentHours ? String(vehicle.currentHours) : '');
                      }}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xxs rounded-xl uppercase tracking-wider shrink-0"
                    >
                      Xác nhận đã bảo dưỡng
                    </button>
                  </div>
                </div>
              );
            })}

            {schedules.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Không có kế hoạch định mức nào</p>
                <p className="text-xxs text-gray-400 mt-1">Nhấn vào "Định mức bảo dưỡng" phía trên để thiết lập.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Sổ theo dõi bảo dưỡng kỹ thuật</h3>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xxs uppercase tracking-wider"
            >
              Ghi mới
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">Phương tiện</th>
                <th className="py-3 px-2">Hạng mục bảo dưỡng</th>
                <th className="py-3 px-2">Ngày thực hiện</th>
                <th className="py-3 px-2">Chỉ số Km/Giờ</th>
                <th className="py-3 px-2">Chi phí</th>
                <th className="py-3 px-2">Nhà xưởng / Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {history.map(item => {
                const vehicle = vehicles.find(v => v.id === item.vehicleId);
                return (
                  <tr key={item.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                    <td className="py-3 px-2">
                      <div className="font-mono font-black text-gray-900 dark:text-white">{vehicle?.plateNumber}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{vehicle?.name}</div>
                    </td>
                    <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">{item.title}</td>
                    <td className="py-3 px-2 font-mono text-gray-500">{item.performedDate}</td>
                    <td className="py-3 px-2 font-mono">
                      {item.performedKm ? `${item.performedKm.toLocaleString()} Km` : ''}
                      {item.performedHours ? ` / ${item.performedHours.toLocaleString()} Giờ` : ''}
                    </td>
                    <td className="py-3 px-2 font-bold text-emerald-800 dark:text-emerald-400 font-mono">
                      {item.cost ? `${item.cost.toLocaleString()}đ` : 'Miễn phí'}
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-semibold text-gray-600 dark:text-gray-400">{item.notes || 'Không ghi chú'}</div>
                      <div className="text-[9px] text-gray-400 uppercase tracking-widest">{item.performedBy}</div>
                    </td>
                  </tr>
                );
              })}

              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-xxs uppercase font-bold">
                    Không có lịch sử bảo dưỡng nào được ghi nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'parts' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Sổ theo dõi thay thế vật tư phụ tùng</h3>
            <button
              onClick={() => setShowPartModal(true)}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xxs uppercase tracking-wider"
            >
              Ghi nhận thay phụ tùng
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">Phương tiện</th>
                <th className="py-3 px-2">Vật tư / Chi tiết</th>
                <th className="py-3 px-2">Ngày thay</th>
                <th className="py-3 px-2">Số Km/Giờ khi thay</th>
                <th className="py-3 px-2">Bảo hành (Tháng)</th>
                <th className="py-3 px-2">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {replacements.map(item => {
                const vehicle = vehicles.find(v => v.id === item.vehicleId);
                return (
                  <tr key={item.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                    <td className="py-3 px-2">
                      <div className="font-mono font-black text-gray-900 dark:text-white">{vehicle?.plateNumber}</div>
                    </td>
                    <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">{item.partName}</td>
                    <td className="py-3 px-2 font-mono text-gray-500">{item.replacedDate}</td>
                    <td className="py-3 px-2 font-mono text-gray-600 dark:text-gray-400">
                      {item.replacedKm ? `${item.replacedKm.toLocaleString()} Km` : ''}
                      {item.replacedHours ? ` / ${item.replacedHours.toLocaleString()} Giờ` : ''}
                    </td>
                    <td className="py-3 px-2 font-bold font-mono">{item.warrantyMonths ? `${item.warrantyMonths} tháng` : 'Không'}</td>
                    <td className="py-3 px-2 text-gray-500 dark:text-gray-400 italic">{item.notes || '-'}</td>
                  </tr>
                );
              })}

              {replacements.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-xxs uppercase font-bold">
                    Không có lịch sử thay phụ tùng nào được ghi nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Define custom schedule intervals */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs">
              Thiết lập định mức bảo dưỡng
            </h3>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Phương tiện dã chiến</label>
                <select
                  value={schVehicleId}
                  onChange={(e) => setSchVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Hạng mục bảo dưỡng</label>
                <select
                  value={schTitle}
                  onChange={(e) => setSchTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                >
                  <option value="Thay dầu động cơ">Thay dầu động cơ</option>
                  <option value="Thay dầu hộp số">Thay dầu hộp số</option>
                  <option value="Thay dầu cầu">Thay dầu cầu</option>
                  <option value="Thay lọc dầu">Thay lọc dầu</option>
                  <option value="Thay lọc nhiên liệu">Thay lọc nhiên liệu</option>
                  <option value="Thay lọc gió">Thay lọc gió</option>
                  <option value="Thay nước làm mát">Thay nước làm mát</option>
                  <option value="Kiểm tra phanh">Kiểm tra phanh</option>
                  <option value="Kiểm tra lốp">Kiểm tra lốp</option>
                  <option value="Kiểm tra ắc quy">Kiểm tra ắc quy</option>
                  <option value="Bảo dưỡng cấp 1">Bảo dưỡng cấp 1</option>
                  <option value="Bảo dưỡng cấp 2">Bảo dưỡng cấp 2</option>
                  <option value="Bảo dưỡng cấp 3">Bảo dưỡng cấp 3</option>
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Chu kỳ Km (Để trống nếu không quản lý theo Km)</label>
                <input
                  type="number"
                  value={schIntervalKm}
                  onChange={(e) => setSchIntervalKm(e.target.value)}
                  placeholder="Ví dụ: 5000"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Chu kỳ Giờ máy (Để trống nếu không quản lý theo giờ máy)</label>
                <input
                  type="number"
                  value={schIntervalHours}
                  onChange={(e) => setSchIntervalHours(e.target.value)}
                  placeholder="Ví dụ: 250"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Chu kỳ Thời gian (Tháng) (Để trống nếu không cần thời gian)</label>
                <input
                  type="number"
                  value={schIntervalMonths}
                  onChange={(e) => setSchIntervalMonths(e.target.value)}
                  placeholder="Ví dụ: 6"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 text-xxs font-bold uppercase"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xxs uppercase"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Perform current due maintenance */}
      {selectedScheduleForPerform && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Hoàn thành bảo dưỡng kỹ thuật
            </h3>
            <p className="text-xxs font-medium text-gray-500 dark:text-gray-400">
              Điền các thông tin thực tế khi bảo dưỡng cho hạng mục: <b>{selectedScheduleForPerform.title}</b>
            </p>

            <form onSubmit={handlePerformScheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Ngày thực hiện</label>
                  <input
                    type="date"
                    value={perfDate}
                    onChange={(e) => setPerfDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Chi phí (VND)</label>
                  <input
                    type="number"
                    value={perfCost}
                    onChange={(e) => setPerfCost(e.target.value)}
                    placeholder="Miễn phí / Điền số"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedScheduleForPerform.intervalKm && (
                  <div>
                    <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Chỉ số Km khi làm</label>
                    <input
                      type="number"
                      value={perfKm}
                      onChange={(e) => setPerfKm(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                )}
                {selectedScheduleForPerform.intervalHours && (
                  <div>
                    <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Chỉ số Giờ máy khi làm</label>
                    <input
                      type="number"
                      value={perfHours}
                      onChange={(e) => setPerfHours(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Ghi chú chi tiết, vật tư thay thế</label>
                <textarea
                  value={perfNotes}
                  onChange={(e) => setPerfNotes(e.target.value)}
                  placeholder="Ví dụ: Thay dầu máy 15W-40 Mobil, cốc lọc dầu mới..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedScheduleForPerform(null)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 text-xxs font-bold uppercase"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xxs uppercase"
                >
                  Cập nhật hoàn thành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log separate manual maintenance */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs">
              Ghi nhận bảo dưỡng thủ công
            </h3>
            <form onSubmit={handleCreateHistory} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Phương tiện</label>
                <select
                  value={histVehicleId}
                  onChange={(e) => setHistVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Tên công việc</label>
                <input
                  type="text"
                  value={histTitle}
                  onChange={(e) => setHistTitle(e.target.value)}
                  placeholder="Ví dụ: Vệ sinh lọc gió động cơ dã chiến"
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Ngày thực hiện</label>
                  <input
                    type="date"
                    value={histDate}
                    onChange={(e) => setHistDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Chi phí (VND)</label>
                  <input
                    type="number"
                    value={histCost}
                    onChange={(e) => setHistCost(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Số Km hiện tại</label>
                  <input
                    type="number"
                    value={histKm}
                    onChange={(e) => setHistKm(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Số Giờ máy hiện tại</label>
                  <input
                    type="number"
                    value={histHours}
                    onChange={(e) => setHistHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Chi tiết / Nội dung ghi nhận kỹ thuật</label>
                <textarea
                  value={histNotes}
                  onChange={(e) => setHistNotes(e.target.value)}
                  placeholder="Ghi nhận cụ thể..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 text-xxs font-bold uppercase"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xxs uppercase"
                >
                  Lưu nhật ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Log separate part replacement */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs">
              Ghi nhận thay phụ tùng vật tư
            </h3>
            <form onSubmit={handleCreatePartReplacement} className="space-y-4">
              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Phương tiện</label>
                <select
                  value={partVehicleId}
                  onChange={(e) => setPartVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Tên phụ tùng thay thế</label>
                <input
                  type="text"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="Ví dụ: Bình ắc quy Atlas 12V-100Ah, lốp trước..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Ngày thay thế</label>
                  <input
                    type="date"
                    value={partDate}
                    onChange={(e) => setPartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Thời hạn bảo hành (Tháng)</label>
                  <input
                    type="number"
                    value={partWarranty}
                    onChange={(e) => setPartWarranty(e.target.value)}
                    placeholder="Ví dụ: 12"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Số Km khi thay</label>
                  <input
                    type="number"
                    value={partKm}
                    onChange={(e) => setPartKm(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Số Giờ máy khi thay</label>
                  <input
                    type="number"
                    value={partHours}
                    onChange={(e) => setPartHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1">Ghi chú nhà sản xuất, serial phụ tùng</label>
                <textarea
                  value={partNotes}
                  onChange={(e) => setPartNotes(e.target.value)}
                  placeholder="Ghi cụ thể thông số kỹ thuật phụ tùng..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPartModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 text-xxs font-bold uppercase"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xxs uppercase"
                >
                  Lưu thay phụ tùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
