import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { Store, User, Shield, Bell, MapPin, Percent, Save, LogOut, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MitraSettings() {
  const { mitra, user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [mitraForm, setMitraForm] = useState({
    nama_toko: mitra?.nama_toko || '',
    alamat: mitra?.alamat || '',
    kota: mitra?.kota || '',
  });

  if (!mitra) return null;

  const handleSaveMitra = () => {
    // In a real app, update Supabase here
    toast.success('Informasi toko berhasil diperbarui!');
    setIsEditing(false);
  };

  const handleToggleNotification = (type: string) => {
    toast.success(`Notifikasi ${type} diperbarui`);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pengaturan Mitra</h1>
          <p className="text-slate-500 font-medium text-lg">Kelola informasi outlet dan akun operasional Anda</p>
        </div>
        <Button 
          variant="outline" 
          onClick={logout}
          className="rounded-2xl h-12 px-6 font-bold border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 transition-all active:scale-95"
        >
          <LogOut className="h-5 w-5" />
          Keluar Akun
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mitra Shop Info */}
        <Card className="lg:col-span-2 p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Store className="h-32 w-32" />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                <Store className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Informasi Outlet</h3>
                <p className="text-slate-400 text-sm font-medium">Detail profil toko yang dilihat oleh pusat</p>
              </div>
            </div>
            {!isEditing ? (
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(true)}
                className="font-bold text-blue-600 hover:bg-blue-50 rounded-xl"
              >
                Edit Toko
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsEditing(false)}
                  className="font-bold text-slate-400 hover:bg-slate-50 rounded-xl"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleSaveMitra}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 px-6"
                >
                  <Save className="h-4 w-4" />
                  Simpan
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Toko / Outlet</Label>
              {isEditing ? (
                <Input 
                  value={mitraForm.nama_toko} 
                  onChange={(e) => setMitraForm({...mitraForm, nama_toko: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold focus-visible:ring-blue-500"
                />
              ) : (
                <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl font-bold text-slate-700 border border-transparent">
                  {mitra.nama_toko}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Kota Operasional</Label>
              {isEditing ? (
                <Input 
                  value={mitraForm.kota} 
                  onChange={(e) => setMitraForm({...mitraForm, kota: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold focus-visible:ring-blue-500"
                />
              ) : (
                <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl font-bold text-slate-700 border border-transparent">
                  {mitra.kota}
                </div>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Lengkap</Label>
              {isEditing ? (
                <Input 
                  value={mitraForm.alamat} 
                  onChange={(e) => setMitraForm({...mitraForm, alamat: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold focus-visible:ring-blue-500"
                />
              ) : (
                <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl font-bold text-slate-700 border border-transparent">
                  <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                  {mitra.alamat}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Commission & Quick Stats */}
        <div className="space-y-6">
          <Card className="p-8 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200 border-none relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                  <Percent className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Skema Komisi</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">Persentase keuntungan yang Anda peroleh dari setiap transaksi.</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black">{mitra.komisi}</span>
                <span className="text-xl font-bold text-blue-200">%</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mt-6">Ditetapkan oleh Pusat</p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <Percent className="h-32 w-32" />
            </div>
          </Card>

          <Card className="p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none group">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Keamanan</h3>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl font-bold border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-orange-600 gap-2 transition-all"
            >
              Ubah Password
            </Button>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none group">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Notifikasi WhatsApp</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Update Status ke Customer</p>
                <p className="text-xs text-slate-400">Kirim WA otomatis saat status berubah</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => handleToggleNotification('WhatsApp')}
                className="text-xs font-black text-blue-600 hover:bg-white"
              >
                AKTIF
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none group">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
              <User className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Informasi Akun</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm font-medium">Nama User</span>
              <span className="text-sm font-bold text-slate-900">{user?.nama}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm font-medium">Email Terdaftar</span>
              <span className="text-sm font-bold text-slate-900">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm font-medium">Status Akun</span>
              <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg">
                <CheckCircle2 className="h-3 w-3" />
                Mitra Aktif
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}