import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { mockOrders, mockMitra } from '@/lib/mock-data';
import { DollarSign, TrendingUp, Users, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const totalTransaksi = mockOrders.reduce((sum, o) => sum + o.harga, 0);
const completedOrders = mockOrders.filter((o) => o.status === 'selesai');

const mitraReport = mockMitra.map((m) => {
  const mitraOrders = mockOrders.filter((o) => o.mitra_id === m.id);
  const total = mitraOrders.reduce((sum, o) => sum + o.harga, 0);
  const komisi = total * (m.komisi / 100);
  return { nama: m.nama_toko, total, komisi, bersih: total - komisi, orders: mitraOrders.length };
});

const totalKomisi = mitraReport.reduce((sum, m) => sum + m.komisi, 0);
const totalBersih = totalTransaksi - totalKomisi;

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
        <p className="text-muted-foreground text-sm">Ringkasan pendapatan dan komisi</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Transaksi" value={`Rp ${totalTransaksi.toLocaleString('id-ID')}`} icon={Receipt} variant="primary" />
        <StatCard title="Total Komisi Mitra" value={`Rp ${totalKomisi.toLocaleString('id-ID')}`} icon={Users} variant="warning" />
        <StatCard title="Pendapatan Bersih" value={`Rp ${totalBersih.toLocaleString('id-ID')}`} icon={DollarSign} variant="success" />
        <StatCard title="Order Selesai" value={completedOrders.length} icon={TrendingUp} />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Pendapatan per Mitra</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mitraReport}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="nama" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
            <Bar dataKey="total" name="Total" fill="hsl(217,91%,50%)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="komisi" name="Komisi" fill="hsl(38,92%,50%)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="bersih" name="Bersih" fill="hsl(152,69%,41%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Detail per Mitra</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Mitra</th>
                <th className="text-right py-3 px-2 font-medium">Order</th>
                <th className="text-right py-3 px-2 font-medium">Total</th>
                <th className="text-right py-3 px-2 font-medium">Komisi</th>
                <th className="text-right py-3 px-2 font-medium">Bersih</th>
              </tr>
            </thead>
            <tbody>
              {mitraReport.map((m) => (
                <tr key={m.nama} className="border-b border-border/50">
                  <td className="py-3 px-2 font-medium">{m.nama}</td>
                  <td className="py-3 px-2 text-right">{m.orders}</td>
                  <td className="py-3 px-2 text-right">Rp {m.total.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-2 text-right text-warning">Rp {m.komisi.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-2 text-right text-success">Rp {m.bersih.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
