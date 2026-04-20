import React from 'react';
import { Order, Service } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ThermalReceiptProps {
  order: Order;
  mitraName?: string;
  serviceName?: string;
}

export const ThermalReceipt = React.forwardRef<HTMLDivElement, ThermalReceiptProps>(
  ({ order, mitraName, serviceName }, ref) => {
    return (
      <div className="hidden">
        <div 
          ref={ref} 
          className="print:block p-4 w-[80mm] mx-auto text-black bg-white font-mono text-[12px] leading-tight"
          style={{ width: '80mm' }}
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-black pb-2 mb-2">
            <h2 className="text-[16px] font-bold uppercase">LaundryCenter</h2>
            <p className="font-bold">{mitraName || 'Outlet Mitra'}</p>
            <p className="text-[10px]">{format(new Date(), 'dd/MM/yyyy HH:mm', { locale: id })}</p>
          </div>

          {/* Order Info */}
          <div className="mb-2">
            <div className="flex justify-between">
              <span>No. Order:</span>
              <span className="font-bold">#{order.kode_order}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-bold truncate max-w-[40mm]">{order.customer_name}</span>
            </div>
          </div>

          {/* Details */}
          <table className="w-full border-b border-dashed border-black mb-2 pb-2">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="font-bold py-1">Layanan</th>
                <th className="font-bold py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1">
                  {serviceName || order.jenis} ({order.berat} {order.jenis === 'satuan' ? 'pcs' : 'kg'})
                  {order.items_detail && order.items_detail.length > 0 && (
                    <div className="mt-1 pl-2 text-[10px] border-l border-slate-300">
                      {order.items_detail.map((item, idx) => (
                        <div key={idx} className="flex justify-between italic">
                          <span>- {item.item}</span>
                          <span>x{item.qty}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-1 text-right align-top">
                  Rp {order.total_price.toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total & Payment */}
          <div className="mb-4">
            <div className="flex justify-between font-bold text-[14px]">
              <span>TOTAL:</span>
              <span>Rp {order.total_price.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Status Bayar:</span>
              <span className="font-bold">{(order.is_paid || order.status === 'selesai_closed') ? 'LUNAS' : 'BELUM BAYAR'}</span>
            </div>
            {(order.is_paid || order.status === 'selesai_closed') && (
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-bold uppercase">{order.payment_method || 'tunai'}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center border-t border-dashed border-black pt-2">
            <p className="font-bold">TERIMA KASIH</p>
            <p className="text-[10px] mt-1 italic">Pantau status laundry Anda di:</p>
            <p className="text-[10px] font-bold">www.laundrycenter.com/tracking</p>
            <p className="text-[10px] mt-2">*** Simpan struk ini sebagai bukti pengambilan ***</p>
          </div>
        </div>
      </div>
    );
  }
);

ThermalReceipt.displayName = 'ThermalReceipt';
