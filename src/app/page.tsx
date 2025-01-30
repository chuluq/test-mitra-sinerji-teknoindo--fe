import { Suspense } from "react";
import Link from "next/link";

import { DataTableSales } from "@/components/data-table-sales";
import { SearchSales } from "@/components/search-sales";
import { Button } from "@/components/ui/button";
import { SalesTableSkeleton } from "@/components/skeletons";
import { API_URL } from "@/lib/config";

async function getSales(name?: string) {
  if (name) {
    return await fetch(`${API_URL}/sales?name=${name}`);
  } else {
    return await fetch(`${API_URL}/sales`);
  }
}

export default async function Home(props: {
  searchParams?: Promise<{ name?: string }>;
}) {
  const searchParams = await props.searchParams;
  const name = searchParams?.name || "";

  const data = await getSales(name);
  const sales = await data.json();

  return (
    <section className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">Transaction List</h1>
        <div className="flex items-center gap-2">
          <SearchSales />
          <Button asChild>
            <Link href="/transaction">New Transaction</Link>
          </Button>
        </div>
      </div>
      <Suspense key={name} fallback={<SalesTableSkeleton />}>
        <DataTableSales sales={sales.data} />
      </Suspense>
    </section>
  );
}
