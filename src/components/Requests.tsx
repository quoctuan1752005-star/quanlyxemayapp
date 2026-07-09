/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, X, FileText, User, Calendar, Compass, Clock, ShieldAlert } from 'lucide-react';
import { EditRequest, Vehicle } from '../types';

interface RequestsProps {
  requests: EditRequest[];
  vehicles: Vehicle[];
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
}

export default function Requests({ requests, vehicles, onApproveRequest, onRejectRequest }: RequestsProps) {
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Duyệt yêu cầu hiệu chỉnh</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dành riêng cho Quản trị viên để kiểm duyệt thông tin công tơ mét từ lái xe báo cáo</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider">Danh sách yêu cầu chờ duyệt ({pendingRequests.length})</h3>

        {pendingRequests.map(req => {
          const vehicle = vehicles.find(v => v.id === req.vehicleId);
          return (
            <div 
              key={req.id}
              className="bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-950/40 rounded-3xl p-6 shadow-xs relative overflow-hidden"
            >
              {/* Highlight ribbon */}
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500"></div>

              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  {/* Title & metadata */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-400 border border-amber-500/10 rounded-lg">
                      Yêu cầu {req.logType === 'daily' ? 'sửa sổ ngày' : 'sửa sổ tháng'}
                    </span>
                    <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3" /> {req.requestedByName}
                    </span>
                    <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Vehicle info */}
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white text-sm">
                      Phương tiện: {vehicle?.plateNumber} - {vehicle?.name}
                    </h4>
                    <p className="text-xxs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                      Đơn vị quản lý: {vehicle?.managementUnit}
                    </p>
                  </div>

                  {/* Proposed corrections comparison */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Số liệu ban đầu</p>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-gray-500 line-through">
                        {req.originalData.kmValue !== undefined && (
                          <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5" />{req.originalData.kmValue.toLocaleString()} Km</span>
                        )}
                        {req.originalData.hoursValue !== undefined && (
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{req.originalData.hoursValue.toLocaleString()} Giờ</span>
                        )}
                        {req.originalData.km !== undefined && (
                          <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5" />{req.originalData.km.toLocaleString()} Km</span>
                        )}
                        {req.originalData.hours !== undefined && (
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{req.originalData.hours.toLocaleString()} Giờ</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Số liệu đề xuất sửa đổi</p>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-xs text-emerald-800 dark:text-emerald-400 font-black">
                        {req.newData.kmValue !== undefined && (
                          <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-emerald-700" />{req.newData.kmValue.toLocaleString()} Km</span>
                        )}
                        {req.newData.hoursValue !== undefined && (
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" />{req.newData.hoursValue.toLocaleString()} Giờ</span>
                        )}
                        {req.newData.km !== undefined && (
                          <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-emerald-700" />{req.newData.km.toLocaleString()} Km</span>
                        )}
                        {req.newData.hours !== undefined && (
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-600" />{req.newData.hours.toLocaleString()} Giờ</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-1 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/30 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-400">Lý do điều chỉnh kỹ thuật:</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic font-medium">"{req.reason}"</p>
                  </div>
                </div>

                {/* Approve/Reject Controls */}
                <div className="flex md:flex-col justify-end items-stretch gap-2 shrink-0 w-full md:w-44">
                  <button
                    onClick={() => onApproveRequest(req.id)}
                    className="flex-1 px-4 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xxs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <Check className="w-4 h-4" /> Đồng Ý Duyệt
                  </button>
                  <button
                    onClick={() => onRejectRequest(req.id)}
                    className="flex-1 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xxs uppercase tracking-wider flex items-center justify-center gap-1.5 dark:bg-red-950/20 dark:text-red-400"
                  >
                    <X className="w-4 h-4" /> Từ Chối
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {pendingRequests.length === 0 && (
          <div className="py-16 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Không có yêu cầu phê duyệt nào</p>
            <p className="text-xxs text-gray-400 mt-1">Tất cả sổ hành trình xe - máy đều khớp và được ghi nhận đúng đắn.</p>
          </div>
        )}
      </div>

      {/* Requests History List */}
      {requests.filter(r => r.status !== 'pending').length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider mb-4">Lịch sử phê duyệt trước đây</h3>
          <div className="space-y-3">
            {requests
              .filter(r => r.status !== 'pending')
              .map(req => {
                const vehicle = vehicles.find(v => v.id === req.vehicleId);
                return (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800/50">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black text-gray-700 dark:text-gray-300">{vehicle?.plateNumber}</span>
                        <span className="text-[10px] font-semibold text-gray-400 truncate max-w-[150px]">{vehicle?.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[280px]">
                        Lái xe: {req.requestedByName} | Lý do: {req.reason}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg shrink-0 ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'}`}>
                      {req.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
