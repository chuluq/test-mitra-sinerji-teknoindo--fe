import { FormTransaction } from "@/components/form-transaction";
import { API_URL } from "@/lib/config";

export default async function EditTransaction({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const data = await fetch(`${API_URL}/sales/${id}`);
  const transaction = await data.json();

  return (
    <section className="container mx-auto p-4">
      <h1 className="font-medium text-2xl">Edit Transaction</h1>
      <FormTransaction
        transactionId={parseInt(id)}
        transaction={transaction?.data}
      />
    </section>
  );
}
