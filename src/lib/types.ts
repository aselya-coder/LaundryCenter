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

// Peran yang bertanggung jawab untuk setiap status
export const STATUS_RESPONSIBILITY: Record<OrderStatus, UserRole> = {
  diterima_mitra: 'mitra',    // Mitra menerima cucian
  dikirim_ke_pusat: 'mitra',  // Mitra mengirim ke pusat
  diproses: 'admin',          // Pusat mulai proses
  dicuci: 'admin',            // Pusat mencuci
  dikeringkan: 'admin',       // Pusat mengeringkan
  disetrika: 'admin',         // Pusat menyetrika
  selesai_pusat: 'admin',     // Pusat selesai & siap kirim balik
  dikirim_ke_mitra: 'admin',  // Pusat mengirim balik ke mitra
  siap_diambil: 'mitra',      // Mitra menerima & siap diambil customer
  selesai_closed: 'mitra',    // Mitra menyerahkan ke customer (Selesai)
};

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
  is_paid: boolean;
  payment_method: 'tunai' | 'transfer' | null;
  items_detail?: { item: string; qty: number }[];
  mitra?: {
    nama_toko: string;
  };
  order_history?: OrderHistory[];
}

export interface Service {
  id: string;
  nama: string;
  harga: number;
  satuan: 'kg' | 'pcs';
  kategori: 'kiloan' | 'satuan';
  aktif: boolean;
}

export interface OrderHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  catatan: string | null;
  created_at: string;
}