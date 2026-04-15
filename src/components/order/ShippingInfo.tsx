import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ShippingInfoProps {
  order: Order;
}

const formatStatus = (status: string) => {
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function ShippingInfo({ order }: ShippingInfoProps) {
  // Since we only have the latest status, we display that as the only entry in the timeline.
  const lastStatus = {
    id: order.id,
    status: order.status,
    timestamp: order.updated_at,
  };

  return (
    <Card className="border-none bg-white rounded-2xl p-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Truck className="h-5 w-5 text-blue-600" />
          Riwayat Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div key={lastStatus.id} className="relative pl-5 pb-6 last:pb-0">
            {/* Dot */}
            <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-blue-600" />
            {/* Content */}
            <p className="font-bold text-slate-800">{formatStatus(lastStatus.status)}</p>
            <p className="text-sm text-slate-500">
              {format(new Date(lastStatus.timestamp), 'dd MMMM yyyy, HH:mm', { locale: id })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}