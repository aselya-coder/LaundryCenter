import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { mockMitra } from '@/lib/mock-data';
import { Mitra } from '@/lib/types';
import { PlusCircle, Building2, MapPin, Percent, Search, MoreVertical, Edit2, Trash2, Power, Store, Globe, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export default function AdminMitra() {
  const [mitraList, setMitraList] = useState<Mitra[]>(mockMitra);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editingMitra, setEditingMitra] = useState<Mitra | null>(null);
  const [form, setForm] = useState({ nama_toko: '', alamat: '', kota: '', komisi: '20' });

  const filteredMitra = useMemo(() => {
    return mitraList.filter((m) => 
      m.nama_toko.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.kota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.alamat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mitraList, searchTerm]);

  const handleSave = () => {
    if (editingMitra) {
      setMitraList((prev) => prev.map((m) => m.id === editingMitra.id ? {
        ...m,
        nama_toko: form.nama_toko,
        alamat: form.alamat,
        kota: form.kota,
        komisi: Number(form.komisi),
      } : m));
      toast.success('Data mitra berhasil diperbarui');
    } else {
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
      toast.success('Mitra baru berhasil ditambahkan');
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ nama_toko: '', alamat: '', kota: '', komisi: '20' });
    setEditingMitra(null);
    setOpen(false);
  };

  const handleEdit = (mitra: Mitra) => {
    setEditingMitra(mitra);
    setForm({
      nama_toko: mitra.nama_toko,
      alamat: mitra.alamat,
      kota: mitra.kota,
      komisi: String(mitra.komisi),
    });
    setOpen(true);
  };

  const toggleActive = (id: string) => {
    setMitraList((prev) => prev.map((m) => (m.id === id ? { ...m, aktif: !m.aktif } : m)));
    const mitra = mitraList.find(m => m.id === id);
    toast.success(`Mitra ${mitra?.nama_toko} kini ${!mitra?.aktif ? 'Aktif' : 'Nonaktif'}`);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Mitra</h1>
          <p className="text-slate-500 font-medium">Kelola jaringan outlet dan agen laundry Anda</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => { if(!val) resetForm(); setOpen(val); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-bold gap-2 transition-all active:scale-95">
              <PlusCircle className="h-5 w-5" />
              Tambah Mitra Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-slate-900">
                {editingMitra ? 'Edit Data Mitra' : 'Tambah Mitra Baru'}
              </DialogTitle>
              <p className="text-slate-500 font-medium text-sm">Lengkapi informasi outlet di bawah ini</p>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nama Toko / Outlet</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50/50 font-semibold"
                    value={form.nama_toko} 
                    onChange={(e) => setForm({ ...form, nama_toko: e.target.value })} 
                    placeholder="e.g. Laundry Express Menteng" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Alamat Lengkap</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    className="pl-10 h-12 rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50/50 font-semibold"
                    value={form.alamat} 
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })} 
                    placeholder="Jl. Raya No. 123..." 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Kota</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-10 h-12 rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50/50 font-semibold"
                      value={form.kota} 
                      onChange={(e) => setForm({ ...form, kota: e.target.value })} 
                      placeholder="e.g. Jakarta" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Komisi (%)</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="number" 
                      className="pl-10 h-12 rounded-xl border-slate-200 focus:border-blue-500 bg-slate-50/50 font-semibold"
                      value={form.komisi} 
                      onChange={(e) => setForm({ ...form, komisi: e.target.value })} 
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-8 flex gap-3">
              <Button variant="ghost" onClick={resetForm} className="rounded-xl font-bold h-12 text-slate-500">Batal</Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 flex-1 font-bold shadow-lg shadow-blue-100">
                {editingMitra ? 'Simpan Perubahan' : 'Daftarkan Mitra'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input 
          className="pl-12 h-12 rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white font-semibold text-slate-600 focus-visible:ring-blue-500"
          placeholder="Cari nama toko, kota, atau alamat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMitra.map((mitra) => (
          <Card key={mitra.id} className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl relative overflow-hidden group hover:ring-2 hover:ring-blue-100 transition-all">
            <div className="absolute top-0 right-0 p-4">
              <Badge 
                variant={mitra.aktif ? 'default' : 'secondary'} 
                className={`h-6 px-3 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  mitra.aktif ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {mitra.aktif ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Store className="h-7 w-7" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-black text-slate-900 text-lg truncate pr-16">{mitra.nama_toko}</h3>
                <div className="flex items-center gap-1 text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <MapPin className="h-3 w-3" />
                  {mitra.kota}
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2 min-h-[40px] leading-relaxed">
              {mitra.alamat}
            </p>

            <Separator className="bg-slate-50 mb-6" />

            <div className="flex items-center justify-between mb-8">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center flex-1 mr-2">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Komisi</p>
                <p className="text-xl font-black text-blue-600">{mitra.komisi}%</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center flex-1 ml-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <p className={`text-xs font-black uppercase tracking-wider ${mitra.aktif ? 'text-green-500' : 'text-slate-400'}`}>
                  {mitra.aktif ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="rounded-xl font-bold border-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 h-11 gap-2"
                onClick={() => handleEdit(mitra)}
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant={mitra.aktif ? "outline" : "default"}
                className={`rounded-xl font-bold h-11 gap-2 ${
                  mitra.aktif 
                  ? 'border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600' 
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-100'
                }`}
                onClick={() => toggleActive(mitra.id)}
              >
                <Power className="h-4 w-4" />
                {mitra.aktif ? 'Matikan' : 'Aktifkan'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
