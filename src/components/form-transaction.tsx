"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Trash2Icon, EditIcon, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { calculateDiscountAmount, cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
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
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { formSchema, salesSchema } from "@/lib/validations";
import { useCustomers } from "@/hooks/use-customers";
import { SalesDetails } from "@/types";
import { useBarang } from "@/hooks/use-barang";

type FormValues = z.infer<typeof formSchema>;
type FormSalesDetails = z.infer<typeof salesSchema>;

const columnHelper = createColumnHelper<SalesDetails>();

export const FormTransaction = () => {
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tgl: new Date(),
      cust_id: "",
      cust_kode: "",
      cust_nama: "",
      cust_telp: "",
      diskon: "",
      kode: "",
      ongkir: "",
      subtotal: "",
      total_bayar: "",
      sales_details: [],
    },
  });

  const {
    // formState: { errors },
    register,
    setValue,
    handleSubmit,
    getValues,
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

  function onSubmit(values: FormValues) {
    console.log(values);
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
      cell: () => {
        return (
          <div className="flex space-x-2">
            <Button type="button" variant="secondary">
              <EditIcon />
            </Button>
            <Button type="button" variant="destructive">
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
                  <Input disabled />
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
                name="cust_kode"
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
          </div>
          <div className="flex flex-col items-end space-y-2">
            <FormItem>
              <div className="grid grid-cols-2 items-center">
                <FormLabel>Sub Total</FormLabel>
                <FormControl>
                  <Input
                    value={formatPrice(Number(form.getValues("subtotal")))}
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
            <Button type="button" variant="secondary">
              Cancel
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
          <Button type="button" onClick={handleSubmit(addSalesDetails)}>
            Add Barang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
