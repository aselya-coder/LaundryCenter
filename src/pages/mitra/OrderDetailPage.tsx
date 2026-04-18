import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Order, ORDER_STATUS_LABELS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, User, Phone, MapPin, Calendar, Tag, Weight, ReceiptText, Clock, CheckCircle2, History, Wallet, CreditCard, Printer, DollarSign, Package, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useReactToPrint } from 'react-to-print';
import { ThermalReceipt } from '@/components/order/ThermalReceipt';

export default function OrderDetailPage() {
  const { orderId: id } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  const handleWhatsAppNotify = () => {
    if (!order) return;
    
    const trackingUrl = `${window.location.origin}/tracking?code=${order.kode_order}`;
    let message = '';
    
    if (order.status === 'siap_diambil') {
      message = `Halo ${order.customer_name}, laundry Anda dengan kode *#${order.kode_order}* sudah *SIAP DIAMBIL* di ${order.mitra?.nama_toko || 'outlet kami'}.\n\nTotal Biaya: Rp ${order.total_price.toLocaleString('id-ID')}\nStatus Bayar: ${order.is_paid ? 'LUNAS' : 'BELUM BAYAR'}\n\nLacak detailnya di sini: ${trackingUrl}\n\nTerima kasih!`;
    } else {
      message = `Halo ${order.customer_name}, laundry Anda dengan kode *#${order.kode_order}* saat ini berstatus: *${ORDER_STATUS_LABELS[order.status]}*.\n\nLacak status terbaru di sini: ${trackingUrl}\n\nTerima kasih!`;
    }

    const phone = order.customer_hp?.replace(/\D/g, '');
    const cleanPhone = phone?.startsWith('0') ? '62' + phone.slice(1) : phone;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_history(*), mitra(nama_toko)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Sort order_history by created_at descending
      if (data.order_history) {
        data.order_history.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      
      setOrder(data);
    } catch (err: any) {
      console.error('Error fetching order detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  // Realtime Subscription
  useEffect(() => {
    if (!id) return;

    const orderSubscription = supabase
      .channel(`order-detail-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${id}`,
        },
        () => {
          fetchOrder(); // Re-fetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold">Order tidak ditemukan</h2>
        <Link to="/mitra/orders" className="text-blue-600 hover:underline mt-4 inline-block">Kembali ke Daftar Order</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Hidden Thermal Receipt */}
      {order && <ThermalReceipt ref={receiptRef} order={order} mitraName={order.mitra?.nama_toko} />}

      <div className="flex items-center gap-4">
        <Link to="/mitra/orders">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-blue-600">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Detail Order
            <span className="text-blue-600 font-mono text-xl bg-blue-50 px-3 py-1 rounded-lg">#{order.kode_order}</span>
          </h1>
          <p className="text-slate-500 font-medium">Informasi lengkap pesanan pelanggan</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info */}
          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem]">
            <div className="flex items-center justify-between mb-8">
              <StatusBadge status={order.status} className="scale-110" />
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Terakhir Update</p>
                <p className="text-sm font-bold text-slate-900">{new Date(order.updated_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <User className="h-3 w-3" /> Customer
                  </h3>
                  <div>
                    <p className="text-lg font-black text-slate-900">{order.customer_name}</p>
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-1">
                      <Phone className="h-3.5 w-3.5" /> {order.customer_hp || '-'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ReceiptText className="h-3 w-3" /> Detail Layanan
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Jenis</p>
                      <p className="text-sm font-black text-slate-900 capitalize">{order.jenis}</p>
                    </div>
                    {order.jenis === 'kiloan' && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Berat</p>
                        <p className="text-sm font-black text-slate-900">{order.berat} kg</p>
                      </div>
                    )}
                  </div>
                </div>

                {order.items_detail && order.items_detail.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Package className="h-3 w-3" /> Detail Item
                    </h3>
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      <div className="grid grid-cols-1 gap-2">
                        {order.items_detail.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="font-bold text-slate-700">{item.item}</span>
                            <span className="font-black text-blue-600 bg-white px-2 py-0.5 rounded-md border border-blue-100">x{item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Jadwal
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-400">Masuk</span>
                      <span className="font-black text-slate-900">{new Date(order.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-400">Estimasi</span>
                      <span className="font-black text-blue-600">
                        {order.tanggal_selesai 
                          ? new Date(order.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '-'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Tag className="h-3 w-3" /> Catatan
                  </h3>
                  <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 min-h-[80px]">
                    <p className="text-sm font-medium text-slate-700 italic leading-relaxed">
                      "{order.catatan || 'Tidak ada catatan tambahan'}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Status History */}
          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem]">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 uppercase tracking-wider mb-8">
              <History className="h-5 w-5 text-blue-600" />
              Riwayat Perjalanan Cucian
            </h3>
            
            <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {order.order_history && order.order_history.length > 0 ? (
                order.order_history.map((history, idx) => (
                  <div key={history.id} className="relative pl-12">
                    <div className={`absolute left-0 top-1 h-8 w-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {idx === 0 ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className={`text-sm font-black uppercase tracking-widest ${idx === 0 ? 'text-blue-600' : 'text-slate-900'}`}>
                          {ORDER_STATUS_LABELS[history.status]}
                        </p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{history.catatan}</p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(history.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-sm font-black text-slate-900">
                          {new Date(history.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-12 text-slate-400 font-bold text-sm italic">
                  Belum ada riwayat status tercatat
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white rounded-[2rem] relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                  <ReceiptText className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Pembayaran</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-blue-100">
                  <span className="text-xs font-bold uppercase tracking-widest">Harga Total</span>
                  <span className="text-2xl font-black text-white">Rp {order.total_price.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-t border-white/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Status</span>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.is_paid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {order.is_paid ? 'LUNAS' : 'BELUM BAYAR'}
                  </span>
                </div>

                {order.is_paid && (
                  <div className="flex justify-between items-center py-3 border-t border-white/10">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Metode</span>
                    <div className="flex items-center gap-2 text-white">
                      {order.payment_method === 'tunai' ? <Wallet className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                      <span className="text-xs font-black uppercase">{order.payment_method}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <DollarSign className="h-40 w-40 text-white" />
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem]">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Lokasi Outlet</p>
                <p className="font-bold text-slate-900 text-sm">{order.mitra?.nama_toko || 'Outlet Mitra'}</p>
              </div>
            </div>
          </Card>

          <Button 
            className="w-full h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all active:scale-95 gap-2"
            onClick={() => handlePrint()}
          >
            <Printer className="h-5 w-5" />
            CETAK STRUK
          </Button>

          <Button 
            variant="outline"
            className="w-full h-14 rounded-2xl font-black border-green-200 text-green-600 hover:bg-green-50 shadow-sm transition-all active:scale-95 gap-2"
            onClick={handleWhatsAppNotify}
            disabled={!order.customer_hp}
          >
            <MessageSquare className="h-5 w-5" />
            KIRIM NOTIFIKASI WA
          </Button>
        </div>
      </div>
    </div>
  );
}