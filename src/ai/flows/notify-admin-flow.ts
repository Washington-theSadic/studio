'use server';
/**
 * @fileOverview A flow to notify administrators about new orders.
 *
 * - notifyAdminOfNewOrder - A function that handles the new order notification process.
 * - NewOrderNotificationInput - The input type for the notifyAdminOfNewOrder function.
 */

import { ai } from '@/ai/genkit';
import { sendAdminNotification } from '@/lib/notifications';
import { z } from 'genkit';

// Defining the structure for individual cart items
const CartItemSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  quantity: z.number().describe('The quantity of the product ordered.'),
  price: z.number().describe('The price of a single unit of the product.'),
});

// Defining the input schema for the notification flow
export const NewOrderNotificationInputSchema = z.object({
  customerName: z.string().describe('The name of the customer who placed the order.'),
  totalPrice: z.number().describe('The total price of the order.'),
  items: z.array(CartItemSchema).describe('The list of items in the order.'),
});
export type NewOrderNotificationInput = z.infer<typeof NewOrderNotificationInputSchema>;


/**
 * The main flow function that gets triggered to notify an admin.
 * It takes the order details, generates a notification message, and sends it.
 */
const notifyAdminFlow = ai.defineFlow(
  {
    name: 'notifyAdminFlow',
    inputSchema: NewOrderNotificationInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    // Generate a formatted list of items for the notification body
    const itemsList = input.items.map(item => 
      `- ${item.quantity}x ${item.productName} @ ${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    ).join('\n');

    const subject = `🎉 Novo Pedido Recebido de ${input.customerName}!`;
    const body = `
Um novo pedido foi realizado na loja.

Detalhes do Pedido:
-------------------
Cliente: ${input.customerName}
Valor Total: ${input.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}

Itens:
${itemsList}

Por favor, acesse o painel de administração para processar o pedido.
    `;

    // Use the notification service to send the actual notification
    await sendAdminNotification(subject, body);
  }
);


/**
 * Wrapper function to be called from the application frontend.
 * @param input The order data.
 */
export async function notifyAdminOfNewOrder(input: NewOrderNotificationInput): Promise<void> {
  await notifyAdminFlow(input);
}
