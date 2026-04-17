import { useState, useEffect } from 'react';
import { Package, DollarSign, Clock, Plus, ArrowRight, Wallet, History, Search, Activity, FileText, HelpCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';
import { Link } from 'react-router-dom';

const today = new Date().toISOString().split('T')[0];

export default function MitraDashboard() {
  const { mitra, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!mitra?.id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('mitra_id', mitra.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [mitra?.id]);

  if (!mitra) return null;

  const ordersToday = orders.filter((o) => o.updated_at.startsWith(today));
  const activeOrders = orders.filter((o) => o.status !== 'selesai_closed');
  const totalPendapatan = orders.reduce((sum, o) => sum + o.total_price, 0);
  const totalKomisi = totalPendapatan * (mitra.komisi / 100);

  if (loading && orders.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Halo, {user?.nama}! 👋</h1>
          <p className="text-slate-500 font-medium">Selamat datang di dashboard {mitra.nama_toko}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/mitra/new-order">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-bold gap-2 transition-all active:scale-95">
              <Plus className="h-5 w-5" />
              Buat Order Baru
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none group">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <Package className="h-6 w-6" />
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Order Hari Ini</p>
          <h3 className="text-3xl font-black text-slate-900">{ordersToday.length}</h3>
        </Card>

        <Card className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none group">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
            <Clock className="h-6 w-6" />
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Order Aktif</p>
          <h3 className="text-3xl font-black text-slate-900">{activeOrders.length}</h3>
        </Card>

        <Card className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none group">
          <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
            <DollarSign className="h-6 w-6" />
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Transaksi</p>
          <h3 className="text-2xl font-black text-slate-900">Rp {totalPendapatan.toLocaleString('id-ID')}</h3>
        </Card>

        <Card className="p-6 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 border-none text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-4 backdrop-blur-md">
              <Wallet className="h-6 w-6" />
            </div>
            <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">Komisi Anda ({mitra.komisi}%)</p>
            <h3 className="text-2xl font-black">Rp {totalKomisi.toLocaleString('id-ID')}</h3>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Wallet className="h-24 w-24" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Daftar Order Aktif
            </h3>
            <Link to="/mitra/orders" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
              Lihat Riwayat <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {activeOrders.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Package className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold">Belum ada order aktif</p>
              <p className="text-slate-400 text-xs mt-1">Order yang Anda buat akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-sm font-black text-blue-600 text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      ID
                    </div>
                    <div>
                      <p className="font-mono text-xs font-black text-blue-600 mb-0.5">#{order.id.slice(0, 8)}</p>
                      <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Update: {new Date(order.updated_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 mt-4 sm:mt-0">
                    <p className="font-black text-slate-900 text-sm">Rp {order.total_price.toLocaleString('id-ID')}</p>
                    <StatusBadge status={order.status} className="shadow-sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Aksi Cepat
            </h3>
            <div className="space-y-3">
              <Link to="/tracking">
                <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 gap-3">
                  <Search className="h-5 w-5" />
                  Lacak Struk Customer
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start h-12 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 gap-3">
                <FileText className="h-5 w-5" />
                Download Laporan
              </Button>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Butuh Bantuan?</h3>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">Hubungi admin pusat jika Anda mengalami kendala operasional atau teknis.</p>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black text-xs h-10 rounded-xl uppercase tracking-widest">
                Hubungi Admin
              </Button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <HelpCircle className="h-24 w-24" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
