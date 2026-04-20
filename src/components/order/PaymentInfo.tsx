import { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Landmark } from 'lucide-react';

interface PaymentInfoProps {
  order: Order;
}

export function PaymentInfo({ order }: PaymentInfoProps) {
  return (
    <Card className="border-none bg-white rounded-2xl p-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Landmark className="h-5 w-5 text-blue-600" />
          Informasi Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <p className="text-sm font-semibold text-slate-600">Metode</p>
          <p className="font-bold uppercase">{order.payment_method || (order.status === 'selesai_closed' ? 'tunai' : '-')}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm font-semibold text-slate-600">Status</p>
          <p className={`font-bold ${(order.is_paid || order.status === 'selesai_closed') ? 'text-green-600' : 'text-red-500'}`}>
            {(order.is_paid || order.status === 'selesai_closed') ? 'LUNAS' : 'BELUM BAYAR'}
          </p>
        </div>
        <div className="text-center p-4 bg-slate-50 rounded-lg mt-4">
            <p className="text-sm font-semibold text-slate-600 mb-2">Bukti Pembayaran</p>
            <img
                src="https://placehold.co/300x300/png?text=Bukti+Bayar"
                alt="QRIS Code"
                className="mx-auto rounded-md"
            />
        </div>
      </CardContent>
    </Card>
  );
}