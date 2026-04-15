import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { mockOrders, mockStatusLogs, mockMitra } from '@/lib/mock-data';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, OrderStatus } from '@/lib/types';
import { Search, WashingMachine, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function TrackingPage() {
  const [kode, setKode] = useState('');
  const [searched, setSearched] = useState(false);

  const order = mockOrders.find((o) => o.kode_order === kode);
  const logs = order ? mockStatusLogs.filter((l) => l.order_id === order.id).sort((a, b) => a.timestamp.localeCompare(b.timestamp)) : [];
  const mitra = order ? mockMitra.find((m) => m.id === order.mitra_id) : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const currentIdx = order ? ORDER_STATUS_FLOW.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <WashingMachine className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">LaundryCenter</span>
          </Link>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Lacak Laundry Anda</h1>
          <p className="text-muted-foreground">Masukkan kode order untuk melihat status terbaru</p>
        </motion.div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            value={kode}
            onChange={(e) => { setKode(e.target.value); setSearched(false); }}
            placeholder="Contoh: LD-20250414-001"
            className="text-center font-mono"
          />
          <Button type="submit"><Search className="h-4 w-4 mr-2" />Cari</Button>
        </form>

        {searched && !order && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Order dengan kode <strong>{kode}</strong> tidak ditemukan.</p>
          </Card>
        )}

        {order && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-mono text-lg font-bold">{order.kode_order}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_nama} • {mitra?.nama_toko}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Jenis</p>
                  <p className="font-medium capitalize">{order.jenis}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{order.jenis === 'kiloan' ? 'Berat' : 'Jumlah'}</p>
                  <p className="font-medium">{order.berat} {order.jenis === 'kiloan' ? 'kg' : 'item'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Harga</p>
                  <p className="font-medium">Rp {order.harga.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Masuk</p>
                  <p className="font-medium">{order.tanggal_masuk}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-6">Timeline Progress</h3>
              <div className="space-y-0">
                {ORDER_STATUS_FLOW.map((status, i) => {
                  const log = logs.find((l) => l.status === status);
                  const isCompleted = i <= currentIdx;
                  const isCurrent = i === currentIdx;

                  return (
                    <div key={status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {isCompleted ? (
                          <CheckCircle2 className={`h-5 w-5 shrink-0 ${isCurrent ? 'text-primary' : 'text-success'}`} />
                        ) : (
                          <Circle className="h-5 w-5 shrink-0 text-border" />
                        )}
                        {i < ORDER_STATUS_FLOW.length - 1 && (
                          <div className={`w-0.5 h-8 ${isCompleted ? 'bg-success' : 'bg-border'}`} />
                        )}
                      </div>
                      <div className={`pb-8 ${isCompleted ? '' : 'opacity-40'}`}>
                        <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : ''}`}>
                          {ORDER_STATUS_LABELS[status]}
                        </p>
                        {log && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
