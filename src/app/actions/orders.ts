
'use server';

import { revalidatePath } from 'next/cache';
import type { Order, OrderItem } from '@/lib/orders';
import { notifyAdminOfNewOrder } from '@/ai/flows/notify-admin-flow';
import type { NewOrderNotificationInput } from '@/ai/flows/notify-admin-flow';
import { createClient } from '@/lib/supabase/server';

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
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User is not authenticated.');
  }
  
  const orderPayload = {
    user_id: user.id, // Use the server-side authenticated user ID
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
    throw new Error(error?.message || 'Could not create order.');
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

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/orders');
  revalidatePath('/account/orders');

  return data as Order;
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

export async function updateOrderStatus(id: string, status: Order['status'], cancellationReason?: string | null): Promise<{ data: Order | null, error: string | null }> {
  const supabase = createClient();
  
  const payload: { status: Order['status']; cancellation_reason?: string | null } = { status };
  
  if (status === 'Cancelado') {
    payload.cancellation_reason = cancellationReason;
  } else {
    // Clear reason if status is changed to something other than canceled
    payload.cancellation_reason = null;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (!error) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/orders');
    revalidatePath(`/dashboard/orders/${id}`);
    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${id}`);
  }

  return { data, error: error ? error.message : null };
}

export async function getOrdersByUserId(userId: string): Promise<{ data: Order[] | null, error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error: error ? error.message : null };
}

export async function deleteOrder(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (!error) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/orders');
    revalidatePath(`/dashboard/orders/${id}`);
    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${id}`);
  }

  return { error: error ? error.message : null };
}

export async function deleteOrders(ids: string[]): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('orders')
    .delete()
    .in('id', ids);

  if (!error) {
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/orders');
    revalidatePath('/account/orders');
    ids.forEach(id => {
      revalidatePath(`/dashboard/orders/${id}`);
      revalidatePath(`/account/orders/${id}`);
    });
  }

  return { error: error ? error.message : null };
}
