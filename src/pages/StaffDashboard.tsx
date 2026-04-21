import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { Order, ORDER_STATUS_LABELS, OrderStatus } from '@/lib/types';
import { 
  WashingMachine, 
  Play, 
  CheckCircle2, 
  Loader2, 
  Package,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { whatsappHelper } from '@/lib/whatsapp';

const STAFF_STATUS_FLOW: OrderStatus[] = [
  'diproses',
  'dicuci',
  'dikeringkan',
  'disetrika',
  'selesai_pusat'
];

export default function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStaffOrders = async () => {
    try {
      setLoading(true);
      // Staff hanya melihat order yang butuh diproses di pusat
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('status', ['dikirim_ke_pusat', 'diproses', 'dicuci', 'dikeringkan', 'disetrika'])
        .order('updated_at', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching staff orders:', err);
      toast.error('Gagal mengambil daftar kerjaan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffOrders();

    // Realtime subscription
    const channel = supabase
      .channel('staff-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchStaffOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (order: Order, nextStatus: OrderStatus) => {
    try {
      setUpdatingId(order.id);
      
      // 1. Update status order
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: nextStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // 2. Tambah riwayat
      const { error: historyError } = await supabase
        .from('order_history')
        .insert([{
          order_id: order.id,
          status: nextStatus,
          catatan: `Status diperbarui oleh Staff Produksi`
        }]);

      if (historyError) throw historyError;

      toast.success(`Order ${order.kode_order} kini: ${ORDER_STATUS_LABELS[nextStatus]}`);
      
      // Jika status selesai_pusat, beri opsi kirim WA
      if (nextStatus === 'selesai_pusat' && order.customer_hp) {
        toast.info("Proses pusat selesai! Klik untuk kabari customer", {
          action: {
            label: "Kirim WA",
            onClick: () => whatsappHelper.send(order)
          },
          duration: 10000
        });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Gagal memperbarui status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.kode_order.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Antrian Produksi</h1>
          <p className="text-slate-500 font-medium">Kelola proses cuci, kering, dan setrika di pusat</p>
        </div>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-100 font-bold flex items-center gap-3">
          <WashingMachine className="h-5 w-5" />
          {orders.length} Order Perlu Diproses
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input 
          className="pl-12 h-14 rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white font-semibold text-slate-600 focus-visible:ring-blue-500"
          placeholder="Cari Kode Order atau Nama Customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold">Memuat antrian...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="col-span-full p-20 text-center border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Semua Kerjaan Selesai!</h3>
            <p className="text-slate-500 font-medium">Tidak ada order yang perlu diproses saat ini.</p>
          </Card>
        ) : filteredOrders.map((order) => {
          const currentIndex = STAFF_STATUS_FLOW.indexOf(order.status as any);
          // Jika status adalah 'dikirim_ke_pusat', next-nya adalah 'diproses'
          const nextStatus = order.status === 'dikirim_ke_pusat' 
            ? 'diproses' 
            : STAFF_STATUS_FLOW[currentIndex + 1];

          return (
            <Card key={order.id} className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group hover:ring-2 hover:ring-blue-100 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Package className="h-6 w-6" />
                </div>
                <StatusBadge status={order.status} />
              </div>
              
              <h3 className="text-lg font-black text-slate-900 mb-1">#{order.kode_order}</h3>
              <p className="text-sm font-bold text-slate-500 mb-6">{order.customer_name}</p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Jenis</span>
                  <span>Berat/Qty</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-700">
                  <span className="capitalize">{order.jenis}</span>
                  <span>{order.berat} {order.jenis === 'kiloan' ? 'Kg' : 'Pcs'}</span>
                </div>
              </div>

              {nextStatus && (
                <Button 
                  onClick={() => handleUpdateStatus(order, nextStatus as OrderStatus)}
                  disabled={updatingId === order.id}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-blue-100"
                >
                  {updatingId === order.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 fill-current" />
                  )}
                  Lanjut ke {ORDER_STATUS_LABELS[nextStatus as OrderStatus]}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
