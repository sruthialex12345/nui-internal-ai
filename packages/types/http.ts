// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>;

export type HTTPHeaders = { [key: string]: string };
export type HTTPBody = Json | FormData | URLSearchParams;
export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
