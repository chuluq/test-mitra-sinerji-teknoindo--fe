import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    trailingZeroDisplay: "stripIfInteger",
  }).format(price);
}

export function calculateDiscountAmount(price: number, percent: number) {
  return price * (percent / 100);
}
