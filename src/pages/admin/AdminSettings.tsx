import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Service } from '@/lib/types';
import { toast } from 'sonner';
import { PlusCircle, Edit2, Trash2, Save, X, Loader2, Tag, DollarSign, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function AdminSettings() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState({
    nama: '',
    harga: '',
    satuan: 'kg' as 'kg' | 'pcs',
    kategori: 'kiloan' as 'kiloan' | 'satuan',
    aktif: true
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('kategori', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      toast.error('Gagal mengambil data layanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async () => {
    if (!form.nama || !form.harga) {
      toast.error('Mohon lengkapi data layanan');
      return;
    }

    try {
      // Cek apakah nama layanan sudah ada (untuk mencegah duplikat)
      const isDuplicate = services.some(s => 
        s.nama.toLowerCase() === form.nama.toLowerCase() && 
        (!editingService || s.id !== editingService.id)
      );

      if (isDuplicate) {
        toast.error(`Layanan dengan nama "${form.nama}" sudah ada.`);
        return;
      }

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update({
            nama: form.nama,
            harga: Number(form.harga),
            satuan: form.satuan,
            kategori: form.kategori,
            aktif: form.aktif
          })
          .eq('id', editingService.id);
        
        if (error) throw error;
        toast.success('Layanan berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('services')
          .insert([{
            nama: form.nama,
            harga: Number(form.harga),
            satuan: form.satuan,
            kategori: form.kategori,
            aktif: true
          }]);
        
        if (error) throw error;
        toast.success('Layanan baru berhasil ditambahkan');
      }
      
      fetchServices();
      setOpenOpenDialog(false);
      resetForm();
    } catch (err: any) {
      console.error('Error saving service:', err);
      toast.error(err.message || 'Gagal menyimpan layanan');
    }
  };

  const resetForm = () => {
    setForm({
      nama: '',
      harga: '',
      satuan: 'kg',
      kategori: 'kiloan',
      aktif: true
    });
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setForm({
      nama: service.nama,
      harga: String(service.harga),
      satuan: service.satuan,
      kategori: service.kategori,
      aktif: service.aktif
    });
    setOpenOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return;

    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      toast.success('Layanan berhasil dihapus');
      fetchServices();
    } catch (err: any) {
      toast.error('Gagal menghapus layanan');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pengaturan Sistem</h1>
          <p className="text-slate-500 font-medium">Kelola daftar layanan, harga, dan konfigurasi aplikasi</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setOpenOpenDialog(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-bold gap-2 transition-all active:scale-95"
        >
          <PlusCircle className="h-5 w-5" />
          Tambah Layanan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="p-8 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Tag className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Manajemen Layanan & Harga</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="text-left py-4 px-2">Nama Layanan</th>
                  <th className="text-left py-4 px-2">Kategori</th>
                  <th className="text-left py-4 px-2">Harga</th>
                  <th className="text-left py-4 px-2">Satuan</th>
                  <th className="text-left py-4 px-2">Status</th>
                  <th className="text-right py-4 px-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-2" />
                      <p className="text-slate-400 font-bold text-sm">Memuat data layanan...</p>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400 font-medium">
                      Belum ada layanan yang terdaftar.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-2 font-bold text-slate-900">{service.nama}</td>
                      <td className="py-4 px-2">
                        <Badge variant="outline" className={`rounded-lg font-black uppercase text-[10px] tracking-widest ${service.kategori === 'kiloan' ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-purple-600 bg-purple-50 border-purple-100'}`}>
                          {service.kategori}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 font-black text-slate-900">Rp {service.harga.toLocaleString('id-ID')}</td>
                      <td className="py-4 px-2 text-slate-500 font-bold text-sm">per {service.satuan}</td>
                      <td className="py-4 px-2">
                        <Badge className={`rounded-lg px-3 py-1 font-black uppercase text-[10px] tracking-widest border-none ${service.aktif ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {service.aktif ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenOpenDialog}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">
              {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Atur nama, kategori, dan harga layanan laundry
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Layanan</Label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  value={form.nama} 
                  onChange={(e) => setForm({...form, nama: e.target.value})}
                  className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold transition-all shadow-sm"
                  placeholder="e.g. Cuci Lipat Reguler"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Kategori</Label>
                <select 
                  value={form.kategori}
                  onChange={(e) => setForm({...form, kategori: e.target.value as any, satuan: e.target.value === 'kiloan' ? 'kg' : 'pcs'})}
                  className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50 px-4 font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="kiloan">Kiloan</option>
                  <option value="satuan">Satuan</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Satuan</Label>
                <select 
                  value={form.satuan}
                  onChange={(e) => setForm({...form, satuan: e.target.value as any})}
                  className="w-full h-14 rounded-2xl border-slate-100 bg-slate-50 px-4 font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="kg">Per Kilogram (kg)</option>
                  <option value="pcs">Per Potong (pcs)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Harga Layanan (Rp)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  type="number"
                  value={form.harga} 
                  onChange={(e) => setForm({...form, harga: e.target.value})}
                  className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold transition-all shadow-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-3">
            <Button variant="ghost" onClick={() => setOpenOpenDialog(false)} className="rounded-xl font-bold h-12">Batal</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-xs px-8 h-12 shadow-lg shadow-blue-100">
              Simpan Layanan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
