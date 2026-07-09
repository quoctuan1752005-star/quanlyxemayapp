/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, FileSpreadsheet, FileText, Calendar, TrendingUp, DollarSign, Award, Clock } from 'lucide-react';
import { Vehicle, DailyLog, MonthlyLog, MaintenanceHistory } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

interface StatisticsProps {
  vehicles: Vehicle[];
  monthlyLogs: MonthlyLog[];
  history: MaintenanceHistory[];
}

export default function Statistics({ vehicles, monthlyLogs, history }: StatisticsProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [exporting, setExporting] = useState(false);

  // 1. Data for Monthly Utilization (Km & Hours)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const logs = monthlyLogs.filter(log => log.month === month && log.year === selectedYear);
    
    const totalKm = logs.reduce((sum, log) => sum + (log.kmDiff || 0), 0);
    const totalHours = logs.reduce((sum, log) => sum + (log.hoursDiff || 0), 0);

    return {
      name: `Th ${month}`,
      'Quãng đường (Km)': totalKm,
      'Thời gian (Giờ)': totalHours,
    };
  });

  // 2. Data for Vehicle utilization Comparison
  const vehicleComparisonData = vehicles.map(v => {
    const logs = monthlyLogs.filter(log => log.vehicleId === v.id && log.year === selectedYear);
    const totalKm = logs.reduce((sum, log) => sum + (log.kmDiff || 0), 0);
    const totalHours = logs.reduce((sum, log) => sum + (log.hoursDiff || 0), 0);

    return {
      name: v.plateNumber,
      'Sử dụng Km': totalKm,
      'Sử dụng Giờ': totalHours,
      fullName: v.name
    };
  });

  // 3. Data for Maintenance Cost per Vehicle
  const maintenanceCostData = vehicles.map(v => {
    const records = history.filter(h => h.vehicleId === v.id);
    const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
    return {
      name: v.plateNumber,
      'Chi phí (VNĐ)': totalCost,
      fullName: v.name
    };
  }).filter(item => item['Chi phí (VNĐ)'] > 0);

  const COLORS = ['#065f46', '#b45309', '#1e3a8a', '#be123c', '#4d7c0f', '#6d28d9'];

  // Excel export using SheetJS
  const handleExportExcel = () => {
    setExporting(true);
    try {
      // Prepare Sheet 1: Vehicles List
      const vehicleWS = XLSX.utils.json_to_sheet(vehicles.map(v => ({
        'Biển số': v.plateNumber,
        'Tên phương tiện': v.name,
        'Chủng loại': v.type,
        'Hãng sản xuất': v.manufacturer,
        'Năm sử dụng': v.usageYear,
        'Số khung': v.chassisNumber,
        'Số máy': v.engineNumber,
        'Đơn vị quản lý': v.managementUnit,
        'Lái xe phụ trách': v.assignedToName,
        'Phương pháp QL': v.managementMethod,
        'Km hiện tại': v.currentKm,
        'Giờ hiện tại': v.currentHours
      })));

      // Prepare Sheet 2: Monthly logs
      const logsWS = XLSX.utils.json_to_sheet(monthlyLogs.map(log => {
        const v = vehicles.find(x => x.id === log.vehicleId);
        return {
          'Biển số': v?.plateNumber || log.vehicleId,
          'Phương tiện': v?.name || '',
          'Tháng': log.month,
          'Năm': log.year,
          'Chỉ số Km': log.kmValue || 0,
          'Chỉ số Giờ': log.hoursValue || 0,
          'Km tăng': log.kmDiff || 0,
          'Giờ tăng': log.hoursDiff || 0,
          'Người ghi nhận': log.recordedByName,
          'Ghi chú': log.notes,
          'Thời gian cập nhật': new Date(log.createdAt).toLocaleDateString('vi-VN')
        };
      }));

      // Prepare Sheet 3: Maintenance History
      const maintWS = XLSX.utils.json_to_sheet(history.map(h => {
        const v = vehicles.find(x => x.id === h.vehicleId);
        return {
          'Biển số': v?.plateNumber || h.vehicleId,
          'Hạng mục bảo dưỡng': h.title,
          'Ngày thực hiện': h.performedDate,
          'Km khi thực hiện': h.performedKm || 0,
          'Giờ khi thực hiện': h.performedHours || 0,
          'Chi phí (VNĐ)': h.cost,
          'Thực hiện bởi': h.performedBy,
          'Ghi chú': h.notes
        };
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, vehicleWS, "Hồ sơ xe máy");
      XLSX.utils.book_append_sheet(wb, logsWS, "Nhật trình tháng");
      XLSX.utils.book_append_sheet(wb, maintWS, "Sổ bảo dưỡng");

      XLSX.writeFile(wb, `Bao_cao_ky_thuat_xe_may_${selectedYear}.xlsx`);
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi khi xuất file Excel.");
    } finally {
      setExporting(false);
    }
  };

  // PDF report export using jsPDF
  const handleExportPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.text("BÁO CÁO CÔNG TÁC KỸ THUẬT XE - MÁY ĐƠN VỊ", 14, 20);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.text(`Năm thống kê: ${selectedYear} | Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`, 14, 27);
      doc.text("Hệ thống quản lý chỉ số hành trình và định mức bảo dưỡng dã ngoại", 14, 32);

      // Vehicles summary
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("1. Danh sách phương tiện hiện có:", 14, 45);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      
      let y = 52;
      vehicles.forEach((v, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${index + 1}. Biển số: ${v.plateNumber} | Tên: ${v.name} | Đơn vị: ${v.managementUnit} | Km: ${v.currentKm} | Giờ máy: ${v.currentHours}`, 14, y);
        y += 7;
      });

      // Utilization summary
      y += 10;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("2. Thống kê hành trình tổng hợp:", 14, y);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      y += 7;

      monthlyLogs.filter(log => log.year === selectedYear).forEach((log) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const v = vehicles.find(x => x.id === log.vehicleId);
        doc.text(`- Tháng ${log.month}/${log.year}: Xe ${v?.plateNumber} tăng ${log.kmDiff || 0} Km / ${log.hoursDiff || 0} Giờ máy. Ghi chú: ${log.notes || 'Bình thường'}`, 14, y);
        y += 7;
      });

      // Footer
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      y += 15;
      doc.setFont("Helvetica", "bold");
      doc.text("NGƯỜI LẬP BIỂU", 14, y);
      doc.text("CHỈ HUY ĐƠN VỊ", 130, y);
      doc.setFont("Helvetica", "normal");
      doc.text("(Ký, ghi rõ họ tên)", 16, y + 5);
      doc.text("(Ký tên, đóng dấu)", 132, y + 5);

      doc.save(`Bao_cao_ky_thuat_xe_may_${selectedYear}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi khi xuất file PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Thống kê & Xuất báo cáo</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Biểu đồ phân tích tần suất hoạt động, mức tiêu hao và xuất biểu mẫu quân sự</p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold"
          >
            <option value={2024}>Năm 2024</option>
            <option value={2025}>Năm 2025</option>
            <option value={2026}>Năm 2026</option>
            <option value={2027}>Năm 2027</option>
          </select>

          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xxs uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Xuất Excel
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white font-bold rounded-xl text-xxs uppercase tracking-wider flex items-center gap-1.5 border border-transparent dark:border-gray-700 transition"
          >
            <FileText className="w-3.5 h-3.5 text-red-600" /> Xuất Báo Cáo PDF
          </button>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly utilization */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Cường độ hoạt động tổng hợp ({selectedYear})</h3>
          </div>
          <div className="h-[300px] w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis yAxisId="left" stroke="#065f46" orientation="left" />
                <YAxis yAxisId="right" stroke="#b45309" orientation="right" />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="Quãng đường (Km)" fill="#065f46" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="Thời gian (Giờ)" fill="#b45309" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Vehicle Comparison */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">So sánh hành trình giữa các xe ({selectedYear})</h3>
          </div>
          <div className="h-[300px] w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend />
                <Bar dataKey="Sử dụng Km" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sử dụng Giờ" fill="#4d7c0f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Maintenance Cost Shares */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Cơ cấu chi phí bảo dưỡng kỹ thuật</h3>
          </div>
          <div className="h-[280px] w-full text-xs flex flex-col sm:flex-row items-center justify-center gap-4">
            {maintenanceCostData.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-bold uppercase text-xxs">
                Không có dữ liệu chi phí bảo dưỡng.
              </div>
            ) : (
              <>
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={maintenanceCostData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="Chi phí (VNĐ)"
                      >
                        {maintenanceCostData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()}đ`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 space-y-2">
                  <p className="font-bold text-xxs uppercase text-gray-400 mb-2">Chú giải chi phí:</p>
                  {maintenanceCostData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-xxs font-bold">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{item.name} ({item.fullName}):</span>
                      <span className="font-mono text-emerald-800 dark:text-emerald-400 ml-auto">{item['Chi phí (VNĐ)'].toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart 4: Engine Hours usage */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Xu hướng sử dụng theo tháng (Giờ máy)</h3>
          </div>
          <div className="h-[280px] w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend />
                <Line type="monotone" dataKey="Thời gian (Giờ)" stroke="#b45309" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
