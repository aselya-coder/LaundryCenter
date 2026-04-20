import { useState, useEffect, useMemo } from 'react';
import { Package, DollarSign, Users, TrendingUp, Activity, MapPin, Loader2, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { ORDER_STATUS_LABELS, Order } from '@/lib/types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const today = new Date().toISOString().split('T')[0];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const ordersToday = useMemo(() => orders.filter((o) => {
    if (!o.tanggal_masuk) return false;
    const orderDate = o.tanggal_masuk.split('T')[0];
    return orderDate === today;
  }), [orders]);
  
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total_price, 0), [orders]);
  const totalPaidRevenue = useMemo(() => orders.filter(o => o.is_paid || o.status === 'selesai_closed').reduce((sum, o) => sum + o.total_price, 0), [orders]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.jumlah, 0), [expenses]);
  const netProfit = totalPaidRevenue - totalExpenses;

  const cityData = useMemo(() => mitraList.reduce((acc, m) => {
    const kota = m.kota || 'Lainnya';
    acc[kota] = (acc[kota] || 0) + 1;
    return acc;
  }, {} as Record<string, number>), [mitraList]);

  const cityChartData = useMemo(() => Object.entries(cityData).map(([kota, count]) => ({ name: String(kota), value: count as number })), [cityData]);
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#0ea5e9', '#6366f1'];

  const revenueData = useMemo(() => {
    // Generate data for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    return last7Days.map(date => {
      const dayIndex = new Date(date).getDay();
      const amount = orders
        .filter(o => o.tanggal_masuk && o.tanggal_masuk.split('T')[0] === date)
        .reduce((sum, o) => sum + o.total_price, 0);
      
      const paidAmount = orders
        .filter(o => o.tanggal_masuk && o.tanggal_masuk.split('T')[0] === date && (o.is_paid || o.status === 'selesai_closed'))
        .reduce((sum, o) => sum + o.total_price, 0);
      
      const expenseAmount = expenses
        .filter(e => e.tanggal && e.tanggal.split('T')[0] === date)
        .reduce((sum, e) => sum + e.jumlah, 0);
      
      return {
        day: dayLabels[dayIndex],
        date: date,
        revenue: amount,
        paidRevenue: paidAmount,
        expense: expenseAmount
      };
    });
  }, [orders, expenses]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold">Memuat data dashboard...</p>
      </div>
    );
  }

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
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Order Hari Ini</p>
          <h3 className="text-3xl font-black text-slate-900">{ordersToday.length}</h3>
        </div>

        <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Profit Bersih</p>
          <h3 className="text-2xl font-black text-slate-900">Rp {netProfit.toLocaleString('id-ID')}</h3>
        </div>

        <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-1 text-orange-500 bg-orange-50 px-2 py-1 rounded-lg text-xs font-bold">
              {mitraList.filter(m => m.aktif).length} Aktif
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Mitra</p>
          <h3 className="text-3xl font-black text-slate-900">{mitraList.length}</h3>
        </div>

        <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 group hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
              <Receipt className="h-6 w-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Pengeluaran</p>
          <h3 className="text-2xl font-black text-slate-900">Rp {totalExpenses.toLocaleString('id-ID')}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Performa Keuangan (7 Hari Terakhir)
            </h3>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5 text-blue-600">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                Omzet Total
              </div>
              <div className="flex items-center gap-1.5 text-red-500">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                Pengeluaran
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>

                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} tickFormatter={(value) => `Rp ${value/1000}k`} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: any, name: string) => [
                    `Rp ${value.toLocaleString('id-ID')}`, 
                    name === 'revenue' ? 'Omzet Total' : 'Pengeluaran'
                  ]}
                />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />

              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Sebaran Mitra
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cityChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {cityChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                  <span className="text-sm font-bold text-slate-600">{entry.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{entry.value} Mitra</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
        <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Log Aktivitas Terkini
        </h3>
        <div className="space-y-4">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Update Status: {ORDER_STATUS_LABELS[order.status]}</p>
                  <p className="text-xs text-slate-500 font-medium">Customer: {order.customer_name} • ID: #{order.id.slice(0, 8)}</p>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} className="mb-1" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(order.updated_at).toLocaleTimeString('id-ID')}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}