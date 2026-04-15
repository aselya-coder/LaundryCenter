import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockMitra } from '@/lib/mock-data';
import { Mitra } from '@/lib/types';
import { PlusCircle, Building2, MapPin, Percent } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMitra() {
  const [mitraList, setMitraList] = useState<Mitra[]>(mockMitra);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama_toko: '', alamat: '', kota: '', komisi: '20' });

  const handleAdd = () => {
    const newMitra: Mitra = {
      id: `m${Date.now()}`,
      user_id: `u${Date.now()}`,
      nama_toko: form.nama_toko,
      alamat: form.alamat,
      kota: form.kota,
      komisi: Number(form.komisi),
      aktif: true,
    };
    setMitraList((prev) => [...prev, newMitra]);
    setForm({ nama_toko: '', alamat: '', kota: '', komisi: '20' });
    setOpen(false);
    toast.success('Mitra berhasil ditambahkan');
  };

  const toggleActive = (id: string) => {
    setMitraList((prev) => prev.map((m) => (m.id === id ? { ...m, aktif: !m.aktif } : m)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Mitra</h1>
          <p className="text-muted-foreground text-sm">{mitraList.length} mitra terdaftar</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" />Tambah Mitra</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Mitra Baru</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Nama Toko</Label>
                <Input value={form.nama_toko} onChange={(e) => setForm({ ...form, nama_toko: e.target.value })} placeholder="Nama outlet" />
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat lengkap" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kota</Label>
                  <Input value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })} placeholder="Kota" />
                </div>
                <div className="space-y-2">
                  <Label>Komisi (%)</Label>
                  <Input type="number" value={form.komisi} onChange={(e) => setForm({ ...form, komisi: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mitraList.map((mitra) => (
          <Card key={mitra.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{mitra.nama_toko}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {mitra.kota}
                  </div>
                </div>
              </div>
              <Badge variant={mitra.aktif ? 'default' : 'secondary'} className={mitra.aktif ? 'bg-success/10 text-success border-success/20' : ''}>
                {mitra.aktif ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{mitra.alamat}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <Percent className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{mitra.komisi}% komisi</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => toggleActive(mitra.id)}>
                {mitra.aktif ? 'Nonaktifkan' : 'Aktifkan'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
