import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, STATUS_RESPONSIBILITY, OrderStatus, Order } from '@/lib/types';
import { toast } from 'sonner';
import { Search, Filter, User, CheckCircle2, Clock, Loader2, Phone, MapPin, History, Eye, ReceiptText, Calendar, Tag, Weight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // State untuk Detail Dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, mitra(nama_toko)')
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

  const fetchOrderDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, mitra(nama_toko), order_history(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data.order_history) {
        data.order_history.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      
      setSelectedOrder(data);
      setShowDetail(true);
    } catch (err: any) {
      console.error('Error fetching detail:', err);
      toast.error('Gagal memuat detail order');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        o.kode_order?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customer_hp && o.customer_hp.includes(searchTerm));
      const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    const currentIdx = ORDER_STATUS_FLOW.indexOf(status);
    if (currentIdx < ORDER_STATUS_FLOW.length - 1) {
      return ORDER_STATUS_FLOW[currentIdx + 1];
    }
    return null;
  };

  const handleUpdateStatus = async (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    // Logika pembatasan: Admin hanya bisa mengubah status jika itu tanggung jawab Admin
    if (STATUS_RESPONSIBILITY[nextStatus] !== 'admin') {
      toast.error(`Status "${ORDER_STATUS_LABELS[nextStatus]}" adalah tanggung jawab Mitra.`);
      return;
    }

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
          catatan: `Status diperbarui oleh Admin ke ${ORDER_STATUS_LABELS[nextStatus]}`
        }]);

      toast.success(`Status order diperbarui ke "${ORDER_STATUS_LABELS[nextStatus]}"`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === order.id) {
        fetchOrderDetail(order.id);
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error('Gagal memperbarui status order');
    }
  };

  const handleTogglePayment = async (order: Order) => {
    try {
      const newPaidStatus = !order.is_paid;
      const { error } = await supabase
        .from('orders')
        .update({ 
          is_paid: newPaidStatus,
          payment_method: newPaidStatus ? (order.payment_method || 'tunai') : null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success(`Pembayaran berhasil ditandai sebagai ${newPaidStatus ? 'LUNAS' : 'BELUM BAYAR'}`);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === order.id) {
        fetchOrderDetail(order.id);
      }
    } catch (err: any) {
      console.error('Error updating payment:', err);
      toast.error('Gagal memperbarui status pembayaran');
    }
  };

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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Order</h1>
          <p className="text-slate-500 font-medium">Pantau dan update status cucian dari seluruh mitra</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs">Total {filtered.length} Order</div>
        </div>
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
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="pl-12 h-12 rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white font-bold text-slate-600">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              <SelectItem value="all" className="font-bold py-3">Semua Status</SelectItem>
              {ORDER_STATUS_FLOW.map((s) => (
                <SelectItem key={s} value={s} className="font-bold py-3">{ORDER_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm">
          Error: {error}
        </div>
      )}

      <div className="grid gap-6">
        {filtered.length === 0 ? (
          <Card className="p-20 text-center border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Order Tidak Ditemukan</h3>
            <p className="text-slate-500 font-medium">Coba gunakan kata kunci pencarian lain atau ubah filter status.</p>
          </Card>
        ) : (
          filtered.map((order) => {
            const nextStatus = getNextStatus(order.status);

            return (
              <Card key={order.id} className="p-0 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden group hover:ring-2 hover:ring-blue-100 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-stretch">
                  <div className="p-8 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-wider">
                        #{order.kode_order || order.id.slice(0, 8)}
                      </span>
                      <StatusBadge status={order.status} className="shadow-sm" />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => fetchOrderDetail(order.id)}
                        className="text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 gap-2 h-8 px-3 rounded-lg"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detail & Riwayat
                      </Button>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-auto flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Terakhir Update: {new Date(order.updated_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</p>
                            <p className="text-sm font-black text-slate-900">{order.customer_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kontak</p>
                            <p className="text-sm font-black text-slate-900">{order.customer_hp || '-'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mitra Pengirim</p>
                            <p className="text-sm font-black text-slate-900">{order.mitra?.nama_toko || 'Pusat'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 rounded-2xl flex flex-col justify-center border border-slate-100 relative group/pay">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                        <p className="text-2xl font-black text-blue-600 mb-2">Rp {order.total_price.toLocaleString('id-ID')}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${order.is_paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {order.is_paid ? `LUNAS (${order.payment_method})` : 'BELUM BAYAR'}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTogglePayment(order)}
                            className="h-6 px-2 text-[10px] font-bold text-slate-400 hover:text-blue-600 opacity-0 group-hover/pay:opacity-100 transition-opacity"
                          >
                            Ubah
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-8 lg:w-72 flex flex-col justify-center gap-4 transition-colors ${nextStatus && STATUS_RESPONSIBILITY[nextStatus] === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-50'}`}>
                    {nextStatus && STATUS_RESPONSIBILITY[nextStatus] === 'admin' ? (
                      <>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">Aksi Selanjutnya</p>
                        <Button 
                          className="w-full bg-white text-blue-600 hover:bg-blue-50 h-14 rounded-2xl font-black text-sm gap-2 shadow-xl shadow-blue-900/20 transition-all active:scale-95"
                          onClick={() => handleUpdateStatus(order)}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                          {ORDER_STATUS_LABELS[nextStatus]}
                        </Button>
                        <p className="text-[10px] text-blue-200 text-center font-bold">Klik untuk update status ke tahap berikutnya</p>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 ${order.status === 'selesai_closed' ? 'bg-green-100' : 'bg-slate-200'}`}>
                          <CheckCircle2 className={`h-6 w-6 ${order.status === 'selesai_closed' ? 'text-green-500' : 'text-slate-400'}`} />
                        </div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
                          {order.status === 'selesai_closed' ? 'Selesai' : 'Menunggu Mitra'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                          {order.status === 'selesai_closed' ? 'Order telah diselesaikan' : 'Status selanjutnya diupdate oleh mitra'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-0">
          {selectedOrder && (
            <div className="space-y-0">
              {/* Header */}
              <div className="p-8 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kode Tracking</p>
                    <h2 className="text-2xl font-black text-slate-900 font-mono">#{selectedOrder.kode_order}</h2>
                  </div>
                  <StatusBadge status={selectedOrder.status} className="scale-110" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                    <p className="text-sm font-black text-slate-900 truncate">{selectedOrder.customer_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                    <p className="text-sm font-black text-slate-900">{selectedOrder.customer_hp || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mitra</p>
                    <p className="text-sm font-black text-blue-600">{selectedOrder.mitra?.nama_toko || 'Pusat'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bayar</p>
                    <p className="text-sm font-black text-blue-600 font-mono">Rp {selectedOrder.total_price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-12">
                {/* Detail Information */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <ReceiptText className="h-4 w-4 text-blue-600" /> Detail Pesanan
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Layanan</p>
                        <p className="text-sm font-black text-slate-900 capitalize">{selectedOrder.jenis}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Berat</p>
                        <p className="text-sm font-black text-slate-900">{selectedOrder.berat || 0} kg</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Mitra</p>
                      <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 italic text-sm text-slate-600">
                        "{selectedOrder.catatan || 'Tidak ada catatan'}"
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" /> Jadwal
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Tgl Masuk</span>
                        <span className="text-sm font-black text-slate-900">{new Date(selectedOrder.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Estimasi Selesai</span>
                        <span className="text-sm font-black text-blue-600">{selectedOrder.tanggal_selesai ? new Date(selectedOrder.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* History Timeline */}
                <div className="space-y-8">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <History className="h-4 w-4 text-blue-600" /> Riwayat Perjalanan
                  </h3>
                  <div className="relative pl-4 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    <div className="space-y-8">
                      {selectedOrder.order_history && selectedOrder.order_history.length > 0 ? (
                        selectedOrder.order_history.map((h, idx) => (
                          <div key={h.id} className="relative flex gap-6">
                            <div className="relative z-10 flex items-center justify-center h-4 w-4 mt-1">
                              <div className={`h-4 w-4 rounded-full flex items-center justify-center ring-4 ${idx === 0 ? 'bg-blue-600 ring-blue-100 animate-pulse' : 'bg-green-500 ring-green-50'}`}>
                                {idx === 0 ? <CheckCircle2 className="h-3 w-3 text-white" /> : <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-4">
                                <p className={`text-xs font-black uppercase tracking-widest ${idx === 0 ? 'text-blue-600' : 'text-slate-900'}`}>
                                  {ORDER_STATUS_LABELS[h.status]}
                                </p>
                                <p className="text-[10px] font-black text-slate-400">
                                  {new Date(h.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold">
                                {new Date(h.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </p>
                              {h.catatan && (
                                <p className="text-[10px] text-slate-400 mt-1 italic">
                                  "{h.catatan}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 italic">Belum ada riwayat tercatat</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button 
                  onClick={() => setShowDetail(false)}
                  className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-slate-900 hover:bg-slate-800 h-10 px-8"
                >
                  Tutup Detail
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
