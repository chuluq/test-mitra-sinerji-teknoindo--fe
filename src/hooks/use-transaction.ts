import { API_URL, fetcher } from "@/lib/config";
import { Transaction } from "@/types";
import useSWR from "swr";

export const useTransaction = (id: number) => {
  const { data, error, isLoading } = useSWR<Transaction>(
    `${API_URL}/sales/${id}`,
    fetcher
  );

  return {
    transaction: data,
    error,
    isLoading,
  };
};
