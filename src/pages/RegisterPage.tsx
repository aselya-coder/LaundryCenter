import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { WashingMachine, Lock, Mail, ArrowRight, User, Info, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Sign up user di Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: nama,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Simpan profil ke tabel 'profiles' kita
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            nama: nama,
            email: email,
            role: 'mitra' // Default role sebagai mitra
          }]);

        if (profileError) throw profileError;

        toast.success('Registrasi berhasil! Silakan cek email untuk verifikasi.');
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Gagal melakukan registrasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Back Button */}
      <Link 
        to="/login" 
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Login
      </Link>

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-blue-600 shadow-2xl shadow-blue-200 mb-6 group hover:rotate-12 transition-transform duration-300">
            <WashingMachine className="h-10 w-10 text-white" />
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Daftar Akun</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Bergabunglah dengan Jaringan LaundryCenter</p>
        </div>

        <Card className="p-10 border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem]">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nama" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="nama"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold transition-all"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                <Info className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-red-600 text-xs font-bold">{error}</p>
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-100 transition-all active:scale-[0.98] gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Daftar Sekarang
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-500 font-bold">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4">
                Masuk di sini
              </Link>
            </p>
          </div>
        </Card>
        
        <p className="text-center mt-8 text-slate-400 font-bold text-xs">
          &copy; 2026 LaundryCenter. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
