"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { DataTable } from "./ui/data-table";
import { columns } from "./column-transaction";

const salesSchema = z.object({
  barangId: z.string().min(1),
  hargaBandrol: z.string().min(1),
  qty: z.string().min(1),
  diskonPercent: z.string(),
  diskonNilai: z.string(),
  diskonHarga: z.string(),
  total: z.string().min(1),
});

const formSchema = z.object({
  tgl: z.date(),
  transactionNo: z.string().min(1),
  //   customerId: z.string().min(1),
  customerKode: z.string().min(1),
  kode: z.string().min(1),
  subtotal: z.string().min(1),
  diskon: z.string(),
  ongkir: z.string(),
  totalBayar: z.string().min(1),
  sales: z.array(salesSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;

export const FormTransaction = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tgl: new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 my-8">
        <div className="w-full md:max-w-screen-sm space-y-6">
          <div className="space-y-3">
            <h4 className="font-medium bg-blue-100 p-2">Transaksi</h4>
            <FormItem>
              <FormLabel>No</FormLabel>
              <FormControl>
                <Input defaultValue="-" />
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
              name="customerKode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="m@example.com">
                        m@example.com
                      </SelectItem>
                      <SelectItem value="m@google.com">m@google.com</SelectItem>
                      <SelectItem value="m@support.com">
                        m@support.com
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input placeholder="customer name" disabled />
              </FormControl>
            </FormItem>
            <FormItem>
              <FormLabel>Telp</FormLabel>
              <FormControl>
                <Input placeholder="telephone no." disabled />
              </FormControl>
            </FormItem>
          </div>
        </div>
        <div>
          <DataTable columns={columns} data={[]} />
        </div>
        <div className="flex flex-col items-end space-y-2">
          <FormItem>
            <div className="grid grid-cols-2 items-center">
              <FormLabel>Sub Total</FormLabel>
              <FormControl>
                <Input disabled value={0} />
              </FormControl>
            </div>
          </FormItem>
          <FormField
            control={form.control}
            name="diskon"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 items-center">
                  <FormLabel>Diskon</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ongkir"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 items-center">
                  <FormLabel>Ongkir</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <div className="grid grid-cols-2 items-center">
              <FormLabel>Total Bayar</FormLabel>
              <FormControl>
                <Input disabled value={0} />
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
  );
};
