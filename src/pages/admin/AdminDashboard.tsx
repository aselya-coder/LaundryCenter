import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Activity, Loader2, Receipt, ShoppingBag, Wallet, History, ArrowUpRight, Building2, BarChart3, PieChart as PieChartIcon, Plus, FileText, Search, Users, LayoutDashboard, ArrowRight, Package, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const today = new Date().toISOString().split('T')[0];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching dashboard data...');
        
        const [ordersRes, mitraRes, expensesRes, historyRes, inventoryRes] = await Promise.all([
          supabase.from('orders').select('*'),
          supabase.from('mitra').select('*'),
          supabase.from('expenses').select('*'),
          supabase.from('order_history').select('*, orders(customer_name, kode_order, status)').order('created_at', { ascending: false }).limit(6),
          supabase.from('inventory').select('*')
        ]);

        if (ordersRes.error) {
          console.error('Orders fetch error:', ordersRes.error);
          throw ordersRes.error;
        }
        if (mitraRes.error) {
          console.error('Mitra fetch error:', mitraRes.error);
          throw mitraRes.error;
        }
        if (expensesRes.error) {
          console.error('Expenses fetch error:', expensesRes.error);
          throw expensesRes.error;
        }
        if (historyRes.error) {
          console.error('History fetch error:', historyRes.error);
          throw historyRes.error;
        }
        if (inventoryRes.error) {
          console.error('Inventory fetch error:', inventoryRes.error);
          throw inventoryRes.error;
        }

        console.log('Data fetched successfully');
        setOrders(ordersRes.data || []);
        setMitraList(mitraRes.data || []);
        setExpenses(expensesRes.data || []);
        setRecentHistory(historyRes.data || []);
        setLowStockItems(inventoryRes.data?.filter(i => i.stok <= i.min_stok) || []);
      } catch (err: any) {
        console.error('Detailed dashboard error:', err);
        // If it's a 403, it might be RLS or Project Paused
        if (err.code === 'PGRST301' || err.status === 403) {
          console.warn('Access denied (403). Please check Supabase RLS policies or if the project is active.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const ordersToday = useMemo(() => orders.filter((o: Order) => {
    if (!o.tanggal_masuk) return false;
    const orderDate = o.tanggal_masuk.split('T')[0];
    return orderDate === today;
  }), [orders]);
  
  const totalPaidRevenue = useMemo(() => orders.filter((o: Order) => o.is_paid || o.status === 'selesai_closed').reduce((sum: number, o: Order) => sum + o.total_price, 0), [orders]);
  const totalExpenses = useMemo(() => expenses.reduce((sum: number, e: any) => sum + e.jumlah, 0), [expenses]);
  const netProfit = totalPaidRevenue - totalExpenses;

  const orderStats = useMemo(() => {
    return {
      pending: orders.filter(o => o.status === 'diterima_mitra').length,
      proses: orders.filter(o => ['dikirim_ke_pusat', 'diproses', 'dicuci', 'dikeringkan', 'disetrika', 'selesai_pusat', 'dikirim_ke_mitra'].includes(o.status)).length,
      selesai: orders.filter(o => o.status === 'selesai_closed' || o.status === 'siap_diambil').length
    };
  }, [orders]);

  const cityData = useMemo(() => mitraList.reduce((acc: Record<string, number>, m: any) => {
    const kota = m.kota || 'Lainnya';
    acc[kota] = (acc[kota] || 0) + 1;
    return acc;
  }, {} as Record<string, number>), [mitraList]);

  const cityChartData = useMemo(() => Object.entries(cityData).map(([kota, count]) => ({ name: String(kota), value: count as number })), [cityData]);
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#0ea5e9', '#6366f1'];

  const mitraPerformanceData = useMemo(() => {
    return mitraList.map((m: any) => {
      const mitraOrders = orders.filter((o: Order) => o.mitra_id === m.id);
      const totalOmzet = mitraOrders.reduce((sum: number, o: Order) => sum + o.total_price, 0);
      return {
        name: m.nama_toko,
        orders: mitraOrders.length,
        omzet: totalOmzet
      };
    }).sort((a: any, b: any) => b.omzet - a.omzet).slice(0, 5); // Top 5
  }, [mitraList, orders]);

  const maxOmzet = useMemo(() => Math.max(...mitraPerformanceData.map(m => m.omzet), 1), [mitraPerformanceData]);

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
        .filter((o: Order) => o.tanggal_masuk && o.tanggal_masuk.split('T')[0] === date)
        .reduce((sum: number, o: Order) => sum + o.total_price, 0);
      
      const paidAmount = orders
        .filter((o: Order) => o.tanggal_masuk && o.tanggal_masuk.split('T')[0] === date && (o.is_paid || o.status === 'selesai_closed'))
        .reduce((sum: number, o: Order) => sum + o.total_price, 0);
      
      const expenseAmount = expenses
        .filter((e: any) => e.tanggal && e.tanggal.split('T')[0] === date)
        .reduce((sum: number, e: any) => sum + e.jumlah, 0);
      
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
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-10 w-10 text-blue-600" />
            Dashboard Pusat
          </h1>
          <p className="text-slate-500 font-medium mt-1">Ringkasan operasional dan performa mitra hari ini</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 mr-2">
            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Live Update
            </div>
            <div className="px-4 py-2 text-slate-400 font-bold text-xs border-l border-slate-100">
              {format(new Date(), 'dd MMMM yyyy', { locale: id })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/admin/accounts">
              <Button variant="outline" className="h-11 rounded-xl font-bold gap-2 border-slate-200 hover:bg-slate-50">
                <Users className="h-4 w-4" />
                Mitra
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outline" className="h-11 rounded-xl font-bold gap-2 border-slate-200 hover:bg-slate-50">
                <FileText className="h-4 w-4" />
                Laporan
              </Button>
            </Link>
            <Link to="/admin/expenses">
              <Button className="h-11 rounded-xl font-bold gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
                <Plus className="h-4 w-4" />
                Pengeluaran
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK STATUS & MAIN STATS */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* STATS LEFT (3 columns) */}
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/admin/orders" className="block group">
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden relative group-hover:ring-2 group-hover:ring-blue-500 transition-all duration-300">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <ShoppingBag className="h-24 w-24 text-blue-600" />
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Order Hari Ini</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900">{ordersToday.length}</h3>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <ArrowRight className="h-2 w-2" />
                    Detail
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/reports" className="block group">
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-emerald-600 rounded-[2rem] overflow-hidden relative text-white group-hover:ring-2 group-hover:ring-emerald-400 transition-all duration-300">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Wallet className="h-24 w-24" />
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Profit Bersih</p>
                <h3 className="text-2xl font-black">Rp {netProfit.toLocaleString('id-ID')}</h3>
                <div className="mt-3">
                  <p className="text-[10px] text-emerald-100/70 font-bold flex items-center gap-1">
                    <FileText className="h-2 w-2" />
                    Lihat Laporan
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/accounts" className="block group">
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden relative group-hover:ring-2 group-hover:ring-orange-500 transition-all duration-300">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Building2 className="h-24 w-24 text-orange-600" />
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                  <Building2 className="h-6 w-6" />
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Mitra</p>
                <h3 className="text-3xl font-black text-slate-900">{mitraList.length}</h3>
                <div className="mt-3">
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Users className="h-2 w-2" />
                    Kelola Mitra
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/expenses" className="block group">
            <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden relative group-hover:ring-2 group-hover:ring-red-500 transition-all duration-300">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <Receipt className="h-24 w-24 text-red-600" />
              </div>
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <Receipt className="h-6 w-6" />
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Pengeluaran</p>
                <h3 className="text-2xl font-black text-slate-900">Rp {totalExpenses.toLocaleString('id-ID')}</h3>
                <div className="mt-3">
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Plus className="h-2 w-2" />
                    Tambah Biaya
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* ORDER SUMMARY RIGHT (1 column) */}
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem]">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Aksi Cepat Status</h4>
          <div className="space-y-4">
            <Link to="/admin/orders" className="block group">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50 border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-orange-600 group-hover:text-white" />
                  <span className="text-sm font-bold">Pending</span>
                </div>
                <span className="text-lg font-black">{orderStats.pending}</span>
              </div>
            </Link>
            <Link to="/admin/orders" className="block group">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-600 group-hover:text-white" />
                  <span className="text-sm font-bold">Proses</span>
                </div>
                <span className="text-lg font-black">{orderStats.proses}</span>
              </div>
            </Link>
            <Link to="/admin/orders" className="block group">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 group-hover:text-white" />
                  <span className="text-sm font-bold">Selesai</span>
                </div>
                <span className="text-lg font-black">{orderStats.selesai}</span>
              </div>
            </Link>
          </div>
        </Card>
      </div>
  
      {/* CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              Performa 7 Hari Terakhir
            </h3>
            <div className="flex items-center gap-4 text-xs font-bold bg-slate-50 p-2 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-slate-500">Omzet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-slate-500">Biaya</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                  tickFormatter={(val) => `Rp${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  formatter={(val: any) => [`Rp ${val.toLocaleString('id-ID')}`]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <PieChartIcon className="h-5 w-5" />
            </div>
            Distribusi Kota
          </h3>
          <div className="flex-1 h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {cityChartData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {cityChartData.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">{item.name}</span>
                  <span className="text-sm font-black text-slate-700 leading-none mt-1.5">{item.value} Mitra</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
  
      {/* SECONDARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  
        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              Top 5 Performa Mitra
            </h3>
            <Link to="/admin/accounts" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 group">
              Lihat Semua
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-8">
            {mitraPerformanceData.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                <Building2 className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Belum ada data mitra</p>
              </div>
            ) : (
              mitraPerformanceData.map((mitra, i) => (
                <Link to="/admin/accounts" key={i} className="block group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-transform group-hover:scale-110 ${
                        i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        i === 1 ? 'bg-slate-100 text-slate-600' : 
                        i === 2 ? 'bg-orange-100 text-orange-700' : 
                        'bg-slate-50 text-slate-400'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {mitra.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">Rp {mitra.omzet.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{mitra.orders} Order</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden group-hover:bg-slate-100 transition-colors">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${(mitra.omzet / maxOmzet) * 100}%`,
                        backgroundColor: COLORS[i % COLORS.length]
                      }}
                    ></div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Stok Menipis
            </h3>
            <Link to="/admin/inventory" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 group">
              Beli Stok
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-4">
            {lowStockItems.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="h-8 w-8 mb-2 text-emerald-500 opacity-20" />
                <p className="text-sm font-medium">Semua stok aman</p>
              </div>
            ) : (
              lowStockItems.map((item) => (
                <Link to="/admin/inventory" key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-red-50/50 border border-red-100 group hover:bg-red-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-red-600 shadow-sm">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{item.nama}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.kategori}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-red-600">{item.stok} {item.satuan}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Batas: {item.min_stok}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
  
        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <History className="h-5 w-5" />
              </div>
              Aktivitas Terbaru
            </h3>
            <Link to="/tracking">
              <Button variant="ghost" size="sm" className="text-blue-600 font-bold gap-2">
                <Search className="h-4 w-4" />
                Lacak Struk
              </Button>
            </Link>
          </div>
          <div className="space-y-6">
            {recentHistory.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                <History className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Belum ada aktivitas</p>
              </div>
            ) : (
              recentHistory.map((history: any, i: number) => (
                <Link 
                  to={`/tracking?kode=${history.orders?.kode_order}`} 
                  key={history.id} 
                  className="flex gap-4 group cursor-pointer hover:bg-slate-50 p-3 -m-3 rounded-[1.5rem] transition-all duration-300 active:scale-[0.98]"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                      <Activity className="h-5 w-5" />
                    </div>
                    {i !== recentHistory.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1 group-hover:bg-blue-100 transition-colors"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{history.orders?.customer_name}</p>
                      <span className="text-[10px] font-bold text-slate-400">
                        {format(new Date(history.created_at), 'HH:mm', { locale: id })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={history.status} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{history.orders?.kode_order}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <span className="text-[10px] font-black uppercase tracking-tighter">Lacak</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
  
      </div>
  
    </div>
  );
}

