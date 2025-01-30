import { z } from "zod";

export const salesSchema = z.object({
  sales_id: z.string().optional(),
  barang_id: z.string().min(1, { message: "Barang is required" }),
  kode: z.string(),
  nama: z.string(),
  qty: z.string().min(1, { message: "Quantity is required" }),
  harga_bandrol: z.string().min(1, { message: "Harga bandrol is required" }),
  diskon_pct: z.string(),
  diskon_nilai: z.string(),
  harga_diskon: z.string().min(1, { message: "Harga diskon is required" }),
  total: z.string().min(1),
});

export const formSchema = z.object({
  tgl: z.date(),
  cust_id: z.string().min(1, { message: "Customer is required" }),
  kode: z.string().min(1, { message: "Customer is required" }),
  cust_nama: z.string(),
  cust_telp: z.string().optional(),
  subtotal: z.string().min(1, { message: "Subtotal is required" }),
  diskon: z.string(),
  ongkir: z.string(),
  total_bayar: z.string().min(1, { message: "Total Bayar is required" }),
  sales_details: z
    .array(salesSchema)
    .min(1, { message: "Must have at least 1 barang" }),
});
