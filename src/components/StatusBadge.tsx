import { OrderStatus, ORDER_STATUS_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<OrderStatus, string> = {
  diterima_mitra: 'bg-info/10 text-info border-info/20',
  dikirim_ke_pusat: 'bg-warning/10 text-warning border-warning/20',
  diproses: 'bg-primary/10 text-primary border-primary/20',
  dicuci: 'bg-primary/10 text-primary border-primary/20',
  dikeringkan: 'bg-primary/10 text-primary border-primary/20',
  disetrika: 'bg-primary/10 text-primary border-primary/20',
  selesai_proses: 'bg-success/10 text-success border-success/20',
  dikirim_ke_mitra: 'bg-warning/10 text-warning border-warning/20',
  siap_diambil: 'bg-success/10 text-success border-success/20',
  selesai: 'bg-muted text-muted-foreground border-border',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={`${statusColors[status]} font-medium text-xs`}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
