import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { mockOrders, mockMitra } from '@/lib/mock-data';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW, OrderStatus } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus);

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, tanggal_selesai: newStatus === 'selesai' ? new Date().toISOString().split('T')[0] : o.tanggal_selesai }
          : o
      )
    );
    toast.success(`Status diperbarui ke "${ORDER_STATUS_LABELS[newStatus]}"`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Semua Order</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} order</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {ORDER_STATUS_FLOW.map((s) => (
              <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((order) => {
          const mitra = mockMitra.find((m) => m.id === order.mitra_id);
          const currentIdx = ORDER_STATUS_FLOW.indexOf(order.status);
          const nextStatus = currentIdx < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[currentIdx + 1] : null;

          return (
            <Card key={order.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{order.kode_order}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm">{order.customer_nama} • {order.customer_hp}</p>
                  <p className="text-xs text-muted-foreground">
                    {mitra?.nama_toko} • {order.jenis === 'kiloan' ? `${order.berat} kg` : `${order.berat} item`} • Rp {order.harga.toLocaleString('id-ID')}
                  </p>
                </div>
                {nextStatus && (
                  <Button size="sm" onClick={() => updateStatus(order.id, nextStatus)}>
                    → {ORDER_STATUS_LABELS[nextStatus]}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
