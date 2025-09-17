export interface Order {
  id: number;
  product_symbol: string;
  side: string;
  size: number;
  state: string;
  order_type: string;
  average_fill_price: string | null;
  limit_price: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface Position {
  product_symbol: string;
  size: number;
  entry_price: string;
  liquidation_price: string | null;
  product: {
    contract_value: string;
  };
  [key: string]: unknown;
}

export interface Trade {
  id: number;
  product_symbol: string;
  side: string;
  size: number;
  price: string;
  created_at: string;
  [key: string]: unknown;
}

export interface Price {
  type: string;
  symbol: string;
  price: string;
  [key: string]: unknown;
}

export type ConnectionStatus = "connected" | "disconnected";
