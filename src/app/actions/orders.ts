
'use server';

import type { Order, OrderItem } from '@/lib/orders';
import { notifyAdminOfNewOrder } from '@/ai/flows/notify-admin-flow';
import type { NewOrderNotificationInput } from '@/ai/flows/notify-admin-flow';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type CreateOrderInput = {
  userId: string;
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
};

const createSupabaseServerClient = () => {
    const cookieStore = cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const supabase = createSupabaseServerClient();
  
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

  return data as Order;
}


export async function getOrders(): Promise<{ data: Order[] | null, error: string | null }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error: error ? error.message : null };
}

export async function getOrderById(id: string): Promise<{ data: Order | null, error: string | null }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error: error ? error.message : null };
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<{ data: Order | null, error: string | null }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status: status })
    .eq('id', id)
    .select()
    .single();

  return { data, error: error ? error.message : null };
}

export async function getOrdersByUserId(userId: string): Promise<{ data: Order[] | null, error: string | null }> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error: error ? error.message : null };
}
