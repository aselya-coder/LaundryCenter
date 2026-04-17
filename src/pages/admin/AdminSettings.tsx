import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { User, Shield, Bell, Globe, Save, LogOut, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
  });

  const handleSaveProfile = () => {
    // In a real app, you would call an API here
    toast.success('Profil berhasil diperbarui!');
    setIsEditing(false);
  };

  const handleGantiPassword = () => {
    toast.info('Fitur ganti password sedang dikembangkan');
  };

  const handleToggleNotification = (type: string) => {
    toast.success(`Notifikasi ${type} diperbarui`);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pengaturan Admin</h1>
          <p className="text-slate-500 font-medium text-lg">Kelola konfigurasi sistem dan akun administrator</p>
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
        {/* Profile Section */}
        <Card className="lg:col-span-2 p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <User className="h-32 w-32" />
          </div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Profil Administrator</h3>
                <p className="text-slate-400 text-sm font-medium">Informasi personal akun Anda</p>
              </div>
            </div>
            {!isEditing ? (
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(true)}
                className="font-bold text-blue-600 hover:bg-blue-50 rounded-xl"
              >
                Edit Profil
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
                  onClick={handleSaveProfile}
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
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</Label>
              {isEditing ? (
                <Input 
                  value={profileForm.nama} 
                  onChange={(e) => setProfileForm({...profileForm, nama: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold focus-visible:ring-blue-500"
                />
              ) : (
                <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl font-bold text-slate-700 border border-transparent">
                  {user?.nama}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Administrator</Label>
              {isEditing ? (
                <Input 
                  value={profileForm.email} 
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold focus-visible:ring-blue-500"
                />
              ) : (
                <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl font-bold text-slate-700 border border-transparent">
                  {user?.email}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Hak Akses / Role</Label>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-100">
                  {user?.role}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 italic">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Verified Admin Account
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Security & Quick Actions */}
        <div className="space-y-6">
          <Card className="p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none group hover:ring-2 hover:ring-orange-100 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Keamanan</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Kelola otentikasi dua faktor dan ubah password administrator secara berkala.</p>
            <Button 
              variant="outline" 
              onClick={handleGantiPassword}
              className="w-full h-12 rounded-xl font-bold border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-orange-600 gap-2 transition-all"
            >
              Ubah Password Sekarang
            </Button>
          </Card>

          <Card className="p-8 bg-slate-900 text-white rounded-3xl shadow-xl shadow-slate-200/50 border-none relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 backdrop-blur-md">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Status Sistem</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Server Jakarta</span>
                  <span className="flex items-center gap-1.5 text-green-400 font-bold">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Supabase DB</span>
                  <span className="flex items-center gap-1.5 text-green-400 font-bold">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Connected
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full h-10 rounded-xl font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all text-xs uppercase tracking-widest mt-2"
                >
                  Lihat Log Aktivitas
                </Button>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <Globe className="h-32 w-32" />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none group">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Notifikasi Sistem</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Email Report Harian</p>
                <p className="text-xs text-slate-400">Terima ringkasan transaksi setiap pagi</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => handleToggleNotification('Harian')}
                className="text-xs font-black text-blue-600 hover:bg-white"
              >
                AKTIF
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Alert Error Sistem</p>
                <p className="text-xs text-slate-400">Pemberitahuan real-time jika ada anomali</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => handleToggleNotification('Error')}
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
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Log Login Terakhir</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  Chrome
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Jakarta, Indonesia</p>
                  <p className="text-[10px] text-slate-400">IP: 182.253.xx.xx</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Sekarang</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  Safari
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Bandung, Indonesia</p>
                  <p className="text-[10px] text-slate-400">IP: 114.125.xx.xx</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">2 Jam Lalu</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
