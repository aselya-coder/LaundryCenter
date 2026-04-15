import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockOrders, mockMitra } from '@/lib/mock-data';
import { DollarSign, TrendingUp, Users, Receipt, FileDown, Calendar, ArrowUpRight, Wallet, PieChart as PieChartIcon, Activity, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';

const totalTransaksi = mockOrders.reduce((sum, o) => sum + o.harga, 0);
const completedOrders = mockOrders.filter((o) => o.status === 'selesai_closed');

const mitraReport = mockMitra.map((m) => {
  const mitraOrders = mockOrders.filter((o) => o.mitra_id === m.id);
  const total = mitraOrders.reduce((sum, o) => sum + o.harga, 0);
  const komisi = total * (m.komisi / 100);
  return { 
    nama: m.nama_toko, 
    total, 
    komisi, 
    bersih: total - komisi, 
    orders: mitraOrders.length,
    initial: m.nama_toko.charAt(0)
  };
});

const totalKomisi = mitraReport.reduce((sum, m) => sum + m.komisi, 0);
const totalBersih = totalTransaksi - totalKomisi;

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#0ea5e9', '#6366f1'];

export default function AdminReports() {
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
            <div className="text-green-500 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
              +15.4%
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
            <div className="text-green-500 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
              Stable
            </div>
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Order Selesai</p>
          <h3 className="text-3xl font-black text-slate-900">{completedOrders.length}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Perbandingan Pendapatan Mitra
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                <span className="text-xs font-bold text-slate-500">Gross</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold text-slate-500">Net</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={mitraReport} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="nama" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} tickFormatter={(v) => `Rp${v/1000}k`} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
              />
              <Bar dataKey="total" name="Total Gross" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
              <Bar dataKey="bersih" name="Bersih (Admin)" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            Share Komisi Mitra
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={mitraReport} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="komisi" stroke="none">
                {mitraReport.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={6} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-4 mt-6">
            {mitraReport.map((m, i) => (
              <div key={m.nama} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-slate-600">{m.nama}</span>
                </div>
                <span className="text-xs font-black text-slate-900">Rp {m.komisi.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileDown className="h-5 w-5 text-blue-600" />
            Detail Finansial per Mitra
          </h3>
        </div>
        <div className="overflow-x-auto -mx-8 px-8">
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="text-left py-4 px-2">Mitra Outlet</th>
                <th className="text-center py-4 px-2">Total Order</th>
                <th className="text-right py-4 px-2">Gross Revenue</th>
                <th className="text-right py-4 px-2">Komisi Mitra</th>
                <th className="text-right py-4 px-2">Net Profit</th>
                <th className="text-right py-4 px-2">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mitraReport.map((m) => (
                <tr key={m.nama} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 px-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-blue-600 text-xs border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {m.initial}
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{m.nama}</span>
                    </div>
                  </td>
                  <td className="py-5 px-2 text-center">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-black">{m.orders}</span>
                  </td>
                  <td className="py-5 px-2 text-right font-bold text-slate-900 text-sm">Rp {m.total.toLocaleString('id-ID')}</td>
                  <td className="py-5 px-2 text-right font-bold text-orange-500 text-sm">Rp {m.komisi.toLocaleString('id-ID')}</td>
                  <td className="py-5 px-2 text-right font-black text-green-600 text-sm">Rp {m.bersih.toLocaleString('id-ID')}</td>
                  <td className="py-5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1 text-xs font-black text-slate-400">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      {((m.bersih / m.total) * 100).toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white rounded-2xl overflow-hidden">
                <td className="py-6 px-6 rounded-l-2xl font-black text-sm uppercase tracking-widest">Total Keseluruhan</td>
                <td className="py-6 px-2 text-center font-black text-blue-400">{mitraReport.reduce((s, m) => s + m.orders, 0)}</td>
                <td className="py-6 px-2 text-right font-black text-blue-400">Rp {totalTransaksi.toLocaleString('id-ID')}</td>
                <td className="py-6 px-2 text-right font-black text-orange-400">Rp {totalKomisi.toLocaleString('id-ID')}</td>
                <td className="py-6 px-2 text-right font-black text-green-400">Rp {totalBersih.toLocaleString('id-ID')}</td>
                <td className="py-6 px-6 rounded-r-2xl text-right font-black text-slate-500">
                  {((totalBersih / totalTransaksi) * 100).toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
