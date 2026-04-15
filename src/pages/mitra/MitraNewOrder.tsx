import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success/10 mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-xl font-bold mb-2">Order Berhasil!</h2>
          <p className="text-muted-foreground text-sm mb-4">Kode order Anda:</p>
          <p className="text-2xl font-mono font-bold text-primary mb-6">{kodeOrder}</p>
          <Button onClick={() => { setSubmitted(false); setForm({ customer_nama: '', customer_hp: '', jenis: 'kiloan', berat: '', catatan: '' }); }}>
            Buat Order Baru
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Baru</h1>
        <p className="text-muted-foreground text-sm">{mitra?.nama_toko}</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Customer</Label>
              <Input value={form.customer_nama} onChange={(e) => setForm({ ...form, customer_nama: e.target.value })} placeholder="Nama lengkap" required />
            </div>
            <div className="space-y-2">
              <Label>No. HP</Label>
              <Input value={form.customer_hp} onChange={(e) => setForm({ ...form, customer_hp: e.target.value })} placeholder="08xxxxxxxxxx" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis Laundry</Label>
              <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v as 'kiloan' | 'satuan' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kiloan">Kiloan</SelectItem>
                  <SelectItem value="satuan">Satuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{form.jenis === 'kiloan' ? 'Berat (kg)' : 'Jumlah Item'}</Label>
              <Input type="number" step="0.1" value={form.berat} onChange={(e) => setForm({ ...form, berat: e.target.value })} placeholder="0" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Catatan</Label>
            <Textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Catatan tambahan (opsional)" rows={3} />
          </div>
          <Button type="submit" className="w-full">Buat Order</Button>
        </form>
      </Card>
    </div>
  );
}
