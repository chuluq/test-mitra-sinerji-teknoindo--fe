"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

export type Transaction = {
  kode: string;
  nama: string;
  qty: string;
  harga_bandrol: string;
  diskon_pct: string;
  diskon_nilai: string;
  harga_diskon: string;
  total: string;
};

const columnHelper = createColumnHelper<Transaction>();

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "kode",
    header: "Kode Barang",
  },
  {
    accessorKey: "nama",
    header: "Nama Barang",
  },
  {
    accessorKey: "qty",
    header: "Quantity",
  },
  {
    accessorKey: "harga_bandrol",
    header: "Harga Bandrol",
  },
  columnHelper.group({
    id: "diskon",
    header: "Diskon",
    columns: [
      columnHelper.accessor("diskon_pct", {
        cell: (info) => info.getValue(),
        header: "(%)",
      }),
      columnHelper.accessor("diskon_nilai", {
        cell: (info) => info.getValue(),
        header: "(Rp)",
      }),
    ],
  }),
  {
    accessorKey: "harga_diskon",
    header: "Harga Diskon",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
];
