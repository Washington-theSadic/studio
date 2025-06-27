
'use server';

import type { Order, OrderItem } from '@/lib/orders';
import { notifyAdminOfNewOrder } from '@/ai/flows/notify-admin-flow';
import type { NewOrderNotificationInput } from '@/ai/flows/notify-admin-flow';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type CreateOrderInput = {
  customerName: string;
  customerEmail: string;
  totalPrice: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
};

export async function createOrder(input: CreateOrderInput): Promise<{ data: Order | null; error: string | null }> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    'https://sctvzllsrwghijlcioxz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHZ6bGxzcndnaGlqbGNpb3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTg2ODEsImV4cCI6MjA2NjUzNDY4MX0.pcQlAVWTZPMhAhf-4vS-DBu4bZIe7C2g0nt8CVK230I',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch (error) {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'User not authenticated.' };
  }

  const orderPayload = {
    user_id: user.id,
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
    return { data: null, error: error?.message || 'Could not create order.' };
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

  return { data: data as Order, error: null };
}


export async function getOrders(): Promise<{ data: Order[] | null, error: string | null }> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    'https://sctvzllsrwghijlcioxz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHZ6bGxzcndnaGlqbGNpb3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTg2ODEsImV4cCI6MjA2NjUzNDY4MX0.pcQlAVWTZPMhAhf-4vS-DBu4bZIe7C2g0nt8CVK230I',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch (error) {}
        },
      },
    }
  );
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error: error ? error.message : null };
}

export async function getOrderById(id: string): Promise<{ data: Order | null, error: string | null }> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    'https://sctvzllsrwghijlcioxz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHZ6bGxzcndnaGlqbGNpb3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTg2ODEsImV4cCI6MjA2NjUzNDY4MX0.pcQlAVWTZPMhAhf-4vS-DBu4bZIe7C2g0nt8CVK230I',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch (error) {}
        },
      },
    }
  );
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error: error ? error.message : null };
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<{ data: Order | null, error: string | null }> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    'https://sctvzllsrwghijlcioxz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHZ6bGxzcndnaGlqbGNpb3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTg2ODEsImV4cCI6MjA2NjUzNDY4MX0.pcQlAVWTZPMhAhf-4vS-DBu4bZIe7C2g0nt8CVK230I',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch (error) {}
        },
      },
    }
  );
  const { data, error } = await supabase
    .from('orders')
    .update({ status: status })
    .eq('id', id)
    .select()
    .single();

  return { data, error: error ? error.message : null };
}

export async function getOrdersByUserId(userId: string): Promise<{ data: Order[] | null, error: string | null }> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    'https://sctvzllsrwghijlcioxz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHZ6bGxzcndnaGlqbGNpb3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTg2ODEsImV4cCI6MjA2NjUzNDY4MX0.pcQlAVWTZPMhAhf-4vS-DBu4bZIe7C2g0nt8CVK230I',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch (error) {}
        },
      },
    }
  );
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error: error ? error.message : null };
}
