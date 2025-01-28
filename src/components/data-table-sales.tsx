import { Sales } from "@/types";
import { DataTable } from "./ui/data-table";
import { columns } from "./column-sales";

interface DataTableSalesProps {
  sales: Sales[];
}

export const DataTableSales = ({ sales }: DataTableSalesProps) => {
  return (
    <div>
      <DataTable columns={columns} data={sales ?? []} />
    </div>
  );
};
