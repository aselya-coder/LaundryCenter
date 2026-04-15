export type UserRole = 'admin' | 'mitra';

export type OrderStatus =
  | 'diterima_mitra'
  | 'dikirim_ke_pusat'
  | 'diproses'
  | 'dicuci'
  | 'dikeringkan'
  | 'disetrika'
  | 'selesai_pusat'
  | 'dikirim_ke_mitra'
  | 'siap_diambil'
  | 'selesai_closed';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  diterima_mitra: 'Diterima Mitra',
  dikirim_ke_pusat: 'Dikirim ke Pusat',
  diproses: 'Diproses',
  dicuci: 'Dicuci',
  dikeringkan: 'Dikeringkan',
  disetrika: 'Disetrika',
  selesai_pusat: 'Selesai',
  dikirim_ke_mitra: 'Dikirim ke Mitra',
  siap_diambil: 'Siap Diambil',
  selesai_closed: 'Selesai (Closed)',
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
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

// This type should match the structure of your 'orders' table in Supabase
export interface Order {
  id: number; // Supabase typically uses number for auto-incrementing IDs
  customer_name: string;
  status: OrderStatus;
  total_price: number;
  updated_at: string;
  // Add other fields from your Supabase table if they exist
  // For example:
  // created_at: string;
  // mitra_id: string;
}