import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus, ORDER_STATUS_LABELS } from '@/lib/types';
import { Search, Calendar, User, Tag, DollarSign, Clock, Loader2, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NextActionCard } from '@/components/order/NextActionCard';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function MitraOrders() {
  const { mitra } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      toast.error('Gagal mengambil data order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [mitra?.id]);

  const handleUpdateStatus = async (order: Order) => {
    const currentIdx = ['diterima_mitra', 'dikirim_ke_pusat', 'diproses', 'dicuci', 'dikeringkan', 'disetrika', 'selesai_pusat', 'dikirim_ke_mitra', 'siap_diambil', 'selesai_closed'].indexOf(order.status);
    const nextStatus = currentIdx < 9 ? ['diterima_mitra', 'dikirim_ke_pusat', 'diproses', 'dicuci', 'dikeringkan', 'disetrika', 'selesai_pusat', 'dikirim_ke_mitra', 'siap_diambil', 'selesai_closed'][currentIdx + 1] as OrderStatus : null;

    if (!nextStatus) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: nextStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', order.id);

      if (error) throw error;

      // Simpan riwayat status
      await supabase
        .from('order_history')
        .insert([{
          order_id: order.id,
          status: nextStatus,
          catatan: `Status diperbarui ke ${ORDER_STATUS_LABELS[nextStatus]}`
        }]);

      toast.success(`Status order diperbarui ke "${ORDER_STATUS_LABELS[nextStatus]}"`);
      fetchOrders();
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error('Gagal memperbarui status order');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  if (loading && orders.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold">Memuat data order...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Riwayat Order</h1>
          <p className="text-slate-500 font-medium">Pantau seluruh transaksi dan status cucian customer Anda</p>
        </div>
        <Link to="/mitra/new-order">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-bold gap-2 transition-all active:scale-95">
            Buat Order Baru
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            className="pl-12 h-12 rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white font-semibold text-slate-600 focus-visible:ring-blue-500"
            placeholder="Cari ID Order atau Nama Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50 overflow-x-auto no-scrollbar">
          {['all', 'diterima_mitra', 'selesai_closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterStatus === status 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'Semua' : status === 'diterima_mitra' ? 'Aktif' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm">
          Error: {error}
        </div>
      )}

      <div className="grid gap-6">
        {filteredOrders.length === 0 ? (
          <Card className="p-20 text-center border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Order Tidak Ditemukan</h3>
            <p className="text-slate-500 font-medium">Coba gunakan kata kunci pencarian lain.</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="p-0 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden group hover:ring-2 hover:ring-blue-100 transition-all">
              <div className="flex flex-col md:flex-row">
                <div className="p-8 flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      #{order.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={order.status} className="shadow-sm" />
                    <div className="ml-auto flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock className="h-3 w-3" />
                      {new Date(order.updated_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-blue-600" />
                        <p className="text-sm font-bold text-slate-900">{order.customer_name}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontak</p>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-blue-600" />
                        <p className="text-sm font-bold text-slate-900">{order.customer_hp || '-'}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biaya</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                        <p className="text-sm font-black text-slate-900">Rp {order.total_price.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terakhir Update</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-orange-500" />
                        <p className="text-sm font-bold text-slate-900">{new Date(order.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <NextActionCard order={order} onUpdateStatus={handleUpdateStatus} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}