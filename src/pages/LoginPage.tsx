import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { WashingMachine, Lock, Mail, ArrowRight, ShieldCheck, Store, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email atau password salah. Cek akun demo di bawah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">LaundryCenter</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sistem Manajemen Laundry Terpusat</p>
        </div>

        <Card className="p-10 border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem]">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400">Kata Sandi</Label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Lupa Password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
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
                  Masuk ke Dashboard
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50">
            <div className="flex items-center gap-2 mb-4 ml-1">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Akun Demo Akses Cepat</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left"
                onClick={() => { setEmail('admin@laundry.com'); setPassword('demo'); }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <p className="font-black text-slate-900 text-xs uppercase tracking-wider">Admin Pusat</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 truncate transition-colors">admin@laundry.com</p>
              </button>
              <button
                type="button"
                className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all text-left"
                onClick={() => { setEmail('budi@mitra.com'); setPassword('demo'); }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Store className="h-3.5 w-3.5 text-orange-500" />
                  <p className="font-black text-slate-900 text-xs uppercase tracking-wider">Mitra Outlet</p>
                </div>
                <p className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 truncate transition-colors">budi@mitra.com</p>
              </button>
            </div>
          </div>
        </Card>
        
        <p className="text-center mt-8 text-slate-400 font-bold text-xs">
          &copy; 2026 LaundryCenter. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
