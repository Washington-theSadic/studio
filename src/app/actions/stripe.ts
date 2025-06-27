
'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import type { CartItem } from '@/context/cart-context';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(cartItems: CartItem[], customerEmail: string): Promise<void> {
  const line_items = cartItems.map(item => {
    return {
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.product.name,
          images: item.product.images,
          description: item.product.description,
        },
        unit_amount: Math.round((item.product.sale_price ?? item.product.price) * 100), // Stripe expects amount in cents
      },
      quantity: item.quantity,
    };
  });

  const origin = headers().get('origin') || 'http://localhost:9002';

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto', 'pix'],
      line_items,
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/cart?canceled=true`,
      phone_number_collection: {
        enabled: true,
      },
    });
  } catch (error: any) {
    console.error('Error creating Stripe session:', error);
    // Propagate the actual error message for better debugging.
    throw new Error(error.message || 'Could not create checkout session.');
  }
  
  if (session.url) {
    redirect(session.url);
  } else {
    throw new Error('Failed to create Stripe Checkout session.');
  }
}
