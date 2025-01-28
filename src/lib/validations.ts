import { z } from "zod";

export const salesSchema = z.object({
  barang_id: z.string().min(1),
  barang_kode: z.string(),
  barang_nama: z.string(),
  qty: z.string().min(1),
  harga_bandrol: z.string().min(1),
  diskon_pct: z.string(),
  diskon_nilai: z.string(),
  harga_diskon: z.string().min(1),
  total: z.string().min(1),
});

export const formSchema = z.object({
  tgl: z.date(),
  cust_id: z.string().min(1),
  cust_kode: z.string().min(1),
  cust_nama: z.string(),
  cust_telp: z.string(),
  kode: z.string().min(1),
  subtotal: z.string().min(1),
  diskon: z.string(),
  ongkir: z.string(),
  total_bayar: z.string().min(1),
  sales_details: z.array(salesSchema).min(1),
});
