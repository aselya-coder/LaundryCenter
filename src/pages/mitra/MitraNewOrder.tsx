import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { CheckCircle, User, Phone, Package, Calendar, DollarSign, Wallet, CreditCard, Loader2, ArrowLeft, Weight, AlignLeft, Clock, Printer, Plus, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Service, Order } from '@/lib/types';
import { useReactToPrint } from 'react-to-print';
import { ThermalReceipt } from '@/components/order/ThermalReceipt';

export default function MitraNewOrder() {
  const { mitra } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategory, setServiceCategory] = useState<'all' | 'kiloan' | 'satuan'>('all');
  
  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  const [form, setForm] = useState({
    customer_name: '',
    customer_hp: '',
    service_id: '',
    jenis: 'kiloan',
    berat: '',
    total_price: 0,
    catatan: '',
    tanggal_selesai: '',
    payment_method: 'tunai' as 'tunai' | 'transfer',
    is_paid: true
  });

  const [items, setItems] = useState<{ item: string; qty: number }[]>([{ item: '', qty: 1 }]);

  const addItem = () => setItems([...items, { item: '', qty: 1 }]);
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length > 0 ? newItems : [{ item: '', qty: 1 }]);
  };
  const updateItem = (index: number, field: 'item' | 'qty', value: string | number) => {
    const newItems = [...items];
    if (field === 'item') {
      newItems[index].item = value as string;
    } else {
      newItems[index].qty = Number(value);
    }
    setItems(newItems);
  };

  // Fetch layanan dari database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setFetchingServices(true);
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('aktif', true)
          .order('nama', { ascending: true });
        
        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        toast.error('Gagal memuat daftar layanan');
      } finally {
        setFetchingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Hitung total harga otomatis saat layanan atau berat berubah
  useEffect(() => {
    const selectedService = services.find(s => s.id === form.service_id);
    if (selectedService && form.berat) {
      const price = selectedService.harga * Number(form.berat);
      setForm(prev => ({ ...prev, total_price: price }));
    } else {
      setForm(prev => ({ ...prev, total_price: 0 }));
    }
  }, [form.service_id, form.berat, services]);

  const filteredServices = services.filter(s => {
    const matchesSearch = s.nama.toLowerCase().includes(serviceSearch.toLowerCase());
    const matchesCategory = serviceCategory === 'all' || s.kategori === serviceCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mitra) {
      toast.error('Data mitra tidak ditemukan. Silakan login ulang.');
      return;
    }

    if (!form.service_id && form.jenis === 'kiloan') {
      toast.error('Pilih layanan terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const generatedKode = `LD-${dateStr}-${randomStr}`;

      const selectedService = services.find(s => s.id === form.service_id);

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          kode_order: generatedKode,
          customer_name: form.customer_name,
          customer_hp: form.customer_hp,
          mitra_id: mitra.id,
          jenis: selectedService?.kategori || 'kiloan',
          berat: Number(form.berat),
          total_price: form.total_price,
          status: 'diterima_mitra',
          catatan: form.catatan,
          tanggal_selesai: form.tanggal_selesai,
          is_paid: form.is_paid,
          payment_method: form.is_paid ? form.payment_method : null,
          items_detail: items.filter(i => i.item.trim() !== '')
        }])
        .select()
        .single();

      if (error) throw error;

      // Simpan riwayat pertama
      await supabase.from('order_history').insert([{
        order_id: data.id,
        status: 'diterima_mitra',
        catatan: 'Order baru dibuat oleh mitra'
      }]);

      setCreatedOrder(data);
      setSubmitted(true);
      toast.success('Order berhasil dibuat!');
    } catch (err: any) {
      console.error('Error creating order:', err);
      toast.error(err.message || 'Gagal membuat order');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({
      customer_name: '',
      customer_hp: '',
      service_id: '',
      jenis: 'kiloan',
      berat: '',
      total_price: 0,
      catatan: '',
      tanggal_selesai: '',
      payment_method: 'tunai',
      is_paid: true
    });
    setItems([{ item: '', qty: 1 }]);
  };

  const trackingUrl = createdOrder ? `${window.location.origin}/tracking?code=${createdOrder.kode_order}` : '';
  const qrCodeUrl = trackingUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingUrl)}` : '';

  if (submitted && createdOrder) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] py-10">
        {/* Hidden Thermal Receipt */}
        <ThermalReceipt 
          ref={receiptRef} 
          order={createdOrder} 
          mitraName={mitra?.nama_toko}
          serviceName={services.find(s => s.id === form.service_id)?.nama}
        />

        <Card className="p-10 text-center max-w-md border-none shadow-2xl shadow-blue-100 rounded-[2.5rem] bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-50 mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Order Berhasil!</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium px-4">Customer bisa scan QR di bawah atau gunakan Kode Tracking untuk cek status.</p>
          
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 flex flex-col items-center">
            <div className="bg-white p-2 rounded-2xl mb-4 shadow-sm border border-slate-100 ring-4 ring-slate-50">
              <img src={qrCodeUrl} alt="QR Tracking" className="h-40 w-40 rounded-lg" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Kode Tracking</p>
            <p className="text-2xl font-mono font-black text-blue-600 tracking-wider">{createdOrder.kode_order}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100 transition-all active:scale-95 gap-2"
              onClick={() => handlePrint()}
            >
              <Printer className="h-4 w-4" />
              Cetak Struk
            </Button>
            <Button 
              variant="outline"
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200 text-slate-600 transition-all active:scale-95"
              onClick={resetForm}
            >
              Input Order Lainnya
            </Button>
            <Link to="/mitra">
              <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-slate-500 hover:text-slate-900">
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4 px-4 sm:px-0">
        <Link to="/mitra">
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-blue-600">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buat Order Baru</h1>
          <p className="text-slate-500 font-medium">Input detail cucian customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8 items-start px-4 sm:px-0">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem]">
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                  <User className="h-5 w-5 text-blue-600" />
                  Informasi Customer
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Customer</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold transition-all shadow-sm"
                        value={form.customer_name} 
                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })} 
                        placeholder="e.g. Budi Santoso" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nomor WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold transition-all shadow-sm"
                        value={form.customer_hp} 
                        onChange={(e) => setForm({ ...form, customer_hp: e.target.value })} 
                        placeholder="081234567xxx" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-50" />

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Pilih Layanan</Label>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="Cari layanan..."
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="pl-9 h-10 w-[200px] rounded-xl text-xs bg-slate-50 border-none shadow-sm focus:bg-white transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl shadow-sm">
                        {['all', 'kiloan', 'satuan'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setServiceCategory(cat as any)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                              serviceCategory === cat 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {cat === 'all' ? 'Semua' : cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {fetchingServices ? (
                      <div className="h-20 flex items-center justify-center border border-dashed border-slate-200 rounded-2xl">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                        <span className="text-sm font-bold text-slate-400">Memuat layanan...</span>
                      </div>
                    ) : filteredServices.length === 0 ? (
                      <div className="p-10 border border-dashed border-slate-100 rounded-[2rem] text-center bg-slate-50/30">
                        <Search className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-400 italic">Layanan tidak ditemukan</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredServices.map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => setForm({ ...form, service_id: service.id, jenis: service.kategori })}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              form.service_id === service.id
                                ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50'
                                : 'border-slate-100 hover:border-blue-200 bg-slate-50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`font-bold text-sm ${form.service_id === service.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                {service.nama}
                              </span>
                              {form.service_id === service.id && <CheckCircle className="h-4 w-4 text-blue-600" />}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                Rp {service.harga.toLocaleString('id-ID')}/{service.satuan}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      {form.jenis === 'satuan' ? 'Jumlah Item (pcs)' : 'Berat (Kg)'}
                    </Label>
                    <div className="relative">
                      <Weight className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="number"
                        step="0.1"
                        value={form.berat}
                        onChange={(e) => setForm({ ...form, berat: e.target.value })}
                        className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold transition-all shadow-sm"
                        placeholder="0.0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Estimasi Selesai</Label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="date"
                        value={form.tanggal_selesai}
                        onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })}
                        className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Detail Item (Opsional)</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={addItem}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold gap-1 h-8 rounded-lg"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex-1 relative">
                          <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="e.g. Kaos, Celana Jeans"
                            value={item.item}
                            onChange={(e) => updateItem(idx, 'item', e.target.value)}
                            className="pl-11 h-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white font-medium"
                          />
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                            className="h-12 rounded-xl border-slate-100 bg-slate-50 focus:bg-white font-bold text-center"
                          />
                        </div>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(idx)}
                            className="h-12 w-12 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Catatan Tambahan</Label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Textarea
                      value={form.catatan}
                      onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                      className="pl-12 min-h-[100px] rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold transition-all shadow-sm resize-none"
                      placeholder="e.g. Cuci bersih, jangan pakai pemutih"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white rounded-[2rem] overflow-hidden relative">
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <DollarSign className="h-40 w-40 text-white" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold">Pembayaran</h3>
              </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-blue-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Layanan</span>
                      <span className="text-xs font-black truncate max-w-[120px]">
                        {services.find(s => s.id === form.service_id)?.nama || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-blue-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest">Kuantitas</span>
                      <span className="text-xs font-black">{form.berat || '0'} {form.jenis === 'satuan' ? 'pcs' : 'kg'}</span>
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Total Biaya</span>
                      <span className="text-xl font-black text-white">Rp {form.total_price.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-blue-200 ml-1">Status Pembayaran</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, is_paid: false })}
                        className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all ${
                          !form.is_paid 
                            ? 'border-red-500 bg-red-500/20 text-white shadow-lg shadow-red-900/20' 
                            : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">BELUM BAYAR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, is_paid: true })}
                        className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 transition-all ${
                          form.is_paid 
                            ? 'border-green-500 bg-green-500/20 text-white shadow-lg shadow-green-900/20' 
                            : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">LUNAS</span>
                      </button>
                    </div>
                  </div>

                  {form.is_paid && (
                    <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-blue-200 ml-1">Metode Pembayaran</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, payment_method: 'tunai' })}
                          className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all ${
                            form.payment_method === 'tunai'
                              ? 'border-blue-500 bg-blue-500/20 text-white'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">TUNAI</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, payment_method: 'transfer' })}
                          className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 transition-all ${
                            form.payment_method === 'transfer'
                              ? 'border-blue-500 bg-blue-500/20 text-white'
                              : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">TRANSFER</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.95] gap-3 mt-4"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'SIMPAN ORDER'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem]">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Outlet Mitra</p>
                <p className="font-bold text-slate-900 text-sm">{mitra?.nama_toko || 'Mitra Laundry'}</p>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
