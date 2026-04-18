import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { Mitra } from '@/lib/types';
import { PlusCircle, MapPin, Percent, Search, Edit2, Power, Store, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMitra() {
  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editingMitra, setEditingMitra] = useState<Mitra | null>(null);
  const [form, setForm] = useState({ 
    nama_toko: '', 
    alamat: '', 
    kota: '', 
    komisi: '20',
    email: '',
    password: '',
    nama_owner: ''
  });

  const fetchMitra = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mitra')
        .select('*, user:profiles(nama)');
      if (error) throw error;
      setMitraList(data || []);
    } catch (err) {
      console.error('Error fetching mitra:', err);
      toast.error('Gagal mengambil data mitra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMitra();
  }, []);

  const filteredMitra = useMemo(() => {
    return mitraList.filter((m) => 
      m.nama_toko.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.kota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.alamat.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mitraList, searchTerm]);

  const handleSave = async () => {
    try {
      if (editingMitra) {
        // Update profil di tabel mitra
        const { error: mitraError } = await supabase
          .from('mitra')
          .update({
            nama_toko: form.nama_toko,
            alamat: form.alamat,
            kota: form.kota,
            komisi: Number(form.komisi),
          })
          .eq('id', editingMitra.id);
        
        if (mitraError) throw mitraError;

        // Update nama owner di tabel profiles jika ada user_id
        if (editingMitra.user_id && form.nama_owner) {
          const { error: userError } = await supabase
            .from('profiles')
            .update({ nama: form.nama_owner })
            .eq('id', editingMitra.user_id);
          
          if (userError) throw userError;
        }

        toast.success('Data mitra berhasil diperbarui');
      } else {
        // 1. Validasi form
        if (!form.email || !form.password || !form.nama_owner) {
          toast.error('Mohon isi email, password, dan nama owner untuk mitra baru');
          return;
        }

        // 2. Buat profil di tabel profiles (Akses Login)
        // Catatan: Di sistem produksi, gunakan Supabase Edge Function untuk membuat user Auth tanpa logout
        const { data: newUser, error: userError } = await supabase
          .from('profiles')
          .insert([{
            nama: form.nama_owner,
            email: form.email,
            role: 'mitra'
          }])
          .select()
          .single();
        
        if (userError) throw userError;

        // 3. Buat profil di tabel mitra
        const { error: mitraError } = await supabase
          .from('mitra')
          .insert([{
            user_id: newUser.id,
            nama_toko: form.nama_toko,
            alamat: form.alamat,
            kota: form.kota,
            komisi: Number(form.komisi),
            aktif: true,
          }]);
        
        if (mitraError) throw mitraError;
        toast.success('Akun mitra baru berhasil dibuat');
      }
      fetchMitra();
      resetForm();
    } catch (err: any) {
      console.error('Error saving mitra:', err);
      toast.error(err.message || 'Gagal menyimpan data mitra');
    }
  };

  const resetForm = () => {
    setForm({ 
      nama_toko: '', 
      alamat: '', 
      kota: '', 
      komisi: '20',
      email: '',
      password: '',
      nama_owner: ''
    });
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
      nama_owner: mitra.user?.nama || '',
      email: '', // Email dan password tidak dapat diubah di sini
      password: ''
    });
    setOpen(true);
  };

  const toggleActive = async (mitra: Mitra) => {
    try {
      const { error } = await supabase
        .from('mitra')
        .update({ aktif: !mitra.aktif })
        .eq('id', mitra.id);
      
      if (error) throw error;
      toast.success(`Mitra ${mitra.nama_toko} kini ${!mitra.aktif ? 'Aktif' : 'Nonaktif'}`);
      fetchMitra();
    } catch (err) {
      console.error('Error toggling active status:', err);
      toast.error('Gagal mengubah status aktif');
    }
  };

  if (loading && mitraList.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold">Memuat data mitra...</p>
      </div>
    );
  }

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
              <DialogDescription className="text-slate-500 font-medium text-sm">
                Lengkapi informasi outlet di bawah ini
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4 mb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Informasi Akun Login</p>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Owner / User</Label>
                  <Input value={form.nama_owner} onChange={(e) => setForm({...form, nama_owner: e.target.value})} className="h-12 rounded-xl bg-white border-none font-bold shadow-sm" placeholder="Nama Lengkap Owner" />
                </div>
                {!editingMitra && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Akun</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="h-12 rounded-xl bg-white border-none font-bold shadow-sm" placeholder="email@mitra.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Password Sementara</Label>
                      <Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="h-12 rounded-xl bg-white border-none font-bold shadow-sm" placeholder="Minimal 6 karakter" />
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Detail Toko / Outlet</p>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Toko/Outlet</Label>
                  <Input value={form.nama_toko} onChange={(e) => setForm({...form, nama_toko: e.target.value})} className="h-12 rounded-xl bg-white border-none font-bold shadow-sm" placeholder="Contoh: Laundry Express" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Kota</Label>
                  <Input value={form.kota} onChange={(e) => setForm({...form, kota: e.target.value})} className="h-12 rounded-xl bg-white border-none font-bold shadow-sm" placeholder="Contoh: Jakarta" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Alamat Lengkap</Label>
                  <Input value={form.alamat} onChange={(e) => setForm({...form, alamat: e.target.value})} className="h-12 rounded-xl bg-white border-none font-bold shadow-sm" placeholder="Jl. Raya No. 123..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Persentase Komisi (%)</Label>
                  <Input type="number" value={form.komisi} onChange={(e) => setForm({...form, komisi: e.target.value})} className="h-12 rounded-xl bg-white border-none font-bold shadow-sm" placeholder="20" />
                </div>
              </div>
              {!editingMitra && (
                <p className="text-[10px] text-slate-400 italic px-2">
                  * Mitra dapat login menggunakan email & password di atas setelah akun dibuat.
                </p>
              )}
            </div>
            <DialogFooter className="mt-8">
              <Button onClick={handleSave} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-xs">Simpan Data Mitra</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input 
          className="pl-12 h-14 rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white font-semibold text-slate-600 focus-visible:ring-blue-500"
          placeholder="Cari Mitra berdasarkan nama, kota, atau alamat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMitra.map((mitra) => (
          <Card key={mitra.id} className="p-0 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden group hover:ring-2 hover:ring-blue-100 transition-all duration-300">
            <div className="p-6 border-b border-slate-50">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Store className="h-6 w-6" />
                </div>
                <Badge className={`rounded-lg px-3 py-1 font-black uppercase text-[10px] tracking-widest border-none ${mitra.aktif ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {mitra.aktif ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">{mitra.nama_toko}</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">{mitra.kota}</span>
                </div>
                {mitra.user?.nama && (
                  <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                    {mitra.user.nama}
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Komisi</span>
                </div>
                <span className="text-lg font-black text-blue-600">{mitra.komisi}%</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50/50 flex gap-2">
              <Button onClick={() => handleEdit(mitra)} variant="ghost" className="flex-1 h-10 rounded-xl font-bold text-slate-600 hover:bg-white hover:text-blue-600 gap-2">
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button onClick={() => toggleActive(mitra)} variant="ghost" className={`flex-1 h-10 rounded-xl font-bold gap-2 ${mitra.aktif ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                <Power className="h-4 w-4" />
                {mitra.aktif ? 'Nonaktifkan' : 'Aktifkan'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}