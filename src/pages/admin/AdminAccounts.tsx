import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';
import { Search, User as UserIcon, Mail, Shield, ShieldCheck, Loader2, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    id: '',
    nama: '',
    email: '',
    role: 'mitra' as 'admin' | 'mitra'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Gagal mengambil data akun');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async () => {
    try {
      if (editingUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            id: form.id || editingUser.id, // Izinkan update ID jika perlu sinkronisasi manual
            nama: form.nama,
            role: form.role
          })
          .eq('id', editingUser.id);
        
        if (error) throw error;
        toast.success('Akun berhasil diperbarui');
      } else {
        const insertData: any = {
          nama: form.nama,
          email: form.email,
          role: form.role
        };
        
        if (form.id) insertData.id = form.id; // Gunakan ID dari Auth jika disediakan

        const { error } = await supabase
          .from('profiles')
          .insert([insertData]);
        
        if (error) throw error;
        toast.success('Profil akun baru berhasil dibuat');
      }
      fetchUsers();
      setOpen(false);
      setEditingUser(null);
      setForm({ id: '', nama: '', email: '', role: 'mitra' }); // Kosongkan form setelah simpan berhasil
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun ini? Data terkait mungkin juga akan terhapus.')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Akun berhasil dihapus');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus akun');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role
    });
    setOpen(true);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => 
      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (loading && users.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold">Memuat data akun...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Daftar Akun Sistem</h1>
          <p className="text-slate-500 font-medium">Kelola akses Administrator dan Mitra LaundryCenter</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => { if(!val) { setEditingUser(null); setForm({id: '', nama:'', email:'', role:'mitra'}); } setOpen(val); }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-bold gap-2 transition-all active:scale-95">
              <PlusCircle className="h-5 w-5" />
              Tambah User Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-slate-900">
                {editingUser ? 'Edit Profil Akun' : 'Tambah Profil Akun'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium text-sm">
                {editingUser ? 'Perbarui informasi profil pengguna' : 'Buat profil baru untuk email yang sudah terdaftar di Supabase Auth'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">User ID (UUID dari Supabase Auth)</Label>
                <Input value={form.id} onChange={(e) => setForm({...form, id: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold shadow-sm" placeholder="Contoh: 1a2b3c4d-..." />
                <p className="text-[10px] text-slate-400 font-medium px-1">Opsional: Isi jika ingin sinkronisasi manual dengan Auth</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Lengkap</Label>
                <Input value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold shadow-sm" placeholder="Nama User" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Email</Label>
                <Input disabled={!!editingUser} value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold shadow-sm disabled:opacity-50" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Role / Hak Akses</Label>
                <select 
                  value={form.role} 
                  onChange={(e) => setForm({...form, role: e.target.value as any})}
                  className="w-full h-12 rounded-xl bg-slate-50 border-none font-bold shadow-sm px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="mitra">Mitra</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button onClick={handleSave} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-xs">
                {editingUser ? 'Perbarui Akun' : 'Simpan Profil Akun'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input 
          className="pl-12 h-14 rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white font-semibold text-slate-600 focus-visible:ring-blue-500"
          placeholder="Cari berdasarkan nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-0 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl overflow-hidden group hover:ring-2 hover:ring-blue-100 transition-all duration-300">
            <div className="p-6 border-b border-slate-50">
              <div className="flex items-start justify-between mb-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
                  user.role === 'admin' 
                  ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
                  : 'bg-slate-50 text-slate-600 group-hover:bg-slate-600 group-hover:text-white'
                }`}>
                  {user.role === 'admin' ? <ShieldCheck className="h-7 w-7" /> : <UserIcon className="h-7 w-7" />}
                </div>
                <Badge className={`rounded-lg px-3 py-1 font-black uppercase text-[10px] tracking-widest border-none ${
                  user.role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {user.role}
                </Badge>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1 truncate">{user.nama}</h3>
              <div className="flex items-center gap-2 text-slate-400 mb-6">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="text-xs font-bold truncate">{user.email}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Akun</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">#{user.id.slice(0, 8)}</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50/50 flex gap-2">
              <Button onClick={() => handleEdit(user)} variant="ghost" className="flex-1 h-10 rounded-xl font-bold text-slate-600 hover:bg-white hover:text-blue-600 gap-2">
                <Edit2 className="h-4 w-4" />
                Edit Profil
              </Button>
              <Button onClick={() => handleDelete(user.id)} variant="ghost" className="h-10 w-10 p-0 rounded-xl font-bold text-red-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="p-20 text-center border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">User Tidak Ditemukan</h3>
          <p className="text-slate-500 font-medium">Coba gunakan kata kunci pencarian lain.</p>
        </Card>
      )}
    </div>
  );
}
