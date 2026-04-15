import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export default function MitraSettings() {
  const { mitra, user } = useAuth();
  if (!mitra) return null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pengaturan</h1>
          <p className="text-slate-500 font-medium">Kelola informasi dan pengaturan akun Anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Informasi Akun</h3>
          <p>Nama: {user?.nama}</p>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </Card>
        <Card className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border-none">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Informasi Mitra</h3>
          <p>Nama Toko: {mitra.nama_toko}</p>
          <p>Komisi: {mitra.komisi}%</p>
        </Card>
      </div>
    </div>
  );
}