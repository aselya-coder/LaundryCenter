import { Package, DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, MapPin } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { mockOrders, mockMitra, mockTransaksi } from '@/lib/mock-data';
import { ORDER_STATUS_LABELS, OrderStatus } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const today = new Date().toISOString().split('T')[0];
const ordersToday = mockOrders.filter((o) => o.tanggal_masuk === today);
const totalRevenue = mockOrders.reduce((sum, o) => sum + o.harga, 0);

const statusCounts = mockOrders.reduce((acc, o) => {
  acc[o.status] = (acc[o.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const chartData = Object.entries(statusCounts).map(([status, count]) => ({
  name: ORDER_STATUS_LABELS[status as OrderStatus],
  value: count,
}));

const cityData = mockMitra.reduce((acc, m) => {
  acc[m.kota] = (acc[m.kota] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const cityChartData = Object.entries(cityData).map(([kota, count]) => ({ name: kota, value: count }));
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#0ea5e9', '#6366f1'];

const revenueData = [
  { day: 'Sen', amount: 1200000 },
  { day: 'Sel', amount: 1500000 },
  { day: 'Rab', amount: 900000 },
  { day: 'Kam', amount: 2100000 },
  { day: 'Jum', amount: 1800000 },
  { day: 'Sab', amount: 2500000 },
  { day: 'Min', amount: 2300000 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Pusat</h1>
          <p className="text-slate-500 font-medium">Ringkasan operasional dan performa mitra hari ini</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm">Real-time</div>
          <div className="px-4 py-2 text-slate-400 font-bold text-sm">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Package className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
              <ArrowUpRight className="h-3 w-3" />
              12%
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Order Hari Ini</p>
          <h3 className="text-3xl font-black text-slate-900">{ordersToday.length}</h3>
        </div>

        <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
              <ArrowUpRight className="h-3 w-3" />
              8%
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Pendapatan</p>
          <h3 className="text-2xl font-black text-slate-900">Rp {totalRevenue.toLocaleString('id-ID')}</h3>
        </div>

        <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg text-xs font-bold">
              Aktif
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Mitra</p>
          <h3 className="text-3xl font-black text-slate-900">{mockMitra.filter((m) => m.aktif).length}</h3>
        </div>

        <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
              <Activity className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold">
              <ArrowDownRight className="h-3 w-3" />
              3%
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Order Aktif</p>
          <h3 className="text-3xl font-black text-slate-900">{mockOrders.filter((o) => o.status !== 'selesai_closed').length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Tren Transaksi Mingguan
            </h3>
            <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg px-3 py-2 outline-none">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `Rp${val/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
              />
              <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Distribusi Kota
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={cityChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                {cityChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-4">
            {cityChartData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{item.value} Mitra</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Monitoring Order Terbaru
          </h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto -mx-8 px-8">
          <table className="w-full">
            <thead>
              <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50">
                <th className="text-left py-4 px-2">Kode Order</th>
                <th className="text-left py-4 px-2">Customer</th>
                <th className="text-left py-4 px-2">Mitra Pengirim</th>
                <th className="text-left py-4 px-2">Layanan</th>
                <th className="text-left py-4 px-2">Total</th>
                <th className="text-left py-4 px-2">Status Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockOrders.slice(0, 6).map((order) => {
                const mitra = mockMitra.find((m) => m.id === order.mitra_id);
                return (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2 font-mono text-xs font-bold text-blue-600">{order.kode_order}</td>
                    <td className="py-4 px-2">
                      <p className="font-bold text-slate-900 text-sm">{order.customer_nama}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{order.customer_hp}</p>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {mitra?.nama_toko.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-600">{mitra?.nama_toko}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md capitalize">{order.jenis}</span>
                    </td>
                    <td className="py-4 px-2 font-black text-slate-900 text-sm">Rp {order.harga.toLocaleString('id-ID')}</td>
                    <td className="py-4 px-2"><StatusBadge status={order.status} className="shadow-sm" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
