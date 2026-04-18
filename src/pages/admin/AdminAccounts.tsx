import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';
import { Search, User as UserIcon, Mail, Shield, ShieldCheck, Loader2, PlusCircle, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAccounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-bold gap-2 transition-all active:scale-95">
          <PlusCircle className="h-5 w-5" />
          Tambah User Baru
        </Button>
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
              <Button variant="ghost" className="flex-1 h-10 rounded-xl font-bold text-slate-600 hover:bg-white hover:text-blue-600 gap-2">
                Edit Profil
              </Button>
              <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl font-bold text-slate-400 hover:bg-white hover:text-slate-600">
                <MoreVertical className="h-4 w-4" />
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
