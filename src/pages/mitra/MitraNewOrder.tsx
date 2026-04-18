import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CheckCircle, ArrowLeft, User, Loader2, Phone, Weight, Tag, Calendar, ReceiptText, MapPin, AlignLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export default function MitraNewOrder() {
  const { mitra } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [idOrder, setIdOrder] = useState('');
  const [kodeOrder, setKodeOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    customer_hp: '',
    jenis: 'kiloan', // kiloan | satuan
    berat: '',
    total_price: 0,
    catatan: '',
    tanggal_selesai: '',
  });

  // Harga per kg (bisa disesuaikan atau diambil dari pengaturan mitra nantinya)
  const HARGA_PER_KG = 7000;

  useEffect(() => {
    if (form.jenis === 'kiloan' && form.berat) {
      const calculatedPrice = Number(form.berat) * HARGA_PER_KG;
      setForm(prev => ({ ...prev, total_price: calculatedPrice }));
    }
  }, [form.berat, form.jenis]);

  const generateOrderCode = () => {
    const prefix = 'LD';
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${date}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.total_price) {
      toast.error('Mohon lengkapi informasi customer');
      return;
    }

    try {
      setLoading(true);
      const newKodeOrder = generateOrderCode();
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          kode_order: newKodeOrder,
          customer_name: form.customer_name,
          customer_hp: form.customer_hp,
          jenis: form.jenis,
          berat: form.jenis === 'kiloan' ? Number(form.berat) : null,
          total_price: Number(form.total_price),
          catatan: form.catatan,
          status: 'diterima_mitra',
          tanggal_masuk: new Date().toISOString(),
          tanggal_selesai: form.tanggal_selesai ? new Date(form.tanggal_selesai).toISOString() : null,
          updated_at: new Date().toISOString(),
          mitra_id: mitra?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // 2. Simpan riwayat status awal
      await supabase
        .from('order_history')
        .insert([{
          order_id: data.id,
          status: 'diterima_mitra',
          catatan: 'Order baru dibuat oleh mitra'
        }]);

      setIdOrder(data.id);
      setKodeOrder(newKodeOrder);
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
      jenis: 'kiloan',
      berat: '',
      total_price: 0,
      catatan: '',
      tanggal_selesai: '',
    });
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="p-10 text-center max-w-md border-none shadow-2xl shadow-blue-100 rounded-[2.5rem] bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-50 mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Order Berhasil!</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium px-4">Berikan Kode Order ini kepada customer untuk tracking status laundry mereka.</p>
          
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Kode Tracking Anda</p>
            <p className="text-2xl font-mono font-black text-blue-600 tracking-wider">{kodeOrder}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100 transition-all active:scale-95"
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
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                  <Tag className="h-5 w-5 text-blue-600" />
                  Detail Layanan
                </h3>
                
                <RadioGroup 
                  defaultValue="kiloan" 
                  value={form.jenis}
                  onValueChange={(v) => setForm({...form, jenis: v})}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem value="kiloan" id="kiloan" className="peer sr-only" />
                    <Label
                      htmlFor="kiloan"
                      className="flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 cursor-pointer transition-all"
                    >
                      <Weight className="mb-2 h-6 w-6 text-slate-400 peer-data-[state=checked]:text-blue-600" />
                      <span className="text-sm font-black uppercase tracking-widest">Kiloan</span>
                      <span className="text-[10px] text-slate-400 mt-1 font-bold">Rp 7.000 / kg</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="satuan" id="satuan" className="peer sr-only" />
                    <Label
                      htmlFor="satuan"
                      className="flex flex-col items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 cursor-pointer transition-all"
                    >
                      <Tag className="mb-2 h-6 w-6 text-slate-400 peer-data-[state=checked]:text-blue-600" />
                      <span className="text-sm font-black uppercase tracking-widest">Satuan</span>
                      <span className="text-[10px] text-slate-400 mt-1 font-bold">Harga Custom</span>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {form.jenis === 'kiloan' ? (
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Berat Cucian (kg)</Label>
                      <div className="relative">
                        <Weight className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input 
                          type="number"
                          step="0.1"
                          className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 font-semibold transition-all shadow-sm"
                          value={form.berat} 
                          onChange={(e) => setForm({ ...form, berat: e.target.value })} 
                          placeholder="0.0" 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Total Harga Satuan (Rp)</Label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input 
                          type="number"
                          className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 font-semibold transition-all shadow-sm"
                          value={form.total_price || ''} 
                          onChange={(e) => setForm({ ...form, total_price: Number(e.target.value) })} 
                          placeholder="0" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Estimasi Selesai</Label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        type="date"
                        className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 font-semibold transition-all shadow-sm"
                        value={form.tanggal_selesai} 
                        onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Catatan Tambahan</Label>
                  <div className="relative">
                    <AlignLeft className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Textarea 
                      className="pl-12 min-h-[100px] rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 font-semibold transition-all shadow-sm resize-none"
                      value={form.catatan} 
                      onChange={(e) => setForm({ ...form, catatan: e.target.value })} 
                      placeholder="e.g. Kaos putih jangan dicampur, cuci express" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-blue-600 text-white rounded-[2rem] relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-wider">
                <ReceiptText className="h-5 w-5 text-blue-200" />
                Ringkasan Order
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-blue-100">
                  <span className="text-xs font-bold uppercase tracking-widest">Layanan</span>
                  <span className="font-black capitalize">{form.jenis}</span>
                </div>
                {form.jenis === 'kiloan' && form.berat && (
                  <div className="flex justify-between items-center text-blue-100">
                    <span className="text-xs font-bold uppercase tracking-widest">Berat</span>
                    <span className="font-black">{form.berat} kg</span>
                  </div>
                )}
                <Separator className="bg-white/20" />
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Total Tagihan</span>
                  <p className="text-4xl font-black">Rp {form.total_price.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.95] gap-3 mt-4"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'SIMPAN ORDER'}
              </Button>
            </div>
            
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <ReceiptText className="h-40 w-40 text-white" />
            </div>
          </Card>

          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem]">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <MapPin className="h-5 w-5" />
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
