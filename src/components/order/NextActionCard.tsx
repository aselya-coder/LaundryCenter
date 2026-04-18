import { useState } from 'react';
import { Order, OrderStatus, STATUS_RESPONSIBILITY } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ArrowRight, Clock } from 'lucide-react';

// Mendefinisikan siklus hidup lengkap sebuah pesanan
const allStatuses: OrderStatus[] = [
  'diterima_mitra',
  'dikirim_ke_pusat',
  'diproses',
  'dicuci',
  'dikeringkan',
  'disetrika',
  'selesai_pusat',
  'dikirim_ke_mitra',
  'siap_diambil',
  'selesai_closed',
];

const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const currentIndex = allStatuses.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === allStatuses.length - 1) {
    return null; // Tidak ada status berikutnya jika sudah terakhir
  }
  return allStatuses[currentIndex + 1];
};

const formatStatus = (status: string) => {
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface NextActionCardProps {
  order: Order;
  onUpdateStatus: (order: Order) => Promise<void>;
}

export function NextActionCard({ order, onUpdateStatus }: NextActionCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const nextStatus = getNextStatus(order.status);

  const handleUpdateClick = async () => {
    if (nextStatus) {
      setIsUpdating(true);
      await onUpdateStatus(order);
      setIsUpdating(false);
    }
  };

  // Tampilan jika pesanan sudah selesai
  if (order.status === 'selesai_closed') {
    return (
      <div className="bg-slate-50 p-6 md:w-56 flex flex-col justify-center items-center gap-3 border-l border-slate-100">
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <p className="text-sm font-bold text-slate-600">Order Selesai</p>
        <Link to={`/mitra/orders/${order.id}`} className="h-10 rounded-xl font-bold text-xs text-blue-600 hover:bg-blue-50 w-full gap-1 flex items-center justify-center">
          Lihat Detail <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  // Cek apakah tanggung jawab mitra untuk status selanjutnya
  const isMitraResponsibility = nextStatus && STATUS_RESPONSIBILITY[nextStatus] === 'mitra';

  // Tampilan jika ada aksi selanjutnya
  return (
    <div className="bg-slate-50 p-6 md:w-56 flex flex-col justify-center items-start gap-4 border-l border-slate-100">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi Selanjutnya</p>
      
      {nextStatus && isMitraResponsibility ? (
        <Button 
          onClick={handleUpdateClick}
          disabled={isUpdating}
          className="w-full h-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 font-bold transition-all active:scale-95 text-left p-3 disabled:opacity-50 disabled:cursor-wait"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-sm">{isUpdating ? 'Memperbarui...' : formatStatus(nextStatus)}</span>
            {!isUpdating && <ArrowRight className="h-4 w-4" />}
          </div>
        </Button>
      ) : nextStatus ? (
        <div className="w-full p-4 rounded-xl bg-slate-200/50 border border-slate-200 flex flex-col items-center gap-2 text-center">
          <Clock className="h-5 w-5 text-slate-400" />
          <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight">Menunggu Proses Pusat</p>
        </div>
      ) : null}

      <Link to={`/mitra/orders/${order.id}`} className="h-10 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-200/50 w-full gap-1 flex items-center justify-center mt-auto">
        Lihat Detail <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}