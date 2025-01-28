import { API_URL, fetcher } from "@/lib/config";
import { BarangList } from "@/types";
import useSWR from "swr";

export const useBarang = () => {
  const { data, error, isLoading } = useSWR<BarangList>(
    `${API_URL}/barang`,
    fetcher
  );

  return {
    barang: data,
    error,
    isLoading,
  };
};
