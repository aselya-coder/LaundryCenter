import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, Order } from '@/lib/types';
import { QrCode, Search, WashingMachine, CheckCircle2, Clock, Loader2, History, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function TrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [idOrder, setIdOrder] = useState(searchParams.get('code') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (code: string) => {
    if (!code.trim()) return;

    // Bersihkan input: hapus karakter '#' jika ada dan ubah ke uppercase
    const cleanCode = code.trim().replace(/^#/, '').toUpperCase();

    try {
      setLoading(true);
      setSearched(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, mitra(nama_toko), order_history(*)')
        .eq('kode_order', cleanCode)
        .maybeSingle();

      if (error) {
        console.error('Error tracking order:', error);
        toast.error('Gagal melacak order');
        setOrder(null);
      } else if (!data) {
        setOrder(null);
      } else {
        // Sort history descending
        if (data.order_history) {
          data.order_history.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        setOrder(data);
        // Update URL if searched manually
        if (searchParams.get('code') !== cleanCode) {
          setSearchParams({ code: cleanCode }, { replace: true });
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  }, [searchParams, setSearchParams]);

  // Efek untuk handle parameter URL saat pertama kali load
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      performSearch(codeFromUrl);
    }
  }, []);

  // Realtime Subscription
  useEffect(() => {
    if (!order?.id) return;

    // Listen to changes on the specific order
    const orderSubscription = supabase
      .channel(`order-tracking-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          console.log('Order status updated via realtime:', payload.new);
          // Update status and updated_at directly from payload
          setOrder((prev) => prev ? { 
            ...prev, 
            status: payload.new.status,
            updated_at: payload.new.updated_at 
          } : null);
          
          // Re-fetch order details to get the new history record
          performSearch(order.kode_order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, [order?.id, order?.kode_order, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(idOrder);
  };

  const clearSearch = () => {
    setIdOrder('');
    setOrder(null);
    setSearched(false);
    setSearchParams({}, { replace: true });
  };

  const currentIdx = order ? ORDER_STATUS_FLOW.indexOf(order.status) : -1;
  const trackingUrl = order ? `${window.location.origin}/tracking?code=${order.kode_order}` : '';
  const qrCodeUrl = trackingUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingUrl)}` : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-border/50 bg-white sticky top-0 z-10">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-blue-600">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <WashingMachine className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">LaundryCenter</span>
          </Link>
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors bg-slate-100 px-4 py-2 rounded-full">Login</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Lacak Laundry Anda</h1>
          <p className="text-slate-600 text-lg">Pantau status cucian Anda secara real-time dari mana saja</p>
        </motion.div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              value={idOrder}
              onChange={(e) => { setIdOrder(e.target.value); if(searched && !e.target.value) setSearched(false); }}
              placeholder="Masukkan Kode Tracking (contoh: LD-2026...)"
              className="pl-10 pr-10 h-12 text-lg font-mono border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white shadow-sm"
            />
            {idOrder && (
              <button 
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={loading || !idOrder.trim()}
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Lacak'}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {searched && !order && !loading && (
            <motion.div 
              key="not-found"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="p-12 text-center border-dashed border-2 bg-white rounded-3xl">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Order Tidak Ditemukan</h3>
                <p className="text-slate-500 max-w-xs mx-auto">Kode <strong>{idOrder}</strong> tidak terdaftar. Mohon periksa kembali kode tracking pada struk Anda.</p>
              </Card>
            </motion.div>
          )}

          {order && !loading && (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-6"
            >
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <QrCode className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">Kode Tracking</span>
                        <p className="font-mono text-xl font-black text-slate-900">#{order.kode_order}</p>
                      </div>
                      <p className="text-slate-600 font-medium">{order.customer_name} <span className="text-slate-300 mx-2">|</span> {order.mitra?.nama_toko || 'Pusat'}</p>
                    </div>
                    <StatusBadge status={order.status} className="h-10 px-6 text-sm font-bold rounded-full shadow-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase">Total Bayar</p>
                      <p className="font-bold text-blue-600">Rp {order.total_price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase">Status Pembayaran</p>
                      <p className={`font-bold ${(order.is_paid || order.status === 'selesai_closed') ? 'text-green-600' : 'text-red-500'}`}>
                        {(order.is_paid || order.status === 'selesai_closed') ? 'LUNAS' : 'BELUM BAYAR'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase">Terakhir Update</p>
                      <div className="flex items-center gap-1 text-slate-900 font-bold">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(order.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {order.items_detail && order.items_detail.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Detail Item Cucian</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.items_detail.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                            <span className="text-sm font-bold text-slate-700">{item.item}</span>
                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">x{item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-blue-600 text-white rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="bg-white p-2 rounded-2xl mb-4 shadow-lg ring-4 ring-blue-500/30">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="QR Tracking" className="h-32 w-32 rounded-lg" />
                  ) : (
                    <QrCode className="h-32 w-32 text-blue-600" />
                  )}
                </div>
                <p className="font-bold text-lg mb-1">Scan QR Tracking</p>
                <p className="text-blue-100 text-xs px-2">Gunakan kode ini untuk akses cepat status laundry Anda dari smartphone.</p>
              </Card>
            </div>

            <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2 uppercase tracking-wider">
                <History className="h-5 w-5 text-blue-600" />
                Riwayat Perjalanan Cucian
              </h3>
              
              <div className="relative pl-4 before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                <div className="space-y-8">
                  {order.order_history && order.order_history.length > 0 ? (
                    order.order_history.map((history, idx) => (
                      <div key={history.id} className="relative flex gap-6">
                        <div className="relative z-10 flex items-center justify-center h-4 w-4 mt-1">
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center ring-4 ${idx === 0 ? 'bg-blue-600 ring-blue-100 animate-pulse' : 'bg-green-500 ring-green-50'}`}>
                            {idx === 0 ? <CheckCircle2 className="h-3 w-3 text-white" /> : <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <p className={`text-base font-black uppercase tracking-widest ${idx === 0 ? 'text-blue-600' : 'text-slate-900'}`}>
                              {ORDER_STATUS_LABELS[history.status]}
                            </p>
                            <p className="text-xs font-bold text-slate-400">
                              {new Date(history.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-bold">
                            {new Date(history.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          {history.catatan && (
                            <p className="text-[10px] text-slate-400 mt-1 italic font-medium">
                              "{history.catatan}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 font-bold text-sm italic py-4">
                      Belum ada riwayat status tercatat
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
