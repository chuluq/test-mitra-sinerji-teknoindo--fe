export const API_URL = process.env.NEXT_PUBLIC_API;

export const fetcher = (url: string) => fetch(url).then((r) => r.json());
