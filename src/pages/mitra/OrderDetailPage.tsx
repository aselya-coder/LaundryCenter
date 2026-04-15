import { useParams, Link } from 'react-router-dom';
import { mockOrders, mockStatusLogs } from '@/lib/mock-data';
import { OrderHeader } from '@/components/order/OrderHeader';
import { OrderItems } from '@/components/order/OrderItems';
import { PaymentInfo } from '@/components/order/PaymentInfo';
import { ShippingInfo } from '@/components/order/ShippingInfo';
import NotFound from '@/pages/NotFound';
import { ArrowLeft } from 'lucide-react';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const order = mockOrders.find((o) => o.id === orderId);
  const statusLogs = mockStatusLogs.filter((log) => log.order_id === orderId);

  if (!order) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Link
        to="/mitra/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Order
      </Link>
      <OrderHeader order={order} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <OrderItems order={order} />
          <ShippingInfo statusLogs={statusLogs} />
        </div>
        <div className="space-y-8">
          <PaymentInfo order={order} />
        </div>
      </div>
    </div>
  );
}