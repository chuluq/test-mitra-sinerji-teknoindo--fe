"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { format, formatISO } from "date-fns";
import { CalendarIcon, EditIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBarang } from "@/hooks/use-barang";
import { useCustomers } from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";
import { calculateDiscountAmount, cn, formatPrice } from "@/lib/utils";
import { formSchema, salesSchema } from "@/lib/validations";
import { PayloadTransaction, SalesDetails } from "@/types";
import { API_URL } from "@/lib/config";

type FormValues = z.infer<typeof formSchema>;
type FormSalesDetails = z.infer<typeof salesSchema>;

const columnHelper = createColumnHelper<SalesDetails>();

export const FormTransaction = () => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    customers,
    error: errorCustomers,
    isLoading: isLoadingCustomers,
  } = useCustomers();
  const {
    barang,
    error: errorBarang,
    isLoading: isLoadingBarang,
  } = useBarang();

  const [openDialog, setOpenDialog] = useState(false);
  const [isEditSale, setIsEditSale] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tgl: new Date(),
      cust_id: "",
      kode: "",
      cust_nama: "",
      cust_telp: "",
      diskon: "",
      ongkir: "",
      subtotal: "",
      total_bayar: "",
      sales_details: [],
    },
  });

  const {
    formState: { errors },
    register,
    setValue,
    handleSubmit,
    getValues,
    watch,
    reset,
  } = useForm<FormSalesDetails>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      barang_id: "",
      barang_kode: "",
      barang_nama: "",
      harga_diskon: "0", // harga setelah diskon
      diskon_nilai: "0",
      diskon_pct: "0",
      harga_bandrol: "0", // harga sebelum diskon
      qty: "1",
      total: "0",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const sales_details = values.sales_details.map((item) => {
        return {
          barang_id: Number(item.barang_id),
          harga_bandrol: Number(item.harga_bandrol),
          qty: Number(item.qty),
          diskon_pct: Number(item.diskon_pct),
          diskon_nilai: Number(item.diskon_nilai),
          harga_diskon: Number(item.harga_diskon),
          total: Number(item.total),
        };
      });
      const payload: PayloadTransaction = {
        cust_id: Number(values.cust_id),
        kode: values.kode,
        tgl: formatISO(values.tgl),
        subtotal: Number(values.subtotal),
        diskon: Number(values.diskon),
        ongkir: Number(values.ongkir),
        total_bayar: Number(values.total_bayar),
        sales_details,
      };

      const result = await fetch(`${API_URL}/sales`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!result.ok) {
        toast({
          title: "Something went wrong",
          variant: "destructive",
        });
      }

      form.reset();
      router.push("/");
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: JSON.stringify(error),
        variant: "destructive",
      });
    }
  }

  function updateCustomerField(kode: string) {
    const customer = customers?.data.find((customer) => customer.kode === kode);
    form.setValue("cust_id", customer?.id.toString() ?? "");
    form.setValue("cust_nama", customer?.nama ?? "");
    form.setValue("cust_telp", customer?.telp ?? "");
  }

  function updateBarangField(kode: string) {
    const itemBarang = barang?.data.find((barang) => barang.kode === kode);
    setValue("barang_id", itemBarang?.id.toString() ?? "");
    setValue("barang_nama", itemBarang?.nama ?? "");
    setValue("harga_bandrol", itemBarang?.harga ?? "");
    const price = parseFloat(itemBarang?.harga ?? "");
    updateTotalPrice(price, parseInt(getValues("qty")));
    updatePriceAfterDiscount(
      price,
      parseInt(getValues("qty")),
      parseFloat(getValues("diskon_pct"))
    );
  }

  function updateTotalPrice(price: number, quantity: number) {
    setValue("total", (price * quantity).toString());
  }

  function updatePriceAfterDiscount(
    price: number,
    quantity: number,
    discount: number
  ) {
    const discountValue = calculateDiscountAmount(price, discount);
    const discountPrice = price - discountValue;
    const totalPrice = price * quantity * (1 - discount / 100);
    setValue("diskon_nilai", discountValue.toString());
    setValue("harga_diskon", discountPrice.toString());
    setValue("total", totalPrice.toString());
  }

  function updateTotalBayar() {
    const subtotal = form.getValues("subtotal");
    const diskon = form.getValues("diskon");
    const ongkir = form.getValues("ongkir");
    const total = Number(subtotal) - Number(diskon) - Number(ongkir);
    form.setValue("total_bayar", total.toString());
  }

  function modifySalesDetails(values: FormSalesDetails) {
    if (isEditSale) {
      editSalesDetails(values);
    } else {
      addSalesDetails(values);
    }
  }

  function addSalesDetails(values: FormSalesDetails) {
    const currentSales = form.getValues("sales_details");
    const newSales = [...currentSales, values];
    const subtotal = newSales.reduce(
      (accumulator, currentValue) => accumulator + Number(currentValue.total),
      0
    );
    form.setValue("sales_details", newSales);
    form.setValue("subtotal", subtotal.toString());
    updateTotalBayar();
    setOpenDialog(false);
    reset();
  }

  function editSalesDetails(values: FormSalesDetails) {
    const sales = Array.from(form.getValues("sales_details"));
    const index = sales.findIndex(
      (sale) => sale.barang_id === values.barang_id
    );
    if (index !== -1) {
      sales[index] = values;
    }
    form.setValue("sales_details", sales);
    updateTotalBayar();
    setIsEditSale(false);
    setOpenDialog(false);
    reset();
  }

  const columns: ColumnDef<SalesDetails>[] = [
    {
      id: "actions",
      header: () => (
        <DialogTrigger asChild>
          <Button type="button">
            <PlusIcon /> Tambah
          </Button>
        </DialogTrigger>
      ),
      cell: ({ row }) => {
        const rowSale = form.getValues("sales_details");
        const deleteRowSale = () => {
          const updatedSale = rowSale.filter(
            (sale) => sale.barang_id !== row.original.barang_id
          );
          const subtotal = updatedSale.reduce(
            (accumulator, currentValue) =>
              accumulator + Number(currentValue.total),
            0
          );
          form.setValue("sales_details", updatedSale);
          form.setValue("subtotal", subtotal.toString());
          updateTotalBayar();
        };
        const editRowSale = () => {
          setIsEditSale(true);
          const selectedRowSale = rowSale.find(
            (sale) => sale.barang_id === row.original.barang_id
          );
          setValue("barang_id", selectedRowSale?.barang_id ?? "");
          setValue("barang_kode", selectedRowSale?.barang_kode ?? "");
          setValue("barang_nama", selectedRowSale?.barang_nama ?? "");
          setValue("diskon_nilai", selectedRowSale?.diskon_nilai ?? "");
          setValue("diskon_pct", selectedRowSale?.diskon_pct ?? "");
          setValue("harga_bandrol", selectedRowSale?.harga_bandrol ?? "");
          setValue("harga_diskon", selectedRowSale?.harga_diskon ?? "");
          setValue("qty", selectedRowSale?.qty ?? "");
          setValue("total", selectedRowSale?.total ?? "");
          setOpenDialog(true);
        };

        return (
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={editRowSale}>
              <EditIcon />
            </Button>
            <Button variant="destructive" onClick={deleteRowSale}>
              <Trash2Icon />
            </Button>
          </div>
        );
      },
    },
    {
      id: "no",
      header: "No",
      cell: ({ row, table }) => {
        return (
          table
            .getSortedRowModel()
            ?.flatRows?.findIndex((flatRow) => flatRow.id === row.id || 0) + 1
        );
      },
    },
    {
      accessorKey: "barang_kode",
      header: "Kode Barang",
    },
    {
      accessorKey: "barang_nama",
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

  if (errorCustomers || errorBarang) return <div>failed to load</div>;
  if (isLoadingCustomers || isLoadingBarang) return <div>loading...</div>;

  return (
    <Dialog
      open={openDialog}
      onOpenChange={() => {
        setOpenDialog(!openDialog);
        reset();
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 my-8">
          <div className="w-full md:max-w-screen-sm space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium bg-blue-100 p-2">Transaksi</h4>
              <FormItem>
                <FormLabel>No</FormLabel>
                <FormControl>
                  <Input placeholder="auto generated" disabled />
                </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="tgl"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tgl</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-3">
              <h4 className="font-medium bg-blue-100 p-2">Customer</h4>
              <FormField
                control={form.control}
                name="kode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode</FormLabel>
                    <Select
                      onValueChange={(kode) => {
                        field.onChange(kode);
                        updateCustomerField(kode);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers
                          ? customers?.data?.map((customer, index) => (
                              <SelectItem key={index} value={customer.kode}>
                                {customer.nama} {`(${customer.kode})`}
                              </SelectItem>
                            ))
                          : null}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cust_nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder="customer name" disabled {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cust_telp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telp</FormLabel>
                    <FormControl>
                      <Input placeholder="telephone no." disabled {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="w-full">
            <DataTable
              columns={columns}
              data={form.getValues("sales_details") ?? []}
            />
            {form.formState.errors?.sales_details && (
              <p className="text-xs text-red-600 mt-2">
                {form.formState.errors?.sales_details.message}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <FormItem>
              <div className="grid grid-cols-2 items-center">
                <FormLabel>Sub Total</FormLabel>
                <FormControl>
                  <Input
                    value={formatPrice(Number(form.watch("subtotal")))}
                    disabled
                  />
                </FormControl>
              </div>
            </FormItem>
            <FormItem>
              <div className="grid grid-cols-2 items-center">
                <FormLabel>Diskon</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    onChange={(e) => {
                      form.setValue("diskon", e.target.value);
                      updateTotalBayar();
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
            <FormItem>
              <div className="grid grid-cols-2 items-center">
                <FormLabel>Ongkir</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    onChange={(e) => {
                      form.setValue("ongkir", e.target.value);
                      updateTotalBayar();
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
            <FormItem>
              <div className="grid grid-cols-2 items-center">
                <FormLabel>Total Bayar</FormLabel>
                <FormControl>
                  <Input
                    value={formatPrice(Number(form.getValues("total_bayar")))}
                    disabled
                  />
                </FormControl>
              </div>
            </FormItem>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Button type="submit">Submit</Button>
            <Button variant="secondary" asChild>
              <Link href="/">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Barang</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="barang_nama" className="text-right">
              Nama Barang
            </Label>
            <Select
              onValueChange={(kode) => {
                setValue("barang_kode", kode);
                updateBarangField(kode);
              }}
              value={watch("barang_kode")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select barang" />
              </SelectTrigger>
              <SelectContent>
                {barang
                  ? barang?.data.map((barang, index) => (
                      <SelectItem key={index} value={barang.kode}>
                        {barang.nama}
                      </SelectItem>
                    ))
                  : null}
              </SelectContent>
            </Select>
            {errors?.barang_id && (
              <p className="ml-auto text-xs text-red-600 col-span-4">
                {errors?.barang_id.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="harga_bandrol" className="text-right">
              Harga Bandrol
            </Label>
            <Input
              type="text"
              id="harga_bandrol"
              className="col-span-3"
              disabled
              {...register("harga_bandrol")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="qty" className="text-right">
              Quantity
            </Label>
            <Input
              type="number"
              id="qty"
              min="1"
              className="col-span-3"
              value={watch("qty")}
              onChange={(e) => {
                setValue("qty", e.target.value);
                updateTotalPrice(
                  Number(getValues("harga_bandrol")),
                  Number(e.target.value)
                );
                updatePriceAfterDiscount(
                  Number(getValues("harga_bandrol")),
                  Number(e.target.value),
                  Number(getValues("diskon_pct"))
                );
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="diskon_pct" className="text-right">
              Diskon (%)
            </Label>
            <Input
              type="number"
              id="diskon_pct"
              min="0"
              className="col-span-3"
              value={watch("diskon_pct")}
              onChange={(e) => {
                setValue("diskon_pct", e.target.value);
                updatePriceAfterDiscount(
                  Number(getValues("harga_bandrol")),
                  Number(getValues("qty")),
                  Number(e.target.value)
                );
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="diskon_nilai" className="text-right">
              Nilai Diskon
            </Label>
            <Input
              type="text"
              id="diskon_nilai"
              className="col-span-3"
              disabled
              {...register("diskon_nilai")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="harga_diskon" className="text-right">
              Harga Diskon
            </Label>
            <Input
              type="text"
              id="harga_diskon"
              className="col-span-3"
              disabled
              {...register("harga_diskon")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="total" className="text-right">
              Total
            </Label>
            <Input
              type="text"
              id="total"
              className="col-span-3"
              disabled
              {...register("total")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit(modifySalesDetails)}>
            {isEditSale ? "Edit" : "Add"} Barang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
