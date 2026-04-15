import { User, Mitra, Order, OrderStatusLog, Transaksi, OrderStatus } from './types';

export const mockUsers: User[] = [
  { id: 'u1', nama: 'Admin Pusat', email: 'admin@laundry.com', role: 'admin' },
  { id: 'u2', nama: 'Budi Santoso', email: 'budi@mitra.com', role: 'mitra' },
  { id: 'u3', nama: 'Siti Rahayu', email: 'siti@mitra.com', role: 'mitra' },
  { id: 'u4', nama: 'Ahmad Fauzi', email: 'ahmad@mitra.com', role: 'mitra' },
];

export const mockMitra: Mitra[] = [
  { id: 'm1', user_id: 'u2', nama_toko: 'Laundry Express Menteng', alamat: 'Jl. Menteng Raya No. 15', kota: 'Jakarta', komisi: 20, aktif: true },
  { id: 'm2', user_id: 'u3', nama_toko: 'Clean & Fresh Bandung', alamat: 'Jl. Dago No. 45', kota: 'Bandung', komisi: 25, aktif: true },
  { id: 'm3', user_id: 'u4', nama_toko: 'Sparkle Laundry Surabaya', alamat: 'Jl. Tunjungan No. 88', kota: 'Surabaya', komisi: 22, aktif: false },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const mockOrders: Order[] = [
  { id: 'o1', kode_order: 'LD-20250414-001', customer_nama: 'Rina Wati', customer_hp: '08123456789', mitra_id: 'm1', jenis: 'kiloan', berat: 5.5, harga: 55000, status: 'dicuci', catatan: 'Pisahkan warna terang', tanggal_masuk: today, tanggal_selesai: null },
  { id: 'o2', kode_order: 'LD-20250414-002', customer_nama: 'Eko Prasetyo', customer_hp: '08198765432', mitra_id: 'm1', jenis: 'satuan', berat: 3, harga: 45000, status: 'diterima_mitra', catatan: '', tanggal_masuk: today, tanggal_selesai: null },
  { id: 'o3', kode_order: 'LD-20250413-001', customer_nama: 'Dewi Lestari', customer_hp: '08567891234', mitra_id: 'm2', jenis: 'kiloan', berat: 8, harga: 80000, status: 'selesai', catatan: 'Express', tanggal_masuk: yesterday, tanggal_selesai: today },
  { id: 'o4', kode_order: 'LD-20250414-003', customer_nama: 'Agus Setiawan', customer_hp: '08234567891', mitra_id: 'm2', jenis: 'kiloan', berat: 4, harga: 40000, status: 'disetrika', catatan: '', tanggal_masuk: today, tanggal_selesai: null },
  { id: 'o5', kode_order: 'LD-20250413-002', customer_nama: 'Maya Sari', customer_hp: '08345678912', mitra_id: 'm1', jenis: 'satuan', berat: 6, harga: 90000, status: 'siap_diambil', catatan: 'Jas dan kemeja formal', tanggal_masuk: yesterday, tanggal_selesai: null },
  { id: 'o6', kode_order: 'LD-20250412-001', customer_nama: 'Hendra Wijaya', customer_hp: '08456789123', mitra_id: 'm2', jenis: 'kiloan', berat: 7, harga: 70000, status: 'selesai', catatan: '', tanggal_masuk: '2025-04-12', tanggal_selesai: '2025-04-13' },
];

export const mockStatusLogs: OrderStatusLog[] = [
  { id: 'sl1', order_id: 'o1', status: 'diterima_mitra', timestamp: `${today}T08:00:00` },
  { id: 'sl2', order_id: 'o1', status: 'dikirim_ke_pusat', timestamp: `${today}T09:30:00` },
  { id: 'sl3', order_id: 'o1', status: 'diproses', timestamp: `${today}T11:00:00` },
  { id: 'sl4', order_id: 'o1', status: 'dicuci', timestamp: `${today}T13:00:00` },
  { id: 'sl5', order_id: 'o3', status: 'diterima_mitra', timestamp: `${yesterday}T07:00:00` },
  { id: 'sl6', order_id: 'o3', status: 'dikirim_ke_pusat', timestamp: `${yesterday}T08:00:00` },
  { id: 'sl7', order_id: 'o3', status: 'diproses', timestamp: `${yesterday}T09:00:00` },
  { id: 'sl8', order_id: 'o3', status: 'dicuci', timestamp: `${yesterday}T11:00:00` },
  { id: 'sl9', order_id: 'o3', status: 'dikeringkan', timestamp: `${yesterday}T14:00:00` },
  { id: 'sl10', order_id: 'o3', status: 'disetrika', timestamp: `${yesterday}T16:00:00` },
  { id: 'sl11', order_id: 'o3', status: 'selesai_proses', timestamp: `${yesterday}T17:00:00` },
  { id: 'sl12', order_id: 'o3', status: 'dikirim_ke_mitra', timestamp: `${today}T08:00:00` },
  { id: 'sl13', order_id: 'o3', status: 'siap_diambil', timestamp: `${today}T10:00:00` },
  { id: 'sl14', order_id: 'o3', status: 'selesai', timestamp: `${today}T12:00:00` },
];

export const mockTransaksi: Transaksi[] = [
  { id: 't1', order_id: 'o3', mitra_id: 'm2', total: 80000, komisi: 20000, pendapatan_bersih: 60000 },
  { id: 't2', order_id: 'o6', mitra_id: 'm2', total: 70000, komisi: 17500, pendapatan_bersih: 52500 },
];
