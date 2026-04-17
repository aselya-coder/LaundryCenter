import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, Order } from '@/lib/types';
import { QrCode, Search, WashingMachine, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function TrackingPage() {
  const [idOrder, setIdOrder] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idOrder.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, mitra(nama_toko)')
        .eq('id', idOrder.trim())
        .single();

      if (error) {
        setOrder(null);
        if (error.code !== 'PGRST116') { // PGRST116 is code for no rows returned
          console.error('Error tracking order:', error);
          toast.error('Gagal melacak order');
        }
      } else {
        setOrder(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = order ? ORDER_STATUS_FLOW.indexOf(order.status) : -1;

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
              onChange={(e) => { setIdOrder(e.target.value); setSearched(false); }}
              placeholder="Masukkan ID Order..."
              className="pl-10 h-12 text-lg font-mono border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white shadow-sm"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
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
                <p className="text-slate-500 max-w-xs mx-auto">ID order <strong>{idOrder}</strong> tidak terdaftar di sistem kami. Mohon cek kembali struk Anda.</p>
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
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">Order ID</span>
                        <p className="font-mono text-xl font-black text-slate-900">#{order.id.slice(0, 8)}</p>
                      </div>
                      <p className="text-slate-600 font-medium">{order.customer_name} <span className="text-slate-300 mx-2">|</span> {order.mitra?.nama_toko || 'Pusat'}</p>
                    </div>
                    <StatusBadge status={order.status} className="h-10 px-6 text-sm font-bold rounded-full shadow-sm" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase">Total Bayar</p>
                      <p className="font-bold text-blue-600">Rp {order.total_price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs font-semibold uppercase">Terakhir Update</p>
                      <div className="flex items-center gap-1 text-slate-900 font-bold">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(order.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-blue-600 text-white rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="bg-white/20 p-4 rounded-2xl mb-4 backdrop-blur-md border border-white/20">
                  <QrCode className="h-20 w-20 text-white" />
                </div>
                <p className="font-bold text-lg mb-1">Scan QR Tracking</p>
                <p className="text-blue-100 text-xs">Gunakan ID ini untuk mempermudah pengecekan status laundry Anda.</p>
              </Card>
            </div>

            <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
              <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                Timeline Progress
              </h3>
              <div className="relative pl-4">
                <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
                <div className="space-y-2">
                  {ORDER_STATUS_FLOW.map((status, i) => {
                    const isCompleted = i <= currentIdx;
                    const isCurrent = i === currentIdx;

                    return (
                      <div key={status} className="relative flex gap-6 pb-8 last:pb-0">
                        <div className="relative z-10 flex items-center justify-center h-4 w-4 mt-1">
                          {isCompleted ? (
                            <div className={`h-4 w-4 rounded-full flex items-center justify-center ring-4 ${isCurrent ? 'bg-blue-600 ring-blue-100 animate-pulse' : 'bg-green-500 ring-green-50'}`}>
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          ) : (
                            <div className="h-3 w-3 rounded-full bg-white border-2 border-slate-200 ring-4 ring-slate-50"></div>
                          )}
                        </div>
                        <div className={`flex-1 ${isCompleted ? '' : 'opacity-40'}`}>
                          <div className="flex items-center justify-between gap-4">
                            <p className={`text-base font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-900'}`}>
                              {ORDER_STATUS_LABELS[status]}
                            </p>
                            {isCurrent && (
                              <p className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                {new Date(order.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                          {isCurrent && (
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                              {new Date(order.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
