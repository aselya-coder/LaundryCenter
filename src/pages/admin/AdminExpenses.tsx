import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Receipt, 
  Calendar as CalendarIcon, 
  Trash2, 
  Loader2, 
  DollarSign,
  Tag,
  AlignLeft,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Expense {
  id: string;
  tanggal: string;
  kategori: string;
  jumlah: number;
  keterangan: string;
  created_at: string;
}

const CATEGORIES = [
  'Deterjen & Kimia',
  'Listrik & Air',
  'Sewa Tempat',
  'Gaji Karyawan',
  'Peralatan & Service',
  'Transportasi',
  'Lain-lain'
];

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: CATEGORIES[0],
    jumlah: '',
    keterangan: ''
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      toast.error('Gagal mengambil data pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('expenses')
        .insert([{
          tanggal: form.tanggal,
          kategori: form.kategori,
          jumlah: Number(form.jumlah),
          keterangan: form.keterangan
        }]);

      if (error) throw error;

      toast.success('Pengeluaran berhasil dicatat');
      setShowAddModal(false);
      setForm({
        tanggal: new Date().toISOString().split('T')[0],
        kategori: CATEGORIES[0],
        jumlah: '',
        keterangan: ''
      });
      fetchExpenses();
    } catch (err: any) {
      console.error('Error saving expense:', err);
      toast.error('Gagal menyimpan pengeluaran');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return;
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Catatan berhasil dihapus');
      fetchExpenses();
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      toast.error('Gagal menghapus catatan');
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.keterangan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.jumlah, 0);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Pengeluaran</h1>
          <p className="text-slate-500 font-medium">Catat dan pantau semua biaya operasional pusat</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-bold gap-2 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Catat Pengeluaran
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white rounded-3xl group overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <DollarSign className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 mb-4">
              <Receipt className="h-5 w-5" />
            </div>
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Pengeluaran (Filter)</p>
            <h3 className="text-3xl font-black">Rp {totalExpense.toLocaleString('id-ID')}</h3>
          </div>
        </Card>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input 
          className="pl-12 h-12 rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white font-semibold text-slate-600 focus-visible:ring-blue-500"
          placeholder="Cari kategori atau keterangan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold">Memuat data...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <Card className="p-20 text-center border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada catatan</h3>
          <p className="text-slate-500 font-medium">Klik tombol "Catat Pengeluaran" untuk mulai.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-2xl group hover:ring-2 hover:ring-blue-100 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                        {expense.kategori}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(new Date(expense.tanggal), 'dd MMMM yyyy', { locale: id })}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">{expense.keterangan || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-lg font-black text-slate-900">Rp {expense.jumlah.toLocaleString('id-ID')}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(expense.id)}
                    className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Add Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-lg p-8 border-none shadow-2xl bg-white rounded-[2.5rem] relative">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <Receipt className="h-6 w-6 text-blue-600" />
              Catat Pengeluaran
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tanggal</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type="date"
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold shadow-sm transition-all"
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Kategori</Label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select 
                    className="w-full pl-12 pr-4 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold shadow-sm transition-all appearance-none outline-none"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Jumlah (Rp)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type="number"
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-black text-lg shadow-sm transition-all"
                    placeholder="0"
                    value={form.jumlah}
                    onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Keterangan (Opsional)</Label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <Textarea 
                    className="pl-12 min-h-[100px] rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 font-semibold shadow-sm transition-all resize-none"
                    placeholder="Contoh: Beli sabun cair 20 liter"
                    value={form.keterangan}
                    onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95 gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Simpan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
