import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Order } from '@/lib/types';
import { OrderHeader } from '@/components/order/OrderHeader';
import { OrderItems } from '@/components/order/OrderItems';
import { PaymentInfo } from '@/components/order/PaymentInfo';
import { ShippingInfo } from '@/components/order/ShippingInfo';
import NotFound from '@/pages/NotFound';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

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
          <ShippingInfo order={order} />
        </div>
        <div className="space-y-8">
          <PaymentInfo order={order} />
        </div>
      </div>
    </div>
  );
}