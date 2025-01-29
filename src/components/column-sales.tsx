"use client";

import { formatPrice } from "@/lib/utils";
import { Sales } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columns: ColumnDef<Sales>[] = [
  {
    accessorKey: "no_transaksi",
    header: "No Transaksi",
  },
  {
    accessorKey: "tgl",
    header: "Tanggal",
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return <span>{format(new Date(date), "dd-MMM-yyyy")}</span>;
    },
  },
  {
    accessorKey: "customer.nama",
    header: "Nama Customer",
  },
  {
    accessorKey: "_count.sales_details",
    header: "Jumlah Barang",
  },
  {
    accessorKey: "subtotal",
    header: "Sub Total",
    cell: ({ getValue }) => {
      const subtotal = getValue() as string;
      return <span>{formatPrice(Number(subtotal))}</span>;
    },
  },
  {
    accessorKey: "diskon",
    header: "Diskon",
    cell: ({ getValue }) => {
      const diskon = getValue() as string;
      return <span>{formatPrice(Number(diskon))}</span>;
    },
  },
  {
    accessorKey: "ongkir",
    header: "Ongkir",
    cell: ({ getValue }) => {
      const ongkir = getValue() as string;
      return <span>{formatPrice(Number(ongkir))}</span>;
    },
    footer: "Grand Total",
  },
  {
    accessorKey: "total_bayar",
    header: "Total",
    cell: ({ getValue }) => {
      const total = getValue() as string;
      return <span>{formatPrice(Number(total))}</span>;
    },
    footer: ({ table }) => {
      const grandTotal = table
        .getFilteredRowModel()
        .rows?.filter((row) => row.getValue("total_bayar") !== null)
        .reduce((total, row) => total + Number(row.getValue("total_bayar")), 0);
      return formatPrice(grandTotal);
    },
  },
];
