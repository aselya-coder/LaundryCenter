import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';
import { DollarSign, TrendingUp, Receipt, FileDown, Calendar, Wallet, Activity, Loader2, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, mitraRes] = await Promise.all([
          supabase.from('orders').select('*'),
          supabase.from('mitra').select('*')
        ]);

        if (ordersRes.error) throw ordersRes.error;
        if (mitraRes.error) throw mitraRes.error;

        setOrders(ordersRes.data || []);
        setMitraList(mitraRes.data || []);
      } catch (err) {
        console.error('Error fetching reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalTransaksi = useMemo(() => orders.reduce((sum, o) => sum + o.total_price, 0), [orders]);
  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'selesai_closed'), [orders]);

  const mitraReport = useMemo(() => mitraList.map((m) => {
    const mitraOrders = orders.filter(o => o.mitra_id === m.id);
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
  }), [mitraList, orders]);

  const totalKomisi = useMemo(() => orders.reduce((sum, o) => {
    const mitra = mitraList.find(m => m.id === o.mitra_id);
    const komisiPersen = mitra ? mitra.komisi : 20; // Default 20% jika mitra tidak ditemukan
    return sum + (o.total_price * (komisiPersen / 100));
  }, 0), [orders, mitraList]);

  const totalBersih = totalTransaksi - totalKomisi;

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
          <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 gap-2">
            <Calendar className="h-5 w-5" />
            Pilih Periode
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-2xl font-bold gap-2 shadow-lg shadow-blue-100">
            <FileDown className="h-5 w-5" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Receipt className="h-6 w-6" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Transaksi</p>
          <h3 className="text-2xl font-black text-slate-900">Rp {totalTransaksi.toLocaleString('id-ID')}</h3>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
              <Wallet className="h-6 w-6" />
            </div>
            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Payout</p>
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Komisi Mitra</p>
          <h3 className="text-2xl font-black text-slate-900">Rp {totalKomisi.toLocaleString('id-ID')}</h3>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-blue-600 text-white rounded-3xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-4 backdrop-blur-md">
              <DollarSign className="h-6 w-6" />
            </div>
            <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">Pendapatan Bersih</p>
            <h3 className="text-2xl font-black">Rp {totalBersih.toLocaleString('id-ID')}</h3>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <TrendingUp className="h-24 w-24" />
          </div>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Order Selesai</p>
          <h3 className="text-3xl font-black text-slate-900">{completedOrders.length}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Analisis Pendapatan Mitra
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
            Share Pendapatan
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-4 max-h-48 overflow-y-auto pr-2 no-scrollbar">
            {mitraReport.map((m, index) => (
              <div key={m.nama} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span className="text-sm font-bold text-slate-600">{m.nama}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{((m.total/totalTransaksi)*100).toFixed(1)}%</span>
              </div>
            ))}
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