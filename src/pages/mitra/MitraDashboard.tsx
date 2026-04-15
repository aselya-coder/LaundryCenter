import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { mockOrders, mockMitra } from '@/lib/mock-data';

const today = new Date().toISOString().split('T')[0];

export default function MitraDashboard() {
  const { mitra } = useAuth();
  if (!mitra) return null;

  const myOrders = mockOrders.filter((o) => o.mitra_id === mitra.id);
  const ordersToday = myOrders.filter((o) => o.tanggal_masuk === today);
  const activeOrders = myOrders.filter((o) => o.status !== 'selesai');
  const totalPendapatan = myOrders.reduce((sum, o) => sum + o.harga, 0);
  const totalKomisi = totalPendapatan * (mitra.komisi / 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Mitra</h1>
        <p className="text-muted-foreground text-sm">{mitra.nama_toko} • {mitra.kota}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Order Hari Ini" value={ordersToday.length} icon={Package} variant="primary" />
        <StatCard title="Order Aktif" value={activeOrders.length} icon={Clock} variant="warning" />
        <StatCard title="Total Pendapatan" value={`Rp ${totalPendapatan.toLocaleString('id-ID')}`} icon={DollarSign} variant="success" />
        <StatCard title="Komisi Anda" value={`Rp ${totalKomisi.toLocaleString('id-ID')}`} icon={CheckCircle} subtitle={`${mitra.komisi}% dari total`} />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Order Aktif</h3>
        {activeOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm">Tidak ada order aktif</p>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-mono text-sm font-medium">{order.kode_order}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_nama} • {order.jenis === 'kiloan' ? `${order.berat} kg` : `${order.berat} item`}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
