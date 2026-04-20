import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus, ORDER_STATUS_LABELS, STATUS_RESPONSIBILITY, ORDER_STATUS_FLOW } from '@/lib/types';
import { Search, Calendar, User, Tag, DollarSign, Clock, Loader2, Phone, Share2, ExternalLink, Package, CheckCircle2, AlertCircle, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NextActionCard } from '@/components/order/NextActionCard';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { format } from 'date-fns';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function MitraOrders() {
  const { mitra } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [exporting, setExporting] = useState(false);

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

  // Statistik untuk Ringkasan Mitra
  const stats = useMemo(() => {
    const active = orders.filter(o => o.status !== 'selesai_closed').length;
    const ready = orders.filter(o => o.status === 'siap_diambil').length;
    const unpaid = orders.filter(o => !o.is_paid).reduce((sum, o) => sum + o.total_price, 0);
    
    return { active, ready, unpaid };
  }, [orders]);

  const handleUpdateStatus = async (order: Order) => {
    const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);
    const nextStatus = currentIdx < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[currentIdx + 1] : null;

    if (!nextStatus) return;

    // Logika pembatasan: Mitra hanya bisa mengubah status jika itu tanggung jawab Mitra
    if (STATUS_RESPONSIBILITY[nextStatus] !== 'mitra') {
      toast.error(`Status "${ORDER_STATUS_LABELS[nextStatus]}" adalah tanggung jawab Pusat.`);
      return;
    }

    try {
      const updateData: any = { 
        status: nextStatus, 
        updated_at: new Date().toISOString() 
      };

      // Jika status berubah menjadi selesai_closed, otomatis lunas
      if (nextStatus === 'selesai_closed') {
        updateData.is_paid = true;
        if (!order.payment_method) {
          updateData.payment_method = 'tunai';
        }
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;

      // Simpan riwayat status
      await supabase
        .from('order_history')
        .insert([{
          order_id: order.id,
          status: nextStatus,
          catatan: nextStatus === 'selesai_closed' 
            ? `Order selesai & pembayaran otomatis ditandai LUNAS` 
            : `Status diperbarui oleh Mitra ke ${ORDER_STATUS_LABELS[nextStatus]}`
        }]);

      if (nextStatus === 'selesai_closed') {
        toast.success(`Order selesai! Pembayaran otomatis ditandai LUNAS.`);
      } else {
        toast.success(`Status diperbarui ke "${ORDER_STATUS_LABELS[nextStatus]}"`);
      }
      
      await fetchOrders();
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
    } catch (err: any) {
      console.error('Error updating payment:', err);
      toast.error('Gagal memperbarui status pembayaran');
    }
  };

  const handleShare = (order: Order) => {
    const trackingUrl = `${window.location.origin}/tracking?code=${order.kode_order}`;
    const text = `Halo ${order.customer_name}, Anda dapat memantau status cucian Anda di LaundryCenter melalui link berikut: ${trackingUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Lacak Laundry Anda',
        text: text,
        url: trackingUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Link tracking disalin ke clipboard');
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      
      const dateStr = format(new Date(), 'yyyyMMdd');
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Data Order');

      // Title & Header
      const title = `LAPORAN TRANSAKSI - ${mitra?.nama_toko?.toUpperCase()}`;
      const titleRow = ws.addRow([title]);
      titleRow.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
      titleRow.alignment = { horizontal: 'center' };
      ws.mergeCells(1, 1, 1, 9);
      titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };

      ws.addRow([`Mitra: ${mitra?.nama_toko}`]).font = { bold: true };
      ws.addRow([`Filter: ${filterStatus === 'all' ? 'Semua Status' : ORDER_STATUS_LABELS[filterStatus as any]}`]);
      ws.addRow([`Tanggal Download: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`]);
      ws.addRow([]);

      const columns = [
        { header: 'Tanggal Masuk', key: 'tgl', width: 22 },
        { header: 'Kode Order', key: 'kode', width: 15 },
        { header: 'Customer', key: 'cust', width: 20 },
        { header: 'Layanan', key: 'layanan', width: 12 },
        { header: 'Berat/Qty', key: 'qty', width: 10 },
        { header: 'Total Biaya', key: 'total', width: 15 },
        { header: 'Status Order', key: 'status', width: 20 },
        { header: 'Status Bayar', key: 'bayar', width: 15 },
        { header: 'Metode', key: 'metode', width: 15 },
      ];

      const headerRow = ws.addRow(columns.map(c => c.header));
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        cell.font = { bold: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      ws.columns = columns.map(c => ({ key: c.key, width: c.width }));

      filteredOrders.forEach((o, index) => {
        const row = ws.addRow([
          o.tanggal_masuk ? format(new Date(o.tanggal_masuk), 'dd/MM/yyyy HH:mm') : '-',
          o.kode_order,
          o.customer_name,
          o.jenis,
          o.berat,
          o.total_price,
          ORDER_STATUS_LABELS[o.status] || o.status,
          o.is_paid ? 'LUNAS' : 'BELUM BAYAR',
          o.payment_method || '-'
        ]);

        // Status Styling
        const statusCell = row.getCell(7);
        statusCell.font = { bold: true, color: { argb: o.status === 'selesai_closed' ? 'FF10B981' : 'FF3B82F6' } };

        // Payment Styling
        const payCell = row.getCell(8);
        payCell.font = { bold: true, color: { argb: o.is_paid ? 'FF10B981' : 'FFEF4444' } };

        // Zebra striping
        if (index % 2 === 0) {
          row.eachCell(cell => {
            if (!cell.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          });
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Laporan_Mitra_${mitra?.nama_toko?.replace(/\s+/g, '_')}_${dateStr}.xlsx`);
      toast.success('Laporan Excel berhasil diunduh');
    } catch (err) {
      console.error('Error exporting excel:', err);
      toast.error('Gagal mengunduh laporan');
    } finally {
      setExporting(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.kode_order?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Riwayat Order</h1>
          <p className="text-slate-500 font-medium">Pantau dan kelola semua pesanan laundry di outlet Anda</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={handleExportExcel}
            disabled={exporting}
            variant="outline" 
            className="h-12 px-6 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileDown className="h-5 w-5" />
            )}
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
          <Link to="/mitra/new-order">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-bold gap-2 transition-all active:scale-95">
              Buat Order Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Ringkasan Dashboard Mitra */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Package className="h-24 w-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <Package className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Cucian Diproses</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.active} <span className="text-sm text-slate-400 font-bold">Order</span></h3>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle2 className="h-24 w-24 text-green-600" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Siap Diambil</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.ready} <span className="text-sm text-slate-400 font-bold">Order</span></h3>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <AlertCircle className="h-24 w-24 text-red-600" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Belum Dibayar</p>
            <h3 className="text-3xl font-black text-slate-900">Rp {stats.unpaid.toLocaleString('id-ID')}</h3>
          </div>
        </Card>
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
                    <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase">
                      #{order.kode_order || order.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={order.status} className="shadow-sm" />
                    <div className="flex items-center gap-2 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(order)}
                        className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Bagikan Link Tracking"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Link to={`/tracking?code=${order.kode_order}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Buka Halaman Tracking"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
                        <Clock className="h-3 w-3" />
                        {new Date(order.updated_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
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
                      <div className="flex items-center gap-2 group/pay">
                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                        <p className="text-sm font-bold text-slate-900">Rp {order.total_price.toLocaleString('id-ID')}</p>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ml-1 ${order.is_paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {order.is_paid ? 'LUNAS' : 'BELUM'}
                        </span>
                        <button 
                          onClick={() => handleTogglePayment(order)}
                          className="text-[8px] font-bold text-slate-400 hover:text-blue-600 opacity-0 group-hover/pay:opacity-100 transition-opacity ml-1"
                        >
                          Ubah
                        </button>
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