import { API_URL, fetcher } from "@/lib/config";
import { Customers } from "@/types";
import useSWR from "swr";

export const useCustomers = () => {
  const { data, error, isLoading } = useSWR<Customers>(
    `${API_URL}/customers`,
    fetcher
  );

  return {
    customers: data,
    error,
    isLoading,
  };
};
