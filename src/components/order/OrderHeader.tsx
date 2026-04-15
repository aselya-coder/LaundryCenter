import { Order } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface OrderHeaderProps {
  order: Order;
}

export function OrderHeader({ order }: OrderHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Detail Order #{order.id}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Terakhir Diperbarui: {format(new Date(order.updated_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
        </p>
      </div>
      <div className="mt-4 sm:mt-0">
        <StatusBadge status={order.status} className="text-sm px-4 py-2 shadow-md" />
      </div>
    </div>
  );
}