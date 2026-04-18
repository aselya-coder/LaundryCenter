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

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
}

export interface Mitra {
  id: string;
  user_id?: string;
  nama_toko: string;
  alamat: string;
  kota: string;
  komisi: number;
  aktif: boolean;
  user?: {
    nama: string;
  };
}

export interface Order {
  id: string;
  kode_order: string;
  customer_name: string;
  customer_hp: string;
  mitra_id: string;
  jenis: 'kiloan' | 'satuan';
  berat: number;
  total_price: number;
  status: OrderStatus;
  catatan: string;
  updated_at: string;
  tanggal_masuk: string;
  tanggal_selesai: string | null;
  mitra?: {
    nama_toko: string;
  };
  order_history?: OrderHistory[];
}

export interface OrderHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  catatan: string | null;
  created_at: string;
}