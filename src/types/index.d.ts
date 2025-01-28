export type Sales = {
  id: number;
  kode: string;
  tgl: string | Date;
  cust_id: number;
  subtotal: string;
  diskon: string;
  ongkir: string;
  total_bayar: string;
  no_transaksi: string;
  customer: {
    nama: string;
  };
  _count: {
    sales_details: number;
  };
};

export type SalesDetails = {
  barang_kode?: string;
  barang_nama?: string;
  kode?: string;
  nama?: string;
  qty: string;
  harga_bandrol: string;
  diskon_pct: string;
  diskon_nilai: string;
  harga_diskon: string;
  total: string;
};

export type Customer = {
  id: number;
  kode: string;
  nama: string;
  telp: string;
};

export type Customers = {
  data: Customer[];
};

export type Barang = {
  id: number;
  kode: string;
  nama: string;
  harga: string;
};

export type BarangList = {
  data: Barang[];
};
