"use client";

import { useState } from "react";
import { Loader2, Trash2Icon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Sales } from "@/types";
import { formatPrice } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/config";
import { revalidateHome } from "@/app/actions";
import { SalesTableSkeleton } from "./skeletons";

interface DataTableSalesProps {
  sales: Sales[];
}

export const DataTableSales = ({ sales }: DataTableSalesProps) => {
  const { toast } = useToast();

  const [isAlertDeleteOpen, setIsAlertDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>();
  const [isLoading, setIsLoading] = useState(false);

  function deleteSale(salesId: number) {
    setSelectedId(salesId);
    setIsAlertDeleteOpen(true);
  }

  async function onDeleteSale() {
    try {
      setIsLoading(true);
      await fetch(`${API_URL}/sales/${selectedId}`, {
        method: "DELETE",
      });

      await revalidateHome();
      toast({
        variant: "default",
        title: "Deleted data successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: JSON.stringify(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  const columns: ColumnDef<Sales>[] = [
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const salesId = row.original.id;

        return (
          <div>
            <Button
              variant="destructive"
              onClick={() => deleteSale(salesId)}
              disabled={isLoading}
            >
              <Trash2Icon />
            </Button>
          </div>
        );
      },
    },
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
          .reduce(
            (total, row) => total + Number(row.getValue("total_bayar")),
            0
          );
        return formatPrice(grandTotal);
      },
    },
  ];

  return (
    <>
      {isLoading ? (
        <SalesTableSkeleton />
      ) : (
        <DataTable columns={columns} data={sales ?? []} />
      )}
      <AlertDialog
        open={isAlertDeleteOpen}
        onOpenChange={() => setIsAlertDeleteOpen(!isAlertDeleteOpen)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              sales data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={onDeleteSale}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
