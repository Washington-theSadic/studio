
'use server';

import { headers } from 'next/headers';
import Stripe from 'stripe';
import type { CartItem } from '@/context/cart-context';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createCheckoutSession(cartItems: CartItem[]) {
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

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/cart?canceled=true`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['BR'],
      },
    });

    if (session.url) {
      return { url: session.url };
    } else {
      throw new Error('Failed to create Stripe Checkout session.');
    }
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    // In a real app, you would want to return a more user-friendly error
    throw new Error('Could not create checkout session.');
  }
}
