import { Order, ORDER_STATUS_LABELS } from './types';

/**
 * Utility untuk membantu pengiriman notifikasi WhatsApp
 */
export const whatsappHelper = {
  /**
   * Format nomor HP ke standar internasional (62xxx)
   */
  formatPhone: (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      return '62' + cleaned.slice(1);
    }
    return cleaned;
  },

  /**
   * Generate pesan otomatis berdasarkan status order
   */
  generateMessage: (order: Order): string => {
    const trackingUrl = `${window.location.origin}/tracking?code=${order.kode_order}`;
    const statusLabel = ORDER_STATUS_LABELS[order.status];
    const customerName = order.customer_name;
    const orderCode = order.kode_order;
    const storeName = order.mitra?.nama_toko || 'LaundryCenter';

    let baseMsg = `Halo *${customerName}*,\n\nKami menginformasikan bahwa laundry Anda dengan kode *#${orderCode}* saat ini berstatus: *${statusLabel.toUpperCase()}*.\n\n`;

    if (order.status === 'siap_diambil') {
      baseMsg = `Halo *${customerName}*,\n\nKabar gembira! Laundry Anda dengan kode *#${orderCode}* sudah *SIAP DIAMBIL* di *${storeName}*.\n\nTotal Biaya: *Rp ${order.total_price.toLocaleString('id-ID')}*\nStatus Bayar: *${order.is_paid ? 'LUNAS' : 'BELUM BAYAR'}*\n\n`;
    }

    if (order.status === 'selesai_closed') {
      baseMsg = `Halo *${customerName}*,\n\nTerima kasih telah mempercayakan cucian Anda di *${storeName}*. Order *#${orderCode}* telah selesai dan diserahkan.\n\nKami tunggu orderan Anda berikutnya! ✨\n\n`;
    }

    const footer = `Lacak detailnya di sini:\n${trackingUrl}\n\nTerima kasih! 🙏`;
    
    return baseMsg + footer;
  },

  /**
   * Buka link WhatsApp Web/App
   */
  send: (order: Order) => {
    if (!order.customer_hp) return;
    const phone = whatsappHelper.formatPhone(order.customer_hp);
    const message = whatsappHelper.generateMessage(order);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  },

  /**
   * Buka link WhatsApp untuk hubungi admin pusat
   */
  contactAdmin: async (storeName: string) => {
    try {
      const { supabase } = await import('./supabase');
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_phone')
        .single();
      
      const adminPhone = data?.value || '6281234567890'; // Fallback
      const message = `Halo Admin Pusat, saya dari mitra ${storeName} ingin bertanya mengenai...`;
      const url = `https://wa.me/${whatsappHelper.formatPhone(adminPhone)}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error contacting admin:', err);
      // Fallback if everything fails
      window.open(`https://wa.me/6281234567890?text=Halo Admin Pusat...`, '_blank');
    }
  }
};
