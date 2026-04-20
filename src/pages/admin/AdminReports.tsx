import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';
import { DollarSign, TrendingUp, Receipt, FileDown, Calendar, Wallet, Activity, Loader2, PieChart as PieChartIcon, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // State untuk filter tanggal
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, mitraRes, expensesRes] = await Promise.all([
          supabase.from('orders').select('*'),
          supabase.from('mitra').select('*'),
          supabase.from('expenses').select('*')
        ]);

        if (ordersRes.error) throw ordersRes.error;
        if (mitraRes.error) throw mitraRes.error;
        if (expensesRes.error) throw expensesRes.error;

        setOrders(ordersRes.data || []);
        setMitraList(mitraRes.data || []);
        setExpenses(expensesRes.data || []);
      } catch (err) {
        console.error('Error fetching reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Self-Healing: Otomatis lunaskan order yang sudah 'selesai_closed' tapi belum 'is_paid'
  useEffect(() => {
    const healClosedOrders = async () => {
      const closedUnpaid = orders.filter(o => o.status === 'selesai_closed' && !o.is_paid);
      
      if (closedUnpaid.length > 0) {
        console.log(`Self-healing: Melunaskan ${closedUnpaid.length} order yang sudah selesai.`);
        const ids = closedUnpaid.map(o => o.id);
        
        try {
          const { error } = await supabase
            .from('orders')
            .update({ 
              is_paid: true, 
              payment_method: 'tunai',
              updated_at: new Date().toISOString() 
            })
            .in('id', ids);

          if (!error) {
            // Update local state agar angka langsung berubah tanpa reload
            setOrders(prev => prev.map(o => 
              ids.includes(o.id) ? { ...o, is_paid: true, payment_method: 'tunai' } : o
            ));
            toast.info(`${closedUnpaid.length} order lama otomatis ditandai LUNAS karena sudah selesai.`);
          }
        } catch (err) {
          console.error('Self-healing failed:', err);
        }
      }
    };

    if (orders.length > 0) {
      healClosedOrders();
    }
  }, [orders]);

  // Filter order berdasarkan rentang tanggal
  const filteredByDate = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return orders;
    
    return orders.filter(o => {
      const orderDate = new Date(o.tanggal_masuk);
      return isWithinInterval(orderDate, {
        start: startOfDay(dateRange.from!),
        end: endOfDay(dateRange.to!)
      });
    });
  }, [orders, dateRange]);

  // Filter pengeluaran berdasarkan rentang tanggal
  const filteredExpenses = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return expenses;

    return expenses.filter(e => {
      const expenseDate = new Date(e.tanggal);
      return isWithinInterval(expenseDate, {
        start: startOfDay(dateRange.from!),
        end: endOfDay(dateRange.to!)
      });
    });
  }, [expenses, dateRange]);

  const totalExpenses = useMemo(() => filteredExpenses.reduce((sum, e) => sum + e.jumlah, 0), [filteredExpenses]);

  // Logika Keuangan
  const totalOmzetBruto = useMemo(() => filteredByDate.reduce((sum, o) => sum + o.total_price, 0), [filteredByDate]);
  const settledOrders = useMemo(() => filteredByDate.filter(o => o.status === 'selesai_closed' || o.is_paid), [filteredByDate]);
  const pendingOrders = useMemo(() => filteredByDate.filter(o => o.status !== 'selesai_closed' && !o.is_paid), [filteredByDate]);
  
  const totalOmzetSettled = useMemo(() => settledOrders.reduce((sum, o) => sum + o.total_price, 0), [settledOrders]);
  const totalOmzetPending = useMemo(() => pendingOrders.reduce((sum, o) => sum + o.total_price, 0), [pendingOrders]);

  const mitraReport = useMemo(() => mitraList.map((m) => {
    const mitraOrders = filteredByDate.filter(o => o.mitra_id === m.id);
    const mTotal = mitraOrders.reduce((sum, o) => sum + o.total_price, 0);
    const mSettled = mitraOrders.filter(o => o.status === 'selesai_closed' || o.is_paid).reduce((sum, o) => sum + o.total_price, 0);
    const mOrders = mitraOrders.length;

    return { 
      nama: m.nama_toko, 
      total: mTotal, 
      settled: mSettled,
      komisi: mSettled * (m.komisi / 100), 
      bersih: mSettled * (1 - m.komisi / 100), 
      orders: mOrders,
      initial: m.nama_toko.charAt(0)
    };
  }), [mitraList, filteredByDate]);

  const totalKomisi = useMemo(() => settledOrders.reduce((sum, o) => {
    const mitra = mitraList.find(m => m.id === o.mitra_id);
    const komisiPersen = mitra ? mitra.komisi : 20;
    return sum + (o.total_price * (komisiPersen / 100));
  }, 0), [settledOrders, mitraList]);

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          is_paid: true, 
          payment_method: 'tunai',
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order berhasil ditandai LUNAS');
      
      // Refresh data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          mitra:mitra(nama_toko)
        `)
        .order('tanggal_masuk', { ascending: false });
      
      if (ordersData) setOrders(ordersData);
    } catch (err) {
      console.error('Error marking as paid:', err);
      toast.error('Gagal memperbarui status pembayaran');
    }
  };

  const totalBersihRevenue = totalOmzetSettled - totalKomisi;
  const netProfit = totalBersihRevenue - totalExpenses;

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      
      const dateStr = dateRange.from && dateRange.to 
        ? `${format(dateRange.from, 'yyyyMMdd')}-${format(dateRange.to, 'yyyyMMdd')}`
        : format(new Date(), 'yyyyMMdd');

      const workbook = new ExcelJS.Workbook();
      
      // Helper untuk styling sheet
      const setupSheet = (sheet: ExcelJS.Worksheet, title: string, columns: any[]) => {
        // Title
        const titleRow = sheet.addRow([title]);
        titleRow.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleRow.alignment = { horizontal: 'center' };
        sheet.mergeCells(1, 1, 1, columns.length);
        titleRow.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2563EB' } // Blue-600
        };

        // Periode
        const periodRow = sheet.addRow([`Periode: ${dateStr}`]);
        periodRow.font = { bold: true };
        sheet.mergeCells(2, 1, 2, columns.length);
        
        sheet.addRow([]); // Empty row

        // Header Table
        const headerRow = sheet.addRow(columns.map(c => c.header));
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF1F5F9' } // Slate-100
          };
          cell.font = { bold: true, color: { argb: 'FF334155' } }; // Slate-700
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Set column widths
        sheet.columns = columns.map(c => ({ 
          key: c.key, 
          width: c.width || 20,
          style: { alignment: { horizontal: 'left' } }
        }));

        return headerRow.number;
      };

      // 1. Sheet Detail Transaksi
      const wsDetail = workbook.addWorksheet('Detail Transaksi');
      const detailCols = [
        { header: 'Tanggal Masuk', key: 'tgl', width: 22 },
        { header: 'Kode Order', key: 'kode', width: 15 },
        { header: 'Customer', key: 'cust', width: 20 },
        { header: 'Mitra', key: 'mitra', width: 20 },
        { header: 'Layanan', key: 'layanan', width: 12 },
        { header: 'Berat/Qty', key: 'qty', width: 10 },
        { header: 'Total Biaya', key: 'total', width: 15 },
        { header: 'Status Order', key: 'status', width: 15 },
        { header: 'Status Bayar', key: 'bayar', width: 15 },
        { header: 'Metode', key: 'metode', width: 15 },
      ];
      setupSheet(wsDetail, 'LAPORAN DETAIL TRANSAKSI LAUNDRYCENTER', detailCols);

      filteredByDate.forEach((o, index) => {
        const row = wsDetail.addRow([
          o.tanggal_masuk ? format(new Date(o.tanggal_masuk), 'dd/MM/yyyy HH:mm') : '-',
          o.kode_order,
          o.customer_name,
          mitraList.find(m => m.id === o.mitra_id)?.nama_toko || 'Unknown',
          o.jenis,
          o.berat,
          o.total_price,
          o.status,
          o.is_paid ? 'LUNAS' : 'BELUM BAYAR',
          o.payment_method || '-'
        ]);

        // Style status colors
        const statusCell = row.getCell(8);
        if (o.status === 'selesai_closed') {
          statusCell.font = { color: { argb: 'FF10B981' }, bold: true }; // Green
        } else {
          statusCell.font = { color: { argb: 'FF3B82F6' }, bold: true }; // Blue
        }

        const bayarCell = row.getCell(9);
        if (o.is_paid) {
          bayarCell.font = { color: { argb: 'FF10B981' }, bold: true };
        } else {
          bayarCell.font = { color: { argb: 'FFEF4444' }, bold: true }; // Red
        }

        // Zebra striping
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            if (!cell.fill) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            }
          });
        }
      });

      // 2. Sheet Ringkasan Mitra
      const wsSummary = workbook.addWorksheet('Ringkasan Mitra');
      const summaryCols = [
        { header: 'Nama Mitra', key: 'nama', width: 25 },
        { header: 'Total Order', key: 'orders', width: 15 },
        { header: 'Total Omzet', key: 'total', width: 15 },
        { header: 'Komisi Mitra', key: 'komisi', width: 15 },
        { header: 'Pendapatan Bersih', key: 'bersih', width: 20 },
      ];
      setupSheet(wsSummary, 'RINGKASAN PERFORMA MITRA', summaryCols);

      mitraReport.forEach((m, index) => {
        const row = wsSummary.addRow([
          m.nama,
          m.orders,
          m.total,
          m.komisi,
          m.bersih
        ]);
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          });
        }
      });

      // 3. Sheet Pengeluaran
      const wsExpenses = workbook.addWorksheet('Daftar Pengeluaran');
      const expenseCols = [
        { header: 'Tanggal', key: 'tgl', width: 15 },
        { header: 'Kategori', key: 'kat', width: 20 },
        { header: 'Jumlah', key: 'jumlah', width: 15 },
        { header: 'Keterangan', key: 'ket', width: 35 },
      ];
      setupSheet(wsExpenses, 'DAFTAR PENGELUARAN OPERASIONAL', expenseCols);

      filteredExpenses.forEach((e, index) => {
        const row = wsExpenses.addRow([
          e.tanggal ? format(new Date(e.tanggal), 'dd/MM/yyyy') : '-',
          e.kategori,
          e.jumlah,
          e.keterangan || '-'
        ]);
        row.getCell(3).font = { color: { argb: 'FFEF4444' }, bold: true };
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          });
        }
      });

      // Write and Save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Laporan_Lengkap_LaundryCenter_${dateStr}.xlsx`);
      toast.success('Laporan Excel berhasil diunduh');
    } catch (err) {
      console.error('Error exporting excel:', err);
      toast.error('Gagal mengunduh laporan');
    } finally {
      setExporting(false);
    }
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#0ea5e9', '#6366f1'];

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold">Memuat laporan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Laporan Keuangan</h1>
          <p className="text-slate-500 font-medium">Analisis pendapatan, komisi mitra, dan performa bisnis</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 gap-2">
                <Calendar className="h-5 w-5" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd MMM", { locale: id })} - {format(dateRange.to, "dd MMM yyyy", { locale: id })}
                    </>
                  ) : (
                    format(dateRange.from, "dd MMM yyyy", { locale: id })
                  )
                ) : (
                  <span>Pilih Periode</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-3xl border-none shadow-2xl" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                numberOfMonths={2}
                locale={id}
              />
            </PopoverContent>
          </Popover>
          <Button 
            onClick={handleExportExcel}
            disabled={exporting}
            className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-2xl font-bold gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileDown className="h-5 w-5" />
            )}
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="h-24 w-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Omzet Bruto</p>
            <h3 className="text-xl font-black text-slate-900">Rp {totalOmzetBruto.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Total order</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <DollarSign className="h-24 w-24 text-green-600" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Omzet Lunas</p>
            <h3 className="text-xl font-black text-slate-900">Rp {totalOmzetSettled.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Order lunas</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Receipt className="h-24 w-24 text-orange-600" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
              <Receipt className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pengeluaran</p>
            <h3 className="text-xl font-black text-slate-900">Rp {totalExpenses.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Biaya operasional</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Wallet className="h-24 w-24 text-green-600" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
              <Wallet className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Profit Bersih</p>
            <h3 className="text-xl font-black text-slate-900">Rp {netProfit.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Lunas - Komisi - Biaya</p>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Activity className="h-24 w-24 text-red-600" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Piutang</p>
            <h3 className="text-xl font-black text-slate-900">Rp {totalOmzetPending.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Belum lunas</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Performa Omzet Mitra
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mitraReport}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="nama" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} tickFormatter={(val) => `Rp${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  formatter={(val: any) => [`Rp ${val.toLocaleString('id-ID')}`, 'Omzet']}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40}>
                  {mitraReport.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            Distribusi Omzet
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mitraReport}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total"
                >
                  {mitraReport.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`Rp ${val.toLocaleString('id-ID')}`, 'Omzet']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-4 max-h-48 overflow-y-auto pr-2 no-scrollbar">
            {mitraReport.length > 0 ? mitraReport.map((m, index) => (
              <div key={m.nama} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span className="text-sm font-bold text-slate-600 truncate max-w-[120px]">{m.nama}</span>
                </div>
                <span className="text-sm font-black text-slate-900">
                  {totalOmzetSettled > 0 ? ((m.total/totalOmzetSettled)*100).toFixed(1) : 0}%
                </span>
              </div>
            )) : (
              <p className="text-center text-slate-400 text-xs py-4">Tidak ada data di periode ini</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-blue-600" />
          Rincian Mitra
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50">
                <th className="text-left py-4 px-2">Mitra</th>
                <th className="text-left py-4 px-2">Total Order</th>
                <th className="text-left py-4 px-2">Total Omzet</th>
                <th className="text-left py-4 px-2">Komisi (Payout)</th>
                <th className="text-left py-4 px-2">Pendapatan Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mitraReport.map((m) => (
                <tr key={m.nama} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500">
                        {m.initial}
                      </div>
                      <span className="text-sm font-bold text-slate-900">{m.nama}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-sm font-bold text-slate-600">{m.orders}</td>
                  <td className="py-4 px-2 text-sm font-black text-slate-900">Rp {m.total.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-2 text-sm font-bold text-orange-600">Rp {m.komisi.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-2 text-sm font-black text-blue-600">Rp {m.bersih.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pendingOrders.length > 0 && (
        <Card className="p-8 border-none shadow-xl shadow-red-100 bg-white rounded-3xl border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-600" />
                Daftar Piutang (Belum Lunas)
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">Order yang menyebabkan angka piutang muncul</p>
            </div>
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black">
              TOTAL: Rp {totalOmzetPending.toLocaleString('id-ID')}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="text-left py-4 px-2">Kode / Customer</th>
                  <th className="text-left py-4 px-2">Mitra</th>
                  <th className="text-left py-4 px-2">Tanggal</th>
                  <th className="text-left py-4 px-2">Total</th>
                  <th className="text-right py-4 px-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingOrders.map((o) => (
                  <tr key={o.id} className="group hover:bg-red-50/30 transition-colors">
                    <td className="py-4 px-2">
                      <p className="text-xs font-black text-blue-600">#{o.kode_order}</p>
                      <p className="text-sm font-bold text-slate-900">{o.customer_name}</p>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-xs font-bold text-slate-600">{mitraList.find(m => m.id === o.mitra_id)?.nama_toko || '-'}</span>
                    </td>
                    <td className="py-4 px-2 text-xs font-bold text-slate-400">
                      {o.tanggal_masuk ? format(new Date(o.tanggal_masuk), 'dd MMM yyyy', { locale: id }) : '-'}
                    </td>
                    <td className="py-4 px-2 text-sm font-black text-slate-900">
                      Rp {o.total_price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <Button 
                        size="sm"
                        onClick={() => handleMarkAsPaid(o.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black h-8 rounded-lg uppercase tracking-widest"
                      >
                        Set Lunas
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}