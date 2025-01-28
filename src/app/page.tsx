import { DataTableSales } from "@/components/data-table-sales";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const data = await fetch(`${process.env.NEXT_PUBLIC_API}/sales`);
  const sales = await data.json();

  return (
    <section className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">Transaction List</h1>
        <Button asChild>
          <Link href="/transaction">New Transaction</Link>
        </Button>
      </div>
      <DataTableSales sales={sales.data} />
    </section>
  );
}
