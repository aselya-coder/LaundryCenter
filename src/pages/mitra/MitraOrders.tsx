import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { mockOrders } from '@/lib/mock-data';

export default function MitraOrders() {
  const { mitra } = useAuth();
  if (!mitra) return null;

  const myOrders = mockOrders.filter((o) => o.mitra_id === mitra.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Order</h1>
        <p className="text-muted-foreground text-sm">{myOrders.length} order</p>
      </div>

      <Card className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Kode</th>
                <th className="text-left py-3 px-2 font-medium">Customer</th>
                <th className="text-left py-3 px-2 font-medium">Jenis</th>
                <th className="text-right py-3 px-2 font-medium">Harga</th>
                <th className="text-left py-3 px-2 font-medium">Tanggal</th>
                <th className="text-left py-3 px-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs">{order.kode_order}</td>
                  <td className="py-3 px-2">{order.customer_nama}</td>
                  <td className="py-3 px-2 capitalize">{order.jenis}</td>
                  <td className="py-3 px-2 text-right">Rp {order.harga.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-2 text-muted-foreground">{order.tanggal_masuk}</td>
                  <td className="py-3 px-2"><StatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
