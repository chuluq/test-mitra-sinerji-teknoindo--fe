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
  sales_id?: string | undefined;
  barang_id: string;
  kode?: string;
  nama?: string;
  qty: string;
  harga_bandrol: string;
  diskon_pct: string;
  diskon_nilai: string;
  harga_diskon: string;
  total: string;
};

export type PayloadTransaction = {
  id?: number;
  kode: string;
  tgl: Date | string;
  cust_id: number;
  subtotal: number;
  diskon: number;
  ongkir: number;
  total_bayar: number;
  sales_details: {
    barang_id: number;
    harga_bandrol: number;
    qty: number;
    diskon_pct: number;
    diskon_nilai: number;
    harga_diskon: number;
    total: number;
  }[];
};

export type Transaction = {
  id: number;
  kode: string;
  cust_id: number;
  tgl: Date | string;
  subtotal: string;
  diskon: string;
  ongkir: string;
  total_bayar: string;
  no_transaksi: string;
  customer: Customer;
  sales_details: {
    sales_id: number;
    barang_id: number;
    harga_bandrol: string;
    qty: number;
    diskon_pct: string;
    diskon_nilai: string;
    harga_diskon: string;
    total: string;
  }[];
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
