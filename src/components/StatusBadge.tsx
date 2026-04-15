import { OrderStatus, ORDER_STATUS_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<OrderStatus, string> = {
  diterima_mitra: 'bg-blue-50 text-blue-600 border-blue-100',
  dikirim_ke_pusat: 'bg-amber-50 text-amber-600 border-amber-100',
  diproses: 'bg-violet-50 text-violet-600 border-violet-100',
  dicuci: 'bg-blue-50 text-blue-600 border-blue-100',
  dikeringkan: 'bg-sky-50 text-sky-600 border-sky-100',
  disetrika: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  selesai_pusat: 'bg-green-50 text-green-600 border-green-100',
  dikirim_ke_mitra: 'bg-amber-50 text-amber-600 border-amber-100',
  siap_diambil: 'bg-green-50 text-green-600 border-green-100',
  selesai_closed: 'bg-slate-100 text-slate-500 border-slate-200',
};

export function StatusBadge({ status, className = '' }: { status: OrderStatus; className?: string }) {
  return (
    <Badge variant="outline" className={`${statusColors[status]} font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border ${className}`}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
