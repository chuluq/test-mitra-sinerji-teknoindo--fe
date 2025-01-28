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
