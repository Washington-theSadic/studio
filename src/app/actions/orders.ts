
'use server';

import { supabase } from '@/lib/supabase';
import type { Order, OrderItem } from '@/lib/orders';
import { notifyAdminOfNewOrder } from '@/ai/flows/notify-admin-flow';
import type { NewOrderNotificationInput } from '@/ai/flows/notify-admin-flow';

export type CreateOrderInput = {
  userId: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const orderPayload = {
    user_id: input.userId,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
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
    console.error('Error creating order:', error);
    throw new Error('Could not create order.');
  }
  
  const notificationInput: NewOrderNotificationInput = {
    customerName: input.customerName,
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

  return data as Order;
}


export async function getOrders(): Promise<{ data: Order[] | null, error: any | null }> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
}

export async function getOrderById(id: string): Promise<{ data: Order | null, error: any | null }> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<{ data: Order | null, error: any | null }> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: status })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}
