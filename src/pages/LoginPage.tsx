import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { WashingMachine } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login(email, password)) {
      setError('Email tidak ditemukan. Gunakan: admin@laundry.com atau budi@mitra.com');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary mb-4">
            <WashingMachine className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">LaundryCenter</h1>
          <p className="text-muted-foreground text-sm mt-1">Sistem Manajemen Laundry Terpusat</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@laundry.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">Demo accounts:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors text-left"
                onClick={() => { setEmail('admin@laundry.com'); setPassword('demo'); }}
              >
                <p className="font-medium text-foreground">Admin</p>
                <p className="text-muted-foreground">admin@laundry.com</p>
              </button>
              <button
                type="button"
                className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors text-left"
                onClick={() => { setEmail('budi@mitra.com'); setPassword('demo'); }}
              >
                <p className="font-medium text-foreground">Mitra</p>
                <p className="text-muted-foreground">budi@mitra.com</p>
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
