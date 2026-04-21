import { useState, useEffect, useMemo } from 'react';
import { Package, DollarSign, Users, TrendingUp, Activity, MapPin, Loader2, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { ORDER_STATUS_LABELS, Order } from '@/lib/types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts';

const today = new Date().toISOString().split('T')[0];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, mitraRes, expensesRes, historyRes] = await Promise.all([
          supabase.from('orders').select('*'),
          supabase.from('mitra').select('*'),
          supabase.from('expenses').select('*'),
          supabase.from('order_history').select('*, orders(customer_name, kode_order)').order('created_at', { ascending: false }).limit(6)
        ]);

        if (ordersRes.error) throw ordersRes.error;
        if (mitraRes.error) throw mitraRes.error;
        if (expensesRes.error) throw expensesRes.error;
        if (historyRes.error) throw historyRes.error;

        setOrders(ordersRes.data || []);
        setMitraList(mitraRes.data || []);
        setExpenses(expensesRes.data || []);
        setRecentHistory(historyRes.data || []);
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

  const mitraPerformanceData = useMemo(() => {
    return mitraList.map(m => {
      const mitraOrders = orders.filter(o => o.mitra_id === m.id);
      const totalOmzet = mitraOrders.reduce((sum, o) => sum + o.total_price, 0);
      return {
        name: m.nama_toko,
        orders: mitraOrders.length,
        omzet: totalOmzet
      };
    }).sort((a, b) => b.omzet - a.omzet).slice(0, 5); // Top 5
  }, [mitraList, orders]);

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
  
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Pusat</h1>
          <p className="text-slate-500 font-medium">Ringkasan operasional dan performa mitra hari ini</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm">Real-time</div>
          <div className="px-4 py-2 text-slate-400 font-bold text-sm">
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
  
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  
        <div className="p-6 bg-white rounded-3xl shadow-xl border group hover:scale-[1.02] transition">
          <Package className="h-6 w-6" />
          <p>Order Hari Ini</p>
          <h3>{ordersToday.length}</h3>
        </div>
  
        <div className="p-6 bg-white rounded-3xl shadow-xl border group hover:scale-[1.02] transition">
          <DollarSign className="h-6 w-6" />
          <p>Profit Bersih</p>
          <h3>Rp {netProfit.toLocaleString('id-ID')}</h3>
        </div>
  
        <div className="p-6 bg-white rounded-3xl shadow-xl border group hover:scale-[1.02] transition">
          <Users className="h-6 w-6" />
          <p>Total Mitra</p>
          <h3>{mitraList.length}</h3>
        </div>
  
        <div className="p-6 bg-white rounded-3xl shadow-xl border group hover:scale-[1.02] transition">
          <Receipt className="h-6 w-6" />
          <p>Total Pengeluaran</p>
          <h3>Rp {totalExpenses.toLocaleString('id-ID')}</h3>
        </div>
  
      </div>
  
      {/* CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area dataKey="revenue" />
              <Area dataKey="expense" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div> {/* ✅ penting */}
  
      {/* GRID 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  
        <Card className="p-8">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mitraPerformanceData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="omzet" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
  
        <Card className="p-8">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={cityChartData} dataKey="value">
                {cityChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
  
      </div>
  
      {/* HISTORY */}
      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentHistory.map((history) => (
            <div key={history.id}>
              <StatusBadge status={history.status} />
              <p>{history.orders?.customer_name}</p>
            </div>
          ))}
        </div>
      </Card>
  
    </div>
  );
}