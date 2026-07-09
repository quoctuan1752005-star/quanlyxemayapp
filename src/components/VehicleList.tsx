/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X, Eye, Truck, User, Hash, Calendar, Shield, Cpu, Image } from 'lucide-react';
import { Vehicle, UserProfile } from '../types';

interface VehicleListProps {
  vehicles: Vehicle[];
  users: UserProfile[];
  userRole: string;
  currentUserUid: string;
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditVehicle: (id: string, updated: Partial<Vehicle>) => void;
  onDeleteVehicle: (id: string) => void;
}

export default function VehicleList({
  vehicles,
  users,
  userRole,
  currentUserUid,
  onAddVehicle,
  onEditVehicle,
  onDeleteVehicle
}: VehicleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form Fields
  const [plateNumber, setPlateNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Ô tô dã chiến');
  const [manufacturer, setManufacturer] = useState('');
  const [manufacturingYear, setManufacturingYear] = useState(2022);
  const [usageYear, setUsageYear] = useState(2023);
  const [chassisNumber, setChassisNumber] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [managementUnit, setManagementUnit] = useState('Ban Tham mưu');
  const [assignedTo, setAssignedTo] = useState('');
  const [managementMethod, setManagementMethod] = useState<'km' | 'hours' | 'both'>('km');
  const [currentKm, setCurrentKm] = useState(0);
  const [currentHours, setCurrentHours] = useState(0);

  // Filter vehicles based on user assignments
  const visibleVehicles = vehicles.filter(v => {
    if (userRole === 'admin') return true;
    return v.assignedTo === currentUserUid;
  });

  // Filter based on search criteria
  const filteredVehicles = visibleVehicles.filter(v => {
    const matchesSearch = 
      v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.managementUnit.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && v.type === filterType;
  });

  // Unique types for filter selector
  const vehicleTypes = Array.from(new Set(vehicles.map(v => v.type)));

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setPlateNumber('');
    setName('');
    setType('Ô tô dã chiến');
    setManufacturer('');
    setManufacturingYear(2022);
    setUsageYear(2023);
    setChassisNumber('');
    setEngineNumber('');
    setManagementUnit('Ban Tham mưu');
    setAssignedTo('');
    setManagementMethod('km');
    setCurrentKm(0);
    setCurrentHours(0);
    setShowModal(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setPlateNumber(vehicle.plateNumber);
    setName(vehicle.name);
    setType(vehicle.type);
    setManufacturer(vehicle.manufacturer);
    setManufacturingYear(vehicle.manufacturingYear);
    setUsageYear(vehicle.usageYear);
    setChassisNumber(vehicle.chassisNumber);
    setEngineNumber(vehicle.engineNumber);
    setManagementUnit(vehicle.managementUnit);
    setAssignedTo(vehicle.assignedTo);
    setManagementMethod(vehicle.managementMethod);
    setCurrentKm(vehicle.currentKm);
    setCurrentHours(vehicle.currentHours);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber || !name) return;

    const assignedUser = users.find(u => u.uid === assignedTo);
    const assignedToName = assignedUser ? assignedUser.displayName : 'Chưa phân công';

    const vehicleData = {
      plateNumber,
      name,
      type,
      manufacturer,
      manufacturingYear: Number(manufacturingYear),
      usageYear: Number(usageYear),
      chassisNumber,
      engineNumber,
      managementUnit,
      assignedTo,
      assignedToName,
      managementMethod,
      currentKm: Number(currentKm),
      currentHours: Number(currentHours)
    };

    if (editingVehicle) {
      onEditVehicle(editingVehicle.id, vehicleData);
    } else {
      onAddVehicle(vehicleData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Hồ sơ phương tiện</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Danh sách lý lịch phương tiện xe dã chiến và máy công binh</p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition duration-150 flex items-center justify-center gap-1.5 self-start text-xs uppercase"
          >
            <Plus className="w-4 h-4" /> Thêm xe - máy
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm biển số, tên xe, lái xe phụ trách, đơn vị..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 md:w-48 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả chủng loại</option>
            {vehicleTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => (
          <div 
            key={vehicle.id}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-emerald-800/20 dark:hover:border-emerald-700/30 transition duration-200"
          >
            {/* Top Tag: Plate Number & Type */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-sm font-black px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-400 border border-emerald-800/10 dark:border-emerald-700/20 rounded-lg shadow-sm">
                {vehicle.plateNumber}
              </span>
              <span className="text-xxs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                {vehicle.type}
              </span>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                  {vehicle.name}
                </h3>
                <p className="text-xxs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-1">
                  Đơn vị: {vehicle.managementUnit}
                </p>
              </div>

              {/* Grid Specifications */}
              <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-50 dark:border-gray-800/50 text-xxs font-semibold text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">Hãng: {vehicle.manufacturer}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>Sử dụng: {vehicle.usageYear}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{vehicle.assignedToName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate font-mono uppercase">ID: {vehicle.id}</span>
                </div>
              </div>

              {/* Dynamic stats row based on method */}
              <div className="space-y-1 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-3">
                <div className="flex justify-between items-center text-xxs text-gray-400 font-bold uppercase tracking-wider">
                  <span>Chỉ số theo dõi</span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 rounded text-xxs lowercase">
                    {vehicle.managementMethod === 'km' ? 'Km' : vehicle.managementMethod === 'hours' ? 'Giờ máy' : 'Km & Giờ'}
                  </span>
                </div>

                <div className="flex gap-4 mt-1.5 text-gray-900 dark:text-white font-mono">
                  {(vehicle.managementMethod === 'km' || vehicle.managementMethod === 'both') && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TỔNG SỐ KM</p>
                      <p className="text-sm font-black text-emerald-800 dark:text-emerald-400">{vehicle.currentKm.toLocaleString()} Km</p>
                    </div>
                  )}
                  {(vehicle.managementMethod === 'hours' || vehicle.managementMethod === 'both') && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TỔNG GIỜ MÁY</p>
                      <p className="text-sm font-black text-amber-600 dark:text-amber-400">{vehicle.currentHours.toLocaleString()} Giờ</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions panel */}
            {userRole === 'admin' && (
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/30">
                <button
                  onClick={() => handleOpenEditModal(vehicle)}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition"
                  title="Sửa lý lịch"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteVehicle(vehicle.id)}
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition dark:bg-red-950/20 dark:text-red-400"
                  title="Xóa phương tiện"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredVehicles.length === 0 && (
          <div className="col-span-full bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-12 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Không tìm thấy phương tiện nào</p>
            <p className="text-xs text-gray-400 mt-1">Vui lòng điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">
                {editingVehicle ? 'Cập nhật lý lịch phương tiện' : 'Thêm hồ sơ phương tiện dã chiến'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Biển số dã chiến *</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="QA-12-34"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tên phương tiện *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Toyota Land Cruiser"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Chủng loại</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                  >
                    <option value="Ô tô chỉ huy">Ô tô chỉ huy</option>
                    <option value="Ô tô vận tải">Ô tô vận tải</option>
                    <option value="Máy công trình">Máy công trình</option>
                    <option value="Xe đặc chủng">Xe đặc chủng</option>
                    <option value="Xe chuyên dụng">Xe chuyên dụng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Hãng sản xuất</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="Toyota, Kamaz, Kobelco..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Năm sản xuất</label>
                  <input
                    type="number"
                    value={manufacturingYear}
                    onChange={(e) => setManufacturingYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Năm đưa vào sử dụng</label>
                  <input
                    type="number"
                    value={usageYear}
                    onChange={(e) => setUsageYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số khung</label>
                  <input
                    type="text"
                    value={chassisNumber}
                    onChange={(e) => setChassisNumber(e.target.value)}
                    placeholder="Chữ hoặc số"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số máy</label>
                  <input
                    type="text"
                    value={engineNumber}
                    onChange={(e) => setEngineNumber(e.target.value)}
                    placeholder="Chữ hoặc số"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Đơn vị quản lý</label>
                  <input
                    type="text"
                    value={managementUnit}
                    onChange={(e) => setManagementUnit(e.target.value)}
                    placeholder="Ban Tham mưu, Đại đội..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Lái xe phụ trách</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 dark:focus:ring-emerald-500 text-gray-900 dark:text-white"
                  >
                    <option value="">Chưa phân công</option>
                    {users.map(u => (
                      <option key={u.uid} value={u.uid}>{u.displayName} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-800 rounded-2xl p-4 space-y-3">
                <div>
                  <label className="block text-xxs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                    Phương thức quản lý kỹ thuật
                  </label>
                  <select
                    value={managementMethod}
                    onChange={(e) => setManagementMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white"
                  >
                    <option value="km">Quản lý theo Km (Xe ô tô chỉ huy, xe tải nhẹ, v.v.)</option>
                    <option value="hours">Quản lý theo Giờ máy (Máy công binh, máy phát điện, v.v.)</option>
                    <option value="both">Quản lý đồng thời cả Km và Giờ máy</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {(managementMethod === 'km' || managementMethod === 'both') && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Công tơ mét ban đầu (Km)</label>
                      <input
                        type="number"
                        value={currentKm}
                        onChange={(e) => setCurrentKm(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white font-mono"
                      />
                    </div>
                  )}
                  {(managementMethod === 'hours' || managementMethod === 'both') && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Giờ máy ban đầu (Giờ)</label>
                      <input
                        type="number"
                        value={currentHours}
                        onChange={(e) => setCurrentHours(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 text-gray-900 dark:text-white font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold text-xs uppercase"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow text-xs uppercase"
                >
                  {editingVehicle ? 'Lưu thay đổi' : 'Đăng ký hồ sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
