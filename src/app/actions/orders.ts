
'use server';

import type { Order, OrderItem } from '@/lib/orders';
import { notifyAdminOfNewOrder } from '@/ai/flows/notify-admin-flow';
import type { NewOrderNotificationInput } from '@/ai/flows/notify-admin-flow';
import { createClient } from '@/lib/supabase/server';

export type CreateOrderInput = {
  totalPrice: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
};

export async function createOrder(input: CreateOrderInput): Promise<{ data: Order | null; error: string | null }> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: `Auth error: ${userError?.message || 'User not found.'}` };
  }
  
  if (!user.email) {
      return { data: null, error: 'Usuário não autenticado. O e-mail do usuário não foi encontrado.' };
  }

  const orderPayload = {
    user_id: user.id,
    customer_name: user.user_metadata.name || 'Nome não encontrado',
    customer_email: user.email,
    total_price: input.totalPrice,
    items: input.items,
    shipping_address: input.shippingAddress,
    payment_method: input.paymentMethod,
    status: 'Pendente' as const,
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select()
    .single();

  if (error || !data) {
    return { data: null, error: error?.message || 'Could not create order.' };
  }

  const notificationInput: NewOrderNotificationInput = {
    customerName: orderPayload.customer_name,
    totalPrice: input.totalPrice,
    items: input.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price
    })),
    shippingAddress: input.shippingAddress,
    paymentMethod: input.paymentMethod,
  };

  await notifyAdminOfNewOrder(notificationInput);

  return { data: data as Order, error: null };
}


export async function getOrders(): Promise<{ data: Order[] | null, error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error: error ? error.message : null };
}

export async function getOrderById(id: string): Promise<{ data: Order | null, error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error: error ? error.message : null };
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<{ data: Order | null, error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status: status })
    .eq('id', id)
    .select()
    .single();

  return { data, error: error ? error.message : null };
}

export async function getOrdersByUserId(): Promise<{ data: Order[] | null, error: string | null }> {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: `Auth error: ${userError?.message || 'User not found.'}` };
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  return { data, error: error ? error.message : null };
}
