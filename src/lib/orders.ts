
export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string; // uuid
  created_at: string; // timestamp
  user_id: string; // uuid
  customer_name: string;
  customer_email: string;
  total_price: number;
  items: OrderItem[]; // jsonb
  shipping_address: string;
  payment_method: string;
  status: 'Pendente' | 'Processando' | 'Enviado' | 'Em rota de entrega' | 'Entregue' | 'Cancelado';
  cancellation_reason?: string | null;
};

// Data is now fetched from Supabase, this is kept for type reference.
export const orders: Order[] = [];
