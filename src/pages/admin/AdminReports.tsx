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
import * as XLSX from 'xlsx';
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

  // Logika Keuangan: Hanya menghitung order yang sudah 'selesai_closed' sebagai omzet tetap
  const settledOrders = useMemo(() => filteredByDate.filter(o => o.status === 'selesai_closed' || o.is_paid), [filteredByDate]);
  const pendingOrders = useMemo(() => filteredByDate.filter(o => o.status !== 'selesai_closed' && !o.is_paid), [filteredByDate]);
  
  const totalOmzetSettled = useMemo(() => settledOrders.reduce((sum, o) => sum + o.total_price, 0), [settledOrders]);
  const totalOmzetPending = useMemo(() => pendingOrders.reduce((sum, o) => sum + o.total_price, 0), [pendingOrders]);

  const mitraReport = useMemo(() => mitraList.map((m) => {
    const mitraOrders = settledOrders.filter(o => o.mitra_id === m.id);
    const mTotal = mitraOrders.reduce((sum, o) => sum + o.total_price, 0);
    const mOrders = mitraOrders.length;

    return { 
      nama: m.nama_toko, 
      total: mTotal, 
      komisi: mTotal * (m.komisi / 100), 
      bersih: mTotal * (1 - m.komisi / 100), 
      orders: mOrders,
      initial: m.nama_toko.charAt(0)
    };
  }), [mitraList, settledOrders]);

  const totalKomisi = useMemo(() => settledOrders.reduce((sum, o) => {
    const mitra = mitraList.find(m => m.id === o.mitra_id);
    const komisiPersen = mitra ? mitra.komisi : 20;
    return sum + (o.total_price * (komisiPersen / 100));
  }, 0), [settledOrders, mitraList]);

  const totalBersihRevenue = totalOmzetSettled - totalKomisi;
  const netProfit = totalBersihRevenue - totalExpenses;

  const handleExportExcel = () => {
    try {
      setExporting(true);
      
      // 1. Data Transaksi Detail
      const transactionData = filteredByDate.map(o => ({
        'Tanggal Masuk': format(new Date(o.tanggal_masuk), 'dd/MM/yyyy HH:mm'),
        'Kode Order': o.kode_order,
        'Customer': o.customer_name,
        'Mitra': mitraList.find(m => m.id === o.mitra_id)?.nama_toko || 'Unknown',
        'Layanan': o.jenis,
        'Kuantitas': o.berat,
        'Total Biaya': o.total_price,
        'Status Order': o.status,
        'Status Bayar': o.is_paid ? 'LUNAS' : 'BELUM BAYAR',
        'Metode': o.payment_method || '-'
      }));

      // 2. Data Ringkasan Mitra
      const summaryData = mitraReport.map(m => ({
        'Nama Mitra': m.nama,
        'Total Order': m.orders,
        'Total Omzet': m.total,
        'Komisi Mitra': m.komisi,
        'Pendapatan Bersih': m.bersih
      }));

      // 3. Data Pengeluaran
      const expenseExportData = filteredExpenses.map(e => ({
        'Tanggal': format(new Date(e.tanggal), 'dd/MM/yyyy'),
        'Kategori': e.kategori,
        'Jumlah': e.jumlah,
        'Keterangan': e.keterangan || '-'
      }));

      // Buat Workbook
      const wb = XLSX.utils.book_new();
      
      // Tambahkan Sheet Detail Transaksi
      const wsTransactions = XLSX.utils.json_to_sheet(transactionData);
      XLSX.utils.book_append_sheet(wb, wsTransactions, "Detail Transaksi");

      // Tambahkan Sheet Ringkasan Mitra
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Mitra");

      // Tambahkan Sheet Pengeluaran
      const wsExpenses = XLSX.utils.json_to_sheet(expenseExportData);
      XLSX.utils.book_append_sheet(wb, wsExpenses, "Daftar Pengeluaran");

      // Generate Nama File berdasarkan periode
      const dateStr = dateRange.from && dateRange.to 
        ? `${format(dateRange.from, 'yyyyMMdd')}-${format(dateRange.to, 'yyyyMMdd')}`
        : format(new Date(), 'yyyyMMdd');
      
      // Download File
      XLSX.writeFile(wb, `Laporan_Lengkap_LaundryCenter_${dateStr}.xlsx`);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp className="h-24 w-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Omzet Bruto</p>
            <h3 className="text-2xl font-black text-slate-900">Rp {totalOmzetSettled.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Hanya order lunas/selesai</p>
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
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Pengeluaran</p>
            <h3 className="text-2xl font-black text-slate-900">Rp {totalExpenses.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Termasuk biaya operasional</p>
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
            <h3 className="text-2xl font-black text-slate-900">Rp {netProfit.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Omzet - Komisi - Pengeluaran</p>
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
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Piutang (Pending)</p>
            <h3 className="text-2xl font-black text-slate-900">Rp {totalOmzetPending.toLocaleString('id-ID')}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Order belum lunas</p>
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
    </div>
  );
}