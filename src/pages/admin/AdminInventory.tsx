import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Inventory, StockLog } from '@/lib/types';
import { 
  Package, 
  Plus, 
  Minus, 
  History, 
  AlertTriangle, 
  Search, 
  Loader2, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Tag,
  Settings2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AdminInventory() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [openAdd, setOpenAdd] = useState(false);
  const [openStock, setOpenStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [stockAction, setStockAction] = useState<'masuk' | 'keluar'>('masuk');
  
  const [form, setForm] = useState({
    nama: '',
    stok: '0',
    satuan: 'liter',
    min_stok: '5',
    kategori: 'Sabun'
  });

  const [stockForm, setStockForm] = useState({
    jumlah: '',
    keterangan: ''
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data: invData, error: invError } = await supabase
        .from('inventory')
        .select('*')
        .order('nama', { ascending: true });

      if (invError) throw invError;
      setInventory(invData || []);

      const { data: logData, error: logError } = await supabase
        .from('inventory_logs')
        .select('*, inventory(nama)')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (logError) throw logError;
      setLogs(logData || []);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      toast.error('Gagal mengambil data inventaris');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSaveItem = async () => {
    if (!form.nama || !form.satuan) {
      toast.error('Mohon lengkapi data barang');
      return;
    }

    try {
      const { error } = await supabase
        .from('inventory')
        .insert([{
          nama: form.nama,
          stok: Number(form.stok),
          satuan: form.satuan,
          min_stok: Number(form.min_stok),
          kategori: form.kategori
        }]);

      if (error) throw error;
      toast.success('Barang berhasil ditambahkan');
      setOpenAdd(false);
      setForm({ nama: '', stok: '0', satuan: 'liter', min_stok: '5', kategori: 'Sabun' });
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan barang');
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedItem || !stockForm.jumlah) return;

    try {
      const jumlahNum = Number(stockForm.jumlah);
      const newStok = stockAction === 'masuk' 
        ? selectedItem.stok + jumlahNum 
        : selectedItem.stok - jumlahNum;

      if (newStok < 0) {
        toast.error('Stok tidak cukup');
        return;
      }

      // 1. Update stok di tabel inventory
      const { error: invError } = await supabase
        .from('inventory')
        .update({ stok: newStok, updated_at: new Date().toISOString() })
        .eq('id', selectedItem.id);

      if (invError) throw invError;

      // 2. Catat log
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert([{
          inventory_id: selectedItem.id,
          jumlah: jumlahNum,
          tipe: stockAction,
          keterangan: stockForm.keterangan
        }]);

      if (logError) throw logError;

      toast.success(`Stok ${selectedItem.nama} berhasil diperbarui`);
      setOpenStock(false);
      setStockForm({ jumlah: '', keterangan: '' });
      fetchInventory();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui stok');
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stok Bahan Baku</h1>
          <p className="text-slate-500 font-medium">Manajemen deterjen, pewangi, dan perlengkapan pusat</p>
        </div>
        <Button 
          onClick={() => setOpenAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-100 font-bold gap-2 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Tambah Barang Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Item</p>
            <h3 className="text-2xl font-black text-slate-900">{inventory.length}</h3>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-red-100 bg-white rounded-3xl flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Stok Menipis</p>
            <h3 className="text-2xl font-black text-red-600">{inventory.filter(i => i.stok <= i.min_stok).length}</h3>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
            <History className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Update Terakhir</p>
            <h3 className="text-sm font-black text-slate-900">
              {logs[0] ? new Date(logs[0].created_at).toLocaleDateString('id-ID') : '-'}
            </h3>
          </div>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input 
          className="pl-12 h-14 rounded-2xl border-none shadow-xl shadow-slate-200/50 bg-white font-semibold text-slate-600 focus-visible:ring-blue-500"
          placeholder="Cari nama barang atau kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold">Memuat data inventaris...</p>
          </div>
        ) : filteredInventory.map((item) => (
          <Card key={item.id} className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl group hover:ring-2 hover:ring-blue-100 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${item.stok <= item.min_stok ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                <Package className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="rounded-lg font-black uppercase text-[10px] tracking-widest text-slate-400 border-slate-100">
                {item.kategori}
              </Badge>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-1">{item.nama}</h3>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stok Tersedia</p>
                <p className={`text-3xl font-black ${item.stok <= item.min_stok ? 'text-red-600' : 'text-slate-900'}`}>
                  {item.stok} <span className="text-sm text-slate-400 font-bold uppercase">{item.satuan}</span>
                </p>
              </div>
              {item.stok <= item.min_stok && (
                <div className="flex items-center gap-1 text-red-500 animate-pulse mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">Low</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => { setSelectedItem(item); setStockAction('masuk'); setOpenStock(true); }}
                variant="ghost" 
                className="h-11 rounded-xl bg-slate-50 font-bold text-slate-600 hover:bg-green-50 hover:text-green-600 gap-2 transition-all"
              >
                <Plus className="h-4 w-4" /> Stok
              </Button>
              <Button 
                onClick={() => { setSelectedItem(item); setStockAction('keluar'); setOpenStock(true); }}
                variant="ghost" 
                className="h-11 rounded-xl bg-slate-50 font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 gap-2 transition-all"
              >
                <Minus className="h-4 w-4" /> Pakai
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog Tambah Barang */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900">Tambah Barang Baru</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-sm">Input bahan baku laundry yang akan dikelola stoknya.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Barang</Label>
              <Input value={form.nama} onChange={(e) => setForm({...form, nama: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold shadow-sm" placeholder="Contoh: Deterjen Cair" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Satuan</Label>
                <select 
                  value={form.satuan} 
                  onChange={(e) => setForm({...form, satuan: e.target.value})}
                  className="w-full h-12 rounded-xl bg-slate-50 border-none font-bold shadow-sm px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="liter">Liter</option>
                  <option value="kg">Kg</option>
                  <option value="pcs">Pcs</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Kategori</Label>
                <select 
                  value={form.kategori} 
                  onChange={(e) => setForm({...form, kategori: e.target.value})}
                  className="w-full h-12 rounded-xl bg-slate-50 border-none font-bold shadow-sm px-4 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Sabun">Sabun/Chemical</option>
                  <option value="Packing">Packing</option>
                  <option value="Perlengkapan">Perlengkapan</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Stok Awal</Label>
                <Input type="number" value={form.stok} onChange={(e) => setForm({...form, stok: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Min. Stok (Alert)</Label>
                <Input type="number" value={form.min_stok} onChange={(e) => setForm({...form, min_stok: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold shadow-sm" />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button onClick={handleSaveItem} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-xs">Simpan Barang</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Update Stok */}
      <Dialog open={openStock} onOpenChange={setOpenStock}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
              {stockAction === 'masuk' ? <ArrowUpCircle className="h-6 w-6 text-green-500" /> : <ArrowDownCircle className="h-6 w-6 text-red-500" />}
              Stok {stockAction === 'masuk' ? 'Masuk' : 'Keluar'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-sm">
              Perbarui jumlah stok untuk <strong>{selectedItem?.nama}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Jumlah ({selectedItem?.satuan})</Label>
              <Input type="number" value={stockForm.jumlah} onChange={(e) => setStockForm({...stockForm, jumlah: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-black text-lg shadow-sm" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Keterangan</Label>
              <Input value={stockForm.keterangan} onChange={(e) => setStockForm({...stockForm, keterangan: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold shadow-sm" placeholder="Contoh: Pembelian baru / Digunakan cuci 50kg" />
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button onClick={handleUpdateStock} className={`w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs ${stockAction === 'masuk' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
              Konfirmasi {stockAction === 'masuk' ? 'Stok Masuk' : 'Stok Keluar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
