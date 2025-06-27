
'use server';

import type { Order, OrderItem } from '@/lib/orders';
import { notifyAdminOfNewOrder } from '@/ai/flows/notify-admin-flow';
import type { NewOrderNotificationInput } from '@/ai/flows/notify-admin-flow';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export type CreateOrderInput = {
  totalPrice: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
};

export async function createOrder(input: CreateOrderInput): Promise<{ data: Order | null; error: string | null }> {
  console.log('--- [createOrder] Action Started ---');
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  console.log('[createOrder] All cookie names:', allCookies.map(c => c.name));

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

  console.log('[createOrder] Attempting to get user from session...');
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('[createOrder] Error getting user:', userError.message);
    return { data: null, error: `Auth error: ${userError.message}` };
  }

  if (!user || !user.email) {
    console.error('[createOrder] User not authenticated. User object is null or has no email.');
    return { data: null, error: 'Usuário não autenticado. Por favor, faça login novamente.' };
  }
  
  console.log(`[createOrder] User authenticated: ${user.email} (${user.id})`);

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

  console.log('[createOrder] Inserting order payload into database...');
  const { data, error } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select()
    .single();

  if (error || !data) {
    console.error('[createOrder] Error creating order in DB:', error);
    return { data: null, error: error?.message || 'Could not create order.' };
  }
  
  console.log(`[createOrder] Order ${data.id} created successfully.`);

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
  console.log('[createOrder] Admin notification sent.');
  console.log('--- [createOrder] Action Finished Successfully ---');

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
  console.log('[getOrders] Fetching all orders for admin dashboard...');
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) console.error('[getOrders] Error:', error.message);
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
  console.log(`[getOrderById] Fetching order ${id}...`);
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) console.error(`[getOrderById] Error fetching order ${id}:`, error.message);
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
  console.log(`[updateOrderStatus] Updating order ${id} to status ${status}...`);
  const { data, error } = await supabase
    .from('orders')
    .update({ status: status })
    .eq('id', id)
    .select()
    .single();

  if (error) console.error(`[updateOrderStatus] Error updating order ${id}:`, error.message);
  return { data, error: error ? error.message : null };
}

export async function getOrdersByUserId(): Promise<{ data: Order[] | null, error: string | null }> {
  console.log(`--- [getOrdersByUserId] Action Started ---`);
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

  console.log('[getOrdersByUserId] Verifying authenticated user...');
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('[getOrdersByUserId] Error getting user:', userError.message);
    return { data: null, error: `Auth error: ${userError.message}` };
  }
  
  if (!user) {
    console.error('[getOrdersByUserId] User not authenticated.');
    return { data: null, error: 'User not authenticated. Please log in again.' };
  }

  console.log(`[getOrdersByUserId] Fetching orders for authenticated user ${user.id}...`);
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(`[getOrdersByUserId] DB error fetching orders for user ${user.id}:`, error.message);
  } else {
    console.log(`[getOrdersByUserId] Found ${data?.length || 0} orders for user ${user.id}.`);
  }

  console.log(`--- [getOrdersByUserId] Action Finished ---`);
  return { data, error: error ? error.message : null };
}
