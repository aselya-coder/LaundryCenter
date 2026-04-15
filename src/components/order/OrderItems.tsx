import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OrderItemsProps {
  order: Order;
}

export function OrderItems({ order }: OrderItemsProps) {
  // Since the database schema only provides total_price and not a breakdown of items,
  // we adapt the component to display the total cost directly.
  return (
    <Card className="border-none bg-white rounded-2xl p-2">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Rincian Biaya</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 pb-4">
          <div className="flex justify-between items-center text-slate-500">
            <p>Subtotal</p>
            <p>Rp {order.total_price.toLocaleString('id-ID')}</p>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <p>Pajak & Layanan</p>
            <p>Rp 0</p>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg pt-4">
          <p>Total</p>
          <p>Rp {order.total_price.toLocaleString('id-ID')}</p>
        </div>
      </CardContent>
    </Card>
  );
}