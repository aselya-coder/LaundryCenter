import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { CheckCircle, ArrowLeft, User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export default function MitraNewOrder() {
  const { mitra } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [idOrder, setIdOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    total_price: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.total_price) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_name: form.customer_name,
          total_price: Number(form.total_price),
          status: 'diterima_mitra',
          updated_at: new Date().toISOString(),
          mitra_id: mitra?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setIdOrder(data.id);
      setSubmitted(true);
      toast.success('Order berhasil dibuat!');
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error('Gagal membuat order');
    } finally {
      setLoading(false);
    }
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
          <p className="text-slate-500 text-sm mb-6 font-medium">Berikan ID ini kepada customer untuk tracking status laundry mereka.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Order Anda</p>
            <p className="text-3xl font-mono font-black text-blue-600">#{idOrder.slice(0, 8)}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold text-sm shadow-lg shadow-blue-100"
              onClick={() => { setSubmitted(false); setForm({ customer_name: '', total_price: '' }); }}
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
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nama Customer</Label>
                  <Input 
                    className="h-12 rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50/50 font-semibold"
                    value={form.customer_name} 
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })} 
                    placeholder="e.g. Budi Santoso" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Harga (Rp)</Label>
                  <Input 
                    type="number"
                    className="h-12 rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50/50 font-semibold"
                    value={form.total_price} 
                    onChange={(e) => setForm({ ...form, total_price: e.target.value })} 
                    placeholder="e.g. 50000" 
                    required 
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-[0.98] gap-3"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Buat Order Sekarang'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
