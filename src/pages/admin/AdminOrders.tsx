import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { mockOrders, mockMitra } from '@/lib/mock-data';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, OrderStatus } from '@/lib/types';
import { toast } from 'sonner';
import { Search, Filter, User, Phone, MapPin, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = 
        o.kode_order.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_hp.includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, filterStatus]);

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, tanggal_selesai: newStatus === 'selesai_closed' ? new Date().toISOString().split('T')[0] : o.tanggal_selesai }
          : o
      )
    );
    toast.success(`Status order diperbarui ke "${ORDER_STATUS_LABELS[newStatus]}"`);
  };

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
            placeholder="Cari Kode Order, Nama, atau No. HP..."
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
            const mitra = mockMitra.find((m) => m.id === order.mitra_id);
            const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);
            const nextStatus = currentIdx < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[currentIdx + 1] : null;

            return (
              <Card key={order.id} className="p-0 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden group hover:ring-2 hover:ring-blue-100 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-stretch">
                  <div className="p-8 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-wider">
                        {order.kode_order}
                      </span>
                      <StatusBadge status={order.status} className="shadow-sm" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-auto">
                        {new Date(order.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                            <p className="text-sm font-black text-slate-900">{order.customer_nama}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kontak</p>
                            <p className="text-sm font-black text-slate-900">{order.customer_hp}</p>
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
                            <p className="text-sm font-black text-slate-900">{mitra?.nama_toko}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <RefreshCw className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Jenis Layanan</p>
                            <p className="text-sm font-black text-slate-900 capitalize">{order.jenis} ({order.berat} {order.jenis === 'kiloan' ? 'kg' : 'item'})</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 rounded-2xl flex flex-col justify-center border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                        <p className="text-2xl font-black text-blue-600">Rp {order.harga.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-8 lg:w-72 flex flex-col justify-center gap-4 transition-colors ${nextStatus ? 'bg-blue-600 text-white' : 'bg-slate-50'}`}>
                    {nextStatus ? (
                      <>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">Aksi Selanjutnya</p>
                        <Button 
                          className="w-full bg-white text-blue-600 hover:bg-blue-50 h-14 rounded-2xl font-black text-sm gap-2 shadow-xl shadow-blue-900/20 transition-all active:scale-95"
                          onClick={() => updateStatus(order.id, nextStatus)}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                          {ORDER_STATUS_LABELS[nextStatus]}
                        </Button>
                        <p className="text-[10px] text-blue-200 text-center font-bold">Klik untuk update status ke tahap berikutnya</p>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Selesai</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Order telah diserahkan</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
