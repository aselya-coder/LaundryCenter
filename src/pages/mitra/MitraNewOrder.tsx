import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { CheckCircle, ArrowLeft, WashingMachine, Calculator, User, Phone, FileText, Info, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export default function MitraNewOrder() {
  const { mitra } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [kodeOrder, setKodeOrder] = useState('');
  const [form, setForm] = useState({
    customer_nama: '',
    customer_hp: '',
    jenis: 'kiloan' as 'kiloan' | 'satuan',
    berat: '',
    catatan: '',
  });

  const estimatedPrice = useMemo(() => {
    const val = parseFloat(form.berat) || 0;
    const pricePerUnit = form.jenis === 'kiloan' ? 10000 : 15000;
    return val * pricePerUnit;
  }, [form.jenis, form.berat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date();
    const kode = `LD-${date.toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
    setKodeOrder(kode);
    setSubmitted(true);
    toast.success('Order berhasil dibuat!');
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="p-10 text-center max-w-md border-none shadow-2xl shadow-blue-100 rounded-3xl bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-50 mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Order Berhasil!</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">Berikan kode ini kepada customer untuk tracking status laundry mereka.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kode Order Anda</p>
            <p className="text-3xl font-mono font-black text-blue-600">{kodeOrder}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold text-sm shadow-lg shadow-blue-100"
              onClick={() => { setSubmitted(false); setForm({ customer_nama: '', customer_hp: '', jenis: 'kiloan', berat: '', catatan: '' }); }}
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
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link to="/mitra">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-500 hover:text-blue-600">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buat Order Baru</h1>
          <p className="text-slate-500 font-medium">Input detail cucian customer dengan teliti</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-2 p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Informasi Customer
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nama Customer</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-10 h-12 rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50/50 font-semibold"
                      value={form.customer_nama} 
                      onChange={(e) => setForm({ ...form, customer_nama: e.target.value })} 
                      placeholder="e.g. Budi Santoso" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nomor WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-10 h-12 rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50/50 font-semibold"
                      value={form.customer_hp} 
                      onChange={(e) => setForm({ ...form, customer_hp: e.target.value })} 
                      placeholder="e.g. 08123456789" 
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <WashingMachine className="h-5 w-5 text-blue-600" />
                Detail Laundry
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Layanan</Label>
                  <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v as 'kiloan' | 'satuan' })}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-blue-500 bg-slate-50/50 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="kiloan" className="font-semibold py-3">Laundry Kiloan (Reguler)</SelectItem>
                      <SelectItem value="satuan" className="font-semibold py-3">Laundry Satuan (Special Care)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {form.jenis === 'kiloan' ? 'Berat (kg)' : 'Jumlah Item'}
                  </Label>
                  <div className="relative">
                    <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="number" 
                      step="0.1" 
                      className="pl-10 h-12 rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50/50 font-semibold"
                      value={form.berat} 
                      onChange={(e) => setForm({ ...form, berat: e.target.value })} 
                      placeholder="0" 
                      required 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Catatan Khusus</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Textarea 
                    className="pl-10 min-h-[120px] rounded-2xl border-slate-200 focus:border-blue-500 bg-slate-50/50 font-semibold pt-2"
                    value={form.catatan} 
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })} 
                    placeholder="e.g. Pisahkan baju putih, jangan pakai pewangi" 
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-100 transition-all active:scale-[0.98] mt-4">
              Simpan & Cetak Struk
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-blue-600 text-white rounded-3xl overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-200 mb-6">Ringkasan Biaya</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-blue-200">Layanan</span>
                  <span className="capitalize">{form.jenis}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-blue-200">Kuantitas</span>
                  <span>{form.berat || 0} {form.jenis === 'kiloan' ? 'kg' : 'item'}</span>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex justify-between items-end pt-2">
                  <span className="text-sm font-black text-blue-100 uppercase tracking-widest">Total Bayar</span>
                  <div className="text-right">
                    <p className="text-3xl font-black">Rp {estimatedPrice.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] font-bold text-blue-200 uppercase mt-1">Termasuk PPN 11%</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex gap-3">
                <Info className="h-5 w-5 text-blue-200 shrink-0" />
                <p className="text-[10px] font-bold text-blue-100 leading-relaxed uppercase tracking-wider">
                  Pastikan timbang cucian dengan akurat. Harga yang tertera adalah estimasi biaya pencucian reguler.
                </p>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Calculator className="h-40 w-40" />
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Informasi Mitra</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-blue-600 text-xs border border-slate-100">
                  {mitra?.komisi}%
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Komisi Anda</p>
                  <p className="text-sm font-black text-slate-900">Rp {(estimatedPrice * (mitra?.komisi || 0) / 100).toLocaleString('id-ID')}</p>
                </div>
              </div>
              <Separator className="bg-slate-50" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimasi Selesai</p>
                  <p className="text-sm font-black text-slate-900">3 Hari Kerja</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
