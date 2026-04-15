import { Package, DollarSign, Users, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { mockOrders, mockMitra, mockTransaksi } from '@/lib/mock-data';
import { ORDER_STATUS_LABELS, OrderStatus } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const today = new Date().toISOString().split('T')[0];
const ordersToday = mockOrders.filter((o) => o.tanggal_masuk === today);
const totalRevenue = mockOrders.reduce((sum, o) => sum + o.harga, 0);

const statusCounts = mockOrders.reduce((acc, o) => {
  acc[o.status] = (acc[o.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const chartData = Object.entries(statusCounts).map(([status, count]) => ({
  name: ORDER_STATUS_LABELS[status as OrderStatus],
  value: count,
}));

const cityData = mockMitra.reduce((acc, m) => {
  acc[m.kota] = (acc[m.kota] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const cityChartData = Object.entries(cityData).map(([kota, count]) => ({ name: kota, value: count }));
const COLORS = ['hsl(217,91%,50%)', 'hsl(152,69%,41%)', 'hsl(38,92%,50%)', 'hsl(199,89%,48%)'];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground text-sm">Ringkasan operasional laundry pusat</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Order Hari Ini" value={ordersToday.length} icon={Package} variant="primary" />
        <StatCard title="Total Pendapatan" value={`Rp ${totalRevenue.toLocaleString('id-ID')}`} icon={DollarSign} variant="success" />
        <StatCard title="Total Mitra" value={mockMitra.filter((m) => m.aktif).length} icon={Users} variant="warning" />
        <StatCard title="Order Selesai" value={mockOrders.filter((o) => o.status === 'selesai').length} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Order Berdasarkan Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(217,91%,50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4">Distribusi Mitra per Kota</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={cityChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {cityChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Order Terbaru</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Kode</th>
                <th className="text-left py-3 px-2 font-medium">Customer</th>
                <th className="text-left py-3 px-2 font-medium">Mitra</th>
                <th className="text-left py-3 px-2 font-medium">Harga</th>
                <th className="text-left py-3 px-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.slice(0, 5).map((order) => {
                const mitra = mockMitra.find((m) => m.id === order.mitra_id);
                return (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs">{order.kode_order}</td>
                    <td className="py-3 px-2">{order.customer_nama}</td>
                    <td className="py-3 px-2 text-muted-foreground">{mitra?.nama_toko}</td>
                    <td className="py-3 px-2">Rp {order.harga.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-2"><StatusBadge status={order.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
