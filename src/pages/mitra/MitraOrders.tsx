import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { mockOrders } from '@/lib/mock-data';
import { Search, Filter, Calendar, ArrowUpRight, User, Phone, Tag, DollarSign, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MitraOrders() {
  const { mitra } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!mitra) return null;

  const myOrders = useMemo(() => {
    return mockOrders.filter((o) => {
      const isMyOrder = o.mitra_id === mitra.id;
      const matchesSearch = 
        o.kode_order.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_nama.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
      return isMyOrder && matchesSearch && matchesStatus;
    });
  }, [mitra.id, searchTerm, filterStatus]);

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
            placeholder="Cari Kode Order atau Nama Customer..."
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

      <div className="grid gap-6">
        {myOrders.length === 0 ? (
          <Card className="p-20 text-center border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Order Tidak Ditemukan</h3>
            <p className="text-slate-500 font-medium">Coba gunakan kata kunci pencarian lain.</p>
          </Card>
        ) : (
          myOrders.map((order) => (
            <Card key={order.id} className="p-0 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden group hover:ring-2 hover:ring-blue-100 transition-all">
              <div className="flex flex-col md:flex-row">
                <div className="p-8 flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      {order.kode_order}
                    </span>
                    <StatusBadge status={order.status} className="shadow-sm" />
                    <div className="ml-auto flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-blue-600" />
                        <p className="text-sm font-bold text-slate-900">{order.customer_nama}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Layanan</p>
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-blue-600" />
                        <p className="text-sm font-bold text-slate-900 capitalize">{order.jenis} ({order.berat} {order.jenis === 'kiloan' ? 'kg' : 'item'})</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biaya</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                        <p className="text-sm font-black text-slate-900">Rp {order.harga.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimasi</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-orange-500" />
                        <p className="text-sm font-bold text-slate-900">3 Hari</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-6 md:w-48 flex flex-col justify-center items-center gap-3 border-l border-slate-100">
                  <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                    <CheckCircle2 className={`h-6 w-6 ${order.status === 'selesai_closed' ? 'text-green-500' : 'text-slate-300'}`} />
                  </div>
                  <Button variant="ghost" className="h-10 rounded-xl font-bold text-xs text-blue-600 hover:bg-blue-50 w-full gap-1">
                    Detail <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
